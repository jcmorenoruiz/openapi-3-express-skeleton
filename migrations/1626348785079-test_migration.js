
const utilHelper = require('../api/helpers/util');
const mongooseHelper = require('../api/helpers/mongoose');
mongooseHelper.loadModels();

async function up() {
  console.log('up()')

  await utilHelper.timeout(1000);

  console.log('migration completed successfully');
}

async function down() {
  console.log('down()');

  await utilHelper.timeout(1000);

  console.log('undo migration completed');
}

module.exports = { up, down };