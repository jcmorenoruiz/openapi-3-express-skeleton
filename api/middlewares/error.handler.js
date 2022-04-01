'use strict';

const log = require('../../api/helpers/log')('middleware:error.handler');
const ApiError = require('../../api/helpers/errors/api.error');

module.exports = (err, req, res, next) => {
  log.error(`ErrorHandler: ${err}`);

  const statusCode = err.status || 500; // Default
  let code = err.code || 'INTERNAL_SERVER_ERROR';
  let message = err.message || 'Something went wrong';
  let translationKey = err.translationKey || 'apiError.generic';

  if (err instanceof ApiError) {
    log.error('ErrorHandler(): ApiError: ', err);
  } else if (statusCode === 400) {
    code = 'VALIDATION_ERROR'; // Standarize openapi validation error code
    translationKey = 'forms.checkFormFields';
    if (err.errors) log.error(err.errors);
  } else if ([404, 405].includes(statusCode)) {
    // Format err name: i.e method not allowed -< METHOD_NOT_ALLOWED
    if (err.name) code = err.name.toUpperCase().replace(/\s/g, '_');
  } else if (![401, 403].includes(statusCode)) {
    message = 'An error ocurred, please try again later';
  }
  
  res.status(statusCode).json({
    message: message,
    code: code,
    translationKey: translationKey,
    translationParams: err.translationParams
  });
};
