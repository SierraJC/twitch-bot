const ChatCommand = require('./_interface')

class Command extends ChatCommand {
	constructor() {
		super()
		this.id = 'currency transfer';

		super.register({ trigger: '!transfer', minPermission: 'MOD', cooldown: 15, pubHandler: this.onMessage })
		super.register({ trigger: 'cancel', minPermission: 'MOD', cooldown: 0, pubHandler: this.onMessage })
	}

	async transfer(fromUser, toUser) {
		let current = await se_api.getUserPoints(fromUser).catch(err => { this.error(err) }); // Get fromUser current points
		if (current && (current.points || current.pointsAlltime) > 0) {
			// oldUser exists, transfer currency!
			let del = await se_api.deleteUserPoints(fromUser).catch(() => { }); // Delete fromUser points
			// del.message = "XXX was successfully reset" del.username = "username"
			if (del && del.message) {
				let add = await se_api.addUserPoints(toUser, current.points).catch(() => { }); // Add points to toUser
				if (add) {

					// Update all time points
					await se_api.makeRequest('DELETE', `points/${se_api.accountId}/alltime/${fromUser}`).catch(() => { });
					await se_api.makeRequest('PUT', `points/${se_api.accountId}/alltime/${toUser}/${current.pointsAlltime}`).catch(() => { });

					fromUser = viewers.get(fromUser);
					toUser = viewers.get(toUser);

					if (fromUser && toUser) {
						toUser.watchTime += fromUser.watchTime;
						toUser.followGame = fromUser.followGame;
						toUser.lastRedeem = fromUser.lastRedeem > toUser.lastRedeem ? fromUser.lastRedeem : toUser.lastRedeem;
						toUser.currencySpent_SE += fromUser.currencySpent_SE || 0;
						toUser.pointsSpent += fromUser.pointsSpent || 0;
						toUser.chatLines += fromUser.chatLines || 0;
						viewers.purge(fromUser.username);
					} // note: not possible to automatically rename OBS source :(

					return add;
				}
			}
		} else {
			// User not found?
		}
		return false;
	}

	async onMessage(cmd) {
		// Make sure we are handling the correct command. Better safe than sorry with this one!
		if (cmd.params[0].toLowerCase() == this.cmds[0].trigger) {
			let [fromUser, toUser] = [viewers.sanitize(cmd.params[1]), viewers.sanitize(cmd.params[2])];
			if (viewers.validate(fromUser) && viewers.validate(toUser)) {
				chat.say(cmd.raw.channel, `[!] Transferring ${conf.currencyName} from ${fromUser} to ${toUser} in 10 seconds. Say CANCEL to stop.`).then(() => {
					this.cancelTimer = setTimeout(async () => {
						let result = await this.transfer(fromUser.toLowerCase(), toUser.toLowerCase());
						if (result)
							chat.say(cmd.raw.channel, `[!] Transferred ${result.amount} ${conf.currencyName} to ${toUser}, you now have ${result.newAmount} ${conf.currencyName}`)
						else
							chat.say(cmd.raw.channel, `[!] Transfer failed. "${fromUser}" does't exist or has no ${conf.currencyName}`)
					}, 10 * 1000);
				})
			} else {
				// Invalid parameters?
				chat.say(cmd.raw.channel, `@${cmd.raw.tags.displayName}, usage: ${cmd.params[0]} <from> <to>`);
			}
		} else if (cmd.params[0].toLowerCase() == 'cancel' && this.cancelTimer && !(this.cancelTimer._destroyed || this.cancelTimer._called)) {
			clearTimeout(this.cancelTimer);
			chat.say(cmd.raw.channel, '[!] Transfer cancelled');
		}
	}
}

module.exports = new Command();