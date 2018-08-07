const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const passport = require('passport');
// load profile model
const Post = require('../../models/Post');
const Profile = require('../../models/Profile');
// Load Validation
const validatePostInput = require('../../validation/post');

// @route GET api/posts/test
// @desc Tests post route
// @access Public
router.get('/test', (req, res) => res.json({ msg: 'posts works' }));

// @route get api/posts
// @desc get all posts
// @access public
router.get('/', (req, res) => {
    Post.find()
        .sort({ date: -1 })
        .then(posts => res.json(posts))
        .catch(err => res.status(404));
});
// @route get api/posts/:id
// @desc get  post by id
// @access public
router.get('/:id', (req, res) => {
    Post.findById(req.params.id)
        .then(post => res.json(post))
        .catch(err => res.status(404));
});
// @route Post api/posts
// @desc Create post 
// @access Private
router.post('/', passport.authenticate('jwt', { session: false }), (req, res) => {
    const { errors, isValid } = validatePostInput(req.body);
    if (!isValid) {
        return res.status(400).json(errors);
    }
    const newPost = new Post({
        text: req.body.text,
        name: req.body.name,
        avatar: req.body.avatar,
        user: req.body.id
    });
    newPost.save().then(post => res.json(post));
});
// @route   DELETE api/posts/:id
// @desc    Delete post
// @access  Private
router.delete(
    '/:id',
    passport.authenticate('jwt', { session: false }),
    (req, res) => {
        Profile.findOne({ user: req.user.id }).then(profile => {
            Post.findById(req.params.id)
                .then(post => {
                    // Check for post owner
                    if (post.user.toString() !== req.user.id) {
                        return res
                            .status(401)
                            .json({ notauthorized: 'User not authorized' });
                    }

                    // Delete
                    post.remove().then(() => res.json({ success: true }));
                })
                .catch(err => res.status(404).json({ postnotfound: 'No post found' }));
        });
    }
);
// @route   Post api/posts/like/:id
// @desc    like post
// @access  Private
router.post(
    '/like/:id',
    passport.authenticate('jwt', { session: false }),
    (req, res) => {
        Profile.findOne({ user: req.user.id }).then(profile => {
            Post.findById(req.params.id)
                .then(post => {
                    if (post.likes.filter(like => like.user.toString() === req.user.id).length > 0) {
                        return res.status(400).json({ alradylikes: 'iser already liked this post' });

                    }
                    post.likes.unshift({ user: req.user.id });
                    post.save().then(post => res.json(post));

                })
                .catch(err => res.status(404).json({ postnotfound: 'No post found' }));
        });
    }
);
// @route   post api/posts/unlike/:id
// @desc     unlike post
// @access  Private
router.post(
    '/unlike/:id',
    passport.authenticate('jwt', { session: false }),
    (req, res) => {
        Profile.findOne({ user: req.user.id }).then(profile => {
            Post.findById(req.params.id)
                .then(post => {
                    if (post.likes.filter(like => like.user.toString() === req.user.id).length === 0) {
                        return res.status(400).json({ norliked: 'you have not yet liked the post' });

                    }
                    // get remove imdex
                    const removedIndex = post.likes.map(
                        item => item.user.toString())
                        .indexOf(req.user.id);
                    //splice out of array
                    post.likes.splice(removedIndex, 1);
                    //save
                    post.save().then(post => res.json(post));


                })
                .catch(err => res.status(404).json({ postnotfound: 'No post found' }));
        });
    }
);
// @route   post api/posts/comment/:id
// @desc     add comment to a post
// @access  Private
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
                //add to comment array
                post.comments.unshift(newComment);
                //save
                post.save().then(post => res.json(post));
            }).catch(err => res.status(404).json({ postnotfound: 'No post found' }));
    }
);
// @route   delete api/posts/comment/:id/:comment_id
// @desc     deleete comment to a post
// @access  Private
router.delete(
    '/comment/:id/:comment_id',
    passport.authenticate('jwt', { session: false }),
    (req, res) => {
    
        Post.findById(req.params.id)
            .then(post => {
              if(post.comments.filter(comment=> comment._id.toString() ===req.params.comment_id)
              .length===0){
                  return res.status(404).json({comemntnotfound:'comment does not exist'});
              }
             // get remove imdex
             const removeIndex = post.comments.map(
                item => item._id.toString())
                .indexOf(req.params.comment_id);
            //splice out of array
            post.comments.splice(removeIndex, 1);
            //save
            post.save().then(post => res.json(post));
            })
            .catch(err => res.status(404).json({ postnotfound: 'No post found' }));
    }

);
module.exports = router;