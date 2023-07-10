import words from '../data/words.js'

chrome.runtime.connect({ name: "popup" });

const appVersion = "v1.4.2"

let andreaCorrigaWebsite = 'https://andreacorriga.com'

// Phones for mobile searches
var phonesArray = [{ 
    title: "Google Nexus 4", 
    width: 384, 
    height: 640, 
    deviceScaleFactor: 2, 
    userAgent: "Mozilla/5.0 (Linux; Android 4.2.1; en-us; Nexus 4 Build/JOP40D) AppleWebKit/535.19 (KHTML, like Gecko) Chrome/18.0.1025.166 Mobile Safari/535.19", 
    touch: true, 
    mobile: true 
}]

var phones = {}

phonesArray.forEach(function(phone){
    phones[phone.title.replace(/\s+/gi,'')] = phone;
})

// Wait time between searches
let milliseconds = 500

// Default value
let numberOfSearches = 90 
let numberOfSearchesMobile = 60 

// Dom Elements for jQuery purpose
const domElements = {
    currentSearchNumber: '#currentSearchNumber',
    currentSearchMobileNumber: '#currentSearchMobileNumber',
    totSearchesNumber: '#totSearchesNumber',
    totSearchesMobileNumber: '#totSearchesMobileNumber',
    desktopButton: '#desktopButton',
    mobileButton: '#mobileButton',
    totSearchesForm: '#totSearchesForm',
    totSearchesMobileForm: '#totSearchesMobileForm',
    waitingBetweenSearches: '#waitingBetweenSearches',
    appVersion: "#appVersion"
}

// Await time between searches
const timer = ms => new Promise(res => setTimeout(res, ms))

// Progressbar object
let progressDesktop = document.querySelector(".progress-bar-desktop")
let progressMobile = document.querySelector(".progress-bar-mobile")

// Set the app version number 
$(domElements.appVersion).html(appVersion)

// Set numberOfSearches default values inside the input
$(domElements.totSearchesForm).val(numberOfSearches)
$(domElements.totSearchesMobileForm).val(numberOfSearchesMobile)
$(domElements.waitingBetweenSearches).val(milliseconds)

// Update the html with default numberOfSearches number 0/totSearches
$(domElements.totSearchesNumber).html(numberOfSearches)
$(domElements.totSearchesMobileNumber).html(numberOfSearchesMobile)

// When change the value inside the input
$(domElements.totSearchesForm).on('change', function () {
    numberOfSearches = $(domElements.totSearchesForm).val()
    $(domElements.totSearchesNumber).html(numberOfSearches)

})

$(domElements.totSearchesMobileForm).on('change', function () {
    numberOfSearchesMobile = $(domElements.totSearchesMobileForm).val()
    $(domElements.totSearchesMobileNumber).html(numberOfSearchesMobile)

})

$(domElements.waitingBetweenSearches).on('change', function () {
    milliseconds = $(domElements.waitingBetweenSearches).val()
})

// Start search desktop
$(domElements.desktopButton).on("click", () => {
    doSearchesDesktop()
})

// Start search mobile
$(domElements.mobileButton).on('click', async () => {
    let tabId = await getTabId()
    handleMobileMode(tabId)
})

/**
 * Perform random searches on Bing
 */
async function doSearchesDesktop() {

    deactivateForms()

    for (var i = 0; i < numberOfSearches; i++) {

        let randomNumber = Math.floor(Math.random() * words.length)

        chrome.tabs.update({
            url: `https:www.bing.com/search?q=${words[randomNumber]}`
        })

        setProgress( parseInt( ( (i + 1) / numberOfSearches) * 100), 'desktop' )
        
        $(domElements.currentSearchNumber).html(i + 1)
        await timer(milliseconds)
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

    for (var i = 0; i < numberOfSearchesMobile; i++) {

        let randomNumber = Math.floor(Math.random() * words.length)

        chrome.tabs.update({
            url: `https:www.bing.com/search?q=${words[randomNumber]}`
        })

        setProgress( parseInt( ( (i + 1) / numberOfSearchesMobile) * 100), 'mobile' )
        
        $(domElements.currentSearchMobileNumber).html(i + 1)
        await timer(milliseconds)
    }

    setProgress(0, 'mobile')
    activateForms()
} 

function openAndreaCorriga() {
    chrome.tabs.update({
        url: andreaCorrigaWebsite
    })
}

/**
 * Deactivate Make search button 
 * and Number of Search form
 */
function deactivateForms() {
    $(domElements.desktopButton).prop("disabled", true)
    $(domElements.mobileButton).prop("disabled", true)
    $(domElements.totSearchesForm).prop("disabled", true)
    $(domElements.totSearchesMobileForm).prop("disabled", true)
    $(domElements.waitingBetweenSearches).prop("disabled", true)
}

/**
 * Activate Make search button 
 * and Number of Search form
 */
function activateForms() {
    $(domElements.desktopButton).prop("disabled", false)
    $(domElements.mobileButton).prop("disabled", false)
    $(domElements.totSearchesForm).prop("disabled", false)
    $(domElements.totSearchesMobileForm).prop("disabled", false)
    $(domElements.waitingBetweenSearches).prop("disabled", false)

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