/**
 * This object provides a standard interface for the addon and the app to talk
 * to each other. Although in a chrome addon you can call functions in other
 * parts of the addon directly, since the FF addon isn't set up this way, it's
 * better to just use the same standard interface: message passing. This is more
 * "correct" anyway (just ask the erlang guys, they'll tell you).
 *
 * Note that because in many instances this object is used globally (ie, one
 * Comm for the entire background page), it has a feature Firefox (which uses
 * ports for each panel/tab/etc) lacks which is "contexts." I can bind a
 * callback to an object (a tab, a string, whatever) and later on I can clear
 * all bindings attached to that context with one function call (vs trying to
 * clear out all the bindings by hand).
 */
var Comm	=	(function() {
	// holds all event <--> callback bindings
	var bindings	=	{};

	// matches contexts with binding pairs
	var contexts	=	{};

	/**
	 * Bind a callback (function) to an event (string). Optionally allows
	 * binding event/cb pairs to a context object, which allows all bindings
	 * under that context to be cleared at once via Comm.unbind_context()
	 */
	var bind	=	function(event, cb, context)
	{
		context || (context = false);

		// init the bindings for this event, if needed
		if(!bindings[event]) bindings[event] = [];

		// if we have a context, set the event/cb pair into it
		if(context)
		{
			if(!contexts[context]) contexts[context] = [];
			contexts[context].push([event, cb]);
		}

		// try to prevent double-bindings
		if(bindings[event].indexOf(cb) >= 0) return true;

		// binding doesn't exist! create it
		bindings[event].push(cb);
	};

	/**
	 * Clean context entries of the given event and (optional) cb.
	 */
	var clean_contexts	=	function(event, cb)
	{
		Object.each(contexts, function(bindings, context) {
			bindings	=	bindings.filter(function(binding) {
				var bind_event	=	binding[0];
				var bind_cb		=	binding[1];
				if(bind_event == event && !cb) return false;
				if(bind_event == event && bind_cb == cb) return false;
				return true;
			});
			contexts[context]	=	bindings;
		});
	};

	/**
	 * Unbind an event/callback pair. If callback isn't given, all events of
	 * type `event` are unbound. If event *and* allback aren't passed then
	 * unbind all bindings (empty slate).
	 */
	var unbind	=	function(event, cb)
	{
		// if event is blank, unbind everything
		if(!event)
		{
			bindings	=	{};
			contexts	=	{};
			return true;
		}

		// if callback is blank, unbind all of the given event's bindings
		if(!cb)
		{
			if(bindings[event]) delete bindings[event];
			clean_contexts(event);
			return true;
		}

		// remove the event/callback pair (if found)
		if(bindings[event])
		{
			var idx	=	bindings[event].indexOf(cb);
			if(idx < 0) return false;

			bindings[event].splice(idx, 1);
			if(bindings[event].length == 0) delete bindings[event];
			clean_contexts(event, cb);
			return true;
		}

		return false;
	};

	/**
	 * Unbind all bindings associated with the given context
	 */
	unbind_context	=	function(context)
	{
		var bindings	=	contexts[context];
		if(!bindings) return false;

		Array.clone(bindings).each(function(binding) {
			var bind_event	=	binding[0];
			var bind_cb		=	binding[1];
			unbind(bind_event, bind_cb);
		});
		return true;
	};

	/**
	 * Trigger an event (asynchronously), passing all the given arguments (sans
	 * even name) to the callbacks bound to that event type.
	 */
	var trigger	=	function(event, _args)
	{
		// clone the actuments, pop off the event name
		var args = Array.prototype.slice.call(arguments, 0)
		args.shift();

		// send an event ALWAYS triggered on any trigger event
		if(event != 'all') trigger('all', event, args);

		var callbacks	=	bindings[event]
		if(!callbacks || callbacks.length == 0) return true;

		// clone the callbacks (so if they change while firing we don't get
		// weird loop corruptions)
		callbacks	=	callbacks.slice(0);

		// remember, triggers are async
		(function() {
			for(var i = 0, n = callbacks.length; i < n; i++)
			{
				var cb	=	callbacks[i];
				cb.apply(this, args);
			}
		}).delay(0, this);

		return true;
	};

	var num_bindings	=	function()
	{
		var num_bindings	=	0;
		Object.each(bindings, function(callbacks, event) {
			num_bindings	+=	callbacks.length;
		});
		return num_bindings;
	};

	this.bind			=	bind;
	this.unbind			=	unbind;
	this.unbind_context	=	unbind_context;
	this.trigger		=	trigger;
	this.num_bindings	=	num_bindings;
	this._bindings		=	function() { return bindings; };
	this._context		=	function() { return contexts; };
});

