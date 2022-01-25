const BotLib = require('./_interface')
const fs = require('fs')
const path = require('path');
const EventEmitter = require('events');
const axios = require('axios');
const { TIMEOUT } = require('dns');


class Common extends BotLib {
	constructor() {
		super()
		this.events = new EventEmitter();

		global.sleep = require('util').promisify(setTimeout);

		global.Time = {};
		{
			Time.SECOND = 1000;
			Time.MINUTE = 60 * Time.SECOND;
			Time.HOUR = 60 * Time.MINUTE;
			Time.DAY = 24 * Time.HOUR;
			Time.WEEK = 7 * Time.DAY;
			Time.MONTH = 4 * Time.WEEK;
			Time.YEAR = 365 * Time.DAY;
		}

		global.getRandomInt = function (min, max) {
			return Math.floor(Math.random() * (max - min + 1) + min);
		}

		this.newStatus = {};
		this.channel = `#${conf.streamer.username}`;
		this.status = {
			live: false,
			game: '',
			_startTime: null,
			uptime: 0, // seconds
			viewers: 0,
			title: '',
			followers: 0,
		}
		this.chatLines = 0; // Incremented in commands.js handleMessage event
		this.currencyAwarded = 0; // Incremented in various places, total currency awarded per stream
		this.pointsSpent = 0; // Incremented in various places, total channel points spent per stream

		this.botsToBan = [];

		this.silentMode = false; // If enabled, some functions may be silenced due to cutscenes etc.

		global.stream = this;

	}

