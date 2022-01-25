const BotLib = require('./_interface')
const fs = require('fs')
const path = require('path')

class CooldownHandler extends BotLib {
	constructor() {
		super();
	}
}

class CommandHandler extends BotLib {
	constructor() {
		super()
		this.commands = [];
		this.cooldowns = new CooldownHandler();
	}

	init() {
		chat.on('PRIVMSG', obj => this.handleMessage(obj));
		chat.on('WHISPER', obj => this.handleMessage(obj));

		fs.readdirSync("./commands/").forEach((file) => {
			if (!file.startsWith('_') && path.extname(file).toLowerCase() === '.js') {
				let cmdPath = `../commands/${file}`
				let cmd = require(cmdPath)

				cmd.id = cmd.id.toLowerCase();
				cmd.handler = this;

				if (!this.commands[cmd.id]) {
					this.commands[cmd.id] = cmd;
					this.log(`Loaded: "${cmd.id}"`);
				}

			}

		});

		setInterval(() => { // Garbage collection routine
			Object.keys(this.commands).forEach(handler => this.commands[handler]._cleanup())
		}, 15 * (60 * 1000));

		return true;
	}

	hasPermission(viewer, permission, param) {
		if (permission == 'ALL') return true; // No need to process if the command is for everyone

		permission = permission ? permission.toUpperCase() : 'ALL';
		if (permission.includes('/')) { // parse parameter
			permission = permission.split('/');
			param = permission[1]; permission = permission[0];
		}
		if (typeof viewer !== 'object') viewer = viewers.get(viewer.toLowerCase());

		if (permission == 'BROADCASTER' && viewer.isBroadcaster) return true;
		if ((permission == 'VIP' || permission == 'MOD' || permission == 'REG') && viewer.isMod) return true;
		if ((permission == 'VIP' || permission == 'SUB') && viewer.isVIP) return true;
		if (permission == 'SUB' && viewer.isSub) return true;
		if (permission == 'REG' && viewer.watchTime >= (conf.regularHours * 60)) return true;
		if (permission == 'TIME' && param && viewer.watchTime >= param) return true
		if (viewer.isBroadcaster) return true;

		return false;
	}

	handleMessage(obj) {
		if (obj.username == conf.bot.username || obj.isSelf) return;

		// Parse user permissions from tags
		//obj.tags.userId
		let user = viewers.get(obj.username) || viewers.default({ username: obj.username });
		let now = Date.now();

		if (!user) return; // User not found in db? something went wrong.
		user.displayName = obj.tags.displayName;
		user.id = Number(obj.tags.userId);

		if (obj.command == 'PRIVMSG') {
			// tags arent present for whispers, so we can only update this data during privmsg
			user.isBroadcaster = (obj.tags.badges.broadcaster == '1' || obj.username == conf.streamer.username) || undefined;
			user.isMod = (obj.tags.mod == '1') || undefined;
			user.isVIP = (obj.tags.badges.vip == '1') || undefined;
			user.isSub = (obj.tags.subscriber == '1' || obj.tags.badges.founder !== undefined ) || undefined;
			user.lastMessage = { text: obj.message, time: now };
			if (obj.message.charAt(0) != '!') {
				stream.chatLines++;
				user.chatLines = (user.chatLines || 0) + 1;
			}
		} else if (obj.command = 'WHISPER' && obj.message.charAt(0) != '!') {
			chat.whisper(conf.streamer.username,`${obj.username}: ${obj.message}`)
		}

		obj._user = user;

		let params = obj.message.split(' ');
		let command = params[0].toLowerCase();
		Object.keys(this.commands).forEach(handler => {
			for (let i in this.commands[handler].cmds) {
				let cmd = this.commands[handler].cmds[i];
				if (cmd.trigger == false) return;
				if (this.hasPermission(user, cmd.minPermission))
					if ((cmd.trigger instanceof RegExp && obj.message.match(cmd.trigger)) || (typeof cmd.trigger === 'string' && command == cmd.trigger))
						if (cmd.cooldown == 0 || (cmd.cooldown > 0 && ((now - cmd.timers.global) / 1000) > cmd.cooldown)) {
							if (cmd.userCooldown > 0 && !cmd.timers.users[obj.username]) cmd.timers.users[obj.username] = 0;
							if (cmd.userCooldown == 0 || (cmd.userCooldown > 0 && ((now - cmd.timers.users[obj.username]) / 1000) > cmd.userCooldown)) {
								cmd.timers.global = now;
								if (cmd.userCooldown > 0) cmd.timers.users[obj.username] = now;
								this.debug(`"${obj.message}" by ${obj.username} passed, processing...`)
								if (obj.command == 'PRIVMSG')
									cmd.pubHandler.apply(this.commands[handler], [{ raw: obj, src: cmd, params }])
								else if (obj.command = 'WHISPER')
									cmd.privHandler.apply(this.commands[handler], [{ raw: obj, src: cmd, params }])
							} else
								this.debug(`"${obj.message}" by ${obj.username} failed: user cooldown`)
						} else
							this.debug(`"${obj.message}" by ${obj.username} failed: global cooldown`)
			}
		})
	}
}

module.exports = new CommandHandler();