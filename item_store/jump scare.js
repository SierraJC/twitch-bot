const StoreItem = require('./_interface')

class Item extends StoreItem {
	constructor() {
		super()
		this.id = 'jump scare';
	}
	onRedeem(redeem = { channel: '', username: '', data: {} }) {
		stream.say('/me 🔊 VOLUME WARNING 🔊 ');
		stream.say('/me 🔊 VOLUME WARNING 🔊 ');
	}
}

module.exports = new Item();