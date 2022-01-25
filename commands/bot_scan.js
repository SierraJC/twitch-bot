const ChatCommand = require('./_interface')
const axios = require('axios')

class BotScan extends ChatCommand {
	constructor() {
		super()
		this.id = 'BotScan';
		// ? Permissions: BROADCASTER, MOD, VIP, SUB, REG, TIME/# (mins), ALL
		super.register({ trigger: /^!bots .*/i, minPermission: 'MOD', cooldown: 0, userCooldown: 0, pubHandler: this.onChatMessage, privHandler: this.onWhisper })

	}

	async onChatMessage(cmd) { // {cmd.raw, cmd.src, cmd.params}
		if (cmd.params[1] == 'scan') {
			let sus = [];
			viewers.forEach(viewer => {
				if (viewer.chatLines == 0 && !viewer.followGame && !viewer.lastMessage && viewer.watchTime > 60)
					sus.push(viewer.username)
			})
			if (sus.length > 0) {
				let botList = await axios.get(`https://api.twitchinsights.net/v1/bots/online`).then(response => response.data.bots) || [];
				let bots = [];
				for (let bot of botList)
					if (sus.includes(bot[0])) {
						bots.push(bot[0]);
						if (cmd.params[2] && cmd.params[2] == 'ban')
							stream.say(`/ban ${bot[0]}`);
					}
				if (bots.length > 0)
					stream.say(`${bots.join(', ')} are damn bots! MrDestructoid BOP`);
			}
		}
	}
	async onWhisper(cmd) { // {cmd.raw, cmd.src, cmd.params}
	}
}

module.exports = new BotScan();