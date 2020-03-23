/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

// Load email composition page
function redirect(mode) {
    var parameters = decodeURIComponent(window.location);
    parameters = parameters.slice(parameters.indexOf('?to='), parameters.length);
    var url = 'https://outlook.' + mode + '.com/mail/deeplink/compose' + parameters;
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

// Automatically load if user selected 'Do not ask again'
function loaded(info) {
    if (info.mode == 'live' || info.mode == 'office') {
        wait = true;
        redirect(info.mode);
    } else {
        wait = false;
        refreshUI();
    }
}

// Refresh UI
function refreshUI() {
    if (document.getElementById('loading') && document.getElementById('choose')) {
        document.getElementById('loading').className = 'hide';
        document.getElementById('choose').className = '';
    }
}

var wait = true;
let data = browser.storage.local.get();
data.then(loaded);

// Load button click events
window.onload = function() {
    document.getElementById('live').addEventListener('click', function() {
        redirect('live')
    });
    document.getElementById('office').addEventListener('click', function() {
        redirect('office')
    });
    if (!wait) {
        refreshUI();
    }
};
