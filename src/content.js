'use strict';

// --- SCRIPT LOGIC ---
let isLayoutActive = localStorage.getItem('isProLayoutActive') !== 'false';
let layoutObserver = null;

/**
 * Activates the custom layout by adding a class to the body.
 * The styles.css file handles the rest.
 */
function activateProLayout() {
    document.body.classList.add('pro-layout-active');

    const statementBlock = document.querySelector('.statement-bloc');
    const consoleBlock = document.querySelector('.console-bloc');
    const actionsBlock = document.querySelector('.testcases-actions-container');
    if (!consoleBlock || !actionsBlock) return;

    const unminimizeButton = document.querySelector('.console-bloc .unminimize-button');
    if (unminimizeButton) unminimizeButton.click();
    const consoleHeaderButtons = document.querySelector('.console-bloc .header-buttons');
    if (consoleHeaderButtons) consoleHeaderButtons.style.display = 'none';

    const syncPanelPosition = () => {
        if (!isLayoutActive) return;
        const targetLeft = actionsBlock.style.left;
        if (targetLeft && consoleBlock.style.left !== targetLeft) {
            consoleBlock.style.left = targetLeft;
        }

        const targetRight = statementBlock.style.right;
        if (targetRight && actionsBlock.style.right !== targetRight) {
            actionsBlock.style.right = targetRight;
        }
    };

    layoutObserver = new MutationObserver(syncPanelPosition);
    layoutObserver.observe(actionsBlock, {attributes: true, attributeFilter: ['style']});
    syncPanelPosition();
}

/**
 * Deactivates the custom layout by removing the class from the body.
 */
function deactivateProLayout() {
    document.body.classList.remove('pro-layout-active');

    if (layoutObserver) {
        layoutObserver.disconnect();
        layoutObserver = null;
    }

    const consoleBlock = document.querySelector('.console-bloc');
    if (consoleBlock) consoleBlock.style.left = '';
    const consoleHeaderButtons = document.querySelector('.console-bloc .header-buttons');
    if (consoleHeaderButtons) consoleHeaderButtons.style.display = '';
    const actionsBlock = document.querySelector('.testcases-actions-container');
    if (actionsBlock) actionsBlock.style.right = '';
}

function updateEditorCode(code) {
    const eventData = {status: 'updateCode', code: code.replace(/\r\n|\r/g, '\n')};
    const ev = new CustomEvent('ExternalEditorToIDE', {detail: eventData});
    window.document.dispatchEvent(ev);
}

// --- UI ELEMENT CREATION ---
function createUploadCodeButton() {
    const menuContainer = document.querySelector('.menu-entries');
    if (!menuContainer) return;

    const iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" class="pro-icon" viewBox="0 0 16 16"><path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5z"/><path d="M7.646 1.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1-.708.708L8.5 2.707V11.5a.5.5 0 0 1-1 0V2.707L5.354 4.854a.5.5 0 1 1-.708-.708l3-3z"/></svg>`;
    const menuEntryDiv = document.createElement('div');
    menuEntryDiv.className = 'menu-entry load-file-entry';
    const button = document.createElement('button');
    button.className = 'menu-entry-inner';
    const iconElement = document.createElement('div');
    iconElement.innerHTML = iconSvg;
    const span = document.createElement('span');
    span.className = 'entry-label';
    span.textContent = 'Upload Code';
    button.appendChild(iconElement.firstChild);
    button.appendChild(span);
    menuEntryDiv.appendChild(button);

    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.style.display = 'none';
    button.onclick = () => fileInput.click();
    fileInput.onchange = (event) => {
        const file = event.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (e) => updateEditorCode(e.target.result);
        reader.readAsText(file);
        event.target.value = '';
    };
    menuEntryDiv.appendChild(fileInput);

    const layoutToggleEntry = menuContainer.querySelector('.menu-entry.settings');
    if (layoutToggleEntry) {
        layoutToggleEntry.insertAdjacentElement('afterend', menuEntryDiv);
    } else {
        menuContainer.appendChild(menuEntryDiv);
    }
}

function createProLayoutToggleButton() {
    const menuContainer = document.querySelector('.menu-entries');
    if (!menuContainer) return;

    const iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 16 16" class="pro-icon"><path d="M1 2.5A1.5 1.5 0 0 1 2.5 1h3A1.5 1.5 0 0 1 7 2.5v3A1.5 1.5 0 0 1 5.5 7h-3A1.5 1.5 0 0 1 1 5.5v-3zm8 0A1.5 1.5 0 0 1 10.5 1h3A1.5 1.5 0 0 1 15 2.5v3A1.5 1.5 0 0 1 13.5 7h-3A1.5 1.5 0 0 1 9 5.5v-3zm-8 8A1.5 1.5 0 0 1 2.5 9h3A1.5 1.5 0 0 1 7 10.5v3A1.5 1.5 0 0 1 5.5 15h-3A1.5 1.5 0 0 1 1 13.5v-3zm8 0A1.5 1.5 0 0 1 10.5 9h3a1.5 1.5 0 0 1 1.5 1.5v3a1.5 1.5 0 0 1-1.5 1.5h-3A1.5 1.5 0 0 1 9 13.5v-3z"/></svg>`;
    const menuEntryDiv = document.createElement('div');
    menuEntryDiv.className = 'menu-entry pro-layout-entry';
    const button = document.createElement('button');
    button.className = 'menu-entry-inner';
    const iconElement = document.createElement('div');
    iconElement.innerHTML = iconSvg;
    const span = document.createElement('span');
    span.className = 'entry-label';
    span.textContent = 'Pro Layout';
    button.appendChild(iconElement.firstChild);
    button.appendChild(span);
    menuEntryDiv.appendChild(button);

    function updateButtonAppearance() {
        button.classList.toggle('selected', isLayoutActive);
    }

    button.onclick = () => {
        isLayoutActive = !isLayoutActive;
        localStorage.setItem('isProLayoutActive', isLayoutActive);
        isLayoutActive ? activateProLayout() : deactivateProLayout();
        updateButtonAppearance();
    };
    const settingsEntry = menuContainer.querySelector('.menu-entry.settings');
    if (settingsEntry) {
        settingsEntry.insertAdjacentElement('afterend', menuEntryDiv);
    } else {
        menuContainer.appendChild(menuEntryDiv);
    }
    updateButtonAppearance();
}


