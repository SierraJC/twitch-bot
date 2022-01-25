const StoreItem = require('./_interface')

//! WARN: If someone changes their username while VIP, they will permanently have it. Move VIP storage to user database?

class Item extends StoreItem {
	constructor() {
		super()
		this.id = 'vip status';

	}
	onRedeem(redeem = { channel: '', username: '', data: {} }) {

		plugins['channel_points'].modules['VIP'].onRedeem({ user: { login: redeem.username, display_name: redeem.username, id: false } })

	}
}

module.exports = new Item();