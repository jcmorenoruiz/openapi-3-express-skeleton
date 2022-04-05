'use strict'

process.title = 'openapi-skeleton-crons';
process.env.DEBUG =
  (process.env.DEBUG ? process.env.DEBUG + ', ' : '') +
  'openapi:debug:*, openapi:info:*, openapi:warn*, openapi:error:*, openapi:audit:*';

const cron = require('node-cron');
const i18n = require('i18n');

const config = require('./config/config');
i18n.configure(config.i18n);
const mongooseHelper = require('./api/helpers/mongoose');
const log = require('./api/helpers/log')('crons');

// crons
const demoCron = require('./api/crons/demo_cron');

async function doStart () {
  log.debug('doStart() Starting crons in %s environment..', process.env.NODE_ENV)

  // define process title
  process.title = 'ab-crons';

  // connect to database
  await mongooseHelper.connect();

  // set crons
  //             ┌────────────── second(optional)
  //             │ ┌──────────── minute
  //             │ │ ┌────────── hour
  //             │ │ │ ┌──────── day of month
  //             │ │ │ │ ┌────── month
  //             │ │ │ │ │ ┌──── day of week
  //             │ │ │ │ │ │
  //             │ │ │ │ │ │
  //             * * * * * *
  let schedule;
  const ENV = process.env.NODE_ENV || 'development';

  // execute during work days; every 2 hours during business hours
  log.info('crons() schedule: demoCron');
  cron.schedule('0 0 8,10,12,14,16 * * 1-5', async function () { await demoCron.run(); });

  // done
  log.info('crons() started (in %s mode)', process.env.NODE_ENV)
  console.timeEnd(TIMING_LABEL) // timing
}

const TIMING_LABEL = 'TIMING_crons_start_' + Math.round(Math.random() * 100000)
console.time(TIMING_LABEL) // timing

doStart()
  .catch(err => {
    log.error('crons() catch! err: %O', err)
    console.timeEnd(TIMING_LABEL) // timing
    process.exit(1)
  });
