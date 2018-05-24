const electron = require('electron');
const app = electron.app;
const path = require('path');

exports.fix_window = function(win, options) {
	options || (options = {});

	function handle_external(e, url) {
		e.preventDefault();
		electron.shell.openExternal(url);
	}
	win.webContents.on('new-window', handle_external);
	win.webContents.on('will-navigate', handle_external);
	win.webContents.on('before-input-event', function(event, input) {
		if(input.type != 'keyDown') return;
		var key = input.key.toLowerCase();
		var ctrl = input.control;
		var cmd = input.meta;
		var cmd_or_ctrl = ctrl || cmd;
		var shift = input.shift;
		if(cmd_or_ctrl && key == 'q') app.quit();
		if(cmd_or_ctrl && shift && key == 'k') win.webContents.toggleDevTools();
		if(options.ctrlw && cmd_or_ctrl && key == 'w') win.close();
	});
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

