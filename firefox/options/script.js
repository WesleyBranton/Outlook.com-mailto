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

    // Load context menu setting
    if (typeof setting.showContextMenu == 'boolean' && !setting.showContextMenu) {
        document.settings.showContextMenu.value = 'no';
    } else {
        document.settings.showContextMenu.value = 'yes';

        // Check context menu permission
        browser.permissions.contains({
            origins: ['<all_urls>']
        }).then(processContextMenuPermissions);
    }
}

/**
 * Save settings to Storage API
 */
function save() {
    browser.storage.local.set({
        mode: document.settings.mode.value,
        openInNewWindow: document.settings.openInNewWindow.value == 'yes',
        showContextMenu: document.settings.showContextMenu.value == 'yes'
    });

    verifyContextMenuPermissions();
}

/**
 * Requests additional permissions for the context menu feature (if required)
 */
function verifyContextMenuPermissions() {
    const permissions = { origins: ['<all_urls>'] };

    if (document.settings.showContextMenu.value == 'yes') {
        browser.permissions.request(permissions).then(processContextMenuPermissions);
    } else {
        browser.permissions.remove(permissions);
        processContextMenuPermissions(true);
    }
}

/**
 * Handles error messages for missing context menu permissions
 * @param {boolean} success
 */
function processContextMenuPermissions(success) {
    toggleError('contextMenuPermissionMissing', !success);

    const container = document.getElementById('triggerContextMenuPermissionContainer');
    if (success) {
        container.classList.add('hidden');
    } else {
        container.classList.remove('hidden');
    }
}

/**
 * Shows/Hides error messages
 * @param {String} key
 * @param {boolean} show
 */
function toggleError(key, show) {
    const error = document.getElementById('error-' + key);

    if (error) {
        if (show) {
            error.classList.remove('hidden');
        } else {
            error.classList.add('hidden');
        }
    }
}

let data = browser.storage.local.get();
data.then(restore);
document.settings.addEventListener('change', save);
document.getElementById('triggerContextMenuPermission').addEventListener('click', verifyContextMenuPermissions);
