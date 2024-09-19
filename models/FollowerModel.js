const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const FollowerSchema = new Schema({
	user: {
		type: Schema.Types.ObjectId,
		required: true,
		ref: 'User',
	},

	followers: [
		{
			user: { type: Schema.Types.ObjectId },
		},
	],

	following: [
		{
			user: { type: Schema.Types.ObjectId },
		},
	],
});
module.exports = mongoose.model('Follower', FollowerSchema);
