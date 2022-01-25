const StoreItem = require('./_interface')

class Item extends StoreItem {
	constructor() {
		super()
		this.id = 'random steam game';
		this.keys = db.config.get('modules.game_keys').value();

	}
	onRedeem(redeem = { channel: '', username: '', data: {} }) {
		let keyNum = Math.floor(Math.random() * this.keys.length);
		let key = this.keys[keyNum];

		chat.whisper(redeem.username, `Your RANDOM Steam Game Key: ${key.key}`);
		chat.whisper(redeem.username, `https://store.steampowered.com/account/registerkey?key=${key.key}`);

		chat.whisper(conf.streamer.username, `"${key.name}" redeemed by ${redeem.username}, code "${key.key}"`);

		chat.say(redeem.channel, `@${redeem.username}, check your Twitch whispers for your Steam game key RPGPhatLoot`);

		this.keys.splice(keyNum, 1)
		db.config.set('modules.game_keys', this.keys).write();

		se_api.getStoreItem(redeem.data._id)
			.then(item => {
				item.quantity = { total: 99, current: this.keys.length };
				return se_api.updateStoreItem(item._id, item)
			});//.then(data => console.log(data));

	}
}

module.exports = new Item();