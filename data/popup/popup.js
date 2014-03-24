var app		=	null;
var barfr	=	null;

function set_parent(win, options)
{
	app				=	win;
	window.log		=	app.log;
	window.console	=	app.console;
	ready(options);
}

var popup	=	{
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
		var bg_inject	=	$('background_content');
		var body		=	document.body;
		popup.show_panel();
		switch(url)
		{
		case 'pair':
			var public_key	=	options.public_key;
			app.Popup.load_controller(body, 'PairingController', {
				inject: bg_inject,
				public_key: public_key
			});
			break;
		case 'add-note':
			app.Popup.load_controller(body, 'NoteEditController', {
				inject: bg_inject,
				edit_in_modal: false,
				board: 'last',
				show_boards: true,
				track_last_board: true
			});
			break;
		case 'bookmark':
			var linkdata	=	options.linkdata;
			app.Popup.load_controller(body, 'BookmarkController', {
				inject: bg_inject,
				linkdata: linkdata
			});
			break;
		case 'add-note':
			app.Popup.load_controller(body, 'NoteEditController', {
				inject: bg_inject,
				edit_in_modal: false
			}, {width: 750});
			break;
		}
	},

	close: function()
	{
		app.Popup.close();
	}
};

var ready	=	function(options)
{
	options || (options = {});

	// give ourselves a working barfr
	barfr	=	new app.Barfr('barfr', {});

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
	document.body.addEvent('click:relay(#background_content > a.closelink)', function(e) {
		if(e) e.stop();
		if(!app) return false;
		app.Popup.close();
	});
	document.body.addEvent('click:relay(#background_content > a.min)', function(e) {
		if(e) e.stop();
		popup.toggle_minify();
	});
});
