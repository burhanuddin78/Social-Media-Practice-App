const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const UserModel = require('../models/UserModel');
const PostModel = require('../models/PostModel');
const FollowerModel = require('../models/FollowerModel');
const { newLikeNotification, removeLikeNotification, newCommentNotification, removeCommentNotification } = require('../utilsServer/notificationAction');
const ObjectId = mongoose.Types.ObjectId;
const uuid = require('uuid').v4;

// CREATE A POST

router.post('/', authMiddleware, async (req, res) => {
	const { text, location, picUrl } = req.body;

	if (text.length < 1) return res.status(401).send('Text must be atleast 1 character');

	try {
		const newPost = {
			user: req.userId,
			text,
		};
		if (location) newPost.location = location;
		if (picUrl) newPost.picUrl = picUrl;

		const post = await new PostModel(newPost).save();

		const postCreated = await PostModel.findById(post._id).populate('user');

		return res.json(postCreated);
	} catch (error) {
		console.error(error);
		return res.status(500).send(`Server error`);
	}
});

// GET ALL POSTS

router.get('/', authMiddleware, async (req, res) => {
	const { pageNumber } = req.query;

	const number = Number(pageNumber);
	const limit = 8;
	const skip = limit * (number - 1);
	const currentUser = ObjectId(req.userId);

	try {
		const posts = await FollowerModel.aggregate([
			{
				$match: {
					user: currentUser,
				},
			},
			{ $unwind: { path: '$following' } },
			{
				$addFields: {
					allUserIds: {
						$concatArrays: [[currentUser], ['$following.user']],
					},
				},
			},
			{
				$lookup: {
					from: 'posts',
					let: { userIds: '$allUserIds' },
					pipeline: [
						{
							$match: {
								$expr: {
									$in: ['$user', '$$userIds'],
								},
							},
						},
						{
							$project: {
								text: 1,
								user: 1,
								location: 1,
								picUrl: 1,
								likes: 1,
								comments: 1,
								createdAt: 1,
							},
						},
					],
					as: 'posts',
				},
			},
			{ $unwind: { path: '$posts' } },
			{
				$lookup: {
					from: 'users',
					let: { userId: '$posts.user' },
					pipeline: [
						{
							$match: {
								$expr: { $eq: ['$_id', '$$userId'] },
							},
						},
						{
							$project: {
								username: 1,
								name: 1,
								profilePicUrl: 1,
							},
						},
					],
					as: 'posts.user',
				},
			},
			{
				$addFields: {
					'posts.user': {
						$arrayElemAt: ['$posts.user', 0],
					},
				},
			},
			{
				$lookup: {
					from: 'users',
					let: { user: '$posts.comments.user' },
					pipeline: [
						{
							$match: {
								$expr: { $in: ['$_id', '$$user'] },
							},
						},
						{
							$project: {
								username: 1,
								name: 1,
								profilePicUrl: 1,
							},
						},
					],
					as: 'posts.commentDetails',
				},
			},
			{
				$addFields: {
					'posts.comments': {
						$map: {
							input: '$posts.comments',
							as: 'comment',
							in: {
								$mergeObjects: [
									'$$comment',
									{
										user: {
											$arrayElemAt: [
												{
													$filter: {
														input: '$posts.commentDetails',
														as: 'userDetail',
														cond: {
															$eq: ['$$userDetail._id', '$$comment.user'],
														},
													},
												},
												0,
											],
										},
									},
								],
							},
						},
					},
				},
			},
			{ $unset: 'posts.commentDetails' },
			{ $replaceRoot: { newRoot: '$posts' } },
			{ $sort: { createdAt: -1 } },
			{ $skip: skip },
			{ $limit: limit },
		]);

		return res.json(posts);
	} catch (error) {
		console.error(error);
		return res.status(500).send(`Server error`);
	}
});

// GET POST BY ID

router.get('/:postId', authMiddleware, async (req, res) => {
	try {
		const post = await PostModel.findById(req.params.postId).populate('user').populate('comments.user');

		if (!post) {
			return res.status(404).send('Post not found');
		}

		return res.json(post);
	} catch (error) {
		console.error(error);
		return res.status(500).send(`Server error`);
	}
});

// DELETE POST

