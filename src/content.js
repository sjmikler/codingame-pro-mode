'use strict';

// --- LOGGING ---
const libName = 'CodinGame Pro Layout';
const styles = 'background: #5c3cd4; color: #fff; padding: 2px 6px; border-radius: 3px;';
const logError = (...args) => {
    console.error(`%c${libName}`, styles, ...args);
};
const log = (...args) => {
    console.log(`%c${libName}`, styles, ...args);
};
// --- LOGGING ---

// --- GLOBAL AND CONSTANTS ---
const isFirefox = navigator.userAgent.toLowerCase().includes('firefox');

let isProLayoutActive = localStorage.getItem('isProLayoutActive') !== 'false';
let proLayoutObserver = null;
let currentCode = '';

let syncLocalActive = false;
let syncLocalInterval = null;
let syncLocalLastModified = 0;

let syncOnlineActive = false;
let syncFileHandle = null;

// A cloud with a DOWN arrow (from your new reference)
const iconDownSvg = `<svg fill="currentColor" viewBox="0 0 24 24" class="pro-icon" xmlns="http://www.w3.org/2000/svg">
    <rect width="24" height="24" opacity="0"/>
    <path d="M17.67 7A6 6 0 0 0 6.33 7a5 5 0 0 0-3.08 8.27A1 1 0 1 0 4.75 14 3 3 0 0 1 7 9h.1a1 1 0 0 0 1-.8 4 4 0 0 1 7.84 0 1 1 0 0 0 1 .8H17a3 3 0 0 1 2.25 5 1 1 0 0 0 .09 1.42 1 1 0 0 0 .66.25 1 1 0 0 0 .75-.34A5 5 0 0 0 17.67 7z"/>
    <path d="M14.31 16.38L13 17.64V12a1 1 0 0 0-2 0v5.59l-1.29-1.3a1 1 0 0 0-1.42 1.42l3 3A1 1 0 0 0 12 21a1 1 0 0 0 .69-.28l3-2.9a1 1 0 1 0-1.38-1.44z"/>
</svg>`;

// A cloud with an UP arrow (arrow path is rotated 180 degrees)
const iconUpSvg = `<svg fill="currentColor" viewBox="0 0 24 24" class="pro-icon" xmlns="http://www.w3.org/2000/svg">
    <rect width="24" height="24" opacity="0"/>
    <path d="M17.67 7A6 6 0 0 0 6.33 7a5 5 0 0 0-3.08 8.27A1 1 0 1 0 4.75 14 3 3 0 0 1 7 9h.1a1 1 0 0 0 1-.8 4 4 0 0 1 7.84 0 1 1 0 0 0 1 .8H17a3 3 0 0 1 2.25 5 1 1 0 0 0 .09 1.42 1 1 0 0 0 .66.25 1 1 0 0 0 .75-.34A5 5 0 0 0 17.67 7z"/>
    <path d="M14.31 16.38L13 17.64V12a1 1 0 0 0-2 0v5.59l-1.29-1.3a1 1 0 0 0-1.42 1.42l3 3A1 1 0 0 0 12 21a1 1 0 0 0 .69-.28l3-2.9a1 1 0 1 0-1.38-1.44z" transform="rotate(180, 12, 16.5)"/>
</svg>`;
// --- GLOBAL AND CONSTANTS ---


// --- HELPER UTILITIES ---
function fileSystemAccessApiAvailable() {
    // Check if the File System Access API is available in the current browser
    return 'showOpenFilePicker' in self && typeof window.showOpenFilePicker === 'function';
}

async function getFileHandle(permission) {
    if (syncFileHandle === null) {
        const [newHandle] = await window.showOpenFilePicker();
        syncFileHandle = newHandle;
    }

    const hasPermission = await verifyPermission(syncFileHandle, permission);
    if (!hasPermission) {
        log("Permission to %s was not granted.", permission);
        return false;
    }
    return true;
}

function maybeClearFileHandle() {
    if (!syncOnlineActive && !syncLocalActive) syncFileHandle = null;
}

