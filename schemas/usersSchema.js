const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  nickname: {
    type: String,
    // required: true,
  },
  hashedPassword: {
    type: String,
    // required: true,
  },
  email: {
    type: String,
    // required: true,
  },
  userImage: {
    type: String,
  },
});

UserSchema.virtual('userId').get(function () {
  return this._id.toHexString();
});
UserSchema.set('toJSON', {
  virtuals: true,
});
module.exports = mongoose.model('User', UserSchema);
