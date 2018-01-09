"use strict";

const electron = require('electron');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const url = require('url');
const path = require('path');
const context = require('electron-context-menu');

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


/*
// init our environment
(function() {
	var win = gui.Window.get();

	// handle <a> tags properly. if it's a blob/file URL, we open an in-app
	// window. if it's an external URL we open an OS browser window. otherwise
	// just return business as usual (probably an in-app link)
	tools.hijack_external_links(win);

	make_tray();
	win.on('minimize', function() {
		if(!min_to_tray) return false;
		win.hide();
		// Window.hide() hides the tray menu, so we just remove it and re-add it
		make_tray();
	});

	var menu = new gui.Menu({ type: "menubar" });
	try
	{
		if(menu.createMacBuiltin)
		{
			menu.createMacBuiltin('Turtl');
			win.menu = menu;
		}
	}
	catch(err)
	{
		log.warn('init: create mac menu: ', err);
	}

})();

window.addEvent('domready', function() {
	window.port = new DesktopAddonPort({comm: comm});

	// when turtl loads, make sure we keep our tray menu up to date
	window.port.bind('loaded', bind_login_to_menu);
	// when this is triggered, we already have a new user obj.
	window.port.bind('logout', bind_login_to_menu);

	// add context menus for downloading images
	tools.attach_image_context_menu(window);

	// add copy/paste context menus
	tools.attach_copy_paste_context_menu(window);

	// add copy url context menu to links
	tools.attach_copy_url_context_menu(window);

	var keyboard = new TurtlKeyboard().attach();
	// Ctrl+Shift+k is open console (if enabled in config). note we use 'raw'
	// here instead of ctrl+shift+k because we want this to work even if
	// TRIGGERED from an input field
	keyboard.bind('raw', function(obj) {
		if(!(obj.key == 'k' && obj.control && obj.shift && !obj.meta && !obj.alt)) return;
		gui.Window.get().showDevTools();
	});
});

var dispatch = new Dispatch();
dispatch.start();
*/

