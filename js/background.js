// Words list for searches
const words = [
  "Best coffee shops near me",
  "How to learn coding online",
  "Healthy dinner recipes quick",
  "Top travel destinations 2023",
  "Funny cat videos compilation",
  "Learn to play guitar tutorial",
  "Mindfulness meditation techniques",
  "DIY home decor ideas",
  "New sci-fi books 2023",
  "Beginner workout routine at home",
  "Photography tips for beginners",
  "Interesting facts about space",
  "Quick and easy dessert recipes",
  "Upcoming movie releases",
  "Popular podcast series 2023",
  "Natural remedies for headaches",
  "Online language learning platforms",
  "Best budget-friendly gadgets",
  "Funny jokes for a good laugh",
  "Artificial intelligence basics",
  "Vegan lunch ideas for work",
  "Healthy habits for a happy life",
  "DIY garden landscaping ideas",
  "Learn to draw step by step",
  "Effective time management tips",
  "Motivational quotes for success",
  "Popular mobile games 2023",
  "How to start a blog",
  "Mind-bending optical illusions",
  "Home workout equipment reviews",
  "Exciting weekend getaways",
  "Delicious smoothie recipes",
  "Introduction to astrophysics",
  "Best educational YouTube channels",
  "Cute puppy training tips",
  "Interesting historical events",
  "Top 10 TED talks of all time",
  "DIY skincare routine at home",
  "Unique and easy craft ideas",
  "Mediterranean diet meal plan",
  "Must-read classic novels",
  "How to grow your own herbs",
  "Virtual reality gaming experiences",
  "Famous motivational speeches",
  "Tips for better sleep quality",
  "Healthy habits for busy professionals",
  "Learn to play piano online",
  "Delicious vegetarian dinner ideas",
  "Exciting science experiments at home",
  "Popular workout playlists 2023",
];

// Configuration
const config = {
  bing: {
    url: "https://bing.com/search?q={q}&form={form}&cvid={cvid}",
    form: "QBRE",
  },
  devices: {
    phone: {
      title: "Samsung Galaxy S21",
      width: 360,
      height: 800,
      deviceScaleFactor: 3,
      userAgent:
        "Mozilla/5.0 (Linux; Android 13; SM-S908B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Mobile Safari/537.36",
      touch: true,
      mobile: true,
    },
    desktop: {
      title: "Dell Xps 15",
      width: 1920,
      height: 1080,
      deviceScaleFactor: 1,
      userAgent:
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
      touch: false,
      mobile: false,
    },
  },
  general: {
    authorWebsiteLinkThanks:
      "https://andreacorriga.com/rewards-search-automator/thanks",
  },
};

// State management - stored in memory, persisted for alarm callbacks
let searchState = {
  isRunning: false,
  currentSearch: 0,
  totalSearches: 0,
  tabId: null,
  searchType: null, // 'desktop', 'mobile', 'desktopMobile'
  phase: null, // 'desktop', 'mobile'
  millisecondsMin: 8000,
  millisecondsMax: 10000,
  desktopSearches: 3,
  mobileSearches: 3,
};

const ALARM_NAME = "searchAlarm";
const DEFAULT_SETTINGS = {
  desktopSearches: 3,
  mobileSearches: 3,
  millisecondsMin: 8000,
  millisecondsMax: 10000,
};

const EXTERNAL_SETTING_KEYS = Object.keys(DEFAULT_SETTINGS);
const externalCommandTabs = new Set();
let isStartingSearches = false;

// Save state to chrome.storage.local for persistence
async function saveState() {
  await chrome.storage.local.set({ searchState: searchState });
}

// Load state from chrome.storage.local
async function loadState() {
  const result = await chrome.storage.local.get("searchState");
  if (result.searchState) {
    searchState = result.searchState;
  }
}

async function loadSettings() {
  const result = await chrome.storage.local.get("settings");
  return { ...DEFAULT_SETTINGS, ...(result.settings || {}) };
}

