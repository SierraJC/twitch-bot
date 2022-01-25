const BotLib = require('./_interface')
const fs = require('fs')
const path = require('path');

var fetchUtil = require('twitch-js/lib/utils/fetch').default;
// calculate minutes for going live/ending stream

class UserManager extends BotLib {
	constructor() {
		super()
		this.viewers = {}
		this.chatters = [];
		this.subscribers = {}
		this.followers = null;

		this.blacklist = [conf.bot.username];
		this.watchUpdateFreq = conf.userUpdateFreq // Minute interval to update watchTime

		global.viewers = this;

		chat.on('JOIN', obj => this.add(obj.username));
		chat.on('PART', obj => this.del(obj.username));
		chat.on('353', obj => { // NAMES list
			if (obj.usernames)
				for (let i in obj.usernames)
					this.add(obj.usernames[i])
		});
	}
	init() {
		// Called after all libs are loaded and constructors called. Must return true or lib will unload

		this.blacklist = db.config.get('blacklist').value();
		this.maintenanceLastRun = db.config.get('maintenance.lastRun').value();

		setInterval(() => this.updateAll(), this.watchUpdateFreq * 60 * 1000);

		setTimeout(() => this.update_subs(), 5000);
		setInterval(() => this.update_subs(), 30 * 60 * 1000);

		// Get our loyalty blacklist and save it to the db, THEN we want to update chatter list
		se_api.getLoyaltySettings().then(response => {
			this.blacklist = response.loyalty.ignored.filter(e => e !== conf.streamer.username);
			db.config.set('blacklist', this.blacklist).write();
			setTimeout(() => this.getUserListAPI(), 1000);
		});

		// setTimeout(() => this.add('tester'), 15000);
		// setTimeout(() => {this.viewers['tester'].isBroadcaster = true;this.del('tester')}, 20000);


		if ((Date.now() - this.maintenanceLastRun) > 1 * (24 * 60 * 60 * 1000) && new Date().getDay() == 1) // Execute on Mondays(1)
			setTimeout(() => this.maintenance(), 5000);

		stream.events.on('follow', (username) => this.set(username, 'followGame', stream.status.game));
		stream.events.on('redemption', (item) => {
			this.set(item.redeemer.username, 'lastRedeem', Date.now());
			this.set(item.redeemer.username, 'currencySpent_SE', (this.get(item.redeemer.username)['currencySpent_SE'] || 0) + item.item.cost)
		});
		stream.events.on('subscriber', (sub) => {
			//let viewer = viewers.get(sub.username)
		});

		this.maintenance_checker();
		return true;
	}

	default(opts) { // Using undefined instead of false, to save space in json file
		return Object.assign({
			id: undefined,
			username: opts.username,
			displayName: opts.displayName || opts.username,
			lastMessage: opts.lastMessage || undefined,
			lastSeen: 0,
			lastRedeem: undefined,
			currencySpent_SE: undefined,
			pointsSpent: undefined,
			watchTime: 0,
			chatLines: 0,
			followGame: undefined,
			isBroadcaster: undefined,
			isMod: undefined,
			isVIP: undefined,
			isSub: undefined
		}, opts)
	}

	async maintenance_checker() {
		// This code is for populating missing user IDs
		// let users = db.viewers.get('viewers').value();
		// let reqUsers = []
		// for (let i in users) {
		// 	let user = users[i];
		// 	if (!('id' in user)) {
		// 		reqUsers.push(user.username);
		// 		console.log('added '+user.username)
		// 	}

		// let users = db.viewers.get('viewers').value();
		// for (let i in users) { // Loop through users backwards due to live array purging (slice = clone)
		// 	let user = users[i];
		// 	if (user.watchTime > 60 * 60) { // Hours
		// 		this.log(`${user.username} is a regular`)
		// 	}
		// 	this.save(user);
		// }


		// 	if (reqUsers.length == 1) {
		// 		let data = await api.get(`users`, { version: 'kraken', search: { login: reqUsers.join(',') } });
		// 		data.users.forEach((user) => {
		// 			this.set(user.name,'id',Number(user.id));
		// 			//this.set(user.name,'displayName',user.displayName);
		// 		});
		// 		console.log(data);
		// 		reqUsers = [];
		// 	}

		// };
	}

