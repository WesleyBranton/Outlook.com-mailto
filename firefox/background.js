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
    if (message.code == 'create-handler') {
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
    const params = await getParameters(requestDetails.url);
    const base = await getBase();
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
    decodedURL = decodedURL.slice(decodedURL.indexOf('mailto') + 7);

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
    if (mode == 'live' || mode == 'office') {
        return `https://outlook.${mode}.com/mail/deeplink/compose`;
    } else {
        return '/handler/sendmail.html';
    }
}

let tmpUrl;
let openInNewWindow = false;
let mode = 'ask';
const filter = {
    urls: [
        '*://outlook.live.com/mail/deeplink/compose',
        '*://outlook.office.com/mail/deeplink/compose'
    ]
};
let data = browser.storage.local.get();
data.then(verify);

chrome.runtime.onMessage.addListener(saveMessage);
browser.storage.onChanged.addListener(updatePrefs);
browser.webRequest.onBeforeRequest.addListener(openTab, {
    urls: ['*://outlook.com/send*']
}, ['blocking']);
