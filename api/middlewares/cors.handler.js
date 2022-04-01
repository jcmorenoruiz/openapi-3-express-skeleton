'use strict';

const log = require('../../api/helpers/log')('middleware:cors.handler');
const config = require('../../config/config');

module.exports = (req, res, next) => {
  const origin = req.header('Origin');

  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, HEAD, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization,X-XSRF-TOKEN,User-Filter');

  if (config.corsWhitelist.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }

  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Max-Age', 3600);
    res.sendStatus(204);
  } else {
    next();
  }
};