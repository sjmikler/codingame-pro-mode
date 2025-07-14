# CodinGame Pro Layout

* [Download for Chrome](https://chromewebstore.google.com/detail/fleeplnobejocpmlphmbhlnhnimoglpa)
* [Download for Firefox](https://addons.mozilla.org/en-US/firefox/addon/codingame-pro-layout/) (with limited feature set)

Reclaim your precious screen real estate in CodinGame IDE.

Automatically synchronize your local code with the online editor.

## Pro Layout button

Clicking the button has the following effects:

* Hides the code editor
* Moves the 'Console output' to the right
* Moves 'Players' and 'Actions' to the left, under the game visualization

This is a toggle button. Click it again to restore the default layout.

![screenshot](images/screenshot.png)
*Screenshot showing how 'Pro Layout' looks in practice.*

## Synchronization Functionality

This extension offers code synchronization functionality. No external apps are necessary. You can choose to use only a one-way sync or use both for a two-way sync.

### Browser support

* **Chrome**: works out of the box
* **Edge**: works out of the box
* **Brave**: works if API is enabled via `chrome://flags`
* **Firefox**: won't work

This feature requires File System Access API. Some browsers might an require explicit activation via
[chrome://flags](chrome://flags/#file-system-access-api)

> Without File System Access API the extension will still work, but with limited feature set.
>
> Read more about File System Access API: https://wicg.github.io/file-system-access.

### Sync Local button

After clicking the button, select a local file that will be continuously watched. Edit the code locally and the changes will be reflected online.

### Sync Online button

After clicking the button, select a local file that will be continuously updated. Edit the code online and the changes will be reflected locally.
