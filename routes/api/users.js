const express = require('express');
const router = express.Router();
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const keys = require('../../config/keys');

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
  // Pull values off request
  const { email, password } = req.body;

  // Find user by email
  const user = await User.findOne({ email });

  // If none, send error msg
  if (!user) {
    return res.status(404).json({ email: 'User not found' });
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
    return res.status(400).json({ password: 'Password incorrect' });
  }
});

// @route POST api/users/register
// @desc Register users route
// @access Public
router.post('/register', async (req, res) => {
  // Pull values off req
  const { name, email, password } = req.body;

  const createNewUser = async (_name, _email, _password) => {
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
  };

  // Look for preexisting user
  const user = await User.findOne({ email });

  // If found, send error message
  if (user) {
    console.log(user);
    return res.status(400).json({
      email: 'Email already exists'
    });
  }

  // If not, create new user
  const newUser = await createNewUser(name, email, password);

  // Save to DB
  try {
    const result = await newUser.save();
    res.json(result);
  } catch (err) {
    console.log(err);
  }
});

module.exports = router;
