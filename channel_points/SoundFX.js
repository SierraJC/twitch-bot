const cpItem = require('./_interface')

module.exports = new class cpSFX extends cpItem {
   constructor() {
      super()
      this.id = 'SoundFX';
      let _ = undefined; // use default scene name (Comedic Effects);

      // SFX
      super.register({ id: 'd29443cd-bb91-4cda-a24c-048c8f90741f', cooldown: 0, userCooldown: 0, event: (r) => this.onRedeem(r, 'crickets.mp3', _, 11) }) //? Crickets
      super.register({ id: '440b6de7-82b4-49a6-b5fb-336ea69fbba2', cooldown: 0, userCooldown: 0, event: (r) => this.onRedeem(r, 'palpatine-do-it.mp3', _, 3) }) //? Palpatine DO IT
      super.register({ id: 'bde634af-fe08-476d-a0ec-434607021883', cooldown: 0, userCooldown: 0, event: (r) => this.onRedeem(r, 'uwoouuaahhh.mp3', _, 2) }) //? uwoouuaahhh
      super.register({ id: '3b46f0eb-adfa-46a1-b8d3-a63a7c2a0d03', cooldown: 0, userCooldown: 0, event: (r) => this.onRedeem(r, ['fart-1.mp3', 'fart-2.mp3', 'fart-3.mp3', 'fart-4.mp3'], _, 3) }) //? Fart
      super.register({ id: '7187f497-21a3-4713-8c9d-9efe462d199b', cooldown: 0, userCooldown: 0, event: (r) => this.onRedeem(r, ['wet-fart-1.mp3', 'wet-fart-2.mp3'], _, 3) }) //? Wet Fart
      super.register({ id: '91ab1e9f-fd72-4bc6-8365-681a7ace95df', cooldown: 0, userCooldown: 0, event: (r) => this.onRedeem(r, '5_dOlLaRs_A_mOnTh.mp3', _, 4) }) //? 5 dollars a month
      super.register({ id: '5504b94e-634a-4eb4-ab6c-9d5c8836b068', cooldown: 0, userCooldown: 0, event: (r) => this.onRedeem(r, ['honk-normal1.mp3', 'honk-harmonica.mp3', 'honk-jar.mp3', 'honk-normal1.mp3', 'honk-normal1.mp3'], _, 2) }) //? Honk Variety
      super.register({ id: 'affef7a4-8514-4776-8447-099dea5dc7d4', cooldown: 0, userCooldown: 0, event: (r) => this.onRedeem(r, ['steam-message.mp3', 'discord-message.mp3', 'steam-message.mp3', 'discord-message.mp3', 'usb-connected.mp3', 'usb-disconnected.mp3', 'discord-join.mp3', 'discord-call.mp3'], _, 6) }) //? New Message, discord steam notifications etc
      super.register({ id: '509b4bd3-b8e2-4f74-850f-0cc3ae00e49e', cooldown: 0, userCooldown: 0, event: (r) => this.onRedeem(r, 'xp-shutdown.mp3', _, 4) }) //? Windows XP Shutdown 
      super.register({ id: '27551ce6-0aa0-47e6-bbf3-175b2bfdfffb', cooldown: 0, userCooldown: 0, event: (r) => this.onRedeem(r, 'stop right there.mp3', _, 3) }) //? Stop! violated the law 
      super.register({ id: '8489891b-a258-4531-8a06-1ae64c619904', cooldown: 0, userCooldown: 0, event: (r) => this.onRedeem(r, 'much_rejoicing.mp3', _, 6) }) //? Much rejoicing!
      super.register({ id: '7dd50980-0e0c-457d-ac1d-9737f619d4a9', cooldown: 0, userCooldown: 0, event: (r) => this.onRedeem(r, 'horsin-around.mp3', _, 4) }) //? is that the horse from horsin' around?!?
      super.register({ id: '3d77e2c2-ebd1-44eb-bd85-6e83517e30fe', cooldown: 0, userCooldown: 0, bits: 111, event: (r) => this.onRedeem(r, 'door knock.mp3', _, 6) }) //? door knock
      super.register({ id: '62646bbd-628a-490e-9044-7b5adc1e8460', cooldown: 0, userCooldown: 0, bits: 666, event: (r) => this.onRedeem(r, ['jumpscare1.mp3', 'jumpscare2.mp3', 'jumpscare_cat-thing.mp4'], _, 3) }) //? jumpscares

      // TREAT TIME
      super.register({ id: '84af279c-bd0a-49de-b352-4472bdf51458', cooldown: 0, userCooldown: 0, event: (r) => this.onRedeem(r, 'mei-yay.mp3', _, 3) })

      // Hydrate
      super.register({ id: 'bc8eabf4-3b9a-490e-9859-79927cf4162c', cooldown: 0, userCooldown: 0, event: (r) => this.onRedeem(r, 'Water Explosion', 'Webcam Overlay', 5) })
      // Face Punch
      super.register({ id: '2e449870-ce5b-489c-8a80-1c84abfe3489', cooldown: 0, userCooldown: 0, event: (r) => this.onRedeem(r, 'guess-what.mp3', _, 2) })
      super.register({ id: '2e449870-ce5b-489c-8a80-1c84abfe3489', cooldown: 0, userCooldown: 0, event: (r) => this.onRedeem(r, 'Face Punch.mp4', 'Webcam', 5) })
      // HAH, gay!
      super.register({ id: 'a05467b2-b9c6-42ac-99c1-d76a5e9ec6ee', cooldown: 0, userCooldown: 0, event: (r) => this.onRedeem(r, 'Ha Gay (Meme)', _, 5) })

      chat.on('PRIVMSG/CHEER', (data) => this.onCheerBits.apply(this, [data]));
      // setTimeout(() => this.onCheerBits({ bits: 666 }), 10000);
   }

   async onCheerBits(data) {
      if (data.bits < 10) return;
      // stream.dump_json(`json/raw.cheer.json`, data);
      try {
         for (let sfx of this.rewards)
            if (sfx.bits == data.bits) {
               let redemption = {
                  channel_id: data.tags.roomId,
                  user: {
                     id: data.tags.userId,
                     login: data.username,
                     display_name: data.tags.displayName
                  },
                  reward: {
                     id: sfx.id,
                     title: 'BitsRedeem',
                     cost: 0,
                     max_per_stream: { is_enabled: false },
                     user_input: data.message
                  }
               }
               if (sfx.event)
                  sfx.event(redemption);
            }
      } catch (err) {
         this.error(err);
      }
   }

   async onRedeem(redemption, sourceName, sceneName = 'Comedic Effects', duration = 20) {
      if (redemption) { // ! NOTE: Make sure all references to redemption are kept within this condition
         if (stream.silentMode && redemption.user.login != conf.streamer.username) return;
         // let user = viewers.get(redemption.user.login);
         if (!redemption._user.lastMessage && redemption.reward.title != 'BitsRedeem') {
            sourceName = 'honk-normal1.mp3';
            duration = 2;
         }

         if (redemption.reward.id == '62646bbd-628a-490e-9044-7b5adc1e8460' && stream.status.live) // Jump scare warning
            stream.say('/me 🔊 VOLUME WARNING 🔊');
      }

      if (Array.isArray(sourceName))
         sourceName = sourceName[Math.floor(Math.random() * sourceName.length)];

      let source = await obs.send('GetSceneItemProperties', { 'scene-name': sceneName, 'item': sourceName }).catch(err => this.error(err));
      if (source && !source.visible) {
         obs.send('SetSceneItemProperties', { 'scene-name': sceneName, 'item': sourceName, 'visible': true }).then(data => {
            if (data.status == 'ok')
               setTimeout(() => obs.send('SetSceneItemProperties', { 'scene-name': sceneName, 'item': sourceName, 'visible': false }), duration * 1000)
         })
         return true;
      } else
         return false;

   }

}