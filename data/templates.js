var _templates = {};

_templates['account/export'] = 'Export\
';

_templates['account/index'] = '<h1>Manage your account</h1>\
<div class="account clear">\
	<?\
	var showtab = function(name)\
	{\
		var slug = name.toLowerCase().replace(/[^0-9a-z]/g, \'-\').replace(/-+/g, \'-\');\
		var t = \'<li class="\'+slug;\
		if(curtab == slug) t += \' sel\';\
		t += \'">\'+ name +\'</li>\';\
		return t;\
	};\
	?>\
	<!--\
	<ul class="type clear">\
		<?=showtab(\'Profile\')?>\
		<?=showtab(\'Password\')?>\
		<?=showtab(\'Export/Import\')?>\
	</ul>\
	-->\
\
	<div class="account-content"></div>\
</div>\
';

_templates['account/password'] = 'Change password\
';

_templates['account/profile'] = '<div class="account-profile content">\
	<div class="size-container"></div>\
\
	<? if(config.enable_promo) { ?>\
		<div class="promo clear">\
			<div class="finvite">\
				<a href="#invite">\
					<icon>&#59136;</icon>\
					Invite friends, get more storage\
				</a>\
			</div>\
\
			<div class="upgrade">\
				<a href="#upgrade">\
					<icon>&#58543;</icon>\
					Upgrade your account\
				</a>\
			</div>\
		</div>\
		<div class="inviter clear">\
			<p>\
				For every person that signs up for Turtl using your invite link,\
				you get an <strong>extra 25mb of storage</strong>.\
			</p>\
			<div class="social">\
				<? var share_encoded	=	encodeURIComponent(share_link); ?>\
				<ul>\
					<li><a href="https://twitter.com/home?status=<?=encodeURIComponent(share_text)?>" target="_blank" class="tw" title="Share Turtl on Twitter"><icon>&#62218;</icon></a></li>\
					<li><a href="https://www.facebook.com/sharer/sharer.php?u=<?=share_encoded?>" target="_blank" class="fb" title="Share Turtl on Facebook"><icon>&#62221;</icon></a></li>\
					<li><a href="https://plus.google.com/share?url=<?=share_encoded?>" target="_blank" class="gp" title="Share Turtl on Google+"><icon>&#62224;</icon></a></li>\
					<li><a href="http://www.tumblr.com/share?v=3&u=<?=share_encoded?>&t=<?=encodeURIComponent(\'Turtl\')?>" target="_blank" class="tb" title="Share Turtl on Tumblr"><icon>&#62230;</icon></a></li>\
					<li><a href="https://www.linkedin.com/shareArticle?mini=true&url=<?=share_encoded?>&title=<?=encodeURIComponent(\'Turtl\')?>" target="_blank" class="li" title="Share Turtl on LinkedIn"><icon>&#62233;</icon></a></li>\
				</ul>\
			</div>\
			<div class="link">\
				<p>Invite directly by emailing or sharing this link:</p>\
				<p><a href="mailto:?subject=<?=encodeURIComponent(\'Check out Turtl\')?>&body=<?=share_encoded?>" target="_blank"><strong><?=share_link?></strong></a></p>\
			</div>\
		</div>\
	<? } ?>\
\
	<h2>Account info</h2>\
	<ul class="info">\
		<li>\
			You own <?=num_boards?> boards, containing <?=num_notes?> notes in total.\
		</li>\
		<li>\
			You are sharing <?=num_shared_boards?> board<?=(num_shared_boards == 1 ? \'\' : \'s\')?>, and\
			<?=num_boards_shared?> board<?=(num_boards_shared == 1 ? \' is\' : \'s are\')?> shared with you.\
		</li>\
		<li>\
			You have been a member since <?=member_since?> (<?=Math.ceil(member_days)?> days).\
		</li>\
	</ul>\
</div>\
';

_templates['account/size'] = '<?\
var pretty_size	=	function(size, div)\
{\
	var precision	=	2;\
	var rounder		=	Math.pow(10, precision);\
	return Math.round((size / div) * rounder) / rounder;\
};\
?>\
<div class="profile-size" title="<?=profile_size?> bytes used out of <?=storage?>">\
	<div class="bar" style="width: <?=Math.min(Math.max((profile_size / storage) * 100, 1), 100)?>%;">\
		<? if(loading_profile_size) { ?>\
			&nbsp; (loading)\
		<? } else { ?>\
			&nbsp; Storage used: <?=pretty_size(profile_size, 1024 * 1024)?> / <?=pretty_size(storage, 1024 * 1024)?>mb\
		<? } ?>\
	</div>\
</div>\
';

_templates['boards/edit'] = '<?\
var action	=	(board.id ? \'Edit\' : \'Add\');\
?>\
<? if(!bare) { ?>\
	<h1>\
		<? if(title) { ?>\
			<?=title?>\
		<? } else { ?>\
			<?=action?> board\
		<? } ?>\
	</h1>\
<? } ?>\
<div class="board-edit clear <? if(bare) { ?>bare<? } ?>">\
	<form>\
		<? if(bare) { ?>\
			<input type="text" name="name" value="<?=board.title?>" placeholder="Board name">\
			<div class="actions">\
				<!--<a href="#submit"><icon>&#10003;</icon></a>-->\
				<!--<a href="#cancel"><icon>&#10060;</icon></a>-->\
				<input type="submit" class="add" value="<?=action?>">\
				<a href="#cancel">Cancel</a>\
			</div>\
		<? } else { ?>\
			<input type="submit" value="<?=action?> board">\
			<input type="text" name="name" value="<?=board.title?>" placeholder="Board name">\
			<? if(show_settings) { ?>\
				<div class="settings">\
					<a href="#delete">\
						<icon>&#59177;</icon>\
						Delete this board\
					</a>\
				</div>\
			<? } ?>\
		<? } ?>\
	</form>\
</div>\
';

