// Load settings
function restore(setting) {
	if (setting.mode != 'live' && setting.mode != 'office') {
		settingMode.value = 'ask';
	} else {
		settingMode.value = setting.mode;
	}
}

// Save settings
function save() {
	browser.storage.local.set({mode: settingMode.value});
}

var settingMode = document.getElementById('mode');
let data = browser.storage.local.get();
data.then(restore);
document.getElementsByTagName("form")[0].addEventListener("change", save);