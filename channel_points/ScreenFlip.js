const cpItem = require('./_interface')

var child_process = require('child_process')

module.exports = new class ScreenFlip extends cpItem {
   constructor() {
      super()
      this.id = 'ScreenFlip';
      this.RunProgram = '.\\channel_points\\MultiMonitorTool\\MultiMonitorTool.exe'

      this.proc = undefined;
      this.timer = 0;

      this.defaultDuration = 20;
      this.bitsPerMinute = 100;

      this.monitorID = 'MONITOR\\AUS24B1\\{4d36e96e-e325-11ce-bfc1-08002be10318}\\0008'; //? Can use '\\\\.\\DISPLAY1' as well

      super.register({ id: 'aa3ab546-51f2-4e6e-be9a-4970cf085b39', cooldown: 0, userCooldown: 0, event: false })

   }

   async onRedeem(redemption) {
      if (stream.silentMode) return;
      if (this.timer > 0) {
         this.timer += this.defaultDuration;
         return;
      }
      this.proc = child_process.spawn(this.RunProgram, ['/SetOrientation', this.monitorID, '180']);
      // obs.send('SetSceneItemProperties', { 'scene-name': 'Gameplay Container', 'item': 'PC NDI Capture', scale: { x: 1, y: -1 } }).catch(err => this.log(err));
      obs.send('SetSourceFilterVisibility', { sourceName: 'Gameplay Container', filterName: 'Flip Begin', filterEnabled: true }).catch(err => this.log(err));

      this.timer = this.defaultDuration;
      chat.on('PRIVMSG/CHEER', this.onCheerBits);
      if (redemption.reward.cost > 0)
         stream.say(`LUL Cheer bits to increase ${redemption.reward.title} duration 😂 (${this.defaultDuration}s)`);
      while (this.timer > 0) {
         await sleep(1000);
         this.timer--;
      }
      chat.removeListener('PRIVMSG/CHEER', this.onCheerBits)
      this.proc = child_process.spawn(this.RunProgram, ['/SetOrientation', this.monitorID, '0']);
      // obs.send('SetSceneItemProperties', { 'scene-name': 'Gameplay Container', 'item': 'PC NDI Capture', scale: { x: 1, y: 1 } }).catch(err => this.log(err));
      obs.send('SetSourceFilterVisibility', { sourceName: 'Gameplay Container', filterName: 'Flip End', filterEnabled: true }).catch(err => this.log(err));
   }

   onCheerBits(data) { // todo: need bits data from real event
      let inc = Math.ceil(data.bits / this.bitsPerMinute * 60);
      this.timer += inc;
      stream.say(`${data.tags.displayName} added ${inc}s to the duration! (${this.timer}s remaining)`);
   }
}