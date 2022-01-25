const ChatCommand = require('./_interface')
const prettyMS = require('pretty-ms')

class Command extends ChatCommand {
	constructor() {
		super()
		this.id = 'cis_nonsense';
		// ? Permissions: BROADCASTER, MOD, VIP, SUB, REG, TIME/# (mins)
		super.register({ trigger: '!nonsense', minPermission: 'ALL', cooldown: 30, userCooldown: 0, pubHandler: this.onChatMessage, privHandler: this.onWhisper })

	}

	async onChatMessage(cmd) { // {cmd.raw, cmd.src, cmd.params}
		let plugModeration = plugins['moderation'];
		let	prettyOpts = { verbose: true, unitCount: 2, secondsDecimalDigits: 0 };
		stream.say(`It has been ${prettyMS(Date.now() - plugModeration.lastBan, prettyOpts)} without cis nonsense. The record is ${prettyMS(plugModeration.banRecord, prettyOpts)}, and ${plugModeration.banCounter} trolls have been yeeted PrideCheers`)

	}
	async onWhisper(cmd) { // {cmd.raw, cmd.src, cmd.params}
	}
}

module.exports = new Command();