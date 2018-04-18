const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const passport = require('passport');

// Load Profile model
const Profile = require('../../models/Profile');
// Load User model
const User = require('../../models/User');

// @route GET api/profile/test
// @desc Tests profile route
// @access Public
router.get('/test', (req, res) =>
  res.json({
    msg: 'Profile works!'
  })
);

// @route GET api/profile
// @desc fetch profile route
// @access Private
router.get(
  '/',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    const errors = {};

    try {
      const profile = await Profile.findOne({ user: req.user.id });

      if (!profile) {
        errors.profile = 'No profile found for this user';
        return res.status(404).json(errors);
      }
    } catch (error) {
      res.status(404).json(error);
    }

    res.json(profile);
  }
);

module.exports = router;