function validateSettings(settings) {
  const validated = {};

  for (const key of EXTERNAL_SETTING_KEYS) {
    const value = Number(settings[key]);
    const minimum = key.startsWith("milliseconds") ? 100 : 1;
    if (!Number.isSafeInteger(value) || value < minimum) {
      throw new Error(`Invalid setting: ${key}`);
    }
    validated[key] = value;
  }

  if (validated.millisecondsMax < validated.millisecondsMin) {
    throw new Error("Maximum delay must be greater than or equal to minimum delay");
  }

  return validated;
}

function readExternalSettings(url, currentSettings) {
  const updates = {};
  let hasSettings = false;

  for (const key of EXTERNAL_SETTING_KEYS) {
    if (!url.searchParams.has(key)) continue;
    hasSettings = true;
    const rawValue = url.searchParams.get(key);
    if (!/^\d+$/.test(rawValue || "")) {
      throw new Error(`Invalid value for setting: ${key}`);
    }
    updates[key] = Number(rawValue);
  }

  if (!hasSettings) return null;
  return validateSettings({ ...currentSettings, ...updates });
}

function getExternalCommandUrl(rawUrl) {
  const pageUrl = new URL(rawUrl);
  if (
    pageUrl.protocol !== "https:" ||
    !["bing.com", "www.bing.com"].includes(pageUrl.hostname) ||
    !pageUrl.hash.startsWith("#/")
  ) {
    return null;
  }

  const commandUrl = new URL(pageUrl.hash.slice(1), pageUrl.origin);
  if (!["/config", "/start", "/stop"].includes(commandUrl.pathname)) {
    return null;
  }

  return commandUrl;
}

async function handleExternalCommand(tabId, rawUrl) {
  const url = getExternalCommandUrl(rawUrl);
  if (!url) return;

  try {
    if (url.pathname === "/stop") {
      await stopSearches();
      console.log("External stop command applied");
      return;
    }

    const currentSettings = await loadSettings();
    const updatedSettings = readExternalSettings(url, currentSettings);

    if (url.pathname === "/config") {
      if (!updatedSettings) {
        throw new Error("The config URL must include at least one supported setting");
      }
      await chrome.storage.local.set({ settings: updatedSettings });
      chrome.runtime.sendMessage({
        type: "settingsUpdated",
        settings: updatedSettings,
      }).catch(() => {});
      console.log("External settings applied");
      return;
    }

    const mode = url.searchParams.get("mode");
    const searchType =
      mode === "desktop" || mode === "mobile"
        ? mode
        : mode === "both"
          ? "desktopMobile"
          : null;

    if (!searchType) {
      throw new Error(
        "The start URL must include mode=desktop, mode=mobile, or mode=both",
      );
    }

    const settings = updatedSettings || validateSettings(currentSettings);
    if (updatedSettings) {
      await chrome.storage.local.set({ settings: updatedSettings });
      chrome.runtime.sendMessage({
        type: "settingsUpdated",
        settings: updatedSettings,
      }).catch(() => {});
    }

    const result = await startSearches(searchType, settings, tabId);
    if (!result.success) {
      throw new Error(result.error);
    }
  } catch (error) {
    console.error("Unable to process external command:", error);
  }
}

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === "loading") {
    externalCommandTabs.delete(tabId);
    return;
  }

  if (changeInfo.status !== "complete" && tab.status !== "complete") return;
  const rawUrl = tab.url;
  if (!rawUrl || !getExternalCommandUrl(rawUrl)) {
    externalCommandTabs.delete(tabId);
    return;
  }

  if (externalCommandTabs.has(tabId)) return;
  externalCommandTabs.add(tabId);
  handleExternalCommand(tabId, rawUrl);
});

chrome.tabs.onRemoved.addListener((tabId) => {
  externalCommandTabs.delete(tabId);
});

// Helper functions
function getRandomSearchWord() {
  return words[Math.floor(Math.random() * words.length)];
}

