var AddNoteController = OpenNoteController.extend({
	elements: {
	},

	init: function()
	{
		this.parent();
		this.render();
	},

	render: function()
	{
		this.html('<div class="note-edit-container"></div>');

		this.track_subcontroller('editor', function() {
			var con = this.create_sub({
				model: this.note,
				title: 'Add a note',
				confirm_unsaved: true
			});
			this.with_bind(con, 'release', this.release.bind(this));
			this.with_bind(con, 'saved', this.release.bind(this));
			return con;
		}.bind(this));
	}
});

