const BotLib = require('./_interface')

class Template extends BotLib {
	constructor() {
		super()
	}

	init() {
		return true;
	}
}

module.exports = new Template();