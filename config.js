//
// some desktop-oriented app config overrides
//

if(typeof(config) == 'undefined') config = {};
Object.merge(config, {
	api_url: 'http://turtl.dev:8181',
	client: 'desktop',
	cookie_login: false,
	base_url: window.location.toString().replace(/^(.*)\/.*?$/, '$1/app'),
	console: true
});

