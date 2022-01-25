const BotLib = require('./_interface')
const fs = require('fs')
const path = require('path')

class PluginLoader extends BotLib {
	constructor() {
		super();
		this.id = 'PluginLoader'
		this.plugins = {}
		this._loaded = false;
	}

	load_all() {

		fs.readdirSync("./libs/").forEach((file) => {
			if (!file.startsWith('_') && path.extname(file).toLowerCase() === '.js')
				this.load("./libs/" + file);
		});
		// Now initialize them all
		Object.keys(this.plugins).forEach(key => {
			this.plugins[key].init();
			this.plugins[key].initialized = true;
		});
		this._loaded = true;
	}

	load(pluginPath) {
		let id = path.basename(pluginPath,'.js');
		if (this.plugins[id]) return false;

		let plugin = require(pluginPath);
		plugin.path = pluginPath;
		plugin.id = id;

		if (!plugin.init) throw `Plugin "${plugin.id}" is missing init function`

		this.plugins[plugin.id] = plugin;
		this.log(`Loaded: ${pluginPath}`);
		return plugin;

	}

	get(pluginName) {
		return this.plugins[pluginName];
	}
	
}

module.exports = new PluginLoader();