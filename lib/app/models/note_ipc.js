var NoteIPC = Note.extend({
	sync: function(method, model, options) {
		var notedata = model.toJSON();
		return ipc_send('note:save', [notedata])
			.then(options.success)
			.catch(function(err) {
				options.error(derr(err));
			})
	}
});

