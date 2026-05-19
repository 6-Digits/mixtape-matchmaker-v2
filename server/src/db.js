const knex = require('knex');
const knexConfig = require('../knexfile');
const { config } = require('./config');

const db = knex(knexConfig[config.nodeEnv] || knexConfig.development);

async function migrateLatest() {
	if (!config.runMigrations) {
		return;
	}

	await db.migrate.latest();
}

module.exports = { db, migrateLatest };
