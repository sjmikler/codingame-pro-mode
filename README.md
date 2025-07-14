# CodinGame Pro Layout

[Download from Chrome Web Store](https://chromewebstore.google.com/detail/fleeplnobejocpmlphmbhlnhnimoglpa)

Reclaim your precious screen real estate in CodinGame IDE.

Automatically synchronize your local code with the online editor.

---

If you edit your code locally, instead of using the online code editor, you might notice that the code editor is useless and takes away your precious screen space. This extension introduces **Pro Layout** that hides code editor and adds a larger Console output view.

This extension comes with built-in synchronization functionality:

- **Sync Local**: Edit the code locally and the changes will be reflected online.
- **Sync Online**: Edit the code online and the changes will be reflected locally.

---

## Pro Layout button

Clicking the button has the following effects:

* Hides the code editor
* Moves the 'Console output' to the right
* Moves 'Players' and 'Actions' to the left, under the game visualization

This is a toggle button. Click it again to restore the default layout.

![screenshot](images/screenshot.png)
*Screenshot showing how 'Pro Layout' looks in practice.*

## Code Synchronization

This extension offers code synchronization functionality. No external apps are necessary. You can choose to use only a one-way sync or use both for a two-way sync.

### Browser support

* **Edge**: works out of the box
* **Chrome**: works out of the box
* **Brave**: works if API is enabled

Synchronization requires File System Access API. Some browsers might require a manual activation of it. To manually enable the API, go to: `chrome://flags/#file-system-access-api`. With the API disabled, the extension will still work, but won't offer the Synchronization functionality.

You can read more about File System Access API: https://wicg.github.io/file-system-access.

## Troubleshooting

> Sync Local / Online buttons are greyed out

This means that the extension is not able to access the local file system. Make sure you have enabled File System Access API in your browser settings.