function randomDelay() {
  return Math.floor(
    Math.random() *
      (parseInt(searchState.millisecondsMax) -
        parseInt(searchState.millisecondsMin) +
        1) +
      parseInt(searchState.millisecondsMin),
  );
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function getTabId() {
  return new Promise((resolve, reject) => {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      var activeTab = tabs[0];
      var activeTabId = activeTab.id;
      resolve(activeTabId);
    });
  });
}

// Notify popup about state changes
function notifyPopup(message) {
  chrome.runtime.sendMessage(message).catch(() => {
    // Popup might be closed, ignore error
  });
}

// Enable debugger
async function enableDebugger(tabId) {
  return new Promise((resolve, reject) => {
    chrome.debugger.attach({ tabId }, "1.2", function () {
      console.log(`Debugger enabled for tab: ${tabId}`);
      resolve(true);
    });
  });
}

// Disable debugger
async function disableDebugger(tabId) {
  return new Promise((resolve, reject) => {
    chrome.debugger.detach({ tabId }, function () {
      console.log(`Debugger disabled for tab: ${tabId}`);
      resolve(true);
    });
  });
}

// Activate mobile user agent
async function activeMobileAgent(tabId) {
  return new Promise((resolve, reject) => {
    // First set the user agent override with full mobile hints
    chrome.debugger.sendCommand(
      {
        tabId: tabId,
      },
      "Network.setUserAgentOverride",
      {
        userAgent: config.devices.phone.userAgent,
        acceptLanguage: "en-US,en;q=0.9",
        platform: "Linux armv8l",
        userAgentMetadata: {
          brands: [
            { brand: "Google Chrome", version: "131" },
            { brand: "Chromium", version: "131" },
            { brand: "Not_A Brand", version: "24" },
          ],
          fullVersionList: [
            { brand: "Google Chrome", version: "131.0.0.0" },
            { brand: "Chromium", version: "131.0.0.0" },
            { brand: "Not_A Brand", version: "24.0.0.0" },
          ],
          platform: "Android",
          platformVersion: "13.0.0",
          architecture: "",
          model: "SM-S908B",
          mobile: true,
          bitness: "",
          wow64: false,
        },
      },
      function () {
        // Then set device metrics
        chrome.debugger.sendCommand(
          {
            tabId: tabId,
          },
          "Emulation.setDeviceMetricsOverride",
          {
            width: config.devices.phone.width,
            height: config.devices.phone.height,
            deviceScaleFactor: config.devices.phone.deviceScaleFactor,
            mobile: config.devices.phone.mobile,
            screenWidth: config.devices.phone.width,
            screenHeight: config.devices.phone.height,
            positionX: 0,
            positionY: 0,
            screenOrientation: { type: "portraitPrimary", angle: 0 },
          },
          function () {
            // Enable touch emulation
            chrome.debugger.sendCommand(
              {
                tabId: tabId,
              },
              "Emulation.setTouchEmulationEnabled",
              {
                enabled: true,
                maxTouchPoints: 5,
              },
              function () {
                resolve(true);
              },
            );
          },
        );
      },
    );
  });
}

// Activate desktop user agent
async function activeDesktopAgent(tabId) {
  return new Promise((resolve, reject) => {
    chrome.debugger.sendCommand(
      {
        tabId: tabId,
      },
      "Network.setUserAgentOverride",
      {
        userAgent: config.devices.desktop.userAgent,
        acceptLanguage: "en-US,en;q=0.9",
        platform: "Win32",
        userAgentMetadata: {
          brands: [
            { brand: "Google Chrome", version: "131" },
            { brand: "Chromium", version: "131" },
            { brand: "Not_A Brand", version: "24" },
          ],
          fullVersionList: [
            { brand: "Google Chrome", version: "131.0.0.0" },
            { brand: "Chromium", version: "131.0.0.0" },
            { brand: "Not_A Brand", version: "24.0.0.0" },
          ],
          platform: "Windows",
          platformVersion: "15.0.0",
          architecture: "x86",
          model: "",
          mobile: false,
          bitness: "64",
          wow64: false,
        },
      },
      function () {
        chrome.debugger.sendCommand(
          {
            tabId: tabId,
          },
          "Emulation.setDeviceMetricsOverride",
          {
            width: config.devices.desktop.width,
            height: config.devices.desktop.height,
            deviceScaleFactor: config.devices.desktop.deviceScaleFactor,
            mobile: config.devices.desktop.mobile,
            screenWidth: config.devices.desktop.width,
            screenHeight: config.devices.desktop.height,
          },
          function () {
            // Disable touch emulation
            chrome.debugger.sendCommand(
              {
                tabId: tabId,
              },
              "Emulation.setTouchEmulationEnabled",
              {
                enabled: false,
              },
              function () {
                resolve(true);
              },
            );
          },
        );
      },
    );
  });
}

