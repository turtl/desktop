const electron = require('electron');
const _ipc = electron.ipcRenderer;
const _app_version = electron.remote.app.getVersion();

process.once('loaded', function() {
	window.Node = {
		config: {
			app_version: _app_version,
		},
		ipc: _ipc,
	};
});


