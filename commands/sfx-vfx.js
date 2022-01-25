const ChatCommand = require('./_interface')

class Command extends ChatCommand {
	constructor() {
		super()
		this.id = 'SFX-VFX';

		this.userCD = 2 * 60;
		this.globalCD = 60;
		this.minPerm = 'TIME/30';


		super.register({ trigger: /^(hey|hello|hallo|hi|hai|ohai)$/i, sfx: 'hello-frank.mp3', minPermission: 'ALL', cooldown: 0, userCooldown: 5, pubHandler: this.onChatMessage })
		super.register({ trigger: /^(ya{1,}s{1,})/i, sfx: 'yasss.mp3', minPermission: 'ALL', cooldown: 0, userCooldown: 5, pubHandler: this.onChatMessage })
		super.register({ trigger: /^(oh my{1,})$/i, sfx: 'oh my.mp3', minPermission: 'ALL', cooldown: 60, userCooldown: 120, pubHandler: this.onChatMessage })
		super.register({ trigger: /^(oh no{1,})$/i, sfx: 'oh-no-family-guy.mp3', volume: 100, minPermission: 'ALL', cooldown: 5, userCooldown: 30, pubHandler: this.onChatMessage })
		super.register({ trigger: /\b(corona|covid|virus|coronavirus|covid-19)\b/i, sfx: ['corona-virus.mp3', 'corona-virus.mp3', 'corona-haha.mp3'], volume: 80, minPermission: 'ALL', cooldown: 0, userCooldown: 10, pubHandler: this.onChatMessage })
		super.register({ trigger: /\b(bugsnax|bug snacks|bugsax)\b/i, sfx: ['talkin-bugsnax.mp3', 'its-bugsnax.mp3'], volume: 70, minPermission: 'ALL', cooldown: 4, userCooldown: 15, pubHandler: this.onChatMessage })

		//? SFX
		super.register({ trigger: '!mad', sfx: 'heff-be-mad.mp3', volume: 100, minPermission: this.minPerm, cooldown: this.globalCD, userCooldown: this.userCD, pubHandler: this.onChatMessage })
		super.register({ trigger: '!profanity', sfx: 'watch-your-profamity.mp3', minPermission: this.minPerm, cooldown: this.globalCD, userCooldown: this.userCD, pubHandler: this.onChatMessage })
		super.register({ trigger: '!shame', sfx: 'shame.mp3', minPermission: this.minPerm, cooldown: this.globalCD, userCooldown: this.userCD, pubHandler: this.onChatMessage })
		super.register({ trigger: '!salt', sfx: 'salty.mp3', minPermission: this.minPerm, cooldown: this.globalCD, userCooldown: this.userCD, pubHandler: this.onChatMessage })
		super.register({ trigger: '!rip', sfx: 'RIP.mp3', minPermission: this.minPerm, cooldown: this.globalCD, userCooldown: this.userCD, pubHandler: this.onChatMessage })
		super.register({ trigger: '!fuckedup', sfx: 'fucked-up.mp3', minPermission: this.minPerm, cooldown: this.globalCD, userCooldown: this.userCD, pubHandler: this.onChatMessage })
		super.register({ trigger: '!haha', sfx: 'ha-ha.mp3', minPermission: this.minPerm, cooldown: this.globalCD, userCooldown: this.userCD, pubHandler: this.onChatMessage })
		// super.register({ trigger: '!crickets', sfx: 'crickets.mp3', minPermission: this.minPerm, cooldown: this.globalCD, userCooldown: this.userCD, pubHandler: this.onChatMessage })
		super.register({ trigger: '!fail', sfx: 'fail.mp3', minPermission: this.minPerm, cooldown: this.globalCD, userCooldown: this.userCD, pubHandler: this.onChatMessage })
		super.register({ trigger: '!littleshit', sfx: 'ninja-wtf.mp3', volume: 80, minPermission: this.minPerm, cooldown: this.globalCD, userCooldown: this.userCD, pubHandler: this.onChatMessage })
		// super.register({ trigger: /\!(honk|hjonk)$/i, sfx: ['honk-normal1.mp3', 'honk-jar.mp3', 'honk-harmonica.mp3'], volume: 150, minPermission: this.minPerm, cooldown: 0, userCooldown: 2, pubHandler: this.onChatMessage })
		super.register({ trigger: '!omg', sfx: 'oh_my_god.mp3', volume: 130, minPermission: this.minPerm, cooldown: this.globalCD, userCooldown: this.userCD, pubHandler: this.onChatMessage })
		super.register({ trigger: '!violin', sfx: 'violin.mp3', volume: 60, minPermission: this.minPerm, cooldown: this.globalCD, userCooldown: this.userCD, pubHandler: this.onChatMessage })
		// super.register({ trigger: '!doit', sfx: 'palpatine-do-it.mp3', volume: 100, minPermission: this.minPerm, cooldown: this.globalCD, userCooldown: this.userCD, pubHandler: this.onChatMessage })
		super.register({ trigger: '!ohno', sfx: 'oh-no-family-guy.mp3', volume: 100, minPermission: this.minPerm, cooldown: this.globalCD, userCooldown: this.userCD, pubHandler: this.onChatMessage })


		//? VFX
		super.register({ trigger: '!justdoit', vfx: 'NO, just DO IT (Meme)', minPermission: this.minPerm, cooldown: this.globalCD, userCooldown: this.userCD, pubHandler: this.onChatMessage })
		super.register({ trigger: '!timetostop', vfx: 'Time To Stop (Meme)', minPermission: this.minPerm, cooldown: this.globalCD, userCooldown: this.userCD, pubHandler: this.onChatMessage })
		// super.register({ trigger: '!hahgay', vfx: 'Ha Gay (Meme)', minPermission: this.minPerm, cooldown: this.globalCD, userCooldown: this.userCD, pubHandler: this.onChatMessage })

	}

	async onChatMessage(cmd) {
		if (stream.silentMode) {
			stream.say('This isn\'t the time to use that!');
			return;
		}
		if (cmd.src.trigger == '!shame')
			chat.say(cmd.raw.channel, '🔔 🔔 🔔 Shame. Shame. Shame.')

		if (cmd.src.sfx)
			audio.play(Array.isArray(cmd.src.sfx) ? cmd.src.sfx[Math.floor(Math.random() * cmd.src.sfx.length)] : cmd.src.sfx, cmd.src.volume)
		else if (cmd.src.vfx)
			obs.send('SetSceneItemProperties', { 'scene-name': 'Comedic Effects', item: cmd.src.vfx, visible: true }).then((result) => {
				return setTimeout(() => obs.send('SetSceneItemProperties', { 'scene-name': 'Comedic Effects', item: cmd.src.vfx, visible: false }), 20000);
			});
	}
}

module.exports = new Command();