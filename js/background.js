async function getTabId() {
    return new Promise((resolve, reject) => {
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            var activeTab = tabs[0]
            var activeTabId = activeTab.id
            resolve(activeTabId)
        })
    })
}

// Close debugger in case is open when close popup
chrome.runtime.onConnect.addListener(async function (port) {
    if (port.name === "popup") {
        port.onDisconnect.addListener(async function () {

            let tabId = await getTabId()

            chrome.debugger.detach({ tabId }, function () {
                console.log(`Debugger disables by tab: ${tabId}`);
            })
        })
    }
})
