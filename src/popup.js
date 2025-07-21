'use strict';

const DEFAULT_SETTINGS = {
    proLayout: true, uploadCode: false, syncLocal: true, syncOnline: false, consoleSpace: false, zenMode: false,
};

const SETTINGS_DESCRIPTION = {
    proLayout: "Add 'Pro Layout' button to the menu. Allows you to switch between the optimized and default UI.",
    uploadCode: "Add 'Upload Code' button to the menu. Pick a file for a one-time upload of your local code.",
    syncLocal: "Add 'Sync Local' button to the menu. Pick a local file to synchronize it to the online editor.",
    syncOnline: "Add 'Sync Online' button to the menu. Pick a local file that will be overriden by the online editor.",
    consoleSpace: "Adds virtual space at the bottom of the console. It makes for a experience when browsing Console output.",
    zenMode: "Add 'Zen Mode' button to the menu. It hides the header, description and menu. Refresh CG website to restore them.",
}

const FSO_API_AVAILABLE = 'showOpenFilePicker' in self && typeof window.showOpenFilePicker === 'function';

// Function to convert camelCase to readable labels
function camelCaseToLabel(str) {
    return str
        .replace(/([A-Z])/g, ' $1') // Add space before capital letters
        .replace(/^./, str => str.toUpperCase()); // Capitalize first letter
}

// Function to create a switch element
function createSwitch(id, label, isChecked = false) {
    const settingRow = document.createElement('div');
    settingRow.className = 'setting-row';

    const labelElement = document.createElement('label');
    labelElement.setAttribute('for', id);
    labelElement.textContent = label;

    const switchLabel = document.createElement('label');
    switchLabel.className = 'switch';

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.id = id;
    checkbox.checked = isChecked;

    const slider = document.createElement('span');
    slider.className = 'slider';


    switchLabel.appendChild(checkbox);
    switchLabel.appendChild(slider);

    settingRow.appendChild(labelElement);
    settingRow.appendChild(switchLabel);

    const outer_div = document.createElement('div');
    const description = document.createElement('p');
    description.className = 'description';
    description.textContent = SETTINGS_DESCRIPTION[id] || '';
    outer_div.appendChild(settingRow);
    outer_div.appendChild(description);

    return outer_div;
}

document.addEventListener('DOMContentLoaded', () => {
    const settingsContainer = document.getElementById('settings-container');
    const settingIds = Object.keys(DEFAULT_SETTINGS);
    const checkboxes = {};

    // Load settings from storage
    chrome.storage.sync.get(DEFAULT_SETTINGS, (settings) => {
        // Create switches dynamically
        settingIds.forEach(id => {
            const label = camelCaseToLabel(id);
            const isChecked = settings[id];

            // Create and append the switch
            const switchElement = createSwitch(id, label, isChecked);
            settingsContainer.appendChild(switchElement);

            // Store reference to the checkbox
            checkboxes[id] = document.getElementById(id);
        });

        // Add event listeners after elements are created
        settingIds.forEach(id => {
            checkboxes[id].addEventListener('change', (event) => {
                const isChecked = event.target.checked;
                chrome.storage.sync.set({[id]: isChecked});
            });
        });
    });
});

if (!FSO_API_AVAILABLE) {
    const container = document.getElementById('container');
    if (container) {
        const message = document.createElement('a');
        message.href = 'https://github.com/sjmikler/codingame-pro-mode?tab=readme-ov-file#troubleshooting';
        message.textContent = 'FileSystemAccessAPI disabled. Synchronization will not work.';
        message.style.color = 'red';
        container.appendChild(message);
    }
}