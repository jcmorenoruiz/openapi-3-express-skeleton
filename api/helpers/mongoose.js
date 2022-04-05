'use strict';

const mongoose = require('mongoose');
const path = require('path');
const glob = require('glob');
const config = require('../../config/config');
const log = require('../../api/helpers/log')('helpers:mongoose');

const dbOptions = {
  keepAlive: 1,
  connectTimeoutMS: 5000,
  user: config.mongodb.user,
  pass: config.mongodb.pass,
  useNewUrlParser: truers
};

function initListeners () {
  mongoose.connection.on('connected', _ => log.info('Connection established to MongoDB: %s', config.dbUri));
  mongoose.connection.on('error', err => log.error('MongoDB errored. err = %O', err));
  mongoose.connection.on('disconnected', _ => { log.info('MongoDB is disconnected'); });
  mongoose.connection.on('reconnected', _ => { log.info('Reconnected to MongoDB'); });

  process.on('SIGINT', _ => { mongoose.connection.close(_ => process.exit(0)); });
}

const loadModels = () => {
  log.debug('loadModels()');

  let files = glob.sync("./api/models/*.js", {});
  for (let file of files) {
    if (file.indexOf('index') < 0) {
      const modelFile = require(path.resolve(file));
      log.debug('Loaded Schema: ' + modelFile.modelName);
      global[modelFile.modelName] = modelFile;
    }
  }
}

const connect = async () => {
  const TIMING_LABEL = 'TIMING_mongoose_connect_' + Math.round(Math.random() * 100000);
  console.time(TIMING_LABEL); // timing

  try {
    initListeners();
    // Load and validate DB models
    loadModels();

    // check if already connected: 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
    if (mongoose.connection.readyState !== 1) {
      // do connection
      await mongoose.connect(config.dbUri, dbOptions);
      log.info('mongoose.connect() connection to MongoDB %s successful', config.dbUri);
    }
  } catch (err) {
    log.error('mongoose.connect() could not connect; db: %O, err: %O', config.dbUri, err);

    throw err;
  } finally {
    console.timeEnd(TIMING_LABEL); // timing
  }
}

const buildGeoPoint = (latitude, longitude) => {
  return {
    type: 'Point',
    coordinates: [longitude, latitude]
  };
};

module.exports = { connect, loadModels, buildGeoPoint };
