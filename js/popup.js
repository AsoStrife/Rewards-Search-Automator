import words from '../data/words.js'
import config from './config.js' 

chrome.runtime.connect({ name: "popup" })

// Await time between searches
const timer = ms => new Promise(res => setTimeout(res, ms))

// Progressbar object
var progressBar = document.querySelector(config.domElements.progressBar)
var tabId

setDefaultUI() 

// When change the value inside the input
$(config.domElements.totDesktopSearchesForm).on('change', function () {
    config.searches.desktop = $(config.domElements.totDesktopSearchesForm).val()
})

$(config.domElements.totMobileSearchesForm).on('change', function () {
    config.searches.mobile = $(config.domElements.totMobileSearchesForm).val()
})

$(config.domElements.waitingBetweenSearchesForm).on('change', function () {
    config.searches.milliseconds = $(config.domElements.waitingBetweenSearchesForm).val()
})

// Start search desktop
$(config.domElements.desktopButton).on("click", async () => {
    tabId = await getTabId()
    
    await disableDebugger()

    doSearchesDesktop()
})

// Start search mobile
$(config.domElements.mobileButton).on('click', async () => {
    tabId = await getTabId()

    await handleMobileMode(tabId)
})

function setDefaultUI() {
    // Set the app version number 
    $(config.domElements.appVersion).html(config.general.appVersion)

    // Set numberOfSearches default values inside the input
    $(config.domElements.totDesktopSearchesForm).val(config.searches.desktop)
    $(config.domElements.totMobileSearchesForm).val(config.searches.mobile)
    $(config.domElements.waitingBetweenSearchesForm).val(config.searches.milliseconds)


    $(config.domElements.authorWebsiteLink).attr('href', config.general.authorWebsiteLink)
    $(config.domElements.repositoryGithubLink).attr('href', config.general.repositoryGithubLink)
    $(config.domElements.storeLink).attr('href', config.general.storeLink)
    $(config.domElements.rewardsLink).attr('href', config.general.rewardsLink)
}

/**
 * Perform random searches on Bing
 */
async function doSearchesDesktop() {

    deactivateForms()

    for (var i = 0; i < config.searches.desktop; i++) {

        let randomNumber = Math.floor(Math.random() * words.length)

        chrome.tabs.update({
            url: config.bing.url.replace("{q}", words[randomNumber]).replace("{form}", config.bing.form)
        })

        setProgress( parseInt( ( (i + 1) / config.searches.desktop) * 100) )
        
        await timer(config.searches.milliseconds)
    }

    openAndreaCorriga()
    
    setProgress(0)
    activateForms()
} 

/**
 * Perform random searches Mobile on Bing
 */
async function doSearchesMobile() {

    deactivateForms()

    for (var i = 0; i < config.searches.mobile; i++) {

        let randomNumber = Math.floor(Math.random() * words.length)

        chrome.tabs.update({
            url: config.bing.url.replace("{q}", words[randomNumber]).replace("{form}", config.bing.form)
        })

        setProgress( parseInt( ( (i + 1) / config.searches.mobile) * 100) )
        
        await timer(config.searches.milliseconds)
    }

    setProgress(0)
    activateForms()
} 

function openAndreaCorriga() {
    chrome.tabs.update({
        url: config.general.authorWebsiteLink
    })
}

/**
 * Deactivate Make search button 
 * and Number of Search form
 */
function deactivateForms() {
    $(config.domElements.desktopButton).prop("disabled", true)
    $(config.domElements.mobileButton).prop("disabled", true)
    $(config.domElements.totDesktopSearchesForm).prop("disabled", true)
    $(config.domElements.totMobileSearchesForm).prop("disabled", true)
    $(config.domElements.waitingBetweenSearchesForm).prop("disabled", true)
}

/**
 * Activate Make search button 
 * and Number of Search form
 */
function activateForms() {
    $(config.domElements.desktopButton).prop("disabled", false)
    $(config.domElements.mobileButton).prop("disabled", false)
    $(config.domElements.totDesktopSearchesForm).prop("disabled", false)
    $(config.domElements.totMobileSearchesForm).prop("disabled", false)
    $(config.domElements.waitingBetweenSearchesForm).prop("disabled", false)

}

/**
 * Update progressbar value
 * @param {*} value 
 */
function setProgress(value){
    progressBar.style.width = value + "%"
    progressBar.innerText = value + "%"
}

async function getTabId() {
    return new Promise( (resolve, reject) => {
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            var activeTab = tabs[0]
            var activeTabId = activeTab.id
            resolve(activeTabId)
        })
    })
}

async function handleMobileMode() {
    await enableDebugger()

        chrome.debugger.sendCommand({
            tabId: tabId
        }, "Network.setUserAgentOverride", {
            userAgent: config.devices.phone.userAgent
        }, function () {

            chrome.debugger.sendCommand({
                tabId: tabId
            }, "Page.setDeviceMetricsOverride", {
                width: config.devices.phone.width,
                height: config.devices.phone.height,
                deviceScaleFactor: config.devices.phone.deviceScaleFactor,
                mobile: config.devices.phone.mobile,
                fitWindow: true
            }, async function () {

                await doSearchesMobile()

                // Back to normal
                chrome.debugger.sendCommand({
                    tabId: tabId
                }, "Network.setUserAgentOverride", {
                    userAgent: config.devices.desktop.userAgent
                }, function () {
            
                    chrome.debugger.sendCommand({
                        tabId: tabId
                    }, "Page.setDeviceMetricsOverride", {
                        width: config.devices.desktop.width,
                        height: config.devices.desktop.height,
                        deviceScaleFactor: config.devices.desktop.deviceScaleFactor,
                        mobile: config.devices.desktop.mobile,
                        fitWindow: true
                    }, async function () {
                        await disableDebugger()
            
                        openAndreaCorriga()
                    })
                })

            })

        })
    
}

async function enableDebugger() {
    return new Promise( (resolve, reject) => {
        chrome.debugger.attach({ tabId }, "1.2", function () {
            console.log(`Debugger enabled by tab: ${tabId}`)
            resolve(true)
        })
    })
}

async function disableDebugger() {
    return new Promise( (resolve, reject) => {
        chrome.debugger.detach({ tabId }, function () {
            console.log(`Debugger disables by tab: ${tabId}`)
            resolve(true)
        })
    })
}