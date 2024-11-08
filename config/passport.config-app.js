const passport = require('passport');
const session = require('express-session');
const LocalStrategy = require('passport-local').Strategy;
var GoogleStrategy = require('passport-google-oauth2').Strategy;
const { mongodb } = require('../repository/baseMongoDbRepository');
const bcrypt = require('bcrypt');
const transporter = require('./mail.config'); // Path to mail.config.js
const moment = require('moment-timezone');
const url = require('url');
const path = require('path');
const RedisStore = require("connect-redis").default;
const redisClient = require('../repository/baseRedisRepository');

module.exports = function (app) {
    // Passport initialization
    redisClient.connect().catch(console.error);
    console.log("ENVIRONMENT :", `${process.env.ENVNAME}`);
    app.use(session({
        store: new RedisStore({ client: redisClient, prefix: `${process.env.ENVNAME}:` }), // Unique prefix for each app
        secret: process.env.SECRET,
        resave: false,
        saveUninitialized: false,
        cookie: {
            secure: false, // Set to true if using HTTPS
            maxAge: 30 * 60 * 1000, // 30 min (session expiration time)
        }
    }));
    app.use(passport.initialize());
    app.use(passport.session());

    // Passport local strategy for username/password login
    passport.use(new LocalStrategy(async (username, password, done) => {
        try {
            const _db = await mongodb;
            const existingUser = await _db.collection('users').findOne({ email: username });

            if (!existingUser) {
                return done(null, false, { message: 'Incorrect email or password' });
            } else {
                if (moment(existingUser.lockUntil).toDate() > moment.utc().toDate()) {
                    const remainingTime = Math.ceil((moment(existingUser.lockUntil) - moment.utc().toDate()) / (1000 * 60));
                    return done(null, false, { message: `Account is locked. Please try again in ${remainingTime} minutes.` });
                }
                if (!existingUser.email_verified) {
                    // Incorrect password
                    return done(null, false, { message: `<p class='mb-3'><strong>Please verify your email.</strong></p> To resend verification link <a href="/auth/send-verify-link/${username}">click here</a>` });
                }
                if (existingUser.password) {

                    const isPasswordValid = await bcrypt.compare(password, existingUser.password);

                    if (!isPasswordValid) {
                        // Incorrect password
                        await _db.collection('users').updateOne({ email: username }, { $inc: { loginAttempts: 1 }, $set: { lockUntil: (existingUser.loginAttempts + 1 >= 3) ? moment().add(1, 'hour').utc() : 0 } });
                        return done(null, false, { message: 'Incorrect email or password' });

                    }
                } else {
                    return done(null, false, { message: `Oops! It looks like you originally signed up with Google/Facebook. Please use the same method to log in, or use forgot password to reset password` });
                }
                await _db.collection('users').updateOne(
                    { email: username },
                    { $set: { last_loggedin: moment.utc().toDate(), loginAttempts: 0, lockUntil: 0 } }
                );
                return done(null, existingUser);
            }
        } catch (error) {
            return done(error);
        }
    }));

    passport.use(new GoogleStrategy({
        clientID: process.env.GOGGLE_CLIENT_ID,
        clientSecret: process.env.GOGGLE_CLIENT_SECRET,
        callbackURL: process.env.GOGGLE_REDIRECT_URI,
        passReqToCallback: true
    }, async (request, accessToken, refreshToken, profile, done) => {
        try {
            const userInfo = await findOrCreateUser(profile);
            return done(null, userInfo);
        } catch (error) {
            return done(error);
        }
    }));

    passport.serializeUser((user, done) => {
        let { _id, name, email, image, userType, adFreeUntil } = user;
        image = image || '../assets/img/team/avatar-rounded.webp';
        isAdmin = userType == "admin";
        isAdsfree = false;
        if (adFreeUntil) {
            const now = moment().tz('Asia/Kolkata').toDate();
            const adFreeDate = moment(adFreeUntil).tz('Asia/Kolkata').toDate();
            isAdsfree = adFreeDate > now;
        }
        isAdDisabled = isAdmin || isAdsfree;
        console.log("New Login  \n" + JSON.stringify({ name, email, image }));
        done(null, { _id, name, email, image, isAdmin, isAdDisabled });
    });

    passport.deserializeUser((user, done) => {
        done(null, user);
    });

    app.use((req, res, next) => {
        res.locals.isAuthenticated = req.isAuthenticated();
        res.locals.CANONICAL_URL = `https://niftyinvest.com${req.originalUrl}`
        if (!req.originalUrl.includes("auth/login")) {
            delete req.session.returnTo;
            res.locals.originalUrl = req.originalUrl;
        } else {
            res.locals.originalUrl = "/";
        }
        if (res.locals.isAuthenticated) {
            req.session.cookie.maxAge = 7 * 24 * 60 * 60 * 1000; // 7 Day (session expiration time)
            res.locals.user = req.user;
        }
        // trackPageViews(req, res);
        next();
    });

    function trackPageViews(req, res) {
        const now = moment().tz('Asia/Kolkata');
        const today = now.format('YYYYMMDD');
        // const today = '20240823';
        const currentHour = now.format('HH');
        const pathname = new url.URL(res.locals.CANONICAL_URL).pathname.toLowerCase();
        const parentPage = pathname.split('/').filter(Boolean)[0] || 'root';

        const viewData = req.session.viewData ?? {};

        // Delete data for the previous day if the day has changed
        if (Object.keys(viewData)[0] !== today) {
            req.session.viewData = {};
        }

        const todayData = req.session.viewData[today] ??= {};

        // Initialize or update hourly and daily views
        const pageData = todayData[parentPage] ??= { daily: 0, hourly: 0 };

        if (todayData.lastHour !== currentHour) {
            Object.keys(todayData).forEach(page => todayData[page].hourly = 0);
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
        let { displayName: name, email, picture: image, id: google_oauth_client_id } = profile;
        const user = { name, email, image };

        const existingUser = await _db.collection('users').findOne({ email: user.email });

        if (existingUser) {
            return await _db.collection('users').findOneAndUpdate(
                { email: user.email },
                { $set: { google_oauth_client_id: google_oauth_client_id, image: user.image, last_loggedin: moment.utc().toDate() } },
                { returnDocument: 'after' }
            );
        } else {
            await _db.collection('users').insertOne({ status: 'ACTIVE', last_loggedin: moment.utc().toDate(), registration_date: moment.utc().toDate(), google_oauth_client_id: google_oauth_client_id, email_verified: true, ...user });
            try {
                transporter.sendTemplateMail('WELCOME_EMAIL',
                    user.email,
                    { username: user.name });
            } catch (error) { console.error('Error sending email:', error); }

            const filter = { email: profile.email };
            const update = { $set: profile };
            const options = { upsert: true };
            await _db.collection('users_google').updateOne(filter, update, options);
            return user;
        }
    }


};
