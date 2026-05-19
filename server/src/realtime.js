const { createMessage } = require('./services/matches');
const { createNotification } = require('./services/notifications');

const NEW_CHAT_MESSAGE_EVENT = 'newChatMessage';
const NEW_NOTIFICATION_EVENT = 'newNotificationEvent';

function attachRealtime(io) {
	io.on('connection', (socket) => {
		const { roomId, userId } = socket.handshake.query;

		if (roomId) {
			socket.join(roomId);
		}
		if (userId) {
			socket.join(userId);
		}

		socket.on(NEW_CHAT_MESSAGE_EVENT, async (data, callback) => {
			try {
				const chatId = data.chatId || roomId;
				const senderId = data.userId || userId;
				const body = data.body || data.text;
				const message = await createMessage(senderId, chatId, body);
				io.to(chatId).emit(NEW_CHAT_MESSAGE_EVENT, message);
				callback?.({ ok: true, message });
			} catch (error) {
				callback?.({ ok: false, message: error.message });
			}
		});

		socket.on(NEW_NOTIFICATION_EVENT, async (data, callback) => {
			try {
				const notification = await createNotification(data.userId || data.receiver, data.message, data.link);
				io.to(notification.user_id).emit(NEW_NOTIFICATION_EVENT, notification);
				callback?.({ ok: true, notification });
			} catch (error) {
				callback?.({ ok: false, message: error.message });
			}
		});
	});
}

module.exports = { attachRealtime };
