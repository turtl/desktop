const http = require('http');
const fs = require('fs');
const url = require('url');
const Popup = require('./popup');
const Pairing = require('./pairing');
const {tcrypt} = require('./tcrypt');

const public_actions = ['pair'];

// fake logger. sad!
const log = {
	debug: console.log.bind(console),
	info: console.log.bind(console),
	error: console.error.bind(console),
};

function dispatch(req, res) {
	var parsed = url.parse(req.url, true);
	var qs = parsed.query;
	var sent = false;
	var send_response = function(ret) {
		if(sent) return false;
		log.debug('dispatch: send: ', ret);
		if(qs.callback) {
			res.end(qs.callback + '('+ret+');');
		} else {
			res.end(ret);
		}
		sent = true;
	};

	var success = function(ret) {
		res.writeHead(200, {'Content-Type': 'text/javascript'});
		send_response(JSON.stringify(ret));
	};
	var error = function(ret, options) {
		options || (options = {});
		var code = options.code ? options.code : 500;
		res.writeHead(200, {'Content-Type': 'text/javascript'});
		send_response(JSON.stringify({code: code, error: ret}));
	};

	var needs_pairing = function() {
		// check if we have a pairing key already
		if(Pairing.have_keys()) return false;
		error('needs pairing', {code: 401});
	};

	setTimeout(function() {
		if(!sent) error('Timeout.');
	}, 5000);

	var cmd = parsed.pathname.replace(/^\/|\/$/, '');

	// check if we need pairing. if so, the needs_pairing fn will let
	// the client know, and we just return here.
	var data = null;
	if(public_actions.indexOf(cmd) < 0) {
		if(needs_pairing()) return false;

		var data = qs.data;
		var keys = Pairing.get_keys({binary: true});
		var deckey = keys.private;
		try {
			data = tcrypt.from_base64(data);
			data = tcrypt.asym_old.decrypt(deckey, data);
			data = JSON.parse(data);
		} catch(e) {
			log.error('dispatch: malformed data: ', data, e);
			return error('bad data');
		}
	}

	switch(cmd) {
		// receive an invite from the turtl website
		case 'pair':
			Pairing.start();
			success(true);
			break;

		// bookmark a page from the extension
		case 'bookmark':
			if(!data || !data.type) return error('bad bookmark data (missing `type` field)');
			Popup.open('New bookmark', 'bookmarker', data, {
				height: 500
			});
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

var server = null;

exports.start = function(options) {
	options || (options = {});
	var port = options.dispatch_port || 7471;

	if(server) return;

	server = http.createServer(function(req, res) {
		dispatch(req, res);
	}.bind(this));
	server.listen(port).on('error', function(e) {
		log.error('dispatch: error binding port ('+port+'): ', e);
	}.bind(this));
};

exports.stop = function() {
	if(!server) return;
	server.close();
	server = null;
};

