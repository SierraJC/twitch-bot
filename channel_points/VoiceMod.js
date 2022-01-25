const cpItem = require('./_interface')

module.exports = new class VoiceMod extends cpItem {
   constructor() {
      super()
      this.id = 'VoiceMod';
      this.timer = 0;
      this.defaultDuration = 20;
      this.micSource = 'Microphone (NDI)'
      this.vcSource = 'Comms (NDI)'

      super.register({ id: '7c30ddb1-91df-425b-89f5-f69a713535c7', cooldown: 0, userCooldown: 0, event: (r) => this.onRedeem(r, 'High Pitch (Pitchproof)') })
      super.register({ id: '013f16ae-65a5-46b5-85d4-4bce85a67f60', cooldown: 0, userCooldown: 0, event: (r) => this.onRedeem(r, 'Robot (Pitchproof)') })

   }

   async onRedeem(redemption, filterName) {

      if (this.timer > 0) {
         this.timer += this.defaultDuration;
         return;
      }

      obs.send('SetSourceFilterVisibility', { sourceName: this.micSource, filterName, filterEnabled: true });
      obs.send('SetSourceFilterVisibility', { sourceName: this.vcSource, filterName, filterEnabled: true });
      // obs.send('SetAudioMonitorType', { sourceName: this.micSource, monitorType: 'monitorOnly' });

      this.timer = this.defaultDuration;
      while (this.timer > 0) {
         await sleep(1000);
         this.timer--;
      }

      // obs.send('SetAudioMonitorType', { sourceName: this.micSource, monitorType: 'none' });
      obs.send('SetSourceFilterVisibility', { sourceName: this.micSource, filterName, filterEnabled: false });
      obs.send('SetSourceFilterVisibility', { sourceName: this.vcSource, filterName, filterEnabled: false });

   }
}