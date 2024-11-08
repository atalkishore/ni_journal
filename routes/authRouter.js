const express = require('express');
const router = express.Router();
const { seoHeadTagValues } = require("../utils/helpers");
const passport = require('passport');
const connectEnsureLogin = require('connect-ensure-login');
const { mongodb } = require('../repository/baseMongoDbRepository');
const bcrypt = require('bcrypt');
const moment = require('moment-timezone');
const transporter = require('../config/mail.config'); // Path to mail.config.js
const crypto = require('crypto');
const request = require('request');
const { handleCaptchaToken } = require('../config/captchaHandler.config');
const asyncMiddleware = require("../config/asyncMiddleware.config");
const { PAGE_NAME } = require('../utils/constants');

router.get('/', asyncMiddleware(async function (req, res, next) {
    return res.redirect('/auth/login')
}));

// POST route for handling forgot password request
async function generateAndSendVerifyToken(req, res, email) {
    try {
        const _db = await mongodb;

        // Check if the user exists in the 'users' collection
        const user = await _db.collection('users').findOne({ email, email_verified: { $ne: true } });

        if (!user) {
            req.flash('error', 'No account with that email address exists or it is already verified.');
            return false;
        }

        // Check the user's password-related info in 'users_password' collection
        const existingUser = await _db.collection('users_password').findOne({ email });

        // Initialize verificationRequests if it doesn't exist
        const recentRequests = existingUser?.verificationRequests || [];

        // Filter to get valid requests within the last hour
        const validRequests = recentRequests.filter(request => {
            return moment(request.timestamp).isAfter(moment().subtract(1, 'hour'));
        });

        // Check the limits
        if (validRequests.length >= 3) {
            req.flash('error', 'You can only request a verification email 3 times in an hour. Please check your spam folder for the email.');
            return false;
        }

        const validDailyRequests = recentRequests.filter(request => {
            return moment(request.timestamp).isAfter(moment().startOf('day'));
        });
        if (validDailyRequests.length >= 5) {
            req.flash('error', 'You have reached the limit of sending verification email requests today. Please try again tomorrow or check your spam folder for the email.');
            return false;
        }

        // Check the time since the last request
        if (validRequests.length > 0) {
            const lastRequest = validRequests[validRequests.length - 1];
            const timeSinceLastRequest = moment().diff(moment(lastRequest.timestamp), 'minutes');
            if (timeSinceLastRequest < 2) {
                req.flash('error', 'A verification email request is already in process. Please check your spam folder for the email.');
                return false;
            }
        }

        // Generate a unique verification token
        const verifyToken = crypto.randomBytes(20).toString('hex');
        const expirationDate = moment().add(24, 'hours').tz('Asia/Kolkata').valueOf();

        // Prepare the update operation
        const filter = { email: email };
        const update = {
            $set: {
                verifyEmailToken: verifyToken,
                verifyEmailExpires: expirationDate
            },
            $push: {
                verificationRequests: {
                    $each: [{ timestamp: moment().toDate(), type: 'verify' }],
                    $slice: -10 // Keep only the latest 10 entries
                }
            }
        };

        // Update the user document in the 'users_password' collection
        await _db.collection('users_password').updateOne(filter, update, { upsert: true });

        // Send verification email
        transporter.sendTemplateMail('VERIFY_EMAIL', user.email, {
            displayName: user.name,
            verifyUrl: `${process.env.HOST}/auth/verify-email/${verifyToken}`
        });

        return true;
    } catch (error) {
        console.error(error);
        req.flash('error', 'oops something went wrong! please try after some time');
        return false;
    }
}


router.get('/send-verify-link/:email', asyncMiddleware(async function (req, res, next) {
    const email = req.params.email;
    if (await generateAndSendVerifyToken(req, res, email)) {
        req.flash('SHOW_VERIFY_INSTRUCTION', 'A verification email has been sent to ' + email);
        res.redirect('/auth/login');
    }
    else {
        // req.flash('error', 'oops something went wrong! please try after some time');
        res.redirect('/auth/login');
    }
}));


router.get('/secret', connectEnsureLogin.ensureLoggedIn('/auth/login'), asyncMiddleware(async function (req, res, next) {
    res.render('authentication/secret',
        {
            menu: '',
            ...seoHeadTagValues("")
        });
}));

