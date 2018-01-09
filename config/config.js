//
// some desktop-oriented app config overrides
//

if(typeof(config) == 'undefined') config = {};
(function() {
	var app = require('electron').remote.app
	Object.merge(config, {
		api_url: 'https://turtl.dev:8181',
		client: 'desktop',
		version: app.getVersion(),
		cookie_login: false,
		base_url: window.location.toString().replace(/^(.*)\/.*?$/, '$1/app'),
		dispatch_port: 7777,
		core: {
			adapter: 'desktop',
			options: {},
		},
	});
})();

