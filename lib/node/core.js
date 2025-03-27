const koffi = require('koffi');
const path = require('node:path');
const fs = require('node:fs');

var load_error = null;
var TurtlCore = null;
try {
	const lib_loc = path.join(__dirname, '..', '..', 'build', 'turtl_core');
    const lib_loc_suffix = (() => {
        for(const suffix of ['so', 'dll', 'dylib']) {
            try {
                const file = `${lib_loc}.${suffix}`;
                fs.statSync(file);
                return file;
            } catch(_) {}
        }
        return lib_loc;
    })();
    const lib = koffi.load(lib_loc_suffix);
    const spec = {
		'turtlc_start': ['int32', ['string', 'uint8']],
		'turtlc_send': ['int32', ['uint8_t*', 'size_t']],
		'turtlc_recv': ['uint8_t*', ['uint8', 'string', 'size_t*']],
		'turtlc_recv_event': ['uint8_t*', ['uint8', 'size_t*']],
		'turtlc_free': ['int32', ['uint8_t*', 'size_t']],
    };
    TurtlCore = Object.keys(spec).reduce((acc, fn) => {
        const [ret, params] = spec[fn];
        acc[fn] = lib.func(fn, ret, params);
        return acc;
    }, {});
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

    const lenref = koffi.alloc('size_t', 1);
	const recv = TurtlCore.turtlc_recv(non_block, null, lenref);
    if(recv === null) return false;
    const len = koffi.decode(lenref, 'size_t');
    const data = koffi.decode(recv, `char[${len}]`);
	const msg = new Buffer(data).toString('utf8');
	return msg;
};

exports.recv_event = function(options) {
	options || (options = {});
	var non_block = options.block ? 0 : 1;

    const lenref = koffi.alloc('size_t', 1);
	const recv = TurtlCore.turtlc_recv_event(non_block, lenref);
    if(recv === null) return false;
    const len = koffi.decode(lenref, 'size_t');
    const data = koffi.decode(recv, `char[${len}]`);
	const msg = new Buffer(data).toString('utf8');
	return msg;
};

exports.send = function(msg) {
	var buf = Buffer.from(msg, 'utf8')
	return TurtlCore.turtlc_send(buf, buf.length);
};

