const mongoose = require('mongoose');
const { Schema } = mongoose;

const userSchema = new Schema({
  email: {
    type: String,
    required: true
  },
  firstName: String,
  lastName: String,
  isActive: {
    type: Boolean,
    default: true
  },
  hobbies: [String]
}, {
  collection: 'users'
});

const User = mongoose.model('Users', userSchema);

module.exports = User;
