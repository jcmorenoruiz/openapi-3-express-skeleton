'use strict';

const log = require('../../api/helpers/log')('services:registration');
const userService = require('../../api/services/user.service');

const registerUser = async (registration) => {
	registration.role = 'user';
	const userId = await userService.createUser(registration);

	log.debug('registerUser() succeded');
	return userId;
};

const registerAdmin = async (registration) => {
	registration.role = 'root-admin';
	const userId = await userService.createUser(registration);
  
	log.debug('registerUser() succeded');

	return userId;
};

module.exports = {
	registerUser,
	registerAdmin
};