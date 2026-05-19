const express = require('express');
const { z } = require('zod');
const { asyncHandler } = require('../http/asyncHandler');
const { requireAuth } = require('../http/auth');
const { createUserAccount, findOrCreateOAuthUser, getAccount, login } = require('../services/users');

const router = express.Router();

const registerSchema = z.object({
	email: z.string().email(),
	password: z.string().min(8),
	firstName: z.string().optional(),
	lastName: z.string().optional(),
	displayName: z.string().optional(),
	username: z.string().optional(),
	gender: z.string().optional(),
	dob: z.string().optional()
});

const loginSchema = z.object({
	email: z.string().email(),
	password: z.string().min(1)
});

const oauthSchema = z.object({
	provider: z.string().default('mixtape'),
	providerUserId: z.string().min(1).default('dev-user'),
	displayName: z.string().min(1).default('Mixtape Listener'),
	username: z.string().optional()
});

router.post('/register', asyncHandler(async (req, res) => {
	const input = registerSchema.parse(req.body);
	res.status(201).json(await createUserAccount(input));
}));

router.post('/login', asyncHandler(async (req, res) => {
	const input = loginSchema.parse(req.body);
	res.json(await login(input.email, input.password));
}));

router.post('/oauth/dev', asyncHandler(async (req, res) => {
	const input = oauthSchema.parse(req.body);
	res.json(await findOrCreateOAuthUser(input));
}));

router.get('/me', requireAuth, asyncHandler(async (req, res) => {
	res.json(await getAccount(req.userId));
}));

router.post('/logout', (req, res) => {
	res.json({ auth: false, token: null });
});

module.exports = router;
