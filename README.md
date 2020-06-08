# Outlook.com mailto [<img align="right" src=".github/fxaddon.png">](https://addons.mozilla.org/firefox/addon/outlook-com-mailto/)
This browser extension will add the option in the Firefox application settings to set the default email provider for mailto links to Outlook.com. Mailto links on websites will automatically open the Outlook.com interface and prefill the information.

**DISCLAIMER:** This browser extension is unofficial and is not affiliated with Microsoft.

## Development
This repository contains all of the required source code files to make changes to this extension. The "master" branch contains the source code for the latest stable release. If you want to test that version, you can view the release section to download the XPI file or visit the add-on listing on Mozilla.

If you want to make changes to this extension, you are welcome to do so. All files for the extension are located in the "firefox" folder. The source code of upcoming versions (if any) will be located in another branch.

To develop and test the extension, you need to open the "about:debugging" page in Firefox and select "Load Temporary Add-on". Then you can select any file within the "firefox" folder of this repository.

Further documentation about developing Firefox extensions can be found [here](https://developer.mozilla.org/docs/Mozilla/Add-ons/WebExtensions/Your_first_WebExtension).

## Release Notes
### Version 2.4
* **[NEW]** Links can now be opened in a new window
* **[FIXED]** Minor performance improvement

### Version 2.3
* **[FIXED]** Firefox now uses the Outlook icon for the settings
* **[CHANGE]** Overhauled options UI

### Version 2.2.1
* **[FIXED]** Links now work when a website uses uppercase URL query fields

### Version 2.2
* **[FIXED]** Opening link in new tab no longer creates additional blank tab
* **[FIXED]** Created tab always appears next to the original tab

### Version 2.1
* **[FIXED]** Outlook now opens in a new tab
* **[FIXED]** The Outlook selection screen will not load if you have selected "Don't ask again"
* **[FIXED]** Optimized link generation

### Version 2.0
* **[NEW]** Added support for outlook.office.com
* **[FIXED]** Message prefill data is no longer lost at login page
