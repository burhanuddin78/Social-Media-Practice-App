const express = require('express');

const router = express.Router();

const UserModel = require('../models/UserModel');
const ProfileModel = require('../models/ProfileModel');
const FollowerModel = require('../models/FollowerModel');

const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const isEmail = require('validator/lib/isEmail');

const userPng = 'https://res.cloudinary.com/indersingh/image/upload/v1593464618/App/user_mklcpl.png';
const regexUserName = /^(?!.*\.\.)(?!.*\.$)[^\W][\w.]{0,29}$/;

router.get('/:username', async (req, res) => {
	const { username } = req.params;

	try {
		if (username.length < 1) return res.status(401).send('Invalid username');

		if (!regexUserName.test(username)) return res.status(401).send('Invalid username');

		const user = await UserModel.findOne({ username: username.toLowerCase() });

		if (user) return res.status(401).send('Username Already taken');

		return res.status(200).send('username_available');
	} catch (error) {
		console.log(error);
		return res.status(500).send('Server Error');
	}
});

router.post('/', async (req, res) => {
	const { name, username, email, password, profilePicUrl, bio, facebook, youtube, twitter, instagram } = req.body.user;

	if (!isEmail(email)) return res.status(401).send('Invalid email');
	if (password.length < 6) return res.status(401).send('password must be at least 6 characters');

	try {
		let user = await UserModel.findOne({ email: email.toLowerCase() });

		if (user) return res.status(401).send('User already exists');

		user = new UserModel({ username: username.toLowerCase(), email: email.toLowerCase(), name, profilePicUrl: profilePicUrl || userPng });
		user.password = await bcrypt.hash(password, 10);
		await user.save();

		let profileFields = {};

		profileFields.user = user._id;

		profileFields.bio = bio;

		profileFields.social = {};

		if (facebook) profileFields.social.facebook = facebook;
		if (youtube) profileFields.social.youtube = youtube;
		if (instagram) profileFields.social.instagram = instagram;
		if (twitter) profileFields.social.twitter = twitter;

		await new ProfileModel(profileFields).save();
		await new FollowerModel({ user: user._id, followers: [], following: [] }).save();

		const payload = {
			userId: user._id,
		};

		const token = await jwt.sign(payload, process.env.jwtSecret, { expiresIn: '2d' });

		res.status(200).json(token);
	} catch (error) {
		console.log(error);
		return res.status(500).send('Server Error');
	}
});

module.exports = router;
