const express = require('express');
const router = express.Router();
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');

// Load User model
const User = require('../../models/User');

// @route GET api/users/test
// @desc Tests users route
// @access Public
router.get('/test', (req, res) =>
  res.json({
    msg: 'Users works!'
  })
);

// @route [POST api/users/register
// @desc Register users route
// @access Public
router.post('/register', (req, res) => {
  // Pull values off req
  const { name, email, password } = req.body;

  // Look for preexisting user
  User.findOne({ email }).then(user => {
    // If found, send error message
    if (user) {
      return res.status(400).json({ email: 'Email already exists' });
      // If not, create new user
    } else {
      // Create avatar
      const avatar = gravatar.url(email, {
        s: '200', // size
        r: 'pg', // rating
        d: 'mm' // default
      });

      // Create new user object
      const newUser = new User({
        name,
        email,
        avatar,
        password
      });

      // Hash password
      bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(password, salt, (err, hash) => {
          if (err) throw err;
          newUser.password = hash;

          // Save new user
          newUser
            .save()
            .then(user => res.json(user))
            .catch(err => console.log(err));
        });
      });
    }
  });
});

module.exports = router;
