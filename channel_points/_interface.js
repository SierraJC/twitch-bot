const RootInterface = require('../_interface')

class cpItem extends RootInterface {
	constructor() {
		super()
		this.id = '';

		this.rewards = []
	}

	register(opts) {
		let index = this.rewards.push({})-1;
		this.rewards[index] = Object.assign({
			_id: index,
			id: opts.id,
			cooldown: opts.cooldown || 0,
			userCooldown: opts.userCooldown || 0,
			timers: {
				global: 0,
				users: {}
			}
		}, opts)
		return this.rewards[index];
	}

	unregister(reward) {
		return this.rewards[reward].id = false;
	}

	_cleanup() { // Purge user cooldowns to save memory
		let now = Date.now();
		this.rewards.forEach(reward => {
			if (reward.userCooldown > 0)
				Object.keys(reward.timers.users).forEach(user => {
					if (((now - reward.timers.users[user]) / 1000) > reward.userCooldown)
						delete reward.timers.users[user]
				})
		})
		return true
	}

	onRedeem() {
		throw Error(`Module "${this.id}" is missing onRedeem event`);
		return;
	}
}

module.exports = cpItem;