_templates['boards/index'] = '<? if(num_boards > 0) { ?>\
	<div class="board-list <? if(is_open) { ?>open<? } ?>">\
		<a class="main" href="#open">\
			<icon>&#59228;</icon>\
			<?=current.title?>\
		</a>\
		<div class="dropdown <? if(is_open) { ?>open<? } ?>">\
			<div class="header">\
				<div class="button add" title="Add a new board">\
					<span><icon>&oplus;</icon> New board</span>\
				</div>\
				<h3>Your boards</h3>\
			</div>\
			<div class="add-board"></div>\
			<div class="actions">\
				<input type="text" name="filter" value="" placeholder="Search your boards">\
			</div>\
			<div class="boards-sub"></div>\
		</div>\
	</div>\
<? } else { ?>\
	<div class="button add">\
		<span><icon>&oplus;</icon> Add your first board</span>\
	</div>\
<? } ?>\
<?/* little trick i learned in nam */?>\
<span style="clear:left;display:block;"></span>\
';

_templates['boards/list'] = '<ul>\
	<? boards.each(function(b) { ?>\
		<?\
		var active_share	=	b.privs && Object.keys(b.privs).length > 0;\
		?>\
		<li>\
			<? if(show_actions) { ?>\
				<ul class="<?=b.id?>">\
					<? if(b.shared) { ?>\
						<li><a href="#leave" title="Leave this board"><icon>&#59201;</icon></a></li>\
					<? } else { ?>\
						<li <? if(active_share) { ?>class="active"<? } ?>><a href="#share" title="Share this board"><icon>&#59196;</icon></a></li>\
						<li><a href="#edit" title="Board settings"><icon>&#9881;</icon></a></li>\
						<!--<li><a href="#delete" title="Delete this board"><icon>&#59177;</icon></a></li>-->\
					<? } ?>\
				</ul>\
			<? } ?>\
			<a class="board <? if(current && current.id == b.id) { ?>current<? } ?>" href="#board-<?=b.id?>">\
				<?=b.title?>\
			</a>\
		</li>\
	<? }); ?>\
</ul>\
';

_templates['boards/manage'] = '<h1>Manage boards</h1>\
<div class="board-manage">\
	<? if(!enable_sharing) { ?>\
		<a href="#add-persona">Add a persona</a> to enable sharing.\
	<? } ?>\
	<div class="button add">\
		<span><icon>&oplus;</icon> New board</span>\
	</div>\
	<span class="clearMe"></span>\
	<ul class="mine">\
		<? boards.each(function(b) { ?>\
			<li class="clear board_<?=b.id?>">\
				<!--<span class="sort" title="Drag to sort boards"></span>-->\
				<h3>\
					<?=b.title?>\
					<? if(b.shared) { ?><small>(shared)</small> <? } ?>\
				</h3>\
				<ul class="actions">\
					<? if(b.shared) { ?>\
						<li>\
							<a href="#leave" class="<?=b.id?>" title="Leave board">\
								<img src="<?=img(\'/images/site/icons/remove_16x16_black.png\')?>" alt="share" width="16" height="16">\
							</a>\
						</li>\
					<? } else { ?>\
						<? if(enable_sharing) { ?>\
							<li class="<? if(b.share_enabled) { ?>highlight<? } ?>">\
								<a href="#share" class="<?=b.id?>" title="Share board">\
									<img src="<?=img(\'/images/site/icons/share_16x16_black.png\')?>" alt="share" width="16" height="16">\
								</a>\
							</li>\
						<? } ?>\
						<li>\
							<a href="#edit" class="<?=b.id?>" title="Edit board">\
								<icon>&#9998;</icon>\
							</a>\
						</li>\
						<li>\
							<a href="#delete" class="<?=b.id?>" title="Delete board (and all contained data)">\
								<icon>&#10006;</icon>\
							</a>\
						</li>\
					<? } ?>\
				</ul>\
			</li>\
		<? }); ?>\
	</ul>\
</div>\
';

_templates['boards/share'] = '<h1>\
	Sharing: <?=title?>\
	<small><a href="#back">&laquo; Back to board manager</a></small>\
</h1>\
<div class="board-share">\
	<div class="share-to clear">\
		<div class="select clear"></div>\
	</div>\
\
	<div class="personas-list"></div>\
</div>\
';

_templates['boards/share_personas'] = '<? if(personas.length > 0 || invites.length > 0) { ?>\
	<ul>\
		<? personas.each(function(p) { ?>\
			<? if(!p || !p.privs || !p.privs.perms) { return; } ?>\
			<li class="persona_<?=p.id?> clear">\
				<h3>\
					<?=p.email?>\
					<? if(p.privs && p.privs.invite) { ?>\
						<small>- invite pending</small>\
					<? } ?>\
				</h3>\
				<small>\
					(has <?=(p.privs.perms == 2 ? \'write\' : \'read\')?> permissions)\
				</small>\
				<ul>\
					<li>\
						<a href="#remove" title="Remove this user from sharing">\
							<img src="<?=img(\'/images/site/icons/remove_16x16_black.png\')?>" width="16" height="16" alt="remove">\
						</a>\
					</li>\
				</ul>\
			</li>\
		<? }); ?>\
\
		<? invites.each(function(i) { ?>\
			<li class="invite_<?=i.id?> clear">\
				<h3>\
					<?=i.email?>\
					<small>- invite pending</small>\
				</h3>\
				<small>\
					(has <?=(i.perms == 2 ? \'write\' : \'read\')?> permissions)\
				</small>\
				<ul>\
					<li>\
						<a href="#cancel" title="Cancel this invite">\
							<img src="<?=img(\'/images/site/icons/remove_16x16_black.png\')?>" width="16" height="16" alt="remove">\
						</a>\
					</li>\
				</ul>\
			</li>\
		<? }); ?>\
	</ul>\
<? } else { ?>\
	<p class="note">\
		The people you share this board with will show up here!\
	</p>\
<? } ?>\
';

_templates['categories/list'] = '<? if(categories.length > 0) { ?>\
	<ul class="categories">\
		<? categories.each(function(c) { ?>\
			<li>\
				<a href="#cat"><?=c.name?></a>\
				<ul>\
					<? c.tags.each(function(t) { ?>\
						<li><a href="#tag"><?=t.name?></a></li>\
					<? }); ?>\
				</ul>\
			</li>\
		<? }); ?>\
	</ul>\
<? } ?>\
';

