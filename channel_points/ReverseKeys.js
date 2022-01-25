const cpItem = require('./_interface')

var child_process = require('child_process')


module.exports = new class ReverseKeys extends cpItem {
   constructor() {
      super()
      this.id = 'Reverse Keys';
      this.AHK = 'C:/Program Files/AutoHotkey/AutoHotkey.exe'

      this.proc = undefined;
      this.timer = 0;

      this.defaultDuration = 20;
      this.bitsPerMinute = 100;

      // 30s CD [{"operationName":"WithIsStreamLiveQuery","variables":{"id":"37433468"},"extensions":{"persistedQuery":{"version":1,"sha256Hash":"04e46329a6786ff3a81c01c50bfa5d725902507a0deb83b0edbf7abe7a3716ea"}}}]
      super.register({ id: 'b42a5381-747d-41f3-8689-08601dd66d10', cooldown: 0, userCooldown: 0, event: false })
   }

   async onRedeem(redemption) {
      if (this.proc && !this.proc.killed) {
         this.timer += this.defaultDuration / 2;
         return;
      }
      this.proc = child_process.spawn(this.AHK, ['.\\ahk\\reverse_keys.ahk']);
      this.timer = this.defaultDuration;
      chat.on('PRIVMSG/CHEER', this.onCheerBits);
      if (redemption.reward.cost > 0)
         stream.say(`LUL Nice walking! Cheer bits to increase ${redemption.reward.title} duration 😂`);
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