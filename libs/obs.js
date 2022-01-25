const BotLib = require('./_interface')
const OBSWebSocket = require('obs-websocket-js'); // https://www.npmjs.com/package/obs-websocket-js
var url = require('url');


class OBS extends BotLib {
	constructor() {
		super()

		this.obs = new OBSWebSocket()
		this.obs.currentScene = undefined;
		this.obs.streaming = false;

		this.obs.local = new OBSWebSocket()


		global.obs = this.obs;
		// global.obs_local = this.obs_local;

		// Reconnect on connection failures, also triggers when a connect attempt fails.
		this.obs.on('ConnectionClosed', data => {
			this.error('Lost connection, retrying in 10 seconds...');
			setTimeout(() => this.connect(), 10 * 1000);
		});
		this.obs.local.on('ConnectionClosed', data => {
			this.error('Lost local connection, retrying in 10 seconds...');
			setTimeout(() => this.connect_local(), 10 * 1000);
		});

		this.obs.on('error', err => this.errorHandler(err));
		this.obs.local.on('error', err => this.errorHandler(err));

		this.obs.setSourceVisibile = async (source, scene, visible) => {
			let sourceItem = await this.obs.send('GetSceneItemProperties', { 'scene-name': scene, 'item': source });
			if (sourceItem)
				return await this.obs.send('SetSceneItemProperties', { 'scene-name': scene, 'item': source, 'visible': visible }).then(data => (data.status == 'ok') ? sourceItem : false);
			else return false;
		};

	}

	init() {

		this.obs.on('StreamStarted', () => stream.events.emit('obs:liveChange', true))
		this.obs.on('StreamStopped', () => stream.events.emit('obs:liveChange', false))
		// this.obs.on('RecordingStarted', () => stream.events.emit('obs:liveChange', true))
		// this.obs.on('RecordingStopped', () => stream.events.emit('obs:liveChange', false))
		this.obs.on('SwitchScenes', data => { stream.events.emit('obs:sceneChange', data); this.obs.currentScene = data.sceneName })

		stream.events.on('obs:liveChange', live => this.obs.streaming = live);

		if (conf.obs.enabled) {
			this.connect();
			this.connect_local();
		}
		return true;
	}

	errorHandler(err) {
		if (!err.code == 'CONNECTION_ERROR')
			this.error('OBS Error: ', err)
	}

	refreshBrowserSrc(sourceName) {
		return this.obs.send('RefreshBrowserSource', { sourceName })//.then(data => {
			// let _url = url.parse(data.sourceSettings.url,true);
			// _url.query.r = Date.now();
			// let newUrl = `${_url.protocol}//${_url.host}${_url.pathname}?${Object.keys(_url.query).map(key => `${key}=${_url.query[key]}`).join('&')}`
			// obs.send('SetSourceSettings', { sourceName: data.sourceName, sourceType: data.sourceType, sourceSettings: { url: newUrl } })
			//})
			.catch(err => this.error(err));
	}

	connect_local() {
		return this.obs.local.connect({ address: '127.0.0.1:4444', password: conf.obs.password }).then(() => {
			this.log(`Connected to socket @ ${'127.0.0.1:4444'}`)
		}).catch(err => this.errorHandler(err));
	}
	connect() {
		return this.obs.connect({ address: conf.obs.address, password: conf.obs.password }).then(() => {
			this.log(`Connected to socket @ ${conf.obs.address}`)
			//obs.send('GetSourceFilters',{'sourceName':'Webcam GS'}).then(data => console.log(data)).catch(err => console.log(err));
			//obs.send('SetSourceFilterSettings', { 'sourceName': 'Gameplay Capture', 'filterName': '3D Transform', 'filterSettings': { 'Filter.Transform.Camera': 1, 'Filter.Transform.Rotation.Z': 32.21} }).catch(err => console.log(err));
			// obs.send('GetSourceSettings',{'sourceName': 'PC NDI Capture'}).then(data => console.log(data)).catch(err => console.log(err));
			//obs.send('GetStats',{}).then(data => console.log(data)).catch(err => console.log(err));

			this.obs.send('SetSourceSettings', { sourceName: 'Raid Target', sourceSettings: { url: '' } }).catch(err => this.error(err));
			this.obs.send('SetSourceSettings', { sourceName: 'Raid Target Chat', sourceSettings: { url: '' } }).catch(err => this.error(err));

			// todo: move this routine to a more relevant location, maybe sockets.js?
			// Scan for sources that using our hosted websocket, and force refresh them
			this.obs.send('GetSourcesList').then(data => data.sources.forEach(source => {
				if (source.typeId == 'browser_source' && source.name.includes('(Chatbot)'))
					return this.refreshBrowserSrc(source.name);
			})).catch(err => this.error(err));
			// this.refreshBrowserSrc('Chatbot-TTS');

			this.obs.send('GetCurrentScene')
				.then(data => {
					this.obs.currentScene = data.name
					return this.obs.send('GetStreamingStatus');
				})
				.then(data => {
					this.obs.streaming = data.streaming || data.recording;
				}).catch(err => { })
		}).catch(err => this.errorHandler(err));
	}

}

module.exports = new OBS();