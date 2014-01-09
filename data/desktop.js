window._in_desktop	=	true;
var _desktop_tray	=	null;
var comm			=	new Comm();

function update_tray_menu()
{
	if(!_desktop_tray) return false;

	var gui		=	require('nw.gui');
	var win		=	gui.Window.get();
	var menu	=	new gui.Menu();
	var lbl		=	function(str) { return '  '+str; };
	menu.append(new gui.MenuItem({ label: lbl('Open Turtl'), icon: 'data/app/favicon.png', click: function() { win.show(); } }));
	menu.append(new gui.MenuItem({ type: 'separator' }));

	if(typeof turtl != 'undefined' && turtl.user && turtl.user.logged_in)
	{
		menu.append(new gui.MenuItem({
			label: lbl('Add note'),
			click: function() {
				console.log('add note');
			}
		}));
		menu.append(new gui.MenuItem({ label: lbl('Logout'), click: function() { turtl.user.logout() } }));
		menu.append(new gui.MenuItem({ type: 'separator' }));
	}
	else
	{
	}
	menu.append(new gui.MenuItem({ label: lbl('Quit'), click: function() { gui.App.closeAllWindows(); } }));

	_desktop_tray.menu	=	menu;
	return menu;
}

(function() {
	var gui	=	require('nw.gui');
	var win	=	gui.Window.get();

	if(config && config.console)
	{
		win.showDevTools();	
	}

	var make_tray	=	function()
	{
		if(_desktop_tray) _desktop_tray.remove();

		var tray	=	new gui.Tray({ title: 'Turtl', icon: 'data/app/favicon.png' });;

		tray.on('click', function() {
			win.show();
		});

		_desktop_tray	=	tray;
		update_tray_menu();

		return tray;
	};

	make_tray();
	win.on('minimize', function() {
		win.hide();
		make_tray();
	});
})();

var bind_login_to_menu	=	function()
{
	update_tray_menu();
	turtl.user.bind('login', update_tray_menu, 'desktop:user:update-menu');
};

window.addEvent('domready', function() {
	window.port	=	new DesktopAddonPort({comm: comm});

	// when turtl loads, make sure we keep our tray menu up to date
	window.port.bind('loaded', bind_login_to_menu);
	// when this is triggered, we already have a new user obj.
	window.port.bind('logout', bind_login_to_menu);
});

