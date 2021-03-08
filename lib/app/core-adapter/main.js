(function() {
"use strict";

if(!AppComm || !AppComm.core) return;
var TurtlCore = AppComm.core.TurtlCore;
var core_load_error = TurtlCore.get_load_error();
if(core_load_error) {
	setTimeout(function() {
		new LoadErrorController({error: core_load_error});
	}, 200);
	return;
}

var res = TurtlCore.init();
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
		var msg = TurtlCore.recv();
		if(!msg) return;
		this.trigger('message', msg);
	},

	poll_events: function() {
		var msg = TurtlCore.recv_event();
		if(!msg) return;
		// intercept app:quit events and send them to the main thread
		try {
			var parsed = JSON.parse(msg);
			if(parsed.e == 'app:quit') {
				window.AppComm.ipc.send('app:quit');
			}
		} catch(_e) {}
		this.trigger('message', msg);
		// if we got an event, poll immediately on next tick
		setTimeout(this.poll_events.bind(this), 5);
	},

	send: function(msg) {
		return TurtlCore.send(msg);
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
