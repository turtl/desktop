const electron = require('electron');

exports.popup_coords = function(width, height) {
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

