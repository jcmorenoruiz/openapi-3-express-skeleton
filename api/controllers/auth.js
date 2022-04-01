'use strict';

const sanitize = require('mongo-sanitize');

const log = require('../../api/helpers/log')('controllers:auth');
const captchaService = require('../../api/services/captcha.service');
const registrationService = require('../../api/services/registration.service');
const userService = require('../../api/services/user.service');
const authService = require('../../api/services/auth.service');
const ApiError = require('../../api/helpers/errors/api.error');

const postLogin = async (req, res, next) => {
  try {
    log.debug('login()');

    const { username, password, captcha } = sanitize(req.body);
    await captchaService.verifyReCaptchaV3(captcha, 'plusid_login', username);

    let userId = await authService.authenticate(username, password);
    let user = await userService.fetchById(userId);

    if (!user.emailVerified) {
      // Send verification email asynchronously.
      authService.sendVerificationEmail(userId);
    }

    const { token, expiresAt } = authService.buildAuthToken(userId, user.role);

    log.info('login() success: ' + user.username + ' / ' + user.role);

    res.status(200).json({ token, expiresAt, user });
  } catch (err) {
    next(err);
  }
};

const postRegister = async (req, res, next) => {
  try {
    log.debug('postRegister()');

    if (process.env.NODE_ENV !== 'development') {
      throw new ApiError('Login is disabled for this environment', 409, 'LOGIN_DISABLED');
    }

    const { body } = req;

    await captchaService.verifyReCaptchaV3(body.captcha, 'plusid_register');
    const userId = await registrationService.registerUser(body);

    const user = await userService.fetchById(userId);
    log.debug('Registered user: %O', user);

    const { token, expiresAt } = authService.buildAuthToken(userId, user.role);

    // Send verification email asynchronously.
    authService.sendVerificationEmail(userId);

    log.info('register() succeeded for username: %s email: %s', user.username, user.email);

    res.status(200).json({ token, expiresAt, user });
  } catch (err) {
    next(err);
  }
};

const postVerifyEmail = async (req, res, next) => {
  try {
    log.debug('postVerifyEmail');

    const { userId } = req.auth;
    const { body } = req;

    await authService.verifyEmail(body.code, userId);

    const user = userService.fetchById(userId);

    log.info('postVerifyEmail() succeeded for email: %s');

    res.status(200).json({ message: 'Ok', success: true });
  } catch (err) {
    next(err);
  }
};

const postChangePassword = async (req, res, next) => {
  try {
    const { userId } = req.auth;
    log.debug('changePassword() requested for userId: %s', userId);
    const { currentPassword, newPassword } = sanitize(req.body);

    const result = await authService.changePassword(userId, currentPassword, newPassword);
    log.info('Password changed successfully for userId: %s', userId);

    res.status(200).json({ message: 'OK' });
  } catch (err) {
    next(err);
  }
};

const postPasswordForgot = async (req, res, next) => {
  try {
    const { username } = sanitize(req.body);
    log.debug('forgot() username: %s', username);

    await authService.forgot(username);
    log.debug('forgot() success username: %s', username);

    res.status(200).json({ message: 'Ok' });
  } catch (err) {
    next(err);
  }
};

const postPasswordReset = async (req, res, next) => {
  try {
    const { password, token } = sanitize(req.body);
    log.debug('reset() token: %s', token);

    let { username, email } = await authService.reset(password, token);

    log.debug('reset() success for username: %s email: %s', username, email);

    res.status(200).json({ message: 'Ok' });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  postLogin,
  postRegister,
  postVerifyEmail,
  postChangePassword,
  postPasswordForgot,
  postPasswordReset
};