const bcrypt = require('bcryptjs');
const { db } = require('../db');
const { newId } = require('../utils/ids');
const { mapProfile, mapUser } = require('../utils/rows');
const { badRequest, notFound, unauthorized } = require('../http/errors');
const { signToken } = require('../http/auth');

async function createUserAccount(input) {
	const id = newId();
	const displayName = input.displayName || `${input.firstName || ''} ${input.lastName || ''}`.trim();
	const username = input.username || displayName || input.email.split('@')[0];
	const passwordHash = await bcrypt.hash(input.password, 10);

	try {
		await db.transaction(async (trx) => {
			await trx('users').insert({
				id,
				email: input.email.toLowerCase(),
				password_hash: passwordHash
			});

			await trx('profiles').insert({
				user_id: id,
				display_name: displayName || username,
				username,
				gender: input.gender || null,
				dob: input.dob || null
			});

			await trx('match_preferences').insert({ user_id: id });

			await trx('mixtapes').insert({
				id: newId(),
				owner_id: id,
				name: 'Match Playlist',
				description: '',
				is_public: false,
				is_match_playlist: true
			});
		});
	} catch (error) {
		if (error.code === 'SQLITE_CONSTRAINT' || error.code === 'ER_DUP_ENTRY') {
			throw badRequest('Email or username is already in use.');
		}
		throw error;
	}

	return { auth: true, token: signToken(id), id };
}

async function findOrCreateOAuthUser(input) {
	const provider = input.provider || 'mixtape';
	const providerUserId = input.providerUserId || input.email;
	const email = `${provider}.${providerUserId}`.replace(/[^a-zA-Z0-9._-]/g, '-').toLowerCase() + '@oauth.local';
	const existing = await db('users').where({ email }).first();

	if (existing) {
		return { auth: true, token: signToken(existing.id), id: existing.id, provider };
	}

	const displayName = input.displayName || 'Mixtape Listener';
	const usernameBase = input.username || displayName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'listener';
	const username = `${usernameBase}-${Date.now().toString(36)}`;
	const password = `oauth-${newId()}`;
	const result = await createUserAccount({
		email,
		password,
		displayName,
		username
	});

	return { ...result, provider };
}

async function login(email, password) {
	const user = await db('users').where({ email: email.toLowerCase() }).first();
	if (!user) {
		throw unauthorized('Email or password is incorrect.');
	}

	const passwordMatches = await bcrypt.compare(password, user.password_hash);
	if (!passwordMatches) {
		throw unauthorized('Email or password is incorrect.');
	}

	return { auth: true, token: signToken(user.id), id: user.id };
}

async function getAccount(userId) {
	const user = await db('users').where({ id: userId }).first();
	if (!user) {
		throw notFound('No user found.');
	}
	return mapUser(user);
}

async function getProfile(userId) {
	const profile = await db('profiles').where({ user_id: userId }).first();
	if (!profile) {
		throw notFound('No profile found.');
	}
	return mapProfile(profile);
}

async function updateProfile(userId, input) {
	const profileUpdate = {};
	const userUpdate = {};

	if (input.displayName !== undefined) profileUpdate.display_name = input.displayName;
	if (input.username !== undefined) profileUpdate.username = input.username;
	if (input.gender !== undefined) profileUpdate.gender = input.gender;
	if (input.dob !== undefined) profileUpdate.dob = input.dob;
	if (input.bio !== undefined) profileUpdate.bio = input.bio;
	if (input.imageUrl !== undefined) profileUpdate.image_url = input.imageUrl;
	if (input.email !== undefined) userUpdate.email = input.email.toLowerCase();
	if (input.allowNotifications !== undefined) userUpdate.allow_notifications = input.allowNotifications;

	if (input.password) {
		if (!input.oldPassword) {
			throw badRequest('oldPassword is required to change password.');
		}
		const user = await db('users').where({ id: userId }).first();
		const passwordMatches = user && await bcrypt.compare(input.oldPassword, user.password_hash);
		if (!passwordMatches) {
			throw unauthorized('Wrong password.');
		}
		userUpdate.password_hash = await bcrypt.hash(input.password, 10);
	}

	await db.transaction(async (trx) => {
		if (Object.keys(profileUpdate).length > 0) {
			profileUpdate.updated_at = trx.fn.now();
			await trx('profiles').where({ user_id: userId }).update(profileUpdate);
		}
		if (Object.keys(userUpdate).length > 0) {
			userUpdate.updated_at = trx.fn.now();
			await trx('users').where({ id: userId }).update(userUpdate);
		}
	});

	return getProfile(userId);
}

async function getPreferences(userId) {
	const preference = await db('match_preferences').where({ user_id: userId }).first();
	if (!preference) {
		throw notFound('No preferences found.');
	}
	return {
		userId: preference.user_id,
		gender: preference.gender,
		ageLower: preference.age_lower,
		ageUpper: preference.age_upper,
		location: preference.location,
		latitude: preference.latitude == null ? null : Number(preference.latitude),
		longitude: preference.longitude == null ? null : Number(preference.longitude)
	};
}

async function updatePreferences(userId, input) {
	if (input.ageLower !== undefined && input.ageLower < 18) {
		throw badRequest('ageLower must be at least 18.');
	}

	const update = {};
	if (input.gender !== undefined) update.gender = input.gender;
	if (input.ageLower !== undefined) update.age_lower = input.ageLower;
	if (input.ageUpper !== undefined) update.age_upper = input.ageUpper;
	if (input.location !== undefined) update.location = input.location;
	if (input.latitude !== undefined) update.latitude = input.latitude;
	if (input.longitude !== undefined) update.longitude = input.longitude;

	if (Object.keys(update).length === 0) {
		return getPreferences(userId);
	}

	update.updated_at = db.fn.now();
	await db('match_preferences').where({ user_id: userId }).update(update);
	return getPreferences(userId);
}

module.exports = {
	createUserAccount,
	findOrCreateOAuthUser,
	getAccount,
	getPreferences,
	getProfile,
	login,
	updatePreferences,
	updateProfile
};
