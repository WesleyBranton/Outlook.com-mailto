/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

// Load settings
function restore(setting) {
	if (setting.mode != 'live' && setting.mode != 'office') {
		document.settings.mode.value = 'ask';
	} else {
		document.settings.mode.value = setting.mode;
	}
}

// Save settings
function save() {
	browser.storage.local.set({
		mode: document.settings.mode.value
	});
}

let data = browser.storage.local.get();
data.then(restore);
document.settings.addEventListener('change', save);