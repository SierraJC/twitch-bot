const RootInterface = require('../_interface')

class StoreItem extends RootInterface {
	constructor() {
		super()
		this.id = 'itemname';
	}

	// log(msg) {
		// console.log(`[${this.id}] ${msg}`)
	// }
	
	onRedeem(redeem = {channel:'',username:'', data: {}}) {
		throw Error(`Module "${this.id}" is missing onRedeem event`);
		return;
	}
}

module.exports = StoreItem;