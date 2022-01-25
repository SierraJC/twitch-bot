const ChatCommand = require('./_interface')
const axios = require('axios');

class RoomCodes extends ChatCommand {
	constructor() {
		super()
		this.id = 'room_codes';

		this.code = '';
		this.timer = null;
		this.timerNum = 0;
		this.timerSubOnly = null;
		this.startedAt = 0;
		this.subPrioSecs = 120; //? Seconds after code available to be sub/regulars only

		this.minTime = 10;

		super.register({ trigger: '!code', minPermission: 'ALL', cooldown: 0, userCooldown: 5, pubHandler: this.onChatMessage, privHandler: this.onWhisper })
	}

	async onChatMessage(cmd) { // {cmd.raw, cmd.src, cmd.params}
		if (this.code == '') return;
		let now = Date.now();
		let secsPassed = (now - this.startedAt) / 1000

		//let isFollowing =  cmd.raw._user.isSub ? true : await viewers.following(cmd.raw.username);
		let passed = false;
		let rejectMsg = '';
		if (secsPassed < this.subPrioSecs) {
			passed = this.handler.hasPermission(cmd.raw._user, 'SUB') || this.handler.hasPermission(cmd.raw._user, 'REG');
			let secsLeft = Math.round(this.subPrioSecs - secsPassed);
			rejectMsg = `Subscribers/regulars only for the next ${secsLeft} seconds`
			if (!passed) cmd.src.timers.users[cmd.raw.username] = Date.now() + ((secsLeft - 5) * 1000);
		} else {
			passed = this.handler.hasPermission(cmd.raw._user, 'SUB') || (this.handler.hasPermission(cmd.raw._user, `TIME/${this.minTime}`) && await viewers.following(cmd.raw.username));
			rejectMsg = `Not following or first time in stream, try again next game 🙂`
		}

		if (passed || cmd.raw.username == conf.streamer.username) {
			this.reply(cmd.raw, '✅ Check your TWITCH whispers!');
			//chat.say(stream.channel, `@${cmd.raw.tags.displayName}, ✅ Code sent! Check your TWITCH whispers 👍`)
			chat.whisper(cmd.raw.username, `${String.fromCharCode(33 + ~~(Math.random() * 15))}Room Code: ${this.code}`);
			if (Math.random() > 0.9)
				axios.get('https://complimentr.com/api').then(response => {
					if (response.data.compliment) {
						this.log(`@${cmd.raw.username}, ${response.data.compliment}`);
						chat.whisper(cmd.raw.username, `btw, ${response.data.compliment} ♥`)
					}
				}).catch(err => { });
		} else
		this.reply(cmd.raw,`❌ ${rejectMsg}`)

	}

	async onWhisper(cmd) { // {cmd.raw, cmd.src, cmd.params}
		if (this.handler.hasPermission(cmd.raw._user, 'MOD'))
			if (cmd.params[1]) {
				clearTimeout(this.timer);
				clearTimeout(this.timerSubOnly);
				this.code = cmd.params[1];//.toUpperCase()
				this.timerNum = cmd.params[2] && !isNaN(cmd.params[2]) ? Number(cmd.params[2]) : 0;
				this.startedAt = Date.now();

				chat.whisper(cmd.raw.username, `Code set to "${this.code}"${this.timerNum > 0 ? ` for ${this.timerNum} minutes` : ''}`);

				chat.say(stream.channel, `/me 💬 A new code is now available to subscribers/regulars. Type !code if you would like to join!`);

				obs.send('SetSceneItemProperties', { 'scene-name': 'Overlay', item: 'Sub Code Timer', visible: true });
				this.timerSubOnly = setTimeout(() => {
					chat.say(stream.channel, `/me 🔓 Code is now open to all ${this.minTime}min+ followers. Type !code if you would like to join!`);
					obs.send('SetSceneItemProperties', { 'scene-name': 'Overlay', item: 'Sub Code Timer', visible: false });
				}, this.subPrioSecs * 1000)

				if (this.timerNum > 0)
					this.timer = setTimeout(() => {
						chat.whisper(cmd.raw.username, `Code "${this.code}" has now expired!`);
						this.code = '';
					}, this.timerNum * 60 * 1000);

			} else this.code = '';
	}
}

module.exports = new RoomCodes();