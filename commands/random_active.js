const ChatCommand = require('./_interface')

class Command extends ChatCommand {
	constructor() {
		super()
		this.id = 'random_active';
		// ? Permissions: BROADCASTER, MOD, VIP, SUB, REG, TIME/# (mins)
		super.register({ trigger: '!ractive', minPermission: 'BROADCASTER', cooldown: 0, userCooldown: 0, pubHandler: this.onChatMessage, privHandler: this.onWhisper })

	}

	async onChatMessage(cmd) { // {cmd.raw, cmd.src, cmd.params}
		let now = Date.now();
		let activeChatters = [];

		viewers.forEach(viewer => {
			if (viewer.lastMessage && (now - viewer.lastMessage.time) < (15 * 60 * 1000))
				activeChatters.push(viewer.displayName);
		});

		let selected = [];
		let numSelected = !cmd.params[1] || isNaN(cmd.params[1]) ? 1 : cmd.params[1];

		for (let num = 0; num < numSelected && activeChatters.length > 0;num++) {
			let id = Math.floor(Math.random() * activeChatters.length);
			selected.push(activeChatters[id]);
			activeChatters.splice(id,1);
		}

		stream.say(`Random Chatter: ${selected.join(', ')}`);
	}
	async onWhisper(cmd) { // {cmd.raw, cmd.src, cmd.params}
	}
}

module.exports = new Command();