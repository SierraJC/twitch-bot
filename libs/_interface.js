const RootInterface = require('../_interface')

class BotLib extends RootInterface {
	constructor() {
		super()
		this.id = this.constructor.name;
	}
}

module.exports = BotLib;