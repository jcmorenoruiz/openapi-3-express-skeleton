'use strict';

const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');
const { i18nConfig } = require('../../config/config');
const log = require('../../api/helpers/log')('model:user');

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    trim: true,
    minlength: 3,
    maxlength: 50,
    match: [/^([a-zA-Z0-9_.-]){3,64}$/, 'Username is not valid'],
  },
  email: {
    type: String,
    required: true,
    trim: true,
  },
  role: {
    type: String,
    enum: ['root-admin', 'user'],
    required: true,
  },
  uuid: {
    type: String,
    unique: true,
    default: uuidv4,
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'disabled', 'anonymized'],
    default: 'active',
    required: true,
  },
  passwordHash: {
    type: String,
    required: true,
  },
  passwordSalt: {
    type: String,
    required: true,
  },
  emailVerified: {
    type: Boolean,
    default: false,
  },
  mobileVerified: {
    type: Boolean,
    default: false,
  },
  locale: {
    type: String,
    enum: i18nConfig.localeList.map((lang) => lang.code),
    default: 'en-US',
  },
  resetPasswordToken: {
    type: String,
  },
  resetPasswordExpiresAt: {
    type: Date,
  },
  emailVerificationCodeHash: {
    type: String
  },
  emailVerificationExpiresAt: {
    type: Date,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true,
});

UserSchema.index({ email: 1 }, { unique: true });
UserSchema.index({ username: 1 }, { unique: true });

module.exports = mongoose.model('User', UserSchema);