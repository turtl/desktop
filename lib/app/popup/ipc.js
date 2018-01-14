"use strict";

var ipc_send = (function() {
	const electron = require('electron');

	// maps message ids to resolve functions
	var mapper = {};

	electron.ipcRenderer.on('message', function(e, message) {
		var resolver = mapper[message.mid];
		if(!resolver) return;
		if(message.value.error) {
			resolver.reject(message.value);
		} else {
			resolver.resolve(message.value);
		}
	});

	var id = 0;
	return function(type, data) {
		var mid = id++;
		return new Promise(function(resolve, reject) {
			mapper[mid] = {resolve: resolve, reject: reject};
			electron.ipcRenderer.send('message', {
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

