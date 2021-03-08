const electron = require('electron');
const BrowserWindow = electron.BrowserWindow;
const url = require('url');
const path = require('path');
const tools = require('./tools');
const comm = require('./comm');

var popup_window = null;

function popup_coords(width, height) {
	var workspace = electron.screen.getPrimaryDisplay().workArea;
	var pad = 1;
	if(process.platform.match(/darwin/i)) {
		var x = workspace.width - (width + pad);
		var y = workspace.y + pad;
	} else {
		var x = workspace.width - (width + pad);
		var y = workspace.height - (height + pad);
	}
	return {x: x, y: y};
};

exports.get_window = function() {
	return popup_window;
};

exports.open = function(title, type, initial_data, options) {
	options || (options = {});
	var width = 600;
	var height = options.height || 400;
	var coords = popup_coords(width, height);
	if(popup_window) {
		popup_window.close();
		popup_window = null;
	}
	popup_window = new BrowserWindow({
		title: title,
		width: width,
		height: height,
		x: coords.x,
		y: coords.y,
		icon: tools.ticon(32),
		alwaysOnTop: true,
		webPreferences: {
			nodeIntegration: false,
			// disable becaue it breaks turtl. TODO: fix this.
			contextIsolation: false,
			// no remote
			enableRemoteModule: false,
			// disable <webview> as well
			webviewTag: false,
			// loads turtl core/ipc so we don't need node
			preload: path.join(__dirname, 'preload', 'ipc.js'),
		},
	});
	if(process.platform != 'darwin') {
		popup_window.setMenu(null);
	}
	popup_window.loadURL(url.format({
		pathname: path.join(__dirname, '..', '..', 'build', 'popup.html'),
		//pathname: path.join(__dirname, 'build', 'popup.html?type='+encodeURIComponent(type)+'&key='+encodeURIComponent(comm.get_key())),
		protocol: 'file:',
		slashes: true,
	}));
	popup_window.on('close', function() {
		popup_window = null;
	});
	popup_window.webContents.on('dom-ready', function() {
		popup_window.webContents.send('load-type', type, initial_data);
		if(!options.skip_focus) popup_window.show();
	});
	tools.fix_window(popup_window, {ctrlw: true});
};

