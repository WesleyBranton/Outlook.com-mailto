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

var parameters = createURL();
var url = "https://outlook.live.com/mail/deeplink/compose" + parameters;