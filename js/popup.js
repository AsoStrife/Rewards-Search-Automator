import config from './config.js';

chrome.runtime.connect({ name: "popup" });

// Progressbar object
var progressBar = document.querySelector(config.domElements.progressBar);

/* ================================
   STORAGE HELPERS
================================ */

function saveSettings() {
    chrome.storage.sync.set({
        searches: config.searches
    });
}

function loadSavedSettings() {
    chrome.storage.sync.get(['searches'], (data) => {
        if (data.searches) {
            Object.assign(config.searches, data.searches);
        }

        updateInputsFromConfig();
    });
}

/* ================================
   INIT
================================ */

loadSavedSettings();
setDefaultUI();
checkRunningState();

/* ================================
   MESSAGE LISTENER
================================ */

chrome.runtime.onMessage.addListener((message) => {
    if (message.type === 'progress') {
        setProgress(message.progress);
    } else if (message.type === 'phaseChange') {
        console.log(`Phase changed to: ${message.phase}`);
    } else if (message.type === 'complete' || message.type === 'stopped') {
        setProgress(0);
        activateForms();
    }
});

/* ================================
   CHECK RUNNING STATE
================================ */

async function checkRunningState() {
    chrome.runtime.sendMessage({ type: 'getState' }, (response) => {
        if (response && response.isRunning) {
            deactivateForms();
            const progress = parseInt(
                (response.currentSearch / response.totalSearches) * 100
            );
            setProgress(progress);
        }
    });
}

/* ================================
   INPUT HANDLERS (SAVE TO SYNC)
================================ */

$(config.domElements.totDesktopSearchesForm).on('input', function () {
    config.searches.desktop = parseInt(this.value) || 0;
    saveSettings();
});

$(config.domElements.totMobileSearchesForm).on('input', function () {
    config.searches.mobile = parseInt(this.value) || 0;
    saveSettings();
});

$(config.domElements.waitingBetweenSearchesFormMin).on('input', function () {
    config.searches.millisecondsMin = parseInt(this.value) || 0;
    saveSettings();
});

$(config.domElements.waitingBetweenSearchesFormMax).on('input', function () {
    config.searches.millisecondsMax = parseInt(this.value) || 0;
    saveSettings();
});

/* ================================
   BUTTON CLICK HANDLERS
================================ */

$(config.domElements.desktopButton).on("click", () => {
    startSearches('desktop');
});

$(config.domElements.mobileButton).on("click", () => {
    startSearches('mobile');
});

$(config.domElements.desktopMobileButton).on("click", () => {
    startSearches('desktopMobile');
});

/* ================================
   START SEARCHES
================================ */

async function startSearches(searchType) {
    deactivateForms();

    const settings = {
        desktopSearches: parseInt(config.searches.desktop),
        mobileSearches: parseInt(config.searches.mobile),
        millisecondsMin: parseInt(config.searches.millisecondsMin),
        millisecondsMax: parseInt(config.searches.millisecondsMax)
    };

    chrome.runtime.sendMessage(
        {
            type: 'startSearches',
            searchType,
            settings
        },
        (response) => {
            if (!response || !response.success) {
                console.error('Failed to start searches:', response?.error);
                activateForms();
            }
        }
    );
}

/* ================================
   UI HELPERS
================================ */

function setDefaultUI() {
    $(config.domElements.appVersion).html(config.general.appVersion);

    updateInputsFromConfig();

    $(config.domElements.authorWebsiteLink).attr(
        'href',
        config.general.authorWebsiteLinkThanks[0]
    );
    $(config.domElements.repositoryGithubLink).attr(
        'href',
        config.general.repositoryGithubLink
    );
    $(config.domElements.storeLink).attr(
        'href',
        config.general.storeLink
    );
    $(config.domElements.rewardsLink).attr(
        'href',
        config.general.rewardsLink
    );
    $(config.domElements.f1PromoLink).attr(
        'href',
        config.general.authorWebsiteLinkThanks[1]
    );
}

function updateInputsFromConfig() {
    $(config.domElements.totDesktopSearchesForm).val(config.searches.desktop);
    $(config.domElements.totMobileSearchesForm).val(config.searches.mobile);
    $(config.domElements.waitingBetweenSearchesFormMin).val(
        config.searches.millisecondsMin
    );
    $(config.domElements.waitingBetweenSearchesFormMax).val(
        config.searches.millisecondsMax
    );
}

/* ================================
   FORM STATE
================================ */

function deactivateForms() {
    $(config.domElements.desktopButton).prop("disabled", true);
    $(config.domElements.mobileButton).prop("disabled", true);
    $(config.domElements.desktopMobileButton).prop("disabled", true);

    $(config.domElements.totDesktopSearchesForm).prop("disabled", true);
    $(config.domElements.totMobileSearchesForm).prop("disabled", true);
    $(config.domElements.waitingBetweenSearchesFormMin).prop("disabled", true);
    $(config.domElements.waitingBetweenSearchesFormMax).prop("disabled", true);
}

function activateForms() {
    $(config.domElements.desktopButton).prop("disabled", false);
    $(config.domElements.mobileButton).prop("disabled", false);
    $(config.domElements.desktopMobileButton).prop("disabled", false);

    $(config.domElements.totDesktopSearchesForm).prop("disabled", false);
    $(config.domElements.totMobileSearchesForm).prop("disabled", false);
    $(config.domElements.waitingBetweenSearchesFormMin).prop("disabled", false);
    $(config.domElements.waitingBetweenSearchesFormMax).prop("disabled", false);
}

/* ================================
   PROGRESS BAR
================================ */

function setProgress(value) {
    progressBar.style.width = value + "%";
    progressBar.innerText = value + "%";
}
