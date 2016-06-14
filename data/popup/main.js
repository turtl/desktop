var app = null;
var barfr = null;

function set_parent(win, options)
{
	app = win;
	window.log = app.log;
	window.console = app.console;
	ready(options);
}

var popup = {
	toggle_minify: function()
	{
		if(document.body.hasClass('minified'))
		{
			document.body.removeClass('minified');
			document.body.getElement('a.min').setProperty('title', 'Minimize');
		}
		else
		{
			document.body.addClass('minified');
			document.body.getElement('a.min').setProperty('title', 'Maximize');
		}
		(function() { app.comm.trigger('resize'); }).delay(0);
	},

	reset_height: function()
	{
		// reset the box height
		document.body.getParent().setStyle('height', 1);
		(function() {
			document.body.getParent().setStyle('height', '');
		}).delay(0, this);
	},

	show_panel: function(options)
	{
		options || (options = {});

		if(options.width) document.body.setStyle('width', options.width);

		popup.reset_height();
	},

	dispatch: function(url, options)
	{
		var bg_inject = $('background_content');
		var body = document.body;
		popup.show_panel();
		switch(url)
		{
		case 'pair':
			var public_key = options.public_key;
			app.Popup.load_controller(body, 'PairingController', {
				inject: bg_inject,
				public_key: public_key
			});
			break;
		case 'add-note':
			app.Popup.load_controller(body, 'AddNoteController', {
				inject: bg_inject
			});
			break;
		case 'bookmark':
			var linkdata = options.linkdata;
			app.Popup.load_controller(body, 'BookmarkController', {
				inject: bg_inject,
				linkdata: linkdata
			});
			// NOTE: we hack this. the resizer in the note editor will operate
			// via the `window` object in the main window, not our popup window,
			// which royally screws things up when resizing. this is a hack that
			// lets us listen to the popup's events and modify the text box
			// directly via this window object, but the cost is we have to
			// duplicate the resizing code between here and the note editor.
			var resizer = function()
			{
				var el_form = bg_inject.getElement('form');
				var inp_text = el_form.getElement('textarea[name=text]');
				var el_buttons = el_form.getElement('.button-row');

				var form_bottom = el_form.getCoordinates().bottom;
				var btn_top = el_buttons.getCoordinates().top;
				var diff = btn_top - form_bottom;
				var txt_height = inp_text.getCoordinates().height;
				var height = txt_height + diff;
				if(height < 80) height = 80;
				inp_text.setStyles({ height: height+'px' });
			};
			window.addEvent('resize', resizer);
			break;
		}
	},

	close: function()
	{
		app.Popup.close();
	}
};

var ready = function(options)
{
	options || (options = {});

	// give ourselves a working barfr
	barfr = new app.Barfr('barfr', {});

	// resize the panel when a main page controller is released
	app.turtl.controllers.pages.bind('release-current', function() {
		popup.show_panel();
	});

	if(options.dispatch)
	{
		popup.dispatch(options.dispatch, options);
	}
};

window.addEvent('domready', function() {
	var gui = require('nw.gui');
	var keyboard = new TurtlKeyboard().attach();
	keyboard.bind('control+shift+k', function() {
		gui.Window.get().showDevTools();
	});

	/*
	document.body.addEvent('keydown', function(e) {
		if(e.key != 'esc') return;
		app.Popup.close();
	});
	*/
});
