/**
 * This file controls opening a very limited webserver. Currently, its purpose
 * is to listen to "hey, there's an invite here with your name on it" requests
 * from the turtl.it website, but it could be expanded later on to allow
 * communication, for instance, between the extensions and the desktop app.
 * We'll keep it simple for now though.
 */

(function(global) {
	var http = require('http');
	var fs = require('fs');
	var url = require('url');

	// actions that do not need pairing to work
	var public_actions = ['invite', 'invitecode', 'promo', 'pair'];

	global.Dispatch = new Class({
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

			this.server = http.createServer(function(req, res) {
				this.dispatch(req, res);
			}.bind(this));

			this.server.listen(this.options.port).on('error', function(e) {
				log.error('dispatch: error binding port ('+this.options.port+'): ', e);
			}.bind(this));

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
			this.server = null;
		},

		dispatch: function(req, res)
		{
			var parsed = url.parse(req.url, true);
			var qs = parsed.query;
			var sent = false;
			var send_response = function(ret)
			{
				if(sent) return false;

				log.debug('dispatch: send: ', ret);
				if(qs.callback)
				{
					res.end(qs.callback + '('+ret+');');
				}
				else
				{
					res.end(ret);
				}
				sent = true;
			};

			var success = function(ret)
			{
				res.writeHead(200, {'Content-Type': 'text/javascript'});
				send_response(JSON.stringify(ret));
			};
			var error = function(ret, options)
			{
				options || (options = {});
				var code = options.code ? options.code : 500;
				res.writeHead(200, {'Content-Type': 'text/javascript'});
				send_response(JSON.stringify({code: code, error: ret}));
			};

			var needs_pairing = function()
			{
				// check if we have a pairing key already
				if(Pairing.have_keys()) return false;

				error('needs pairing', {code: 401});
			};

			(function() {
				if(!sent) error('Timeout.');
			}).delay(5000, this);

			var cmd = parsed.pathname.replace(/^\/|\/$/, '');

			// check if we need pairing. if so, the needs_pairing fn will let
			// the client know, and we just return here.
			var data = null;
			if(public_actions.indexOf(cmd) < 0)
			{
				if(needs_pairing()) return false;

				// we're not pairing/inviting and we don't need to pair, so
				// decrypt our main data
				var data = qs.data;
				var keys = Pairing.get_keys({binary: true});
				var deckey = keys.private;
				try
				{
					data = tcrypt.from_base64(data);
					data = tcrypt.asym_old.decrypt(deckey, data);
					data = JSON.parse(data);
				}
				catch(e)
				{
					log.error('dispatch: malformed data: ', data, e);
					return error('bad data');
				}
			}

			log.debug('dispatch: cmd: ', cmd, data);

			switch(cmd)
			{
			// receive an invite from the turtl website
			case 'invite':
				var invite = JSON.parse(qs.invite);
				if(!invite) return error('bad invite');
				invites.process_invite(invite.code, invite.id, invite.key, {
					success: function() {
						success(true);
					},
					error: function() {
						error('bad invite');
					}
				});
				break;

			case 'invitecode':
				var invite_code = qs.code;
				if(!invite_code || invite_code == '') return error('bad invite code');
				// store for later (we'll send this over when the user joins)
				localStorage['invited_by'] = invite_code;
				success(true);
				break;

			case 'promo':
				var promo_code = qs.code;
				if(!promo_code || promo_code == '') return error('bad promo code');
				// store for later (we'll send this over when the user joins)
				localStorage['promo'] = promo_code;
				success(true);
				break;

			case 'pair':
				Pairing.start();
				success(true);
				break;

			// bookmark a page from the extension
			case 'bookmark':
				if(!data || !data.type) return error('bad bookmark data (missing `type` field)');

				Popup.open({dispatch: 'bookmark', linkdata: data});
				success(true);
				break;

			// mainly used for testing successful pairing
			case 'ping':
				success({pong: data});
				if(Popup.last_dispatch == 'pair') Popup.close();
				break;

			// no deal.
			default:
				error('bad command: '+ cmd);
				break;
			}
		}
	});
})(window);
