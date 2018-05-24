const Store = require('electron-store');
const Popup = require('./popup');
const {tcrypt} = require('./tcrypt');
const sjcl = require('./sjcl');
const store = new Store({
	name: 'you-meddling-kids',
	encryptionKey: new Uint8Array([253, 226, 215, 237, 169, 131, 73, 33, 250, 40, 177, 57, 144, 114, 167, 51, 93, 49, 141, 32, 103, 56, 79, 255, 202, 134, 223, 49, 101, 35, 37, 229]),
});

exports.start = function() {
	var keys = exports.get_keys({binary: false});
	if(!keys) {
		var keys = tcrypt.asym_old.generate_ecc_keys();
		keys = {
			public: tcrypt.key_to_string(keys.public),
			private: tcrypt.key_to_string(keys.private)
		};
		store.set('pairing-keys', JSON.stringify(keys));
	}

	var pubkey_asc = sjcl.codec.hex.fromBits(sjcl.codec.base64.toBits(keys.public));
	Popup.open('Pair with browser', 'pair', {public_key: pubkey_asc}, {
		skip_focus: true,
		height: 300,
	});
};

exports.get_keys = function(options) {
	options || (options = {});
	var keys = store.get('pairing-keys', false);
	try {
		if(keys) keys = JSON.parse(keys);
	} catch(e) {
		return false;
	}
	if(keys && options.binary) {
		keys.public = tcrypt.from_base64(keys.public);
		keys.private = tcrypt.from_base64(keys.private);
	}
	return keys;
};

exports.have_keys = function() {
	return !!exports.get_keys();
};

