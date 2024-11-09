const express = require('express');

const router = express.Router();

const UserModel = require('../models/UserModel');
const FollowerModel = require('../models/FollowerModel');
const NotificationModel = require('../models/NotificationModel');

const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const isEmail = require('validator/lib/isEmail');
const authMiddleware = require('../middleware/authMiddleware');
const ChatModel = require('../models/ChatModel');

router.get('/', authMiddleware, async (req, res, next) => {
	const { userId } = req;

	try {
		const user = await UserModel.findById(userId);

		const userFollowStats = await FollowerModel.findOne({ user: userId });

		return res.status(200).send({ user, userFollowStats });
	} catch (error) {
		return res.status(500).send('Server Error');
	}
});

router.post('/', async (req, res) => {
	const { email, password } = req.body.user;

	if (!isEmail(email)) return res.status(401).send('Invalid email');
	if (password.length < 6) return res.status(401).send('password must be at least 6 characters');

	try {
		let user = await UserModel.findOne({ email: email.toLowerCase() }).select('+password');

		if (!user) return res.status(401).send('Invalid Credentials');

		const isPassword = bcrypt.compare(password, user.password);

		if (!isPassword) return res.status(401).send('Invalid Password');

		const payload = {
			userId: user._id,
		};

		const chatModel = await ChatModel.findOne({ user: user._id });
		if (!chatModel) {
			await new ChatModel({ user: user._id, notifications: [] }).save();
		}

		const token = await jwt.sign(payload, process.env.jwtSecret, { expiresIn: '2d' });

		res.status(200).json(token);
	} catch (error) {
		console.log(error);
		return res.status(500).send('Server Error');
	}
});

module.exports = router;
