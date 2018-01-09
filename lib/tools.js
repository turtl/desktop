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
};

