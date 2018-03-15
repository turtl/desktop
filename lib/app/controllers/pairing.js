var PairingController = Composer.Controller.extend({
	public_key: null,

	init: function()
	{
		this.render();
	},

	render: function()
	{
		var pubkey = sjcl.codec.hex.fromBits(sjcl.codec.base64.toBits(this.public_key));
		var content = [
			'<div class="content pairing">',
			'	<h1>Pairing</h1>',
			'	<p>',
			'		Pairing is a one-time process to allow secure communication between the',
			'		Turtl extension and the Turtl desktop app.',
			'	</p>',
			'	<p>',
			'		Copy the pairing code below and paste it into the extension:',
			'	</p>',
			'	<pre class="key">'+pubkey+'</pre>',
			'	<p class="error">',
			'		Note: Only pair with applications you trust!',
			'	</p>',
			'</div>',
		].join('\n');
		this.html(content);
	}
});

