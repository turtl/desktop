/**
 * This is the invites lib, responsible for processing invites from external
 * sources (ie, not messages that come through Turtl but from the Turtl
 * website).
 *
 * A lot of this is taken verbatim from the chrome extension (gee whiz, wonder
 * why).
 */
var invites	=	{
	init: function()
	{
		if(!localStorage.invites) localStorage.invites = '{}';
	},

	invite_valid: function(code, id, options)
	{
		options || (options = {});

		new Request({
			url: config.api_url + '/invites/codes/'+code,
			data: {invite_id: id},
			method: 'get',
			onSuccess: function(res) {
				if(options.success) options.success(JSON.parse(res));
			},
			onFailure: function() {
				if(options.error) options.error();
			}
		}).send();
	},

	process_invite: function(code, id, key, options)
	{
		options || (options = {});

		invites.invite_valid(code, id, {
			success: function(invite) {
				// add in the key
				invite.data.key	=	key;
				console.log('invites: got valid! ', code);

				var invites_obj			=	JSON.parse(localStorage.invites);
				invites_obj[invite.id]	=	invite;

				// add the invite to persistent storage
				if(window.turtl && turtl.user && turtl.user.logged_in)
				{
					window.port.send('invites-populate', invites_obj);
					localStorage.invites	=	'{}';
				}
				else
				{
					localStorage.invites	=	JSON.stringify(invites_obj);
				}

				invites.open();
				if(options.success) options.success();
			},
			error: options.error
		});
	},

	open: function()
	{
		if(!turtl || !turtl.user || !turtl.user.logged_in) return false;

		invites.notify();
		new InvitesListController({ edit_in_modal: true });
		var win	=	gui.Window.get();
		win.show();
		win.focus();
	},

	notify: function()
	{
		window.port.send('invites-change');
		if(turtl.invites.models().length == 0 && turtl.messages.models().length == 0) return false;
		if(turtl.user.get('personas').models().length == 0) return false;
		Notifications.open({
			title: 'You have new invites',
			body: 'Click to accept your invites and start sharing.',
			action: function() {
				invites.open();
			}
		});
	}
};

