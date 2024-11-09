const ChatModel = require('../models/ChatModel');
const UserModel = require('../models/UserModel');

const loadMessage = async (userId, messageWith) => {
	try {
		const user = await ChatModel.findOne({ user: userId }).populate('chats.messagesWith');

		const chat = user.chats.find((chat) => chat.messagesWith._id.toString() === messageWith);

		if (!chat) {
			return { error: 'No Chat found' };
		}

		return { chat };
	} catch (error) {
		return { error: error };
	}
};

const sendMessage = async (userId, messageSendToUserId, message) => {
	try {
		//LOGGED IN User (SENDER)
		const user = await ChatModel.findOne({ user: userId });

		const msgSendToUser = await ChatModel.findOne({ user: messageSendToUserId });

		const newMessage = {
			sender: userId,
			receiver: messageSendToUserId,
			msg: message,
			date: Date.now(),
		};

		const previousChat = await user.chats.find((chat) => chat.messagesWith.toString() === messageSendToUserId);

		if (previousChat) {
			previousChat.messages.push(newMessage);
			await user.save();
		} else {
			const newChat = {
				messagesWith: messageSendToUserId,
				messages: [newMessage],
			};

			user.chats.unshift(newChat);
			await user.save();
		}

		const previousChatForReceiver = await msgSendToUser.chats.find((chat) => chat.messagesWith.toString() === userId);

		if (previousChatForReceiver) {
			previousChatForReceiver.messages.push(newMessage);
			await msgSendToUser.save();
		} else {
			const newChat = {
				messagesWith: userId,
				messages: [newMessage],
			};

			msgSendToUser.chats.unshift(newChat);
			await msgSendToUser.save();
		}

		return { newMessage };
	} catch (error) {
		console.log(error);
		return { error: error };
	}
};

const setMsgToUnread = async (userId) => {
	try {
		const user = await UserModel.findById(userId);

		if (!user.unreadMessage) {
			user.unreadMessage = true;
			await user.save();
		}
		return;
	} catch (error) {
		console.log(error);
	}
};

const deleteMessage = async (userId, messageWith, messageId) => {
	try {
		const user = await ChatModel.findOne({ user: userId });
		const chat = user.chats.find((chat) => chat.messagesWith.toString() === messageWith);

		if (chat && chat.messages.length > 0) {
			chat.messages = await chat.messages.filter((message) => message._id.toString() !== messageId && message.sender.toString() == userId);

			await user.save();

			return { success: true };
		}
		return { success: false };
	} catch (error) {
		console.log(error);
		return { success: false };
	}
};

module.exports = { loadMessage, sendMessage, setMsgToUnread, deleteMessage };
