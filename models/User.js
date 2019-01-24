const mongoose = require('mongoose');
const bcrypt = require('bcrypt-nodejs');
const moment = require('moment');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    unique: true,
    lowercase: true,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  joined: {
    type: String,
    default: moment().format()
  }
});

userSchema.pre('save', function(next) {
  const user = this;

  bcrypt.genSalt(10, (saltErr, salt) => {
    if (saltErr) {
      return next(saltErr);
    }

    bcrypt.hash(user.password, salt, null, (hashErr, hash) => {
      if (hashErr) {
        return next(hashErr);
      }

      user.password = hash;
      next();
    });
  });
});

userSchema.methods.comparePassword = function(candidatePassword, callback) {
  bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
    if (err) {
      return callback(err);
    }
    callback(null, isMatch);
  });
};

const User = mongoose.model('User', userSchema);

module.exports = User;
