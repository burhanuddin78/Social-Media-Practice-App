const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
	try {
		if (!req.headers.authorization) {
			return res.status(401).send('Unauthorized access');
		}

		const { userId } = jwt.verify(req.headers.authorization, process.env.jwtSecret);

		req.userId = userId;

		next();
	} catch (error) {
		return res.status(401).send('Unauthorized access');
	}
};