// Open author website
function openAuthorWebsite() {
  chrome.tabs.update(searchState.tabId, {
    url: config.general.authorWebsiteLinkThanks,
  });
}

// Perform a single search
async function performSingleSearch() {
  if (!searchState.isRunning) return;

  const searchUrl = config.bing.url
    .replace("{q}", encodeURIComponent(getRandomSearchWord()))
    .replace("{form}", config.bing.form)
    .replace("{cvid}", "");

  console.log("Open new search at:", searchUrl);

  try {
    await chrome.tabs.update(searchState.tabId, { url: searchUrl });
  } catch (error) {
    console.error("Error updating tab:", error);
    stopSearches();
    return;
  }

  searchState.currentSearch++;
  const progress = parseInt(
    (searchState.currentSearch / searchState.totalSearches) * 100,
  );

  notifyPopup({
    type: "progress",
    progress: progress,
    currentSearch: searchState.currentSearch,
    totalSearches: searchState.totalSearches,
    phase: searchState.phase,
  });

  if (searchState.currentSearch < searchState.totalSearches) {
    // Schedule next search using chrome.alarms
    await saveState();
    const delayInMinutes = randomDelay() / 60000; // Convert ms to minutes
    chrome.alarms.create(ALARM_NAME, {
      delayInMinutes: Math.max(delayInMinutes, 0.1),
    }); // Min 6 seconds
  } else {
    // Phase completed
    await handlePhaseComplete();
  }
}

// Handle phase completion
async function handlePhaseComplete() {
  if (searchState.searchType === "desktop") {
    // Desktop only completed
    await completeSearches();
  } else if (searchState.searchType === "mobile") {
    // Mobile only completed
    await activeDesktopAgent(searchState.tabId);
    await disableDebugger(searchState.tabId);
    await completeSearches();
  } else if (searchState.searchType === "desktopMobile") {
    if (searchState.phase === "desktop") {
      // Switch to mobile phase
      searchState.phase = "mobile";
      searchState.currentSearch = 0;
      searchState.totalSearches = searchState.mobileSearches;

      await enableDebugger(searchState.tabId);
      await activeMobileAgent(searchState.tabId);

      notifyPopup({
        type: "phaseChange",
        phase: "mobile",
        totalSearches: searchState.totalSearches,
      });

      // Start mobile searches using chrome.alarms
      await saveState();
      const delayInMinutes = randomDelay() / 60000;
      chrome.alarms.create(ALARM_NAME, {
        delayInMinutes: Math.max(delayInMinutes, 0.1),
      });
    } else {
      // Mobile phase completed
      await activeDesktopAgent(searchState.tabId);
      await disableDebugger(searchState.tabId);
      await completeSearches();
    }
  }
}

// Complete all searches
async function completeSearches() {
  searchState.isRunning = false;
  openAuthorWebsite();

  notifyPopup({
    type: "complete",
  });

  // Reset state
  searchState = {
    ...searchState,
    isRunning: false,
    currentSearch: 0,
    totalSearches: 0,
    tabId: null,
    searchType: null,
    phase: null,
  };

  // Clear alarm and saved state
  chrome.alarms.clear(ALARM_NAME);
  await chrome.storage.local.remove("searchState");
}

