// some desktop-oriented app config overrides
if(typeof(config) == 'undefined') var config = {};
(function() {
	var is_in_main = typeof(Node) == 'undefined' && typeof(require) != 'undefined';
	var app_version = is_in_main ?
		require('electron').app.getVersion() :
		Node.config.app_version;
	Object.assign(config, {
		api_url: 'https://turtl.dev:8181',
		client: 'desktop',
		version: app_version,
		cookie_login: true,
		base_url: typeof(window) != 'undefined' ? window.location.toString().replace(/^(.*)\/.*?$/, '$1/app') : '',
		dispatch_port: 7471,
		core: {
			adapter: 'desktop',
			options: {},
		},
	});
	if(is_in_main) module.exports = config;
})();

