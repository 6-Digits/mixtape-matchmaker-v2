const text = (table, name, length = 255) => table.string(name, length);

async function up(knex) {
	await knex.schema.createTable('users', (table) => {
		table.uuid('id').primary();
		text(table, 'email', 320).notNullable().unique();
		table.string('password_hash', 255).notNullable();
		table.boolean('allow_notifications').notNullable().defaultTo(true);
		table.timestamps(true, true);
	});

	await knex.schema.createTable('profiles', (table) => {
		table.uuid('user_id').primary().references('id').inTable('users').onDelete('CASCADE');
		text(table, 'display_name').notNullable();
		text(table, 'username').notNullable().unique();
		text(table, 'gender', 80);
		table.date('dob');
		table.text('bio');
		table.text('image_url');
		table.timestamps(true, true);
	});

	await knex.schema.createTable('match_preferences', (table) => {
		table.uuid('user_id').primary().references('id').inTable('users').onDelete('CASCADE');
		text(table, 'gender', 80);
		table.integer('age_lower').notNullable().defaultTo(18);
		table.integer('age_upper').notNullable().defaultTo(120);
		text(table, 'location');
		table.decimal('latitude', 10, 7);
		table.decimal('longitude', 10, 7);
		table.timestamps(true, true);
	});

	await knex.schema.createTable('songs', (table) => {
		table.uuid('id').primary();
		text(table, 'provider', 80).notNullable().defaultTo('manual');
		text(table, 'provider_song_id');
		text(table, 'title').notNullable();
		text(table, 'artist');
		table.text('url');
		table.text('image_url');
		table.integer('duration_seconds');
		table.json('metadata');
		table.timestamps(true, true);
		table.unique(['provider', 'provider_song_id']);
	});

	await knex.schema.createTable('mixtapes', (table) => {
		table.uuid('id').primary();
		table.uuid('owner_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
		text(table, 'name').notNullable();
		table.text('description');
		table.boolean('is_public').notNullable().defaultTo(false);
		table.boolean('is_match_playlist').notNullable().defaultTo(false);
		table.integer('views').notNullable().defaultTo(0);
		table.timestamps(true, true);
		table.index(['owner_id']);
		table.index(['is_public']);
	});

	await knex.schema.createTable('mixtape_songs', (table) => {
		table.uuid('mixtape_id').notNullable().references('id').inTable('mixtapes').onDelete('CASCADE');
		table.uuid('song_id').notNullable().references('id').inTable('songs').onDelete('CASCADE');
		table.integer('position').notNullable();
		table.timestamps(true, true);
		table.primary(['mixtape_id', 'song_id']);
		table.unique(['mixtape_id', 'position']);
	});

	await knex.schema.createTable('mixtape_likes', (table) => {
		table.uuid('mixtape_id').notNullable().references('id').inTable('mixtapes').onDelete('CASCADE');
		table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
		table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
		table.primary(['mixtape_id', 'user_id']);
	});

	await knex.schema.createTable('comments', (table) => {
		table.uuid('id').primary();
		table.uuid('mixtape_id').notNullable().references('id').inTable('mixtapes').onDelete('CASCADE');
		table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
		table.text('body').notNullable();
		table.timestamps(true, true);
		table.index(['mixtape_id']);
	});

	await knex.schema.createTable('profile_reactions', (table) => {
		table.uuid('from_user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
		table.uuid('to_user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
		table.enu('reaction', ['like', 'dislike']).notNullable();
		table.timestamps(true, true);
		table.primary(['from_user_id', 'to_user_id']);
	});

	await knex.schema.createTable('matches', (table) => {
		table.uuid('id').primary();
		table.uuid('user_a_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
		table.uuid('user_b_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
		table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
		table.unique(['user_a_id', 'user_b_id']);
	});

	await knex.schema.createTable('chats', (table) => {
		table.uuid('id').primary();
		table.uuid('match_id').notNullable().unique().references('id').inTable('matches').onDelete('CASCADE');
		table.timestamps(true, true);
	});

	await knex.schema.createTable('messages', (table) => {
		table.uuid('id').primary();
		table.uuid('chat_id').notNullable().references('id').inTable('chats').onDelete('CASCADE');
		table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
		table.text('body').notNullable();
		table.timestamps(true, true);
		table.index(['chat_id', 'created_at']);
	});

	await knex.schema.createTable('notifications', (table) => {
		table.uuid('id').primary();
		table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
		table.text('message').notNullable();
		table.text('link');
		table.boolean('read').notNullable().defaultTo(false);
		table.timestamps(true, true);
		table.index(['user_id', 'read']);
	});
}

async function down(knex) {
	const tables = [
		'notifications',
		'messages',
		'chats',
		'matches',
		'profile_reactions',
		'comments',
		'mixtape_likes',
		'mixtape_songs',
		'mixtapes',
		'songs',
		'match_preferences',
		'profiles',
		'users'
	];

	for (const table of tables) {
		await knex.schema.dropTableIfExists(table);
	}
}

module.exports = { up, down };
