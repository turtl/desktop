var BookmarkController = OpenNoteController.extend({
	xdom: true,
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

	last_url: null,

	init: function() {
		this.parent();

		var last_space = localStorage['bookmarker.last_space'];
		var last_board = localStorage['bookmarker.last_board'];
		if(last_space) {
			turtl.profile.set_current_space(last_space);
		}

		var bg = this.el.getParent();
		bg.addClass('no-pad');
		document.body.addClass('header');
		turtl.controllers.header = new HeaderController();
		turtl.controllers.sidebar = new SidebarHijackController({spaces_only: true});
		this.bind('release', function() {
			bg.removeClass('no-pad');
			document.body.removeClass('header');
			turtl.controllers.header.release();
			turtl.controllers.sidebar.release();
		});

		turtl.push_title(i18next.t('New bookmark'), false, {prefix_space: true});

		// do we have cached bookmark data, and if so, does it match the current
		// URL?
		if(!this.linkdata.type) {
			log.error('bad bookmark item type.');
			(function() {
				this.release();
			}).delay(0, this);
			return false;
		}

		this.note = new NoteIPC({
			board_id: last_board || null,
			type: this.linkdata.type,
			url: this.linkdata.url,
			title: this.linkdata.title,
			text: this.linkdata.text
		});

		var scrape_promise = Promise.resolve();
		var url = this.linkdata.url;
		if(!this.linkdata.title || !this.linkdata.text || !this.linkdata.text.match(/\[image\]/) || url.match(/(youtube|amazon)\.com/i)) {
			scrape_promise = ipc_send('scrape', [url, []])
				.bind(this)
				.then(function(data) {
					var update = {};
					var text = this.note.get('text').trim();
					var img_md = '![image]('+data.image_url+')';
					if(!text) {
						if(data.image_url) text += img_md;
						if(data.description) text += '  '+data.description;
					} else {
						if(data.image_url) {
							if(text.match(/\!\[image\]\(.*?\)/)) {
								text = text.replace(/\!\[image\]\(.*?\)/, img_md);
							} else {
								text = img_md+text;
							}
						}
					}
					this.note.set({text: text});
				})
				.catch(function(err) {
					log.error('bookmarker: problem scraping url: ', err);
				});
		}

		scrape_promise
			.bind(this)
			.then(function() {
				return this.render();
			})
			.then(function() {
				this.sub('editor', function() {
					var con = this.create_sub({
						model: this.note,
						board_id: false,
						bind_keys: true,
						disable_esc: true,
						inject: this.edit_container,
						title: 'Bookmark',
						formclass: 'notes-edit form-uncard',
						confirm_unsaved: false,
						skip_resize_text: true,
						skip_modal: true,
					});

					if(!con.clone) throw new Error('Missing NotesEditController.clone');

					this.with_bind(con, 'release', function() {
						this.release();
					}.bind(this));
					this.with_bind(con, 'saved', function() {
						var space_id = con.model.get('space_id');
						var board_id = con.model.get('board_id');
						if(space_id) localStorage['bookmarker.last_space'] = space_id;
						if(board_id) {
							localStorage['bookmarker.last_board'] = board_id;
						} else {
							delete localStorage['bookmarker.last_board'];
						}

						this.release();
					}.bind(this));

					return con;
				}.bind(this));
			});
	},

	render: function() {
		return this.html('<div class="bookmarker"></div>');
	},
});

