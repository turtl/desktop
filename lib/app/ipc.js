"use strict";

(function() {
	Node.ipc.on('message', function(e, message) {
		var mid = message.mid;
		var res = null;
		switch(message.type) {
			case 'profile:get':
				res = {};
				message.value.forEach(function(key) {
					if(!turtl.profile) return;
					var obj = turtl.profile.get(key);
					if(!obj) return;
					res[key] = obj.toJSON();
				});
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
			});
	});
})();
