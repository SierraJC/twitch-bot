const fs = require('fs');

const ChatCommand = require('./_interface')

// todo: better comments

class Command extends ChatCommand {
	constructor() {
		super()
		this.id = 'death_guess';

		super.register({ trigger: '!guess', minPermission: 'ALL', cooldown: 0, userCooldown: 2, pubHandler: this.onMessage, privHandler: this.onMessage })

		this.guessTime = 15; //? Minutes to allow guesses
		this.announceFreq = 5; //? Minutes to remind death guessing is open

		this.guessOpen = false;
		this.guesses = {};
		this.tmrAnnounceGuessing = null;



		this.currentDeaths = 0;
		this.monitorTextPath = '\\\\Sierra-StreamPC\\Twitch\\Resources\\Text\\death-counter.txt'


		setInterval(() => this.updateDeathCounter(), 60 * 1000)
		setTimeout(() => this.updateDeathCounter(), 10 * 1000)

		this.guesses = db.config.get('modules.guesses').value();

		httpServer.get('/death_guess', (request, response) => {
			if ('open' in request.query)
				this.open()
			else if ('close' in request.query)
				this.close()
			else if ('reopen' in request.query) {
				let saveGuesses = this.guesses;
				this.open();
				this.guesses = saveGuesses;
			}
			response.send('OK')
		})

	}

	updateDeathCounter() {
		// if (!stream.status.live) return;

		let result = fs.existsSync(this.monitorTextPath) ? Number(fs.readFileSync(this.monitorTextPath)) : 0;

		if (result != this.currentDeaths && this.currentDeaths > 0 && result > 0) {
			// Update stream title, replace any number with death count. Only if title contains 💀 emoji
			if (stream.status.title.includes('💀')) {
				let newTitle = String(stream.status.title).replace(/([0-9]+)/, result);
				api.put(`channels/${conf.streamer.id}`, { body: { channel: { status: newTitle } } })
				this.log(`Title updated to: ${newTitle}`)
			}
			//let response = await api.get(`channels/${conf.streamer.id}`,{search: {game: 'Just Chatting'}});
			// setTimeout(() => {
			// 	chat.say(stream.channel, `/me 💀 Sierra has now only died ${result} times!`)
			// }, 15 * 1000);
		}

		this.currentDeaths = result;
	}
	guessToGuesser(guess) {
		for (let guesser of Object.keys(this.guesses)) if (this.guesses[guesser] == guess) return guesser;
	}

	open() {
		this.guesses = {};
		this.guessOpen = true;
		stream.say(`/me ☠ Death Guessing is now open! Guess how many deaths the stream will end tonight with, and win a spin! `);
		stream.say(`/me Place your guess using: ${this.cmds[0].trigger} <number> (currently ${this.currentDeaths})`);

		clearInterval(this.tmrAnnounceGuessing);
		this.tmrAnnounceGuessing = setInterval(() => {
			stream.say(`/me ☠ Death Guessing is currently open! Guess how many deaths the stream will end tonight with, and win a spin!`);
			stream.say(`/me Place your guess using: ${this.cmds[0].trigger} <number> (currently ${this.currentDeaths})`);
		}, this.announceFreq * 60 * 1000);
		//this.guessTimer = setTimeout(() => this.close(), this.guessTime * 60 * 1000)
	}
	close() {
		clearInterval(this.tmrAnnounceGuessing);
		this.guessOpen = false;
		stream.say(`/me ☠ Death guessing is now closed with ${Object.keys(this.guesses).length} guesses`);
		db.config.set('modules.guesses', this.guesses).write();
	}

	onMessage(cmd) {
		function reply(message) {
			if (message == '') return;
			if (cmd.raw.command == 'WHISPER') { // Reply via whisper
				chat.whisper(cmd.raw.username, message.charAt(0).toUpperCase() + message.slice(1))
			} else { // Reply via channel
				//stream.say(`@${cmd.raw.tags.displayName}, ${message}`)
				chat.send(`@client-nonce=${cmd.raw.tags.clientNonce};reply-parent-msg-id=${cmd.raw.tags.id} PRIVMSG ${cmd.raw.channel} :${message}`);
			}
		}

		let command = cmd.params[0].toLowerCase();
		let username = cmd.raw.tags.displayName;

		if (command == this.cmds[0].trigger) {
			if (!isNaN(cmd.params[1])) {
				if (this.guessOpen) {
					let num = Math.floor(Number(cmd.params[1]));
					if (num <= 0) return;
					if (num > (this.currentDeaths + 100)) {
						reply('oh come on, be reasonable!')
					} else if (num < this.currentDeaths) {
						reply('HA HA HA 💯😂🔥')
					} else {
						let dupeCheck = this.guessToGuesser(num);
						if (dupeCheck && username != dupeCheck)
							reply(`someone already guessed ${num} :(`)
						else if (this.guesses[username]) {
							// Update guess
							if (num == this.guesses[username])
								reply('that is already your guess cmonBruh')
							else {
								reply(`your guess has been updated to ${num} (was ${this.guesses[username]})`)
								this.guesses[username] = num;
							}
						} else {
							// Add guess
							this.guesses[username] = num;
							reply(`your guess of ${num} has been added`)
						}
					}
				} else {
					reply(`guessing isn't open ya silly goober`)
				}
			} else if (cmd.params[1]) {
				cmd.params[1] = cmd.params[1].toLowerCase();
				if (this.handler.hasPermission(cmd.raw._user, 'MOD'))
					if (cmd.params[1] == 'open' && !this.guessOpen) {
						this.open();
					} else if (cmd.params[1] == 'reopen' && !this.guessOpen) {
						let saveGuesses = this.guesses;
						this.open();
						this.guesses = saveGuesses;
					} else if (cmd.params[1] == 'close' && this.guessOpen) {
						this.close();
					} else if (cmd.params[1] == 'list' && !this.guessOpen) {
						let output = '';
						// Get an array of keys, sort by guess, output them in ascending order
						Object.keys(this.guesses).sort((a, b) => this.guesses[a] - this.guesses[b])
							.forEach(guesser => output += `${guesser}: ${this.guesses[guesser]}, `)
						reply(output.slice(0, -2)); // strip trailing ", "
					}
				if (cmd.params[1] == 'closest' && !this.guessOpen) {
					if (Object.keys(this.guesses).length > 0) {
						let guessSorted = Object.keys(this.guesses).sort((a, b) => this.guesses[a] - this.guesses[b]).map(key => this.guesses[key]);
						var closest = guessSorted.reduce((prev, curr) => (Math.abs(curr - this.currentDeaths) < Math.abs(prev - this.currentDeaths) ? curr : prev));
						reply(`closest guess is currently ${closest} by ${this.guessToGuesser(closest)}`)
					}
				}
			} else if (!cmd.params[1]) {
				if (this.guesses[username])
					reply(`your current guess is ${this.guesses[username]}`)
				else
					reply(`usage: ${this.cmds[0].trigger} <num>`)
			}
		}
	}
}

module.exports = new Command();