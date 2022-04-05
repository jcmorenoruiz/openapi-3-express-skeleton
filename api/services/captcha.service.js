'use strict';

const axios = require('axios');

const ApiError = require('../../api/helpers/errors/api.error');
const log = require('../../api/helpers/log')('services:captcha');
const config = require('../../config/config');

const verifyReCaptchaV3 = async (captcha, action = 'login', username = undefined) => {

  if (!config.google || !config.google.reCaptchaV3Key ||
    config.google.reCaptchaV3Key === 'Your google reCaptchaV3 key') {
    log.warn('reCaptchaV3Key not configured. Skipping captcha verification ...');
    return false;
  }

  let allowedScore = config.google.allowedScore || 0.5;
  let uri = 'https://www.google.com/recaptcha/api/siteverify';
  let options = { timeout: 5000 };

  // Bypass captcha for development
  if (process.env.NODE_ENV === 'development') allowedScore = 0.25;

  const params = new URLSearchParams();
  params.append('secret', config.google.reCaptchaV3Key);
  params.append('response', captcha);

  const { data: responseData } = await axios.post(uri, params, options);
  log.info('verifyCaptchaV3() Google reCaptcha v3 score: %o %s',
    (responseData.success ? responseData.score : responseData),
    (username ? '(' + username + ')' : '')
  );

  if (responseData.success && (responseData.action === action) &&
    responseData.score >= allowedScore) {
    return responseData;
  } else {
    log.warn('verifyReCaptchaV3() Invalid recaptcha. Error: %O', responseData);
    throw new ApiError('reCaptcha is not valid; login failed!', 412, 'INVALID_CAPTCHA', 'login.captchaFailed');
  }
};

module.exports = {
  verifyReCaptchaV3
};
