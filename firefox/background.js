/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

// Verify setting validity
function verify(info) {
	if (info.mode != 'ask' && info.mode != 'live' && info.mode != 'office') {
		browser.storage.local.set({mode: 'ask'});
	}
}

// Handle tab that will lose parameters
function handleIncomplete(tabId, changeInfo, tabInfo) {
	removeHandlers();
	browser.tabs.update(tabInfo.id,{url:tmpUrl});
	tmpUrl = null;
}

// Handle tab that will not lose parameters
function handleComplete(tabId, changeInfo, tabInfo) {
	removeHandlers();
}

// Remove tab handlers
function removeHandlers() {
	browser.tabs.onUpdated.removeListener(handleIncomplete);
	browser.tabs.onUpdated.removeListener(handleComplete);
}

// Saves message data if the user needs to login
function saveMessage(message) {
	if (message.code == 'create-handler') {
		// Create required handlers
		browser.tabs.onUpdated.addListener(handleIncomplete, filter);
		tmpUrl = message.msg[0];
		var redirect = tmpUrl.slice(0,tmpUrl.indexOf("/compose?to="));
		browser.tabs.onUpdated.addListener(handleComplete, {urls:[redirect + message.msg[1]]});
	}
}

// Opens new tab
async function openTab(requestDetails) {
	var params = await getParameters(requestDetails.url);
	var base = await getBase();
	var link = base + params;
	let tabInfo = await browser.tabs.get(requestDetails.tabId);
	
	// Checks if the link is already in a new tab or if a new tab needs to be created
	if (tabInfo.url == 'about:blank') {
		browser.tabs.update(requestDetails.tabId, {
			url:link
		});
	} else {
		browser.tabs.create({
			index:tabInfo.index + 1,
			url:link
		});
	}
	
	saveMessage({'code':'create-handler','msg':[link,params]})
	return {cancel: true};
}

// Converts Firefox mailto string into standard URL parameters
function getParameters(url) {
	var decodedURL, to, formatURL;
	decodedURL = decodeURIComponent(url);
	decodedURL = decodedURL.slice(decodedURL.indexOf("mailto") + 7);
	if (decodedURL.indexOf("?") >= 0) {
		to = decodedURL.slice(0,decodedURL.indexOf("?"));
		decodedURL = decodedURL.slice(decodedURL.indexOf("?") + 1);
		formatURL = "?to=" + to + "&" + decodedURL;
	} else {
		to = decodedURL;
		formatURL = "?to=" + to;
	}
	return format(formatURL);
}

// Converts all queries to lowercase
function format(url) {
	var output = '';
	var urlParts = url.split('&');
	
	for (i = 0; i < urlParts.length; i++) {
		// Adds the "&" to all but the first query
		if (i > 0) {
			output += '&';
		}
		
		var end = urlParts[i].indexOf('=');
		if (end > 0) {
			var field = urlParts[i].substring(0, end);
			var value = urlParts[i].substring(end);
			output += field.toLowerCase() + value;
		} else {
			output += urlParts[i];
		}
	}
	
	return output;
}

// Determines which Outlook service to go to
async function getBase() {
	var data = await browser.storage.local.get();
	if (data.mode == 'live' || data.mode == 'office') {
		return "https://outlook." + data.mode + ".com/mail/deeplink/compose";
	} else {
		return "/handler/sendmail.html";
	}
}

let data = browser.storage.local.get();
data.then(verify);
var tmpUrl;
const filter = {urls:["*://outlook.live.com/mail/deeplink/compose",
	"*://outlook.office.com/mail/deeplink/compose"]};
chrome.runtime.onMessage.addListener(saveMessage);
browser.webRequest.onBeforeRequest.addListener(openTab,{urls:["*://outlook.send/*"]},["blocking"]);