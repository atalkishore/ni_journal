const axios = require('axios');
const FormData = require('form-data');

async function handleCaptchaToken(req, res) {
  try {
    // Get the form data from the request
    const token = req.body["cf-turnstile-response"];
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

    // Prepare form data for validation
    let formData = new FormData();
    formData.append("secret", process.env.SECRET_KEY);
    formData.append("response", token);
    formData.append("remoteip", ip);

    // Send validation request to Cloudflare Turnstile API using axios
    const url = "https://challenges.cloudflare.com/turnstile/v0/siteverify";
    const response = await axios.post(url, formData, {
      headers: formData.getHeaders() // Ensure the correct headers are sent for form-data
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
    console.error("Error during verification:", error);
    return false;
  }
}


module.exports = { handleCaptchaToken };
