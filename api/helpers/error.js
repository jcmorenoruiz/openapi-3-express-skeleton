'use strict';

const ApiError = require('../../api/helpers/errors/api.error');

const reportErrorInsufficientPermissions = () => {
  throw new ApiError(
    'Insufficient privileges for the selected resource',
    403,
    'INSUFICCIENT_PRIVILEGES',
    'apiError.insufficientPrivileges'
  );
}

const reportErrorResourceNotFound = () => {
  throw new ApiError(
    'Resource not found with the requested parameters',
    404,
    'NOT_FOUND',
    'apiError.resourceNotFound'
  );
};

const reportErrorNotImplementedYet = () => {
  throw new ApiError('Functionality not implemented yet', 501, 'NOT_IMPLEMENETD');
}

module.exports = {
  reportErrorInsufficientPermissions,
  reportErrorResourceNotFound,
  reportErrorNotImplementedYet
}