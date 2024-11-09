const express = require('express');
const app = express();

const server = require('http').Server(app);
const { Server } = require('socket.io');

const next = require('next');

const dev = process.env.NODE_ENV !== 'production';

const nextApp = next({ dev });

const handle = nextApp.getRequestHandler();
require('dotenv').config({ path: './config.env' });
const connectDB = require('./utilsServer/connectDb');
const { addUser, findConnectedUser } = require('./utilsServer/roomAction');
const { loadMessage, sendMessage, setMsgToUnread, deleteMessage } = require('./utilsServer/messageActions');

const PORT = process.env.PORT || 3000;

app.use(express.json());
connectDB();

const io = new Server(server);

io.on('connection', (socket) => {
	console.log('Socket connection established');

	socket.on('join', async ({ userId }) => {
		const users = await addUser(userId, socket.id);

		setInterval(() => {
			socket.emit('connectedUsers', {
				users: users.filter((user) => user.userId !== userId),
			});
		}, 10000);
	});

	socket.on('loadMessage', async ({ userId, messagesWith }) => {
		const { chat, error } = await loadMessage(userId, messagesWith);

		if (!error) {
			socket.emit('messagesLoaded', { chat });
		} else {
			socket.emit('noChatFound');
		}
	});
	socket.on('sendNewMsg', async ({ userId, msgSendToUserId, msg }) => {
		const { error, newMessage } = await sendMessage(userId, msgSendToUserId, msg);

		const receiverSocket = findConnectedUser(msgSendToUserId);

		if (receiverSocket) {
			io.to(receiverSocket.socketId).emit('newMsgReceived', { newMessage });
		} else {
			await setMsgToUnread(msgSendToUserId);
		}

		if (!error) {
			socket.emit('msgSent', { newMessage });
		}
	});

	socket.on('deleteMsg', async ({ userId, messageWith, messageId }) => {
		const { success } = await deleteMessage(userId, messageWith, messageId);

		if (success) {
			socket.emit('msgDeleted');
		}
	});

	socket.emit('userDisconnected', () => {
		removeUser(socket.id);
	});
});

nextApp.prepare().then(() => {
	app.use('/api/signup', require('./api/signup'));
	app.use('/api/auth', require('./api/auth'));
	app.use('/api/search', require('./api/search'));
	app.use('/api/posts', require('./api/posts'));
	app.use('/api/profile', require('./api/profile'));
	app.use('/api/notifications', require('./api/notifications'));
	app.use('/api/chats', require('./api/chats'));

	app.all('*', (req, res) => {
		handle(req, res);
	});

	server.listen(PORT, (err) => {
		if (err) throw err;
		console.log('Express server running on ' + `http://localhost:${PORT}`);
	});
});
