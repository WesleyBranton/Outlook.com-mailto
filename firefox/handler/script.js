/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

/**
 * Load email composition page
 * @param {string} mode Outlook service
 */
function redirect(mode) {
    let parameters = decodeURIComponent(window.location);
    parameters = parameters.slice(parameters.indexOf('?to='), parameters.length);
    let url = `https://outlook.${mode}.com/mail/deeplink/compose${parameters}`;

    // Set the default Outlook service (if required)
    if (!wait) {
        if (document.getElementById('doNotAsk').checked) {
            browser.storage.local.set({
                'mode': mode
            });
        }
    }

    chrome.runtime.sendMessage({
        code: 'create-handler',
        msg: [url, parameters]
    });

    window.location.replace(url);
}

/**
 * Automatically load if user selected 'Do not ask again'
 * @param {Object} info Storage API object
 */
function loaded(info) {
    if (info.mode == 'live' || info.mode == 'office') {
        wait = true;
        redirect(info.mode);
    } else {
        wait = false;
        refreshUI();
    }
}

/**
 * Remove loading bar & show choices
 */
function refreshUI() {
    const loading = document.getElementById('loading');
    const choose = document.getElementById('choose');

    if (loading && choose) {
        loading.className = 'hide';
        choose.className = '';
    }
}

let wait = true;
let data = browser.storage.local.get();
data.then(loaded);

/**
 * Load button click events
 */
window.onload = function() {
    document.getElementById('live').addEventListener('click', () => {
        redirect('live')
    });
    document.getElementById('office').addEventListener('click', () => {
        redirect('office')
    });

    if (!wait) {
        refreshUI();
    }
};
