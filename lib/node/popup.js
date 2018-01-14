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

exports.open = function(type, initial_data) {
	var width = 600;
	var height = 400;
	var coords = popup_coords(width, height);
	popup_window = new BrowserWindow({
		width: width,
		height: height,
		x: coords.x,
		y: coords.y,
		icon: tools.ticon(32),
		alwaysOnTop: true,
		webPreferences: {
			nodeIntegration: false,
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
	});
	tools.fix_window(popup_window);
}

