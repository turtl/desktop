(function(global) {
	var gui = require('nw.gui');
	var res = [window.screen.width, window.screen.availHeight];
	var dims = [360, 80];
	var base_url = 'app:///data/data/notification/index.html';
	var Notifications = {
		enabled: true,
		win: null,
		action: false,

		open: function(options)
		{
			options || (options = {});

			Notifications.close();

			var url = base_url+'?';
			['title', 'body'].each(function(key) {
				if(!options[key]) return false;
				url	+=	key + '=' + escape(options[key]) + '&';
			});
			var xy = tools.get_popup_coords(dims[0], dims[1]);
			var win = gui.Window.open(url, {
				width: dims[0],
				height: dims[1],
				frame: false,
				toolbar: false
			});
			win.moveTo(xy.x, xy.y);
			win.on('loaded', function() {
				win.window.set_parent(gui.Window.get().window);
			});
			win.setShowInTaskbar(false);
			win.setAlwaysOnTop(true);
			Notifications.win = win;
			Notifications.action = options.action || false;
			(function() {
				Notifications.close();
			}).delay(10000);
		},

		close: function()
		{
			if(!Notifications.win) return;
			Notifications.win.close();
			Notifications.action = false;
		},

		click_action: function()
		{
			if(Notifications.action) Notifications.action();
			Notifications.close();
		}
	};
	global.Notifications = Notifications;
})(window);

