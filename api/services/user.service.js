'use strict';

const log = require('../../api/helpers/log')('services:user');
const passwordAuthenticator = require('../../api/helpers/password.authenticator');
const utilHelper = require('../../api/helpers/util');
const ApiError = require('../../api/helpers/errors/api.error');
const userHelper = require('../../api/helpers/models/user.helper');

const fetchById = async (id) => {
  const user = await userHelper.findById(id);
  // await user.populate('field').execPopulate();
  return user;
};

const createUser = async (params, authUserId) => {
  let datastoreUuid;
  try {
    log.info('createUser()');

    // Initialize user
    const salt = passwordAuthenticator.createSalt();
    const password = params.password || utilHelper.generateRandomPassword(12);
    const newUser = new User({
      username: params.username,
      passwordSalt: salt,
      passwordHash: passwordAuthenticator.hashPassword(password, salt),
      role: params.role || 'user',
      email: params.email,
      createdByUser: authUserId
    });
    const savedUser = await newUser.save();

    return savedUser._id;

  } catch (err) {
    log.error('createUser() catch! err: ', err);

    if (err.message && err.message.indexOf('E11000 duplicate key error') >= 0) {
      throw new ApiError(
        'Email or username already exists',
        409,
        'USER_ALREADY_EXISTS',
        'register.registrationAlreadyExists'
      );
    } else {
      throw err;
    }
  }
};

module.exports = {
  fetchById,
  createUser,
};