const StoreItem = require('./_interface')

class Item extends StoreItem {
	constructor() {
		super()
		this.id = '+25 XP for All';

		httpServer.get('/give_all', (request, response) => {
			response.send('OK')
			if (!request.query.amount) return;
			this.onRedeem({ channel: stream.channel, username: 'Google' }, request.query.amount);
		})

	}
	onRedeem(redeem, amount = 25) {
		//chat.say(channel, '!addpoints all 25');
		let now = Date.now();
		if (redeem.username != 'Google')
			chat.say(redeem.channel, '!kappagen 💰💲🤑💸🎉');
		let userUpdates = [];

		//viewers.asArray().forEach(viewer => userUpdates.push({ username: viewer, current: amount }))
		viewers.forEach(viewer => {
			if (viewer.username != redeem.username && viewer.lastMessage && (now - viewer.lastMessage.time) < (30 * 60 * 1000)) {
				userUpdates.push({ username: viewer.username, current: amount, alltime: amount })
				stream.currencyAwarded += parseInt(amount);
			}
		})

		if (userUpdates.length > 0)
			se_api.updatePoints({ mode: 'add', users: userUpdates }).then(response => {
				chat.say(redeem.channel, `/me ${amount} ${conf.currencyName} added to ${userUpdates.length} chatters! (${userUpdates.length * amount} ${conf.currencyName} total)`)
				if (redeem.username != 'Google')
					chat.say(redeem.channel, `/me 🙏 PRAISE ${redeem.username.toUpperCase()}! 🙏`)
			}).catch(err => chat.say(redeem.channel, `@${conf.streamer.username} dont panic, but something went wrong`))

	}
}

module.exports = new Item();