_templates['dashboard/index'] = '<div class="dashboard clear">\
	<div class="notes clear"></div>\
	<div class="boards"></div>\
	<div class="sidebar">\
		<div class="menu">\
			<div class="categories"></div>\
			<div class="tags clear"></div>\
		</div>\
	</div>\
</div>\
';

_templates['feedback/button'] = '<a href="#feedback">\
	<img src="<?=img(\'/images/template/feedback.png\')?>" width="35" height="127" alt="Feedback" title="Have a question or feature request?">\
</a>\
';

_templates['feedback/index'] = '<h1>Give us feedback</h1>\
<div class="feedback content">\
	<p>\
		Have a problem? A question? Want a new feature?\
		Let us know and we\'ll get back to you!\
	</p>\
	<form class="standard-form">\
		<? if(email && email.match(/.*@.*/)) { ?>\
			<input type="hidden" name="email" value="<?=email?>">\
		<? } else { ?>\
			<input type="text" name="email" value="" placeholder="Your email (optional for comments/suggestions)">\
		<? } ?>\
		<textarea rows="3" cols="30" name="body" placeholder="Your comments, questions, suggestions"></textarea>\
		<input type="submit" value="Send">\
	</form>\
</div>\
';

_templates['feedback/thanks'] = '<h1>Thanks for getting in touch</h1>\
\
<div class="content">\
	<p>\
		Your feedback helps make Turtl better!\
		<? if(email) { ?>\
			We\'ll get back to you quickly with responses to your questions/comments.\
		<? } else { ?>\
			Thank you for taking the time to send us your thoughts.\
		<? } ?>\
	</p>\
	<input type="button" name="close" value="Close">\
</div>\
';

_templates['help/index'] = '<h1>Quick help</h1>\
<div class="help content">\
	<h2>Keyboard shortcuts</h2>\
	<table class="shortcuts">\
		<tr>\
			<td><kbd>a</kbd></td>\
			<td>Add a new note</td>\
		</tr>\
		<tr>\
			<td><kbd>b</kbd></td>\
			<td>Open board dropdown</td>\
		</tr>\
		<tr>\
			<td><kbd>enter</kbd></td>\
			<td>Open current note</td>\
		</tr>\
		<tr>\
			<td><kbd>e</kbd></td>\
			<td>Edit current note</td>\
		</tr>\
		<tr>\
			<td><kbd>delete</kbd></td>\
			<td>Delete current note</td>\
		</tr>\
		<tr>\
			<td><kbd>/</kbd></td>\
			<td>Search notes</td>\
		</tr>\
		<tr>\
			<td><kbd>x</kbd></td>\
			<td>Clear all current filters (show all notes in the board)</td>\
		</tr>\
		<tr>\
			<td><kbd>?</kbd></td>\
			<td>Show this help</td>\
		</tr>\
		<tr>\
			<td><kbd>shift + L</kbd></td>\
			<td>Log out</td>\
		</tr>\
	</table>\
	<p>\
		If you are having trouble using Turtl, please email us at <code>info@turtl.it</code>.\
	</p>\
</div>\
';

_templates['invites/board'] = '<div class="invite">\
\
	<form class="standard-form">\
		<h2>Invite <?=invite.email?> to the board "<?=board.title?>"</h2>\
		<div class="do-secure">\
		</div>\
		<? if(persona.id) { ?>\
			<p>\
				<span class="success">This invite will be sent encrypted.</span>\
				(<?=persona.email?> is already a Turtl user)\
			</p>\
		<? } else { ?>\
			<p>\
				This invite will be sent via email.\
				(<?=invite.email?> is not a Turtl user, YET)\
			</p>\
		<? } ?>\
\
		<? if(!persona.id) { ?>\
			<div class="challenge">\
				<h3>\
					<label for="invite_secure_chk"><icon>&#128274;</icon> Secure this invite</label>\
					<input type="checkbox" id="invite_secure_chk" class="secure" <? if(!persona.id) { ?>checked<? } ?>>\
				</h3>\
				<div class="inner">\
					<p>\
						<em>Ask the recipient a question only they would know the answer\
						to.</em> They will not have access to the answer, but must know\
						it from memory.  Feel free to give formatting hints in the\
						question.\
					</p>\
					<input type="text" name="question" placeholder="Question. &quot;What item did I lose on our last road trip? (Hint: two words)&quot;">\
					<input type="text" name="answer" placeholder="Answer. &quot;decoder ring&quot;">\
				</div>\
			</div>\
		<? } ?>\
\
		<div class="submit">\
			<input tabindex="4" type="submit" value="Invite">\
		</div>\
	</form>\
</div>\
';

_templates['invites/list'] = '<h1>Invites</h1>\
\
<div class="invites-list">\
	<? if(invites.length > 0 || messages.length > 0) { ?>\
		<? if(num_personas > 0) { ?>\
			<ul>\
				<? messages.each(function(msg) { ?>\
					<li class="clear message <?=msg.body.type?> message_<?=msg.id?>">\
						<div class="actions">\
							<a href="#accept" title="Accept invite"><img src="<?=img(\'/images/site/icons/check_16x16.png\')?>" width="16" height="16" alt="Accept"></a>\
							<a href="#deny" title="Deny invite"><img src="<?=img(\'/images/site/icons/x_16x16.png\')?>" width="16" height="16" alt="Deny"></a>\
						</div>\
						<?=msg.subject?>\
					</li>\
				<? }); ?>\
				<? invites.each(function(inv) { ?>\
					<? inv.data || (inv.data = {}); ?>\
					<li class="invite invite_<?=inv.id?> clear">\
						<div class="actions">\
							<? if(inv.data.used_secret) { ?>\
								<a href="#unlock" title="Unlock invite"><img src="<?=img(\'/images/site/icons/lock_16x16_blank.png\')?>" width="16" height="16" alt="Unlock"></a>\
							<? } else { ?>\
								<a href="#accept" title="Accept invite"><img src="<?=img(\'/images/site/icons/check_16x16.png\')?>" width="16" height="16" alt="Accept"></a>\
							<? } ?>\
							<a href="#deny" title="Deny invite"><img src="<?=img(\'/images/site/icons/x_16x16.png\')?>" width="16" height="16" alt="Deny"></a>\
						</div>\
						<? if(inv.from) { ?>\
							<strong><?=inv.from.email?></strong>\
							invited you to join a \
							<?=(inv.type != \'b\' ? \'other\' : \'board\')?>\
						<? } else {  ?>\
							<?=(inv.type != \'b\' ? \'Other\' : \'Board\')?> invite\
							<strong><?=inv.code?></strong>\
						<? } ?>\
						<? if(inv.data.used_secret) { ?>\
							&nbsp;&nbsp;(locked invite, <a href="#unlock">answer the question to unlock</a>)\
							<form class="secret">\
								<p class="question">\
									<strong>Question:</strong> <?=inv.data.question?>\
								</p>\
								<input type="text" name="secret" placeholder="Answer the question to unlock the invite">\
								<input type="submit" value="Unlock">\
							</form>\
						<? } ?>\
					</li>\
				<? }); ?>\
			</ul>\
		<? } else { ?>\
			<div class="button add persona"><span>Add a persona</span></div>\
			<br><br>\
			<p>You have <?=invites.length?> invite(s), but you cannot accept them without a persona.</p>\
		<? } ?>\
	<? } else { ?>\
		<p>You have no pending invites.<p>\
	<? } ?>\
</div>\
';

