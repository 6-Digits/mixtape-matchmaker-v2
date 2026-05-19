const { db } = require('../db');
const { badRequest, notFound } = require('../http/errors');
const { newId } = require('../utils/ids');
const { mapMixtape, mapSong, serializeJson } = require('../utils/rows');

async function attachSongs(mixtape) {
	const songs = await db('mixtape_songs')
		.join('songs', 'songs.id', 'mixtape_songs.song_id')
		.where('mixtape_songs.mixtape_id', mixtape.id)
		.orderBy('mixtape_songs.position', 'asc')
		.select('songs.*', 'mixtape_songs.position');

	return { ...mixtape, songs: songs.map(mapSong) };
}

async function getMixtape(id) {
	const row = await db('mixtapes')
		.leftJoin('mixtape_likes', 'mixtape_likes.mixtape_id', 'mixtapes.id')
		.where('mixtapes.id', id)
		.groupBy('mixtapes.id')
		.select('mixtapes.*')
		.count({ like_count: 'mixtape_likes.user_id' })
		.first();

	if (!row) {
		throw notFound('No mixtape found.');
	}

	return attachSongs(mapMixtape(row));
}

async function listMixtapes(filters = {}) {
	const query = db('mixtapes')
		.leftJoin('mixtape_likes', 'mixtape_likes.mixtape_id', 'mixtapes.id')
		.groupBy('mixtapes.id')
		.select('mixtapes.*')
		.count({ like_count: 'mixtape_likes.user_id' })
		.orderBy(filters.sort === 'popular' ? 'views' : 'created_at', 'desc')
		.limit(Number(filters.limit || 20));

	if (filters.ownerId) {
		query.where('mixtapes.owner_id', filters.ownerId);
	}
	if (filters.publicOnly) {
		query.where('mixtapes.is_public', true).where('mixtapes.is_match_playlist', false);
	}
	if (filters.query) {
		query.where('mixtapes.name', 'like', `%${filters.query}%`);
	}

	const rows = await query;
	return Promise.all(rows.map((row) => attachSongs(mapMixtape(row))));
}

async function createOrUpdateSong(trx, song) {
	const provider = song.provider || 'manual';
	const providerSongId = song.providerSongId || null;

	if (providerSongId) {
		const existing = await trx('songs').where({ provider, provider_song_id: providerSongId }).first();
		if (existing) {
			return existing.id;
		}
	}

	const id = song.id || newId();
	await trx('songs').insert({
		id,
		provider,
		provider_song_id: providerSongId,
		title: song.title,
		artist: song.artist || null,
		url: song.url || null,
		image_url: song.imageUrl || null,
		duration_seconds: song.durationSeconds || null,
		metadata: serializeJson(song.metadata || {})
	});
	return id;
}

async function replaceMixtapeSongs(trx, mixtapeId, songInputs = []) {
	await trx('mixtape_songs').where({ mixtape_id: mixtapeId }).delete();

	let position = 0;
	for (const song of songInputs) {
		if (!song.title) {
			throw badRequest('Every song requires a title.');
		}
		const songId = await createOrUpdateSong(trx, song);
		await trx('mixtape_songs').insert({
			mixtape_id: mixtapeId,
			song_id: songId,
			position
		});
		position += 1;
	}
}

async function createMixtape(ownerId, input) {
	const id = newId();

	await db.transaction(async (trx) => {
		await trx('mixtapes').insert({
			id,
			owner_id: ownerId,
			name: input.name,
			description: input.description || '',
			is_public: Boolean(input.isPublic),
			is_match_playlist: Boolean(input.isMatchPlaylist)
		});
		await replaceMixtapeSongs(trx, id, input.songs || []);
	});

	return getMixtape(id);
}

async function updateMixtape(userId, id, input) {
	const mixtape = await db('mixtapes').where({ id }).first();
	if (!mixtape) {
		throw notFound('No mixtape found.');
	}
	if (mixtape.owner_id !== userId) {
		throw badRequest('Only the owner can update this mixtape.');
	}

	const update = {};
	if (input.name !== undefined) update.name = input.name;
	if (input.description !== undefined) update.description = input.description;
	if (input.isPublic !== undefined) update.is_public = Boolean(input.isPublic);
	if (input.isMatchPlaylist !== undefined) update.is_match_playlist = Boolean(input.isMatchPlaylist);

	await db.transaction(async (trx) => {
		if (Object.keys(update).length > 0) {
			update.updated_at = trx.fn.now();
			await trx('mixtapes').where({ id }).update(update);
		}
		if (input.songs) {
			await replaceMixtapeSongs(trx, id, input.songs);
		}
	});

	return getMixtape(id);
}

async function deleteMixtape(userId, id) {
	const deleted = await db('mixtapes').where({ id, owner_id: userId }).delete();
	if (!deleted) {
		throw notFound('No mixtape found.');
	}
	return { deleted: true };
}

async function likeMixtape(userId, mixtapeId) {
	await db('mixtape_likes').insert({ mixtape_id: mixtapeId, user_id: userId }).onConflict(['mixtape_id', 'user_id']).ignore();
	return getMixtape(mixtapeId);
}

async function unlikeMixtape(userId, mixtapeId) {
	await db('mixtape_likes').where({ mixtape_id: mixtapeId, user_id: userId }).delete();
	return getMixtape(mixtapeId);
}

module.exports = {
	createMixtape,
	deleteMixtape,
	getMixtape,
	likeMixtape,
	listMixtapes,
	unlikeMixtape,
	updateMixtape
};
