const ChatCommand = require('./_interface')

class Command extends ChatCommand {
	constructor() {
		super()
		this.id = 'sub_alerts';

		super.register({ trigger: /^!alert$/i, minPermission: 'SUB', cooldown: 0, userCooldown: 10, pubHandler: this.onSelfAlert, privHandler: this.onSelfAlert })
		super.register({ trigger: /^!alert .*/i, minPermission: 'SUB', cooldown: 0, userCooldown: 10, pubHandler: this.onOtherAlert, privHandler: this.onOtherAlert })

		this.showDuration = 15; // seconds
		this.thirdPartyCost = 10; // XP cost, 3rd party gets half
		this.scene = 'Comedic Effects';
	}

	async obsToggleAlert(username) {
		let sourcename = username.toLowerCase();

		let source = await obs.send('GetSceneItemProperties', { 'scene-name': this.scene, 'item': sourcename }).catch(err => this.error(err));
		if (source && !source.visible) {
			obs.send('SetSceneItemProperties', { 'scene-name': this.scene, 'item': sourcename, 'visible': true }).then(data => {
				if (data.status == 'ok')
					setTimeout(() => obs.send('SetSceneItemProperties', { 'scene-name': this.scene, 'item': sourcename, 'visible': false }), this.showDuration * 1000)
			})
			return true;
		} else
			return false; // User probably has no alert, or their sub has expired.
	}

	async onSelfAlert(cmd) {
		if (stream.silentMode) return;
		let result = await this.obsToggleAlert(cmd.raw.username);
		if (result) { // Add proper cooldown
			cmd.src.timers.users[cmd.raw.username] = Date.now() + (15 * 60 * 1000);
			this.reply(cmd.raw, `PowerUpL ${cmd.raw.tags.displayName} used their sub alert! PowerUpR`, true)
		} else this.reply(cmd.raw, `unable to find an alert for you 😢`)
	}
	async onOtherAlert(cmd) {
		if (stream.silentMode) return;
		let target = viewers.sanitize(cmd.params[1]).toLowerCase();
		if (target != cmd.raw.username && viewers.validate(target) && viewers.subscribers[target]) {
			se_api.getUserPoints(cmd.raw.username).then(async data => {
				if (this.handler.hasPermission(cmd.raw._user, 'BROADCASTER') || data.points >= this.thirdPartyCost) {
					let result = await this.obsToggleAlert(target);
					if (result) {
						let targetBonus = Math.ceil(this.thirdPartyCost / 2);
						cmd.src.timers.users[cmd.raw.username] = Date.now() + (30 * 60 * 1000);
						this.reply(cmd.raw, `KAPOW ${cmd.raw.tags.displayName} used ${target}'s sub alert! (+${targetBonus} ${conf.currencyName}) KAPOW`, true)
						if (!this.handler.hasPermission(cmd.raw._user, 'BROADCASTER'))
							se_api.removeUserPoints(cmd.raw.username, this.thirdPartyCost).then(data => se_api.addUserPoints(target, Math.ceil(this.thirdPartyCost / 2)))
					} else this.reply(cmd.raw, `unable to find an alert for that user 😢`);
				} else this.reply(cmd.raw, `You need ${this.thirdPartyCost} ${conf.currencyName} to use someone elses alert LUL`)
			})
		} else {
			this.reply(cmd.raw, `invalid user, or they aren't subbed anymore 😢`)
		}
	}
}

module.exports = new Command();