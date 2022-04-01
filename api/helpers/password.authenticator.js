'use strict';

const crypto = require('crypto');

const authenticate = (password, hashedPassword, salt) => {
  if (!password || !salt || !hashedPassword) {
    throw new Error('Validation: password, hashedPassword and salt are mandatory');
  }
  return hashedPassword === module.exports.hashPassword(password, salt);
};

const createSalt = () => {
  return Buffer.from(crypto.randomBytes(16).toString('base64'), 'base64').toString('base64');
};

const hashPassword = (password, salt) => {
  if(!password || !salt) {
    throw new Error('Validation: password and salt are mandatory');
  }
  return crypto.pbkdf2Sync(Buffer.from(password, 'binary'), Buffer.from(salt, 'binary'), 10000, 64, 'sha1')
    .toString('base64');
};

module.exports = {
  authenticate,
  createSalt,
  hashPassword
};