// create and fetch the users profile
// (location, bio, experiences, education, social network links)
// Profile model and User's model

//-----------> Installed Dependencies-------------->
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const passport = require('passport');

//-------------------> Load Profile Model----------------->
const Profile = require('../../models/Profile');

//-------------------> Load User Profile------------------>
const User = require('../../models/User');

//--------------------> Our Routes------------------------->
// @route   GET: api/profile/test
// @desc    Tests profile route
// @access  Public
router.get('/test', (req, res) =>
	res.json({
		msg: 'Profile Works!',
	})
);

// ---------------> Get Current User Profile Route -------------->
// @route   GET: api/profile
// @desc    Get Current User Profile
// @access  Private
router.get(
	'/',
	passport.authenticate('jwt', {
		session: false,
	}),
	(req, res) => {
		const errors = {};

		Profile.findOne({
			user: req.user.id,
		})
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

// ---------------> POST/ Create or Edit New User Profile --------------------->
// @route   POST: api/profile
// @desc    Create or Edit User Profile
// @access  Private
router.post(
	'/',
	passport.authenticate('jwt', {
		session: false,
	}),
	(req, res) => {
		// Get Fileds ------------------------------->
		const profileFields = {};
		profileFields.user = req.user.id;
		if (req.body.handle) profileFields.handle = req.body.handle;
		if (req.body.company) profileFields.company = req.body.company;
		if (req.body.website) profileFields.website = req.body.website;
		if (req.body.location) profileFields.location = req.body.location;
		if (req.body.bio) profileFields.bio = req.body.bio;
		if (req.body.status) profileFields.status = req.body.status;
		if (req.body.githubusername) profileFields.githubusername = req.body.githubusername;

		// Skills - Split inito an array ------------------>
		if (typeof req.body.skills !== 'undefined') {
			profileFields.skills = req.body.skills.split(',');
		}

		// Social Media Connections ----------------------->
		profileFields.social = {};
		if (req.body.youtube) profileFields.social.youtube = req.body.youtube;
		if (req.body.twitter) profileFields.social.twitter = req.body.twitter;
		if (req.body.facebook) profileFields.social.facebook = req.body.facebook;
		if (req.body.linkedin) profileFields.social.linkedin = req.body.linkedin;
		if (req.body.instagram) profileFields.social.instagram = req.body.instagram;

		// Search for the user using the user-id ------------------------>
		Profile.findOne({ user: req.user.id }).then(profile => {
			if (profile) {
				// Update (if they have a profile we update using the below code) ----------------------->
				Profile.findOneAndUpdate({ user: req.user.id }, { $set: profileFields }, { new: true }).then(profile => res.json(profile));
			} else {
				// Check if handle w/ same name exists: Throw an err if the handle name exists; ----------------->
				Profile.findOne({ handle: profileFields.handle }).then(profile => {
					if (profile) {
						errors.handle = "That handle already exisits";
						res.status(400).json(errors);
					}

					// Create the new handle/ user profile if the handle name is NOT found; --------------------------->
					// Save New Profile ------------------------------------------------------------------------------->
					new Profile(profileFields).save().then(profile => res.json(profile))
				});
			}
		});
	}
);

module.exports = router;
