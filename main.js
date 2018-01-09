const electron = require('electron');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const url = require('url');
const path = require('path');

process.env['PATH'] = process.env['PATH']+path.delimiter+path.join(__dirname, 'build');

let main_window;

function create_window() {
	main_window = new BrowserWindow({width: 1023, height: 768});
	main_window.loadURL(url.format({
		pathname: path.join(__dirname, 'build', 'index.html'),
		protocol: 'file:',
		slashes: true,
	}));
	main_window.on('close', function() { main_window = null; });
}

app.on('ready', create_window);
app.on('windows-all-closed', function() {
	if(process.platform == 'darwin') return;
	app.quit()
});
app.on('activate', function() {
	if(mainWindow === null) { create_window(); }
});

