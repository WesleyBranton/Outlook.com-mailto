// Converts Firefox mailto string into standard URL parameters
function createURL() {
	var decodedURL, to, formatURL;
	decodedURL = decodeURIComponent(window.location);
	decodedURL = decodedURL.slice(decodedURL.indexOf("mailto") + 7);
	if (decodedURL.indexOf("?") >= 0) {
		to = decodedURL.slice(0,decodedURL.indexOf("?"));
		decodedURL = decodedURL.slice(decodedURL.indexOf("?") + 1);
		formatURL = "?to=" + to + "&" + decodedURL;
	} else {
		to = decodedURL;
		formatURL = "?to=" + to;
	}
	return formatURL;
}

// Load email composition page
function redirect(mode) {
	var parameters = createURL();
	var url = "https://outlook." + mode + ".com/mail/deeplink/compose" + parameters;
	browser.storage.local.set({'lastEmail': parameters});
	if (document.getElementById('doNotAsk').checked) {
		browser.storage.local.set({'mode': mode});
	}
	window.location.replace(url);
}

// Automatically load if user selected "Do not ask again"
function loaded(info) {
	if (info.mode == 'live' || info.mode == 'office') {
		redirect(info.mode);
	} else {
		document.getElementById('loading').className = 'hide';
		document.getElementById('choose').className = '';
	}
}

let data = browser.storage.local.get();
data.then(loaded);
// Load button click events
window.onload = function(){
	document.getElementById("live").addEventListener("click", function(){redirect('live')});
	document.getElementById("office").addEventListener("click", function(){redirect('office')});
};