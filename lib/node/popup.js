const tools = require('./lib/node/tools');
const BrowserWindow = electron.BrowserWindow;
exports.open_popup = function() {
	var width = 600;
	var height = 400;
	var coords = tools.popup_coords(width, height);
	var bookwin = new BrowserWindow({
		width: width,
		height: height,
		x: coords.x,
		y: coords.y,
		icon: ticon(32),
		alwaysOnTop: true,
	});
	if(process.platform != 'darwin') {
		bookwin.setMenu(null);
	}
	bookwin.loadURL(url.format({
		pathname: path.join(__dirname, 'build', 'popup.html'),
		protocol: 'file:',
		slashes: true,
	}));
	fix_window(bookwin);
}

