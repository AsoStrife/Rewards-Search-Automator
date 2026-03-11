import config from "./config.js";

chrome.runtime.connect({ name: "popup" });

// Progressbar object
var progressBar = document.querySelector(config.domElements.progressBar);

setDefaultUI();
checkRunningState();

// Listen for messages from background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "progress") {
    setProgress(message.progress);
  } else if (message.type === "phaseChange") {
    console.log(`Phase changed to: ${message.phase}`);
  } else if (message.type === "complete") {
    setProgress(0);
    activateForms();
  } else if (message.type === "stopped") {
    setProgress(0);
    activateForms();
  }
});

// Check if searches are already running when popup opens
async function checkRunningState() {
  chrome.runtime.sendMessage({ type: "getState" }, (response) => {
    if (response && response.isRunning) {
      deactivateForms();
      const progress = parseInt(
        (response.currentSearch / response.totalSearches) * 100,
      );
      setProgress(progress);
    }
  });
}

$(config.domElements.totDesktopSearchesForm).on("change", function () {
  config.searches.desktop = $(config.domElements.totDesktopSearchesForm).val();
  localStorage.setItem("desktopSearches", config.searches.desktop);
});

$(config.domElements.totMobileSearchesForm).on("change", function () {
  config.searches.mobile = $(config.domElements.totMobileSearchesForm).val();
  localStorage.setItem("mobileSearches", config.searches.mobile);
});

$(config.domElements.waitingBetweenSearchesFormMin).on("change", function () {
  config.searches.millisecondsMin = $(
    config.domElements.waitingBetweenSearchesFormMin,
  ).val();
  localStorage.setItem("millisecondsMin", config.searches.millisecondsMin);
});

$(config.domElements.waitingBetweenSearchesFormMax).on("change", function () {
  config.searches.millisecondsMax = $(
    config.domElements.waitingBetweenSearchesFormMax,
  ).val();
  localStorage.setItem("millisecondsMax", config.searches.millisecondsMax);
});

// Start search desktop
$(config.domElements.desktopButton).on("click", async () => {
  startSearches("desktop");
});

// Start search mobile
$(config.domElements.mobileButton).on("click", async () => {
  startSearches("mobile");
});

// Start search desktop&mobile
$(config.domElements.desktopMobileButton).on("click", async () => {
  startSearches("desktopMobile");
});

// Stop searches
$(config.domElements.stopButton).on("click", async () => {
  chrome.runtime.sendMessage({ type: "stopSearches" }, (response) => {
    if (response && response.success) {
      console.log("Searches stopped successfully");
    }
  });
});

/**
 * Start searches via background script
 */
async function startSearches(searchType) {
  deactivateForms();

  const settings = {
    desktopSearches: parseInt(config.searches.desktop),
    mobileSearches: parseInt(config.searches.mobile),
    millisecondsMin: parseInt(config.searches.millisecondsMin),
    millisecondsMax: parseInt(config.searches.millisecondsMax),
  };

  chrome.runtime.sendMessage(
    {
      type: "startSearches",
      searchType: searchType,
      settings: settings,
    },
    (response) => {
      if (!response || !response.success) {
        console.error("Failed to start searches:", response?.error);
        activateForms();
      }
    },
  );
}

/**
 * Set links on bottom navbar and forms
 */
function setDefaultUI() {
  // Set the app version number
  $(config.domElements.appVersion).html(config.general.appVersion);

  // Load saved values from localStorage or use defaults
  config.searches.desktop =
    localStorage.getItem("desktopSearches") || config.searches.desktop;
  config.searches.mobile =
    localStorage.getItem("mobileSearches") || config.searches.mobile;
  config.searches.millisecondsMin =
    localStorage.getItem("millisecondsMin") || config.searches.millisecondsMin;
  config.searches.millisecondsMax =
    localStorage.getItem("millisecondsMax") || config.searches.millisecondsMax;

  // Set numberOfSearches default values inside the input
  $(config.domElements.totDesktopSearchesForm).val(config.searches.desktop);
  $(config.domElements.totMobileSearchesForm).val(config.searches.mobile);
  $(config.domElements.waitingBetweenSearchesFormMin).val(
    config.searches.millisecondsMin,
  );
  $(config.domElements.waitingBetweenSearchesFormMax).val(
    config.searches.millisecondsMax,
  );

  $(config.domElements.authorWebsiteLink).attr(
    "href",
    config.general.authorWebsiteLinkThanks[0],
  );
  $(config.domElements.repositoryGithubLink).attr(
    "href",
    config.general.repositoryGithubLink,
  );
  $(config.domElements.storeLink).attr("href", config.general.storeLink);
  $(config.domElements.rewardsLink).attr("href", config.general.rewardsLink);
  $(config.domElements.f1PromoLink).attr(
    "href",
    config.general.authorWebsiteLinkThanks[1],
  );
}

/**
 * Deactivate Make search button
 * and Number of Search form
 */
function deactivateForms() {
  $(config.domElements.desktopButton).prop("disabled", true).hide();
  $(config.domElements.mobileButton).prop("disabled", true).hide();
  $(config.domElements.desktopMobileButton).prop("disabled", true).hide();
  $(config.domElements.totDesktopSearchesForm).prop("disabled", true);
  $(config.domElements.totMobileSearchesForm).prop("disabled", true);
  $(config.domElements.waitingBetweenSearchesFormMin).prop("disabled", true);
  $(config.domElements.waitingBetweenSearchesFormMax).prop("disabled", true);
  $(config.domElements.stopButtonContainer).show();
}

/**
 * Activate Make search button
 * and Number of Search form
 */
function activateForms() {
  $(config.domElements.desktopButton).prop("disabled", false).show();
  $(config.domElements.mobileButton).prop("disabled", false).show();
  $(config.domElements.desktopMobileButton).prop("disabled", false).show();
  $(config.domElements.totDesktopSearchesForm).prop("disabled", false);
  $(config.domElements.totMobileSearchesForm).prop("disabled", false);
  $(config.domElements.waitingBetweenSearchesFormMin).prop("disabled", false);
  $(config.domElements.waitingBetweenSearchesFormMax).prop("disabled", false);
  $(config.domElements.stopButtonContainer).hide();
}

/**
 * Update progressbar value
 * @param {*} value
 */
function setProgress(value) {
  progressBar.style.width = value + "%";
  progressBar.innerText = value + "%";
}
