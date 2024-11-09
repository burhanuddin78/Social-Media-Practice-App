const express = require('express');
const router = express.Router();
const ChatModel = require('../models/ChatModel');
const UserModel = require('../models/UserModel');
const authMiddleware = require('../middleware/authMiddleware');

//GET ALL CHATS

router.get('/', authMiddleware, async (req, res) => {
	try {
		const { userId } = req;

		const user = await ChatModel.findOne({ user: userId }).populate('chats.messagesWith');

		let chatsToSent = [];

		if (user.chats.length > 0) {
			chatsToSent = await user.chats.map((user) => ({
				messagesWith: user.messagesWith._id,
				name: user.messagesWith.name,
				profilePicUrl: user.messagesWith.profilePicUrl,
				lastMessage: user.messages[user.messages.length - 1].msg,
				date: user.messages[user.messages.length - 1].date,
			}));
		}

		return res.status(200).json(chatsToSent);
	} catch (error) {
		return res.status(500).send('Server Error');
	}
});

router.get('/user/:userId', authMiddleware, async (req, res) => {
	try {
		const user = await UserModel.findById(req.params.userId);

		if (!user) {
			return res.status(404).send('User not found');
		}
		return res.status(200).json({ name: user.name, profilePicUrl: user.profilePicUrl });
	} catch (error) {
		return res.status(500).send('Server Error');
	}
});
router.delete('/:messageWith', authMiddleware, async (req, res) => {
	try {
		const { messageWith } = req.params;
		const { userId } = req;

		const user = await ChatModel.findOne({ user: userId });

		if (!user) {
			return res.status(404).send('delete chat User not found');
		}

		const chatToDelete = user.chats.find((message) => message.messagesWith.toString() == messageWith);

		if (!chatToDelete) {
			return res.status(404).send('Chat not found');
		}

		user.chats = user.chats.filter((chat) => chat.messagesWith.toString() != messageWith);
		await user.save();

		return res.status(200).json('delete success');
	} catch (error) {
		return res.status(500).send('Server Error');
	}
});

module.exports = router;
