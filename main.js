"use strict";

const electron = require('electron');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const url = require('url');
const path = require('path');
const context = require('electron-context-menu');
const config = require('./build/config');
const comm = require('./lib/node/comm');
const dispatch = require('./lib/node/dispatch');
const popup = require('./lib/node/popup');
const tools = require('./lib/node/tools');

// add build/ to our PATH so any libraries dropped in there will be found
process.env['PATH'] = process.env['PATH']+path.delimiter+path.join(__dirname, 'build');

if(process.env['TURTL_USERDATA_DIR']) {
	app.setPath('userData', process.env['TURTL_USERDATA_DIR']);
}

// handles setting up our context menus
context({
	prepend: function(params, win) {
		return [];
	}
});

var main_window = null;

function create_main_window() {
	main_window = new BrowserWindow({
		width: 1024,
		height: 768,
		x: 10,
		y: 10,
		icon: tools.ticon(32),
		webPreferences: {
			nodeIntegration: false,
			preload: path.join(__dirname, 'lib', 'node', 'preload', 'ipc_core.js'),
		},
	});
	if(process.platform != 'darwin') {
		main_window.setMenu(null);
	}
	main_window.loadURL(url.format({
		pathname: path.join(__dirname, 'build', 'index.html'),
		protocol: 'file:',
		slashes: true,
	}));
	tools.fix_window(main_window);
	main_window.on('close', app.quit);
}

function get_main_window() {
	return main_window;
}

function show_main_window() {
	if(main_window) main_window.show();
}

app.on('ready', function() {
	// this is called the Accelerator for future ref
	electron.globalShortcut.register('CommandOrControl+q', app.quit);
	electron.globalShortcut.register('CommandOrControl+Shift+k', function() {
		var win = BrowserWindow.getFocusedWindow()
		win.webContents.toggleDevTools();
	});
});
app.on('ready', create_main_window);
app.on('windows-all-closed', function() {
	if(process.platform == 'darwin') return;
	app.quit()
});
app.on('activate', function() {
	if(mainWindow === null) { create_main_window(); }
});

var tray_icon = null;
function update_tray() {
	if(!tray_icon) {
		tray_icon = new electron.Tray(tools.ticon(32));
		tray_icon.on('click', show_main_window);
	}
	var menuitems = [];
	menuitems.push({ label: 'Open', click: show_main_window, icon: tools.ticon(16) });
	menuitems.push({ label: 'Quit', click: app.quit });
	var menu = electron.Menu.buildFromTemplate(menuitems);
	tray_icon.setContextMenu(menu);
}
app.on('ready', update_tray);

// set up a comm layer between our main and renderer thread(s)
comm.setup(get_main_window, popup.get_window, function(e, msg) {
	// TODO: dispatch messages from main window
});

// start our HTTP RPC server
dispatch.start({dispatch_port: config.dispatch_port});

