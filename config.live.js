//
// some desktop-oriented app config overrides
//

if(typeof(config) == 'undefined') config = {};
(function() {
	var gui = require('nw.gui');
	Object.merge(config, {
		api_url: 'https://api.turtl.it/v2',
		client: 'desktop',
		version: gui.App.manifest.version,
		cookie_login: false,
		catch_global_errors: true,
		base_url: window.location.toString().replace(/^(.*)\/.*?$/, '$1/app')
	});
})();

