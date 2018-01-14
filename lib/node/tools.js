const electron = require('electron');
const path = require('path');

exports.fix_window = function(win) {
	function handle_external(e, url) {
		e.preventDefault();
		electron.shell.openExternal(url);
	}
	win.webContents.on('new-window', handle_external);
	win.webContents.on('will-navigate', handle_external);
}

exports.ticon = function(size, notify) {
	if(size == 16) size = '';
	else size = '.'+size.toString();
	return path.join(
		__dirname,
		'..',
		'..',
		'build',
		'app',
		'images',
		'favicon'+size.toString()+(notify ? '.notify' : '')+'.png'
	);
}

