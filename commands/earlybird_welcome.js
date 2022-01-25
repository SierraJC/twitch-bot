const ChatCommand = require('./_interface')

class Command extends ChatCommand {
	constructor() {
		super()
		this.id = 'welcome_bonus';
		this.earlyWindow = 20 // minutes since start to be considered for early bonus
		this.bonusCurrency = 10; // Points to add after 15 minute window expires. User must be in viewer list still
		this.bonusPerUser = 3; // Extra points to add per person who also participated
		this.available = false;

		this.userUpdates = [];

		super.register({ trigger: /(\b[REDACTED]\b)/i, minPermission: 'SUB', cooldown: 0, userCooldown: 1, pubHandler: this.onSubHello })

		//super.register({ trigger: '!test', minPermission: 'TIME/90', cooldown: 0, userCooldown: 1, pubHandler: this.onSubHello })

		stream.events.on('obs:liveChange', live => {
			if (live) {
				this.available = true;
				setTimeout(() => this.awardPoints(), this.earlyWindow * 60 * 1000);
			}
		})

		stream.events.on('obs:sceneChange', data => {
			if (stream.status.live && data.sceneName == 'End Stream') {
				this.available = true;
				stream.events.once('obs:liveChange', live => live ? true : this.awardPoints()); // Award points when Stop Streaming button is pressed
			}
		})

		//setTimeout(() => this.onRedeem({channel:'',username:'', data = {}}),1000);
	}

	awardPoints() {
		if (!this.available) return;
		this.available = false;
		if (stream.status.live && this.userUpdates.length > 0) {
			// Exclude people that aren't in the viewer list still
			let strList = []; // This array is used to format a list of people who are rewarded
			let num = this.userUpdates.length;
			for (var i = num; i--;) {
				if (!viewers.viewers[this.userUpdates[i].username]) this.userUpdates.splice(i, 1)
				else {
					strList.push(this.userUpdates[i].username);
					this.userUpdates[i].current += this.bonusPerUser * num; // Base amount + bonus for number of people that said hi
					this.userUpdates[i].alltime = this.userUpdates[i].current;
					stream.currencyAwarded += parseInt(this.userUpdates[i].current);
				}
			}
			// stream.say(`${strList.join(', ')} earnt bonus ${conf.currencyName}! SeemsGood`)
			// se_api.updatePoints({ mode: 'add', users: this.userUpdates }).catch(err => { });
			this.log(JSON.stringify(this.userUpdates));
			this.userUpdates = [];
		}
	}


	async onSubHello(cmd) { // {cmd.raw, cmd.src, cmd.params}
		if (this.available && cmd.raw.username != conf.streamer.username) {
			cmd.src.timers.users[cmd.raw.username] = Date.now() + ((this.earlyWindow + 1) * 60 * 1000); // Set user cooldown to earlyWindow + 1 minute to ensure no duplicate calls
			this.log(`${cmd.raw.username} said hello!`)
			this.userUpdates.push({ username: cmd.raw.username, current: this.bonusCurrency })
		}
	}
}

module.exports = new Command();
