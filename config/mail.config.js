import { readFile } from 'fs/promises';
import momentTimezone from 'moment-timezone';
import { createTransport } from 'nodemailer';
import path from 'path';
import rp from 'request-promise';
import { operation as _operation } from 'retry';

import { LOGGER } from './winston-logger.config.js';
import {
  ZOHO_HOST,
  ZOHO_PORT,
  ZOHO_SSL,
  ZOHO_USER_ID,
  ZOHO_USER_PASSWORD,
  ZOHO_FROM,
  MAILGUN_SECRET,
  STATIC_FILES_ALT,
  ROOT_DIR_BASE,
} from '../config/env.constant.js';
import { mongodb } from '../repository/baseMongoDbRepository.js';

const MAIL_TEMPLATES = {
  PASSWORD_RESET: {
    file: 'reset-password.html',
    subject: 'Password Reset Request',
  },
  VERIFY_EMAIL: {
    file: 'verify_email.html',
    subject: 'Verify your email',
  },
  WELCOME_EMAIL: {
    file: 'welcome_email.html',
    subject: 'Welcome to Our Platform',
  },
  // Add more templates as needed...
};

const transporterOptions = {
  host: ZOHO_HOST,
  port: ZOHO_PORT,
  secure: ZOHO_SSL === 'true',
  auth: {
    user: ZOHO_USER_ID,
    pass: ZOHO_USER_PASSWORD,
  },
  debug: true,
};
if (ZOHO_SSL !== 'true') {
  transporterOptions.tls = {
    ciphers: 'TLSv1.2',
    rejectUnauthorized: false, // Set to true if you trust the certificate
  };
}
const transporter = createTransport(transporterOptions);

const MAX_RETRIES = 1;
const RETRY_DELAY_MS = 100;

async function sendTemplateMail(templateName, to, data) {
  const templateConfig = MAIL_TEMPLATES[templateName];
  if (!templateConfig) {
    throw new Error(`Template '${templateName}' not found in MAIL_TEMPLATES`);
  }

  const templatePath = path.join(
    ROOT_DIR_BASE,
    'email_templates',
    `${templateConfig.file}`
  );

  try {
    const html = await readFile(templatePath, 'utf-8');
    let processedHtml = html;
    for (const [key, value] of Object.entries(data)) {
      processedHtml = processedHtml.replaceAll(
        new RegExp(`{{\\s*${key}\\s*}}`, 'g'),
        value
      );
    }
    processedHtml = processedHtml.replaceAll(
      new RegExp(`{{\\s*STATIC_HOST\\s*}}`, 'g'),
      STATIC_FILES_ALT
    );

    const mailOptions = {
      from: ZOHO_FROM,
      to: to,
      subject: templateConfig.subject,
      html: processedHtml,
    };

    const result = await sendMailWithRetry(mailOptions, templateName, to);
    LOGGER.debug('Email sent successfully:', result?.response);
  } catch (error) {
    LOGGER.debug('Error sending email:', error);
  }
}

async function sendMailWithRetry(mailOptions, templateName, to) {
  return new Promise((resolve, reject) => {
    const operation = _operation({
      retries: MAX_RETRIES,
      factor: 2,
      minTimeout: RETRY_DELAY_MS,
      maxTimeout: 10000,
      randomize: true,
    });

    operation.attempt(async (currentAttempt) => {
      try {
        const info = await transporter.sendMail(mailOptions);
        // const info = await sendWarningMailifZohoMailFails(mailOptions);
        LOGGER.debug(`Mail sent to email ` + to);
        await saveEmailSentStatus(templateName, to, info, 'SUCCESS');
        resolve(info);
      } catch (error) {
        if (operation.retry(error)) {
          await saveEmailSentStatus(templateName, to, error, 'RETRY');
          LOGGER.debug(
            `Error sending email. Retrying... (Attempt ${currentAttempt}/${MAX_RETRIES})`
          );
        } else {
          const info = await sendWarningMailifZohoMailFails(mailOptions);
          if (info?.response) {
            await saveEmailSentStatus(templateName, to, info, 'SUCCESS_API');
            resolve(info);
          } else {
            await saveEmailSentStatus(templateName, to, error, 'FAIL');
            reject(operation.mainError());
          }
        }
      }
    });
  });
}

async function saveEmailSentStatus(
  templateName,
  to,
  infoOrError,
  status = 'SUCCESS'
) {
  const _db = await mongodb;
  await _db.collection('email_sent').insertOne({
    status: status,
    email_id: to,
    template: templateName,
    sent_at: momentTimezone.utc().toDate(),
    response: infoOrError,
    expires_at: momentTimezone.utc().add(30, 'days').toDate(),
  });
}

async function sendWarningMailifZohoMailFails(mailOptions) {
  const to = mailOptions.to;
  const auth = { user: 'api', pass: MAILGUN_SECRET };
  const formData = {
    from: 'NiftyInvest <noreply@niftyinvest.com>',
    to,
    subject: mailOptions.subject,
    html: mailOptions.html,
  };
  const options = {
    url: 'https://api.mailgun.net/v3/sandboxcb27351a3eca40fa8a186599491fb125.mailgun.org/messages',
    auth,
    formData,
    method: 'POST',
  };

  try {
    const response = await rp(options);
    LOGGER.debug(
      `Mail sent to ${to} with subject: ${mailOptions.subject}`,
      'Response:',
      response
    );
    return { response: true };
  } catch (error) {
    // eslint-disable-next-line no-console, no-undef
    console.error('ERROR Send Warning mail:', error);
    return { response: false };
  }
}

export { sendTemplateMail as sendTemplateMail };
export const sendMail = sendMailWithRetry;
