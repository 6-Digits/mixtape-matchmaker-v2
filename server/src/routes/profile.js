const express = require('express');
const { z } = require('zod');
const { asyncHandler } = require('../http/asyncHandler');
const { requireAuth } = require('../http/auth');
const {
	getPreferences,
	getProfile,
	updatePreferences,
	updateProfile
} = require('../services/users');
const {
	listNotifications,
	markNotificationRead
} = require('../services/notifications');

const router = express.Router();

const profileSchema = z.object({
	displayName: z.string().min(1).optional(),
	username: z.string().min(1).optional(),
	gender: z.string().optional().nullable(),
	dob: z.string().optional().nullable(),
	bio: z.string().optional().nullable(),
	imageUrl: z.string().optional().nullable(),
	email: z.string().email().optional(),
	allowNotifications: z.boolean().optional(),
	oldPassword: z.string().optional(),
	password: z.string().min(8).optional()
});

const preferencesSchema = z.object({
	gender: z.string().optional().nullable(),
	ageLower: z.number().int().min(18).optional(),
	ageUpper: z.number().int().min(18).optional(),
	location: z.string().optional().nullable(),
	latitude: z.number().optional().nullable(),
	longitude: z.number().optional().nullable()
});

router.get('/me', requireAuth, asyncHandler(async (req, res) => {
	res.json(await getProfile(req.userId));
}));

router.get('/id/:id', asyncHandler(async (req, res) => {
	res.json(await getProfile(req.params.id));
}));

router.patch('/me', requireAuth, asyncHandler(async (req, res) => {
	res.json(await updateProfile(req.userId, profileSchema.parse(req.body)));
}));

router.get('/preferences/me', requireAuth, asyncHandler(async (req, res) => {
	res.json(await getPreferences(req.userId));
}));

router.patch('/preferences/me', requireAuth, asyncHandler(async (req, res) => {
	res.json(await updatePreferences(req.userId, preferencesSchema.parse(req.body)));
}));

router.get('/notifications/me', requireAuth, asyncHandler(async (req, res) => {
	res.json(await listNotifications(req.userId));
}));

router.patch('/notifications/:id/read', requireAuth, asyncHandler(async (req, res) => {
	res.json(await markNotificationRead(req.userId, req.params.id));
}));

module.exports = router;
