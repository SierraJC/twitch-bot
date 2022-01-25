const ChatCommand = require('./_interface')
var SpotifyWebApi = require('spotify-web-api-node');

const WebSocket = require('ws');

class SongRequest extends ChatCommand {
	constructor() {
		super()
		this.id = 'song_requests';
		// ? Permissions: BROADCASTER, MOD, VIP, SUB, REG, TIME/# (mins)
		super.register({ trigger: '!spotify', minPermission: 'SUB', cooldown: 0, userCooldown: 10, pubHandler: this.onChatMessage, privHandler: this.onWhisper })

		this.spotifyApi = new SpotifyWebApi({
			clientId: conf.spotify.clientID,
			clientSecret: conf.spotify.clientSecret,
			redirectUri: 'https://localhost/callback/',
			refreshToken: conf.spotify.refreshToken
		});

		this.queue = [
			{ uri: 'spotify:track:7fDADh6L7EricLDQlsAtuq', requester: 'testuser1' },
			{ uri: 'spotify:track:59q31baYiGMndSq261KEkq', requester: 'testuser2' },
			{ uri: 'spotify:track:0Lx25w0mBzDCPG0jdyfY8D', requester: 'testuser3' },
		];

		this.currentSong = {
			title: '',
			artist: '',
			uri: '',
			href: '',
			progress_ms: 0,
			is_playing: false
		}

		this.timers = {}

		this.refreshToken().then(() => this.spotifyApi.getMe()).then(data => {
			this.log(`Connected to Spotify account ${data.body['display_name']} (${data.body.product})`)
			return this.getCurrentSong();
		}).catch(err => this.error(err));



		setInterval(() => this.processQueue(), 500);

		// setTimeout(() => {
		// 	// Push our test queue
		// 	this.spotifyApi.setShuffle({state: false});
		// 	this.spotifyApi.play({uris: this.queue.map(o => o.uri)})
		// },10000)

		// Use Streamlabs Chatbot for songrequests, pause spotify
		this.shouldUnpause = false;


	}

	async onChatMessage(cmd) { // {cmd.raw, cmd.src, cmd.params}
		if (this.currentSong.is_playing)
			chat.say(cmd.raw.channel, `Now Playing: ${this.currentSong.title} - ${this.currentSong.artist} @ ${this.currentSong.href}`)
		else
			chat.say(cmd.raw.channel, `No song is currently playing...`);
	}
	async onWhisper(cmd) { // {cmd.raw, cmd.src, cmd.params}
	}

	async processQueue() {

	}

	async getCurrentSong() {
		clearTimeout(this.timers.getCurrentSong);
		try {
			let data = await this.spotifyApi.getMyCurrentPlaybackState();

			if (data.body.item && this.currentSong.title != data.body.item.name) {
				this.currentSong = {
					title: data.body.item.name,
					artist: data.body.item.artists[0].name,
					artists: data.body.item.artists.map(o => o.name).join(', '),
					uri: data.body.item.uri,
					href: data.body.item.external_urls.spotify,
				}
				this.log(`Now Playing: ${this.currentSong.title} - ${this.currentSong.artist}`);
			}
			this.currentSong.progress_ms = data.body.progress_ms || this.currentSong.progress_ms || 0;
			this.currentSong.is_playing = data.body.is_playing || false;
		} catch (err) {
			this.error(err);
		}
		this.timers.getCurrentSong = setTimeout(() => this.getCurrentSong(), 5000);
	}

	async refreshToken() {
		clearTimeout(this.timers.refreshToken);

		try {
			let data = await this.spotifyApi.refreshAccessToken();
			this.spotifyApi.setAccessToken(data.body['access_token']);
		} catch (err) {
			this.error(err);
		}

		this.timers.refreshToken = setTimeout(() => this.refreshToken(), 5 * 60000);
	}
}

module.exports = new SongRequest();