_templates['modules/header_bar'] = '<div class="actions">\
	<? if(user.id && !window._in_ext) { ?>\
		<a class="menu" href="#menu" alt="Menu"><icon>&#9881;</icon></a>\
		<div class="menu">\
			<div class="top">\
				<div class="size-container"></div>\
				<? if(config.enable_promo) { ?>\
					<a href="#invite" class="invite">Invite friends to get more storage</a>\
				<? } ?>\
			</div>\
			<ul>\
				<li class="account">\
					<a href="#account" title="Manage your Turtl account">\
						<icon>&#8962;</icon>\
						<span>Account</span>\
					</a>\
				</li>\
				<li class="persona">\
					<a href="#personas" title="Manage your identity">\
						<icon>&#128101;</icon>\
						<span>Personas</span>\
					</a>\
				</li>\
				<li class="invites">\
					<a href="#invites" title="See your invites">\
						<icon>&#128319;</icon>\
						<span>Invites</span>\
					</a>\
				</li>\
				<li class="wipe">\
					<a href="#wipe-data" title="Wipe all local data and log out">\
						<icon>&#128165;</icon>\
						<span>Wipe local data</span>\
					</a>\
				</li>\
				<li class="logout">\
					<a href="/users/logout" title="Sign out (shortcut `shift+L`)">\
						<icon>&#128274;</icon>\
						<span>Logout</span>\
					</a>\
				</li>\
			</ul>\
		</div>\
	<? } ?>\
</div>\
';

_templates['modules/share'] = '<div class="select-persona">\
	<div class="search">\
		<form class="standard-form">\
			<input <? if(tabindex) { ?>tabindex="<?=tabindex?>"<? } ?> type="text" name="email" autocomplete="off" placeholder="Type an email to invite someone to this board">\
			<img class="load" src="<?=img(\'/images/site/icons/load_16x16.gif\')?>" width="16" height="16" alt="WORKING!!!1">\
		</form>\
		<div class="sub"></div>\
	</div>\
</div>\
';

