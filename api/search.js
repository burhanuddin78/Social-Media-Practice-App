const express = require('express');
const UserModel = require('../models/UserModel');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

router.get('/:searchText', authMiddleware, async (req, res) => {
	const { searchText } = req.params;

	if (searchText.length == 0) return;

	try {
		const results = await UserModel.find({ name: { $regex: searchText, $options: 'i' } });

		res.json(results);
	} catch (error) {
		console.log(error);
		return res.status(500).send('Server Error');
	}
});

module.exports = router;
