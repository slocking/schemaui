const mongoose    = require('mongoose');
const { Schema }  = mongoose;

const versionSchema = new Schema({
    number: Number
}, {
  collection: 'versions'
});

const Version = mongoose.model('Versions', versionSchema);

module.exports = Version;
