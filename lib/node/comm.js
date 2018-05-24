const electron = require('electron');

// HODLs our crypto key
var key = null;

exports.get_key = function() {
	return key;
};

/**
 * Sets up comm between main window and popup
 */
exports.setup = function(app_getter, popup_getter, dispatch_main) {
	var window_map = {
		'app': app_getter,
		'popup': popup_getter,
	};
	electron.ipcMain.on('message', function(e, msg) {
		if(msg.to == 'main') {
			return dispatch_main(e, msg);
		}
		var win = window_map[msg.to || null]();
		if(!win) return;
		win.webContents.send('message', msg);
	});
};

