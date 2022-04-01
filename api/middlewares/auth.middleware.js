'use strict';

const jwt = require('jsonwebtoken');
const config = require('../../config/config');
const log = require('../../api/helpers/log')('middleware:auth');
const ApiError = require('../../api/helpers/errors/api.error');

const bearerAuthenticator = (req, scopes, schema) => {
  try {
    let bearer = req.headers.authorization;

    if (!bearer || !/Bearer\s\w/.test(bearer)) {
      log.warn('No access token provided');
      return { type: 'invalid', statusCode: 401, message: 'No access token supplied' };
    }

    const token = bearer.split(' ')[1];

    const payload = jwt.verify(token, config.jwtAppToken.secret, {
      algorithm: config.jwtAppToken.algorithm,
      expiresIn: config.jwtAppToken.expiresIn
    });

    log.info('Payload: %O', payload);

    if (
      !payload ||
      !payload.userId ||
      payload.version !== config.jwtAppToken.version ||
      !payload.role
    ) {
      throw new ApiError('Access denied', 401, 'UNAUTHORIZED');
    }

    const requiredRoles = scopes;
    if (Array.isArray(requiredRoles) && requiredRoles.length && !requiredRoles.includes(payload.role)) {
      throw new ApiError('Access forbidden', 403, 'FORBIDDEN');
    }

    req.auth = {
      userId: payload.userId,
      role: payload.role
    };
    log.info('calling next()');

    return true;
  } catch (err) {
    log.warn(err);
    if (err.name === 'TokenExpiredError') {
      throw new ApiError('Token expired', 401, 'UNAUTHORIZED');
    } else if (err.name === 'JsonWebTokenError') {
      throw new ApiError('Token is not valid', 401, 'UNAUTHORIZED');
    } else {
      throw new ApiError('Access denied', 401, 'UNAUTHORIZED');
    }
  }
};

const apiKeyAuthenticator = (req, scopes, schema) => {
  let apiKey = req.headers['x-api-key'];

  if (apiKey && config.apiKey && apiKey === config.apiKey) {
    return true;
  } else {
    throw new ApiError('Access denied', 401, 'UNAUTHORIZED');
  }
};

module.exports = { bearerAuthenticator, apiKeyAuthenticator };