/**
 * Verifies and, if necessary, requests write permission for a file handle.
 * @param {FileSystemFileHandle} fileHandle The file handle to check.
 * @param {string} permission The permission to check ('readwrite' or 'read').
 * @returns {Promise<boolean>} True if permission is granted, false otherwise.
 */
async function verifyPermission(fileHandle, permission) {
    const options = {mode: permission};

    // Check if permission is already granted.
    if ((await fileHandle.queryPermission(options)) === 'granted') {
        return true;
    }

    // If not granted, request it.
    if ((await fileHandle.requestPermission(options)) === 'granted') {
        return true;
    }

    // If permission is still not granted, return false.
    logError("Write permission was not granted.");
    return false;
}


function updateTimestampDisplay() {
    let codeTimestamp = document.querySelector(".code-timestamp");
    if (!codeTimestamp) {
        const codeManagement = document.querySelector(".ide-header");
        if (codeManagement) {
            codeTimestamp = document.createElement('div');
            codeTimestamp.className = 'code-timestamp';
            codeManagement.appendChild(codeTimestamp);
            log("Created timestamp display.");
        } else {
            return;
        }
    }

    const start = new Date(Date.now());
    codeTimestamp.textContent = 'Last synchronized: ' + start.toLocaleString();
}

function maybeRemoveTimestamp() {
    let codeTimestamp = document.querySelector(".code-timestamp");
    if (codeTimestamp && !syncOnlineActive && !syncLocalActive) {
        log("Removing timestamp display.");
        codeTimestamp.remove();
    }
}

// --- HELPER UTILITIES ---

// --- PRO LAYOUT FUNCTIONALITY --
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
        if (!isProLayoutActive) return;
        const targetLeft = actionsBlock.style.left;
        if (targetLeft && consoleBlock.style.left !== targetLeft) {
            consoleBlock.style.left = targetLeft;
        }

        const targetRight = statementBlock.style.right;
        if (targetRight && actionsBlock.style.right !== targetRight) {
            actionsBlock.style.right = targetRight;
        }
    };

    proLayoutObserver = new MutationObserver(syncPanelPosition);
    proLayoutObserver.observe(actionsBlock, {attributes: true, attributeFilter: ['style']});
    syncPanelPosition();
}


function deactivateProLayout() {
    document.body.classList.remove('pro-layout-active');

    if (proLayoutObserver) {
        proLayoutObserver.disconnect();
        proLayoutObserver = null;
    }

    const consoleBlock = document.querySelector('.console-bloc');
    if (consoleBlock) consoleBlock.style.left = '';
    const consoleHeaderButtons = document.querySelector('.console-bloc .header-buttons');
    if (consoleHeaderButtons) consoleHeaderButtons.style.display = '';
    const actionsBlock = document.querySelector('.testcases-actions-container');
    if (actionsBlock) actionsBlock.style.right = '';
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
        button.classList.toggle('selected', isProLayoutActive);
    }

    button.onclick = () => {
        isProLayoutActive = !isProLayoutActive;
        localStorage.setItem('isProLayoutActive', isProLayoutActive);
        isProLayoutActive ? activateProLayout() : deactivateProLayout();
        updateButtonAppearance();
    };
    const settingsEntry = menuContainer.querySelector('.menu-entry.settings');
    if (settingsEntry) settingsEntry.insertAdjacentElement('afterend', menuEntryDiv);
    updateButtonAppearance();
}

// --- PRO LAYOUT FUNCTIONALITY ---

// --- SYNC LOCAL FUNCTIONALITY ---
function updateEditorCode(code) {
    if (code) {
        log("Updating editor code.");

        currentCode = code;
        let eventData = {status: 'updateCode', code: code.replace(/\r\n|\r/g, '\n')};

        if (isFirefox) eventData = cloneInto(eventData, window);
        const ev = new CustomEvent('ExternalEditorToIDE', {detail: eventData});
        window.document.dispatchEvent(ev);
        updateTimestampDisplay();
    }
}