_templates['notes/edit'] = '<?  var action = note.id ? \'Edit\' : \'Add\'; ?>\
<? if(title) { ?>\
	<h1><?=title?></h1>\
<? } else { ?>\
	<h1><?=action?> note</h1>\
<? } ?>\
<div class="note-edit clear">\
	<div class="boards"></div>\
\
	<? if(show_tabs) { ?>\
		<?\
		var showtab = function(name)\
		{\
			var slug = name.toLowerCase();\
			var t = \'<li class="\'+slug;\
			if(note.type == slug) t += \' sel\';\
			t += \'">\'+ name +\'</li>\';\
			return t;\
		};\
		?>\
		<ul class="type clear">\
			<? if(!note.id) { ?>\
				<?=showtab(\'Quick\')?>\
			<? } ?>\
			<?=showtab(\'Text\')?>\
			<?=showtab(\'Link\')?>\
			<?=showtab(\'Image\')?>\
			<!--\
			<li>Embed</li>\
			<li>PDF</li>\
			-->\
		</ul>\
	<? } ?>\
	<form class="standard-form">\
		<div class="tags"></div>\
\
		<div class="do-edit clear">\
			<input type="button" name="preview" value="Preview">\
			<div class="type quick">\
				<textarea tabindex="1" name="quick" rows="8" cols="40" placeholder="Enter a link, text, image URL, etc"></textarea>\
			</div>\
\
			<div class="type url">\
				<input tabindex="1" type="text" name="url" value="<?=(note.url ? note.url.replace(/"/g, \'&quot;\') : \'\')?>" placeholder="http://">\
			</div>\
\
			<div class="type title">\
				<input tabindex="1" type="text" name="title" value="<?=(note.title ? note.title.replace(/"/g, \'&quot;\') : \'\')?>" placeholder="Title">\
			</div>\
\
			<div class="type text">\
				<textarea tabindex="1" name="text" rows="8" cols="40" placeholder="Describe this note"><?=note.text?></textarea>\
			</div>\
\
			<div class="type upload"></div>\
\
			<a href="#" class="markdown-tutorial">Formatting help &raquo;</a>\
		</div>\
\
		<div class="preview clear">\
			<input type="button" name="edit" value="Edit">\
			<div class="html content note-view"></div>\
		</div>\
\
		<span class="clearMe">&nbsp;</span>\
\
		<div class="markdown-tutorial note-view content">\
			<p>\
				Turtl notes use Markdown, a format that\'s easy to read and write\
				and doesn\'t require a clunky editor.\
			</p>\
			<table>\
				<tr>\
					<td># One hash makes a large title</td>\
					<td><h1>One hash makes a large title</h1></td>\
				</tr>\
				<tr>\
					<td>## Two hashes for a smaller header</td>\
					<td><h2>Two hashes for a smaller header</h2></td>\
				</tr>\
				<tr>\
					<td>- dashes<br>- make<br>- bullets</td>\
					<td><ul><li>dashes</li><li>make</li><li>bullets</li></ul></td>\
				</tr>\
				<tr>\
					<td>1. you can make<br>1. numbered bullets<br>1. as well</td>\
					<td><ol><li>you can make</li><li>numbered bullets</li><li>as well</li></ol></td>\
				</tr>\
				<tr>\
					<td>[Making links](https://turtl.it/) is easy!</td>\
					<td><a target="_blank" href="https://turtl.it/">Making links</a> is easy!</td>\
				</tr>\
				<tr>\
					<td>You can also make text __bold__ or *italic*.</td>\
					<td>You can also make text <strong>bold</strong> or <em>italic</em>.</td>\
				</tr>\
				<tr>\
					<td>Here\'s an image: ![Turtl logo](https://turtl.it/images/favicon.png)</td>\
					<td>Here\'s an image: <img src="https://turtl.it/images/favicon.png" alt="Turtl logo"></td>\
				</tr>\
				<tr>\
					<td>&gt; Quote text with a caret</td>\
					<td><blockquote>Quote text with a caret</blockquote></td>\
				</tr>\
				<tr>\
					<td>\
						&nbsp;&nbsp;&nbsp;&nbsp;indent_code_4_spaces() {}<br><br>\
						```<br>\
						or_surround(code.by(\'three backticks\'));<br>\
						```<br><br>\
						You can use backticks for `inline_code()`<br><br>\
					</td>\
					<td>\
						<pre><code>indent_code_4_spaces() {}</code></pre>\
						<pre><code>or_surround(code.by(\'three backticks\'));</code></pre>\
						You can use backticks for <code>inline_code()</code>\
					</td>\
				</tr>\
			</table>\
\
			<span class="markdown-link form-note">Read more about <a href="http://support.mashery.com/docs/customizing_your_portal/Markdown_Cheat_Sheet" target="_blank">markdown</a>.</span>\
			<br><br>\
\
			<p>\
				Turtl now also supports TeX math. Begin and end your equation(s)\
				with <code>$$</code>:\
			</p>\
			<table>\
				<tr>\
					<td>$$ P(E)   = {n \\\\choose k} p^k (1-p)^{ n-k} $$</td>\
					<td><pre class="math">P(E)   = {n \\\\choose k} p^k (1-p)^{ n-k}</pre></td>\
				</tr>\
				<tr>\
					<td>\
						$$<br>\
						\\\\begin{aligned}<br>\
						\\\\dot{x} &amp; = \\\\sigma(y-x) \\\\\\\\<br>\
						\\\\dot{y} &amp; = \\\\rho x - y - xz \\\\\\\\<br>\
						\\\\dot{z} &amp; = -\\\\beta z + xy<br>\
						\\\\end{aligned}<br>\
						$$\
					</td>\
					<td><pre class="math">\\\\begin{aligned}\
\\\\dot{x} & = \\\\sigma(y-x) \\\\\\\\\
\\\\dot{y} & = \\\\rho x - y - xz \\\\\\\\\
\\\\dot{z} & = -\\\\beta z + xy\
\\\\end{aligned}</pre></td>\
				</tr>\
			</table>\
		</div>\
\
		<span class="clearMe"></span>\
\
		<div class="submit">\
			<input tabindex="3" type="submit" value="<?=action?> note">\
		</div>\
		<!--\
		<div class="colors">\
			<span class="tooltip" title="Note color :: Note colors can be used to visually classify your notes. How you do this is up to you!">Color:&nbsp;</span>\
			<? var colors = [\'none\',\'blue\',\'red\',\'green\',\'purple\',\'pink\',\'brown\',\'black\']; ?>\
			<? colors.each(function(c, i) { ?>\
				<? i++; ?>\
				<label for="inp_color_<?=i?>" title="<?=c?>">\
					<span class="color <?=c?>"></span>\
				</label>\
				<input\
					type="radio"\
					id="inp_color_<?=i?>"\
					name="color"\
					value="<?=i?>"\
					<? if(note.color == i) { ?>checked<? } ?>\
					title="<?=c?>">\
				&nbsp;\
			<? }); ?>\
		</div>\
		-->\
	</form>\
</div>\
';

_templates['notes/edit_file'] = 'Attach a file: <input type="file" name="file" placeholder="Attach a file">\
<div class="upload-preview">\
	<? if(file.hash || file.name) { ?>\
		<? if(file.type && file.type.match(/^image/)) { ?>\
			<? if(blob_url) { ?>\
				<img src="<?=blob_url?>">\
			<? } else { ?>\
				Generating preview...\
			<? } ?>\
		<? } else { ?>\
			<?=file.name?>\
		<? } ?>\
	<? } ?>\
</div>\
<a href="#remove-attachment" class="remove">Remove attachment</a>\
';

_templates['notes/edit_tags'] = '<?\
var format_tag = function(tagname, selected)\
{\
var t = \'<li class="\'+view.tagetize(tagname, {escape: true})+\' \'+(selected ? \'sel\': \'\')+\'">\';\
	t += view.tagetize(tagname);\
	t += \'</li>\';\
	return t;\
};\
?>\
<input type="text" tabindex="2" name="tag" placeholder="add, tags, here">\
<input type="button" class="add" value="Add tag">\
<? if(suggested_tags.length == 0 && (!note.tags || note.tags.length == 0)) { ?>\
	<br>\
	<span class="form-note">Tags make your notes easier to find.</span>\
<? } else { ?>\
	<ul class="tags clear">\
		<? suggested_tags.each(function(tagname) { ?>\
			<? var sel = note.tags ? note.tags.filter(function(t) { return view.tagetize(t.name) == view.tagetize(tagname); }).length > 0 : false; ?>\
			<?=format_tag(tagname, sel)?>\
		<? }); ?>\
		<? if(note.tags) { ?>\
			<? note.tags.each(function(tag) { ?>\
				<? if(suggested_tags.contains(view.tagetize(tag.name))) { return; } ?>\
				<?=format_tag(tag.name, true)?>\
			<? }); ?>\
		<? } ?>\
	</ul>\
<? } ?>\
';

