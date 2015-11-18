var BookmarkController = Composer.Controller.extend({
	class_name: 'bookmark',

	elements: {
		'div.bookmarker': 'edit_container'
	},

	events: {
		'change .notes-edit form input': 'save_form',
		'change .notes-edit form textarea': 'save_form',
		'change .notes-edit form select': 'save_form'
	},

	note: null,

	linkdata: {
		type: 'link',
		url: '',
		title: '',
		text: ''
	},

	edit_controller: null,
	last_url: null,

	init: function()
	{
		if(window.port) window.port.bind('bookmark-open', function(data) {
			// prevent overwriting what's in the bookmark interface
			if(data.url && data.url == this.last_url)
			{
				this.resize();
				return;
			}
			this.last_url = data.url;
			this.linkdata = data;
			// resize (in case height changed) and select the tag box
			this.resize.delay(100, this);
		}.bind(this));

		// do we have cached bookmark data, and if so, does it match the current
		// URL?
		var saved = turtl.bookmark_data || false;
		if(saved && saved.url == this.linkdata.url)
		{
			this.note = new Note(saved.note);
		}
		else
		{
			if(!this.linkdata.type)
			{
				log.error('bad bookmark item type.');
				(function() {
					window.port.send('close');
					window.port.send('addon-controller-release');
					this.release();
				}).delay(0, this);
				return false;
			}

			// clear the cache
			delete turtl.bookmark_data;

			this.note = new Note({
				boards: [],
				type: this.linkdata.type,
				url: this.linkdata.url,
				title: this.linkdata.title,
				text: this.linkdata.text
			});
		}

		this.render();

		this.bind('release', function() {
			window.port.send('close');
			window.port.send('addon-controller-release');
		});
	},

	render: function()
	{
		this.html('<div class="bookmarker"></div>');

		this.track_subcontroller('editor', function() {
			var edit_container = this.edit_container;
			var con = new NotesEditController({
				title: 'Bookmark',
				model: this.note,
				confirm_unsaved: false,
				modal_opts: (function() {
					var ran = false;
					return function() {
						var obj = {
							inject: edit_container,
							skip_overlay: true,
							skip_close_on_pageload: true,
							// only set show_back:false once (on first modal)
							show_back: ran
						};
						ran = true;
						return obj;
					};
				})()
			});

			// save the note in case bookmarker is clooooseeed
			this.with_bind(con.clone, 'change', this.track_note_changes.bind(this))
			this.with_bind(con.clone.get('tags'), 'change', this.track_note_changes.bind(this))

			var check = setInterval(this.track_note_changes.bind(this), 500);
			this.with_bind(con, 'release', function() {
				if(check)
				{
					clearInterval(check);
					check = null;
				}
				this.release();
			});
			this.with_bind(con, 'saved', function() {
				// remove the cache entry for this note
				delete turtl.bookmark_data;
				this.release();
			}.bind(this));

			return con;
		}.bind(this));

		this.resize();
	},

	/**
	 * save the currently-edited note into global memory so if the bookmarker is
	 * closed, the data is still there.
	 */
	track_note_changes: function()
	{
		var editor = this.get_subcontroller('editor');
		var note = editor && editor.clone;
		if(!note) return false;
		var data = note.toJSON();
		data = Object.merge(data, editor.grab_form_data());

		var save = {
			url: this.linkdata.url,
			note: data
		};

		// store it in the cache
		turtl.bookmark_data = save;
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
