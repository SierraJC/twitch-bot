
// Sierra's Chatbot.
const RootInterface = require('./_interface')
const TwitchJs = require('twitch-js').default			// https://twitch-devs.github.io/twitch-js/docs/examples-node.html
const plugin_loader = require('./plugin_loader');
const axios = require('axios');

// move events like commands OnMessage to a variable handler instead of forced names?

// todo !gamble like WoW addons
// todo command aliases
// todo twitch baby alert

class Main extends RootInterface {
	async main() {
		plugin_loader.load('./libs/config.js').init() // Ensure config is loaded first, or plugins may fail to initialize
		global.pluginloader = plugin_loader;
		global.plugins = plugin_loader.plugins;

		const onAuthenticationFailure = type => {
			this.error(`"${type.toUpperCase()}" token expired, fetching new one...`)
			return axios.get(`https://twitchtokengenerator.com/api/refresh/${conf[type].refresh}`).then(response => {
				this.error('! Got new token, saving to config file')
				if (response.status == 200 && response.data.success) {
					// Revoke old access token to be safe?
					axios.get(`https://twitchtokengenerator.com/api/revoke/${conf[type].token}`).catch(err => { });
					conf[type].token = response.data.token;
					conf[type].refresh = response.data.refresh;
					plugins.config.save();
					return conf[type].token;
				} else return false;
			}
			)
		}

		const verifyToken = async type => {
			let test_api = new TwitchJs({ token: conf[type].token, clientId: conf.clientID, onAuthenticationFailure: () => onAuthenticationFailure('streamer') }).api
			let result = await test_api.get('', { version: 'kraken' }).then(response => response.token.valid ? response.token : false);
			this.debug(`Token "${type}" valid = ${result != false} `)
			if (result) {
				conf[type].id = result.userId;
				conf[type].username = result.userName;
				return true;
			} else {
				let newToken = await onAuthenticationFailure(type);
				conf[type].token = newToken;
				return true;
			}
		}

		// Verify our tokens and save the username/id assosciated with those tokens
		this.log('Verifying token credentials...')
		await verifyToken('streamer');
		await verifyToken('bot');
		plugins.config.save();

		// Prepare client interfaces
		const { chat, chatConstants } = new TwitchJs({ token: conf.bot.token, clientId: conf.clientID, username: conf.bot.username, isKnown: true, onAuthenticationFailure: () => onAuthenticationFailure('bot') }) // Bot account
		const { api } = new TwitchJs({ token: conf.streamer.token, username: conf.streamer.username, clientId: conf.clientID, onAuthenticationFailure: () => onAuthenticationFailure('streamer') }) // Streamer account
		// todo: API does not trigger onAuthenticationFailure? Beware of tokens expiring mid stream
		// ? 0 Errors/Fatal, 1 Warn, 2 Log, 3 Info, 4 debug, 5 trace, Infinity silent

		chat._log.level = 'warn';
		//chat.say()
		api._log.level = chat._log.level;
		global.chat = await chat;
		global.api = await api;

		// Listen to all events.
		// const log = msg => console.log(msg)
		// chat.on('*', log)

		chat.on('DISCONNECTED', () => {
			this.error('Lost connection, retrying...');
			//setTimeout(bot_connect, 5000);
		})

		if (conf.bot.enabled)
			this.connect();
	}

	connect() {
		chat.connect().then(globalUserState => {
			if (!plugin_loader._loaded)
				plugin_loader.load_all();

			chat.join(`#${conf.streamer.username}`).then(channelState => {
				this.log('Successfully connected and ready for commands')
				//chat.say(channel, 'MrDestructoid Skynet Online MrDestructoid')
			})
		}) // catch and reconnect here?
	}

	constructor() { super(); this.main() }
}

new Main();

function exit() {
	console.log('Shutting down bot')

	// Save user database
	if (viewers && db)
		viewers.updateAll();

	// Disconnect OBS
	if (obs && obs._connected)
		obs.disconnect();

	// Disconnect Twitch Chat
	if (chat && chat._readyState == 3) {
		chat.part(`#${conf.streamer.username}`)
		chat.disconnect()
	}

}

process.on('exit', exit);
process.on('SIGINT', () => process.exit(0));
process.on('SIGTERM', () => process.exit(0));

//process.on('unhandledRejection', function (reason, p) {
//	console.error("Unhandled Rejection at: ", p)
//})
//process.on('uncaughtException', function (error) {
//	console.error("Unhandled Exception at: ", error)
//})