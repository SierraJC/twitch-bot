const StoreItem = require('./_interface')

class Item extends StoreItem {
	constructor() {
		super()
		this.id = 'itemname';
	}
	onRedeem(redeem = { channel: '', username: '', data: {} }) {


	}
}

module.exports = new Item();