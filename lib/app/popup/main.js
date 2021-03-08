"use strict";

turtl.init = function() {
	turtl.user = new User();
	turtl.user.logged_in = true;
	turtl.profile = new Profile();
	turtl.keyboard = new TurtlKeyboard();
	turtl.context = new PageContext();
	turtl.overlay = new TurtlOverlay();
	turtl.controllers.pages = new PagesController();
	turtl.setup_router();
	turtl.events.trigger('popup-load');
	turtl.search = new SearchIPC();
};

(function() {
	function requires_login() {
		$('background_content').addClass('no-pad');
		new UserMustLoginController({
			inject: $('background_content'),
		});
	}

	var popup_load = new Promise(function(resolve) {
		turtl.events.bind_once('popup-load', resolve);
	});
	function con_handler(controller) {
		controller.bind('release', function() {
			window.close();
		});
	}
	AppComm.ipc.on('load-type', function(e, type, data) {
		switch(type) {
			case 'pair':
				var con = new PairingController({
					inject: $('background_content'),
					public_key: data.public_key,
				});
				con_handler(con);
				break;
			case 'bookmarker':
				var profdata;
				ipc_send('profile:get', ['user', 'spaces', 'boards'])
					.then(function(profdata_) {
						profdata = profdata_;
						if(!profdata) return requires_login();
						return popup_load;
					})
					.then(function() {
						var userdata = profdata.user;
						delete profdata.user;
						turtl.user.set(userdata);
						turtl.profile.set(profdata);
						var con = new BookmarkController({
							inject: $('background_content'),
							linkdata: data,
						});
						con_handler(con);
						var interval = setInterval(function() {
							ipc_send('profile:get', ['spaces', 'boards'])
								.then(function(data) {
									turtl.profile.get('boards').reset(data.boards, {upsert: true});
									turtl.profile.get('spaces').reset(data.spaces, {upsert: true});
								});
						}, 4000);
						con.bind('release', function() { clearInterval(interval); });
					});
				break;
		}
	});
})();

