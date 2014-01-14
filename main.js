/**
 * This is the main desktop app init script. The philosophy here is to modify
 * the core app as little as possible to support desktop and instead attach
 * functionality to it via this script. So far so good.
 *
 * This file is responsible for the tray icon and menus, context menus (for
 * downloading images, mainly), actual download of images (made possible
 * thanks to <a download="file.jpg" /> links), and any other desktop-specific
 * code that needs to be run.
 */

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

	if(window.turtl && window.turtl.user && window.turtl.user.logged_in)
	{
		_desktop_tray.icon	=	'data/app/images/favicon.png';
	}
	else
	{
		_desktop_tray.icon	=	'data/app/images/favicon.gray.png';
	}

	var win		=	gui.Window.get();
	var menu	=	new gui.Menu();
	var lbl		=	function(str) { return '  '+str; };
	menu.append(new gui.MenuItem({ label: lbl('Open Turtl'), icon: 'data/app/images/favicon.png', click: function() { win.show(); } }));
	menu.append(new gui.MenuItem({ type: 'separator' }));

	// login-specific menu items
	if(typeof turtl != 'undefined' && turtl.user && turtl.user.logged_in)
	{
		menu.append(new gui.MenuItem({
			label: lbl('Add note'),
			click: function(e) {
				new NoteEditController({
					board: 'last',
					show_boards: true,
					track_last_board: true
				});
				win.show();
			}
		}));
		menu.append(new gui.MenuItem({
			label: lbl('Personas'),
			click: function(e) {
				new PersonasController();
				win.show();
			}
		}));
		var num_invites	=	turtl.messages.models().length;
		var invite_lbl	=	'Invites';
		if(num_invites > 0) invite_lbl += ' ('+ num_invites +')';
		menu.append(new gui.MenuItem({
			label: lbl(invite_lbl),
			click: function(e) {
				new InvitesListController({
					edit_in_modal: true
				});
				win.show();
			}
		}));
		menu.append(new gui.MenuItem({ type: 'separator' }));
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
 * create a new tray icon. if we have an old one, remove it.
 */
function make_tray(options)
{
	options || (options = {});

	var win	=	gui.Window.get();

	if(_desktop_tray) _desktop_tray.remove();

	var icon	=	'data/app/images/favicon.gray.png';
	if(window.turtl && window.turtl.user && window.turtl.user.logged_in)
	{
		icon	=	'data/app/images/favicon.png';
	}
	if(options.notify)
	{
		icon	=	'data/app/images/favicon.notify.png';
	}
	var tray	=	new gui.Tray({ title: 'Turtl', icon: icon });;

	tray.on('click', function() {
		win.show();
		win.focus();
	});

	_desktop_tray	=	tray;
	update_tray_menu();

	return tray;
};

/**
 * make sure our tray menu is up to date
 */
function bind_login_to_menu()
{
	update_tray_menu();
	turtl.user.bind('login', update_tray_menu, 'desktop:user:update-menu');
};

/**
 * init our environment
 */
(function() {
	var win	=	gui.Window.get();

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

	// if we get new invites, update the tray icon and menu
	window.port.bind('num-messages', function(num) {
		make_tray({notify: num > 0});
	});

	// add context menus for downloading images
	attach_image_context_menu(document.body);

	// handle <a> tags properly. if it's a blob/file URL, we open an in-app
	// window. if it's an external URL we open an OS browser window. otherwise
	// just return business as usual (probably an in-app link)
	document.body.addEvent('click:relay(a)', function(e) {
		var atag		=	next_tag_up('a', e.target);
		var external	=	false;
		if(!atag.href.match(/^(blob:|file:)/i) && atag.href.match(/^[a-z]+:/i))
		{
			external	=	true;
		}
		if(!atag.href.match(/^blob:/) && atag.target != '_blank' && !external) return;
		e.stop();

		if(external)
		{
			// we're opening a link outside the app, open the OS' browser
			gui.Shell.openExternal(atag.href)
		}
		else
		{
			// this is an in-app link.
			var popup	=	window.open(atag.href);
			var win		=	gui.Window.get(popup);
			win.on('loaded', function() {
				// when the window is loaded, add our image context menus
				attach_image_context_menu(win.window.document.body);
			});
		}
	});

	var keyboard	=	new Composer.Keyboard({meta_bind: true});
	// Ctrl+Shift+k is open console (if enabled in config)
	keyboard.bind('S-C-k', function() {
		if(config.console) gui.Window.get().showDevTools();
	});
});

