(function() {
"use strict";

var TurtlCore = Node.core.TurtlCore;

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
		this.trigger('message', msg);
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
