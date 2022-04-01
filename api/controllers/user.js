'use strict';

const sanitize = require('mongo-sanitize');

const log = require('../../api/helpers/log')('controllers:user');
const ApiError = require('../../api/helpers/errors/api.error');
const userService = require('../../api/services/user.service');

const errorHelper = require('../../api/helpers/error');

const getInfo = async (req, res, next) => {
  try {
    const authUserId = req.auth.userId;

    const user = await userService.get(authUserId);

    res.status(200).json(user);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getInfo
};