// --- ADDITION FOR FILE SYNC ---

let isSyncing = false;
let observingInterval = null;

// Updates the button's appearance and text based on sync state
function updateSyncButtonUI(isActive) {
    const button = document.querySelector('.sync-file-entry .menu-entry-inner');
    if (!button) return;

    button.classList.toggle('selected', isActive);
    const label = button.querySelector('.entry-label');
    if (label) {
        label.textContent = isActive ? 'Sync Active' : 'Sync Code';
    }
}

// Observes the file for changes and updates the editor
async function observeFile(handle) {
    let lastModified = 0;

    // Immediately update with the initial content
    const initialFile = await handle.getFile();
    lastModified = initialFile.lastModified;
    updateEditorCode(await initialFile.text());

    observingInterval = setInterval(async () => {
        try {
            if ((await handle.queryPermission({mode: 'read'})) !== 'granted') {
                stopSyncProcess(); // Stop if permission is revoked
                return;
            }
            const file = await handle.getFile();
            if (file.lastModified > lastModified) {
                lastModified = file.lastModified;
                updateEditorCode(await file.text());
            }
        } catch (error) {
            console.error("Error observing file, stopping sync.", error);
            stopSyncProcess();
        }
    }, 500);
}

// Starts the sync process
async function startSyncProcess() {
    try {
        const [newHandle] = await window.showOpenFilePicker();
        isSyncing = true;
        updateSyncButtonUI(true);
        observeFile(newHandle);
    } catch (err) {
        if (err.name !== 'AbortError') console.error(err);
    }
}

// Stops the sync process
function stopSyncProcess() {
    if (!isSyncing) return;

    if (observingInterval) {
        clearInterval(observingInterval);
        observingInterval = null;
    }
    isSyncing = false;
    updateSyncButtonUI(false);
}

function fileSystemAccessApiAvailable() {
    return 'showOpenFilePicker' in self  // Check if the File System Access API is available in the current browser
}

function createSyncCodeButton() {
    const menuContainer = document.querySelector('.menu-entries');
    if (!menuContainer) return;

    // A "sync" or "repeat" icon
    const iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" class="pro-icon" viewBox="0 0 16 16"><path d="M11 5.466V4H5a4 4 0 0 0-3.584 5.777.5.5 0 1 1-.832.546A5 5 0 0 1 5 3h6V1.534a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384l-2.36 1.966a.25.25 0 0 1-.41-.192Zm-6 5.068V12h6a4 4 0 0 0 3.585-5.777.5.5 0 1 1 .832-.546A5 5 0 0 1 11 13H5v1.534a.25.25 0 0 1-.41.192l-2.36-1.966a.25.25 0 0 1 0-.384l2.36-1.966a.25.25 0 0 1 .41.192Z"/></svg>`;

    const menuEntryDiv = document.createElement('div');
    menuEntryDiv.className = 'menu-entry sync-file-entry';

    const button = document.createElement('button');
    button.className = 'menu-entry-inner';

    // This is the main toggle logic
    button.onclick = () => {
        if (fileSystemAccessApiAvailable() === false) {
            alert("File System Access API not available. To use this feature, enable:\n\nchrome://flags/#file-system-access-api");
            return;
        }

        if (isSyncing) {
            stopSyncProcess();
        } else {
            startSyncProcess();
        }
    };

    const iconElement = document.createElement('div');
    iconElement.innerHTML = iconSvg;

    const span = document.createElement('span');
    span.className = 'entry-label';
    span.textContent = 'Sync Code';

    button.appendChild(iconElement.firstChild);
    button.appendChild(span);
    menuEntryDiv.appendChild(button);

    const uploadFileEntry = menuContainer.querySelector('.menu-entry.settings');
    if (uploadFileEntry) {
        uploadFileEntry.insertAdjacentElement('afterend', menuEntryDiv);
    } else {
        menuContainer.appendChild(menuEntryDiv);
    }
}

// --- END: ADDITION FOR FILE SYNC ---


// --- INITIALIZATION ---
function initialize() {
    // If the button we are about to create already exists, do nothing.
    if (document.querySelector('.pro-layout-entry')) {
        return;
    }

    // createUploadCodeButton();
    createSyncCodeButton();
    createProLayoutToggleButton();

    if (isLayoutActive) {
        activateProLayout();
    }
}

// This function will be called by the observer on every DOM change.
const handleDOMChanges = () => {
    // Check if the menu exists on the page right now.
    const menuExists = document.querySelector('.menu-entries');

    if (menuExists) {
        // The menu is present, so try to initialize our UI.
        // The guard clause inside initialize() will prevent it from running if it's already there.
        initialize();
    } else if (isSyncing) {  // If the menu is not present and we are syncing, stop the sync process.
        stopSyncProcess();
    }
};

// Create an observer that calls our handler function.
const observer = new MutationObserver(handleDOMChanges);

// Start observing the entire document for changes.
observer.observe(document.body, {
    childList: true, subtree: true
});

