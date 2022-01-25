const ChatCommand = require('./_interface')
// const humanizeDuration = require("humanize-duration");
const intervalToDuration = require('date-fns/intervalToDuration');


class HRT extends ChatCommand {
	constructor() {
		super()
		this.id = 'HRT';
		this.startDate = db.config.get('modules.hrt.startDate').value() || 0;
		// this.formatOpts = { largest: 3, conjunction: ' and ' };

		// ? Permissions: BROADCASTER, MOD, VIP, SUB, REG, TIME/# (mins), ALL
		super.register({ trigger: '!hrt', minPermission: 'ALL', cooldown: 0, userCooldown: 5, pubHandler: this.onChatMessage, privHandler: this.onWhisper })

		setTimeout(() => {
			this.log(`!!!! HRT for ${this.formatOutput(5)} !!!!`)
		}, 5000);
	}

	formatOutput(precision = 3) {
		let data = intervalToDuration({ start: this.startDate, end: Date.now() });

		// Calculate weeks value to date-fns/intervalToDuration output
		data.weeks = Math.floor(data.days / 7);
		data.days = data.days % 7;

		let result = [];
		for (let unit of ['year', 'month', 'week', 'day', 'hour', 'minute', 'second'])
			if (data[unit + 's'] > 0)
				result.push(`${data[unit + 's']} ${unit}${data[unit + 's'] > 1 ? 's' : ''}`);

		if (precision > result.length) precision = result.length;
		
		return result.slice(0, precision - 1).join(', ') + ', and ' + result.slice(precision - 1, precision);
	}

	async onChatMessage(cmd) { // {cmd.raw, cmd.src, cmd.params}
		stream.say(`/me PridePaint Sierra has been on HRT for ${this.formatOutput(!isNaN(cmd.params[1]) ? Number(cmd.params[1]) > 1 ? Number(cmd.params[1]) : undefined : undefined)}!`)
	}
	async onWhisper(cmd) { // {cmd.raw, cmd.src, cmd.params}

	}
}

module.exports = new HRT();