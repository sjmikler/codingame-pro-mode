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

    const consoleBlock = document.querySelector('.console-bloc');
    const rightPanel = document.querySelector('.testcases-actions-container');
    if (!consoleBlock || !rightPanel) return;

    // The rest of the activation logic remains the same
    const unminimizeButton = document.querySelector('.console-bloc .unminimize-button');
    if (unminimizeButton) unminimizeButton.click();
    const consoleHeaderButtons = document.querySelector('.console-bloc .header-buttons');
    if (consoleHeaderButtons) consoleHeaderButtons.style.display = 'none';

    const syncPanelPosition = () => {
        if (!isLayoutActive) return;
        const targetLeft = rightPanel.style.left;
        if (targetLeft && consoleBlock.style.left !== targetLeft) {
            consoleBlock.style.left = targetLeft;
        }
    };

    layoutObserver = new MutationObserver(syncPanelPosition);
    layoutObserver.observe(rightPanel, { attributes: true, attributeFilter: ['style'] });
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
}

function updateEditorCode(code) {
    const eventData = { status: 'updateCode', code: code.replace(/\r\n|\r/g, '\n') };
    const ev = new CustomEvent('ExternalEditorToIDE', { detail: eventData });
    window.document.dispatchEvent(ev);
}

// --- UI ELEMENT CREATION ---
function createUploadCodeButton() {
    const menuContainer = document.querySelector('.menu-entries');
    if (!menuContainer) return;

    const iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="custom-layout-icon" viewBox="0 0 16 16"><path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5z"/><path d="M7.646 1.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1-.708.708L8.5 2.707V11.5a.5.5 0 0 1-1 0V2.707L5.354 4.854a.5.5 0 1 1-.708-.708l3-3z"/></svg>`;
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

    const layoutToggleEntry = menuContainer.querySelector('.custom-layout-entry');
    if (layoutToggleEntry) {
        layoutToggleEntry.insertAdjacentElement('afterend', menuEntryDiv);
    } else {
        menuContainer.appendChild(menuEntryDiv);
    }
}
function createProLayoutToggleButton() {
    const menuContainer = document.querySelector('.menu-entries');
    if (!menuContainer) return;
    const iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" class="custom-layout-icon"><path d="M1 2.5A1.5 1.5 0 0 1 2.5 1h3A1.5 1.5 0 0 1 7 2.5v3A1.5 1.5 0 0 1 5.5 7h-3A1.5 1.5 0 0 1 1 5.5v-3zm8 0A1.5 1.5 0 0 1 10.5 1h3A1.5 1.5 0 0 1 15 2.5v3A1.5 1.5 0 0 1 13.5 7h-3A1.5 1.5 0 0 1 9 5.5v-3zm-8 8A1.5 1.5 0 0 1 2.5 9h3A1.5 1.5 0 0 1 7 10.5v3A1.5 1.5 0 0 1 5.5 15h-3A1.5 1.5 0 0 1 1 13.5v-3zm8 0A1.5 1.5 0 0 1 10.5 9h3a1.5 1.5 0 0 1 1.5 1.5v3a1.5 1.5 0 0 1-1.5 1.5h-3A1.5 1.5 0 0 1 9 13.5v-3z"/></svg>`;
    const menuEntryDiv = document.createElement('div');
    menuEntryDiv.className = 'menu-entry custom-layout-entry';
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
    function updateButtonAppearance() { button.classList.toggle('selected', isLayoutActive); }
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

// --- INITIALIZATION ---
function initialize() {
    // If the button we are about to create already exists, do nothing.
    if (document.querySelector('.custom-layout-entry')) {
        return;
    }

    createProLayoutToggleButton();
    createUploadCodeButton();
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
    }
    // No 'else' is needed. If the menu isn't there, we just do nothing and wait.
};

// Create an observer that calls our handler function.
const observer = new MutationObserver(handleDOMChanges);

// Start observing the entire document for changes.
observer.observe(document.body, {
    childList: true,
    subtree: true
});

