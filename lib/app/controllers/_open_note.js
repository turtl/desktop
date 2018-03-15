var OpenNoteController = Composer.Controller.extend({
	elements: {
		'.note-edit-container': 'edit_container'
	},

	create_sub: function(params) {
		var edit_container = this.edit_container;
		if(!params.modal_opts) {
			// would be nice if this was commented. thanks, past self.
			// looks like we wrap it to only show the back button once, then
			// never again after that. kinda jenky, but seems to work for hiding
			// the back link in the bookmarker
			params.modal_opts = (function() {
				var ran = false;
				return function() {
					var obj = Object.merge({
						inject: edit_container,
						skip_overlay: true,
						skip_close_on_pageload: true,
						skip_body_class: true,
						// only set show_back:false once (on first modal)
						show_back: ran
					}, params.extra_modal_options || {});
					ran = true;
					return obj;
				};
			})()
		}
		return new NotesEditController(params);
	},
});

