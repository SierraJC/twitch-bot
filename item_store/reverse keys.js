var child_process = require('child_process')

const StoreItem = require('./_interface')

class Item extends StoreItem {
	constructor() {
		super()
		this.id = 'reverse keys';
	}
	onRedeem(redeem) {
		child_process.exec('.\\ahk\\reverse_keys.ahk');
	}
}
module.exports = new Item();