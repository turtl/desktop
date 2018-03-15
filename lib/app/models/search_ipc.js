var SearchIPC = Composer.Model.extend({
	search: function(search, options) {
		return ipc_send('profile:search', [search, options]);
	},
});

