const axios = require('axios');

const StoreItem = require('./_interface')

class Item extends StoreItem {
	constructor() {
		super()
		this.id = 'something punny';
		axios.defaults.headers.common['Accept'] = 'text/plain';
	}
	async onRedeem(redeem) {
		axios.all([
			axios.get('https://icanhazdadjoke.com/'),
			axios.get('https://icanhazdadjoke.com/'),
			axios.get('https://icanhazdadjoke.com/')
		]).then(axios.spread((response1, response2, response3) => {
			chat.whisper(conf.streamer.username, response1.data)
			chat.whisper(conf.streamer.username, response2.data)
			chat.whisper(conf.streamer.username, response3.data)
		})).catch(error => {
			this.log(error);
		});

		// axios.get('https://api.nasa.gov/planetary/apod?api_key=DEMO_KEY')
		// 	.then(response => {
		// 		this.log(response.data.url);
		// 		this.log(response.data.explanation);
		// 	})
		// 	.catch(error => {
		// 		this.log(error);
		// 	});
	}
}

module.exports = new Item();