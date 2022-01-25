const BotLib = require('./_interface')
const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')

class Database extends BotLib {
	constructor() {
		super()

		this.adapters = {};
		this.adapters.viewers = new FileSync('./database/viewers.json')
		this.adapters.config = new FileSync('./database/config.json')

		this.viewers = low(this.adapters.viewers)
		this.config = low(this.adapters.config)

		//fs.copyFileSync('db.json', 'db.old.json');

		//this.db.defaults({ viewers: [], blacklist: [] }).write();
		global.db = this;
	}

	init() {
		return true;
	}
}

module.exports = new Database();