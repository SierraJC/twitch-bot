const BotLib = require('./_interface');
// const ioHook = require('iohook');


const VK_TAB = 9,
	VK_NUMPAD0 = 96,
	VK_NUMPAD1 = 97,
	VK_NUMPAD2 = 98,
	VK_NUMPAD3 = 99,
	VK_NUMPAD4 = 100,
	VK_NUMPAD5 = 101,
	VK_NUMPAD6 = 102,
	VK_NUMPAD7 = 103,
	VK_NUMPAD8 = 104,
	VK_NUMPAD9 = 105,
	VK_ADD = 107,
	VK_SUBTRACT = 109,
	VK_F24 = 135,
	VK_LSHIFT = 160,
	VK_LCONTROL = 162,
	VK_LMENU = 164,
	VK_SLASH = 220
// http://cherrytree.at/misc/vk.htm

const srcMIC = 'Microphone (NDI)',
	srcGAME = 'Gameplay (NDI)',
	srcMUSIC = 'Music (NDI)',
	srcCOMMS = 'Comms (NDI)'

class Hotkeys extends BotLib {
	constructor() {
		super()
	}

	init() {

		this.timerCurbMeme = undefined;

		this._held = false;
		// ioHook.on('keydown', (event) => this.onKeyHandler(event, false));
		// ioHook.on('keyup', (event) => this.onKeyHandler(event, true));
		// ioHook.start();

		return true;
	}

	setVisible(scene, item, visible) {
		return obs.send('SetSceneItemProperties', { 'scene-name': scene, item, visible });
	}
	setMute(source, mute) {
		return obs.send('SetMute', { source, mute });
	}

	showVideoWithDelay(scene, item, delay = 25) {
		//? Due to a bug with OBS(?), video shows an old frame for a split second when made visible.
		//? To get around this, the source{item} scale is set to 0%, made visible, and restored after a {delay}.
		let currentProps = {};
		return obs.send('GetSceneItemProperties', { 'scene-name': scene, item })
			.then(data => { currentProps = data; return obs.send('SetSceneItemProperties', { 'scene-name': scene, item, scale: { x: 0, y: 0 } }) })
			.then(() => this.setVisible(scene, item, true))
			.then(() => sleep(delay))
			.then(() => obs.send('SetSceneItemProperties', { 'scene-name': scene, item, scale: currentProps.scale }));
	}

	async onKeyHandler(event, released) {
		if (!(this._held && !released) && (event.altKey && !event.shiftKey && !event.ctrlKey && !event.metaKey && (event.rawcode >= VK_NUMPAD0 && event.rawcode <= VK_SUBTRACT))) {
			this._held = released ? false : event.rawcode;
			if (!obs._connected) return;

			this.log(`processing hotkey ${event.rawcode} (pressed: ${!released}) `);

			// Process Hotkeys //
			if (event.rawcode == VK_NUMPAD1) {
				this.setVisible('Webcam', 'Webcam-Zoom High', !released);
				// todo: slowly zoom into face, figure out what method to use
				// if (released) {
				// 	obs.send('SetSceneItemProperties', { 'scene-name': 'Webcam', item: 'Group2', scale: { x: 1.1, y: 1.1 } });
				// } else {
				// 	obs.send('SetSceneItemProperties', { 'scene-name': 'Webcam', item: 'Group2', scale: { x: 1, y: 1 } });
				// }
			} else if (event.rawcode == VK_NUMPAD2) {
				// this.setVisible('Webcam Container', 'Webcam-Gameplay', released);
				// this.setVisible('Webcam Container', 'Webcam_B&W', !released);
			} else if (event.rawcode == VK_NUMPAD3) {
				this.setVisible('Comedic Effects', 'somethinbirdy', !released);
			} else if (event.rawcode == VK_NUMPAD4) {
				//? We'll Be Right Back
				if (!released) {
					obs.send('SetSourceFilterVisibility', { sourceName: 'Webcam (GreenScreen)', filterName: 'Freeze', filterEnabled: true });
					obs.send('SetSourceFilterVisibility', { sourceName: 'Webcam (GreenScreen)', filterName: 'Freeze-Colour', filterEnabled: true });
					this.setMute(srcMIC, true);
					if (obs.currentScene == 'Chat Mode+Gameplay') //? Webcam is flipped, so flip the video as it contains text
						await obs.send('SetSceneItemProperties', { 'scene-name': 'Webcam Overlay', item: 'well be right back.mp4', scale: { x: -1, y: 1 }, position: { x: -1215, y: 0 } })
					this.showVideoWithDelay('Webcam Overlay', 'well be right back.mp4');

				} else {
					// this.setVisible('Webcam', 'ReplayInput', false);
					this.setVisible('Webcam Overlay', 'well be right back.mp4', false);
					obs.send('SetSceneItemProperties', { 'scene-name': 'Webcam Overlay', item: 'well be right back.mp4', scale: { x: 1, y: 1 }, position: { x: -60, y: 0 } })
					this.setMute(srcMIC, false);
					obs.send('SetSourceFilterVisibility', { sourceName: 'Webcam (GreenScreen)', filterName: 'Freeze', filterEnabled: false });
					obs.send('SetSourceFilterVisibility', { sourceName: 'Webcam (GreenScreen)', filterName: 'Freeze-Colour', filterEnabled: false });
				}
			} else if (event.rawcode == VK_NUMPAD5) {
				clearTimeout(this.timerCurbMeme);
				if (!released) {
					this.setVisible('Comedic Effects', 'curb credits song', true);
					this.timerCurbMeme = setTimeout(async () => {
						await this.showVideoWithDelay('Comedic Effects', 'curb credits video');
						this.setMute(srcMIC, true);
						this.setMute(srcGAME, true);
						this.setMute(srcMUSIC, true);
					}, 1200);
				} else {
					this.setVisible('Comedic Effects', 'curb credits video', false);
					this.setVisible('Comedic Effects', 'curb credits song', false);
					this.setMute(srcMIC, false);
					this.setMute(srcGAME, false);
					this.setMute(srcMUSIC, false);
				}
			} else if (event.rawcode == VK_NUMPAD6) {
				this.setVisible('Webcam (GreenScreen)', 'FaceZone', !released);
			} else if (event.rawcode == VK_F24) {
				console.log(released);
				return;
				let modeSplit = await obs.local.send('GetSourceActive', { sourceName: 'Gameplay (P1=P2)' }).then(res => res.sourceActive);
				let modeP1Main = await obs.local.send('GetSourceActive', { sourceName: 'Gameplay (P1>P2)' }).then(res => res.sourceActive);
				let modeP2Main = await obs.local.send('GetSourceActive', { sourceName: 'Gameplay (P2>P1)' }).then(res => res.sourceActive);

				if (!modeSplit && !modeP1Main && !modeP2Main) {
					// Not in DUO mode?
					return;
				}
				if (modeSplit) return;

				if (modeP1Main && !modeP2Main) {
					this.log('toggle P2 > P1')
				} else
				if (!modeP1Main && modeP2Main) {
					this.log('toggle P1 > P2')
				}

				

			}
			// } else if (event.rawcode == VK_SLASH) {
			// 	this.setVisible('Webcam', 'Webcam (GreenScreen)', released);
			// }
			//   End Hotkeys   //
		}
	}
}

module.exports = new Hotkeys();