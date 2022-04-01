'use strict';

process.title = 'xsofta';
process.env.DEBUG = (process.env.DEBUG ? process.env.DEBUG + ', ' : '') +
  'xsofta:debug:*, xsofta:info:*, xsofta:warn*, xsofta:error:*, xsofta:audit:*';

const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const http = require('http');
const swaggerUi = require('swagger-ui-express');
const OpenApiValidator = require('express-openapi-validator');
const i18n = require('i18n');

const log = require('./api/helpers/log')('app');
const openApiHelper = require('./api/helpers/openapi');
const mongooseHelper = require('./api/helpers/mongoose');
const { i18nConfig, appPort } = require('./config/config');
const authMiddleware = require('./api/middlewares/auth.middleware');
const app = express();

// Configure internationalization
i18n.configure(i18nConfig);

function printEnv() {
  // logging application start
  log.info('---------------------------');
  log.info('Environment: ' + process.env.NODE_ENV);
  log.debug('Home directory: ' + __dirname);
  log.debug('Running in port: ' + appPort);
  log.info('Node version: ' + process.version);
  log.info('Process title: ' + process.title);
  log.info('Process PID: ' + process.pid + '; ' + process.platform);
  log.debug('Debug levels: ' + process.env.DEBUG);
  log.audit('log: audit');
  log.debug('log: debug');
  log.info('log: info');
  log.warning('log: warning');
  log.warn('log: warn');
  log.error('log: error');
  log.info('---------------------------');
}

async function doStart() {
  // Resolve Yaml references
  const apiSpec = await openApiHelper.resolveYamlRefs('./api/openapi/openapi.yaml');

  // connect to database
  await mongooseHelper.connect();

  // Internationalization
  app.use(i18n.init);

  // add some logs about each request
  app.use((req, res, next) => {
    log.info(`endpoint: ${req.path}: ${req.headers['content-type']}: ${req.headers['user-agent']}`);
    next();
  });

  // Install bodyParsers for the request types the API will support
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(bodyParser.text());
  app.use(bodyParser.json());

  // Add CORS headers (No need staging/producion as nginx manages it)
  if (process.env.NODE_ENV === 'development') {
    app.use(require('./api/middlewares/cors.handler'));
  }

  // Serve Api Docs. (Development only)
  if (process.env.NODE_ENV === 'development') {
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(apiSpec));
  }

  // Install the OpenApiValidator on the express app
  app.use(
    OpenApiValidator.middleware({
      apiSpec,
      validateApiSpec: true,
      validateRequests: true,
      validateResponses: false,
      validateSecurity: {
        handlers: {
          Bearer: authMiddleware.bearerAuthenticator,
          ApiKey: authMiddleware.apiKeyAuthenticator
        }
      },
      // Provide the base path to the operation handlers (controllers) directory
      operationHandlers: path.join(__dirname + '/api/controllers'),
    })
  );

  // Handle errors
  app.use(require('./api/middlewares/error.handler'));

  http.createServer(app).listen(appPort);

  log.info(`app() started backend in port ${appPort} (in ${process.env.NODE_ENV} mode)`);
  printEnv();
  console.timeEnd(TIMING_LABEL); // timing
}

const TIMING_LABEL = 'TIMING_app_start_' + Math.round(Math.random() * 100000);
console.time(TIMING_LABEL); // timing

doStart().catch((err) => {
  log.error('app() catch! err: %O', err.stack);
  console.timeEnd(TIMING_LABEL); // timing
  process.exit(1);
});

module.exports = app;