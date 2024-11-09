import React, { useEffect, useRef, useState } from 'react';
import { parseCookies } from 'nookies';
import axios from 'axios';
import { Divider, Header, Segment, Grid, Comment } from 'semantic-ui-react';
import { useRouter } from 'next/router';
import ChatListSearch from '../components/Chats/ChatListSearch';
import Chat from '../components/Chats/Chat';
import baseUrl from '../utils/baseUrl';
import io from 'socket.io-client';
import { NoMessages } from '../components/Layout/NoData';
import Banner from '../components/Messages/Banner';
import Message from '../components/Messages/Message';
import MessageInputField from '../components/Messages/MessageInputField';
import getUserInfo from '../utils/getUserInfo';
import newMessageSound from '../utils/newMessageSound';
import cookie from 'js-cookie';

const scrollDivToBottom = (divRef) => {
	divRef.current !== null && divRef.current.scrollIntoView({ behavior: 'smooth' });
};

function Messages({ chatsData, user }) {
	const [chats, setChats] = useState(chatsData);
	const [connectedUsers, setConnectedUsers] = useState([]);
	const [messages, setMessages] = useState([]);
	const [bannerData, setBannerData] = useState({ name: '', profilePicUrl: '' });

	const router = useRouter();
	const socket = useRef();
	const divRef = useRef();

	// this ref is persisting the state of query string in url through re-renders.
	//This is the query string inside the url
	const openChatId = useRef('');

	//CONNECTION
	useEffect(() => {
		if (!socket.current) {
			socket.current = io(baseUrl);
		}

		if (socket.current) {
			socket.current.emit('join', { userId: user._id });

			socket.current.on('connectedUsers', ({ users }) => {
				users.length > 0 && setConnectedUsers(users);
			});

			if (chats.length > 0 && !router.query.message) {
				router.push(`/messages?message=${chats[0].messagesWith}`, undefined, {
					shallow: true,
				});
			}
		}

		return () => {
			if (socket.current) {
				socket.current.emit('userDisconnected');
				socket.current.off();
			}
		};
	}, []);

	//Load Message
	useEffect(() => {
		const loadMessage = () => {
			socket.current.emit('loadMessage', {
				userId: user._id,
				messagesWith: router.query.message,
			});

			socket.current.on('messagesLoaded', ({ chat }) => {
				if (chat && chat.messages) {
					setMessages(chat.messages);
					setBannerData({ name: chat.messagesWith.name, profilePicUrl: chat.messagesWith.profilePicUrl });
					openChatId.current = chat.messagesWith._id;
				}

				divRef.current && scrollDivToBottom(divRef);
			});

			socket.current.on('noChatFound', async () => {
				const user = await getUserInfo(router.query.message);
				setMessages([]);
				setBannerData(user);
				openChatId.current = router.query.message;
			});
		};

		if (socket.current && router.query.message) {
			loadMessage();
		}
	}, [router.query.message]);

	// Confirming message is sent and receiving it
	useEffect(() => {
		if (socket.current) {
			socket.current.on('msgSent', ({ newMessage }) => {
				if (newMessage.receiver == openChatId.current) {
					setMessages((prev) => [...prev, newMessage]);

					setChats((prev) => {
						const previousChat = prev.find((chat) => chat.messagesWith === newMessage.receiver);
						previousChat.lastMessage = newMessage.msg;
						previousChat.date = newMessage.date;
						return [...prev];
					});
				}
			});

			socket.current.on('newMsgReceived', async ({ newMessage }) => {
				let senderName;
				if (newMessage.sender == openChatId.current) {
					setMessages((prev) => [...prev, newMessage]);

					setChats((prev) => {
						const previousChat = prev.find((chat) => chat.messagesWith === newMessage.sender);
						previousChat.lastMessage = newMessage.msg;
						previousChat.date = newMessage.date;

						senderName = previousChat.name;
						return [...prev];
					});
				} else {
					const ifPreviouslyMessaged = chats.filter((chat) => chat.messagesWith === chat.sender).length > 0;

					if (ifPreviouslyMessaged) {
						setChats((prev) => {
							const previousChat = prev.find((chat) => chat.messagesWith === newMessage.sender);
							previousChat.lastMessage = newMessage.msg;
							previousChat.date = newMessage.date;
							senderName = previousChat.name;
							return [...prev];
						});
					} else {
						const { name, profilePicUrl } = await getUserInfo(newMessage.sender);
						senderName = name;
						const newChat = {
							messagesWith: newMessage.sender,
							name,
							profilePicUrl,
							lastMessage: newMessage.msg,
							date: newMessage.date,
						};

						setChats((prev) => [newChat, ...prev]);
					}
				}
				newMessageSound(senderName);
			});
		}
	}, []);

	useEffect(() => {
		messages.length > 0 && scrollDivToBottom(divRef);
	}, [messages]);

	const handleSendMessage = (msg) => {
		if (socket.current) {
			socket.current.emit('sendNewMsg', {
				userId: user._id,
				msgSendToUserId: openChatId.current,
				msg,
			});
		}
	};

	const handleDeleteChat = async (messageWith) => {
		try {
			const res = await axios.delete(`${baseUrl}/api/chats/${messageWith}`, {
				headers: {
					Authorization: cookie.get('token'),
				},
			});

			setChats((prev) => prev.messageWith != messageWith);

			router.push('/messages', undefined, { shallow: true });
		} catch (error) {
			console.log(error);
		}
	};

	const handleDeleteMessage = (messageId) => {
		if (socket.current) {
			socket.current.emit('deleteMsg', {
				userId: user._id,
				messageWith: openChatId.current,
				messageId: messageId,
			});

			socket.current.on('msgDeleted', () => {
				setMessages((prev) => prev.filter((msg) => msg._id != messageId));
			});
		}
	};
	return (
		<>
			<Segment
				padded
				size='large'
				style={{ marginTop: '5px' }}>
				<Header
					icon='home'
					content='Go Back'
					onClick={() => router.push('/')}
					style={{ cursor: 'pointer' }}
				/>
				<Divider hidden />
				<div style={{ marginBottom: '10px' }}>
					<ChatListSearch
						user={user}
						chats={chats}
						setChats={setChats}
					/>
				</div>

				{chats.length > 0 ? (
					<>
						<Grid stackable>
							<Grid.Column width={4}>
								<Comment.Group size='big'>
									<Segment
										raised
										style={{ overflow: 'auto', maxHeight: '32rem' }}>
										{chats.map((chat, i) => (
											<Chat
												key={i}
												connectedUsers={connectedUsers}
												chat={chat}
												setChats={setChats}
												handleDeleteChat={handleDeleteChat}
											/>
										))}
									</Segment>
								</Comment.Group>
							</Grid.Column>
							<Grid.Column width={12}>
								{router.query.message && (
									<>
										<div style={{ overflow: 'auto', overflowX: 'hidden', maxHeight: '35rem', height: '35rem', backgroundColor: 'whitesmoke' }}>
											<>
												<div style={{ position: 'sticky', top: '0' }}>
													<Banner bannerData={bannerData} />
												</div>
												{messages.length > 0 && (
													<>
														{messages.map((message, i) => (
															<Message
																divRef={divRef}
																bannerProfilePic={bannerData.profilePicUrl}
																key={i}
																message={message}
																user={user}
																deleteMessage={handleDeleteMessage}
															/>
														))}
													</>
												)}
											</>
										</div>

										<MessageInputField sendMsg={handleSendMessage} />
									</>
								)}
							</Grid.Column>
						</Grid>
					</>
				) : (
					<>
						<NoMessages />
					</>
				)}
			</Segment>
		</>
	);
}

Messages.getInitialProps = async (ctx) => {
	try {
		const { token } = parseCookies(ctx);
		const res = await axios.get(`${baseUrl}/api/chats`, {
			headers: { Authorization: token },
		});
		return { chatsData: res.data || [] };
	} catch (error) {
		return { errorLoading: true };
	}
};
export default Messages;
