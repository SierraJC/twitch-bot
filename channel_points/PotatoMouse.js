const cpItem = require('./_interface')

var child_process = require('child_process')


module.exports = new class PotatoMouse extends cpItem {
   constructor() {
      super()
      this.id = 'Potato Mouse';
      this.AHK = 'C:/Program Files/AutoHotkey/AutoHotkey.exe'

      this.proc = undefined;
      this.timer = 0;

      this.defaultDuration = 20;
      this.bitsPerMinute = 100;

      // 30s CD  [{"operationName":"UpdateCustomChannelPointsReward","variables":{"input":{"rewardID":"86a314d5-fc8b-4307-b5e1-4fe95400de69","channelID":"37433468","backgroundColor":"#FF0606","cost":3000,"isSubOnly":false,"isUserInputRequired":false,"maxPerStreamSetting":{"maxPerStream":0,"isEnabled":false},"maxPerUserPerStreamSetting":{"maxPerUserPerStream":0,"isEnabled":false},"globalCooldownSetting":{"globalCooldownSeconds":30,"isEnabled":true},"prompt":"Something is wrong with my mouse?!? Why can't I aim!?!? AAAAAAA! * Anyone can cheer bits to increase the duration & intensity!","title":"Potato Mouse","shouldRedemptionsSkipRequestQueue":false}},"extensions":{"persistedQuery":{"version":1,"sha256Hash":"4ef6b13f2f1cd4456ab12df72340e858a61fb285d01d5f8a1369a22f8d75f50a"}}}]
      super.register({ id: '86a314d5-fc8b-4307-b5e1-4fe95400de69', cooldown: 0, userCooldown: 0, event: false })
   }

   async onRedeem(redemption) {
      if (this.proc && !this.proc.killed) {
         this.timer += this.defaultDuration / 2;
         return;
      }
      this.proc = child_process.spawn(this.AHK, ['.\\ahk\\mouse_gasm.ahk']);
      this.timer = this.defaultDuration;
      chat.on('PRIVMSG/CHEER', this.onCheerBits);
      if (redemption.reward.cost > 0)
         stream.say(`LUL Nice aim! Cheer bits to increase ${redemption.reward.title} duration & intensity 😂`);
      while (this.timer > 0) {
         await sleep(1000);
         this.timer--;
      }
      chat.removeListener('PRIVMSG/CHEER', this.onCheerBits)
      this.proc.kill();
   }

   onCheerBits(data) { // todo: need bits data from real event
      let inc = Math.ceil(data.bits / this.bitsPerMinute * 60);
      this.timer += inc;
      stream.say(`${data.tags.displayName} added ${inc}s to the duration! (${this.timer}s remaining)`);
   }
}