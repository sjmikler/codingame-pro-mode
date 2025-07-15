// popup.js

const DEFAULT_SETTINGS = {
    proLayout: true,
    uploadCode: false,
    syncLocal: true,
    syncOnline: true,
};

document.addEventListener('DOMContentLoaded', () => {
    // Get setting keys directly from the defaults object
    const settingIds = Object.keys(DEFAULT_SETTINGS);
    const checkboxes = {};
    settingIds.forEach(id => {
        checkboxes[id] = document.getElementById(id);
    });

    // 1. Load settings using the defaults object.
    // This automatically applies your defaults if a value isn't found in storage.
    chrome.storage.sync.get(DEFAULT_SETTINGS, (settings) => {
        settingIds.forEach(id => {
            // The logic is now simpler because a boolean value is guaranteed.
            checkboxes[id].checked = settings[id];
        });
    });

    // 2. Listen for changes (this part remains the same).
    settingIds.forEach(id => {
        checkboxes[id].addEventListener('change', (event) => {
            const isChecked = event.target.checked;
            chrome.storage.sync.set({[id]: isChecked});
        });
    });
});