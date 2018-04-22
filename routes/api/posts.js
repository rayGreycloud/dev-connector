const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const passport = require('passport');

const Post = require('../../models/Post');
const Profile = require('../../models/Profile');
const validatePostInput = require('../../validation/post');

// @route GET api/posts/test
// @desc Tests posts route
// @access Public
router.get('/test', (req, res) =>
  res.json({
    msg: 'Posts works!'
  })
);

// @route GET api/posts
// @desc get all posts route
// @access Public
router.get('/', (req, res) => {
  Post.find()
    .sort({ date: -1 })
    .then(posts => res.json(posts))
    .catch(err =>
      res.status(404).json({
        nopostsfound: 'No posts found'
      })
    );
});

// @route GET api/posts/:id
// @desc get post by id route
// @access Public
router.get('/:id', (req, res) => {
  Post.findById(req.params.id)
    .then(post => res.json(post))
    .catch(err =>
      res.status(404).json({
        nopostfound: 'No post found with that ID'
      })
    );
});

// @route POST api/posts
// @desc Create post route
// @access Private
router.post(
  '/',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
  const { errors, isValid } = validatePostInput(req.body);

  if (!isValid) {
    return res.status(400).json(errors);
  }

  const newPost = new Post({
    text: req.body.text,
    name: req.body.name,
    avatar: req.body.avatar,
    user: req.user.id
  });

  newPost.save().then(post => res.json(post));
});

// @route DELETE api/posts/:id
// @desc Delete post route
// @access Private
router.delete(
  '/:id',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
  Profile.findOne({ user: req.user.id }).then(profile => {
    Post.findById(req.params.id)
      .then(post => {
        if (post.user.toString() !== req.user.id) {
          return res
            .status(401)
            .json({ notauthorized: 'User not authorized' });
        }

        post.remove().then(() => res.json({ success: true }));
      })
      .catch(err => res.status(404).json({ postnotfound: 'No post found' }));
  });
});

// @route POST api/posts/like/:id
// @desc Like a post route
// @access Private
router.post(
  '/like/:id',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
  Profile.findOne({ user: req.user.id }).then(profile => {
    Post.findById(req.params.id)
      .then(post => {
        // Check if user already liked the post 
        // By filtering likes array by user id and checking array length
        // If > 0 then id in array and user already liked post
        if (post.likes.filter(like => like.user.toString() === req.user.id).length > 0) {
          return res.status(400).json({ alreadyliked: 'You already liked this post'});
        }
        // Add user id to likes array
        post.likes.unshift({ user: req.user.id });
        
        // Save to DB 
        post.save().then(post => res.json(post));
      })
      .catch(err => res.status(404).json({ postnotfound: 'No post found' }));
  });
});

// @route POST api/posts/unlike/:id
// @desc unLike a post route
// @access Private
router.post(
  '/unlike/:id',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
  Profile.findOne({ user: req.user.id }).then(profile => {
    Post.findById(req.params.id)
      .then(post => {
        // Check if user liked the post 
        // By filtering likes array by user id and checking array length
        // If 0 then hasn't liked post 
        if (post.likes.filter(like => like.user.toString() === req.user.id).length = 0) {
          return res.status(400).json({ notliked: 'You have not liked this post'});
        }
        // Get index of like to remove 
        const removeIndex = post.likes
          // create array of user ids 
          .map(item => item.user.toString())
          // get index of id that matches request
          .indexOf(req.user.id);
        
        // Splice out of array 
        post.likes.splice(removeIndex, 1);
        
        // Save to DB 
        post.save().then(post => res.json(post));
      })
      .catch(err => res.status(404).json({ postnotfound: 'No post found' }));
  });
});

// @route POST api/posts/comment/:id
// @desc Add comment to post route
// @access Private
router.post(
  '/comment/:id',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    const { errors, isValid } = validatePostInput(req.body);

    if (!isValid) {
      return res.status(400).json(errors);
    }    
    
  Post.findById(req.params.id)
    .then(post => {
      const newComment = {
        text: req.body.text,
        name: req.body.name,
        avatar: req.body.avatar,
        user: req.user.id
      }  
      
      post.comments.unshift(newComment);
      
      post.save().then(post => res.json(post))
    })
    .catch(err => res.status(404).json({ postnotfound: 'No post found' }));
});

// @route DELETE api/posts/comment/:id/:comment_id
// @desc Delete comment to post route
// @access Private
router.delete(
  '/comment/:id/:comment_id',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    
  Post.findById(req.params.id)
    .then(post => {
      if (post.comments.filter(
        comment => comment._id.toString() === req.params.comment_id
      ).length === 0) {
        return res.status(404).json({ commentnotfound: 'Comment not found' });
      }
      
      const removeIndex = post.comments 
        .map(comment => comment._id.toString())
        .indexOf(req.params.comment_id);
        
      post.comments.splice(removeIndex, 1);
      
      post.save().then(post => res.json(post));  
    })
    .catch(err => res.status(404).json({ postnotfound: 'No post found' }));
});

module.exports = router;
