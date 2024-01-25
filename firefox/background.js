/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

/**
 * Verify validity of settings in Storage API
 * @param {Object} info Storage API object
 */
function verify(info) {
    // Check that mode setting is valid
    if (info.mode != 'ask' && info.mode != 'live' && info.mode != 'office') {
        browser.storage.local.set({
            mode: 'ask'
        });
    } else {
        mode = info.mode;
    }

    // Check that open in new window setting is valid
    if (info.openInNewWindow) {
        openInNewWindow = true;
    }

    // Check that context menu setting is valid
    if (typeof info.showContextMenu == 'boolean') {
        showContextMenu = info.showContextMenu;
    }
}

/**
 * Update settings variables to match Storage API
 * @param {Object} changes List of changes
 * @param {string} area Storage area changed
 */
function updatePrefs(changes, area) {
    if (changes.mode) {
        mode = changes.mode.newValue;
    }

    if (changes.openInNewWindow) {
        openInNewWindow = changes.openInNewWindow.newValue;
    }

    if (changes.showContextMenu) {
        showContextMenu = changes.showContextMenu.newValue;
    }
}

/**
 * Handle tabs that will lose parameters
 * @param {int} tabId Tab ID
 * @param {Object} changeInfo List of property changes
 * @param {Object} tabInfo Tab information
 */
function handleIncomplete(tabId, changeInfo, tabInfo) {
    removeHandlers();
    browser.tabs.update(tabInfo.id, {
        url: tmpUrl
    });
    tmpUrl = null;
}

/**
 * Handle tabs that will not lose parameters
 * @param {int} tabId Tab ID
 * @param {Object} changeInfo List of property changes
 * @param {Object} tabInfo Tab information
 */
function handleComplete(tabId, changeInfo, tabInfo) {
    removeHandlers();
}

/**
 * Remove tab handlers
 */
function removeHandlers() {
    browser.tabs.onUpdated.removeListener(handleIncomplete);
    browser.tabs.onUpdated.removeListener(handleComplete);
}

/**
 * Save message data if the user needs to login
 * @param {Object} message Message from handler.js
 */
function saveMessage(message) {
    if (message.code == 'verify') {
        toggleContextButton(message.message);
    } else if (message.code == 'create-handler') {
        // Create required handlers
        browser.tabs.onUpdated.addListener(handleIncomplete, filter);
        tmpUrl = message.msg[0];
        const redirect = tmpUrl.slice(0, tmpUrl.indexOf('/compose?to='));
        browser.tabs.onUpdated.addListener(handleComplete, {
            urls: [redirect + message.msg[1]]
        });
    }
}

/**
 * Open new tab
 * @async
 * @param {Object} requestDetails Information about request
 * @returns {Object} Request cancel signal
 */
async function openTab(requestDetails) {
    const params = getParameters(requestDetails.url);
    const base = getBase();
    const link = base + params;
    const tabInfo = await browser.tabs.get(requestDetails.tabId);
    let tab;

    // Checks if the link is already in a new tab or if a new tab needs to be created
    if (tabInfo.url == 'about:blank') {
        tab = await browser.tabs.update(requestDetails.tabId, {
            url: link
        });
    } else {
         tab = await browser.tabs.create({
            index: tabInfo.index + 1,
            url: link,
            active: !openInNewWindow
        });
    }

    // Open email in new window, if user settings prefer that
    if (openInNewWindow) {
        browser.windows.create({
            tabId: tab.id
        });
    }

    // Save message data
    saveMessage({
        code: 'create-handler',
        msg: [link, params]
    });

    return {
        cancel: true
    };
}

/**
 * Convert Firefox mailto string to standard URL parameters
 * @param {string} url Firefox URL
 * @returns {string} Standardized URL
 */
function getParameters(url) {
    let decodedURL, to;

    // Remove "mailto" from URL
    decodedURL = decodeURIComponent(url);
    decodedURL = decodedURL.slice(decodedURL.indexOf('mailto'));

    // Handle additional parameters (if any)
    if (decodedURL.indexOf('?') >= 0) {
        to = decodedURL.slice(0, decodedURL.indexOf('?'));
        decodedURL = decodedURL.slice(decodedURL.indexOf('?') + 1);
        decodedURL = to + '&' + decodedURL;
    }

    decodedURL = '?to=' + decodedURL;

    return format(decodedURL);
}

/**
 * Convert all URL queries to lowercase
 * @param {string} url Original URL
 * @returns {string} Formatted URL
 */
function format(url) {
    let output = '';
    const urlParts = url.split('&');

    for (i = 0; i < urlParts.length; i++) {
        // Adds the '&' to all but the first query
        if (i > 0) {
            output += '&';
        }

        // Convert field to lowercase
        const end = urlParts[i].indexOf('=');
        if (end > 0) {
            const field = urlParts[i].substring(0, end);
            const value = urlParts[i].substring(end);
            output += field.toLowerCase() + value;
        } else {
            output += urlParts[i];
        }
    }

    return output;
}