// Observes the file for changes and updates the editor
async function observeFileForSyncLocal() {
    // Immediately update with the initial content
    const initialFile = await syncFileHandle.getFile();
    syncLocalLastModified = initialFile.lastModified;
    updateEditorCode(await initialFile.text());

    syncLocalInterval = setInterval(async () => {
        try {
            const hasPermission = await verifyPermission(syncFileHandle, 'read');
            if (!hasPermission) {
                log("Permission to read the file was not granted.");
                stopSyncLocalProcess(); // Stop if permission is revoked
                return;
            }

            const file = await syncFileHandle.getFile();
            if (file.lastModified > syncLocalLastModified) {
                syncLocalLastModified = file.lastModified;
                updateEditorCode(await file.text());
            }
        } catch (error) {
            console.error("Error observing file, stopping sync.", error);
            stopSyncLocalProcess();
        }
    }, 500);
}

// Starts the sync process
async function startSyncLocalProcess() {
    if (syncLocalActive) return;

    try {
        let sucess = await getFileHandle('read');
        if (!sucess) {
            logError("Failed to get file handle for sync.");
            return;
        }

        syncLocalActive = true;
        const button = document.querySelector('.sync-local-entry .menu-entry-inner');
        if (button) button.classList.toggle('selected', true);
        await observeFileForSyncLocal();
    } catch (error) {
        if (error.name === 'AbortError') {
            log("Aborted file picker.");
        } else {
            logError("Failed to start sync process:", error);
        }
        stopSyncLocalProcess();
    }
}

// Stops the sync process
function stopSyncLocalProcess() {
    if (!syncLocalActive) return;

    if (syncLocalInterval) {
        clearInterval(syncLocalInterval);
        syncLocalInterval = null;
    }
    syncLocalActive = false;
    maybeClearFileHandle();
    maybeRemoveTimestamp();

    const button = document.querySelector('.sync-local-entry .menu-entry-inner');
    if (button) button.classList.toggle('selected', false);

}

function oneTimeUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => updateEditorCode(e.target.result);
    reader.readAsText(file);
    event.target.value = '';
}

function createSyncLocalButton() {
    const menuContainer = document.querySelector('.menu-entries');
    if (!menuContainer) return;

    const menuEntryDiv = document.createElement('div');
    menuEntryDiv.className = 'menu-entry sync-local-entry';

    const button = document.createElement('button');
    button.className = 'menu-entry-inner';

    if (fileSystemAccessApiAvailable()) {
        button.onclick = async () => {
            if (syncLocalActive) {
                stopSyncLocalProcess();
            } else {
                await startSyncLocalProcess();
            }
        };
    } else {
        // fallback when FileSystemAccessAPI is not available
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.style.display = 'none';
        button.onclick = () => fileInput.click();
        fileInput.onchange = oneTimeUpload;
        menuEntryDiv.appendChild(fileInput);
    }

    const iconElement = document.createElement('div');
    iconElement.innerHTML = iconUpSvg;

    const span = document.createElement('span');
    span.className = 'entry-label';
    span.textContent = 'Sync Local';

    button.appendChild(iconElement.firstChild);
    button.appendChild(span);
    menuEntryDiv.appendChild(button);

    const settingsEntry = menuContainer.querySelector('.menu-entry.settings');
    if (settingsEntry) settingsEntry.insertAdjacentElement('afterend', menuEntryDiv);
}

// --- SYNC LOCAL FUNCTIONALITY ---

// --- SYNC ONLINE FUNCTIONALITY ---
async function startSyncOnlineProcess() {
    if (syncOnlineActive) return;

    try {
        let success = await getFileHandle('readwrite');
        if (!success) {
            logError("Failed to get file handle for sync.");
            return;
        }

        syncOnlineActive = true;

        { // Enable synchronization
            let eventData = {status: 'synchronized', value: true};
            let ev = new CustomEvent('ExternalEditorToIDE', {detail: eventData});
            window.document.dispatchEvent(ev);
        }

        { // Initial code download
            let eventData = {status: 'getCode'};
            let ev = new CustomEvent('ExternalEditorToIDE', {detail: eventData});
            window.document.dispatchEvent(ev);
        }

        const button = document.querySelector('.sync-online-entry .menu-entry-inner');
        if (button) button.classList.toggle('selected', true);
        log("Sync Online started, your local file will be updated.");

    } catch (error) {
        if (error.name === 'AbortError') {
            log("Aborted file picker.");
        } else {
            logError("Failed to start sync process:", error);
        }
        stopSyncOnlineProcess();
    }
}

