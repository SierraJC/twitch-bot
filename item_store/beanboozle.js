const StoreItem = require('./_interface')

class Item extends StoreItem {
	constructor() {
		super();
		this.id = 'beanboozled';
		this.beanBoozles = db.config.get('modules.beans').value();
	}
	onRedeem(redeem) {


		// var bean = this.beanBoozles[Math.floor(Math.random() * this.beanBoozles.length)];
		let beans = this.beanBoozles.filter(bean => bean.qty > 0);
		var bean = beans[Math.floor(Math.random() * beans.length)];

		setTimeout(() => {
			chat.say(redeem.channel, `/me 🙏 RNGesus has chosen ${bean.colour} as the colour!`)
			chat.say(redeem.channel, `/me Will Sierra get ${bean.good}? PogChamp or ${bean.bad}!?!? DansGame`)
			bean.qty--;
			
		}, 3000);
	}
}

module.exports = new Item();