_templates['notes/index'] = '<div class="note-actions">\
	<div class="button note add" title="Add a new note to the current board (shortcut `a`)">\
		<span><icon>&#10002;</icon> Add note</span>\
	</div>\
	<?/*\
	<? if(enable_share) { ?>\
		<div class="button muted note share" title="Share this board">\
			<span><icon>&#59196;</icon> Share this board</span>\
		</div>\
	<? } ?>\
	*/?>\
\
	<div class="sort hidden">\
		Sort notes by&nbsp;&nbsp;|&nbsp;\
		<a href="#note-sort-id" class="sel asc">\
			Date added\
			<icon class="asc">&#59232;</icon>\
			<icon class="desc">&#59235;</icon>\
		</a>&nbsp;|&nbsp;\
		<a href="#note-sort-mod">\
			Recently changed\
			<icon class="asc">&#59232;</icon>\
			<icon class="desc">&#59235;</icon>\
		</a>\
	</div>\
\
	<ul class="list-type hidden">\
		<li>\
			<a class="masonry <? if(display_type == \'masonry\') { ?>sel<? } ?>" href="#listing" title="Display notes as an arranged grid">\
				<span>&nbsp;</span>\
			</a>\
		</li>\
		<li>\
			<a class="grid <? if(display_type == \'grid\') { ?>sel<? } ?>" href="#grid" title="Display notes as a boring grid (allows sorting notes)">\
				<span>&nbsp;</span>\
			</a>\
		</li>\
		<!--\
		<li>\
			<a class="list <? if(display_type == \'list\') { ?>sel<? } ?>" href="#listing" title="Display notes as a list">\
				<span>&nbsp;</span>\
			</a>\
		</li>\
		-->\
	</ul>\
</div>\
<ul class="clear note_list list_<?=display_type?>"></ul>\
';

_templates['notes/list/image'] = '<a class="img" href="<?=note.url?>" target="_blank">\
	<img src="<?=note.url?>">\
	<? if(note.title) { ?>\
		<h2><?=note.title?></h2>\
	<? } ?>\
</a>\
';

_templates['notes/list/index'] = '<?\
var color = note.color;\
if(color) color = [\'none\',\'blue\',\'red\',\'green\',\'purple\',\'pink\',\'brown\',\'black\'][parseInt(color)-1];\
?>\
<? if(color) { ?><span class="color <?=color?>"></span><? } ?>\
\
<div class="actions">\
	<a class="open" href="#open" title="Open note (shortcut `enter`)">\
		<icon>&#59212;</icon>\
	</a>\
	<a href="#edit" class="edit" title="Edit note (shortcut `e`)"><icon>&#9998;</icon></a>\
	<a href="#delete" class="delete" title="Delete note (shortcut `delete`)"><icon>&#59177;</icon></a>\
\
	<!--\
	<a class="menu" href="#menu" title="Note menu"><span>Note menu</span></a>\
	<ul class="dropdown">\
		<li></li>\
		<li><a href="#move" class="move" title="Move note to another board (shortcut `m`)"><span>Move note to another board</span></a></li>\
		<li></li>\
	</ul>\
	-->\
</div>\
<?=Template.render(\'notes/note_file\', {\
	has_file: has_file,\
	file_type: file_type,\
	note: note\
})?>\
<div class="gutter content">\
	<? if(!has_file && empty(note.title) && empty(note.url) && empty(note.text) && empty(note.embed)) { ?>\
		<p class="empty">(empty note)</p>\
	<? } else { ?>\
		<?=Template.render(\'notes/list/\'+note.type, {\
			note: note\
		})?>\
	<? } ?>\
</div>\
';

_templates['notes/list/link'] = '<?\
if(!note.url) note.url = \'\';\
\
var link = note.url;\
if(!link.match(/^[\\w]+:\\/\\//)) link = \'http://\' + link;\
var title = note.title;\
if(!title) title = note.url.replace(/^[\\w]+:\\/\\/(www\\.)?/i, \'\').replace(/([?&#])/g, \'$1<span class="break"> </span>\');\
?>\
<h1><a href="<?=link?>" target="_blank"><?=title?></a></h1>\
<? if(note.text && note.text != \'\') { ?>\
	<?=view.note_body(note.text)?>\
<? } ?>\
';

_templates['notes/list/text'] = '<?=view.note_body(note.text)?>\
';

_templates['notes/move'] = '<h1>Move this note to another board</h1>\
<div class="content">\
	<p>\
		To move this note to another board, select one of your boards below.\
	</p>\
</div>\
\
<select name="board">\
	<? boards.each(function(p) { ?>\
		<option value="<?=p.id?>"\
				<? if(note.board_id == p.id) { ?>selected<? } ?> >\
			<?=p.title?>\
		</option>\
	<? }); ?>\
</select>\
';

_templates['notes/note_file'] = '<? if(has_file) { ?>\
	<? var is_image = !note.file.encrypting && note.file.blob_url && note.file.type && note.file.type.match(/^image/); ?>\
	<? console.log(\'note file: \', note.file.blob_url); ?>\
	<div class="note-file <?=(is_image ? \'image\' : \'\')?>">\
		<? if(is_image) { ?>\
			<a href="<?=note.file.blob_url?>" target="_blank"><img src="<?=note.file.blob_url?>"></a>\
		<? } else if(note.file.encrypting) { ?>\
			<div class="attachment"><?=note.file.name?> (encrypting)</div>\
		<? } else if(note.type != \'image\' && note.file.type && note.file.type.match(/^image/)) { ?>\
			<div class="attachment"><?=note.file.name?> (generating preview)</div>\
		<? } else if(note.file && note.type != \'image\') { ?>\
			<a href="#attachment" class="attachment" target="_blank">\
				<img src="<?=img(\'/images/site/icons/files/\'+file_type+\'.png\')?>" width="16" height="16" alt="file">\
				<?=note.file.name?>\
			</a>\
		<? } ?>\
	</div>\
<? } ?>\
';

