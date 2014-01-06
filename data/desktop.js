window._in_desktop	=	true;

(function() {
	var gui	=	require('nw.gui');
	var win	=	gui.Window.get();
	if(config && config.console)
	{
		win.showDevTools();	
	}

	var tray	=	new gui.Tray({ title: 'Turtl', icon: 'data/app/favicon.png' });;
	var menu	=	new gui.Menu();
	menu.append(new gui.MenuItem({ type: 'checkbox', label: 'lol' }));
	tray.menu	=	menu;

	tray.on('click', function() {
		win.show();
	});
	win.on('minimize', function() {
		win.hide();
	});
})();