function stopSyncOnlineProcess() {
    if (!syncOnlineActive) return;

    // Disable synchronization
    let eventData = {status: 'synchronized', value: false};
    let ev = new CustomEvent('ExternalEditorToIDE', {detail: eventData});
    window.document.dispatchEvent(ev);

    syncOnlineActive = false;
    maybeClearFileHandle();
    maybeRemoveTimestamp();

    const button = document.querySelector('.sync-online-entry .menu-entry-inner');
    if (button) button.classList.toggle('selected', false);
}

async function writeCodeToLocalFile(code) {
    if (!syncFileHandle) {
        logError("No file handle available for writing.");
        stopSyncOnlineProcess();
        return;
    }

    try {
        const writable = await syncFileHandle.createWritable();
        await writable.write(code);
        await writable.close();

        // If the local-to-online sync is also active, update its timestamp
        // to prevent it from immediately re-uploading this change.
        if (syncLocalActive) {
            const file = await syncFileHandle.getFile();
            syncLocalLastModified = file.lastModified;
        }
    } catch (error) {
        logError("Failed write to local file:", error);
        stopSyncOnlineProcess();
    }
}

async function handleSyncOnlineEvents(event) {
    if (!syncOnlineActive) return;

    if (event.detail.code && event.detail.code !== currentCode) {
        const hasPermission = await verifyPermission(syncFileHandle, 'readwrite');
        if (!hasPermission) {
            logError("Write permission was not granted.");
            stopSyncOnlineProcess();
            return;
        }

        currentCode = event.detail.code;
        await writeCodeToLocalFile(event.detail.code);
        log("Code updated in local file.");
        updateTimestampDisplay();
    }
}

function createSyncOnlineButton() {
    const menuContainer = document.querySelector('.menu-entries');
    if (!menuContainer) return;

    const menuEntryDiv = document.createElement('div');
    menuEntryDiv.className = 'menu-entry sync-online-entry';

    const button = document.createElement('button');
    button.className = 'menu-entry-inner';

    if (fileSystemAccessApiAvailable()) {
        window.document.addEventListener('IDEToExternalEditor', handleSyncOnlineEvents);

        button.onclick = async () => {
            if (syncOnlineActive) {
                stopSyncOnlineProcess();
            } else {
                await startSyncOnlineProcess();
            }
        };
    } else {
        button.disabled = true;
    }

    const iconElement = document.createElement('div');
    iconElement.innerHTML = iconDownSvg;

    const span = document.createElement('span');
    span.className = 'entry-label';
    span.textContent = 'Sync Online';

    button.appendChild(iconElement.firstChild);
    button.appendChild(span);
    menuEntryDiv.appendChild(button);
    const settingsEntry = menuContainer.querySelector('.menu-entry.settings');
    if (settingsEntry) settingsEntry.insertAdjacentElement('afterend', menuEntryDiv);
}

// --- SYNC ONLINE FUNCTIONALITY ---

// --- INITIALIZATION ---
function initialize() {
    // If the button we are about to create already exists, do nothing.
    if (document.querySelector('.pro-layout-entry')) {
        return;
    }

    createSyncOnlineButton();
    createSyncLocalButton();
    createProLayoutToggleButton();
    if (isProLayoutActive) activateProLayout();
}

// This function will be called by the observer on every DOM change.
const handleDOMChanges = () => {
    // Check if the menu exists on the page right now.
    const menuExists = document.querySelector('.menu-entries');

    if (menuExists) {
        // The menu is present, so try to initialize our UI.
        // The guard clause inside initialize() will prevent it from running if it's already there.
        initialize();
    } else {
        stopSyncLocalProcess();
        stopSyncOnlineProcess();
    }
};

// Create an observer that calls our handler function.
const observer = new MutationObserver(handleDOMChanges);

// Start observing the entire document for changes.
observer.observe(document.body, {
    childList: true, subtree: true
});

