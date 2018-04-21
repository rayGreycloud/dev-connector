const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const passport = require('passport');

// Load Validation
const validateProfileInput = require('../../validation/profile');
const validateExperienceInput = require('../../validation/experience');
const validateEducationInput = require('../../validation/education');
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
});

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
});

// @route POST api/profile/experience
// @desc Create user profile route
// @access Private
router.post(
  '/experience',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
  // Validate inputs
  const { errors, isValid } = validateExperienceInput(req.body);

  if (!isValid) {
    return res.status(400).json(errors);
  }    
  
  Profile.findOne({ user: req.user.id })
    .then(profile => {
      const newExp = {
        title: req.body.title,
        company: req.body.company,
        location: req.body.location,
        from: req.body.from,
        to: req.body.to,
        current: req.body.current,
        description: req.body.description
      }
      
      profile.experience.unshift(newExp);
      
      profile.save().then(profile => res.json(profile));
    });
});

// @route POST api/profile/education
// @desc Create user profile route
// @access Private
router.post(
  '/education',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
  // Validate inputs
  const { errors, isValid } = validateEducationInput(req.body);

  if (!isValid) {
    return res.status(400).json(errors);
  }    
  
  Profile.findOne({ user: req.user.id })
    .then(profile => {
      const newEd = {
        school: req.body.school,
        degree: req.body.degree,
        fieldofstudy: req.body.fieldofstudy,
        from: req.body.from,
        to: req.body.to,
        current: req.body.current,
        description: req.body.description
      }
      
      profile.education.unshift(newEd);
      
      profile.save().then(profile => res.json(profile));
    });
});

// @route DELETE api/profile/experience/:exp_id
// @desc Delete experience from profile route
// @access Private
router.delete(
  '/experience/:exp_id',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    
  // Get user profile
  Profile.findOne({ user: req.user.id })
    .then(profile => {
      // get index of experience to remove
      const removeIndex = profile.experience
        // get array of ids  
        .map(item => item.id)
        // get index of id that matches param
        .indexOf(req.params.exp_id);
      // remove item from array 
      profile.experience.splice(removeIndex, 1);
      // re-save profile
      profile.save().then(profile => res.json(profile))
      .catch(err => res.status(404).json(err));
    });
});

// @route DELETE api/profile/education/:edu_id
// @desc Delete education from profile route
// @access Private
router.delete(
  '/education/:edu_id',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    
  // Get user profile
  Profile.findOne({ user: req.user.id })
    .then(profile => {
      // get index of education to remove
      const removeIndex = profile.education
        // get array of ids  
        .map(item => item.id)
        // get index of id that matches param
        .indexOf(req.params.edu_id);
      // remove item from array 
      profile.education.splice(removeIndex, 1);
      // re-save profile
      profile.save().then(profile => res.json(profile))
      .catch(err => res.status(404).json(err));
    });
});

// @route DELETE api/profile
// @desc Delete user and profile route
// @access Private
router.delete(
  '/',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    
  // Get user profile
  Profile.findOneAndRemove({ user: req.user.id })
    .then(() => {
      User.findOneAndRemove({ _id: req.user.id })
        .then(() => res.json({ success: true }));
    });
});

module.exports = router;