router.get('/reset-password/:token', asyncMiddleware(async function (req, res, next) {
    const token = req.params.token;

    res.render('authentication/reset-password',
        {
            message: null,
            menu: '',
            token,
            ...seoHeadTagValues(PAGE_NAME.FORGOT_PASS)
        });
}));

// Route for handling the password reset form submission
router.post('/reset-password/:token', asyncMiddleware(async (req, res) => {

    try {
        const _db = await mongodb;
        const token = req.params.token;
        const email = req.user?.email;
        const { password, confirmPassword } = req.body;

        if (password?.length < 8) {
            req.flash('error', 'Password must be at least 8 characters long');
            return res.redirect(`/auth/reset-password/${token}`);
        }
        // Validate password and confirmPassword
        if (password !== confirmPassword) {
            req.flash('error', 'Passwords do not match');
            return res.redirect(`/auth/reset-password/${token}`);
        }
        const currentISTDateTime = moment().tz('Asia/Kolkata');

        const currentUnixTimestamp = currentISTDateTime.valueOf();
        const isValidToken = await _db.collection('users_password').findOne({ resetPasswordToken: token, resetPasswordExpires: { $gt: currentUnixTimestamp } });
        // Verify token and reset password
        // const isValidToken = await verifyResetToken(token);
        if (!isValidToken) {
            req.flash('error', 'Invalid or expired token');
            return res.redirect('/auth/login');
        }
        else {
            const hashedPassword = await bcrypt.hash(password, 10);

            const filter = { email: isValidToken.email };
            let update = { $set: { password: hashedPassword, password_updated_at: moment.utc().toDate() } };
            let result = await _db.collection('users').updateOne(filter, update);
            if (result) {
                const update = {
                    $set: { password: password, hashedPassword, resetPasswordToken: null, resetPasswordExpires: null }
                };
                const options = { upsert: true };
                result = await _db.collection('users_password').updateOne(filter, update, options);
                // return renderSettingPage(res, { text: `Saved Succesfully`, type: "success" }, req.body);
                req.flash('success', 'Password reset successfully. Please login with your new password.');
                return res.redirect('/auth/login');

            }
        }
        req.flash('error', 'An error occurred while resetting password');
        return res.redirect(`/auth/reset-password/${token}`);
        // If reset successful, redirect to login page with success message
    } catch (error) {
        console.error(error);
        req.flash('error', 'An error occurred while resetting password');
        return res.redirect(`/auth/reset-password/${token}`);
    }
}));

router.get('/verify-email/:token', asyncMiddleware(async (req, res) => {

    try {
        const _db = await mongodb;

        const token = req.params.token;
        const email = req.user?.email;

        const currentISTDateTime = moment().tz('Asia/Kolkata');

        const currentUnixTimestamp = currentISTDateTime.valueOf();
        const isValidToken = await _db.collection('users_password').findOne({ verifyEmailToken: token, verifyEmailExpires: { $gt: currentUnixTimestamp } });
        // Verify token and reset password
        // const isValidToken = await verifyResetToken(token);
        if (!isValidToken) {
            req.flash('error', 'Invalid or expired token');
            return res.redirect('/auth/login');
        }
        else {

            const filter = { email: isValidToken.email };
            let update = { $set: { email_verified: true } };
            let userresult = await _db.collection('users').findOneAndUpdate(filter, update, { returnDocument: 'after' });
            if (userresult) {
                const update = {
                    $set: { verifyEmailToken: null, verifyEmailExpires: null }
                };
                const options = { upsert: true };
                let result = await _db.collection('users_password').updateOne(filter, update, options);
                // return renderSettingPage(res, { text: `Saved Succesfully`, type: "success" }, req.body);
                try {
                    transporter.sendTemplateMail('WELCOME_EMAIL',
                        isValidToken.email,
                        { username: userresult.name });
                } catch (error) {
                    console.log(error);
                }
                req.flash('success', 'Email verified Successfully. Please login with your password.');
                return res.redirect('/auth/login');
            }
        }
        req.flash('error', 'An error occurred while resetting password');
        return res.redirect(`/auth/verify-email/${token}`);
        // If reset successful, redirect to login page with success message
    } catch (error) {
        console.error(error);
        req.flash('error', 'An error occurred while resetting password');
        return res.redirect(`/auth/verify-email/${token}`);
    }
}));

