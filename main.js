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

// first things first, set up a global error handler so node shuts its mouth
// when bad things happen. yes, i know, it messes up the stack, blah blah.
// it doesn't matter though, because turtl doesn't do anything that doesn't run
// in a normal browser, and anything that falls under such a category will
// eventually put into the core native app.
//process.on('uncaughtException', function(e) { });
var gui = require('nw.gui');

// for debugging turtl-core mainly
gui.Window.get().showDevTools()

// -----------------------------------------------------------------------------
// load turtl-core
// -----------------------------------------------------------------------------
var turtl_remote = require('../TurtlEvent');	// TODO: node is lame and won't load a symlink...
var turtl_core = {
	// our main js -> lisp event dispatcher
	event: new turtl_remote.Event(),

	// remote interface to lisp
	remote: new turtl_remote.Remote(),

	reload: function()
	{
		turtl_core.test({ev: 'cmd', data: {name: 'reload'}});
	},

	test: function(ev, res)
	{
		ev || (ev = {ev: 'ping'});
		turtl_core.remote.send(ev, res);
	}
};
turtl_core.event.bind('turtl-loaded', function() {
	turtl_core.remote.send({ev: 'cmd', data: {name: 'set-data-directory', path: gui.App.dataPath}});
});

// forward remote events to turtl_core.event
turtl_core.remote.bind(function(ev) {
	log.debug('turtl-core: remote: ', ev);
	turtl_core.event.trigger.apply(turtl_core.event, arguments);
});
// start turtl
turtl_remote.start();

// -----------------------------------------------------------------------------
// load the main desktop logic
// -----------------------------------------------------------------------------
window._in_desktop	=	true;
var _desktop_tray	=	null;
var comm			=	new Comm();
var min_to_tray		=	JSON.parse(localStorage['minimize_to_tray'] || 'false') || false;

/**
 * Saves our minimize-to-tray value in storage
 */
function set_tray_min(bool)
{
	localStorage['minimize_to_tray']	=	JSON.encode(bool);
	min_to_tray	=	bool;
}

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
				if(turtl.profile.get('boards').models().length > 0)
				{
					Popup.open({dispatch: 'add-note'});
				}
				else
				{
					new BoardEditController({
						profile: turtl.profile,
						edit_in_modal: true,
						title: 'Add your first board to start adding notes'
					});
					win.show();
				}
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
				new InvitesListController({ edit_in_modal: true });
				win.show();
			}
		}));
		menu.append(new gui.MenuItem({ type: 'separator' }));
		menu.append(new gui.MenuItem({ label: lbl('Logout'), click: function() { turtl.user.logout() } }));
		menu.append(new gui.MenuItem({ type: 'separator' }));
	}
	menu.append(new gui.MenuItem({ type: 'checkbox', checked: min_to_tray, label: lbl('Minimize to tray'), click: function() { set_tray_min(this.checked); } }));
	menu.append(new gui.MenuItem({ type: 'separator' }));
	menu.append(new gui.MenuItem({ label: lbl('Quit'), click: function() {
		Notifications.close();
		Popup.close();
		gui.App.closeAllWindows();
	} }));

	// track our global tray object
	_desktop_tray.menu	=	menu;
	return menu;
}

/**
 * abstraction function to insert text into an HTML element (generally an input
 * field or textarea) such that the text is inserted into the current selection
 * (replacing it) or if there's no selection, just inserted at the cursor
 * position.
 */
function insert_text_at(element, text)
{
	var value	=	element.get('value');
	var start	=	element.selectionStart;
	var begin	=	value.substr(0, start);
	var end		=	value.substr(element.selectionEnd);
	element.set('value', begin + text + end);
	element.selectionStart	=	start + text.length;
	element.selectionEnd	=	element.selectionStart;
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
		if(!min_to_tray) return false;
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
		invites.notify();
	});

	// add context menus for downloading images
	tools.attach_image_context_menu(window);

	// add copy/paste context menus
	tools.attach_copy_paste_context_menu(window);

	// add copy url context menu to links
	tools.attach_copy_url_context_menu(window);

	// handle <a> tags properly. if it's a blob/file URL, we open an in-app
	// window. if it's an external URL we open an OS browser window. otherwise
	// just return business as usual (probably an in-app link)
	tools.hijack_external_links(window);

	var keyboard	=	new Composer.Keyboard({meta_bind: true});
	// Ctrl+Shift+k is open console (if enabled in config)
	keyboard.bind('S-C-k', function() {
		if(config.console) gui.Window.get().showDevTools();
	});
});

invites.init();

var dispatch	=	new Dispatch();
dispatch.start();

