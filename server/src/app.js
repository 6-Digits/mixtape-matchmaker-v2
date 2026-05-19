const express = require('express');
const cors = require('cors');
const { ZodError } = require('zod');
const { config } = require('./config');
const accountRoutes = require('./routes/account');
const profileRoutes = require('./routes/profile');
const mixtapeRoutes = require('./routes/mixtapes');
const matchRoutes = require('./routes/matches');
const healthRoutes = require('./routes/health');
const { HttpError } = require('./http/errors');

function createApp() {
	const app = express();

	app.use(cors({ origin: config.clientOrigin }));
	app.use(express.json({ limit: '1mb' }));
	app.use(express.urlencoded({ extended: true }));

	app.use('/health', healthRoutes);
	app.use('/account', accountRoutes);
	app.use('/profile', profileRoutes);
	app.use('/mixtapes', mixtapeRoutes);
	app.use('/matches', matchRoutes);

	app.use((req, res) => {
		res.status(404).json({ message: 'Route not found' });
	});

	app.use((err, req, res, next) => {
		if (err instanceof ZodError) {
			return res.status(400).json({ message: 'Invalid request body', issues: err.issues });
		}
		if (err instanceof HttpError) {
			return res.status(err.status).json({ message: err.message });
		}

		console.error(err);
		return res.status(500).json({ message: 'Internal server error' });
	});

	return app;
}

module.exports = { createApp };
