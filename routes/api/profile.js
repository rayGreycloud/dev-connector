const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const passport = require('passport');

// Load Validation
const validateProfileInput = require('../../validation/profile');
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
  (req, res) => {
    const errors = {};

    Profile.findOne({ user: req.user.id })
      .populate('user', ['name', 'avatar'])
      .then(profile => {
        if (!profile) {
          errors.noprofile = 'There is no profile for this user';
          return res.status(404).json(errors);
        }
        res.json(profile);
      })
      .catch(err => res.status(404).json(err));
  }
);

// @route GET api/profile/all
// @desc Get all profiles route
// @access Public
router.get('/all', (req, res) => {
  const errors = {};
  
  Profile.find()
    .populate('user', ['name', 'avatar'])
    .then(profiles => {
      if (!profiles) {
        errors.noprofile = 'No profiles found';
        res.status(404).json(errors);
      }
      
      res.json(profiles);
    })
    .catch(err => res.status(404).json({ profile: 'No profiles found' }));
});

// @route GET api/profile/handle/:handle
// @desc Get profile by handle route
// @access Public
router.get('/handle/:handle', (req, res) => {
  const errors = {};
  
  Profile.findOne({ handle: req.params.handle })
    .populate('user', ['name', 'avatar'])
    .then(profile => {
      if (!profile) {
        errors.noprofile = 'No profile found for that handle';
        res.status(404).json(errors);
      }
      
      res.json(profile);
    })
    .catch(err => res.status(404).json(err));
});


// @route GET api/profile/user/:user_id
// @desc Get profile by user route
// @access Public
router.get('/user/:user_id', (req, res) => {
  const errors = {};
  
  Profile.findOne({ user: req.params.user_id })
    .populate('user', ['name', 'avatar'])
    .then(profile => {
      if (!profile) {
        errors.noprofile = 'No profile found for that user';
        res.status(404).json(errors);
      }
      
      res.json(profile);
    })
    .catch(err => res.status(404).json({ profile: 'No profile found for that user id'}));
});

// @route POST api/profile
// @desc Create user profile route
// @access Private
router.post(
  '/',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    // Validate inputs
    const { errors, isValid } = validateProfileInput(req.body);

    if (!isValid) {
      return res.status(400).json(errors);
    }

    // Initialize obj
    const profileFields = {
      social: {}
    };
    profileFields.user = req.user.id;

    // Iterate thru request props
    for (const prop in req.body) {
      switch (prop) {
        // Split skills prop into array
        case 'skills':
          let skills = req.body.skills.split(',');
          profileFields.skills = skills.map(skill => skill.trim());
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
    // Search by user for existing profile
    Profile.findOne({ user: req.user.id })
      .then(profile => {
        // If existing profile found, update it
        if (profile) {
          Profile.findOneAndUpdate(
            { user: req.user.id },
            { $set: profileFields },
            { new: true }
          )
          .then(profile => res.json(profile));
        } else {

          // Check if handle exists
          Profile.findOne({ handle: profileFields.handle }).then(profile => {
            if (profile) {
              errors.handle = 'That handle already exists';
              res.status(400).json(errors);
            }
            // Save Profile
            new Profile(profileFields).save().then(profile => res.json(profile));
            });
        }
    });
  }
);

module.exports = router;
