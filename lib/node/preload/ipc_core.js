const electron = require('electron');
const path = require('path');
const url = require('url');

const _TurtlCore = require('../core');
const _ipc = electron.ipcRenderer;
const _app_version = electron.remote.app.getVersion();
const _core_worker_url = url.format({
	pathname: path.join(__dirname, '..', '..', 'app', 'core-adapter', 'thread.js'),
	protocol: 'file:',
	slashes: true,
});
const userdata = electron.remote.app.getPath('userData');
const config = electron.ipcRenderer.sendSync('synchronous-message', 'get-config');

process.once('loaded', function() {
	window.Node = {
		config: {
			app_version: _app_version,
			client: config.client,
			userdata: userdata,
			proxy: config.proxy,
		},
		ipc: _ipc,
		core: {
			TurtlCore: _TurtlCore,
			worker_url: _core_worker_url,
		},
	};
});

