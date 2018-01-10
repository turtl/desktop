"use strict";

const electron = require('electron');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const url = require('url');
const path = require('path');
const context = require('electron-context-menu');
const config = require('./build/config');
const dispatch = require('./lib/node/dispatch');

// add build/ to our PATH so any libraries dropped in there will be found
process.env['PATH'] = process.env['PATH']+path.delimiter+path.join(__dirname, 'build');

if(process.env['TURTL_USERDATA_DIR']) {
	app.setPath('userData', process.env['TURTL_USERDATA_DIR']);
}

context({
	prepend: function(params, win) {
		return [];
	}
});
let main_window;

function ticon(size, notify) {
	if(size == 16) size = '';
	else size = '.'+size.toString();
	return path.join(
		__dirname,
		'build',
		'app',
		'images',
		'favicon'+size.toString()+(notify ? '.notify' : '')+'.png'
	);
}

function fix_window(win) {
	function handle_external(e, url) {
		e.preventDefault();
		electron.shell.openExternal(url);
	}
	win.webContents.on('new-window', handle_external);
	win.webContents.on('will-navigate', handle_external);

}

function create_main_window() {
	main_window = new BrowserWindow({width: 1024, height: 768, x: 10, y: 10, icon: ticon(32)});
	if(process.platform != 'darwin') {
		main_window.setMenu(null);
	}
	main_window.loadURL(url.format({
		pathname: path.join(__dirname, 'build', 'index.html'),
		protocol: 'file:',
		slashes: true,
	}));
	fix_window(main_window);
	main_window.on('close', function() { main_window = null; });
	// this is called the Accelerator for future ref
	electron.globalShortcut.register('CommandOrControl+q', function() {
		app.quit();
	});
	electron.globalShortcut.register('CommandOrControl+Shift+i', function() {
		if(!main_window) return;
		main_window.webContents.toggleDevTools();
	});
}

function show_window() {
	if(main_window) main_window.show();
}

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
		tray_icon = new electron.Tray(ticon(32));
		tray_icon.on('click', show_window);
	}
	var menuitems = [];
	menuitems.push({ label: 'Open', click: show_window, icon: ticon(16) });
	menuitems.push({ label: 'Quit', click: app.quit });
	var menu = electron.Menu.buildFromTemplate(menuitems);
	tray_icon.setContextMenu(menu);
}
app.on('ready', update_tray);

dispatch.start({dispatch_port: config.dispatch_port});