	init() {
		// Called after all libs are loaded and constructors called. Must return true or lib will unload
		setTimeout(() => this.update_status(), 2 * 1000) // # Seconds

		setInterval(() => this.update_status(), 1 * 60 * 1000) // # Minutes

		stream.events.on('obs:liveChange', (live) => live ? this.say('/unhost').catch(() => { }) : false)

		stream.events.on('status', (status) => {
			if (!status.old.live && status.new.live) {
				this.log('Stream is now ONLINE!')

				this.say('/followersoff').catch(() => { });
				this.say('/subscribersoff').catch(() => { });
				this.say('/emoteonlyoff').catch(() => { });
				this.say('/slowoff').catch(() => { });
				this.say(`💬 Stream is now live! If you cant see it, hit refresh on your browser <3`);

				// OBS transition override for start -> chat scene... very hacky, but transition matrix plugin seems to be dead
				if (obs.currentScene == 'Starting Soon') {
					obs.send('SetSceneTransitionOverride', { sceneName: 'Chat Mode+Gameplay', transitionName: 'Uplink Stinger' })
					obs.once('SwitchScenes', (data) => {
						obs.send('RemoveSceneTransitionOverride', { sceneName: 'Chat Mode+Gameplay' });
					});
				}

			} else if (status.old.live && !status.new.live) {
				this.log('Stream is now OFFLINE!')
				this.say(`💬 Stream is now offline! BibleThump`);
				viewers.updateAll(true)
				let uptime = this.secToHMS(status.old.uptime)
				let msg = `There were ${this.chatLines} messages, and ${this.pointsSpent} ${conf.currencyName} spent in tonights ${uptime.hours}h${uptime.minutes}m stream`;
				this.say(`${msg} PogChamp`);
				discord.emit('request', { command: 'createMessage', params: { channelID: conf.discord.channels.general, message: `<:twitch:361533128248131585> ${msg} <:Blanket:586973208515837953>` } })
				// this.say(`/emoteonly`).catch(() => { });
				// this.say('Emote only mode is enabled due to offline hate raids. Chat on Discord! KonCha');
				this.botsToBan.forEach(bot => this.say(`/ban ${bot} Bot Account`));
			}

			if (status.new.live) {

				if (status.new.uptime > 60 && Math.round(status.new.uptime / 60) % 60 == 0) { // Every 60 minutes of uptime
					// this.error('----------- 1h uptime');
				}

			}



		});

		// Network Lag Notifier
		let numDroppedFrames = 0;
		let lastDroppedFrames = 0;
		obs.on('StreamStatus', status => lastDroppedFrames = status.numDroppedFrames);
		setInterval(() => {
			if (lastDroppedFrames == numDroppedFrames) return; // No change
			this.log(`Frames Dropped: ${lastDroppedFrames} (${lastDroppedFrames - numDroppedFrames})`)
			if (lastDroppedFrames - numDroppedFrames > 200) {
				chat.say(stream.channel, `🚨 Internet lag! ${lastDroppedFrames} frames dropped! 🚨`)
				//this.log('FRAME DROP WARNING');
			}
			numDroppedFrames = lastDroppedFrames;
		}, 10000);

		/*
			{ 'StreamStatus'
				"average-frame-time":4.8635,
				"bytes-per-sec":593050,
				"cpu-usage":19.992411225665833,
				"fps":60.0000024000001,
				"free-disk-space":67708.5625,
				"kbits-per-sec":4633,
				"memory-usage":740.01171875,
				"num-dropped-frames":2179,
				"num-total-frames":50869,
				"output-skipped-frames":7,
				"output-total-frames":50878,
				"preview-only":false,
				"recording":false,
				"recording-paused":false,
				"render-missed-frames":587,
				"render-total-frames":248280,
				"replay-buffer-active":false,
				"strain":0.005520068109035492,
				"stream-timecode":"00:14:07.816",
				"streaming":true,
				"total-stream-time":847,
				"update-type":"StreamStatus",
				"averageFrameTime":4.8635,
				"bytesPerSec":593050,
				"cpuUsage":19.992411225665833,
				"freeDiskSpace":67708.5625,
				"kbitsPerSec":4633,
				"memoryUsage":740.01171875,
				"numDroppedFrames":2179,
				"numTotalFrames":50869,
				"outputSkippedFrames":7,
				"outputTotalFrames":50878,
				"previewOnly":false,
				"recordingPaused":false,
				"renderMissedFrames":587,
				"renderTotalFrames":248280,
				"replayBufferActive":false,
				"streamTimecode":"00:14:07.816",
				"totalStreamTime":847,
				"updateType":"StreamStatus"
			}
		*/



		// stream.events.on('status', (status) => {
		// this.debug(`Status: Live: ${status.live} w/ ${status.viewers} viewers playing "${status.game}" with title "${status.title}"`)
		// });
		// stream.events.on('liveChange',(status) => {
		// console.log('stream is now ',status)
		// });

		// stream.events.on('obs:sceneChange', data => {
		// 	if (stream.status.live && data.sceneName == 'Be Right Back')
		// 		setTimeout(async () => {
		// 			let adTime = 90;
		// 			if (obs.currentScene == 'Be Right Back') { // Make sure we are still in BRB scene after XX seconds
		// 				let result = await stream.playAd(adTime);
		// 				if (result) {
		// 					//this.say('/me Sierra is AFK!')
		// 					this.log(`${adTime}s ad break starting now`);
		// 					setTimeout(() => this.log(`${adTime}s ad break finished`), adTime * 1000);
		// 				}
		// 			}
		// 		}, 60 * 1000);
		// });

		return true;
	}

	async say(message, addTags = '') {
		return chat.say(this.channel + ' ' + addTags, message);
	}

	async reply(raw, message) {
		if (message == '') return;
		if (raw.command == 'WHISPER')  // Reply via whisper
			return chat.whisper(raw.username, message.charAt(0).toUpperCase() + message.slice(1))
		else  // Reply via channel
			return chat.send(`@client-nonce=${raw.tags.clientNonce};reply-parent-msg-id=${raw.tags.id} PRIVMSG ${raw.channel} :${message}`);
	}

	// uptime() {
	// 	return Math.floor((Date.now() - new Date(this.status._startTime)) / 60 / 1000)
	// };

