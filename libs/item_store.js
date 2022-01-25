const BotLib = require('./_interface')
const fs = require('fs')
const path = require('path')

class ItemStore extends BotLib {
	constructor() {
		super()

		//? Configuration
		this.activeInterval = 20; //? Minutes to be considered active (chatters array will be cleared then rewarded)
		this.bonusCurrency = 2;   //? Bonus currency to award per activeInterval
		this.subBonus = 1;				//? Additional to bonusCurrency to give per activeInterval to subcribers

		this.items = [];
		this.chatters = [];

		chat.on('PRIVMSG', obj => obj.message.charAt(0) == '!' ? true : this.addActive(obj.username)); // Add active if not a !command
		setInterval(() => this.rewardActive(), this.activeInterval * 60 * 1000)
	}
	init() {
		// Called after all libs are loaded and constructors called. Must return true or lib will unload

		fs.readdirSync("./item_store/").forEach((file) => {
			if (!file.startsWith('_') && path.extname(file).toLowerCase() === '.js') {
				let itemPath = `../item_store/${file}`
				let item = require(itemPath)

				item.id = item.id.toLowerCase();
				item.handler = this;

				if (!this.items[item.id]) {
					this.items[item.id] = item;
					this.log(`Loaded: "${item.id}"`);
				}

			}

		});

		stream.events.on('redemption', (item) => setTimeout(() => this.onRedeem(item), 250)); // Force delay before item trigger
		stream.events.on('obs:liveChange', live => live ? true : this.rewardActive()); // Award points when Stop Streaming button is pressed
		// chat.on('PRIVMSG', obj => {
		// 	// console.log(obj)
		// 	//obj.message.charAt(0) == '!' ? true : this.addActive(obj.username)
		// }); // Add active if not a !command

		return true;
	}

	addActive(username) {
		if (!stream.status.live || this.chatters.includes(username) || viewers.blacklist.includes(username)) return;
		this.chatters.push(username);
	}

	async rewardActive() {
		let lChatters = this.chatters.slice(0);
		let userUpdates = [];
		this.chatters = []; // Use a local clone of chatters and purge it so we dont accidentally double reward (due to forced reward like stream offline)

		lChatters.forEach((chatter) => {
			if (viewers.viewers[chatter]) { // If they are still in the viewer list
				let amount = (this.bonusCurrency + (viewers.subscribers[chatter] ? this.subBonus : 0));
				userUpdates.push({ username: chatter, current: amount, alltime: amount })
				stream.currencyAwarded += parseInt(amount);
			}
		});

		if (userUpdates.length > 0) {
			this.log(`Rewarding chatters: ${lChatters.join(', ')}`)
			// se_api.updatePoints({ mode: 'add', users: userUpdates }).catch(err => this.error(err));
		}

	}

	onRedeem(data) {
		let [redeemUser, redeemItem] = [data.redeemer.username, data.item.name.toLowerCase()];

		this.log(`? "${redeemUser}" redeemed "${redeemItem}" from the Item Store`);

		if (this.items[redeemItem]) {
			try {
				this.items[redeemItem].onRedeem({ channel: stream.channel, username: redeemUser, data: data });
			} catch (err) {
				this.error('error during item redemption:', err)
			}
		}
	}
}

module.exports = new ItemStore();

// Listen for chat messages
// chat.on('PRIVMSG', obj => {
// 	if ([conf.streamer.username, conf.bot.username, 'streamelements'].includes(obj.username)) {
// 		let regexItemRedeem = /(.*) just redeemed (.*) from the Item Store/;
// 		let itemRedeem = obj.message.match(regexItemRedeem);
// 		if (itemRedeem !== null) {
// 			let [redeemUser, redeemItem] = [itemRedeem[1], itemRedeem[2].toLowerCase()];
// 			module.exports.onRedeem({redeemer: {username: redeemUser},item:{name:redeemItem}})
// 		}
// 	}
// })
