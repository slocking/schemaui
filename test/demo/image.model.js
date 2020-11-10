const _           = require('lodash');
const mongoose    = require('mongoose');
const { Schema }  = mongoose;
const randStr     = () => String(_.random(1000, 9999));

const dimensionsSchema = new Schema({
    width: Number,
    height: Number
})

const imageSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    dimensions: {
        type: dimensionsSchema
    },
    embeddedDimensions: [dimensionsSchema]
}, {
  collection: 'images'
});

imageSchema.statics.newImage = function () {
  return new this({
    title: `image_${randStr()}`
  })
};

const Image = mongoose.model('Images', imageSchema);

module.exports = Image;
