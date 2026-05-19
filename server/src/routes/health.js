const express = require('express');
const { db } = require('../db');
const { asyncHandler } = require('../http/asyncHandler');

const router = express.Router();

router.get('/', asyncHandler(async (req, res) => {
	await db.raw('select 1');
	res.json({ ok: true });
}));

module.exports = router;
