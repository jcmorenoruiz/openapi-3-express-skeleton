const mongoose = require('mongoose');
const config = require('../../config/config');

const User = require('./user.model');

const dbOptions = {
  keepAlive: 1,
  connectTimeoutMS: 30000,
  user: config.mongodb.user,
  pass: config.mongodb.pass,
  useFindAndModify: false,
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true
};

// Required for migrations to get models working normally
mongoose.connect(config.dbUri, dbOptions);

module.exports = {
  User
};