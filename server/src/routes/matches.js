const express = require('express');
const { z } = require('zod');
const { asyncHandler } = require('../http/asyncHandler');
const { requireAuth } = require('../http/auth');
const {
	createMessage,
	listCandidates,
	listChats,
	listMatches,
	listMessages,
	reactToProfile
} = require('../services/matches');

const router = express.Router();

const reactionSchema = z.object({
	userId: z.string().uuid(),
	reaction: z.enum(['like', 'dislike'])
});

const messageSchema = z.object({
	body: z.string().min(1)
});

router.get('/', requireAuth, asyncHandler(async (req, res) => {
	res.json(await listMatches(req.userId));
}));

router.get('/candidates', requireAuth, asyncHandler(async (req, res) => {
	res.json(await listCandidates(req.userId, req.query.limit || 20));
}));

router.post('/reactions', requireAuth, asyncHandler(async (req, res) => {
	const input = reactionSchema.parse(req.body);
	res.json(await reactToProfile(req.userId, input.userId, input.reaction));
}));

router.get('/chats', requireAuth, asyncHandler(async (req, res) => {
	res.json(await listChats(req.userId));
}));

router.get('/chats/:id/messages', requireAuth, asyncHandler(async (req, res) => {
	res.json(await listMessages(req.userId, req.params.id));
}));

router.post('/chats/:id/messages', requireAuth, asyncHandler(async (req, res) => {
	const input = messageSchema.parse(req.body);
	res.status(201).json(await createMessage(req.userId, req.params.id, input.body));
}));

module.exports = router;
