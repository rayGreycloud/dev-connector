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

// @route POST api/profile
// @desc Create user profile route
// @access Private
router.post(
  '/',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    // Initialize obj
    const profileFields = {
      social: {}
    };

    // Iterate thru request props
    for (const prop in req.body) {
      switch (prop) {
        // Split skills prop into array
        case 'skills':
          profileFields.skills = req.body.skills.split(',');
          break;
        // Set social object props
        case 'twitter':
        case 'facebook':
        case 'linkedin':
        case 'instagram':
        case 'youtube':
          profileFields.social[prop] = req.body[prop];
          break;
        // Set other profile props
        default:
          profileFields[prop] = req.body[prop];
      }
    }

    // Look for existing profile
    try {
      const profile = await Profile.findOne({ user: req.user.id });
    } catch (error) {
      res.status(404).json(error);
    }

    // Check if existing profile found
    if (profile) {
      // Update existing profile
      try {
        const updatedProfile = await Profile.findOneAndUpdate(
          { user: req.user.id },
          { $set: profileFields },
          { new: true }
        );

        res.json(updatedProfile);
      } catch (error) {
        res.status(404).json(error);
      }
    } else {
      // Save new profile
      try {
        const newProfile = await new Profile(profileFields).save();

        res.json(newProfile);
      } catch (error) {
        res.status(404).json(error);
      }
    }
  }
);

module.exports = router;
