var turtl = require('turtl');

/**
 * Start the Turtl lisp process
 */
var start	=	function()
{
	return turtl.start();
};

/**
 * Stop/shutdown the Turtl lisp process
 */
var stop	=	function()
{
	turtl.stop();
}

/**
 * Give us a random UUID
 */
var uuid	=	function()
{
	return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
		var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
		return v.toString(16);
	});
}

/**
 * Main event triggering mechanism. Allows for a central location of event
 * binding and triggering.
 */
var Event	=	function() {
	// holds all event handlers
	var _handlers	=	{};

	/**
	 * Trigger an event
	 */
	var trigger	=	function(event)
	{
		// make our triggering async.
		setTimeout(function() {
			var ev			=	event.ev;
			var handlers	=	_handlers[ev];
			if(!handlers) return;

			for(var i = 0; i < handlers.length; i++)
			{
				var handler	=	handlers[i];
				handler(event);
			}
		}, 0);
	};

	/**
	 * Bind a function to events of the given type
	 */
	var bind	=	function(event_name, fn)
	{
		if(!_handlers[event_name]) _handlers[event_name] = [];
		_handlers[event_name].push(fn);
	}

	/**
	 * Remove an event/callback pair
	 */
	var unbind	=	function(event_name, fn)
	{
		var handlers	=	_handlers[event_name];
		if(!handlers) return false;

		var length	=	handlers.length;
		handlers	=	handlers.filter(function(hn) { return hn != fn; });
		_handlers[event_name]	=	handlers;

		return (length > handlers.length);
	}

	/**
	 * Bind a callback to an event, and remove the binding after the first time
	 * the event is triggered.
	 */
	var bind_once	=	function(event_name, fn)
	{
		var wrapped	=	function(_)
		{
			unbind(event_name, fn);
			fn.apply(this, arguments);
		};
		return bind(event_name, wrapped);
	}

	// exportz
	this.trigger	=	trigger;
	this.bind		=	bind;
	this.unbind		=	unbind;
	this.bind_once	=	bind_once;
};

/**
 * Communication medium between JS and lisp
 */
var Remote	=	function() {
	// holds response functions (allows request->response type messaging)
	var _responses	=	{};

	// whether or not our garbage collection is running
	var _gc_running	=	false;

	/**
	 * Send an event to lisp. Optionally takes a response function as the
	 * second arg which will be triggered when the event gets a response.
	 */
	var send	=	function(event, on_response, options)
	{
		options || (options = {});

		// decide how long our message lives (specifically its callback, if even
		// specified). default: 30s
		var lifetime	=	options.lifetime;
		if(!lifetime) lifetime = 30000;

		// if we want to bind to the event response, give our event a UUID and
		// track the id -> callback binding
		if(on_response)
		{
			event.id				=	uuid();
			var ttl					=	new Date().getTime() + lifetime;
			_responses[event.id]	=	{cb: on_response, ttl: ttl};
		}

		// send it off
		turtl.send_msg_lisp(JSON.stringify(event));
	};

	/**
	 * Given a callback, all remote events will be handed to the callback. If
	 * an event is a response, an we have a corresponding response function,
	 * the response function is called *instead of* the main callback.
	 */
	var bind	=	function(cb)
	{
		turtl.set_msg_callback(function(msg) {
			var event		=	JSON.parse(msg);
			event.remote	=	true;
			if(event.id && _responses[event.id])
			{
				var on_response	=	_responses[event.id];
				on_response.cb(event);

				// clean up
				delete _responses[event.id];
			}
			else
			{
				cb(event);
			}
		});
	};

	/**
	 * Removes stale response functions
	 */
	var gc	=	function()
	{
		if(_gc_running) return;
		_gc_running	=	true;

		var do_gc	=	function()
		{
			var keys	=	Object.keys(_responses);
			var now		=	new Date().getTime();
			keys.forEach(function(key) {
				if(_responses[key].ttl > now) return;
				delete _responses[key];
			});
			setTimeout(do_gc, 5000);
		};

		setTimeout(do_gc, 5000);
	};

	// automatically start our GC
	gc();

	this.send	=	send;
	this.bind	=	bind;
};

exports.start	=	start;
exports.stop	=	stop;
exports.uuid	=	uuid;
exports.Event	=	Event;
exports.Remote	=	Remote;

