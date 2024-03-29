'use strict';

module.exports = class ApiError extends Error {
  constructor(message, status, code, translationKey, translationParams) {

    // Calling parent constructor of base Error class.
    super(message);

    // Saving class name in the property of our custom error as a shortcut.
    this.name = this.constructor.name;

    // Capturing stack trace, excluding constructor call from it.
    Error.captureStackTrace(this, this.constructor);

    // Http error status code
    this.status = status || 500;
    this.code = code || 'INTERNAL_SERVER_ERROR';
    this.translationKey = translationKey || 'apiError.generic';
    this.translationParams = translationParams;
  }
};