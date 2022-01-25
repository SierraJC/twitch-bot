const cpItem = require('./_interface')

module.exports = new class PuppyCam extends cpItem {
   constructor() {
      super()
      this.id = 'PuppyCam';
      this.timer = 0;
      this.tmrEndCam = undefined;

      super.register({ id: '573a1a90-4a7e-4f98-9231-3446ca8c8c40', cooldown: 0, userCooldown: 0, event: false })
      this.duration = 120; //? Seconds
      this.scene = 'PuppyCam [NS]';
      this.source = 'PuppyCam';

      this.durationPadding = 3; //? add 3 seconds because browser timer is slow to load
      this.duration += this.durationPadding;
   }

   async onRedeem(redemption) {
      let now = Date.now();
      let source = await obs.send('GetSceneItemProperties', { 'scene-name': this.scene, 'item': this.source }).catch(err => this.error(err));
      if (source && !source.visible) {
         await obs.send('SetSourceSettings', { sourceName: `${this.source} Timer`, sourceType: 'browser_source', sourceSettings: { url: `http://www.gaglioni.net/countdown/countdown.php?t=${(this.duration - this.durationPadding) / 60}&fcolor=white&bold=on&bcolor=transparent&${now}` } }).catch(err => this.error(err));
         await obs.send('SetSceneItemProperties', { 'scene-name': this.scene, 'item': this.source, 'visible': true });
         this.timer = now + (this.duration * 1000);
         this.tmrEndCam = setTimeout(() => this.endCam(), this.duration * 1000);
      } else if (source.visible && this.timer > 0) { // Add to timer duration
         let newTimer = this.timer - now + (this.duration * 1000)
         clearTimeout(this.tmrEndCam);
         await obs.send('SetSourceSettings', { sourceName: `${this.source} Timer`, sourceType: 'browser_source', sourceSettings: { url: `http://www.gaglioni.net/countdown/countdown.php?t=${((newTimer / 1000) - this.durationPadding) / 60}&fcolor=white&bold=on&bcolor=transparent&${now}` } }).catch(err => this.error(err));
         this.tmrEndCam = setTimeout(() => this.endCam(), newTimer);
         this.timer = now + (this.duration * 1000) + (this.timer - now);
      }
   }

   endCam() {
      this.timer = 0;
      obs.send('SetSceneItemProperties', { 'scene-name': this.scene, 'item': this.source, 'visible': false });
      clearTimeout(this.tmrEndCam);
   }
}