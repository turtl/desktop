"use strict";
const electron = require('electron');
const app = electron.app;
const Menu = electron.Menu;
const BrowserWindow = electron.BrowserWindow;
const url = require('url');
const path = require('path');
const context = require('electron-context-menu');
const config = require('./build/config');
const comm = require('./lib/node/comm');
const dispatch = require('./lib/node/dispatch');
const Popup = require('./lib/node/popup');
const tools = require('./lib/node/tools');

// add build/ to our PATH so any libraries dropped in there will be found
process.env['PATH'] = process.env['PATH']+path.delimiter+path.join(__dirname, 'build');
process.env['LD_LIBRARY_PATH'] = process.env['LD_LIBRARY_PATH']+path.delimiter+path.join(__dirname, 'build');
process.env['CLIPPO_PARSERS'] = path.join(__dirname, 'build', 'clippo', 'parsers.yaml');

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
		icon: tools.ticon(128),
		webPreferences: {
			// suckerrrs. note we don't use sandbox since we need path support
			// as well as ffi
			nodeIntegration: false,
			// disable <webview> as well
			webviewTag: false,
			// loads turtl core/ipc so we don't need node
			preload: path.join(__dirname, 'lib', 'node', 'preload', 'ipc_core.js'),
		},
	});
	const ses = main_window.webContents.session;
	ses.resolveProxy('https://apiv3.turtlapp.com', (proxy) => {
		if(!proxy) return;
		proxy = proxy.toLowerCase().split(' ')
		if(proxy[0] == 'proxy') {
			config.proxy = proxy[1];
			console.log('Setting proxy: ', config.proxy);
		}
	});

	if(process.platform != 'darwin') {
		main_window.setMenu(null);
	} else {
		var template = [
			{
				label: "Application",
				submenu: [
					{ label: "Quit", accelerator: "Command+Q", click: function() { app.quit(); }}
				]
			},
			{
				label: "Edit",
				submenu: [
					{ label: "Undo", accelerator: "CmdOrCtrl+Z", selector: "undo:" },
					{ label: "Redo", accelerator: "Shift+CmdOrCtrl+Z", selector: "redo:" },
					{ type: "separator" },
					{ label: "Cut", accelerator: "CmdOrCtrl+X", selector: "cut:" },
					{ label: "Copy", accelerator: "CmdOrCtrl+C", selector: "copy:" },
					{ label: "Paste", accelerator: "CmdOrCtrl+V", selector: "paste:" },
					{ label: "Select All", accelerator: "CmdOrCtrl+A", selector: "selectAll:" }
				]
			}
		];
		Menu.setApplicationMenu(Menu.buildFromTemplate(template));
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

var tray_icon = null;
function update_tray() {
	if(process.platform == 'darwin') return;
	if(!tray_icon) {
		tray_icon = new electron.Tray(tools.ticon(32));
		tray_icon.on('click', show_main_window);
	}
	var menuitems = [];
	menuitems.push({ label: 'Open', click: show_main_window, icon: tools.ticon(16) });
	menuitems.push({
		label: 'Quit',
		click: app.quit,
		accelerator: 'CommandOrControl+q'
	});
	menuitems.push({
		label: 'Dev tools',
		click: function() {
			var win = BrowserWindow.getFocusedWindow();
			win.webContents.toggleDevTools();
		},
		accelerator: 'CommandOrControl+Shift+k',
		visible: false,
	});
	menuitems.push({
		label: 'Close window',
		click: function() {
			var win = BrowserWindow.getFocusedWindow();
			var popup_win = Popup.get_window();
			if(popup_win && win == popup_win) {
				popup_win.close();
			}
		},
		accelerator: 'CommandOrControl+w',
		visible: false,
	});
	var menu = electron.Menu.buildFromTemplate(menuitems);
	tray_icon.setContextMenu(menu);
}

function setup_config_comm() {
	electron.ipcMain.on('synchronous-message', (event, cmd) => {
		switch(cmd) {
			case 'get-config':
				event.returnValue = JSON.parse(JSON.stringify(config));
				break;
			default:
				event.returnValue = null;
		}
	});
}

// -----------------------------------------------------------------------------

// check if we should be running
var should_quit = app.makeSingleInstance(function(_cmd, _derrr) {
	if(main_window) {
		if(main_window.isMinimized()) main_window.restore();
		main_window.focus();
	}
});
if(should_quit) { return app.quit(); }

app.on('ready', create_main_window);
app.on('ready', setup_config_comm);
app.on('windows-all-closed', function() {
	if(process.platform == 'darwin') return;
	app.quit()
});
app.on('activate', function() {
	if(main_window === null) { create_main_window(); }
});

app.on('ready', update_tray);

// set up a comm layer between our main and renderer thread(s)
comm.setup(get_main_window, Popup.get_window, function(e, msg) {
	// TODO: dispatch messages from main window
});

// start our HTTP RPC server
dispatch.start({dispatch_port: config.dispatch_port});

electron.ipcMain.on('app:quit', function(_ev, _arg) {
	app.quit();
});

