import { compare } from 'bcrypt';
import RedisStore from 'connect-redis';
import session from 'express-session';
import moment from 'moment-timezone';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth2';
import { Strategy as LocalStrategy } from 'passport-local';
import { URL } from 'url';

import {
  ENVNAME,
  GOGGLE_CLIENT_ID,
  GOGGLE_CLIENT_SECRET,
  GOGGLE_REDIRECT_URI,
  SECRET,
} from './env.constant.js';
import { sendTemplateMail } from './mail.config.js'; // Path to mail.config.js
import { LOGGER } from './winston-logger.config.js';
import { mongodb } from '../repository/baseMongoDbRepository.js';
import { redisClient as redisClient } from '../repository/baseRedisRepository.js';

function config(app) {
  // Passport initialization

  // (redisClientInstance).catch(console.error);
  LOGGER.debug(`ENVIRONMENT : ${ENVNAME}`);
  app.use(
    session({
      store:
        ENVNAME !== 'dev'
          ? new RedisStore({
              client: redisClient,
              prefix: `${ENVNAME}:`, // Unique prefix for each app
            })
          : undefined, // Unique prefix for each app
      secret: SECRET,
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: false, // Set to true if using HTTPS
        maxAge: 30 * 60 * 1000, // 30 min (session expiration time)
      },
    })
  );
  app.use(passport.initialize());
  app.use(passport.session());

  // Passport local strategy for username/password login
  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const _db = await mongodb;
        const existingUser = await _db
          .collection('users')
          .findOne({ email: username });

        if (!existingUser) {
          return done(null, false, { message: 'Incorrect email or password' });
        } else {
          if (moment(existingUser.lockUntil).toDate() > moment.utc().toDate()) {
            const remainingTime = Math.ceil(
              (moment(existingUser.lockUntil) - moment.utc().toDate()) /
                (1000 * 60)
            );
            return done(null, false, {
              message: `Account is locked. Please try again in ${remainingTime} minutes.`,
            });
          }
          if (!existingUser.email_verified) {
            // Incorrect password
            return done(null, false, {
              message: `<p class='mb-3'><strong>Please verify your email.</strong></p> To resend verification link <a href="/auth/send-verify-link/${username}">click here</a>`,
            });
          }
          if (existingUser.password) {
            const isPasswordValid = await compare(
              password,
              existingUser.password
            );

            if (!isPasswordValid) {
              // Incorrect password
              await _db.collection('users').updateOne(
                { email: username },
                {
                  $inc: { loginAttempts: 1 },
                  $set: {
                    lockUntil:
                      existingUser.loginAttempts + 1 >= 3
                        ? moment().add(1, 'hour').utc()
                        : 0,
                  },
                }
              );
              return done(null, false, {
                message: 'Incorrect email or password',
              });
            }
          } else {
            return done(null, false, {
              message: `Oops! It looks like you originally signed up with Google/Facebook. Please use the same method to log in, or use forgot password to reset password`,
            });
          }
          await _db.collection('users').updateOne(
            { email: username },
            {
              $set: {
                last_loggedin: moment.utc().toDate(),
                loginAttempts: 0,
                lockUntil: 0,
              },
            }
          );
          return done(null, existingUser);
        }
      } catch (error) {
        return done(error);
      }
    })
  );

  passport.use(
    new GoogleStrategy(
      {
        clientID: GOGGLE_CLIENT_ID,
        clientSecret: GOGGLE_CLIENT_SECRET,
        callbackURL: GOGGLE_REDIRECT_URI,
        passReqToCallback: true,
      },
      async (request, accessToken, refreshToken, profile, done) => {
        try {
          const userInfo = await findOrCreateUser(profile);
          return done(null, userInfo);
        } catch (error) {
          return done(error);
        }
      }
    )
  );

  passport.serializeUser((user, done) => {
    const { _id, name, email, image, userType, adFreeUntil } = user;
    const image1 = image || '../assets/img/team/avatar-rounded.webp';
    const isAdmin = userType === 'admin';
    let isAdsfree = false;
    if (adFreeUntil) {
      const now = moment().tz('Asia/Kolkata').toDate();
      const adFreeDate = moment(adFreeUntil).tz('Asia/Kolkata').toDate();
      isAdsfree = adFreeDate > now;
    }
    const isAdDisabled = isAdmin || isAdsfree;
    // eslint-disable-next-line no-undef, no-console
    console.log('New Login  \n' + JSON.stringify({ name, email, image1 }));
    done(null, { _id, name, email, image, isAdmin, isAdDisabled });
  });

  passport.deserializeUser((user, done) => {
    done(null, user);
  });

  app.use((req, res, next) => {
    res.locals.isAuthenticated = req.isAuthenticated();
    res.locals.CANONICAL_URL = `https://niftyinvest.com${req.originalUrl}`;
    if (!req.originalUrl.includes('auth/login')) {
      delete req.session.returnTo;
      res.locals.originalUrl = req.originalUrl;
    } else {
      res.locals.originalUrl = '/';
    }
    if (res.locals.isAuthenticated) {
      req.session.cookie.maxAge = 7 * 24 * 60 * 60 * 1000; // 7 Day (session expiration time)
      res.locals.user = req.user;
    }
    // trackPageViews(req, res);
    next();
  });

  // eslint-disable-next-line no-unused-vars
  function trackPageViews(req, res) {
    const now = moment().tz('Asia/Kolkata');
    const today = now.format('YYYYMMDD');
    // const today = '20240823';
    const currentHour = now.format('HH');
    const pathname = new URL(res.locals.CANONICAL_URL).pathname.toLowerCase();
    const parentPage = pathname.split('/').filter(Boolean)[0] || 'root';

    const viewData = req.session.viewData ?? {};

    // Delete data for the previous day if the day has changed
    if (Object.keys(viewData)[0] !== today) {
      req.session.viewData = {};
    }

    const todayData = (req.session.viewData[today] ??= {});

    // Initialize or update hourly and daily views
    const pageData = (todayData[parentPage] ??= { daily: 0, hourly: 0 });

    if (todayData.lastHour !== currentHour) {
      Object.keys(todayData).forEach((page) => (todayData[page].hourly = 0));
      todayData.lastHour = currentHour;
      todayData.totalHourly = 1;
      pageData.hourly = 1;
    } else {
      todayData.totalHourly = (todayData.totalHourly ?? 0) + 1;
      pageData.hourly += 1;
    }

    pageData.daily += 1;
    todayData.totalDaily = (todayData.totalDaily ?? 0) + 1;

    res.locals.viewData = todayData;
    res.locals.viewDataCurrent = pageData;
  }

  async function findOrCreateUser(profile) {
    const _db = await mongodb;
    const {
      displayName: name,
      email,
      picture: image,
      id: google_oauth_client_id,
    } = profile;
    const user = { name, email, image };

    const existingUser = await _db
      .collection('users')
      .findOne({ email: user.email });

    if (existingUser) {
      return await _db.collection('users').findOneAndUpdate(
        { email: user.email },
        {
          $set: {
            google_oauth_client_id: google_oauth_client_id,
            image: user.image,
            last_loggedin: moment.utc().toDate(),
          },
        },
        { returnDocument: 'after' }
      );
    } else {
      await _db.collection('users').insertOne({
        status: 'ACTIVE',
        last_loggedin: moment.utc().toDate(),
        registration_date: moment.utc().toDate(),
        google_oauth_client_id: google_oauth_client_id,
        email_verified: true,
        ...user,
      });
      try {
        sendTemplateMail('WELCOME_EMAIL', user.email, {
          username: user.name,
        });
      } catch (error) {
        LOGGER.debug('Error sending email:', error);
      }

      const filter = { email: profile.email };
      const update = { $set: profile };
      const options = { upsert: true };
      await _db.collection('users_google').updateOne(filter, update, options);
      return user;
    }
  }
}
export { config as PassportConfigHandler };
