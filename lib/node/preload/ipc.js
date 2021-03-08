const electron = require('electron');
const _ipc = electron.ipcRenderer;
const _app_version = electron.ipcRenderer.sendSync('synchronous-message', 'get-version');

window.AppComm = {
	config: {
		app_version: _app_version,
	},
	ipc: _ipc,
};

