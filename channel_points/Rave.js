const cpItem = require('./_interface')

module.exports = new class cpRave extends cpItem {
   constructor() {
      super()
      this.id = 'CrabRave';
      this.inProgress = false;

      super.register({ id: '2ade034c-81d6-42ae-836f-f3d03a7fa769', cooldown: 0, userCooldown: 0, event: false })
      // 20s Global Cooldown atm
      // [{"operationName":"UpdateCustomChannelPointsReward","variables":{"input":{"rewardID":"2ade034c-81d6-42ae-836f-f3d03a7fa769","channelID":"37433468","backgroundColor":"#BC1B1B","cost":1250,"isSubOnly":false,"isUserInputRequired":false,"maxPerStreamSetting":{"maxPerStream":0,"isEnabled":false},"maxPerUserPerStreamSetting":{"maxPerUserPerStream":0,"isEnabled":false},"globalCooldownSetting":{"globalCooldownSeconds":20,"isEnabled":true},"prompt":"Time to start a rave party!","title":"Crab Rave","shouldRedemptionsSkipRequestQueue":true}},"extensions":{"persistedQuery":{"version":1,"sha256Hash":"4ef6b13f2f1cd4456ab12df72340e858a61fb285d01d5f8a1369a22f8d75f50a"}}}]
   }

   onRedeem(redemption) {
      if (stream.silentMode) {
         stream.say('This isn\'t the time to use that!');
         return;
      }
      if (!obs._connected) {
         stream.say('Woops! This rave has been shutdown by the connection police.');
         return;
      }
      if (this.inProgress) return;

      this.inProgress = true;

      // Play Rave Music
      this.handler.modules['SoundFX'].onRedeem(redemption, 'crab rave alert.mp3', undefined, 18);

      obs.send('GetSceneList').then(async data => {
         await sleep(1800);
         chat.say(stream.channel, '!kappagen 🦀')
         // obs.send('SetSceneItemProperties', { 'scene-name': 'Webcam', 'item': 'Rave Dance', 'visible': true }).catch(err => {});
         // obs.send('SetSceneItemProperties', { 'scene-name': 'Webcam', 'item': 'Rave Dance Mirrors', 'visible': true }).catch(err => {});	

         var hueTimer = 13; // Number of seconds to perform hue looping
         var hueStep = 5; // Number to increase hue value by per looping
         var hueFreq = 25; // Speed of loops in ms
         var hueVar = 0; // Current value

         const hueLoop = setInterval(() => {
            hueVar += hueStep;

            if (hueVar > 180) hueVar = -180;

            if (data.currentScene == 'Chat Mode+Gameplay' || data.currentScene == 'Wheel Spin (Subs)') {
               obs.send('SetSourceFilterSettings', { 'sourceName': data.currentScene, 'filterName': 'HUE Shifter', 'filterSettings': { 'hue_shift': hueVar } }).catch(err => { });
            } else {
               obs.send('SetSourceFilterSettings', { 'sourceName': 'Gameplay Inputs', 'filterName': 'HUE Shifter', 'filterSettings': { 'hue_shift': hueVar } }).catch(err => { });
               obs.send('SetSourceFilterSettings', { 'sourceName': 'Webcam', 'filterName': 'HUE Shifter', 'filterSettings': { 'hue_shift': (hueVar - (hueVar * 2)) } }).catch(err => { });
            }

            if (hueTimer == 0 && hueVar == 0) {
               // Finished hue shifting
               clearInterval(hueLoop);
               // obs.send('SetSceneItemProperties', { 'scene-name': 'Webcam', 'item': 'Rave Dance', 'visible': false }).catch(err => {});
               // obs.send('SetSceneItemProperties', { 'scene-name': 'Webcam', 'item': 'Rave Dance Mirrors', 'visible': false }).catch(err => {});
               this.inProgress = false;
            }
         }, hueFreq);

         const hueTimerObj = setInterval(() => {
            hueTimer--;
            this.log('Time Remaining: ' + hueTimer);
            if (hueTimer <= 0) {
               clearInterval(hueTimerObj);
            }
         }, 1000);

      });
   }
}