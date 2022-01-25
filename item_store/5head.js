const StoreItem = require('./_interface')

class Item extends StoreItem {
	constructor() {
		super()
		this.id = '5head';
		this.duration = 1; // minutes
	}
	onRedeem(redeem) {
		if (!obs._connected) return;

		obs.send('SetSceneItemProperties', { 'scene-name': 'Webcam', 'item': 'Webcam (GreenScreen)', 'visible': false }).catch(err => {})
		obs.send('SetSceneItemProperties', { 'scene-name': 'Webcam', 'item': '5head-webcam', 'visible': true }).catch(err => {})

		setTimeout(() => {
			obs.send('SetSceneItemProperties', { 'scene-name': 'Webcam', 'item': 'Webcam (GreenScreen)', 'visible': true }).catch(err => {})
			obs.send('SetSceneItemProperties', { 'scene-name': 'Webcam', 'item': '5head-webcam', 'visible': false }).catch(err => {})
		}, this.duration * 60 * 1000)

	}
}

module.exports = new Item();