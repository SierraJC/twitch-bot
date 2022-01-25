const cpItem = require('./_interface')
const imgur = require('imgur');
const { chatters } = require('../libs/item_store');


module.exports = new class SayCheese extends cpItem {
   constructor() {
      super()
      this.id = 'SayCheese';

      super.register({ id: '9a1a2419-1124-4b9f-aec0-9c686b83d928', cooldown: 0, userCooldown: 0, event: false })
      this.running = false;
      // 10s cooldown  [{"operationName":"UpdateCustomChannelPointsReward","variables":{"input":{"rewardID":"9a1a2419-1124-4b9f-aec0-9c686b83d928","channelID":"37433468","backgroundColor":"#00C7AC","cost":750,"isSubOnly":false,"isUserInputRequired":false,"maxPerStreamSetting":{"maxPerStream":7,"isEnabled":false},"maxPerUserPerStreamSetting":{"maxPerUserPerStream":0,"isEnabled":false},"globalCooldownSetting":{"globalCooldownSeconds":10,"isEnabled":true},"prompt":"CHEEEESE! This will freeze Sierra's webcam for a few seconds and take a photo, then share it in chat!","title":"Say CHEESE!","shouldRedemptionsSkipRequestQueue":false}},"extensions":{"persistedQuery":{"version":1,"sha256Hash":"4ef6b13f2f1cd4456ab12df72340e858a61fb285d01d5f8a1369a22f8d75f50a"}}}]

   }

   async onRedeem(redemption) {
      if (this.running) return;
      this.running = true;
      // Play warning SFX
      // this.handler.modules['SoundFX'].onRedeem(redemption, 'say-cheese.mp3', undefined, 5)

      await sleep(2000)
      let source = await obs.send('GetSceneItemProperties', { 'scene-name': 'Webcam', 'item': { id: 40, name: 'Webcam (GreenScreen)' } }).catch(err => this.error(err));
      if (!source.visible || !['Gameplay', 'Chat Mode+Gameplay', 'Chat Fullscreen', 'Wheel Spin (Subs)'].includes(obs.currentScene)) {
         chat.say(stream.channel, `@${redemption.user.display_name}, cheeky devil, not while Sierra's webcam is hidden!`);
         this.running = false;
         return;
      }
      obs.send('SetSceneItemProperties', { 'scene-name': 'Webcam Overlay', 'item': 'camera_flash.mp4', 'visible': true });
      await sleep(200);
      obs.send('SetSourceFilterVisibility', { sourceName: 'Webcam (GreenScreen)', filterName: 'Freeze', filterEnabled: true });
      await sleep(1000);
      obs.send('TakeSourceScreenshot', { sourceName: 'Webcam (GreenScreen)', saveToFilePath: `C:\\Users\\StreamPC\\Pictures\\cheese-${Date.now()}.png` })
      obs.send('TakeSourceScreenshot', { sourceName: 'Webcam (GreenScreen)', width: 1280, height: 720, embedPictureFormat: 'png' }).then(data => {
         data.img = data.img.substring(data.img.indexOf(',') + 1)
         return imgur.uploadBase64(data.img).then((json) => {
            chat.say(stream.channel, `📸 ${json.link}`)
            this.log(`IMAGE: ${json.link}`);
            this.log(`DELETE: https://imgur.com/delete/${json.deletehash}`);
            setTimeout(() => imgur.deleteImage(json.deletehash), 5 * 60 * 1000)
         });
      }).catch(err => this.error(err))

      await sleep(4000);
      obs.send('SetSourceFilterVisibility', { sourceName: 'Webcam (GreenScreen)', filterName: 'Freeze', filterEnabled: false });
      obs.send('SetSceneItemProperties', { 'scene-name': 'Webcam Overlay', 'item': 'camera_flash.mp4', 'visible': false })
      this.running = false;
   }
}