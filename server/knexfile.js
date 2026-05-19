require('dotenv').config();

const path = require('node:path');
const fs = require('node:fs');

function parseDatabaseUrl(rawUrl = process.env.DATABASE_URL) {
	const databaseUrl = rawUrl || 'sqlite://./data/mixtape-matchmaker.sqlite';
	const isMySql = databaseUrl.startsWith('mysql://') || databaseUrl.startsWith('mysql2://');

	if (isMySql) {
		return {
			client: 'mysql2',
			connection: databaseUrl.replace(/^mysql2:\/\//, 'mysql://'),
			pool: { min: 0, max: 10 }
		};
	}

	if (databaseUrl.startsWith('sqlite://')) {
		const filename = databaseUrl.replace('sqlite://', '');
		const resolvedFilename = path.resolve(__dirname, filename);
		fs.mkdirSync(path.dirname(resolvedFilename), { recursive: true });
		return {
			client: 'better-sqlite3',
			connection: {
				filename: resolvedFilename
			},
			useNullAsDefault: true,
			pool: {
				afterCreate(connection, done) {
					connection.pragma('foreign_keys = ON');
					done(null, connection);
				}
			}
		};
	}

	throw new Error('DATABASE_URL must start with sqlite://, mysql://, or mysql2://');
}

module.exports = {
	development: {
		...parseDatabaseUrl(),
		migrations: {
			directory: path.join(__dirname, 'migrations')
		}
	},
	production: {
		...parseDatabaseUrl(),
		migrations: {
			directory: path.join(__dirname, 'migrations')
		}
	}
};

module.exports.parseDatabaseUrl = parseDatabaseUrl;
