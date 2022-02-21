const SchemaUI = require('./helpers');
/**
 * SchemaUI class
 * @type {SchemaUI}
 */
const schemaUi = new SchemaUI();
module.exports = schemaUi;
exports.SchemaUI = schemaUi;
exports.adapters = require('./adapters');