var tools = {
	res: [window.screen.availWidth, window.screen.availHeight],

	/**
	 * Get the best x/y position for a window based on its width/height AND
	 * platform (ie, on top for mac, on bottom for windows).
	 */
	get_popup_coords: function(width, height)
	{
		var pad = 3;
		if(process.platform.match(/darwin/i))
		{
			var x = tools.res[0] - (width + pad);
			var y = 24;
		}
		else
		{
			var x = tools.res[0] - (width + pad);
			var y = tools.res[1] - (height + pad);
		}
		return {x: x, y: y};
	},

	/**
	 * attach right-click context menu to images for downloading.
	 */
	attach_image_context_menu: function(win)
	{
		if(!win || !win.document || !win.document.body) return false;
		var body = win.document.body;
		body.addEventListener('contextmenu', function(e) {
			var img = e.target;
			if(img.tagName.toLowerCase() != 'img' || e.button != 2) return;

			if(img.src.match(/^blob:/))
			{
				var filename = img.src.match(/#name=/) ? img.src.replace(/.*#name=/, '') : 'file';
			}
			else
			{
				var filename = img.src.replace(/^.*\//, '');
			}
			var menu = new gui.Menu();
			menu.append(new gui.MenuItem({
				label: 'Save image as...',
				click: function() {
					// i love this download hack =]
					var a = win.document.createElement('a');
					a.href = img.src;
					a.setAttribute('download', filename);
					fire_click(a);
				}
			}));
			tools.popup_context_menu(e.x, e.y, win, menu);
		});
	},

	/**
	 * attach copy/paste context menus
	 */
	attach_copy_paste_context_menu: function(win)
	{
		if(!win || !win.document || !win.document.body) return false;
		var body = win.document.body;
		body.addEventListener('contextmenu', function(e) {
			var selection = win.getSelection();
			var string = selection ? selection.toString() : false;

			var clipboard = gui.Clipboard.get();
			var paste = clipboard.get('text');
			var active = win.document.activeElement;

			var menu = new gui.Menu();
			var has_items = false;
			if(string && string != '')
			{
				menu.append(new gui.MenuItem({
					label: 'Copy',
					click: function() {
						var clipboard = gui.Clipboard.get();
						clipboard.set(string, 'text');
					}
				}));
				has_items = true;
			}
			if((active.get('tag') == 'input' && !['checkbox', 'radio', 'button', 'submit'].contains(active.get('type'))) || active.get('tag') == 'textarea')
			{
				menu.append(new gui.MenuItem({
					label: 'Paste',
					click: function() {
						insert_text_at(active, paste);
					}
				}));
				has_items = true;
			}

			if(!has_items) return false;
			tools.popup_context_menu(e.x, e.y, win, menu);
		});
	},

	attach_copy_url_context_menu: function(win)
	{
		if(!win || !win.document || !win.document.body) return false;
		var body = win.document.body;
		body.addEventListener('contextmenu', function(e) {
			var a = e.target;
			if(a.tagName.toLowerCase() != 'a' || e.button != 2) return;

			var url = a.href;
			var menu = new gui.Menu();
			menu.append(new gui.MenuItem({
				label: 'Copy URL',
				click: function() {
					var clipboard = gui.Clipboard.get();
					clipboard.set(url, 'text');
				}
			}));
			tools.popup_context_menu(e.x, e.y, win, menu);
		});
	},

	/**
	 * process any target="_blank" links and be smart about whether we open them
	 * internally or spawn a browser window via the OS' default browser.
	 */
	hijack_external_links: function(win)
	{
		var open = function(url)
		{
			gui.Shell.openExternal(url)
		};

		win.window.addEventListener('click', function(e) {
			var a = e.target;
			if(!Composer.match(e.target, 'a, a *')) return;
			var is_href = a.href.match(/^http/);
			var is_blank = ['_blank', '_top'].indexOf(a.getAttribute('target')) >= 0;

			if(!(is_href || is_blank)) return;

			e.preventDefault();
			e.stopPropagation();
			open(e.target.href);
		});
		win.on('new-win-policy', function(_, url, policy) {
			open(url);
			policy.ignore();
		});
	},

	popup_context_menu: function(x, y, win, menu)
	{
		var curwin = gui.Window.get(win);
		var mainwin = gui.Window.get();
		x = x + (curwin.x - mainwin.x);
		y = y + (curwin.y - mainwin.y);

		menu.popup(x, y);
	}
};
