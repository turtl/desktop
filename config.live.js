//
// some desktop-oriented app config overrides
//

if(typeof(config) == 'undefined') config = {};
Object.merge(config, {
	api_url: 'https://api.turtl.it/v2',
	client: 'desktop',
	cookie_login: false,
	base_url: window.location.toString().replace(/^(.*)\/.*?$/, '$1/app'),
	console: true
});

