/**
 * This file controls opening a very limited webserver. Currently, its purpose
 * is to listen to "hey, there's an invite here with your name on it" requests
 * from the turtl.it website, but it could be expanded later on to allow
 * communication, for instance, between the extensions and the desktop app.
 * We'll keep it simple for now though.
 */

(function(global) {
	var http	=	require('http');
	var url		=	require('url');

	global.Dispatch	=	new Class({
		Implements: [Options],

		options: {
			port: 7471
		},

		server: null,

		initialize: function(options)
		{
			this.setOptions(options);
		},

		start: function(options)
		{
			options || (options = {});

			this.server	=	http.createServer(function(req, res) {
				this.dispatch(req, res);
			}.bind(this)).listen(this.options.port);
			if(options.timeout)
			{
				(function() {
					this.stop();
				}.bind(this)).delay(options.timeout);
			}
		},

		stop: function()
		{
			if(!this.server) return;
			this.server.close();
			this.server	=	null;
		},

		dispatch: function(req, res)
		{
			var parsed	=	url.parse(req.url, true);
			var qs		=	parsed.query;
			var success	=	function(ret)
			{
				res.writeHead(200, {'Content-Type': 'text/javascript'});
				res.end(qs.callback + '('+JSON.encode(ret)+');');
			};
			var error	=	function(ret)
			{
				res.writeHead(500, {'Content-Type': 'text/javascript'});
				res.end(qs.callback + '('+JSON.encode(ret)+');');
			};

			if(parsed.pathname.match(/\/invite/))
			{
				var invite	=	JSON.parse(qs.invite);
				if(!invite) return error('bad invite');
				invites.process_invite(invite.code, invite.id, invite.key, {
					success: function() {
						success(true);
					},
					error: function() {
						error('bad invite');
					}
				});
			}
		}
	});
})(window);
