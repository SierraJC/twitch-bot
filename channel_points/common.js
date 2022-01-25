const cpItem = require('./_interface')
const axios = require('axios')

module.exports = new class cpCommon extends cpItem {
	constructor() {
		super()
		this.id = 'cpCommon';

		// Something Punny
		super.register({ id: '53f6faaa-7cf9-455f-b4e4-e5f28e584b9e', cooldown: 0, userCooldown: 0, event: this.onPunny })
		// Ad Time
		super.register({ id: '131c6e7c-d995-49d4-9642-c6afed64a0be', cooldown: 0, userCooldown: 0, event: this.onAd })
		// Swear Challenge
		super.register({ id: '86718792-d12f-4326-a337-c08523af273b', cooldown: 0, userCooldown: 0, event: this.onSwearChallenge })
		// Truth or Drink
		super.register({ id: 'd4dcbc44-a26e-4917-996a-574ab82043e4', cooldown: 0, userCooldown: 0, event: this.onTruthOrDrink })
		// Timewarp Scanline filter
		super.register({ id: '76b041f7-cf2d-4aa0-8a10-e162ea57e109', cooldown: 0, userCooldown: 0, event: this.onTimeWarp })

		// Required for icanhazdadjoke API, otherwise 503 block
		axios.defaults.headers.common['User-Agent'] = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:83.0) Gecko/20100101 Firefox/83.0'
		axios.defaults.headers.common['Accept'] = 'text/plain';
	}

	onRedeem(redemption) {

	}

	async onTimeWarp(redemption) {
		obs.send('SetSourceFilterSettings', { sourceName: 'Webcam (GreenScreen)', filterName: 'Time Warp Scan', filterSettings: { rotation: getRandomInt(90, 270) } });
		this.handler.modules['SoundFX'].onRedeem(redemption, 'time-warp.mp3', undefined, 6)
		obs.send('SetSourceFilterVisibility', { sourceName: 'Webcam (GreenScreen)', filterName: 'Time Warp Scan', filterEnabled: true });
		await sleep(15000);
		obs.send('SetSourceFilterVisibility', { sourceName: 'Webcam (GreenScreen)', filterName: 'Time Warp Scan', filterEnabled: false });
	}

	async onTruthOrDrink(redemption) {
		let truth = redemption.user_input;

		if (!truth || ['', 'empty', 'blank', 'you pick', '-', 'pick for me', 'pick for me!'].includes(String(truth).toLowerCase())) {
			truth = '';
			let truths = await axios.get('https://randomwordgenerator.com/json/question-truth-or-dare.json').then(response => response.data.data.truths);

			if (truths) {
				truth = truths[Math.floor(Math.random() * truths.length)].question;
				stream.say(`${truth}`);
			}
		}

		if ((redemption._user.isSub || redemption._user.watchTime > 120) && truth)
			stream.tts(`Truth or Drink? ${truth}`);

	}

	onPunny(redemption) {
		axios.all([
			axios.get('https://icanhazdadjoke.com/'),
			axios.get('https://icanhazdadjoke.com/'),
			axios.get('https://icanhazdadjoke.com/')
		]).then(axios.spread((response1, response2, response3) => {
			// chat.say(conf.streamer.username,`/w ${conf.streamer.username} ${response1.data}`)
			// chat.say(conf.streamer.username,`/w ${conf.streamer.username} ${response2.data}`)
			// chat.say(conf.streamer.username,`/w ${conf.streamer.username} ${response3.data}`)
			chat.whisper(conf.streamer.username, response1.data)
			chat.whisper(conf.streamer.username, response2.data)
			chat.whisper(conf.streamer.username, response3.data)
		})).catch(error => {
			this.log(error);
		});
	}

	onAd(redemption) {
		if (stream.silentMode) return;
		// api.post('channels/commercial', { body: { broadcaster_id: conf.streamer.id, length: 30 } }) //! doesnt work for some reason on Helix?
		stream.playAd(30);
	}

	onSwearChallenge(redemption) {
		// Play SFX
		this.handler.modules['SoundFX'].onRedeem(redemption, 'burt-and-ernie-swearing.mp3', undefined, 12)
		setTimeout(() =>
			obs.send('SetSceneItemProperties', { 'scene-name': 'Overlay', 'item': 'Swear Challenge', 'visible': true }).catch(err => this.error(err))
			, 13000);
	}

}


