(function(global) {
	var gui			=	require('nw.gui');
	var res			=	[window.screen.width, window.screen.availHeight];
	var dims		=	[360, 80];
	var base_url	=	'app:///data/data/notification/index.html';
	var Notifications	=	{
		enabled: true,
		win: null,
		action: false,

		open: function(options)
		{
			options || (options = {});

			Notifications.close();

			var url	=	base_url+'?';
			['title', 'body'].each(function(key) {
				if(!options[key]) return false;
				url	+=	key + '=' + escape(options[key]) + '&';
			});
			win	=	gui.Window.open(url, {
				width: dims[0],
				height: dims[1],
				frame: false,
				toolbar: false
			});
			win.on('loaded', function() {
				win.window.set_parent(gui.Window.get().window);
			});
			win.moveTo(
				res[0] - (dims[0] + 6),
				res[1] - (dims[1])
			);
			win.setShowInTaskbar(false);
			win.setAlwaysOnTop(true);
			Notifications.win		=	win;
			Notifications.action	=	options.action || false;
			(function() {
				Notifications.close();
			}).delay(8000);
		},

		close: function()
		{
			if(!Notifications.win) return;
			Notifications.win.close();
			Notifications.action	=	false;
		},

		click_action: function()
		{
			if(!Notifications.action) return;
			Notifications.action();
			Notifications.close();
		}
	};
	global.Notifications	=	Notifications;
})(window);

