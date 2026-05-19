const http = require('node:http');
const { Server } = require('socket.io');
const { createApp } = require('./app');
const { config } = require('./config');
const { db, migrateLatest } = require('./db');
const { attachRealtime } = require('./realtime');

async function start() {
	await migrateLatest();

	const app = createApp();
	const server = http.createServer(app);
	const io = new Server(server, {
		cors: {
			origin: config.clientOrigin,
			methods: ['GET', 'POST']
		}
	});

	attachRealtime(io);

	server.listen(config.port, () => {
		console.log(`Mixtape Matchmaker API listening on ${config.port}`);
	});

	let shuttingDown = false;
	async function shutdown() {
		if (shuttingDown) {
			return;
		}
		shuttingDown = true;
		console.log('Shutting down server...');
		server.close();
		await db.destroy();
		process.exit(0);
	}

	process.on('SIGINT', shutdown);
	process.on('SIGTERM', shutdown);
}

if (require.main === module) {
	start().catch((error) => {
		console.error(error);
		process.exit(1);
	});
}

module.exports = { start };
