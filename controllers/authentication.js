const jwt = require('jwt-simple');

const User = require('../models/User');
const jwtSecret = process.env.JWT_SECRET || 'randomstringassecret';

function tokenForUser(user) {
  const timestamp = new Date().getTime();
  return jwt.encode({ sub: user.id, iat: timestamp }, jwtSecret);
}

exports.signin = function(req, res, next) {
  const { email, joined } = req.user;
  res.send({
    token: tokenForUser(req.user),
    email,
    joined
  });
};

exports.signup = function(req, res, next) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(422).send({ error: 'Email and password required' });
  }

  User.findOne({ email }, function(err, existingUser) {
    if (err) {
      return next(err);
    }

    if (existingUser) {
      return res.status(422).send({ error: 'Duplicate Email' });
    }

    const user = new User({ email, password });
    user
      .save()
      .then(savedUser => {
        const { email, joined } = savedUser;
        res.json({
          token: tokenForUser(savedUser),
          email,
          joined
        });
      })
      .catch(err => next(err));
  });
};
