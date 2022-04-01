'use strict';

const jwt = require('jsonwebtoken');
const moment = require('moment');
const crypto = require('crypto');
const ejs = require('ejs');
const i18n = require('i18n');
const log = require('../../api/helpers/log')('services:auth');

const passwordAuthenticator = require('../../api/helpers/password.authenticator');
const ApiError = require('../../api/helpers/errors/api.error');
const userHelper = require('../../api/helpers/models/user.helper');
const utilHelper = require('../../api/helpers/util');
const config = require('../../config/config');
const sgMailService = require('../../api/services/sendgrid.email.service');

const CLIENT_BASE_URI = config.clientBaseUri;
const DEFAULT_LOCALE = config.i18n.defaultLocale;
const SERVICE_NAME = config.serviceName;

const authenticate = async (username, password) => {
  let finder = { username };

  const user = await User.findOne(finder);

  if (!user || !user.passwordSalt || !user.passwordHash ||
    !passwordAuthenticator.authenticate(password, user.passwordHash, user.passwordSalt)
  ) {
    throw new ApiError(
      'Invalid authentication credentials', 400, 'INVALID_CREDENTIALS', 'login.credentialsError'
    );
  }

  if (user.status !== 'active') {
    throw new ApiError('User has been disabled', 412, 'USER_DISABLED', 'login.errorUserLocked');
  }

  return user._id;
}

const buildAuthToken = (userId, role) => {
  const signOptions = {
    algorithm: config.jwtAppToken.algorithm,
    expiresIn: config.jwtAppToken.expiresIn,
  };
  const secret = config.jwtAppToken.secret;
  const payload = {
    version: config.jwtAppToken.version,
    userId: userId.toString(),
    role: role,
  };

  const authToken = jwt.sign(payload, secret, signOptions);

  return {
    token: authToken,
    expiresAt: moment().add(config.jwtAppToken.expiresIn, 'minutes'),
  };
}

const forgot = async (username) => {
  log.debug('forgot() username: %s', username);
  const user = await userHelper.findOneBy({ username: username });

  // TODO: Do not allow to request password verification again in at least 2 minutes.

  const locale = user.profile ? user.profile.locale : DEFAULT_LOCALE;
  i18n.setLocale(locale);

  user.resetPasswordToken = crypto.randomBytes(20).toString('hex');
  user.resetPasswordExpiresAt = moment().add(1, 'hour').utc();

  await user.save();
  const resetLink = CLIENT_BASE_URI + '/auth/reset-password/' + user.resetPasswordToken;
  const forgotLink = CLIENT_BASE_URI + '/auth/forgot-password';

  const subject =
    (process.env.NODE_ENV !== 'production' ? 'TEST: ' : '') +
    i18n.__('emails.forgotPassword.subject', { serviceName: SERVICE_NAME });

  let data = { forgotLink, resetLink, serviceName: SERVICE_NAME, __: i18n.__ };

  const emailHTML = await ejs.renderFile(
    __dirname + '/../../api/data/email/forgot-password.ejs',
    data, { async: true }
  );

  const sgParams = {
    email: user.email,
    subject,
    emailHTML
  };
  const sgResult = await sgMailService.sendWhitelabelEmail(sgParams);
  if (sgResult && sgResult.length > 0) {
    log.debug('forgot() sgResult: %s / %s', sgResult[0].statusCode, sgResult[0].statusMessage);
  }
}

const reset = async (password, token) => {
  const query = {
    resetPasswordToken: token,
    resetPasswordExpiresAt: { $gt: moment().toDate() },
  };

  const user = await User.findOne(query);
  if (!user) {
    throw new ApiError(
      'Reset token is invalid or has expired', 400, 'INVALID_TOKEN', 'apiError.invalidToken'
    );
  }

  user.salt = passwordAuthenticator.createSalt();
  user.passwordHash = passwordAuthenticator.hashPassword(password, user.salt);
  user.resetPasswordToken = undefined;
  user.resetPasswordExpiresAt = undefined;

  await user.save();

  return user;
}

const changePassword = async (userId, currentPassword, newPassword) => {
  const user = await userHelper.findById(userId, true, false);
  if (passwordAuthenticator.hashPassword(currentPassword, user.passwordSalt) === user.passwordHash) {
    user.salt = passwordAuthenticator.createSalt();
    user.passwordHash = passwordAuthenticator.hashPassword(newPassword, user.passwordSalt);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpiresAt = undefined;

    await user.save();
  } else {
    throw new ApiError(
      'Current password is incorrect',
      400,
      'INVALID_CREDENTIALS',
      'apiError.user.invalidCurrentPassword'
    );
  }
};

const sendVerificationEmail = async (userId) => {
  const user = await userHelper.findById(userId, true, false);
  log.debug('sendVerificationEmail() email: %s', user.email);

  if (user.emailVerified) {
    throw new ApiError(
      'Email is already verified', 409, 'EMAIL_ALREADY_VERIFIED', 'userProfile.emailAlreadyVerified'
    );
  }

  i18n.setLocale(user.locale || DEFAULT_LOCALE);

  let verificationCode = utilHelper.generateRandomReadableCode(6);
  user.emailVerificationCodeHash = utilHelper.getHashString(verificationCode);
  user.emailVerificationExpiresAt = moment().add(5, 'minutes').utc();

  await user.save();

  const subject =
    (process.env.NODE_ENV !== 'production' ? 'TEST: ' : '') +
    i18n.__('emails.emailVerification.subject', { serviceName: SERVICE_NAME });

  const data = {
    verificationCode,
    serviceName: SERVICE_NAME,
    __: i18n.__,
  };

  try {
    const emailHTML = await ejs.renderFile(
      __dirname + '/../../api/data/email/email-verification.ejs',
      data,
      { async: true }
    );

    const sgParams = {
      email: user.email,
      subject,
      emailHTML,
    };
    const sgResult = await sgMailService.sendWhitelabelEmail(sgParams);
    if (sgResult && sgResult.length > 0) {
      log.debug(
        'sendVerificationEmail() sgResult: %s / %s',
        sgResult[0].statusCode,
        sgResult[0].statusMessage
      );
    }
  } catch (err) {
    log.error('sendVerificationEmail() catch in sending email; err: %O', err);
  }
};

const verifyEmail = async (code, userId) => {
  log.debug('verifyEmail() code: %s', code);
  const query = {
    _id: userId,
    emailVerificationExpiresAt: { $gt: moment().toDate() },
  };

  const user = await User.findOne(query);

  if (!user || user.emailVerified) {
    throw new ApiError(
      'Email verification code has expired', 400, 'INVALID_CODE', 'apiError.user.invalidCode'
    );
  }

  if (!user.emailVerificationCodeHash || 
    user.emailVerificationCodeHash !== utilHelper.getHashString(code)) {
    throw new ApiError('Email verification code is not valid', 400, 'INVALID_CODE', 'apiError.user.invalidCode');
  }

  user.emailVerificationCodeHash = undefined;
  user.emailVerificationExpiresAt = undefined;
  user.emailVerified = true;

  await user.save();

  return user._id;
};

module.exports = {
  authenticate,
  buildAuthToken,
  forgot,
  reset,
  changePassword,
  sendVerificationEmail,
  verifyEmail,
};