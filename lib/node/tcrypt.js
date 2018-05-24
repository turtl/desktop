"use strict";

const sjcl = require('./sjcl');

// define error(s) used by tcrypt
var extend_error = function(extend, errname)
{
	var err = function() {
		var tmp = extend.apply(this, arguments);
		tmp.name = this.name = errname;

		this.stack = tmp.stack
		this.message = tmp.message

		return this;
	};
	err.prototype = Object.create(extend.prototype, { constructor: { value: err } });
	return err;
}
var TcryptError = extend_error(Error, 'TcryptError');
var TcryptAuthFailed = extend_error(TcryptError, 'TcryptAuthFailed');
var TcryptBadBrowser = extend_error(TcryptError, 'TcryptBadBrowser');

exports.TcryptError = TcryptError;
exports.TcryptAuthFailed = TcryptAuthFailed;
exports.TcryptBadBrowser = TcryptBadBrowser;

var tcrypt = {
	// -------------------------------------------------------------------------
	// NOTE: never inject items into these lists. only append them!!!!
	// NOTE: these lists can only support 256 items each!!!!
	// -------------------------------------------------------------------------
	cipher_index: [
		'AES'
	],
	block_index: [
		'CBC',
		'GCM'
	],
	padding_index: [
		'AnsiX923',
		'PKCS7'
	],
	// this list holds items used by tcrypt.derive_keys to turn a master key
	// (which is the main key passed into tcrypt.ecrypt/decrypt) into two keys:
	// a key for encryption/decryption, and a key for HMAC verification.
	//
	// Format:
	//   [hasher, iterations, length]
	kdf_index: [
		['SHA256', 2, 64]
	],
	// -------------------------------------------------------------------------

	current_version: 5,		// current serialization version

	// serialization options (array index values for the tcrypt.*_index arrays)
	default_cipher: 0,
	default_block: 1,
	default_padding: 1,
	default_kdf_mode: 0,	// corresponds to tcrypt.kdf_index

	// define some getters.
	get_cipher: function(ciphername) { return sjcl.cipher[ciphername.toLowerCase()]; },
	get_block_mode: function(blockmode) { return sjcl.mode[blockmode.toLowerCase()]; },
	get_padding: function(padding) { return ''; },	// now unused
	get_hasher: function(hasher) { return sjcl.hash[hasher.toLowerCase()]; },

	/**
	 * This is the original Turtl encryption format
	 *
	 *   [payload (base64)]:i[initial vector]
	 *
	 * It was stupid because it forced things to be in base64, which increases
	 * size by 2-3x. Binary storage was not an option.
	 */
	old_formatter: {
		stringify: function (cipherParams)
		{
			// create json object with ciphertext
			var crypto = btoa(cipherParams.ciphertext);

			// optionally add iv
			if(cipherParams.iv) crypto += ':i' + sjcl.codec.hex.fromBits(tcrypt.bin_to_words(cipherParams.iv));

			// stringify json object
			return crypto;
		},

		parse: function(crypto)
		{
			// parse json string
			var parts = crypto.split(/:/g);
			var params = {
				ciphertext: sjcl.codec.base64.toBits(parts[0]),
				cipher: 'AES',
				block_mode: 'CBC',
				padding: 'AnsiX923'
			}
			parts.shift();
			parts.forEach(function(p) {
				if(p.match(/^i/)) params.iv = sjcl.codec.hex.toBits(p.slice(1));
			});
			return params;
		}
	},

	/**
	 * Given a serialization version and a payload description *string*, pull
	 * out any pertinant information (cipher, block mode, padding, etc).
	 */
	decode_payload_description: function(version, desc_str)
	{
		if(typeof(desc_str) != 'string') desc_str = tcrypt.words_to_bin(desc_str);

		if(version >= 1)
		{
			var cipher_index = desc_str.charCodeAt(0);
			var block_index = desc_str.charCodeAt(1);
			if(version <= 4)
			{
				var kdf_mode = desc_str.charCodeAt(3);
				var padding_index = desc_str.charCodeAt(2);
			}
		}

		var ret = {
			cipher: tcrypt.cipher_index[cipher_index],
			block_mode: tcrypt.block_index[block_index],
		};
		if(typeof(kdf_mode) != 'undefined') ret.kdf_mode = kdf_mode;
		if(typeof(padding_index) != 'undefined') ret.padding = padding_index;

		return ret;
	},

	/**
	 * Given a serialization version and a set of information about how a
	 * payload is serialized, return a payload description string
	 */
	encode_payload_description: function(version, options)
	{
		if(!options || !options.cipher || !options.block_mode)
		{
			throw new TcryptError('tcrypt.encode_payload_description: must provide cipher, block_mode in options');
		}

		if(version >= 1)
		{
			var cipher = tcrypt.cipher_index.indexOf(options.cipher);
			var block_mode = tcrypt.block_index.indexOf(options.block_mode);
			var desc = String.fromCharCode(cipher) +
								String.fromCharCode(block_mode);
			if(version <= 4)
			{
				var padding = tcrypt.padding_index.indexOf(options.padding);
				desc	+=	String.fromCharCode(padding);
				desc	+=	String.fromCharCode(options.kdf_mode);
			}
		}

		return desc;
	},

	/**
	 * Authenticate a crypto payload via HMAC
	 *
	 * NOTE: this is now vestigial...it is only used for decryption data from
	 * version 4 and below because as of version 5, all encrption/decryption is
	 * done with authenticated block modes (GCM, CCM, ...) so key derivation
	 * from a master key and manually HMACing our data isn't needed.
	 */
	authenticate_payload: function(passphrase, version, payload_description, iv, ciphertext)
	{
		payload_description = tcrypt.words_to_bin(payload_description);
		var payload = version 
			+ payload_description.length
			+ payload_description
			+ tcrypt.words_to_bin(iv)
			+ tcrypt.words_to_bin(ciphertext);
		var hmac = new sjcl.misc.hmac(passphrase, tcrypt.get_hasher('SHA256'));
		var hash = tcrypt.words_to_bin(hmac.mac(tcrypt.bin_to_words(payload)));
		return hash;
	},

	/**
	 * Given a master key and a set of options, derive two sub-keys: one for
	 * encryption/decryption and one for HMAC generation.
	 *
	 * NOTE: this is now vestigial...it is only used for decryption data from
	 * version 4 and below because as of version 5, all encrption/decryption is
	 * done with authenticated block modes (GCM, CCM, ...) so key derivation
	 * from a master key and manually HMACing our data isn't needed.
	 */
	derive_keys: function(master_key, options)
	{
		options || (options = {});

		var hasher = options.hasher || tcrypt.get_hasher('SHA1');
		var iterations = options.iterations || 50;
		var key_size = options.key_size || 64;

		var master_bin = tcrypt.words_to_bin(master_key);
		var both_keys = tcrypt.key(master_bin, null, {
			hasher: hasher,
			iterations: iterations,
			key_size: key_size
		});

		// split the resulting key down the middle, first half is crypto key,
		// second half is hmac key
		var enc_key = sjcl.bitArray.bitSlice(both_keys, 0, 256);
		var hmac_key = sjcl.bitArray.bitSlice(both_keys, 256);

		return {crypto: enc_key, hmac: hmac_key};
	},

	/**
	 * Turtl encryption serialization format is as follows:
	 *
	 *   |-2 bytes-| |-1 byte----| |-N bytes-----------| |-16 bytes-| |-N bytes----|
	 *   | version | |desc length| |payload description| |    IV    | |payload data|
	 *
	 * - version tells us the serialization version. although it will probably
	 *   not get over 255, it has two bytes just in case. never say never.
	 * - desc length is the length of the payload description, which may change
	 *   in length from version to version.
	 * - payload description tells us what algorithm/format the encryption uses.
	 *   for instance, it could be AES+CBC, or Twofish+CBC, etc etc. payload
	 *   description encoding/length may change from version to version.
	 * - IV is the initial vector of the payload, in binary form
	 * - payload data is our actual data, encrypted.
	 */
	deserialize: function(enc, options)
	{
		options || (options = {});

		var is_str = typeof(enc) == 'string';
		var get_bytes = function(data, idx, length)
		{
			var sliceargs = length ? [data, idx * 8, (idx * 8) + (length * 8)] : [data, idx * 8];
			return is_str ? tcrypt.bin_to_words(data.substr(idx, length)) : sjcl.bitArray.bitSlice.apply(this, sliceargs);
		};
		var get_byte = function(data, idx)
		{
			return is_str ? data.charCodeAt(idx) : sjcl.bitArray.extract(data, idx * 8, 8); 
		}

		// define an index we increment to keep track of deserialization
		var idx = 0;

		// if the first character is not 0, either Turtl has come a really long
		// way (and had over 255 serialization versions) or we're at the very
		// first version, which just uses Base64.
		var version = (get_byte(enc, idx) << 8) + get_byte(enc, idx + 1);
		idx	+=	2;

		// TODO: if we ever get above 1000 versions, change this. The lowest
		// allowable Base64 message is '++', which translates to 11,051 but for
		// now we'll play it safe and cap at 1K
		if(version > 1000)
		{
			return Object.merge(tcrypt.old_formatter.parse(enc), {
				version: 0,
				hmac: null,
			});
		}

		// NOTE: we only HMAC for versions <= 4 because 5 and above uses only
		// authenticated block modes
		if(version <= 4)
		{
			// grab HMAC for auth
			var hmac = get_bytes(enc, idx, 32);
			idx	+=	32;

			// allow returning JUST the HMAC hash. can be very useful.
			if(options.hmac_only) return hmac;
		}

		// grab the payload description and decode it
		var desc_length = get_byte(enc, idx);
		var desc_str = get_bytes(enc, idx+1, desc_length);
		idx	+=	desc_length + 1;

		// grab the IV
		var iv = get_bytes(enc, idx, 16);
		idx	+=	16;

		if(options.raw) return get_bytes(enc, 0, idx);

		// finally, the encrypted data
		var ciphertext = get_bytes(enc, idx);

		var params = {
			version: version,
			desc: desc_str,
			iv: iv,
			ciphertext: ciphertext
		};
		if(typeof(hmac) != 'undefined')
		{
			params.hmac = hmac;
		}
		return params;
	},

	/**
	 * Serialize our encrypted data into the standard format (see the comments
	 * above the deserialize method).
	 *
	 * `enc` is our *encrypted* ciphertext, options contains information
	 * explaining how enc was created (iv, cipher, block mode, padding, etc).
	 */
	serialize: function(enc, options)
	{
		options || (options = {});

		var version = options.version;

		// support serializing the old version if needed (auth, for example)
		if(version === 0)
		{
			return tcrypt.old_formatter.stringify({
				ciphertext: enc,
				iv: options.iv
			});
		}

		// create initial string, with two version bytes
		var serialized = String.fromCharCode(version >> 8) + String.fromCharCode(version & 255);

		// NOTE: we only HMAC for versions <= 4 because 5 and above uses only
		// authenticated block modes
		if(version <= 4)
		{
			serialized		+=	options.hmac;
		}

		// create/append our description length and description
		serialized		+=	String.fromCharCode(options.desc.length)
		serialized		+=	options.desc;

		// append the IV
		serialized		+=	options.iv;

		// last but definitely not least, the actual crypto data
		serialized		+=	enc;

		return serialized;
	},

	/**
	 * Encrypt data with key.
	 *
	 * `options` allows specifying of cipher ('AES'/'Twofish'), block mode
	 * ('CBC', 'CFB'), padding mode ('AnsiX923'/'PKCS7'), and serialization
	 * version (defaults to tcrypt.current_version).
	 *
	 * Note that unless using version === 0 (the original serialization version,
	 * still used in some places for backwards compatibility), the given `key`
	 * is used to derive two other keys (and is otherwise not used directly): a
	 * crypto key (used to encrypt the data) and an HMAC key used to protect the
	 * ciphertext against tampering.
	 *
	 * This function returns a binary string of the serialized encrypted data.
	 * All information needed to decrypt the string is encoded in the string.
	 * See tcrypt.deserialize for more information.
	 */
	encrypt: function(key, data, options)
	{
		options || (options = {});

		// because of some errors in judgement, in some cases keys were UTF8
		// encoded early-on. this should remain here until all keys for all data
		// for all users are not UTF8 encoded...so, forever probably.
		if(sjcl.bitArray.bitLength(key) / 8 > 32)
		{
			key = tcrypt.bin_to_words(sjcl.codec.utf8String.fromBits(key));
		}

		// if we didn't specify cipher, block_mode, or padding in the options,
		// use the tcrypt defaults.
		var cipher = options.cipher || tcrypt.cipher_index[tcrypt.default_cipher];
		var block_mode = options.block_mode || tcrypt.block_index[tcrypt.default_block];
		if(['gcm', 'ccm'].indexOf(block_mode.toLowerCase()) < 0)
		{
			throw new TcryptError('Bad mode: '+ block_mode +' (only authenticated modes allowed: gcm, ccm)');
		}

		// force latest version. only decryption needs to support old versions.
		var version = options.version;
		if(version !== 0 || (version > 0 && version <= 4)) version = tcrypt.current_version;

		var block_class = tcrypt.get_block_mode(block_mode);
		var iv = options.iv || tcrypt.iv();

		if(version === 0)
		{
			var cipher = new sjcl.cipher.aes(key);
			var ciphertext = sjcl.mode.cbc.encrypt(
				cipher,
				sjcl.codec.utf8String.toBits(data),
				iv,
				null,
				{ascii: true}	// added this in for backwards compat
			);
			var enc = tcrypt.words_to_bin(ciphertext);
			var formatted = tcrypt.serialize(enc, {
				version: version,
				iv: tcrypt.words_to_bin(iv)
			});
			return formatted;
		}

		var utf8_random = options.utf8_random || tcrypt.random_number();
		if(typeof data == 'string')
		{
			// utf8 encoding section. up til version 4, all encrypted strings were
			// utf8 encoded. this is the easy option, but sometimes doubles the size
			// of the ciphertext for binary data. not cool.
			//
			// version 4 and up, we detect if the string has utf8 bytes *before*
			// blindly encoding. we also prepend a byte to the beginning of the data
			// that lets us know whether or not we encoded the data. it would be a
			// giveaway to just use 0 or 1, so instead we pick a random byte. if the
			// data is not utf8 encoded, the byte is between 0 and 127, if it is
			// encoded, it's betwene 128 and 255. this lets us detect the encoding
			// on decrypt without leaking any information in the ciphertext.
			//
			// NOTE: the first byte currently contains one useful bit and seven
			// random bits. these random bits could be used to describe the pre-
			// encrypted payload in other ways. for now, just the first bit is used.
			if(tcrypt.is_utf8(data))
			{
				var utf8byte = String.fromCharCode(Math.floor(utf8_random * (256 - 128)) + 128);
				data = utf8byte + tcrypt.utf8_encode(data);
			}
			else
			{
				var utf8byte = String.fromCharCode(Math.floor(utf8_random * (256 - 128)));
				data = utf8byte + data;
			}
		}
		else
		{
			var utf8byte = String.fromCharCode(Math.floor(utf8_random * (256 - 128)));
			data = sjcl.bitArray.concat([sjcl.bitArray.partial(8, utf8byte)], data);
		}

		// generate serialized description
		var desc = tcrypt.encode_payload_description(version, {
			cipher: cipher,
			block_mode: block_mode
		});

		// serialize our ciphertext along with all the options used to create it
		// into the serialization format. note that we set the ciphertext to ''
		// because we're going to manually append it after encryption. this way
		// we can use the serialized description data as part of the auth data
		// so it can't be tampered with.
		var formatted = tcrypt.serialize('', {
			version: version,
			desc: desc,
			iv: tcrypt.words_to_bin(iv)
		});
		// convert to word array
		formatted = tcrypt.bin_to_words(formatted);

		// our message auth data is every part of our message other than the
		// ciphertext (version, desc, desc length, iv, etc).
		var auth = formatted;
		var cipherclass = tcrypt.get_cipher(cipher);
		var cipher = new cipherclass(key);
		var ciphertext = block_class.encrypt(
			cipher,
			typeof data == 'string' ? tcrypt.bin_to_words(data) : data,
			iv,
			auth,
			128
		);

		// TODO: investigate performance tweaks here? doing a concat (depending
		// on the bit length) may require shifting the *entire* ciphertext words
		// over, which on a large file could be pretty expensive.
		var words = sjcl.bitArray.concat(formatted, ciphertext);
		if(options.uint_array) return new Uint8Array(sjcl.codec.bytes.fromBits(words));
		return words;
	},

	/**
	 * Decrypt data with key.
	 *
	 * The given `encrypted` data is first deserialized from Turtl's standard
	 * format, which gives us serialization version, HMAC authentication hash,
	 * ciphertext description (which includes the algorithm, padding mode, block
	 * mode, and key derivation method), and the actual ciphertext.
	 *
	 * We then create a decryption key and an HMAC key (based on the "master"
	 * key passed in) using the key derivation method in the description.
	 *
	 * The HMAC included in the payload is then checked against the HMAC we get
	 * from hashing the version, description, iv, and ciphertext with the HMAC
	 * password we got from the master key.
	 *
	 * If the hashes match, great, decrypt the ciphertext and return the result.
	 * If the hashes do not match, an exception is thrown, blocking decryption.
	 *
	 * Note that all of the above deserialization/authentication is skipped if
	 * the payload has a version === 0 (Turtl's old serialization format), in
	 * which case the data is just decrypted without question.
	 */
	decrypt: function(key, encrypted, options)
	{
		options || (options = {});

		// because of some errors in judgement, in some cases keys were UTF8
		// encoded early-on. this should remain here until all keys for all data
		// for all users are not UTF8 encoded...so, forever probably.
		if(sjcl.bitArray.bitLength(key) / 8 > 32)
		{
			key = tcrypt.bin_to_words(sjcl.codec.utf8String.fromBits(key));
		}

		// handle byte arrays
		if(encrypted instanceof Uint8Array)
		{
			encrypted = sjcl.codec.bytes.toBits(encrypted);
		}

		// split a serialized crypto message into a set of params and options,
		// including what cipher we used to encrypt it, block mode, padding, iv,
		// ciphertext (obvis).
		var params = tcrypt.deserialize(encrypted);
		var version = params.version;

		if(version === 0)
		{
			var desc = {
				cipher: 'aes',
				block_mode: 'cbc'
			};
		}
		else
		{
			var desc = tcrypt.decode_payload_description(params.version, params.desc);
		}

		var block_mode = this.get_block_mode(desc.block_mode);
		var iv = params.iv;
		var cipherclass = tcrypt.get_cipher(desc.cipher);

		if(version <= 4)
		{
			if(version === 0)
			{
				// we're deserializing/decrypting an old-version message. use the
				// values passed to us by tcrypt.old_formatter.parse to form a
				// description object. note in this case, we skip HMAC generation
				// and authentication, and use the master key as the crypto key.
				var crypto_key = key;
				var hmac_key = null;
			}
			else
			{
				// generate an encryption key and an authentication key from the
				// master key `key`.
				var kdf_entry = tcrypt.kdf_index[desc.kdf_mode];
				var keys = tcrypt.derive_keys(key, {
					hasher: tcrypt.get_hasher(kdf_entry[0]),
					iterations: kdf_entry[1],
					key_size: kdf_entry[2]
				});
				var crypto_key = keys.crypto;
				var hmac_key = keys.hmac;
			}

			if(params.version !== 0)
			{
				// build/authenticate HMAC
				var hmac = tcrypt.words_to_bin(params.hmac);
				if(hmac && hmac_key)
				{
					if(hmac !== tcrypt.authenticate_payload(hmac_key, version, params.desc, params.iv, params.ciphertext))
					{
						throw new TcryptAuthFailed('Authentication error. This data has been tampered with (or the key is incorrect).');
					}
				}
			}

			var cipher = new cipherclass(crypto_key);
			var decrypted = block_mode.decrypt(
				cipher,
				params.ciphertext,
				iv
			);
		}
		else if(version >= 5)
		{
			// our message auth data is every part of our message other than the
			// ciphertext (version, desc, desc length, iv, etc).
			var auth = tcrypt.deserialize(encrypted, {raw: true});
			var crypto_key = key;
			var cipher = new cipherclass(crypto_key);
			try
			{
				var decrypted = block_mode.decrypt(
					cipher,
					params.ciphertext,
					iv,
					auth,
					128
				);
			}
			catch(e)
			{
				if(e instanceof sjcl.exception.corrupt)
				{
					throw new TcryptAuthFailed('Authentication error. This data has been tampered with (or the key is incorrect).');
				}
				else
				{
					throw e;
				}
			}
		}

		// detect our UTF8 encoding
		if(version >= 4)
		{
			var utf8byte = (decrypted[0] >> 24) & 255;
			var is_utf8 = utf8byte >= 128;
			decrypted = sjcl.bitArray.bitSlice(decrypted, 8);
		}
		else
		{
			var is_utf8 = true;
		}

		if(options.raw) return decrypted;
		if(options.uint_array) return new Uint8Array(sjcl.codec.bytes.fromBits(decrypted));

		// now perform our UTF8 conversion
		var decode = decrypted;
		try
		{
			if(is_utf8) decode = sjcl.codec.utf8String.fromBits(decode);
			else decode = tcrypt.words_to_bin(decode);
		}
		catch(e)
		{
			throw new TcryptError('UTF8 decoding failed: '+ e.message);
		}

		return decode;
	},

	/**
	 * Generate a key from a password/salt
	 */
	key: function(passphrase, salt, options)
	{
		options || (options = {});

		var iterations = (options.iterations || 400);
		var hasher = (options.hasher || tcrypt.get_hasher('SHA1'));
		var key_size = (options.key_size || 32);
		var passphrase = tcrypt.bin_to_words(passphrase);
		var salt = tcrypt.bin_to_words(salt || '');

		var key = sjcl.misc.pbkdf2(passphrase, salt, iterations, key_size * 8, function(p) {
			return new sjcl.misc.hmac(p, hasher);
		});
		
		return key;
	},

	/**
	 * Generate a key using the webcrypto api (async, obvis)
	 */
	key_native: function(passphrase, salt, options)
	{
		options || (options = {});
		var iterations = (options.iterations || 400);
		var key_size = (options.key_size || 32);
		var hasher = (options.hasher || 'SHA-256');

		var convert = function(str)
		{
			var bytes = sjcl.codec.bytes.fromBits(sjcl.codec.utf8String.toBits(str));
			return new Uint8Array(bytes).buffer;
		};
		passphrase = convert(passphrase);
		salt = convert(salt);

		if(!window.crypto || !window.crypto.subtle)
		{
			return Promise.reject(new TcryptBadBrowser('your browser sucks (hi, safari)'));
		}
		return window.crypto.subtle.importKey('raw', passphrase, {name: 'PBKDF2'}, false, ['deriveKey'])
			.then(function(base) {
				return window.crypto.subtle.deriveKey({
					name: 'PBKDF2',
					salt: salt,
					iterations: iterations,
					hash: hasher
				}, base, {name: 'AES-GCM', length: key_size * 8}, true, ['encrypt', 'decrypt']);
			})
			.then(function(key) {
				return window.crypto.subtle.exportKey('raw', key);
			})
			.then(function(bytes) {
				return sjcl.codec.bytes.toBits(new Uint8Array(bytes));
			});
	},

	/**
	 * convert word array to base64
	 */
	to_base64: function(words)
	{
		return sjcl.codec.base64.fromBits(words);
	},

	/**
	 * convert base64 to word array
	 */
	from_base64: function(str)
	{
		return sjcl.codec.base64.toBits(str);
	},

	/**
	 * convert word array to hex
	 */
	to_hex: function(words)
	{
		return sjcl.codec.hex.fromBits(words);
	},

	/**
	 * convert hex to word array
	 */
	from_hex: function(str)
	{
		return sjcl.codec.hex.toBits(str);
	},

	/**
	 * Given a binary key, convert to base64 string
	 */
	key_to_string: function(keywords)
	{
		return tcrypt.to_base64(keywords);
	},

	/**
	 * Given a Base64 encoded key, convert it to a binary key (keys MUST be in
	 * binary format when using tcrypt.encrypt/decrypt)
	 */
	key_to_bin: function(keystring)
	{
		return tcrypt.from_base64(keystring);
	},

	/**
	 * Is sjcl.codec.utf8string.fromBits, but without UTF8 conversion
	 */
	words_to_bin: function(arr)
	{
		var out = "", bl = sjcl.bitArray.bitLength(arr), i, tmp;
		for (i=0; i<bl/8; i++) {
			if ((i&3) === 0) {
				tmp = arr[i/4];
			}
			out += String.fromCharCode(tmp >>> 24);
			tmp <<= 8;
		}
		return out;
	},

	/**
	 * Is sjcl.codec.utf8string.toBits, but without UTF8 conversion
	 */
	bin_to_words: function(str)
	{
		var out = [], i, tmp=0;
		for (i=0; i<str.length; i++) {
			tmp = tmp << 8 | str.charCodeAt(i);
			if ((i&3) === 3) {
				out.push(tmp);
				tmp = 0;
			}
		}
		if (i&3) {
			out.push(sjcl.bitArray.partial(8*(i&3), tmp));
		}
		return out;
	},

	/**
	 * utf8 encode 
	 */
	utf8_encode: function(data)
	{
		return unescape(encodeURIComponent(data));
	},

	/**
	 * utf8 decode 
	 */
	utf8_decode: function(data)
	{
		return decodeURIComponent(escape(data));
	},

	/**
	 * test for utf8
	 */
	is_utf8: function(str)
	{
		return /[^\u0000-\u00ff]/.test(str);
	},

	/**
	 * Generate N random bytes, returned as a WordArray
	 */
	random_bytes: function(nBytes)
	{
		// NOTE: this was taken directly from CryptoJS' random() function, but
		// updated to use tcrypt.random_number() instead of Math.random().
		var words = [];
		for (var i = 0; i < nBytes; i += 4) {
			words.push((tcrypt.random_number() * 0x100000000) | 0);
		}
		return words;
	},

	/**
	 * Generate an initial vector. If given a seed, will generate it based off
	 * the seed, otherwise will return a random 16 byte WordArray
	 */
	iv: function(value)
	{
		// if no seed given, return 16 random bytes
		if(!value) return tcrypt.random_bytes(16);

		if(value.length < 16)
		{
			// if the IV seed is less than 16 bytes, append random data
			value	+=	tcrypt.words_to_bin(tcrypt.random_bytes(16));
		}
		if(value.length > 16)
		{
			// only grab 16 bytes of seed
			value = value.slice(0, 16)
		}
		return tcrypt.bin_to_words(value);
	},

	/**
	 * Generate a random 256bit key.
	 */
	random_key: function(options)
	{
		return tcrypt.random_bytes(32);
	},

	/**
	 * SHA256 the given data.
	 */
	hash: function(data, options)
	{
		options || (options = {});

		var hash = tcrypt.get_hasher('SHA256').hash(data);
		if(options.raw) return tcrypt.words_to_bin(hash);
		return sjcl.codec.hex.fromBits(hash);
	},

	/**
	 * Generate a random number between 0 and 1.
	 *
	 * Uses window.crypto for random generation, and if not available, bitches
	 * about how insecure your browser is.
	 */
	random_number: function()
	{
		if((typeof(window) == 'undefined' || !window.crypto) && sjcl && sjcl.random)
		{
			return sjcl.random.randomWords(1, 10)[0] / (Math.pow(2, 32) - 1);
		}
		else if(window.crypto.getRandomValues)
		{
			// TODO: handle QuotaExceededError error in FF (maybe the same in chrome)
			return window.crypto.getRandomValues(new Uint32Array(1))[0] / (Math.pow(2, 32) - 1);
		}
		else
		{
			throw new TcryptError('no available PRNG');
		}
	},

	/**
	 * Generate a random SHA256 hash
	 */
	random_hash: function()
	{
		return tcrypt.hash(Date.now() + tcrypt.uuid());
	},

	/**
	 * Generate a *random* UUID.
	 */
	uuid: function()
	{
		// taken from stackoverflow.com, modified to use tcrypt's random generator
		return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
			var r = tcrypt.random_number()*16|0;
			var v = c == 'x' ? r : (r&0x3|0x8);
			return v.toString(16);
		});
	}
};

