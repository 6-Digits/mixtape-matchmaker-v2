const { db } = require('../db');
const { notFound } = require('../http/errors');
const { newId, orderedPair } = require('../utils/ids');
const { mapProfile } = require('../utils/rows');

async function reactToProfile(fromUserId, toUserId, reaction) {
	await db('profile_reactions')
		.insert({
			from_user_id: fromUserId,
			to_user_id: toUserId,
			reaction
		})
		.onConflict(['from_user_id', 'to_user_id'])
		.merge({ reaction, updated_at: db.fn.now() });

	if (reaction !== 'like') {
		return { matched: false };
	}

	const reciprocal = await db('profile_reactions')
		.where({ from_user_id: toUserId, to_user_id: fromUserId, reaction: 'like' })
		.first();

	if (!reciprocal) {
		return { matched: false };
	}

	const [userA, userB] = orderedPair(fromUserId, toUserId);
	let match = await db('matches').where({ user_a_id: userA, user_b_id: userB }).first();

	if (!match) {
		const matchId = newId();
		const chatId = newId();
		await db.transaction(async (trx) => {
			await trx('matches').insert({ id: matchId, user_a_id: userA, user_b_id: userB });
			await trx('chats').insert({ id: chatId, match_id: matchId });
		});
		match = await db('matches').where({ id: matchId }).first();
	}

	return { matched: true, match };
}

async function listMatches(userId) {
	const rows = await db('matches')
		.leftJoin('chats', 'chats.match_id', 'matches.id')
		.where('matches.user_a_id', userId)
		.orWhere('matches.user_b_id', userId)
		.select('matches.*', 'chats.id as chat_id')
		.orderBy('matches.created_at', 'desc');

	return Promise.all(rows.map(async (match) => {
		const otherUserId = match.user_a_id === userId ? match.user_b_id : match.user_a_id;
		const profile = await db('profiles').where({ user_id: otherUserId }).first();
		return {
			id: match.id,
			chatId: match.chat_id,
			userId: otherUserId,
			profile: mapProfile(profile),
			createdAt: match.created_at
		};
	}));
}

async function listCandidates(userId, limit = 20) {
	const seen = db('profile_reactions').where({ from_user_id: userId }).select('to_user_id');
	const rows = await db('profiles')
		.whereNot('user_id', userId)
		.whereNotIn('user_id', seen)
		.limit(Number(limit))
		.orderBy('created_at', 'desc');

	return rows.map(mapProfile);
}

async function getChatForUser(userId, chatId) {
	const chat = await db('chats')
		.join('matches', 'matches.id', 'chats.match_id')
		.where('chats.id', chatId)
		.where((builder) => {
			builder.where('matches.user_a_id', userId).orWhere('matches.user_b_id', userId);
		})
		.select('chats.*', 'matches.user_a_id', 'matches.user_b_id')
		.first();

	if (!chat) {
		throw notFound('No chat found.');
	}

	return chat;
}

async function listChats(userId) {
	const matches = await listMatches(userId);
	return matches.filter((match) => match.chatId);
}

async function listMessages(userId, chatId) {
	await getChatForUser(userId, chatId);
	const rows = await db('messages')
		.where({ chat_id: chatId })
		.orderBy('created_at', 'asc');

	return rows.map((row) => ({
		id: row.id,
		chatId: row.chat_id,
		userId: row.user_id,
		body: row.body,
		createdAt: row.created_at,
		updatedAt: row.updated_at
	}));
}

async function createMessage(userId, chatId, body) {
	await getChatForUser(userId, chatId);
	const id = newId();

	await db('messages').insert({
		id,
		chat_id: chatId,
		user_id: userId,
		body
	});

	const [message] = await listMessages(userId, chatId).then((messages) => messages.filter((item) => item.id === id));
	return message;
}

module.exports = {
	createMessage,
	listCandidates,
	listChats,
	listMatches,
	listMessages,
	reactToProfile
};
