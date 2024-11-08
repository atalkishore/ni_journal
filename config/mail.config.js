const nodemailer = require('nodemailer');
const fs = require('fs/promises');
const path = require('path');
const { mongodb } = require('../repository/baseMongoDbRepository');
const moment = require('moment-timezone');
const retry = require('retry');
const rp = require('request-promise');
const environment = require('../config/env.constant');

const MAIL_TEMPLATES = {
    "PASSWORD_RESET": {
        "file": "reset-password.html",
        "subject": "Password Reset Request"
    },
    "VERIFY_EMAIL": {
        "file": "verify_email.html",
        "subject": "Verify your email"
    },
    "WELCOME_EMAIL": {
        "file": "welcome_email.html",
        "subject": "Welcome to Our Platform"
    }
    // Add more templates as needed...
};


const transporterOptions = {
    host: environment.ZOHO_HOST,
    port: environment.ZOHO_PORT,
    secure: environment.ZOHO_SSL == 'true',
    auth: {
        user: environment.ZOHO_USER_ID,
        pass: environment.ZOHO_USER_PASSWORD
    },
    debug: true,
};
if (environment.ZOHO_SSL !== 'true') {
    transporterOptions.tls = {
        ciphers: 'TLSv1.2',
        rejectUnauthorized: false // Set to true if you trust the certificate
    };
}
const transporter = nodemailer.createTransport(transporterOptions);


const MAX_RETRIES = 1;
const RETRY_DELAY_MS = 100;

async function sendTemplateMail(templateName, to, data) {
    const templateConfig = MAIL_TEMPLATES[templateName];
    if (!templateConfig) throw new Error(`Template '${templateName}' not found in MAIL_TEMPLATES`);

    const templatePath = path.join(__dirname, 'email_templates', `${templateConfig.file}`);

    try {
        const html = await fs.readFile(templatePath, 'utf-8');
        let processedHtml = html;
        for (const [key, value] of Object.entries(data)) {
            processedHtml = processedHtml.replaceAll(new RegExp(`{{\\s*${key}\\s*}}`, 'g'), value);
        }
        processedHtml = processedHtml.replaceAll(new RegExp(`{{\\s*STATIC_HOST\\s*}}`, 'g'), process.env.STATIC_FILES_ALT);

        const mailOptions = {
            from: environment.ZOHO_FROM,
            to: to,
            subject: templateConfig.subject,
            html: processedHtml
        };

        const result = await sendMailWithRetry(mailOptions, templateName, to);
        console.log('Email sent successfully:', result?.response);
    } catch (error) {
        console.log('Error sending email:', error);
        // await saveEmailSentStatus(templateName, to, error, 'FAIL');
    }
}

async function sendMailWithRetry(mailOptions, templateName, to) {
    return new Promise((resolve, reject) => {
        const operation = retry.operation({
            retries: MAX_RETRIES,
            factor: 2,
            minTimeout: RETRY_DELAY_MS,
            maxTimeout: 10000,
            randomize: true
        });

        operation.attempt(async (currentAttempt) => {
            try {
                const info = await transporter.sendMail(mailOptions);
                // const info = await sendWarningMailifZohoMailFails(mailOptions);
                console.log(`Mail sent to email ` + to)
                await saveEmailSentStatus(templateName, to, info, "SUCCESS");
                resolve(info);
            } catch (error) {
                if (operation.retry(error)) {
                    await saveEmailSentStatus(templateName, to, error, "RETRY");
                    console.log(`Error sending email. Retrying... (Attempt ${currentAttempt}/${MAX_RETRIES})`);
                } else {

                    let info = await sendWarningMailifZohoMailFails(mailOptions)
                    if (info?.response) {
                        await saveEmailSentStatus(templateName, to, info, "SUCCESS_API");
                        resolve(info);
                    } else {
                        await saveEmailSentStatus(templateName, to, error, "FAIL");
                        reject(operation.mainError());
                    }

                }
            }
        });
    });
}

async function saveEmailSentStatus(templateName, to, infoOrError, status = 'SUCCESS') {
    const _db = await mongodb;
    await _db.collection('email_sent').insertOne({
        status: status,
        email_id: to,
        template: templateName,
        sent_at: moment.utc().toDate(),
        response: infoOrError,
        expires_at: moment.utc().add(30, 'days').toDate()
    });
}


async function sendWarningMailifZohoMailFails(mailOptions) {
    let to = mailOptions.to;
    const auth = { user: 'api', pass: process.env.MAILGUN_SECRET };
    const formData = { from: 'NiftyInvest <noreply@niftyinvest.com>', to, subject: mailOptions.subject, html: mailOptions.html };
    const options = { url: 'https://api.mailgun.net/v3/sandboxcb27351a3eca40fa8a186599491fb125.mailgun.org/messages', auth, formData, method: 'POST' };

    try {
        const response = await rp(options);
        console.log(`Mail sent to ${to} with subject: ${mailOptions.subject}`, 'Response:', response);
        return { response: true };
    } catch (error) {
        console.error('ERROR Send Warning mail:', error);
        return { response: false };
    }
}


module.exports.sendTemplateMail = sendTemplateMail;
module.exports.sendMail = sendMailWithRetry;
