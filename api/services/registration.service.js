'use strict';

const log = require('../../api/helpers/log')('services:registration');
const config = require('../../config/config');
const ApiError = require('../../api/helpers/errors/api.error');
const userService = require('../../api/services/user.service');

const registerUser = async (registration) => {
	registration.role = 'user';
  const userId = await userService.createUser(registration);
  
  return userId;
};

const registerAdmin = async (registration) => {
	registration.role = 'root-admin';
	const userId = await userService.createUser(registration);
  
  return userId;
};

module.exports = {
	registerUser,
	registerAdmin
};