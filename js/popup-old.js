import words from '../data/words.js'
import config from 'config.js' 

chrome.runtime.connect({ name: "popup" });

var phones = {}

config.phonesArray.forEach(function(phone){
    phones[phone.title.replace(/\s+/gi,'')] = phone;
})

// Await time between searches
const timer = ms => new Promise(res => setTimeout(res, ms))

// Progressbar object
let progressDesktop = document.querySelector(".progress-bar-desktop")

// Set the app version number 
$(config.config.domElements.appVersion).html(config.appVersion)

// Set numberOfSearches default values inside the input
$(config.domElements.totSearchesForm).val(config.numberOfSearches)
$(config.domElements.totSearchesMobileForm).val(config.numberOfSearchesMobile)
$(config.domElements.waitingBetweenSearches).val(searches.milliseconds)

// Update the html with default numberOfSearches number 0/totSearches
$(config.domElements.totSearchesNumber).html(config.numberOfSearches)
$(config.domElements.totSearchesMobileNumber).html(config.numberOfSearchesMobile)

// When change the value inside the input
$(config.domElements.totSearchesForm).on('change', function () {
    config.numberOfSearches = $(config.domElements.totSearchesForm).val()
    $(config.domElements.totSearchesNumber).html(config.numberOfSearches)

})

$(config.domElements.totSearchesMobileForm).on('change', function () {
    config.numberOfSearchesMobile = $(config.domElements.totSearchesMobileForm).val()
    $(config.domElements.totSearchesMobileNumber).html(config.numberOfSearchesMobile)

})

$(config.domElements.waitingBetweenSearches).on('change', function () {
    searches.milliseconds = $(config.domElements.waitingBetweenSearches).val()
})

// Start search desktop
$(config.domElements.desktopButton).on("click", () => {
    doSearchesDesktop()
})

// Start search mobile
$(config.domElements.mobileButton).on('click', async () => {
    let tabId = await getTabId()
    handleMobileMode(tabId)
})

/**
 * Perform random searches on Bing
 */
async function doSearchesDesktop() {

    deactivateForms()

    for (var i = 0; i < config.numberOfSearches; i++) {

        let randomNumber = Math.floor(Math.random() * words.length)

        chrome.tabs.update({
            url: `https:www.bing.com/search?q=${words[randomNumber]}`
        })

        setProgress( parseInt( ( (i + 1) / config.numberOfSearches) * 100), 'desktop' )
        
        $(config.domElements.currentSearchNumber).html(i + 1)
        await timer(searches.milliseconds)
    }

    openAndreaCorriga()
    
    setProgress(0, 'desktop')
    activateForms()
} 

/**
 * Perform random searches Mobile on Bing
 */
async function doSearchesMobile() {

    deactivateForms()

    for (var i = 0; i < config.numberOfSearchesMobile; i++) {

        let randomNumber = Math.floor(Math.random() * words.length)

        chrome.tabs.update({
            url: `https:www.bing.com/search?q=${words[randomNumber]}`
        })

        setProgress( parseInt( ( (i + 1) / config.numberOfSearchesMobile) * 100), 'mobile' )
        
        $(config.domElements.currentSearchMobileNumber).html(i + 1)
        await timer(searches.milliseconds)
    }

    setProgress(0, 'mobile')
    activateForms()
} 

function openAndreaCorriga() {
    chrome.tabs.update({
        url: config.authorWebsiteLink
    })
}

/**
 * Deactivate Make search button 
 * and Number of Search form
 */
function deactivateForms() {
    $(config.domElements.desktopButton).prop("disabled", true)
    $(config.domElements.mobileButton).prop("disabled", true)
    $(config.domElements.totSearchesForm).prop("disabled", true)
    $(config.domElements.totSearchesMobileForm).prop("disabled", true)
    $(config.domElements.waitingBetweenSearches).prop("disabled", true)
}

/**
 * Activate Make search button 
 * and Number of Search form
 */
function activateForms() {
    $(config.domElements.desktopButton).prop("disabled", false)
    $(config.domElements.mobileButton).prop("disabled", false)
    $(config.domElements.totSearchesForm).prop("disabled", false)
    $(config.domElements.totSearchesMobileForm).prop("disabled", false)
    $(config.domElements.waitingBetweenSearches).prop("disabled", false)

}

/**
 * Update progressbar value
 * @param {*} value 
 */
function setProgress(value, type){
    if(type == 'desktop'){
        progressDesktop.style.width = value + "%";
        progressDesktop.innerText = value + "%";
    }
    
    if(type == 'mobile'){
        progressMobile.style.width = value + "%";
        progressMobile.innerText = value + "%";
    }
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

function handleMobileMode(tabId) {
    enableDebugger(tabId)

    chrome.debugger.sendCommand({
        tabId: tabId
    }, "Network.setUserAgentOverride", {
        userAgent: phones.GoogleNexus4.userAgent
    }, function () {

        chrome.debugger.sendCommand({
            tabId: tabId
        }, "Page.setDeviceMetricsOverride", {
            width: phones.GoogleNexus4.width,
            height: phones.GoogleNexus4.height,
            deviceScaleFactor: phones.GoogleNexus4.deviceScaleFactor,
            mobile: phones.GoogleNexus4.mobile,
            fitWindow: true
        }, async function () {
            await doSearchesMobile()

            disableDebugger(tabId)

            openAndreaCorriga()
        })

    })

}

function enableDebugger(tabId) {
    chrome.debugger.attach({ tabId }, "1.2", function () {
        console.log(`Debugger enabled by tab: ${tabId}`);
    })
}

function disableDebugger(tabId) {
    chrome.debugger.detach({ tabId }, function () {
        console.log(`Debugger disables by tab: ${tabId}`);
    })
}