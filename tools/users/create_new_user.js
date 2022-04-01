'use strict';

const assert = require('assert');

const mongooseHelper = require('../../api/helpers/mongoose');
const log = require('../../api/helpers/log')('tools:users:create_new_user');
const userService = require('../../api/services/user.service');
const registrationService = require('../../api/services/registration.service');

assert.ok(process.env.BO_USERNAME, 'Please specify a BO_USERNAME');
assert.ok(process.env.EMAIL, 'Please specify an EMAIL');

const params = {
  username: process.env.BO_USERNAME,
  password: process.env.BO_PASSWORD,
  email: process.env.EMAIL,
  role: process.env.ROLE || 'user'
};

log.info('inputParams: %O', params);

async function run() {
  await mongooseHelper.connect();

  let userId;

  switch (params.role) {
    case 'root-admin': userId = await registrationService.registerAdmin(params);
      break;

    default: throw new Error('Invalid role. Must be either: user or business or admin');
  }
  
  log.info(`User with role ${params.role} created successfully`);

  const user = await userService.fetchById(userId);
  log.info(user);

  process.exit(0);
}

run()
  .catch(err => {
    console.error(err);
    process.exit(1);
  })