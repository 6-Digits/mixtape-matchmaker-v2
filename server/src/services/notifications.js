const { db } = require('../db');
const { newId } = require('../utils/ids');

async function createNotification(userId, message, link = null) {
	const id = newId();
	await db('notifications').insert({ id, user_id: userId, message, link });
	return db('notifications').where({ id }).first();
}

async function listNotifications(userId) {
	const rows = await db('notifications').where({ user_id: userId }).orderBy('created_at', 'desc');
	return rows.map((row) => ({
		id: row.id,
		userId: row.user_id,
		message: row.message,
		link: row.link,
		read: Boolean(Number(row.read)),
		createdAt: row.created_at,
		updatedAt: row.updated_at
	}));
}

async function markNotificationRead(userId, id) {
	await db('notifications').where({ id, user_id: userId }).update({ read: true, updated_at: db.fn.now() });
	return { updated: true };
}

module.exports = { createNotification, listNotifications, markNotificationRead };
