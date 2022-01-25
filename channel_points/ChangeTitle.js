const common = require('./common');
const cpItem = require('./_interface')

module.exports = new class ChangeTitle extends cpItem {
   constructor() {
      super()
      this.id = 'ChangeTitle';
      this.duration = 10 * Time.MINUTE;

      this.oldTitle = '';
      this.timer = 0;

      super.register({ id: '3b8ef7f2-7c74-43b6-bd82-f2e10f364828', cooldown: 0, userCooldown: 0, event: false })

   }

   onRedeem(redemption) {


      if (this.timer == 0) {
         this.oldTitle = stream.status.title;
         let newTitle = redemption.user_input;

         api.put(`channels/${conf.streamer.id}`, { version: 'kraken', body: { channel: { status: newTitle } } }); //! NOTE: Can't use HELIX due to "PATCH" method required (not PUT)
         this.log(`Title changed to: ${newTitle}`)
         this.timer = setTimeout(() => {
            // Restore old title
            stream.status.title = this.oldTitle;
            api.put(`channels/${conf.streamer.id}`, { version: 'kraken', body: { channel: { status: this.oldTitle } } });
            this.log(`Title changed to: ${this.oldTitle}`);
            clearTimeout(this.timer);
            this.timer = 0;
         }, this.duration - 10 * Time.SECOND);
      }
   }
}