_templates['notes/view/image'] = '<a class="img clear" href="<?=note.url?>" target="_blank">\
	<img src="<?=note.url?>">\
</a>\
<? if(note.title || note.text || tags != \'\') { ?>\
	<div class="content">\
		<? if(tags != \'\') { ?><?=tags?><? } ?>\
		<? if(note.title) { ?>\
			<h1><?=note.title?></h1>\
		<? } ?>\
		<span class="clearMe"></span>\
		<? if(note.text && note.text != \'\') { ?>\
			<?=view.note_body(note.text)?>\
		<? } ?>\
	</div>\
<? } ?>\
';

_templates['notes/view/index'] = '<?\
var color = note.color;\
if(color) color = [\'none\',\'blue\',\'red\',\'green\',\'purple\',\'pink\',\'brown\',\'black\'][parseInt(color)-1];\
?>\
<? if(color) { ?><span class="color <?=color?>"></span><? } ?>\
\
<div class="actions">\
	<a href="#edit" class="edit" title="Edit note (shortcut `e`)"><icon>&#9998;</icon></a>\
	<a href="#delete" class="delete" title="Delete note (shortcut `delete`)"><icon>&#59177;</icon></a>\
	<!--\
	<a class="menu" href="#menu" title="Note menu"><span>Note menu</span></a>\
	<ul class="dropdown">\
		<li><a href="#edit" class="edit" title="Edit note (shortcut `e`)"><span>Edit note</span></a></li>\
		<li><a href="#move" class="move" title="Move note to another board (shortcut `m`)"><span>Move note to another board</span></a></li>\
		<li><a href="#delete" class="delete" title="Delete note (shortcut `delete`)"><span>Delete note</span></a></li>\
	</ul>\
	-->\
</div>\
<?=Template.render(\'notes/note_file\', {\
	has_file: has_file,\
	file_type: file_type,\
	note: note\
})?>\
<? if(note.type != \'image\') { ?><div class="content clear"><? } ?>\
	<? if(!has_file && empty(note.title) && empty(note.url) && empty(note.text) && empty(note.embed)) { ?>\
		<p class="empty">(empty note)</p>\
	<? } else { ?>\
		<? var tags = Template.render(\'notes/view/tags\', { tags: note.tags }); ?>\
		<?=Template.render(\'notes/view/\'+note.type, {\
			note: note,\
			tags: tags.clean()\
		})?>\
	<? } ?>\
<? if(note.type != \'image\') { ?></div><? } ?>\
';

_templates['notes/view/link'] = '<?\
var link = note.url;\
if(!link.match(/^[\\w]+:\\/\\//)) link = \'http://\' + link;\
var title = note.title;\
if(!title) title = note.url.replace(/^[\\w]+:\\/\\/(www\\.)?/i, \'\');\
?>\
<? if(tags != \'\') { ?><?=tags?><? } ?>\
<h1><a href="<?=link?>" target="_blank"><?=title?></a></h1>\
<? if(note.text && note.text != \'\') { ?>\
	<span class="clearMe"></span>\
	<?=view.note_body(note.text)?>\
<? } ?>\
';

_templates['notes/view/tags'] = '<? if(tags.length > 0) { ?>\
	<div class="note-tags clear">\
		<!--<img src="<?=img(\'/images/site/icons/tag_16x16_black.png\')?>" class="icon" title="tags" width="16" height="16" alt="tags" />-->\
		<ul class="tags clear">\
			<? tags.each(function(t) { ?>\
				<li><span><?=t.name?></span></li>\
			<? }); ?>\
		</ul>\
	</div>\
<? } ?>\
';

_templates['notes/view/text'] = '<? if(tags != \'\') { ?><?=tags?><? } ?>\
<?=view.note_body(note.text)?>\
';

_templates['notifications/index'] = '<!--\
<ul class="switch">\
	<li><a class="notes" href="/" title="Notes"><span>&nbsp;</span></a></li>\
	<li><a class="notifications <? if(is_open) { ?>sel<? } ?>" href="#notifications" title="Notifications"><span>&nbsp;</span></a></li>\
</ul>\
-->\
<div class="notification-list <? if(is_open) { ?>sel<? } ?>">\
	<div class="gutter">\
		<? if(notifications.length > 0) { ?>\
			<ul>\
				<? notifications.each(function(n) { ?>\
					<? if(!n.body.type) { return false }; ?>\
					<li class="clear <?=n.body.type?> notification_<?=n.id?>">\
						<ul class="actions clear">\
							<li><a class="accept" title="Accept invite" href="#accept">&nbsp;</a></li>\
							<li><a class="deny" title="Delete invite" href="#deny">&nbsp;</a></li>\
						</ul>\
						<?=n.subject?>\
					</li>\
				<? }); ?>\
			</ul>\
		<? } else { ?>\
			<p class="none">You have no notifications.</p>\
		<? } ?>\
	</div>\
</div>\
';

_templates['pairing/index'] = '<h1>Pairing</h1>\
<div class="content pairing">\
	<p>\
		Pairing is a one-time process to allow secure communication between the\
		Turtl extension and the Turtl desktop app.\
	</p>\
	<p>\
		Copy the pairing code below and paste it into the extension:\
	</p>\
\
	<pre class="key"><?=public_key?></pre>\
\
	<p class="error">\
		Note: Only pair with applications you trust!\
	</p>\
</div>\
';

