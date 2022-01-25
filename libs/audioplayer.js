const BotLib = require('./_interface')

class AudioPlayer extends BotLib {
	constructor() {
		super()

		/*
		 Microsoft Soundmapper
		 Speakers (Realtek High Definiti ($1,$64)
		 VoiceMeeter Aux Input (VB-Audio ($1,$64)
		 VoiceMeeter Input (VB-Audio Voi ($1,$64)
		 VoiceMeeter VAIO3 Input (VB-Aud ($1,$64)
		 CABLE Input (VB-Audio Virtual C ($1,$64)
		 CABLE-A Input (VB-Audio Cable A ($1,$64)
		 CABLE-B Input (VB-Audio Cable B ($1,$64)
		 HyperX Cloud 2 (HyperX Virtual  ($ffff,$ffff)
		*/


		this.device = '';
		this.volume = 60; //? Percent 0-200
		this.player = require('play-sound')({ player: 'C:\\Program Files\\VideoLAN\\VLC\\vlc.exe' })
		global.audio = this;
	}

	init() {
		// this.play('cassie-cabana-woohoo.ogg', function(err){
		// 	if (err) throw err
		// })
		return true;
	}
	play(what,volume=this.volume, next) {
		return this.player.play(`\\\\Sierra-StreamPC\\Twitch\\Resources\\audio\\bytes\\${what}`, {
			'C:\\Program Files\\VideoLAN\\VLC\\vlc.exe':
				['-I', 'null', '--play-and-exit', `--mmdevice-volume=${Number(volume / 100).toFixed(2)}`, '--no-volume-save', '--no-loop', '--ignore-config']
		}, next);
	}
}

module.exports = new AudioPlayer();