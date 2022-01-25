const BotLib = require('./_interface')
const fs = require('fs')
const Twitter_API = require('twitter')

// https://github.com/desmondmorris/node-twitter

class Twitter extends BotLib {
	constructor() {
		super()

		this.client = new Twitter_API({
			consumer_key: conf.twitter.consumer_key,
			consumer_secret: conf.twitter.consumer_secret,
			access_token_key: conf.twitter.access_token_key,
			access_token_secret: conf.twitter.access_token_secret
		});

		this.templates = {};
		this.templates.goinglive = fs.readFileSync('./database/twitter.goinglive.txt', 'utf8');
		//this.template.gamechange = fs.readFileSync('./database/twitter.gamechange.txt','utf8');
		//this.template.periodic = fs.readFileSync('./database/twitter.periodic.txt','utf8');

		this.tempTags = [];

		global.twitter = this;
	}

	init() {

		this._liveTweetID = db.config.get('modules.twitter.lastID').value();
		this._lastTweet = db.config.get('modules.twitter.lastTweet').value();
		this._lastName = db.config.get('modules.twitter.lastName').value();

		stream.events.on('status', status => {
			if (!status.old.live && status.new.live && status.old.title != '' && (Date.now() - this._lastTweet) > 5 * 60 * 1000) { // Online, and dont tweet on very first status update (blank title), and dont tweet if we tweeted recently
				this.log(status.new.game);
				if (this.liveTweetID > 0) { // There is already a live tweet 🤔
					this.delete(this.liveTweetID)
					this.liveTweetID = 0
					//return;
				};

				stream.dump_json('json/status.json', status);

				this.client.get('account/verify_credentials', {}).then(response => {
					this.lastName = response.name.includes('LIVE') ? this.lastName : response.name;
					return this.client.post('account/update_profile', { name: `(LIVE🔴) ${this.lastName}` });
				}).then(response => this.client.post('statuses/update', {
					status: this.templates.goinglive
						.replace('%game%', status.new.game != '' ? status.new.game : 'a game, but my dumbass bot failed to detect which one...').replace('%title%', status.new.title)
						.replace('%tempTags%', this.tempTags.join(' '))
						.replace('%URL%', `https://twitch.tv/${conf.streamer.username}`) //?${Date.now()}
				}))
					.then(tweet => {
						this.liveTweetID = tweet.id_str;
						this.log(`Created Live Tweet #${this.liveTweetID}`);
						api.put(`channels/${conf.streamer.id}`, { version: 'kraken', body: { channel: { game: 'Just Chatting' } } });
					})
					.catch(err => {
						this.error(err)
					});

			} else if (status.old.live && !status.new.live) { // Offline
				this.client.post('account/update_profile', { name: this.lastName });
			}
		});


		return true;
	}

	set liveTweetID(id) {
		this._liveTweetID = id;
		this._lastTweet = Date.now();
		db.config.set('modules.twitter.lastID', this._liveTweetID).set('modules.twitter.lastTweet', this._lastTweet).write();

	}
	get liveTweetID() {
		return this._liveTweetID;
	}

	set lastName(name) {
		this._lastName = name;
		db.config.set('modules.twitter.lastName', this._lastName).write();
	}
	get lastName() {
		return this._lastName;
	}

	async delete(id) {
		try {
			let result = await this.client.post(`statuses/destroy/${id}`, {})
			if (result) {
				this.log(`Deleted Tweet #${id}`);
				return true;
			}
		} catch (error) {
			this.error(error)
		}
		return false;
	}

}

module.exports = new Twitter();