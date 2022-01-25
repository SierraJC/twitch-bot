const ChatCommand = require('./_interface')
const sendkeys = require('sendkeys')
const fs = require('fs')

class CommonCommands extends ChatCommand {
	constructor() {
		super()
		this.id = 'CommonCommands';
		// ? Permissions: BROADCASTER, MOD, VIP, SUB, REG, TIME/# (mins)
		this.addvip = super.register({ trigger: '!addvip', minPermission: 'MOD', cooldown: 10, userCooldown: 0, pubHandler: this.onChatMessage, privHandler: this.onWhisper })
		this.steamgift = super.register({ trigger: '!steamgift', minPermission: 'BROADCASTER', cooldown: 5, userCooldown: 0, pubHandler: this.onChatMessage, privHandler: this.onWhisper })
		this.eval = super.register({ trigger: '!eval', minPermission: 'BROADCASTER', cooldown: 0, userCooldown: 1, pubHandler: this.onChatMessage, privHandler: this.onWhisper })
		this.redeem = super.register({ trigger: '!redeemcp', minPermission: 'BROADCASTER', cooldown: 0, userCooldown: 0, pubHandler: this.onChatMessage, privHandler: this.onWhisper })
		this.silent = super.register({ trigger: '!silent', minPermission: 'BROADCASTER', cooldown: 0, userCooldown: 0, pubHandler: this.onChatMessage, privHandler: this.onWhisper })
		this.acab = super.register({ trigger: /\b(acab)\b/i, minPermission: 'ALL', cooldown: 0, userCooldown: 1, pubHandler: this.onChatMessage, privHandler: this.onWhisper })
		this.now_playing = super.register({ trigger: '!song', minPermission: 'ALL', cooldown: 10, userCooldown: 0, pubHandler: this.onChatMessage, privHandler: this.onWhisper })
		this.hours = super.register({ trigger: '!hours', minPermission: 'ALL', cooldown: 0, userCooldown: 0, pubHandler: this.onChatMessage, privHandler: this.onWhisper })

		this.sync = super.register({ trigger: '!sync', minPermission: 'MOD', cooldown: 5, userCooldown: 0, pubHandler: this.fixSync, privHandler: this.fixSync })
		this.tempTwitterTags = super.register({ trigger: '!tag', minPermission: 'BROADCASTER', cooldown: 0, userCooldown: 0, pubHandler: this.onChatMessage, privHandler: this.onWhisper })

		//this.honk = super.register({ trigger: '!honk', minPermission: 'ALL', cooldown: 1, userCooldown: 3, pubHandler: this.onChatMessage })

		httpServer.get('/phonecam', (request, response) => {
			if ('show' in request.query)
				obs.send('SetSceneItemProperties', { 'scene-name': 'Gameplay Container', item: 'Phone Camera (NDI)', visible: true });
			else if ('hide' in request.query) {
				obs.send('SetSceneItemProperties', { 'scene-name': 'Gameplay Container', item: 'Phone Camera (NDI)', visible: false });
			}
			response.send('OK')
		});

	}

	secondsToString(seconds) {
		var value = seconds;

		var units = {
			"day": 24 * 60 * 60,
			"hour": 60 * 60,
			"minute": 60,
			// "second": 1
		}

		var result = []

		for (var name in units) {
			var p = Math.floor(value / units[name]);
			if (p == 1) result.push(p + " " + name);
			if (p >= 2) result.push(p + " " + name + "s");
			value %= units[name]
		}
		return result;
	}