// Stop searches
async function stopSearches() {
  searchState.isRunning = false;

  notifyPopup({
    type: "stopped",
  });

  // Try to disable debugger if active
  if (
    searchState.tabId &&
    (searchState.searchType === "mobile" ||
      (searchState.searchType === "desktopMobile" &&
        searchState.phase === "mobile"))
  ) {
    disableDebugger(searchState.tabId).catch(() => {});
  }

  searchState = {
    ...searchState,
    isRunning: false,
    currentSearch: 0,
    totalSearches: 0,
    tabId: null,
    searchType: null,
    phase: null,
  };

  // Clear alarm and saved state
  chrome.alarms.clear(ALARM_NAME);
  await chrome.storage.local.remove("searchState");
}

// Start searches
async function startSearches(type, settings, requestedTabId) {
  if (searchState.isRunning || isStartingSearches) {
    return { success: false, error: "Searches already running" };
  }

  try {
    settings = validateSettings(settings);
  } catch (error) {
    return { success: false, error: error.message };
  }

  isStartingSearches = true;
  try {
    const tabId = requestedTabId || (await getTabId());

    searchState = {
      isRunning: true,
      currentSearch: 0,
      totalSearches:
        type === "mobile" ? settings.mobileSearches : settings.desktopSearches,
      tabId: tabId,
      searchType: type,
      phase: type === "mobile" ? "mobile" : "desktop",
      millisecondsMin: settings.millisecondsMin,
      millisecondsMax: settings.millisecondsMax,
      desktopSearches: settings.desktopSearches,
      mobileSearches: settings.mobileSearches,
    };

    // Initialize mobile mode if needed
    if (type === "mobile") {
      await enableDebugger(tabId);
      await activeMobileAgent(tabId);
    }

    // Save state and start the first search
    await saveState();
    performSingleSearch();

    return { success: true };
  } finally {
    isStartingSearches = false;
  }
}

// Alarm listener - this fires even when popup is closed
chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === ALARM_NAME) {
    await loadState();
    if (searchState.isRunning) {
      performSingleSearch();
    }
  }
});

// Restore state on service worker startup
chrome.runtime.onStartup.addListener(async () => {
  await loadState();
  if (searchState.isRunning) {
    // Resume searches
    performSingleSearch();
  }
});

// Also check on install/update
chrome.runtime.onInstalled.addListener(async () => {
  await loadState();
  if (searchState.isRunning) {
    performSingleSearch();
  }
});

// Message listener
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "startSearches") {
    startSearches(message.searchType, message.settings).then((result) => {
      sendResponse(result);
    });
    return true; // Indicates async response
  }

  if (message.type === "saveSettings") {
    try {
      const settings = validateSettings(message.settings);
      chrome.storage.local.set({ settings }).then(() => {
        sendResponse({ success: true, settings });
      });
    } catch (error) {
      sendResponse({ success: false, error: error.message });
    }
    return true;
  }

  if (message.type === "stopSearches") {
    stopSearches().then(() => {
      sendResponse({ success: true });
    });
    return true; // Indicates async response
  }

  if (message.type === "getState") {
    // Load state from storage first to get persisted state
    loadState().then(() => {
      sendResponse({
        isRunning: searchState.isRunning,
        currentSearch: searchState.currentSearch,
        totalSearches: searchState.totalSearches,
        phase: searchState.phase,
        searchType: searchState.searchType,
      });
    });
    return true; // Indicates async response
  }
});

// Close debugger in case is open when popup closes (fallback)
chrome.runtime.onConnect.addListener(async function (port) {
  if (port.name === "popup") {
    port.onDisconnect.addListener(async function () {
      // Only detach debugger if searches are NOT running
      // This allows searches to continue when popup closes
      if (!searchState.isRunning) {
        let tabId = await getTabId();
        chrome.debugger.detach({ tabId }, function () {
          console.log(`Debugger disabled for tab: ${tabId}`);
        });
      }
    });
  }
});
