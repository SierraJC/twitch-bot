const StoreItem = require('./_interface')

var Filter = require('bad-words'); // https://www.npmjs.com/package/bad-words

class Item extends StoreItem {
	constructor() {
		super()
		this.filter = new Filter({ placeHolder: '?' });
		this.filter.addWords(...['kneegrow','knee grow','nagger','kys','trap','tranny','shemale'])
		
		this.id = 'breaking news'

		this.voice = 'UK English Male'
		this.volume = 40
		//setTimeout(() => this.onRedeem(stream.channel, 'tester', { input: ["I dont give a fuck about you"] }), 1000);
	}
	onRedeem(redeem) {
		return;
		let message = this.filter.clean(redeem.data.input[0]);
		chat.whisper(conf.streamer.username, `News: ${message}`);
		setTimeout(() => {
			stream.tts(message,this.volume,this.voice)
		}, 1500);
	}
}

module.exports = new Item();