	async update_status() {
		// Check if stream is live, and collect details 
		let response = await api.get(`streams/${conf.streamer.id}`, { version: 'kraken' }).catch(() => false);
		//let response = await api.get('streams', { search: { user_id: conf.streamer.id } }).then(data => data.data[0]).catch(() => false);
		if (!response) return;

		/* todo: update status handlers to helix
{
	 "id":"39734674958",
	 "userId":"36769016",
	 "userName":"TimTheTatman",
	 "gameId":"512710",
	 "type":"live",
	 "title":"CODE TIMTHETATMAN IN THE CALL OF DUTY STORE #CODPARTNER",
	 "viewerCount":25561,
	 "startedAt":"2020-09-17T15:48:30Z",
	 "language":"en",
	 "thumbnailUrl":"https://static-cdn.jtvnw.net/previews-ttv/live_user_timthetatman-{width}x{height}.jpg",
	 "tagIds":[
			"6ea6bca4-4712-4ab9-a906-e3336a9d8039"
	 ]
}
		*/

		this.newStatus = { live: (response.stream != null) };

		if (response.stream) {
			this.newStatus.game = response.stream.game;
			this.newStatus._startTime = response.stream.createdAt;
			this.newStatus.uptime = (Date.now() - new Date(response.stream.createdAt)) / 1000;
			this.newStatus.viewers = response.stream.viewers;
			this.newStatus.title = response.stream.channel.status;
			this.newStatus.followers = response.stream.channel.followers;
		} else {
			// When not live, we need to get the channel info via another API since the non-live response is {stream: null}
			let response = await api.get(`channels/${conf.streamer.id}`, { version: 'kraken' }).catch(() => { })
			if (!response) return;
			this.newStatus.game = response.game;
			this.newStatus.uptime = this.status.uptime;
			this.newStatus.viewers = 0;
			this.newStatus.title = response.status;
			this.newStatus.followers = response.followers;
		}

		if (this.newStatus.live != this.status.live)
			this.events.emit('liveChange', this.newStatus);
		if (this.newStatus.title != this.status.title)
			this.events.emit('titleChange', this.newStatus);
		if (this.newStatus.game != this.status.game)
			this.events.emit('gameChange', this.newStatus);
		if (this.newStatus.followers > this.status.followers)
			this.events.emit('followerChange', this.newStatus);

		this.events.emit('status', { old: this.status, new: this.newStatus });

		// Merge new status with <this> object
		Object.assign(this.status, this.newStatus);
	}

	dump_json(filename, obj) {
		fs.writeFileSync(filename, JSON.stringify(obj, null, 2));
	}

	secToHMS(timeInSeconds) {
		var time = parseInt(timeInSeconds, 10),
			hours = Math.floor(time / 3600),
			minutes = Math.floor((time - (hours * 3600)) / 60),
			seconds = time - (hours * 3600) - (minutes * 60)

		return { hours, minutes, seconds, total: time };
		//return pad(hours, 2) + ':' + pad(minutes, 2) + ':' + pad(seconds, 2) + ',' + pad(milliseconds, 3);
	}

	formUrlEncoded(x) {
		return Object.keys(x).reduce((p, c) => p + `&${c}=${encodeURIComponent(x[c])}`, '')
	}

	async tts(message, voice = 'Brian', speed = 90, volume = 100) {
		if (!message) return false;
		let reqData = { 'voice': voice, 'text': message.substring(0, 550) };

		if (['Rick', 'Cartman', 'Homer'].includes(voice)) {

		} else if (['Demon', 'Pixie', 'Robot', 'Goblin', 'Ghost'].includes(voice)) {

			// CereProc voices, using the proxy by lazypy.ro (maybe not allowed)
			// Can be manually coded by copying https://github.com/chrisjp/tts/blob/master/proxy.php
			reqData.service = 'CereProc';
			return await axios.post('https://lazypy.ro/tts/proxy.php', this.formUrlEncoded(reqData)).then(result => {
				if (result.data.success && result.data.speak_url) {
					wsAPI.emit('tts', { url: result.data.speak_url, volume, speed });
					return true;
				} else return false;

			}).catch(err => false);

		} else {
			return await axios.post('https://streamlabs.com/polly/speak', reqData).then(result => {
				if (result.data.success && result.data.speak_url) {
					wsAPI.emit('tts', { url: result.data.speak_url, volume, speed });
					return true;
				} else return false;

			}).catch(err => false);
		}
	}

	async playAd(duration = 30) {
		return api.post(`channels/${conf.streamer.id}/commercial`, { version: 'kraken', body: { length: duration } }).then(response => response).catch(err => { this.error(err); return false });
	}

}

module.exports = new Common();