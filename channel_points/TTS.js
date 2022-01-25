const cpItem = require('./_interface')

module.exports = new class cpTTS extends cpItem {
   constructor() {
      super()
      this.id = 'cpTTS';

      super.register({ id: '53a367d8-807a-4ba8-8a54-cd9aa4b65af5', cooldown: 0, userCooldown: 0, event: false })

      this.voiceMap = [
         'Brian', 'Ivy', 'Justin', 'Russel',
         'Nicole', 'Emma', 'Amy', 'Joanna',
         'Sally', 'Kimberly', 'Kendra', 'Joey',
         'Mizuki', 'Chantal', 'Mathieu', 'Maxim',
         'Hans', 'Raveena',

         'Demon', 'Pixie', 'Robot', 'Goblin', 'Ghost',

         'Rick', 'Cartman', 'Homer'
      ]

   }

   onRedeem(redemption) {
      let message = redemption.user_input;
      let voice = 'Brian';
      if (redemption._user && redemption._user.watchTime < 30 && !redemption._user.isSub) return;

      let getVoice = /^(?:([^\s]+):|\(([^\s]+)\))?(?<message>.*)/.exec(message);
      if (getVoice[1] || getVoice[2]) {
         let voiceIndex = this.voiceMap.findIndex(item => (getVoice[1] || getVoice[2]).toLowerCase() === item.toLowerCase());
         voice = this.voiceMap[voiceIndex >= 0 ? voiceIndex : 0];
      }
      if (getVoice.groups.message)
         message = getVoice.groups.message;

      stream.tts(message, voice);

   }
}