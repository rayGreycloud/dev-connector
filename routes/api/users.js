const express = require('express');
const router = express.Router();
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const passport = require('passport');

const keys = require('../../config/keys');

// Load input validation
const validateRegisterInput = require('../../validation/register');
const validateLoginInput = require('../../validation/login');

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

// @route POST api/users/login
// @desc Login user route / Returning JWT token
// @access Public
router.post('/login', async (req, res) => {
  // Run validation on input
  const { errors, isValid } = validateLoginInput(req.body);
  // Check validation result
  if (!isValid) {
    return res.status(400).json(errors);
  }

  // Pull values off request
  const { email, password } = req.body;

  // Find user by email
  const user = await User.findOne({ email });

  // If none, send error msg
  if (!user) {
    errors.email = 'User not found';
    return res.status(404).json(errors);
  }

  // Check password
  const isMatch = await bcrypt.compare(password, user.password);

  // Check result and send appropriate msg
  if (isMatch) {
    // Create payload
    const payload = {
      id: user.id,
      name: user.name,
      avatar: user.avatar
    };

    // Sign token
    const token = jwt.sign(payload, keys.secretOrKey, { expiresIn: '1hr' });

    res.json({
      success: true,
      token: `Bearer ${token}`
    });
  } else {
    // If no match, send error message
    errors.password = 'Password incorrect';
    return res.status(400).json(errors);
  }
});

// @route POST api/users/register
// @desc Register users route
// @access Public
router.post('/register', async (req, res) => {
  // Run validation on input
  const { errors, isValid } = validateRegisterInput(req.body);
  // Check validation result
  if (!isValid) {
    return res.status(400).json(errors);
  }

  // Pull values off req
  const { name, email, password } = req.body;

  // Look for preexisting user
  const user = await User.findOne({ email });
  // If found, send error message
  if (user) {
    errors.email = 'Email already exists';

    return res.status(400).json(errors);
  } else {
    // If not, create new user
    const newUser = await createNewUser(name, email, password);

    // Save to DB
    try {
      const result = await newUser.save();
      res.json(result);
    } catch (err) {
      console.log(err);
    }
  }

  async function createNewUser(_name, _email, _password) {
    // Create avatar
    const avatar = gravatar.url(email, {
      s: '200', // size
      r: 'pg', // rating
      d: 'mm' // default
    });

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(_password, salt);

    // Create new user object
    const newUser = new User({
      name: _name,
      email: _email,
      avatar,
      password: hash
    });

    return newUser;
  }
});

// @route GET api/users/current
// @desc Return current user
// @access Private
router.get(
  '/current',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    const { id, name, email } = req.user;

    res.json({
      id,
      name,
      email
    });
  }
);

module.exports = router;
