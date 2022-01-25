const ChatCommand = require('./_interface');
const TwitchJs = require('twitch-js').default;

class Raid extends ChatCommand {
	constructor() {
		super()
		this.id = 'raid';

		this.subMsgReg = /.*([REDACTED]).*/ //? Raid message regexp
		this.nonsubMsgReg = /.*sierraid.*/;
		this.subMessage = 'SierRaid!';
		this.nonsubMessage = 'twitchRaid twitchRaid SierRaid! twitchRaid twitchRaid';
		this.rewardWindow = 3 * Time.MINUTE;
		this.bonusCurrency = 20;
		this.raiders = [];
		this.raidSuccess = false;

		//! todo: add a way to cancel, and timeout raid events

		this.chat = new TwitchJs({ token: conf.streamer.token, clientId: conf.clientID, username: conf.streamer.username, isKnown: false }).chat // Streamer account

		// ? Permissions: BROADCASTER, MOD, VIP, SUB, REG, TIME/# (mins)
		super.register({ trigger: '!raid', minPermission: 'MOD', cooldown: 5, userCooldown: 0, pubHandler: this.onChatMessage, privHandler: this.onWhisper })

	}

	async onChatMessage(cmd) { // {cmd.raw, cmd.src, cmd.params}
		if (!cmd.params[1]) return;
		let target = viewers.sanitize(cmd.params[1]).toLowerCase();
		if (obs.currentScene == 'Raid') {
			if (viewers.validate(target)) {
				let targetID = await api.get(`users`, { search: { login: target } }).then(data => data.users[0].id).catch(err => false)
				if (targetID) {
					let targetStream = await api.get(`streams/${targetID}`).then(data => data.stream ? data.stream : false).catch(err => false);
					if (targetStream) {
						let customMessage = cmd.params[2] ? cmd.params.slice(2).join(' ') : false;
						this.raiders = [];
						cmd.src.timers.global = Date.now() + (this.rewardWindow + 60000);
						stream.say(`/raid ${targetStream.channel.name}`);
						this.reply(cmd.raw, `/me !!! twitchRaid RAIDERS ASSEMBLE twitchRaid !!!`, true);
						this.reply(cmd.raw, `Send our raid message in ${targetStream.channel.displayName}'s chat to earn bonus ${conf.currencyName}!`, true);
						if (customMessage) {
							this.reply(cmd.raw, `/me RAID MESSAGE:`, true);
							this.reply(cmd.raw, customMessage, true);
						} else {
							this.reply(cmd.raw, `/me SUBSCRIBERS:`, true);
							this.reply(cmd.raw, this.subMessage, true);
							this.reply(cmd.raw, `/me Non-Subscribers:`, true);
							this.reply(cmd.raw, this.nonsubMessage, true);
						}
						this.reply(cmd.raw, `PrideFlag HOLD! Do not send the raid message until the raid begins!`, true);

						obs.send('SetSourceSettings', { sourceName: 'Raid Target', sourceSettings: { url: `https://embed.twitch.tv/?channel=${targetStream.channel.name}&theme=dark&layout=video` } }).catch(err => this.error(err));
						obs.send('SetSourceSettings', { sourceName: 'Raid Target Chat', sourceSettings: { url: `https://www.twitch.tv/popout/${targetStream.channel.name}/chat?darkpopout` } }).catch(err => this.error(err));

						await this.chat.connect().then(() => this.chat.join(`#${targetStream.channel.name}`));
						this.chat.on('USERNOTICE/RAID', async (event) => {
							if (event.parameters.login == conf.streamer.username) {
								// Raid notice is sent to streamer, now listen for raiders
								this.chat.on(`PRIVMSG/#${targetStream.channel.name}`, obj => {
									if ((customMessage && obj.message.toLowerCase().includes(customMessage.toLowerCase())) || obj.message.match(this.subMsgReg) || obj.message.match(this.nonsubMsgReg))
										if (!this.raiders.includes(obj.username)) {
											this.raiders.push(obj.username);
											this.log(`Raider ${obj.tags.displayName}: ${obj.message}`);
											stream.say(`PrideGive ${obj.tags.displayName} thanks for raiding`);
										}
								});

								await sleep(this.rewardWindow).then(() => this.chat.disconnect());
								this.chat.removeAllListeners();

								stream.say(`twitchRaid Raid on ${targetStream.channel.displayName} completed! We sent ${event.parameters.viewerCount} raiders and ${this.raiders.length} sent the raid message`);
								if (this.raiders.length > 0) {
									let userUpdates = [];
									this.raiders.forEach(raider => userUpdates.push({ username: raider, current: this.bonusCurrency, alltime: this.bonusCurrency }))
									stream.say(`Thanks for raiding ${this.raiders.join(', ')} <3`);

									// se_api.updatePoints({ mode: 'add', users: userUpdates }).catch(err => { });
								}
							}
						});
					} else //! Error, they arent live?
						this.reply(cmd.raw, `"${target}" is not currently live! FailFish`);
				} else //! Error, username does not exist
					this.reply(cmd.raw, `"${cmd.params[1]}" not found on Twitch FailFish`);
			} else //! Invalid input
				this.reply(cmd.raw, `"${cmd.params[1]}" isn't a valid username FailFish`);
		} else //! Not in Raid scene
			this.reply(cmd.raw, 'this command only works during the raid scene')
	}
	async onWhisper(cmd) { // {cmd.raw, cmd.src, cmd.params}
	}
}

module.exports = new Raid();