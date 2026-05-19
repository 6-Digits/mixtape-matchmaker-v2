const express = require('express');
const { z } = require('zod');
const { asyncHandler } = require('../http/asyncHandler');
const { requireAuth } = require('../http/auth');
const {
	createMixtape,
	deleteMixtape,
	getMixtape,
	likeMixtape,
	listMixtapes,
	unlikeMixtape,
	updateMixtape
} = require('../services/mixtapes');

const router = express.Router();

const songSchema = z.object({
	id: z.string().uuid().optional(),
	provider: z.string().optional(),
	providerSongId: z.string().optional().nullable(),
	title: z.string().min(1),
	artist: z.string().optional().nullable(),
	url: z.string().optional().nullable(),
	imageUrl: z.string().optional().nullable(),
	durationSeconds: z.number().int().positive().optional().nullable(),
	metadata: z.record(z.string(), z.unknown()).optional()
});

const mixtapeSchema = z.object({
	name: z.string().min(1),
	description: z.string().optional(),
	isPublic: z.boolean().optional(),
	isMatchPlaylist: z.boolean().optional(),
	songs: z.array(songSchema).optional()
});

const mixtapeUpdateSchema = mixtapeSchema.partial();

router.get('/', asyncHandler(async (req, res) => {
	res.json(await listMixtapes({
		publicOnly: req.query.public !== 'false',
		query: req.query.q,
		sort: req.query.sort,
		limit: req.query.limit
	}));
}));

router.get('/mine', requireAuth, asyncHandler(async (req, res) => {
	res.json(await listMixtapes({ ownerId: req.userId, publicOnly: false, limit: req.query.limit || 100 }));
}));

router.get('/:id', asyncHandler(async (req, res) => {
	res.json(await getMixtape(req.params.id));
}));

router.post('/', requireAuth, asyncHandler(async (req, res) => {
	res.status(201).json(await createMixtape(req.userId, mixtapeSchema.parse(req.body)));
}));

router.patch('/:id', requireAuth, asyncHandler(async (req, res) => {
	res.json(await updateMixtape(req.userId, req.params.id, mixtapeUpdateSchema.parse(req.body)));
}));

router.delete('/:id', requireAuth, asyncHandler(async (req, res) => {
	res.json(await deleteMixtape(req.userId, req.params.id));
}));

router.post('/:id/like', requireAuth, asyncHandler(async (req, res) => {
	res.json(await likeMixtape(req.userId, req.params.id));
}));

router.delete('/:id/like', requireAuth, asyncHandler(async (req, res) => {
	res.json(await unlikeMixtape(req.userId, req.params.id));
}));

module.exports = router;
