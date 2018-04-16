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
  // Look for preexisting user
  User.findOne({ email: req.body.email }).then(user => {
    // If found, send error message
    if (user) {
      return res.status(400).json({ email: 'Email already exists' });
      // If not, create new user
    } else {
      // Create avatar
      const avatar = gravatar.url(req.body.email, {
        s: '200', // size
        r: 'pg', // rating
        d: 'mm' // default
      });

      // Create new user object
      const newUser = new User({
        name: req.body.name,
        email: req.body.email,
        avatar,
        password: req.body.password
      });

      // Hash password
      bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(newUser.password, salt, (err, hash) => {
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
