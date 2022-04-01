const config = require('../config/config');
const mongooseHelper = require('../api/helpers/mongoose');
mongooseHelper.loadModels(true);

module.exports = {
  'dbConnectionUri': config.dbAuthenticatedUri,
  'migrationsDir': 'migrations',
  'templateFile': 'tools/migrations/migration.js.tmpl'
};
