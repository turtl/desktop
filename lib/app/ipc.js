"use strict";

(function() {
	Node.ipc.on('message', function(e, message) {
		var mid = message.mid;
		var res = null;
		switch(message.type) {
			case 'profile:get':
				res = {};
				message.value.forEach(function(key) {
					if(!turtl.profile) {
						res = false;
						return;
					}
					if(key == 'user') {
						res[key] = turtl.user && turtl.user.toJSON();
						return;
					}
					var obj = turtl.profile.get(key);
					if(!obj) return;
					res[key] = obj.toJSON();
				});
				break;
			case 'profile:search':
				var search = message.value[0];
				var options = message.value[1];
				res = turtl.search.search(search, options);
				break;
			case 'note:save':
				var note_data = message.value[0];
				var note = new Note(note_data);
				res = note.save();
				break;
			case 'scrape':
				res = turtl.core.send('clip', message.value[0], message.value[1]);
				break;
			default:
				res = Promise.reject('unknown action: '+message.type);
				break;
		}
		Promise.resolve(res)
			.then(function(val) {
				Node.ipc.send('message', {
					mid: mid,
					to: 'popup',
					type: message.type,
					value: val,
				});
			})
			.catch(function(err) {
				if(err instanceof Error) {
					err = err.message;
				}
				Node.ipc.send('message', {
					mid: mid,
					to: 'popup',
					type: message.type,
					value: {error: err},
				});
			});
	});
})();
