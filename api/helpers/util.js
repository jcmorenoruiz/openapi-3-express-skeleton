'use strict';

const crypto = require('crypto');
const phoneUtil = require('google-libphonenumber').PhoneNumberUtil.getInstance();
const PNF = require('google-libphonenumber').PhoneNumberFormat;

const log = require('../../api/helpers/log')('helper:util');
const config = require('../../config/config');

const ROLES = config.allowedRoles;

const timeout = ms => new Promise(res => setTimeout(res, ms));

const randomNumber = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const generateRandomPassword = (length = 8) => {
  const possibleChars = 'ABCDEFGHJKLMNPQRTWXYZabcdefghjkmnpqrtwxy346789';
  let randomString = '';
  for (var i = 0; i < length; i++) {
    randomString += possibleChars.charAt(Math.floor(Math.random() * possibleChars.length));
  }
  return randomString;
}

const getHashString = (inputString, alg) => {
  var hash = crypto.createHash(alg ? alg : 'sha256');
  var hashString = hash.update(inputString, 'utf8').digest('hex');
  return hashString;
};

const isValidPhone = function(phone) {
  try {
    var number = '+' + parseInt(phone);
    var phoneNumber = phoneUtil.parse(number);
    return phoneUtil.isValidNumber(phoneNumber);
  } catch (ex) {
    log.warn('isValidPhone() Error when trying to parse phone number');
    log.warn('isValidPhone() number=%s; phone=%s', String(number), phone);
    return false;
  }
};

const formatPhone = function(phone) {
  try {
    var number = '+' + parseInt(phone);
    var phoneNumber = phoneUtil.parse(number);
    if (phoneUtil.isValidNumber(phoneNumber)) {
      phoneNumber = parseInt(phoneUtil.format(phoneNumber, PNF.E164));
    } else {
      log.warn('formatPhone() phoneNumber is not valid number! use: %s', number);
      return false;
    }
  } catch (ex) {
    log.warn('formatPhone() Error when trying to format phone number to E164');
    log.warn('formatPhone() number=%s; phone=%s', String(number), phone);
    return false;
  }
  return phoneNumber;
};

/* Get roles under selected role */
const getLowerLevelRoles = (role = 'freelancer') => {
  if (role === ROLES[0]) {
    return ROLES;
  } else {
    return ROLES.slice(ROLES.indexOf(role) + 1);
  }
};

const generateRandomReadableCode = (length) => {
  const possibleChars = 'ABCDEFGHJKLMNPQRTWXYZ346789';
  const rand = crypto.randomBytes(length);
  let str = '';

  for (let i = 0; i < rand.length; i++) {
    let index = rand[i] % possibleChars.length;
    str += possibleChars[index];
  }

  return str;
};

module.exports = {
  timeout,
  randomNumber,
  generateRandomPassword,
  getHashString,
  isValidPhone,
  formatPhone,
  getLowerLevelRoles,
  generateRandomReadableCode
};