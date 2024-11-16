/* eslint-disable no-useless-catch */
import * as axios from 'axios';

import {
  PG_IM_CLIENT_ID,
  PG_IM_CLIENT_SECRET,
} from '../config/env.constant.js';

const HOSTS = {
  production: 'https://api.instamojo.com/v2/',
  test: 'https://test.instamojo.com/v2/',
};

const AUTHHOSTS = {
  production: 'https://api.instamojo.com/oauth2/token/',
  test: 'https://test.instamojo.com/oauth2/token/',
};

const API = {
  createPayment: 'payment_requests/',
  payments: 'payments/',
  paymentStatus: 'payment_requests/',
  refunds: 'payments/',
  paymentforSDK: 'gateway/orders/payment-request/',
};

let CURRENT_TOKEN = '';
let CURRENT_HOST = 'production';

const AuthHEADERS = {
  'Content-Type': 'application/x-www-form-urlencoded',
  Authorization: '',
};

function isSandboxMode(isSandbox) {
  CURRENT_HOST = isSandbox ? 'test' : 'production';
}

function setToken(resToken) {
  CURRENT_TOKEN = resToken;
  AuthHEADERS.Authorization = 'Bearer ' + resToken;
}

function hasToken() {
  return !!CURRENT_TOKEN;
}

async function createToken() {
  try {
    const response = await axios.post(
      AUTHHOSTS[CURRENT_HOST],
      AuthTokenRequestData(),
      {
        headers: AuthHEADERS,
      }
    );
    const result = response.data;
    setToken(result?.access_token);
    return result;
  } catch (error) {
    setToken(null);
    throw error;
  }
}

async function createPayment(data) {
  try {
    const response = await axios.post(
      HOSTS[CURRENT_HOST] + API.createPayment,
      data,
      {
        headers: AuthHEADERS,
      }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
}

async function createPaymentforSDK(data) {
  try {
    const response = await axios.post(
      HOSTS[CURRENT_HOST] + API.paymentforSDK,
      data,
      {
        headers: AuthHEADERS,
      }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
}

async function seeAllLinks() {
  try {
    const response = await axios.get(HOSTS[CURRENT_HOST] + API.links);
    return response.data;
  } catch (error) {
    throw error;
  }
}

async function getAllPaymentRequests() {
  try {
    const response = await axios.get(HOSTS[CURRENT_HOST] + API.paymentStatus, {
      headers: AuthHEADERS,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
}

async function getPaymentRequestStatus(id) {
  try {
    const response = await axios.get(
      HOSTS[CURRENT_HOST] + API.paymentStatus + id + '/',
      {
        headers: AuthHEADERS,
      }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
}

async function getPaymentDetails(payment_request_id, payment_id) {
  try {
    const response = await axios.get(
      HOSTS[CURRENT_HOST] +
        API.paymentStatus +
        payment_request_id +
        '/' +
        payment_id +
        '/',
      {
        headers: AuthHEADERS,
      }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
}

async function createRefund(refundRequest) {
  try {
    const response = await axios.post(
      HOSTS[CURRENT_HOST] + API.refunds + '/',
      refundRequest,
      {
        headers: AuthHEADERS,
      }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
}

async function getAllRefunds() {
  try {
    const response = await axios.get(HOSTS[CURRENT_HOST] + API.refunds, {
      headers: AuthHEADERS,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
}

async function getRefundDetails(id) {
  try {
    const response = await axios.get(
      HOSTS[CURRENT_HOST] + API.refunds + id + '/',
      {
        headers: AuthHEADERS,
      }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
}

function PaymentData() {
  return {
    purpose: '', // required
    amount: 0, // required
    currency: 'INR',
    buyer_name: '',
    email: '',
    phone: '',
    send_email: '',
    send_sms: '',
    allow_repeated_payments: '',
    webhook: '',
    redirect_url: '',

    setWebhook(hook) {
      this.webhook = hook;
    },

    setRedirectUrl(redirectUrl) {
      this.redirect_url = redirectUrl;
    },
  };
}

function OrderData() {
  return {
    id: '', // required
    phone: '',
  };
}

function AuthTokenRequestData() {
  return {
    grant_type: 'client_credentials',
    client_id: PG_IM_CLIENT_ID,
    client_secret: PG_IM_CLIENT_SECRET,
  };
}

function RefundRequest() {
  return {
    payment_id: '',
    type: '', // Available: ['RFD', 'TNR', 'QFL', 'QNR', 'EWN', 'TAN', 'PTH']
    body: '',

    setRefundAmount(refundAmount) {
      this.refund_amount = refundAmount;
    },
  };
}

export {
  CURRENT_TOKEN,
  CURRENT_HOST,
  AuthHEADERS,
  isSandboxMode,
  setToken,
  hasToken,
  createToken,
  createPayment,
  createPaymentforSDK,
  seeAllLinks,
  getAllPaymentRequests,
  getPaymentRequestStatus,
  getPaymentDetails,
  createRefund,
  getAllRefunds,
  getRefundDetails,
  PaymentData,
  OrderData,
  AuthTokenRequestData,
  RefundRequest,
};
