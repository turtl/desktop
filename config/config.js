//
// some desktop-oriented app config overrides
//

if(typeof(config) == 'undefined') var config = {};
(function() {
	var electron = require('electron');
	var app = electron.remote ? electron.remote.app : electron.app;
	Object.assign(config, {
		api_url: 'https://turtl.dev:8181',
		client: 'desktop',
		version: app.getVersion(),
		cookie_login: false,
		base_url: typeof(window) != 'undefined' ? window.location.toString().replace(/^(.*)\/.*?$/, '$1/app') : '',
		dispatch_port: 7777,
		core: {
			adapter: 'desktop',
			options: {},
		},
	});
})();

if(module.exports) module.exports = config;

