const jwt = require('jsonwebtoken');
const { config } = require('../config');
const { unauthorized } = require('./errors');

function signToken(userId) {
	return jwt.sign({ id: userId }, config.jwtSecret, { expiresIn: '7d' });
}

function requireAuth(req, res, next) {
	const header = req.get('authorization') || '';
	const bearerToken = header.startsWith('Bearer ') ? header.slice(7) : null;
	const token = bearerToken || req.get('x-access-token');

	if (!token) {
		return next(unauthorized('No token provided.'));
	}

	try {
		const decoded = jwt.verify(token, config.jwtSecret);
		req.userId = decoded.id;
		return next();
	} catch (error) {
		return next(unauthorized('Failed to authenticate token.'));
	}
}

module.exports = { signToken, requireAuth };