tcrypt.asym = {
	current_version: 1,

	/**
	 * PGP encrypt a message
	 */
	encrypt: function(pubkey, data, options)
	{
		options || (options = {});

		return new Promise(function(resolve, reject) {
			var rawkey = openpgp.key.readArmored(pubkey);

			openpgp.encryptMessage(rawkey.keys, data)
				.then(function(msg) {
					resolve(msg);
				})
				.catch(reject);
		});
	},

	decrypt: function(privkey, data, options)
	{
		options || (options = {});

		return new Promise(function(resolve, reject) {
			var rawkey = openpgp.key.readArmored(privkey).keys[0];
			rawkey.decrypt();
			var msg = openpgp.message.readArmored(data);

			openpgp.decryptMessage(rawkey, msg)
				.then(function(plain) {
					resolve(plain);
				})
				.catch(reject);
		});
	},

	keygen: function(options)
	{
		options || (options = {});
		return new Promise(function(resolve, reject) {
			var opts = {
				numBits: (options.keysize || 4096),
				userId: options.user_id,
				passphrase: null
			};

			openpgp.generateKeyPair(opts)
				.then(function(keypair){
					resolve({
						private: keypair.privateKeyArmored,
						public: keypair.publicKeyArmored
					});
				})
				.catch(reject);
		});
	}
};

