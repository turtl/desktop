var OpenNoteController = Composer.Controller.extend({
	elements: {
		'.note-edit-container': 'edit_container'
	},

	init: function()
	{
		this.bind('release', function() {
			window.port.send('close');
			window.port.send('addon-controller-release');
		});
	},

	create_sub: function(params)
	{
		var edit_container = this.edit_container;
		if(!params.title) params.title = 'Note';
		if(!params.modal_opts)
		{
			// would be nice if this was commented. thanks, past self.
			// looks like we wrap it to only show the back button once, then
			// never again after that. kinda jenky, but seems to work for hiding
			// the back link in the bookmarker
			params.modal_opts = (function() {
				var ran = false;
				return function() {
					var obj = {
						inject: edit_container,
						skip_overlay: true,
						skip_close_on_pageload: true,
						skip_body_class: true,
						// only set show_back:false once (on first modal)
						show_back: ran
					};
					ran = true;
					return obj;
				};
			})()
		}
		return new NotesEditController(params);
	},

	resize: function(delay)
	{
		delay || (delay = 0);
		var do_set = function()
		{
			if(window.port) window.port.send('resize');
		};
		if(delay > 0)
		{
			do_set.delay(delay, this);
		}
		else
		{
			do_set();
		}
	}
});

