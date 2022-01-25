const BotLib = require('./_interface')

class TimerManager extends BotLib {
	constructor() {
		super()
		this.timers = [];

		this.chatLinesHistory = [];
		this.chatLinesLast = 0;

		global.timerManager = this;

	}

	init() {
		let now = Date.now();

		this.timers = db.config.get('modules.timers').value();
		//! Delayed because if we change the object, it gets saved due to write() being called for streamelements blacklist
		setTimeout(() => this.timers.map(timer => {
			timer._lastSent = now;
			timer._lastIndex = 0;
		}), 1000)

		setInterval(() => this.updateChatLines(), 1 * 60000)
		setInterval(() => this.doTimedMessage(), 1 * 60000)
		this.doTimedMessage()

		return true;
	}

	updateChatLines() {
		this.chatLinesHistory.push(stream.chatLines - this.chatLinesLast) > 5 ? this.chatLinesHistory.shift() : false;
		this.chatLinesLast = stream.chatLines;
		this.chatLinesRecent = this.chatLinesHistory.reduce((a, b) => a + b, 0)
	}

	doTimedMessage() {
		let now = Date.now();
		if (stream.status.live)
			for (const timer of this.timers)
				if (now - timer._lastSent >= (timer.minCooldown * 60000))
					if (timer.enabled && stream.status.viewers >= timer.minViewers && (timer.maxViewers == 0 || stream.status.viewers <= timer.maxViewers) && this.chatLinesRecent >= timer.minChatLines) {
						timer._lastSent = now;
						if (Array.isArray(timer.message)) {
							stream.say(timer.message[timer._lastIndex]);
							timer._lastIndex = (timer._lastIndex == timer.message.length - 1) ? 0 : timer._lastIndex + 1;
						} else
							stream.say(timer.message);
						//this.log(`Timed Message: ${timer.message}`)
						break;
					}
	}

}

module.exports = new TimerManager();