	async maintenance() {
		// Remove blacklisted users, remove people who havent been seen in a (very) long time?
		if (stream.status.live) return;
		this.log('**** Running Maintenance *****');
		let now = Date.now();
		fs.copyFileSync('database/viewers.json', `database/backups/viewers.${now}.json`);
		this.maintenanceLastRun = now;
		db.config.set('maintenance.lastRun', this.maintenanceLastRun).write();

		let decayPerc = 20;      //? Percent to decay 
		let decayMin = 950;    //? Must have X currency to get decayed, and wont decay below
		let inactiveDecay = 0.5 //? Multiplier per day of not redeeming currency
		let inactiveMaxDays = 60 //? Upper limit of days to decay for (never redeemed users are forced to upper limit)
		let inactiveMinPoints = 25 //? Minimum points for inactive decay

		let userUpdates = [];


		// let result = await se_api.makeRequest('GET', `points/${se_api.accountId}/watchtime`,{limit: 25, offset: 25}).catch(() => { });
		// console.log(result); // Not using API because offset doesnt work and is limited to top 25 :(

		// this.blacklist.forEach((item) => {
		// 	userUpdates.push({ username: item, current: 1, alltime: 1, timeOnline: 1 }) // Can't be 0 for unknown reason
		// });

		/*

		// ! Get top 100 currency users and decay them if inactive or hoarding
		let response = await se_api.getTopPointsUsers(100, 0).catch(() => { });
		if (response) {
			for (let i in response.users) {
				let user = response.users[i];
				if (user.points > decayMin) { //? Check for too much XP (hoarding), and decay a chunk
					let toRemove = Math.floor(user.points * decayPerc / 100);
					let newPoints = (user.points - toRemove) < decayMin ? decayMin : (user.points - toRemove);
					this.debug(`${user.username} has ${user.points} and will decay ${toRemove}, leaving ${newPoints} ${conf.currencyName}`);
					userUpdates.push({ username: user.username, current: newPoints })
					user.points = newPoints; // Assign so inactivity penalty is based on new amount

				}
				//? Now decay inactive store users
				let dbUser = viewers.get(user.username)
				if (((now - dbUser.lastRedeem) > 1 * (24 * 60 * 60 * 1000) || !dbUser.lastRedeem) && user.points > inactiveMinPoints) { // Days
					let inactiveDays = Math.floor((now - dbUser.lastRedeem) / 1000 / 60 / 60 / 24) || inactiveMaxDays;
					inactiveDays = inactiveDays > inactiveMaxDays ? inactiveMaxDays : inactiveDays; // enforce upper limit of 60

					let inactivePerc = Math.round(inactiveDays * inactiveDecay);
					let toRemove = Math.floor(user.points * inactivePerc / 100);
					let newPoints = (user.points - toRemove) < 0 ? 0 : (user.points - toRemove);
					if (toRemove > 0) {
						this.debug(`${user.username} hasnt redeemed in ${inactiveDays} days, decay ${toRemove} (${inactivePerc}%), ${user.points} -> ${newPoints} ${conf.currencyName}`);
						userUpdates.push({ username: user.username, current: newPoints })
					}
					user.points = newPoints;
				}

				if (user.points > 0 && this.blacklist.includes(user.username)) { // Blacklisted user in top 100, purge them to the bowels of hell.
					this.debug(`${user.username} is blacklisted and has ${user.points}. PURGE THEM!`);
					userUpdates.push({ username: user.username, current: 1, alltime: 1, timeOnline: 1 }) // Can't be 0 for unknown reason
					this.purge(user.username);
				}
			}
		}

		// Commit updates via single API call
		if (userUpdates.length > 0)
			se_api.updatePoints({ mode: 'set', users: userUpdates }).then(response => this.debug(response));

			*/

		// //! Check for inactive and low view time accounts and purge from local database (30 days *)
		// db.viewers.get('viewers').value().slice().reverse().forEach((user) => { // Loop through users backwards due to live array purging (slice = clone)
		// 	if (user.watchTime <= 120 && ((now - user.lastSeen) > 60 * (24 * 60 * 60 * 1000))) { // Days
		// 		this.following(user.id || user.username).then(result => { // Running in a new thread, maybe bad?
		// 			if (!result) { // Not following
		// 				this.debug(`${user.username} purged due to inactivity and no follow ${result}`)
		// 				this.purge(user.username); // todo: cant remember why but I disabled purging, because of username changes?
		// 			}
		// 		})
		// 	}
		// });



		// //! Scan for high watch time but no follow, so usually lurk bots
		// let users = db.viewers.get('viewers').value();
		// for (let i in users) { // Loop through users backwards due to live array purging (slice = clone)
		// 	let user = users[i];
		// 	if (user.watchTime > 24 * 60 && !user.lastMessage) { // Hours
		// 		let isFollow = await this.following(user.id || user.username);
		// 		if (!isFollow) {
		// 			this.debug(`${user.username} has lurked multiple streams with no follow, maybe bot?`)
		// 			if (this.blacklist.includes(user.username))
		// 				this.purge(user.username);
		// 		}
		// 	}
		// }


		this.log('**** Finished Maintenance *****');
	}

	async following(user) {
		let id = typeof user !== 'number' ? await api.get('users', { search: { login: user } }).then((data) => data.data[0].id).catch(err => { }) : user;
		return id ? await api.get('users/follows', { search: { to_id: conf.streamer.id, from_id: id } }).catch(() => false) : false;
	}

	async getID(username) {
		let user = this.get(username);
		return user.id ? user.id : await api.get(`users`, { search: { login: username } }).then((data) => user.id = Number(data.data[0].id)).catch(err => undefined);
	}

