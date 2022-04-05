'use strict';

const assert = require('assert');

const mongooseHelper = require('../../api/helpers/mongoose');
const log = require('../../api/helpers/log')('tools:users:create_new_user');
const userService = require('../../api/services/user.service');
const registrationService = require('../../api/services/registration.service');

assert.ok(process.env.BO_USERNAME, 'Please specify a BO_USERNAME');
assert.ok(process.env.EMAIL, 'Please specify an EMAIL');

const {
  BO_USERNAME,
  BO_PASSWORD,
  EMAIL,
  ROLE
} = process.env;

async function run() {
  await mongooseHelper.connect();

  const params = {
    username: BO_USERNAME,
    email: EMAIL,
    role: ROLE,
    password: BO_PASSWORD
  };

  let userId;

  switch (params.role) {
    case 'user': userId = await registrationService.registerUser(params);
      break;
    case 'root-admin': userId = await registrationService.registerAdmin(params);
      break;

    default: throw new Error('Invalid role. Must be either: user or root-admin');
  }
  
  log.info(`User with role ${ROLE} created successfully`);

  const user = await userService.fetchById(userId);
  log.info(user);

  process.exit(0);
}

run()
  .catch(err => {
    console.error(err);
    process.exit(1);
  })