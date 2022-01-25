const ChatCommand = require('./_interface')

class Command extends ChatCommand {
	constructor() {
		super()
		this.id = 'command_name';
		// ? Permissions: BROADCASTER, MOD, VIP, SUB, REG, TIME/# (mins), ALL
		super.register({ trigger: /^!alert .*/i, minPermission: 'SUB', cooldown: 0, userCooldown: 10, pubHandler: this.onChatMessage, privHandler: this.onWhisper })

	}

	async onChatMessage(cmd) { // {cmd.raw, cmd.src, cmd.params}
	}
	async onWhisper(cmd) { // {cmd.raw, cmd.src, cmd.params}
	}
}

module.exports = new Command();