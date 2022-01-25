const BotLib = require('./_interface')
const StreamElements = require('node-streamelements'); //! WARN: Personally modified, had lots of bugs
const io = require('socket.io-client');

// https://github.com/ryanbarr/node-streamelements/blob/master/index.js
// https://docs.streamelements.com/reference

class StreamElements_API extends BotLib {
  constructor() {
    super()
    const se_api = new StreamElements({
      token: conf.streamelements.token,
      accountId: conf.streamelements.accountID,
    });

    this.heartbeat = false;
    this.channelId = '';

    global.se_api = se_api;

    // se_api.updateStoreItem('5be7c4314b157f04cb3e576e',{name: 'Random Steam Game',description: 'Redeem a RANDOM Steam Game key. Check your Twitch whispers for the key.', featured:false, cost: 650, subscriberOnly: true, quantity: {total: 50,current: 37}}).then(data => console.log(data));

  }

  init() {
    this.socket = io('https://realtime.streamelements.com', { transports: ['websocket'] });
    this.socket.parent = this;

    // var onevent = this.socket.onevent;
    // this.socket.onevent = function (packet) {
    //   var args = packet.data || [];
    //   onevent.call(this, packet);    // original call
    //   packet.data = ["*"].concat(args);
    //   onevent.call(this, packet);      // additional call to catch-all
    // };
    // this.socket.on("*", function (event, data) {
    //   console.log(event);
    //   console.log(data);
    // });

    this.socket.on('connect', () => this.onConnect());
    this.socket.on('disconnect', () => this.onDisconnect());
    this.socket.on('authenticated', data => this.onAuthenticated(data));
    this.socket.on('event', event => this.onEvent(event));
    this.socket.on('redemption', redemption => stream.events.emit('redemption', redemption));

    return true;
  }

  onConnect() {
    this.log('Connected to socket');
    this.socket.emit('authenticate', { method: 'jwt', token: conf.streamelements.token });
  }

  onDisconnect() {
    this.error('Disconnected from socket');
    clearInterval(this.heartbeat);
    // Reconnect is automatic by socket-io
  }
  onAuthenticated(data) {
    this.log(`Authenticated to channel`);
    this.channelId = data.channelId;
    this.heartbeat = setInterval(() => {
      this.socket.emit('PING');
    }, 30000);
  }

  async onEvent(event) {
    if (event.type == 'redemption') {
      // // We must get recent redemptions and find our item ID
      // let redeems = await se_api.getStoreRedemptions(5, 0, 'true');
      // if (redeems.docs)
      //   for (let redemption of redeems.docs)
      //     if (redemption.redeemer.username.toLowerCase() == event.data.username.toLowerCase() && redemption.item.name == event.data.redemption) {
      //       redemption.item.cost = Number(event.data.amount || 0);
      //       stream.events.emit('redemption', redemption);
      //       break;
      //     }
    } else if (event.type == 'follow') {
      stream.events.emit('follow', event.data.username.toLowerCase())
    } else if (event.type == 'subscriber' || event.type == 'subscriber - Gifted') {
      stream.events.emit('subscriber', event.data)
    } //else
    stream.dump_json(`json/events.${event.type}.json`, event);
  }
}

module.exports = new StreamElements_API();