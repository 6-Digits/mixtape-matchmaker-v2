require('dotenv').config();

const config = {
	port: Number(process.env.PORT || 42069),
	clientOrigin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
	jwtSecret: process.env.KEY || process.env.JWT_SECRET || 'dev-only-change-me',
	runMigrations: process.env.RUN_MIGRATIONS !== 'false',
	nodeEnv: process.env.NODE_ENV || 'development'
};

module.exports = { config };
