import * as axios from 'axios';
import FormData from 'form-data';

import { SECRET_KEY } from './env.constant.js';

async function handleCaptchaToken(req) {
  try {
    // Get the form data from the request
    const token = req.body['cf-turnstile-response'];
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

    // Prepare form data for validation
    const formData = new FormData();
    formData.append('secret', SECRET_KEY);
    formData.append('response', token);
    formData.append('remoteip', ip);

    // Send validation request to Cloudflare Turnstile API using axios
    const url = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';
    const response = await axios.post(url, formData, {
      headers: formData.getHeaders(), // Ensure the correct headers are sent for form-data
    });

    const outcome = response?.data;

    if (outcome?.success) {
      // Successful verification
      return true;
    } else {
      // Verification failed
      return false;
    }
  } catch (error) {
    // eslint-disable-next-line no-undef, no-console
    console.error('Error during verification:', error);
    return false;
  }
}

export { handleCaptchaToken };
