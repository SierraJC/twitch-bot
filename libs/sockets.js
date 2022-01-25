const BotLib = require('./_interface')

const axios = require('axios');
const spawn = require('child_process').spawn;

const path = require('path');
const fs = require('fs')
const app = require('express')();
const http = require('http').createServer(app);
const ws = require('socket.io')(http);
const wsClient = require('socket.io-client');

class RemoteAPI extends BotLib {
	constructor() {
		super()
		let [addr, port] = conf.websocket.address.split(':');
		this.io = ws;
		this.requests = {};

		global.httpServer = app;
		global.wsAPI = this;

		http.listen(port, addr, (err) => {
			if (err)
				return this.error('! Error binding HTTP server', err)
			this.log(`HTTP/WS Server is listening on ${addr}:${port}`)
		})

		// Handle serving static files from html_pages directory
		app.get(`/pages/${conf.websocket.token}/*`, (request, response) => {
			// if (request.socket.remoteAddress != '127.0.0.1') return response.send('nope');

			let parsedUrl = path.parse(request._parsedUrl.pathname.replace(`/pages/${conf.websocket.token}/`, ''))
			let pathname = `./html_pages${parsedUrl.dir == '' ? '' : '/' + parsedUrl.dir}/${parsedUrl.base}`;

			const ext = parsedUrl.ext;
			// maps file extention to MIME typere
			const map = {
				'.ico': 'image/x-icon',
				'.html': 'text/html',
				'.js': 'text/javascript',
				'.json': 'application/json',
				'.css': 'text/css',
				'.png': 'image/png',
				'.jpg': 'image/jpeg',
				'.wav': 'audio/wav',
				'.mp3': 'audio/mpeg',
				'.ogg': 'audio/ogg',
				'.svg': 'image/svg+xml',
				'.pdf': 'application/pdf',
				'.doc': 'application/msword'
			};

			fs.exists(pathname, (exist) => {
				if (!exist) {
					// if the file is not found, return 404
					response.statusCode = 404;
					response.end(`File ${pathname} not found!`);
				} else {
					// if is a directory search for index file matching the extention
					// if (fs.statSync(pathname).isDirectory()) pathname += '/index.html';
					// read file from file system
					fs.readFile(pathname, (err, data) => {
						if (err) {
							response.statusCode = 500;
							response.end(`Error getting the file: ${err}.`);
						} else {
							// if the file is found, set Content-type and send data
							response.setHeader('Content-type', map[ext] || 'text/plain');
							response.end(data);
						}
					});
				}
			});
		})

		// io.on('connection', socket => {
		// 	this.log(`Incoming connection from ${socket.conn.remoteAddress}`)

		// 	socket.on('event', event => stream.events.emit('ws:event',event));
		// 	socket.on('disconnect', socket => { });
		// });

		ws.use((socket, next) => {
			if (socket.handshake.query && socket.handshake.query.token) {
				if (socket.handshake.query.token === conf.websocket.token) {
					socket.authenticated = true;
					next();
				} else {
					socket.authenticated = false;
					socket.disconnect();
					this.log(`[${socket.conn.remoteAddress}] Authentication failure`);
					next(new Error('Authentication error'));
				}
			}
		}).on('connection', socket => {
			socket.log = (msg) => this.log(`[${socket.conn.remoteAddress}] ${msg}`);

			socket.log('Connection established');
			if (socket.authenticated) {
				//socket.on('event', event => stream.events.emit('ws:event',event));
				socket.on('disconnect', () => this.log(`[${socket.conn.remoteAddress}] Disconnected from socket `));

				// socket.on('request', request => {
				// 	let reply = {};
				// 	if (request.command && this.requests[request.command]) {
				// 		socket.log(`Requested command "${request.command}"`);
				// 		reply = this.requests[request.command](request.params || {});
				// 	} else {
				// 		socket.log(`Unknown request: ${JSON.stringify(request)}`);
				// 	}
				// 	socket.emit('reply', { request, reply });
				// });

			}
		});


		// Discord bot API connection
		global.discord = wsClient.connect(`http://${conf.discord.address}`, { query: { token: conf.discord.token } });
		global.discord.on('connect', () => {
			this.log(`Connected to VPS Discord API`);
			//socket.emit('request', { command: 'setVIP', params: { remove: false, username: '[REDACTED]', id: 0 } });
		});

		// setTimeout(() => {
		// 	global.discord = wsClient.connect(`http://127.0.0.1:8888`, { query: { token: conf.websocket.token } });
		// 	global.discord.on('connect', () => {
		// 		this.log(`Connected to VPS Discord API`);
		// 		//socket.emit('request', { command: 'setVIP', params: { remove: false, username: '[REDACTED]', id: 0 } });
		// 	});
		// 	global.discord.on('tts', data => {
		// 		console.log(data);
		// 	});
		// }, 5000);

	}

	on(request, callback) {
		if (!this.requests[request])
			return this.requests[request] = callback;
	}

	emit(event, data) {
		Object.keys(this.io.sockets.connected).map(id => {
			let socket = this.io.sockets.connected[id];
			if (socket.authenticated)
				socket.emit(event, data);
		});
	}

	testSocket() {
		let io = require('socket.io-client');

		let socket = io.connect('http://127.0.0.1:8888', { reconnection: false, query: { token: conf.websocket.token } });

		//socket.on('disconnect', (err) => { console.log(err); });

		socket.on('connect', () => {

		});

		socket.on('tts', data => {
			this.log(data);
		});

	}

	init() {

		return true;
	}
}

module.exports = new RemoteAPI();