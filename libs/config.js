const BotLib = require('./_interface')

const fs = require('fs')
const path = require("path");

class BotConfig extends BotLib {
	constructor() {
		super()
		this.filePath = path.join(__dirname,'/config.json')
		this.load();
	}
	init() {
		// Called after all libs are loaded and constructors called. Must return true or lib will unload
		return true;
	}
	load() {
		let data = JSON.parse(fs.readFileSync(this.filePath));
		global.conf = data;
	}
	save() {
		fs.writeFileSync(this.filePath, JSON.stringify(global.conf, null, 2));
	}
}

module.exports = new BotConfig();
