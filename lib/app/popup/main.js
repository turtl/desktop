"use strict";

turtl.init = function() {};

(function() {
	Node.ipc.on('load-type', function(e, type, data) {
		ipc_send('profile:get', ['spaces', 'boards'])
			.then(function(profdata) {
				turtl.profile = new Profile(profdata);
				switch(type) {
					case 'bookmarker':
						new BookmarkController({
							inject: $('background_content'),
							linkdata: data,
						});
						break;
				}
			});
	});
})();

