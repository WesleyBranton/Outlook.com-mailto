browser.storage.local.set({'lastEmail':''});
let data = browser.storage.local.get();
data.then(verify);

// Verify setting validity
function verify(info) {
	if (info.doNotAsk && info.mode != 'live' && info.mode != 'office') {
		browser.storage.local.set({
			mode: '',
			doNotAsk: false
		});
	}
}