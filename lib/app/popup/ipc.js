"use strict";

var ipc_send = (function() {
	// maps message ids to resolve functions
	var mapper = {};

	Node.ipc.on('message', function(e, message) {
		var resolver = mapper[message.mid];
		if(!resolver) return;
		if(message.value.error) {
			resolver.reject(message.value.error);
		} else {
			resolver.resolve(message.value);
		}
	});

	var id = 0;
	return function(type, data) {
		var mid = id++;
		return new Promise(function(resolve, reject) {
			mapper[mid] = {resolve: resolve, reject: reject};
			Node.ipc.send('message', {
				mid: mid,
				to: 'app',
				type: type,
				value: data,
			});
		}).finally(function() {
			delete mapper[mid];
		});
	};
})();

