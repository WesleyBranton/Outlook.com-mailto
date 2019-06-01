// Restore lost parameters
function loaded(info) {
	if (info.lastEmail != '') {
		var url = "https://outlook.live.com/mail/deeplink/compose" + info.lastEmail;//window.location + info.lastEmail;
		window.location.replace(url);
	}
}

let data = browser.storage.local.get();
data.then(loaded);