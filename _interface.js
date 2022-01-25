const dateFormat = require('dateformat');

class RootInterface {
	constructor() {
		this._logDateFormat = 'HH:MM:ss';
	}

	log() {
		[].unshift.call(arguments, `${this._logDateFormat ? dateFormat(new Date(), this._logDateFormat)+' ':''}[${this.constructor.name}]`);
		console.log.apply(console,arguments)
	}
	error() {
		[].unshift.call(arguments, `${this._logDateFormat ? dateFormat(new Date(), this._logDateFormat)+' ':''}! [${this.constructor.name}]`);
		console.error.apply(console,arguments)
		return false;
	}
	debug() {
		[].unshift.call(arguments, `${this._logDateFormat ? dateFormat(new Date(), this._logDateFormat)+' ':''}* [${this.constructor.name}]`);
		console.debug.apply(console,arguments)
	}

}

module.exports = RootInterface;