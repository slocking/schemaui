const _           = require('lodash');
const mongoose    = require('mongoose');
const { Schema }  = mongoose;
const randStr     = () => String(_.random(1000, 9999));


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
    hobbies: [String],
    dates: {
        lastActive: {
            type: Date
        }
    }
}, {
  collection: 'users'
});

userSchema.statics.newUser = function () {
  return new this({
    email: `user_${randStr()}@example.com`,
    firstName: 'first_' + randStr(),
    lastName: 'last_' + randStr(),
    isActive: (1 === _.random(0,1)),
    hobbies: [
        'hobbie_' + randStr(),
        'hobbie_' + randStr(),
        'hobbie_' + randStr(),
        'hobbie_' + randStr(),
        'hobbie_' + randStr()
    ]
  })
};

const User = mongoose.model('Users', userSchema);

module.exports = User;
