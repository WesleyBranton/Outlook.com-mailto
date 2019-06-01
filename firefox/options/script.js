// Load settings
function restore(setting) {
	settingMode.value = setting.mode;
	if (setting.doNotAsk) {
		settingDoNotAsk.checked = true;
	}
	refreshUI();
}

// Save settings
function save() {
	browser.storage.local.set({
		mode: settingMode.value,
		doNotAsk: settingDoNotAsk.checked
	});
	refreshUI();
}

// Refresh UI
function refreshUI() {
	if (settingMode.value != 'live' && settingMode.value != 'office') {
		settingDoNotAsk.disabled = true;
	} else {
		settingDoNotAsk.disabled = false;
	}
}

var settingDoNotAsk = document.getElementById('doNotAsk');
var settingMode = document.getElementById('mode');
let data = browser.storage.local.get();
data.then(restore);
document.getElementsByTagName("form")[0].addEventListener("change", save);