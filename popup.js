(function(global) {
	var gui = require('nw.gui');
	var Popup = {
		win: null,

		las_dispatch: null,
		last_container: null,
		last_inject: null,
		controller: null,

		open: function(options)
		{
			options || (options = {});

			var width = 750;
			var height = 100;
			var max_height = 500;
			var xy = tools.get_popup_coords(width, height);

			Popup.last_dispatch = options.dispatch;

			if((!turtl || !turtl.user || !turtl.user.logged_in) && !options.skip_login)
			{
				var win = gui.Window.get();
				win.show();
				win.focus();
				return false;
			}
			Popup.close();

			var win = gui.Window.open('app:///data/data/popup/index.html', {
				width: width,
				height: height,
				frame: false,
				toolbar: false
			});
			win.moveTo(xy.x, xy.y);
			// resize the popup per the wishes of the inner window, HOWEVER cap
			// it at max_height
			comm.bind('resize', function() {
				// NOTE: sometimes (?) body doesn't have getElement(). seems
				// random, especially because by the time a 'resize' could fire,
				// MT is fully loaded. odd. either way, catch it and default to
				// max height.
				try
				{
					var new_height = win.window.document.body.getElement('#wrap-modal').getCoordinates().height + 2
				}
				catch(e)
				{
					log.error('popup: resize: ', e);
					var new_height = max_height;
				}
				new_height = Math.min(new_height, max_height);
				win.resizeTo(width, new_height);
				(function () { win.resizeTo(width, new_height); }).delay(50, this);
				var xy = tools.get_popup_coords(width, new_height);
				win.moveTo(xy.x, xy.y);
			}, 'popup:resize');
			win.on('loaded', function() {
				if(!options.skip_focus) win.focus();
				win.window.set_parent(gui.Window.get().window, options);
				tools.attach_copy_paste_context_menu(win.window);
				tools.hijack_external_links(win.window);
			});
			if(win.setShowInTaskbar) win.setShowInTaskbar(false);
			win.setAlwaysOnTop(true);
			Popup.win = win;
		},

		close: function()
		{
			if(!Popup.win) return false;
			comm.unbind_context('popup:resize');
			Popup.release();
			Popup.win.close();
			Popup.win = null;
		},

		load_controller: function(container_el, controller, params, options)
		{
			params || (params = {});
			options || (options = {});

			Popup.last_container = container_el;
			if(params.inject)
			{
				Popup.last_inject = params.inject;
			}

			var appclass = window[controller];
			if(!appclass)
			{
				log.error('panel: error: class app.'+controller+' not found.');
				return false;
			}
			Popup.controller = new appclass(params);

			comm.bind('addon-controller-release', function() {
				comm.unbind_context('panel:controller-release');
				Popup.release();
			}, 'panel:controller-release');
			comm.bind('close', function() {
				comm.unbind_context('panel_close');
				Popup.close();
			}, 'panel:close');
		},

		release: function()
		{
			var controller = Popup.controller;
			if(controller && controller.release) controller.release();
		}
	}
	global.Popup = Popup;
})(window);
