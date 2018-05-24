var TurtlCore = require('../../node/core');

var res = TurtlCore.init();
if(res !== 0) {
	postMessage({error: true, msg: 'Error initializing core: '+res});
} else {
	while(true) {
		var msg = TurtlCore.recv({block: true});
		if(!msg) continue;
		postMessage(msg);
	}
}

