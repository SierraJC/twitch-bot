const RootInterface = require('../_interface')

class ChatCommand extends RootInterface {
	constructor() {
		super()
		this.id = 'command';
		this.cmds = [];
	}
	register(opts) {
		let id = this.cmds.push({})-1;
		this.cmds[id] = Object.assign({
			id: id,
			trigger: opts.trigger,
			minPermission: opts.minPermission || 'ALL',
			cooldown: opts.cooldown || 0,
			userCooldown: opts.userCooldown || 0,
			timers: {
				global: 0,
				users: {}
			},
			pubHandler: opts.pubHandler || function () { },
			privHandler: opts.privHandler || function () { },
		}, opts)
		return this.cmds[id];
	}
	unregister(cmd) {
		return this.cmds[cmd].trigger = false;
	}
	_cleanup() { // Purge user cooldowns to save memory
		let now = Date.now();
		this.cmds.forEach(cmd => {
			if (cmd.userCooldown > 0)
				Object.keys(cmd.timers.users).forEach(user => {
					if (((now - cmd.timers.users[user]) / 1000) > cmd.userCooldown)
						delete cmd.timers.users[user]
				})
		})
		return true
	}
	reply(raw, message, noHighlight = false) {
		if (message == '') return;
		if (raw.command == 'WHISPER') { // Reply via whisper
			chat.whisper(raw.username, message.charAt(0).toUpperCase() + message.slice(1))
		} else { // Reply via channel
			//chat.say(raw.channel,`${noHighlight?'':`@${raw.tags.displayName}, `}${message}`)
			chat.send(`@client-nonce=${raw.tags.clientNonce};reply-parent-msg-id=${raw.tags.id} PRIVMSG ${raw.channel} :${message}`);
		}

	}
}

module.exports = ChatCommand;