router.delete('/:postId', authMiddleware, async (req, res) => {
	try {
		const { userId } = req;

		const { postId } = req.params;

		const post = await PostModel.findById(postId);
		if (!post) {
			return res.status(404).send('post not found');
		}

		const user = await UserModel.findById(userId);

		if (post.user.toString() !== userId) {
			if (user.role === 'root') {
				await post.remove();
				return res.status(200).send('Post deleted Successfully');
			} else {
				return res.status(401).send('Unauthorized');
			}
		}

		await post.remove();
		return res.status(200).send('Post deleted Successfully');
	} catch (error) {
		console.error(error);
		return res.status(500).send(`Server error`);
	}
});

// LIKE A POST

router.post('/like/:postId', authMiddleware, async (req, res) => {
	try {
		const { postId } = req.params;
		const { userId } = req;

		const post = await PostModel.findById(postId);
		if (!post) {
			return res.status(404).send('No Post found');
		}

		const isLiked = post.likes.filter((like) => like.user.toString() === userId).length > 0;

		if (isLiked) {
			return res.status(401).send('Post already liked');
		}

		await post.likes.unshift({ user: userId });
		await post.save();

		if (post.user.toString() !== userId) {
			await newLikeNotification(userId, postId, post.user.toString());
		}

		return res.status(200).send('Post liked');
	} catch (error) {
		console.error(error);
		return res.status(500).send(`Server error`);
	}
});

// UNLIKE A POST

router.put('/unlike/:postId', authMiddleware, async (req, res) => {
	try {
		const { postId } = req.params;
		const { userId } = req;

		const post = await PostModel.findById(postId);
		if (!post) {
			return res.status(404).send('No Post found');
		}

		const isLiked = post.likes.filter((like) => like.user.toString() === userId).length === 0;

		if (isLiked) {
			return res.status(401).send('Post not liked before');
		}

		const index = post.likes.map((like) => like.user.toString()).indexOf(userId);

		await post.likes.splice(index, 1);

		await post.save();

		if (post.user.toString() !== userId) {
			await removeLikeNotification(userId, postId, post.user.toString());
		}

		return res.status(200).send('Post Unliked');
	} catch (error) {
		console.error(error);
		return res.status(500).send(`Server error`);
	}
});

// GET ALL LIKES OF A POST

router.get('/like/:postId', authMiddleware, async (req, res) => {
	try {
		const { postId } = req.params;

		const post = await PostModel.findById(postId).populate('likes.user');
		if (!post) {
			return res.status(404).send('No Post found');
		}

		return res.status(200).json(post.likes);
	} catch (error) {
		console.error(error);
		return res.status(500).send(`Server error`);
	}
});

// CREATE A COMMENT

router.post('/comment/:postId', authMiddleware, async (req, res) => {
	try {
		const { postId } = req.params;

		const { text } = req.body;
		const userId = req.userId;

		if (text.length < 1) return res.status(401).send('Comment should be atleast 1 character');

		const post = await PostModel.findById(postId);

		if (!post) return res.status(404).send('Post not found');

		const newComment = {
			_id: uuid(),
			text,
			user: userId,
			date: Date.now(),
		};

		await post.comments.unshift(newComment);
		await post.save();

		if (post.user.toString() !== userId) {
			await newCommentNotification(post._id, newComment._id, userId, post.user.toString(), text);
		}

		return res.status(200).json(newComment._id);
	} catch (error) {
		console.error(error);
		return res.status(500).send(`Server error`);
	}
});

// DELETE A COMMENT

router.delete('/:postId/:commentId', authMiddleware, async (req, res) => {
	try {
		const { postId, commentId } = req.params;
		const { userId } = req;

		const post = await PostModel.findById(postId);
		if (!post) return res.status(404).send('Post not found');

		const comment = post.comments.find((comment) => comment._id === commentId);
		if (!comment) {
			return res.status(404).send('No Comment found');
		}

		const user = await UserModel.findById(userId);

		const deleteComment = async () => {
			const indexOf = post.comments.map((comment) => comment._id).indexOf(commentId);

			await post.comments.splice(indexOf, 1);

			await post.save();

			if (post.user.toString() !== userId) {
				await removeCommentNotification(post._id, commentId, userId, post.user.toString());
			}

			return res.status(200).send('Deleted Successfully');
		};

		if (comment.user.toString() !== userId) {
			if (user.role === 'root') {
				await deleteComment();
			} else {
				return res.status(401).send('Unauthorized');
			}
		}

		await deleteComment();
	} catch (error) {
		console.error(error);
		return res.status(500).send(`Server error`);
	}
});

module.exports = router;
