window._in_desktop	=	true;
var _desktop_tray	=	null;
var comm			=	new Comm();
var gui				=	require('nw.gui');


/**
 * Make sure our tray menu is updated based on the user's login status.
 */
function update_tray_menu()
{
	if(!_desktop_tray) return false;

	var win		=	gui.Window.get();
	var menu	=	new gui.Menu();
	var lbl		=	function(str) { return '  '+str; };
	menu.append(new gui.MenuItem({ label: lbl('Open Turtl'), icon: 'data/app/favicon.png', click: function() { win.show(); } }));
	menu.append(new gui.MenuItem({ type: 'separator' }));

	// login-specific menu items
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

	// track our global tray object
	_desktop_tray.menu	=	menu;
	return menu;
}

/**
 * make sure our tray menu is up to date
 */
function bind_login_to_menu()
{
	update_tray_menu();
	turtl.user.bind('login', update_tray_menu, 'desktop:user:update-menu');
};

/**
 * attach right-click context menu to images for downloading.
 */
function attach_image_context_menu(body)
{
	body.addEventListener('contextmenu', function(e) {
		var img	=	e.target;
		if(img.tagName.toLowerCase() != 'img' || e.button != 2) return;

		var filename	=	img.src.match(/#name=/) ? img.src.replace(/.*#name=/, '') : 'file';
		var menu		=	new gui.Menu();
		menu.append(new gui.MenuItem({
			label: 'Save image as...',
			click: function() {
				// i love this download hack =]
				var a	=	document.createElement('a');
				a.href	=	img.src;
				a.setAttribute('download', filename);
				fire_click(a);
			}
		}));
		menu.popup(e.x, e.y);
	});
}

/**
 * init our environment
 */
(function() {
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
			win.focus();
		});

		_desktop_tray	=	tray;
		update_tray_menu();

		return tray;
	};

	make_tray();
	win.on('minimize', function() {
		win.hide();
		// Window.hide() hides the tray menu, so we just remove it and re-add it
		make_tray();
	});
})();

window.addEvent('domready', function() {
	window.port	=	new DesktopAddonPort({comm: comm});

	// when turtl loads, make sure we keep our tray menu up to date
	window.port.bind('loaded', bind_login_to_menu);
	// when this is triggered, we already have a new user obj.
	window.port.bind('logout', bind_login_to_menu);

	// add context menus for downloading images
	attach_image_context_menu(document.body);

	// attach to <a target="_blank"> tags
	document.body.addEvent('click:relay(a)', function(e) {
		var a	=	next_tag_up('a', e.target);
		if(a.target != '_blank') return;

		e.stop()
		var popup	=	window.open(a.href);
		var win		=	gui.Window.get(popup);
		win.on('loaded', function() {
			// when the window is loaded, add our image context menus
			attach_image_context_menu(win.window.document.body);
		});
	});
});

