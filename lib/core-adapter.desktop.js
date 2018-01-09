(function() {
"use strict";
const ref = require('ref');
const ffi = require('ffi');
const path = require('path');

var dll_loc = path.join(__dirname, '..', 'build', 'turtl_core.dll');
var TurtlCore = ffi.Library(dll_loc, {
	'turtlc_start': ['int32', ['string', 'uint8']],
	'turtlc_send': ['int32', ['pointer', 'size_t']],
	'turtlc_recv': ['pointer', ['uint8', 'string', 'size_t*']],
	'turtlc_recv_event': ['pointer', ['uint8', 'size_t*']],
	'turtlc_free': ['int32', ['pointer', 'size_t']],
});

function init_turtl() {
	process.env['TURTL_CONFIG_FILE'] = path.join(__dirname, '..', 'build', 'config.yaml');
	var app = require('electron').remote.app;
	var config = {
		loglevel: 'info',
		data_folder: app.getPath('userData'),
	};
	return TurtlCore.turtlc_start(JSON.stringify(config), 1);
}

var res = init_turtl();
if(res !== 0) {
	alert('Error initializing core: '+res);
	return;
}

var CoreMessenger = Composer.Event.extend({
	poller: null,

	initialize: function() {
		var poll_interval = 100;
		this.poller = setInterval(this.poll.bind(this), poll_interval);
	},

	poll: function() {
		this.poll_messages();
		this.poll_events();
	},

	poll_messages: function() {
		var lenref = ref.alloc('size_t');
		var recv = TurtlCore.turtlc_recv(1, null, lenref);
		if(recv.isNull()) return;
		var len = lenref.deref();
		var data = ref.reinterpret(recv, len);
		var msg = new Buffer(data.buffer).toString('utf8');
		this.trigger('message', msg);
	},

	poll_events: function() {
		var lenref = ref.alloc('size_t');
		var recv = TurtlCore.turtlc_recv_event(1, lenref);
		if(recv.isNull()) return;
		var len = lenref.deref();
		var data = ref.reinterpret(recv, len);
		var msg = new Buffer(data.buffer).toString('utf8');
		this.trigger('message', msg);
	},

	send: function(msg) {
		var buf = Buffer.from(msg, 'utf8')
		return TurtlCore.turtlc_send(buf, buf.length);
	},

	destroy: function() {
		clearInterval(this.poller);
		this.poller = null;
		this.unbind();
	},
});

CoreComm.adapters.desktop = Composer.Event.extend({
	conn: null,

	initialize: function(options) {
		options || (options = {});
		Object.keys(options).forEach(function(key) {
			this.options[key] = options[key];
		}.bind(this));
		setTimeout(this.reconnect.bind(this), 10);
	},

	close: function() {
		if(this.conn) {
			this.conn.destroy();
			this.conn = null;
			this.trigger('connected', false);
			this.trigger('reset');
		}
	},

	reconnect: function() {
		this.close();
		this.conn = new CoreMessenger();
		this.trigger('connected', true);
		// forward messages
		this.conn.bind('message', this.trigger.bind(this, 'message'));
	},

	send: function(msg) {
		return this.conn.send(msg);
	},
});

})();
