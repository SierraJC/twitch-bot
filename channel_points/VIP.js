const cpItem = require('./_interface')

const TwitchJs = require('twitch-js').default

module.exports = new class VIP extends cpItem {
   constructor() {
      super()
      this.id = 'VIP';
      this.vipDuration = 14; //? Days before VIP is removed
      this.vips = db.config.get('modules.vips').value();

      super.register({ id: '439aa58c-2b6f-4562-9c82-583f1a7fd888', cooldown: 0, userCooldown: 0, event: false })

      setTimeout(() => this.expire(), 5 * Time.SECOND);
      setInterval(() => this.expire(), 60 * Time.MINUTE);

      // todo: greet VIPs?

   }

   expire() {
      // Remove expired VIPs
      let now = Date.now();
      let expired = [];

      if (this.vips.length > 0) {
         for (let i = this.vips.length; i--;) {
            // if (this.vips[i].bonus) {
            //    this.vips[i].expire = now + this.vips[i].bonus;
            //    this.vips[i].bonus = undefined;
            //    delete this.vips[i].bonus;
            //    this.log(`${this.vips[i].username} has ${Math.floor((this.vips[i].expire - now) / (60 * 60 * 24 * 1000))} days left`);
            // }
            if (this.vips[i].expire < now) { // Expired, remove them!
               let username = this.vips[i].username;
               expired.push(`/unvip ${username}`)
               // Remove Discord VIP
               viewers.getID(username).then(result => result ? discord.emit('request', { command: 'setRoleByTwitch', params: { roleID: conf.discord.roles.vip, remove: true, username: username, id: result } }) : false);
               this.vips.splice(i, 1)
            }
         }

         if (expired.length > 0) {
            this.streamerCommand(conf.streamer.username, expired)
            this.save();
         }

      }
   }

   onRedeem(redemption) {
      if (redemption._user.isMod) {
         this.handler.modules['SoundFX'].onRedeem(redemption, 'doh.mp3', undefined, 2);
         stream.say(`... Moderators can't be VIP FailFish`);
         return;
      }
      // Play SFX
      this.handler.modules['SoundFX'].onRedeem(redemption, 'anime wow.mp3', undefined, 6)

      for (let i in this.vips)
         if (this.vips[i].username == redemption.user.login) { // Add time to existing VIP
            this.vips[i].expire = this.vips[i].expire + (this.vipDuration * 24 * 60 * 60 * 1000)
            stream.say(`/me PrideWingL ${redemption.user.display_name} extended their VIP status PrideWingR`);
            return;
         }

      // Not an existing VIP, make a new one!
      this.streamerCommand(stream.channel, [`/vip ${redemption.user.login}`]);
      this.vips.push({ username: redemption.user.login, expire: (Date.now() + (this.vipDuration * 24 * 60 * 60 * 1000)) })
      this.save();
      stream.say(`/me PrideGive ${redemption.user.display_name} is now a Stream VIP PrideTake`);
      discord.emit('request', { command: 'setRoleByTwitch', params: { roleID: conf.discord.roles.vip, remove: false, username: redemption.user.login, id: redemption.user.id ? Number(redemption.user.id) : undefined } });
   }

   streamerCommand(channel, cmds) {
      let streamerChat = new TwitchJs({ token: conf.streamer.token, clientId: conf.clientID, username: conf.streamer.username, isKnown: false }).chat // Streamer account
      streamerChat._log.level = 'warn';

      streamerChat.connect().then(globalUserState => {
         return streamerChat.join(`${channel}`);
      })
         .then(channelState => {
            return new Promise(async (resolve, reject) => {
               cmds.forEach(cmd => streamerChat.say(`${channel}`, cmd).catch(err => { }));
               setTimeout(() => resolve(true), 2000);
            });
         })
         .then(() => {
            this.log(`Sent streamer command: ${cmds}`)
            return streamerChat.disconnect();
         }).catch(err => {
            this.error(err);
            return false
         });
      return true;
   }

   save() {
      db.config.set('modules.vips', this.vips).write();
   }

}