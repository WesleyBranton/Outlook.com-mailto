/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

// Send user selected text to background script
if (window.getSelection()) {
    const selection = window.getSelection().toString().trim();
    browser.runtime.sendMessage({
        code: 'verify',
        message: selection
    });
}