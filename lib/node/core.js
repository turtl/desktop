const ref = require('ref-napi');
const ffi = require('ffi-napi');
const path = require('path');

var load_error = null;
try {
	const dll_loc = path.join(__dirname, '..', '..', 'build', 'turtl_core');
	var TurtlCore = ffi.Library(dll_loc, {
		'turtlc_start': ['int32', ['string', 'uint8']],
		'turtlc_send': ['int32', ['pointer', 'size_t']],
		'turtlc_recv': ['pointer', ['uint8', 'string', 'size_t*']],
		'turtlc_recv_event': ['pointer', ['uint8', 'size_t*']],
		'turtlc_free': ['int32', ['pointer', 'size_t']],
	});
} catch(err) {
	load_error = err;
}

exports.get_load_error = function() {
	return load_error;
};

exports.init = function(userconfig) {
	userconfig || (userconfig = {});
	var config = {
		data_folder: path.join(AppComm.config.userdata, 'core'),
	};
	Object.assign(config, userconfig);
	if(!config.api) config.api = {};
	config.api.client_version_string = AppComm.config.client+'/'+AppComm.config.app_version;
	config.api.proxy = AppComm.config.proxy;
	config.openssl_cert_file = path.join(__dirname, '..', '..', 'scripts', 'resources', 'cacert.pem');;
	process.env['TURTL_CONFIG_FILE'] = path.join(__dirname, '..', '..', 'build', 'config.yaml');
	return TurtlCore.turtlc_start(JSON.stringify(config), 1);
};

exports.recv = function(options) {
	options || (options = {});
	var non_block = options.block ? 0 : 1;

	var lenref = ref.alloc('size_t');
	var recv = TurtlCore.turtlc_recv(non_block, null, lenref);
	if(recv.isNull()) return false;
	var len = lenref.deref();
	var data = ref.reinterpret(recv, len);
	var msg = new Buffer(data).toString('utf8');
	return msg;
};

exports.recv_event = function(options) {
	options || (options = {});
	var non_block = options.block ? 0 : 1;

	var lenref = ref.alloc('size_t');
	var recv = TurtlCore.turtlc_recv_event(non_block, lenref);
	if(recv.isNull()) return false;
	var len = lenref.deref();
	var data = ref.reinterpret(recv, len, 0);
	var msg = new Buffer(data).toString('utf8');
	return msg;
};

exports.send = function(msg) {
	var buf = Buffer.from(msg, 'utf8')
	return TurtlCore.turtlc_send(buf, buf.length);
};

