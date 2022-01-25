const StoreItem = require('./_interface')

class Item extends StoreItem {
	constructor() {
		super()
		this.id = 'spin wheel';
	}
	onRedeem(redeem) {
		if (!obs._connected) return;

		var spinTimer = 6; // Number of seconds to perform looping
		var spinStep = 3; // Number to increase value by per loop
		var spinFreq = 25; // Speed of loops in ms
		var spinVar = 0; // Current value

		const spinLoop = setInterval(() => {
			spinVar += spinStep;
			if (spinVar > 180) spinVar = -180;
			obs.send('SetSourceFilterSettings', { 'sourceName': 'Webcam (GreenScreen)', 'filterName': 'WheelSpin Rotation', 'filterSettings': { 'Filter.Transform.Camera': 1, 'Filter.Transform.Rotation.Z': spinVar, 'Filter.Transform.Rotation.Y': spinVar, 'Filter.Transform.Rotation.X': (spinVar - (spinVar * 2)) } }).catch(err => { });
			if (spinTimer == 0 && spinVar == 0) clearInterval(spinLoop);
		}, spinFreq);

		const spinTimerObj = setInterval(() => {
			spinTimer--;
			this.log('Time Remaining: ' + spinTimer);
			if (spinTimer <= 0) clearInterval(spinTimerObj);
		}, 1000);

	}
}

module.exports = new Item();