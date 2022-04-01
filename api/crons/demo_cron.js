'use strict';

const config = require('../../config/config');
const mongooseHelper = require("../../api/helpers/mongoose")
const log = require('../../api/helpers/log')('crons:demo');

/*
  Cron to use as skeleton only
*/

async function doCron() {
  log.debug('doCron()');
}

const run = async _ => {
  log.debug('run()');
  await doCron();
};

if (process.argv.includes("run")) {
  mongooseHelper.connect()
    .then(run)
    .then(result => {
      log.debug('run() completed');
      process.exit(0);
    })
    .catch(err => {
      log.error(err);
      process.exit(1);
    })
}

module.exports = { run };