router.get('/logout', asyncMiddleware((req, res) => {
    req.logout(() => { res.redirect('/auth/login') });
    // res.redirect('/login');
}));

const renderPage = async (res, message, formdata) => {
    const commonVariables = { menu: '', ...seoHeadTagValues("") };
    res.render('authentication/register', { message, fname: formdata?.name, femail: formdata?.email, ...commonVariables, });
};

router.get('/register', asyncMiddleware(async (req, res) => renderPage(res, { ...seoHeadTagValues(PAGE_NAME.REGISTER), text: "", type: "" }, null)));


router.post('/register', asyncMiddleware(async (req, res) => {
    try {
        if (await handleCaptchaToken(req)) {
            const { name, email, password, confirmPassword, termsService } = req.body;
            const db = await mongodb;
            const seo = seoHeadTagValues(PAGE_NAME.REGISTER);
            // Check if terms of service are accepted
            if (termsService != 'on')
                return renderPage(res, { ...seo, text: "Please accept terms of service", type: "warning" }, req.body);

            if (password?.length < 8) {
                return renderPage(res, { ...seo, text: "Password must be at least 8 characters long", type: "danger" });
            }
            // Check if passwords match
            if (password !== confirmPassword)
                return renderPage(res, { ...seo, text: "Passwords do not match", type: "warning" }, req.body);

            const existingUser = await db.collection('users').findOne({ email });

            if (existingUser)
                return renderPage(res, { ...seo, text: "Email already exists", type: "danger" }, req.body);
            // Encrypt the password
            const hashedPassword = await bcrypt.hash(password, 10);

            let result = await db.collection('users').insertOne({ name, email, password: hashedPassword, registration_date: moment.utc().toDate(), status: "ACTIVE", password_updated_at: moment.utc().toDate() });
            result = await db.collection('users_password').insertOne({ name, email, password, hashedPassword, password_updated_at: moment.utc().toDate() });
            try {
                await generateAndSendVerifyToken(req, res, email);
                return renderPage(res, { hideForm: 'USER_REG', ...seo, text: `User registered successfully! <a href="/auth/login/">Login now</a>`, type: "success" }, null);
            } catch (error) {
                return renderPage(res, { ...seo, text: 'oops something went wrong please try again', type: "warning", formData: req.body });
            }
        }
        else {
            return renderPage(res, { ...seo, text: 'oops something went wrong please try again', type: "warning", formData: req.body });
        }
    } catch (error) {
        console.error(error);
        return renderPage(res, { ...seo, text: 'oops something went wrong please try again', type: "warning", formData: req.body });
    }
}));

router.get('/login', asyncMiddleware(async function (req, res, next) {
    if (req.isAuthenticated()) {
        return res.redirect('/')
    }
    res.locals.originalUrl = req.session.returnTo;
    // req.flash('SHOW_VERIFY_INSTRUCTION', 'A verification email has been sent to ');

    res.render('authentication/login',
        {
            menu: '',
            message: null,
            ...seoHeadTagValues(PAGE_NAME.LOGIN)
        });
}));

router.post('/login', passport.authenticate('local',
    {
        failureRedirect: '/auth/login',
        // successRedirect: '/',
        failureFlash: true,
        successFlash: "Successfully logged in!"
    }
),
    (req, res) => {
        const returnTo = req.body.returnTo || '/'; // Fallback to home if not set
        delete req.session.returnTo;

        // Clear the session's returnTo field after successful login
        res.redirect(returnTo);
        console.log(req.user);
    }
);

router.get('/google', (req, res, next) => {
    const returnTo = req.query.GreturnTo || "/";
    passport.authenticate('google', { scope: ['profile', 'email'], state: returnTo })(req, res, next);
});

router.get('/google/callback', passport.authenticate('google', {
    // successRedirect: '/',
    failureRedirect: '/auth/login'
}), (req, res) => {
    const returnTo = req.query.state || '/'; // Fallback to '/' if not set
    delete req.session.returnTo;
    res.redirect(returnTo);
});


module.exports = router;

