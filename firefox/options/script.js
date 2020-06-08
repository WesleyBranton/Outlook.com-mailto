/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

/**
 * Load settings from Storage API
 * @param {Object} setting Storage API object
 */
function restore(setting) {
    // Load mode setting
    if (setting.mode != 'live' && setting.mode != 'office') {
        document.settings.mode.value = 'ask';
    } else {
        document.settings.mode.value = setting.mode;
    }

    // Load open in new window setting
    if (setting.openInNewWindow && setting.openInNewWindow == true) {
        document.settings.openInNewWindow.value = 'yes';
    } else {
        document.settings.openInNewWindow.value = 'no';
    }
}

/**
 * Save settings to Storage API
 */
function save() {
    browser.storage.local.set({
        mode: document.settings.mode.value,
        openInNewWindow: document.settings.openInNewWindow.value == 'yes'
    });
}

let data = browser.storage.local.get();
data.then(restore);
document.settings.addEventListener('change', save);
