function toBoolean(value) {
	return Boolean(Number(value));
}

function parseJson(value, fallback = null) {
	if (value == null) {
		return fallback;
	}
	if (typeof value !== 'string') {
		return value;
	}
	try {
		return JSON.parse(value);
	} catch {
		return fallback;
	}
}

function serializeJson(value) {
	return value == null ? null : JSON.stringify(value);
}

function mapUser(row) {
	if (!row) {
		return null;
	}
	return {
		id: row.id,
		email: row.email,
		allowNotifications: toBoolean(row.allow_notifications),
		createdAt: row.created_at,
		updatedAt: row.updated_at
	};
}

function mapProfile(row) {
	if (!row) {
		return null;
	}
	return {
		userId: row.user_id,
		displayName: row.display_name,
		username: row.username,
		gender: row.gender,
		dob: row.dob,
		bio: row.bio,
		imageUrl: row.image_url,
		createdAt: row.created_at,
		updatedAt: row.updated_at
	};
}

function mapMixtape(row) {
	if (!row) {
		return null;
	}
	return {
		id: row.id,
		ownerId: row.owner_id,
		name: row.name,
		description: row.description,
		isPublic: toBoolean(row.is_public),
		isMatchPlaylist: toBoolean(row.is_match_playlist),
		views: row.views,
		likeCount: Number(row.like_count || 0),
		createdAt: row.created_at,
		updatedAt: row.updated_at
	};
}

function mapSong(row) {
	if (!row) {
		return null;
	}
	return {
		id: row.id,
		provider: row.provider,
		providerSongId: row.provider_song_id,
		title: row.title,
		artist: row.artist,
		url: row.url,
		imageUrl: row.image_url,
		durationSeconds: row.duration_seconds,
		metadata: parseJson(row.metadata, {}),
		position: row.position,
		createdAt: row.created_at,
		updatedAt: row.updated_at
	};
}

module.exports = {
	mapUser,
	mapProfile,
	mapMixtape,
	mapSong,
	parseJson,
	serializeJson,
	toBoolean
};
