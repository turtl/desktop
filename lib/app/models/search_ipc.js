var SearchIPC = Composer.Model.extend({
	search: function(search, options) {
		return ipc_send('profile:search', [search, options])
			.then(([notes, ...rest]) => {
				return [notes.map((n) => new Note(n)), ...rest];
			});
	},
});

