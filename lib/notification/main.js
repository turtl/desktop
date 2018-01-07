var gui = require('nw.gui');
var data = {};
var qs = window.location.search.substr(1);
var parts = qs.split('&');
var vars = {};
var mainwin = null;
parts.map(function(part) {
	var kv = part.split('=');
	if(!kv[0]) return;
	var val = unescape(kv[1] ? kv[1] : '').replace(/<\/?script(.*?)>/ig, '');
	vars[kv[0]] = val;
});

var display = function()
{
	Object.keys(vars).forEach(function(key) {
		var el = document.getElementById('tpl-'+key);
		if(!el) return;
		el.innerHTML = vars[key] || '';
	});
	document.body.addEventListener('click', function(e) {
		e.stopPropagation();
		e.preventDefault();
		mainwin.Notifications.click_action();
	}, false);
	document.getElementById('close').addEventListener('click', function(e) {
		e.stopPropagation();
		e.preventDefault();
		mainwin.Notifications.close();
	});
};

var set_parent = function(obj)
{
	mainwin = obj;
};

