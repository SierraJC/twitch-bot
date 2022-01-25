const BotLib = require('./_interface')
const io = require('socket.io-client');

// https://dev.streamlabs.com/docs/socket-api

class StreamLabs_API extends BotLib {
  constructor() {
    super()
    const sl_api = false;

    // First we need to get out StreamLabs Socket key
    this.apiToken = '';
    this.token = '';

    global.sl_api = this.sl_api;
  }

  init() {
    return;
    // this.socket = io(`https://sockets.streamlabs.com?token=${this.token}`, { transports: ['websocket'] });
    // this.socket.parent = this;
    setTimeout(() => {
      this.socket = io(`http://127.0.0.1:8888?token=${this.token}`, { transports: ['websocket'] });

      this.socket.on('connect', () => this.onConnect());
      this.socket.on('disconnect', () => this.onDisconnect());
      this.socket.on('authenticated', data => this.onAuthenticated(data));
      this.socket.on('event', event => this.onEvent(event));
    }, 5000)

    return true;
  }

  onConnect() {
    this.log('Connected to socket');
  }

  onDisconnect() {
    this.error('Disconnected from socket');
  }
  onAuthenticated(data) {

  }

  async onEvent(event) {
  }
}

module.exports = new StreamLabs_API();