_templates['personas/edit'] = '<?\
var action = persona.id ? \'Edit\' : \'Add\';\
?>\
<h1>\
	<!--<? if(was_join) { ?><em>Almost done: </em><? } ?>-->\
	<?=action?> <? if(was_join) { ?>a <? } ?>persona\
	<? if(was_join) { ?>\
		<small>(personas let you share with others)</small>\
	<? } else { ?>\
		<small><a href="#personas">&laquo; Back to your personas</a></small>\
	<? } ?>\
</h1>\
<div class="persona-edit clear">\
	<form class="standard-form">\
		<input tabindex="1" type="text" name="email" value="<?=persona.email?>" placeholder="Your email address">\
		<img class="load" src="<?=img(\'/images/site/icons/load_16x16.gif\')?>" width="16" height="16" alt="WORKING!!!1">\
		<p class="taken">&nbsp;</p>\
\
		<input tabindex="2" type="text" name="name" value="<?=persona.name?>" placeholder="Full name (optional)">\
\
		<span class="clearMe"></span>\
		<div class="submit">\
			<input tabindex="4" type="submit" value="<?=action?> persona">\
			<? if(was_join) { ?><a class="skip" href="#skip">Skip this step &raquo;</a><? } ?>\
		</div>\
	</form>\
	<div class="info content">\
		<p>\
			By default, your Turtl account is private. Personas change this by\
			giving your account a face: a name and an email people can use to\
			find you on Turtl and securely share with you.\
			<a href="http://turtl.it/docs/overview#personas-and-sharing" target="_blank">Read more &raquo;</a>\
		</p>\
	</div>\
</div>\
';

_templates['personas/index'] = '<h1>Your personas</h1>\
<div class="personas">\
	<div class="content">\
		<p>\
			Personas let you give a "face" to your account. By default, your\
			profile is private and your account is hidden. Persona\'s allow you to\
			share your data (and be shared with).\
		</p>\
	</div>\
\
	<? if(num_personas > 0) { ?>\
		<div class="personas-list"></div>\
	<? } ?>\
	<? if(num_personas == 0) { ?>\
		<div class="button add <? if(num_personas > 0) { ?>disabled<? } ?>">\
			<span><icon>&oplus;</icon> Add a persona</span>\
		</div>\
		<div class="content">\
			<p>\
				You don\'t have any personas. <a href="#add-persona" class="add"><strong>Add one</strong></a>\
				to start sharing.\
			</p>\
		</div>\
	<? } ?>\
</div>\
';

_templates['personas/list'] = '<? personas.each(function(p) { ?>\
	<li class="persona_<?=p.id?> clear">\
		<h3><?=p.email?></h3>\
		<small><?=p.name?></small>\
		<? if(p.has_key) { ?>\
			<small class="success">(ECC384)</small>\
		<? } else if(show_edit) { ?>\
			<small><a href="#generate">Generate keypair</a></small>\
		<? } ?>\
		<? if(show_edit) { ?>\
			<ul>\
				<li>\
					<a href="#email" title="Update this persona\'s email/notification settings">\
						<img src="<?=img(\'/images/site/icons/email_16x16_black.png\')?>" width="16" height="16" alt="email">\
					</a>\
				</li>\
				<li>\
					<a href="#edit" title="Edit this persona">\
						<img src="<?=img(\'/images/site/icons/edit_16x16_black.png\')?>" width="16" height="16" alt="edit">\
					</a>\
				</li>\
				<li>\
					<a href="#delete" title="Delete this persona permanently">\
						<img src="<?=img(\'/images/site/icons/delete_16x16_black.png\')?>" width="16" height="16" alt="delete">\
					</a>\
				</li>\
			</ul>\
			<div class="email-settings">\
				<? var settings = p.settings || {}; ?>\
				<h4>Email settings</h4>\
				<table>\
					<tr>\
						<?\
						var email_invite	=	true;\
						var label_id		=	\'email_\'+p.id;\
						var name			=	\'notify_invite\';\
						if(typeof settings[name] != \'undefined\' && settings[name] === 0)\
						{\
							email_invite	=	false;\
						}\
						?>\
						<td>\
							<label for="<?=label_id?>">Notify me when I get a board invitation</label>\
						</td>\
						<td>\
							<input id="<?=label_id?>" type="checkbox" name="<?=name?>" value="1" <? if(email_invite) { ?>checked<? } ?>>\
						</td>\
					</tr>\
				</table>\
			</div>\
		<? } ?>\
	</li>\
<? }); ?>\
';

_templates['tags/index'] = '<!--\
<div class="header">\
	Tags <a href="#tag-help" class="tag-help">(help)</a>\
	<ul class="actions">\
	</ul>\
</div>\
-->\
<div class="filters clear">\
	<input type="text" name="search" placeholder="Search notes" title="Search notes in this board (shortcut `f`)">\
	<a href="#clear-filters" class="clear" title="Reset all search filters (shortcut `x`)">clear filters</a>\
</div>\
\
<ul class="tags"></ul>\
';

_templates['tags/item'] = '<?=tag.name?>\
';

_templates['users/index'] = '<div class="user-main clear">\
	<div class="login-main">\
	</div>\
	<div class="join-main">\
	</div>\
</div>\
';

_templates['users/join'] = '<div class="userform join">\
	<h1>Join Turtl</h1>\
	<form action="/users/join">\
		<input type="text" name="username" placeholder="Username" tabindex="4">\
		<input type="password" name="password" placeholder="Password" tabindex="5">\
		<input type="password" name="confirm" placeholder="Confirm password" tabindex="6">\
		<? if(enable_promo) { ?>\
			<? if(!promo) { ?>\
				<a class="open-promo" href="#open-promo">Have a promo code?</a>\
			<? } ?>\
			<div class="promo <? if(promo) { ?>open<? } ?>">\
				Promo code: <input type="text" name="promo" value="<?=promo?>" placeholder="Promo code" tabindex="7">\
			</div>\
		<? } ?>\
		<div class="content">\
			<p class="error">\
				You must <strong>remember your username/password</strong>.\
			</p>\
			<p>\
				Your password is used not only to log you in, but to decrypt all\
				of your data in Turtl. There is no password recovery feature\
				because even we don\'t have access to the data in your user account\
				(it\'s encrypted with your password).\
			</p>\
			<p>\
				<em>Make sure you keep your username and password in a safe place!</em>\
			</p>\
		</div>\
		<input type="submit" value="Join" tabindex="8">\
	</form>\
</div>\
';

_templates['users/login'] = '<div class="userform login">\
	<h1>Login</h1>\
	<form action="/users/login">\
		<input type="text" name="username" placeholder="Username" tabindex="1">\
		<input type="password" name="password" placeholder="Password" tabindex="2">\
		<input type="submit" value="Login" tabindex="3">\
	</form>\
</div>\
';
