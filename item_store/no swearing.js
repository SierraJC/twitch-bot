const StoreItem = require('./_interface')

class Item extends StoreItem {
	constructor() {
		super()
		this.id = 'no swearing challenge';

	}
	onRedeem(redeem) {
		setTimeout(() =>
			obs.send('SetSceneItemProperties', { 'scene-name': 'Overlay', 'item': 'Swear Challenge', 'visible': true }).catch(err => this.error(err))
			, 13000);
	}
}
//setTimeout(() => obs.send('SetSceneItemProperties', { 'scene-name': 'Overlay', 'item': 'Swear Challenge', 'visible': false }).catch(err => {}), 15 * 60 * 1000); // Hide after 15 minutes
module.exports = new Item();