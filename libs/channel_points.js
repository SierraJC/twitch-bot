const BotLib = require('./_interface')
const fs = require('fs')
const path = require('path')
const TwitchPS = require('twitchps');

// todo: cooldowns

/*
 todo: bat onesie?
 todo: dab...
 todo: call in.... during just chatting.
 todo: squats for points?
 todo: CANCEL LAST REWARD.....
*/


class ChannelPoints extends BotLib {
	constructor() {
		super()
		this.ps = new TwitchPS(
			{
				init_topics: [
					{ topic: `channel-points-channel-v1.${conf.streamer.id}`, token: conf.streamer.token },
					{ topic: `video-playback.${conf.streamer.username}` }
				],
				reconnect: true,
				debug: false
			}
		);
		this.modules = [];

		this.stats = {};

	}

	save() {
		db.config.set('modules.cpStats', this.stats).write();
	}

	init() {
		fs.readdirSync("./channel_points/").forEach((file) => {
			if (!file.startsWith('_') && path.extname(file).toLowerCase() === '.js') {
				let modulePath = `../channel_points/${file}`
				let module = require(modulePath);

				module.handler = this;

				if (!this.modules[module.id]) {
					this.modules[module.id] = module;
					this.log(`Loaded: "${module.id}"`);
				}

			}

		});

		setInterval(() => { // Garbage collection routine
			Object.keys(this.modules).forEach(id => this.modules[id]._cleanup())
		}, 15 * (60 * 1000));

		this.stats = db.config.get('modules.cpStats').value() || {};
		this.ps.on('channel-points', (data) => this.onRedeem(data.redemption));

		global.testRedeem = (itemID, input) => this.testRedeem(itemID, input);

		return true;
	}

	testRedeem(itemID, user_input = '') {
		if (itemID.toLowerCase().match(/^[a-z0-9]{8}-[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{12}$/)) {
			let redemption = {
				channel_id: conf.streamer.id,
				user_input,
				user: {
					id: conf.streamer.id,
					login: conf.streamer.username,
					display_name: conf.streamer.username
				},
				reward: {
					id: itemID,
					title: 'ManualRedeem',
					cost: 0,
					max_per_stream: { is_enabled: false }
				}
			}
			return this.onRedeem(redemption);
		}
	}

	onRedeem(redemption) {
		if (redemption.channel_id != conf.streamer.id) return; // Wrong channel ID?
		try {
			if (redemption.user.id != conf.streamer.id && redemption.reward.cost > 0) {
				if (!this.stats[redemption.reward.id]) this.stats[redemption.reward.id] = {}
				this.stats[redemption.reward.id].name = redemption.reward.title;
				this.stats[redemption.reward.id].last = Date.now();
				this.stats[redemption.reward.id].count = (this.stats[redemption.reward.id].count || 0) + 1;
				this.stats[redemption.reward.id].spent = (this.stats[redemption.reward.id].spent || 0) + redemption.reward.cost;
				this.save();
				if (!redemption.reward.title.startsWith('yeet '))
					stream.pointsSpent += redemption.reward.cost;
			}
		} catch (err) {
			this.error('Error while saving redemption stats');
			this.error(err);
		}

		this.log(`? "${redemption.user.display_name}" redeemed "${redemption.reward.title}" with Channel Points${redemption.reward.max_per_stream.is_enabled ? ` (${redemption.reward.redemptions_redeemed_current_stream}/${redemption.reward.max_per_stream.max_per_stream})` : ''}`);

		let user = viewers.get(redemption.user.login)
		user.lastRedeem = Date.now();
		redemption._user = user;

		if (!redemption.reward.title.startsWith('yeet '))
			user.pointsSpent = (user.pointsSpent || 0) + redemption.reward.cost;

		try {
			Object.keys(this.modules).forEach(id => {
				for (let i in this.modules[id].rewards) {
					let reward = this.modules[id].rewards[i];
					if (reward.id && reward.id == redemption.reward.id) {
						if (reward.event)
							reward.event.apply(this.modules[id], [redemption])
						else
							this.modules[id].onRedeem(redemption);
						continue;
					}
				}
			});
		} catch (err) {
			this.error(err);
		}
	}

	/*
data. 
channel_id:'37433468'
redeemed_at:'2020-09-09T07:38:50.641833487Z'
redemption:{id: '680ec5e0-c676-48ac-a869-c5b5737e3664', user: {…}, channel_id: '37433468', redeemed_at: '2020-09-09T07:38:50.641833487Z', reward: {…}}
reward:{id: '5de517de-5baf-4698-983d-70961ade65c6', channel_id: '37433468', title: 'yeet 2.5k', prompt: 'yeet', cost: 2500}
status:'FULFILLED'
timestamp:'2020-09-09T07:38:50.641833487Z'
user_input:undefined

.reward:
background_color:'#9147FF'
channel_id:'37433468'
cooldown_expires_at:null
cost:10000
default_image:{url_1x: 'https://static-cdn.jtvnw.net/custom-reward-images/default-1.png', url_2x: 'https://static-cdn.jtvnw.net/custom-reward-images/default-2.png', url_4x: 'https://static-cdn.jtvnw.net/custom-reward-images/default-4.png'}
global_cooldown:{is_enabled: false, global_cooldown_seconds: 0}
id:'3a4f1e9d-32c0-42d2-91d3-4657e9961399'
image:null
is_enabled:true
is_in_stock:true
is_paused:false
is_sub_only:false
is_user_input_required:false
max_per_stream:{is_enabled: false, max_per_stream: 0}
max_per_user_per_stream:{is_enabled: false, max_per_user_per_stream: 0}
prompt:'yeet'
redemptions_redeemed_current_stream:0
should_redemptions_skip_request_queue:true
template_id:null
title:'yeet 10k'
updated_for_indicator_at:'2020-09-09T08:46:48.085894605Z'

	*/

}

module.exports = new ChannelPoints();