tcrypt.asym_old = {
	current_version: 1,

	/**
	 * Standard serialization for asymetric data
	 *
	 *   |-2 bytes-| |-96 bytes-| |-N bytes----|
	 *   | version | |   tag    | |payload data|
	 */
	serialize: function(enc, options)
	{
		options || (options = {});

		var version = options.version;
		var serialized = String.fromCharCode(version >> 8) + String.fromCharCode(version & 255);
		serialized		+=	options.tag;
		serialized		+=	enc;

		return serialized;
	},

	/**
	 * Standard deserialization for asymetric data. See tcrypt.asym_old.serialize.
	 */
	deserialize: function(enc, options)
	{
		options || (options = {});

		var is_str = typeof(enc) == 'string';
		var get_bytes = function(data, idx, length)
		{
			var sliceargs = length ? [data, idx * 8, (idx * 8) + (length * 8)] : [data, idx * 8];
			return is_str ? tcrypt.bin_to_words(data.substr(idx, length)) : sjcl.bitArray.bitSlice.apply(this, sliceargs);
		};
		var get_byte = function(data, idx)
		{
			return is_str ? data.charCodeAt(idx) : sjcl.bitArray.extract(data, idx * 8, 8); 
		}

		// define an index we increment to keep track of deserialization
		var idx = 0;

		// if the first character is not 0, either Turtl has come a really long
		// way (and had over 255 serialization versions) or we're at the very
		// first version, which just uses Base64.
		var version = (get_byte(enc, idx) << 8) + get_byte(enc, idx + 1);
		idx	+=	2;

		// get the message tag
		var tag = get_bytes(enc, idx, 96);
		idx	+=	96;

		if(options.raw) return get_bytes(enc, 0, idx);

		// finally, the encrypted data
		var ciphertext = get_bytes(enc, idx);

		var params = {
			version: version,
			tag: tag,
			ciphertext: ciphertext
		};
		return params;
	},

	/**
	 * Encrypt data via ECC.
	 *
	 * Creates a key from the given binary, and uses it to extract a tag and an
	 * AES (256bit) key. Encrypts the given data with the AES key, then wraps
	 * the message up (version, tag, key) using tcrypt.asym_old.serialize so the
	 * whole thing can be returned as one binary blob.
	 */
	encrypt: function(key_bin, data, options)
	{
		options || (options = {});

		var version = tcrypt.asym_old.current_version;
		var point = sjcl.ecc.curves.c384.fromBits(key_bin);
		var key = new sjcl.ecc.elGamal.publicKey(sjcl.ecc.curves.c384, point)
		var kem = key.kem(10);
		var symkey = kem.key;
		var tag = kem.tag;

		var ciphertext = tcrypt.encrypt(symkey, data);
		var serialized = tcrypt.asym_old.serialize('', {
			version: version,
			tag: tcrypt.words_to_bin(tag)
		});
		serialized = tcrypt.bin_to_words(serialized);

		// TODO: find a better way to concat?
		return sjcl.bitArray.concat(serialized, ciphertext);
	},

	/**
	 * Decrypt data via ECC.
	 *
	 * Uses tcrypt.asym_old.deserialize to extract the tag and ciphertext, then
	 * extracts the AES key using the private key + tag. The cipher text is then
	 * decrypted and returned.
	 */
	decrypt: function(key_bin, data, options)
	{
		options || (options = {});

		var key = new sjcl.ecc.elGamal.secretKey(sjcl.ecc.curves.c384, sjcl.bn.fromBits(key_bin));
		var version = tcrypt.asym_old.current_version;
		var params = tcrypt.asym_old.deserialize(data);
		var symkey = key.unkem(params.tag);

		return tcrypt.decrypt(symkey, params.ciphertext, options);
	},

	/**
	 * Generate a new ECC keypair
	 */
	generate_ecc_keys: function()
	{
		var keys = sjcl.ecc.elGamal.generateKeys(384, 10);
		return {public: keys.pub._point.toBits(), private: keys.sec.get()};
	}
};

exports.tcrypt = tcrypt;

