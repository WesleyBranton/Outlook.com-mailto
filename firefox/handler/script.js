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
    const url = `https://outlook.${mode}.com/mail/deeplink/compose${parameters}`;

    // Set the default Outlook service (if required)
    if (document.getElementById('doNotAsk').checked) {
        browser.storage.local.set({
            'mode': mode
        });
    }

    // Create data loss handler
    chrome.runtime.sendMessage({
        code: 'create-handler',
        msg: [url, parameters]
    });

    // Redirect
    showLoading(true);
    window.location.replace(url);
}

/**
 * Remove loading bar & show choices
 * @param {boolean} show Show loading bar
 */
function showLoading(show) {
    const loading = document.getElementById('loading');
    const choose = document.getElementById('choose');

    loading.classList.remove('hide');
    choose.classList.remove('hide');

    if (show) {
        choose.classList.add('hide');
    } else {
        loading.classList.add('hide');
    }
}

/**
 * Load button click events
 */
window.onload = function() {
    document.getElementById('live').addEventListener('click', () => { redirect('live') });
    document.getElementById('office').addEventListener('click', () => { redirect('office') });
    showLoading(false);
};
