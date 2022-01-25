
const StoreItem = require('./_interface')

class Item extends StoreItem {
	constructor() {
		super()
		this.id = 'crab rave';
	}
	onRedeem(redeem, doCrabs = true, hueTimer = 13) {
		
		if (!obs._connected) {
			chat.say(redeem.channel,'Woops! This rave has been shutdown by the connection police.');
			return;
		}

		obs.send('GetSceneList').then(data => {

			chat.say(redeem.channel, '!kappagen 🦀')

			// obs.send('SetSceneItemProperties', { 'scene-name': 'Webcam', 'item': 'Rave Dance', 'visible': true }).catch(err => {});
			// obs.send('SetSceneItemProperties', { 'scene-name': 'Webcam', 'item': 'Rave Dance Mirrors', 'visible': true }).catch(err => {});	

			//var hueTimer = 13; // Number of seconds to perform hue looping
			var hueStep = 5; // Number to increase hue value by per looping
			var hueFreq = 25; // Speed of loops in ms
			var hueVar = 0; // Current value

			const hueLoop = setInterval(() => {
				hueVar += hueStep;

				if (hueVar > 180) hueVar = -180;

				if (data.currentScene == 'Chat Mode+Gameplay' || data.currentScene == 'Wheel Spin (Subs)') {
					obs.send('SetSourceFilterSettings', { 'sourceName': data.currentScene, 'filterName': 'HUE Shifter', 'filterSettings': { 'hue_shift': hueVar } }).catch(err => {});
				} else {
					obs.send('SetSourceFilterSettings', { 'sourceName': 'Gameplay Inputs', 'filterName': 'HUE Shifter', 'filterSettings': { 'hue_shift': hueVar } }).catch(err => {});
					obs.send('SetSourceFilterSettings', { 'sourceName': 'Webcam', 'filterName': 'HUE Shifter', 'filterSettings': { 'hue_shift': (hueVar - (hueVar * 2)) } }).catch(err => {});
				}

				if (hueTimer == 0 && hueVar == 0) {
					// Finished hue shifting
					clearInterval(hueLoop);
					obs.send('SetSceneItemProperties', { 'scene-name': 'Webcam', 'item': 'Rave Dance', 'visible': false }).catch(err => {});
					obs.send('SetSceneItemProperties', { 'scene-name': 'Webcam', 'item': 'Rave Dance Mirrors', 'visible': false }).catch(err => {});
				}
			}, hueFreq);

			const hueTimerObj = setInterval(() => {
				hueTimer--;
				this.log('Time Remaining: ' + hueTimer);
				if (hueTimer <= 0) {
					clearInterval(hueTimerObj);
				}
			}, 1000);

		});
	}
}

module.exports = new Item();