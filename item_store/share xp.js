const StoreItem = require('./_interface')

class Item extends StoreItem {
	constructor() {
		super()
		this.id = 'Share XP';
		this.fee = 15; // XP to remove from cost and not split

	}
	onRedeem(redeem) {
		let now = Date.now();
		let userUpdates = [];
		let amount = redeem.data.item.cost - this.fee;

		viewers.forEach(viewer => { // Get active chatter
			if (viewer.username != redeem.username && viewer.lastMessage && (now - viewer.lastMessage.time) < (15 * 60 * 1000)) {
				userUpdates.push({ username: viewer.username });
			}
		})

		if (userUpdates.length > 0) {
			// Calculate the split
			let amountShare = parseInt(Math.round(amount / userUpdates.length));
			stream.currencyAwarded += (amountShare * userUpdates.length);
			userUpdates.forEach(userUpdate => {
				userUpdate.current = amountShare;
				userUpdate.alltime = amountShare;
			});

			se_api.updatePoints({ mode: 'add', users: userUpdates }).then(response => {
				chat.say(redeem.channel, `/me ${amount} ${conf.currencyName} shared amongst ${userUpdates.length} chatters! (${amountShare} ${conf.currencyName} each)`)
				chat.say(redeem.channel, `/me 🙏 PRAISE ${redeem.username.toUpperCase()}! 🙏`)
			}).catch(err => chat.say(redeem.channel, `@${conf.streamer.username} dont panic, but something went wrong`))
		}
	}

}

module.exports = new Item();