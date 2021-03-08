// some desktop-oriented app config overrides
if(typeof(config) == 'undefined') var config = {};
(function() {
	var is_in_main = typeof(AppComm) == 'undefined' && typeof(require) != 'undefined';
	var app_version = is_in_main ?
		require('electron').app.getVersion() :
		AppComm.config.app_version;
	Object.assign(config, {
		client: 'desktop',
		version: app_version,
		base_url: typeof(window) != 'undefined' ? window.location.toString().replace(/^(.*)\/.*?$/, '$1/app') : '',
		dispatch_port: 7471,
		proxy: null,
		core: {
			adapter: 'desktop',
			options: {},
		},
		remember_me: {
			enabled: true,
			adapter: 'localstorage',
			options: {},
		},
	});
	if(is_in_main) module.exports = config;
})();