	async onChatMessage(cmd) { // {cmd.raw, cmd.src, cmd.params}

		// if (cmd.src == this.honk && stream.status.game == 'Untitled Goose Game') {
		// 	let numHonks = !isNaN(cmd.params[1]) ? cmd.params[1] : getRandomInt(3, 15);
		// 	if (numHonks > 15) numHonks = 15;
		// 	stream.say(`/me HONK ${'🤡'.repeat(numHonks / 2)}`);

		// 	for (let i = 0; i < numHonks; i++) {
		// 		sendkeys(' ');
		// 		await sleep(150);
		// 	}
		// }

		if (cmd.src == this.sync) {

		}

		if (cmd.src == this.hours) {
			let viewer = viewers.get(cmd.raw.username);
			let watchTime = this.secondsToString(viewer.watchTime * 60);
			console.log(watchTime);
			chat.say(cmd.raw.channel, `${cmd.raw._user.displayName} has been watching for ${watchTime.join(' ')} PogChamp`);

		}

		if (cmd.src == this.tempTwitterTags) {
			if (cmd.params[1].charAt(0) == '#') {
				twitter.tempTags.push(cmd.params[1]);
				chat.say(cmd.raw.channel, `Added temporary tag ${cmd.params[1]}`);
			}
		}

		if (cmd.src == this.now_playing) {

			let path = 'database/pretzel_status.json';
			let isRecent = (Date.now() - fs.statSync(path).mtime) < 7 * 60 * 1000;
			if (isRecent) {
				let status = JSON.parse(fs.readFileSync(path));
				if (status.player && status.player.playing) {
					chat.say(cmd.raw.channel, `Now Playing: ${status.track.title} - ${status.track.artistsString}`)
				}
			}
			return;
		}

		// ACAB
		if (cmd.src == this.acab) {
			stream.say('/me BlackLivesMatter A BlackLivesMatter C BlackLivesMatter A BlackLivesMatter B BlackLivesMatter')
			return;
		}

		// Add VIP
		if (cmd.src == this.addvip) {
			let target = viewers.sanitize(cmd.params[1]).toLowerCase();
			if (viewers.validate(target)) {
				let duration = cmd.params[2] && !isNaN(cmd.params[2]) ? cmd.params[2] : 7;
				let saveDuration = plugins['channel_points'].modules['VIP'].vipDuration;
				plugins['channel_points'].modules['VIP'].vipDuration = duration ? duration : saveDuration;
				plugins['channel_points'].modules['VIP'].onRedeem({ _user: viewers.get(target), user: { login: target, display_name: cmd.params[1], id: false } })
				plugins['channel_points'].modules['VIP'].vipDuration = saveDuration;
			}
			return;
		}

		// Manual Steam Redeem
		if (cmd.src == this.steamgift) {
			let target = viewers.sanitize(cmd.params[1]).toLowerCase();
			if (viewers.validate(target, true))
				plugins['item_store'].items['random steam game'].onRedeem({ channel: conf.streamer.username, username: target, data: { _id: '5be7c4314b157f04cb3e576e' } }) // Pass SE item store ID for get/set Item info API call
			return;
		}

		// Evaluate javascript
		if (cmd.src == this.eval && cmd.raw.username == conf.streamer.username) {
			try {
				let result = eval(cmd.raw.message.substr(cmd.raw.message.indexOf(' ') + 1));
				if (typeof result == 'object' && typeof result.then == 'function') result = await result;
				if (typeof result == 'object') result = JSON.stringify(result);

				await stream.say(result);
			} catch (err) {
				stream.say(`${err}`)
			}
			return;
		}

	}
	async onWhisper(cmd) { // {cmd.raw, cmd.src, cmd.params}

		// Activate "silent" mode for cutscenes
		if (cmd.src == this.silent && (cmd.params[1] == 'on' || cmd.params[1] == 'off')) {
			stream.silentMode = cmd.params[1] == 'on' ? true : false;
			chat.whisper(cmd.raw.username, `Silent mode = ${stream.silentMode}`);
			// Toggle mute on Music audio channel?
			obs.send('SetMute', { source: 'Music (NDI)', mute: stream.silentMode });
		}


		// Manually trigger Channel Point effects
		if (cmd.src == this.redeem && cmd.raw.username == conf.streamer.username)
			global.testRedeem(cmd.params[1]);


	}

	async fixSync() {
		return obs.send('GetSourcesList').then(async data => {//data.sources.forEach(source => {
			for (let source of data.sources)  	// type: input typeId: 'ndi_source'
				if (source.type == 'input' && source.typeId == 'ndi_source') {
					this.log(`Resetting NDI source "${source.name}"... `)
					await obs.send('SetSourceSettings', { sourceName: source.name, sourceSettings: {} }).catch(err => this.error(err));
					await sleep(500);
				}
		}).catch(err => this.error(err));
	}

}

module.exports = new CommonCommands();