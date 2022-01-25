const cpItem = require('./_interface')

module.exports = new class Item extends cpItem {
   constructor() {
      super()
      this.id = 'Beaned';
      this.beanBoozles = db.config.get('modules.beans').value();

      super.register({ id: '62e2582b-0b40-4484-9bf1-4281afe957b2', cooldown: 0, userCooldown: 0, event: false })

   }

   onRedeem(redemption) {
      let beans = this.beanBoozles.filter(bean => bean.qty > 0);
      var bean = beans[Math.floor(Math.random() * beans.length)];

      // Play SFX
      this.handler.modules['SoundFX'].onRedeem(redemption, 'mei-sorry.mp3', undefined, 3)

      setTimeout(() => {
         chat.say(stream.channel, `/me 🙏 RNGesus has chosen ${bean.colour} as the colour!`)
         chat.say(stream.channel, `/me Will Sierra get ${bean.good}? PogChamp or ${bean.bad}!?!? DansGame`)
         bean.qty--;
         // todo: where is this being saved?
      }, 3000);
   }
}