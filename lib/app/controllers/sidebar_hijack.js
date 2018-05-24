/**
 * Sorry in advance to anyone looking at this. It's layers and layers of hacks
 * to make the sidebar work with the bookmarker.
 */
var SidebarHijackController = SidebarController.extend({
	events: {
		'click .spaces a.go': 'select_space',
	},

	initialize: function() {
		// sorry
		this.view_state.edit_icons = false;

		// make sure that when the sidebar opens, the spaces open
		var _open = this.open.bind(this);
		this.open = function() {
			_open();
			this.open_spaces();
		}.bind(this);

		// make sure that when the spaces close, so does the sidebar
		var _close_spaces = this.close_spaces.bind(this);
		this.close_spaces = function() {
			// some infinite loop prevention, ugh
			var _cs_tmp = this.close_spaces;
			this.close_spaces = function() {};
			try {
				this.close();
			} finally {
				// exceptions HATE him!!!
				this.close_spaces = _cs_tmp;
			}
		}.bind(this);

		this.parent();
	},

	init: function() {
		this.parent();
		setTimeout(function() {
			// tell the sidebar to load
			turtl.events.trigger('app:objects-loaded');
		}, 1000);
	},

	select_space: function(e) {
		if(e) e.stop();
		var li = Composer.find_parent('li', e.target);
		if(!li) return;
		var space_id = li.get('rel');
		if(!space_id) return;
		turtl.profile.set_current_space(space_id);
		turtl.events.trigger('profile:set-current-space');
		this.close();
	},
});

