# CodinGame Pro Layout

[Download from Chrome Web Store](https://chromewebstore.google.com/detail/fleeplnobejocpmlphmbhlnhnimoglpa)

Reclaim your precious screen real estate in CodinGame IDE.

Automatically synchronize your local code to the online editor.

## Pro Layout button

Clicking the button has the following effects:

* Hides the code editor
* Moves the 'Console output' to the right
* Moves 'Players' and 'Actions' to the left, under the game visualization

This is a toggle button. Click it again to restore the default layout.

![screenshot](images/screenshot.png)
*Screenshot shows how Pro Layout looks in practice.*

## Sync Code button

After clicking the button, select a single file that will be continuously synchronized with your online editor. No external apps are necessary. With synchronization active, edit your code locally and the changes will be reflected online. **This is a one-way sync**. If you edit the code online, your local code won't be updated.

> This feature requires File System Access API. It is active in Goolge Chrome, but other Chromium browsers might require explicit activation.
>
> `chrome://flags/#file-system-access-api`
