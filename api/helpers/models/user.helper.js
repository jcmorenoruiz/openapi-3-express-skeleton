'use strict';

const log = require('../../../api/helpers/log')('helpers:user');
const errorHelper = require('../../../api/helpers/error');

const SENSITIVE_FIELDS = '-passwordHash ' +
  '-passwordSalt ' +
  '-resetPasswordToken ' +
  '-resetPasswordExpiresAt ' +
  '-emailVerificationToken ' +
  '-emailVerificationExpiresAt ' +
  '-__v';

const findById = async (id, reportNotFound = true, cleanSensitiveFields = true, select) => {
  // Do not include populate here, it could affect critital application code
  return await findOneBy({ _id: id }, reportNotFound, cleanSensitiveFields, select);
};

const findOneBy = async (query, reportNotFound = true, cleanSensitiveFields = true, select) => {
  const user = await User.findOne(query)
  .select(cleanSensitiveFields ? SENSITIVE_FIELDS : select ? select : '');

  if (reportNotFound && !user) {
    errorHelper.reportErrorResourceNotFound();
  }
  return user;
};

const updateById = async (id, update, reportNotFound = true) => {
  const updated = await User.findByIdAndUpdate(id, update, { new: true });
  if (reportNotFound && !updated) {
    errorHelper.reportErrorResourceNotFound();
  }
  return updated;
};

module.exports = {
  findById,
  findOneBy,
  updateById
};