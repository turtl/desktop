(function() {
"use strict";

var ref = require('ref');
var ffi = require('ffi');

var dll_loc = __dirname+'/../build/turtl_core';
console.log('dll: ', dll_loc);
/*
var TurtlCore = ffi.Library(dll_loc, {
	'turtlc_start': ['int32', ['string']],
	'turtlc_send': ['int32', ['pointer', 'size_t']],
	'turtlc_recv': ['pointer', ['uint8', 'string', 'size_t*']],
	'turtlc_recv_event': ['pointer', ['uint8', 'size_t*']],
	'turtlc_free': ['int32', ['pointer', 'size_t']],
});
*/

CoreComm.adapters.desktop = Composer.Event.extend({
	options: {
		endpoint: 'ws://127.0.0.1:7472',
	},

	conn: null,

	initialize: function(options) {
		options || (options = {});
		Object.keys(options).forEach(function(key) {
			this.options[key] = options[key];
		}.bind(this));
		this.reconnect();
	},

	close: function() {
	},

	reconnect: function() {
	},

	send: function(msg) {
	},
});

})();