	async getUserListAPI() {
		this.log(`Updating viewer list from TMI...`);
		let data = false;
		try {
			data = await fetchUtil(`https://tmi.twitch.tv/group/user/${conf.streamer.username}/chatters`, { 'method': 'get' });
		} catch (err) { }

		if (!data) return;

		let viewers = [];

		// merge the separate role arrays into one
		for (let prop in data.chatters)
			if (Array.isArray(data.chatters[prop]))
				data.chatters[prop].forEach((user) => viewers.push(user));

		// Match our memory list against the TMI list
		Object.keys(this.viewers).forEach((viewer) => {
			if (!viewers.includes(viewer))
				this.del(viewer); // Memory list user not found in TMI list
		})

		// Match TMI list against our memory one and add missing users
		viewers.forEach((viewer) => {
			if (!this.viewers[viewer])
				this.add(viewer)
		})

	}

	async update_subs(page = 0, after = '') {
		let perPage = 100;
		this.debug(`Fetching subs page #${page + 1}`)
		let response = await api.get('subscriptions', { search: { broadcaster_id: conf.streamer.id, first: perPage, after } });
		this.lastSubs = response;
		if (page == 0) {
			this.subscribers = {};
			this.subscribers._count = 0;
		}

		for (let i in response.data) {
			let sub = response.data[i];
			if (!this.subscribers[sub.userName.toLowerCase()]) {
				this.subscribers[sub.userName.toLowerCase()] = sub;

				this.subscribers._count++
			}
		}

		if (response.data.length == perPage)
			await this.update_subs(page + 1, response.pagination.cursor);

	}

	validate(username = '', inChat = false) {
		let reg = /^(#)?[\w]{2,24}$/;
		return (username.match(reg) != null) && inChat ? this.viewers[username] ? true : false : true;
	}
	sanitize(username = '') {
		return username[0] == '@' ? username.substring(1) : username;
	}

	async add(username) {
		if (this.viewers[username] || this.blacklist.includes(username)) return false;
		let viewer = this.get(username);
		if (viewer.lastSeen = 0) {
			// First time we've seen this user, do some stuff?
		}
		viewer.lastSeen = Date.now();
		// merge with defaults?
		viewer = this.default(viewer);
		this.viewers[username] = viewer;
		//this.save(viewer);
		this.log(`> JOIN: ${username}`)
		return viewer;
	}
	async del(username) {
		let viewer = this.viewers[username];
		if (!viewer) return;

		// Update watched time
		let now = Date.now()
		let timeToAdd = Math.floor((now - viewer.lastSeen) / 60000);
		if (stream.status.live)
			viewer.watchTime += timeToAdd;

		viewer.lastSeen = now;
		if (viewer.watchTime > 0)
			this.save(viewer)
		delete this.viewers[username];
		this.log(`< PART: ${username}`)
	}

	set(username, property, value) {
		let viewer = this.get(username);
		viewer[property] = value;
		if (!(username in this.viewers)) this.save(viewer); // Only force save if they arent already in the viewer list
	}

	count() {
		return Object.keys(this.viewers).length;
	}

	asArray() {
		let result = [];
		Object.keys(this.viewers).forEach(viewer => result.push(viewer))
		return result;
	}

	purge(username) {
		username = username.toLowerCase();
		db.viewers.get('viewers').remove({ username }).write();
		if (this.viewers[username]) delete this.viewers[username];
		return true;
	}

	get(username) {
		username = username.toLowerCase();
		return this.viewers[username] ? this.viewers[username] : db.viewers.get('viewers').find({ username }).value() || this.default({ username });
	}

	save(username) {
		let data = {};
		if (typeof username === 'object') data = username // This allows us to save user objects if they arent actively in the viewer list
		else data = this.viewers[username];

		let _db = db.viewers.get('viewers');
		let user = _db.find({ username: data.username });
		return (user.value() ? user.assign(data) : _db.push(data)).write();
		// todo: dont save vars starting with _?
	}

	forEach(callback) {
		for (let viewer in this.viewers)
			callback(this.viewers[viewer])
	}

	async updateAll(force = false) {
		let now = Date.now();

		for (let viewer in this.viewers) {
			viewer = this.viewers[viewer];

			let timeToAdd = Math.round((now - viewer.lastSeen) / 60000);
			viewer.lastSeen = now;
			if (stream.status.live || force)
				viewer.watchTime += timeToAdd;

			this.save(viewer.username);
		}

	}

	// Unofficial API? https://tmi.twitch.tv/group/user/${getChannel()}/chatters
	/*
	{
		"_links": {},
		"chatter_count": 6,
		"chatters": {
		"broadcaster": [],
		"vips": [],
		"moderators": [
			"logviewer",
			"streamelements"
		],
		"staff": [],
		"admins": [],
		"global_mods": [],
		"viewers": [
			"feuerwehr",
			"p0lizei_",
			"skarlettrayne",
			"skinnyseahorse"
		]
		}
	}
	*/

}

module.exports = new UserManager();