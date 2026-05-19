const { randomUUID } = require('node:crypto');

function newId() {
	return randomUUID();
}

function orderedPair(idA, idB) {
	return [idA, idB].sort();
}

module.exports = { newId, orderedPair };