/** Determine which Outlook service to use
 * @returns {string} Outlook URL
 */
function getBase() {
    if (mode == 'live') {
        return `https://outlook.live.com/mail/compose`;
    } else if (mode == 'office') {
        return `https://outlook.office.com/mail/deeplink/compose`;
    } else {
        return '/handler/sendmail.html';
    }
}

/**
 * Handles installation and update of extension
 * @param {Object} details 
 */
function handleInstalled(details) {
    if (details.reason == 'update') {
        const previousVersion = parseFloat(details.previousVersion);
        if (previousVersion < 2.5) {
            browser.tabs.create({ url: `${webBase}/update/v2_5` });
        }
    }
}

/**
 * Handle context menu open
 * @param {Object} info Context menu info
 * @param {Object} tab Selected tab
 */
function contextMenuShown(info, tab) {
    if (info.contexts.includes('selection')) {
        if (showContextMenu && hasPermission('<all_urls>', permissionType.ORIGINS)) {
            browser.tabs.executeScript(tab.id, {
                file: 'contextMenu.js'
            });
        } else {
            contextMenuClear();
            toggleContextButton(null);
        }
    }
}

/**
 * Handle context menu close
 */
 function contextMenuClear() {
    selectedEmail = null;
}

/**
 * Handle context menu click
 * @param {Object} info Context menu info
 * @param {Object} tab Selected tab
 */
 function contextMenuClicked(info, tab) {
    if (info.menuItemId == 'outlook-mailto-send' && selectedEmail != null) {
        browser.tabs.create({
            index: tab.index + 1,
            url: 'mailto:' + selectedEmail
        });
    }
}

/**
 * Toggle context menu button (show if user has valid email selected)
 * @async
 * @param {String} selection User selected text
 */
async function toggleContextButton(selection) {
    const valid = emailPattern.test(selection);
    selectedEmail = (valid) ? selection : null;

    await browser.menus.update('outlook-mailto-send', {
        title: (valid) ? browser.i18n.getMessage('sendEmailTo', selection) : browser.i18n.getMessage('sendEmail'),
        visible: valid
    });
    browser.menus.refresh();
}

/**
 * Cache the list of granted permissions in the background.js file
 * allowing for quicker access
 */
async function updatePermissionsCache() {
    permissions = await browser.permissions.getAll();
}

/**
 * Checks if add-on has a specific permission
 * @param {String} permission
 * @param {String} type
 * @returns Granted
 */
function hasPermission(permission, type) {
    return permissions[type].includes(permission);
}

/**
 * Set up uninstall page
 */
function setUninstallPage() {
    getSystemDetails((details) => {
        browser.runtime.setUninstallURL(`${webBase}/uninstall/?browser=${details.browser}&os=${details.os}&version=${details.version}`);
    });
}

/**
 * Send system details to callback
 * @param {Function} callback
 */
function getSystemDetails(callback) {
    browser.runtime.getPlatformInfo((platform) => {
        callback({
            browser: 'firefox',
            version: browser.runtime.getManifest().version,
            os: platform.os
        });
    });
}

const permissionType = {
    ORIGINS: 'origins',
    PERMISSIONS: 'permissions'
}
const webBase = 'https://addons.wesleybranton.com/addon/outlook-mailto';
let tmpUrl, permissions;
let openInNewWindow = false;
let showContextMenu = true;
let mode = 'ask';
let selectedEmail = null;
const emailPattern = /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/;
const filter = {
    urls: [
        '*://outlook.live.com/mail/deeplink/compose',
        '*://outlook.office.com/mail/deeplink/compose'
    ]
};
let data = browser.storage.local.get();
data.then(verify);
updatePermissionsCache();
setUninstallPage();

browser.runtime.onInstalled.addListener(handleInstalled);
browser.runtime.onMessage.addListener(saveMessage);
browser.storage.onChanged.addListener(updatePrefs);
browser.webRequest.onBeforeRequest.addListener(openTab, {
    urls: ['*://outlook.com/send*']
}, ['blocking']);

browser.menus.create({
    id: 'outlook-mailto-send',
    contexts: ['selection'],
    title: 'Send email',
    type: 'normal',
    visible: false
});
browser.menus.onShown.addListener(contextMenuShown);
browser.menus.onClicked.addListener(contextMenuClicked);
browser.menus.onHidden.addListener(contextMenuClear);
browser.permissions.onRemoved.addListener(updatePermissionsCache);
browser.permissions.onAdded.addListener(updatePermissionsCache);
