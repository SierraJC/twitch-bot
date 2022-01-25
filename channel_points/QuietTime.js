const cpItem = require('./_interface')

module.exports = new class MuteMic extends cpItem {
   constructor() {
      super()
      this.id = 'MuteMic';

      super.register({ id: 'd7ecfcd3-02c2-432f-8f85-a42158002c4a', cooldown: 0, userCooldown: 0, event: false })

      this.timer = 0;
      this.running = false;

      this.defaultDuration = 30;
      this.bitsPerMinute = 200;
      // sleep(2000).then(() => this.onRedeem({reward: {title: 'MuteMic'}}));
   }

   async onRedeem(redemption) {
      if (this.running || !obs._connected) return;

      // Play warning SFX
      this.handler.modules['SoundFX'].onRedeem(redemption, 'shut-up.mp3', undefined, 3)

      let muteGrp = await obs.send('GetSceneItemProperties', { 'scene-name': 'Webcam Overlay', 'item': 'grpMuteTimer' }).catch(err => this.error(err));

      obs.send('SetSceneItemProperties', { 'scene-name': 'Webcam Overlay', 'item': 'jail-on.mp4', 'visible': true }).catch(err => this.log(err));
      await sleep(2500);
      obs.send('SetSceneItemProperties', { 'scene-name': 'Webcam Overlay', 'item': 'jail-down.png', 'visible': true }).catch(err => this.log(err));

      obs.send('SetMute', { source: 'Microphone (NDI)', mute: true });
      this.timer = this.defaultDuration;

      obs.send('SetSceneItemProperties', { 'scene-name': 'Webcam Overlay', 'item': 'grpMuteTimer', 'visible': true, scale: { x: obs.currentScene == 'Chat Mode+Gameplay' ? -muteGrp.scale.x : muteGrp.scale.x, y: muteGrp.scale.y } }).catch(err => this.log(err));

      obs.send('SetTextGDIPlusProperties', { source: 'Mute Timer', text: `Muted: ${this.timer} seconds` });

      chat.on('PRIVMSG/CHEER', this.onCheerBits);
      if (redemption.reward.cost > 0)
         stream.say(`🤫 SSSHHHHHH! Cheer bits to increase ${redemption.reward.title} duration 😂`);
      while (this.timer > 0) {
         await sleep(1000);
         this.timer--;
         obs.send('SetTextGDIPlusProperties', { source: 'Mute Timer', text: `Muted: ${this.timer} seconds` });
      }
      chat.removeListener('PRIVMSG/CHEER', this.onCheerBits)

      obs.send('SetSceneItemProperties', { 'scene-name': 'Webcam Overlay', 'item': 'grpMuteTimer', 'visible': false, scale: { x: muteGrp.scale.x, y: muteGrp.scale.y } }).catch(err => this.log(err));

      obs.send('SetSceneItemProperties', { 'scene-name': 'Webcam Overlay', 'item': 'jail-on.mp4', 'visible': false }).catch(err => this.log(err));
      obs.send('SetSceneItemProperties', { 'scene-name': 'Webcam Overlay', 'item': 'jail-off.mp4', 'visible': true }).catch(err => this.log(err));
      obs.send('SetSceneItemProperties', { 'scene-name': 'Webcam Overlay', 'item': 'jail-down.png', 'visible': false }).catch(err => this.log(err));
      obs.send('SetMute', { source: 'Microphone (NDI)', mute: false });
      this.running = false;
      await sleep(5000);
      obs.send('SetSceneItemProperties', { 'scene-name': 'Webcam Overlay', 'item': 'jail-off.mp4', 'visible': false }).catch(err => this.log(err));

   }

   onCheerBits(data) { // todo: need bits data from real event
      let inc = Math.ceil(data.bits / this.bitsPerMinute * 60);
      this.timer += inc;
      stream.say(`${data.tags.displayName} added ${inc}s to the duration! (${this.timer}s remaining)`);
   }

}