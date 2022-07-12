import words from '../data/words.js'

// Wait time between searches
const milliseconds = 500

// Default value
let numberOfSearch = 90 

// Dom Elements for jQuery purpose
const domElements = {
    currentSearchNumber: '#currentSearchNumber',
    totSearchesNumber: '#totSearchesNumber',
    searchButton: '#searchButton',
    totSearchesForm: '#totSearchesForm'
}

// Await time between searches
const timer = ms => new Promise(res => setTimeout(res, ms))

// Progressbar object
let progress = document.querySelector(".progress-bar")

// Set numberOfSearch default values inside the input
$(domElements.totSearchesForm).val(numberOfSearch)

// Update the html with default numberOfSearch number
$(domElements.totSearchesNumber).html(numberOfSearch)

// When change the value inside the input
$(domElements.totSearchesForm).on('change', function () {
    numberOfSearch = $(domElements.totSearchesForm).val()
    $(domElements.totSearchesNumber).html(numberOfSearch)

})

// Start search 
$(domElements.searchButton).on("click", () => {
    doSearches()
})

/**
 * Perform random search on Bing
 */
async function doSearches() {

    deactivateForms()

    for (var i = 0; i < numberOfSearch; i++) {

        let randomNumber = Math.floor(Math.random() * words.length)

        chrome.tabs.update({
            url: `https:www.bing.com/search?q=${words[randomNumber]}`
        })

        setProgress( parseInt( ( (i + 1) / numberOfSearch) * 100) )
        
        $(domElements.currentSearchNumber).html(i + 1)
        await timer(milliseconds)
    }

    setProgress(0)
    activateForms()
} 

/**
 * Deactivate Make search button 
 * and Number of Search form
 */
function deactivateForms() {
    $(domElements.searchButton).prop("disabled", true)
    $(domElements.totSearchesForm).prop("disabled", true)
}

/**
 * Activate Make search button 
 * and Number of Search form
 */
function activateForms() {
    $(domElements.searchButton).prop("disabled", false)
    $(domElements.totSearchesForm).prop("disabled", false)
}

/**
 * Update progressbar value
 * @param {*} value 
 */
function setProgress(value){
    progress.style.width = value + "%";
    progress.innerText = value + "%";
}