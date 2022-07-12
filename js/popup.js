import words from '../data/words.js'

const timer = ms => new Promise(res => setTimeout(res, ms))

// Wait time between searches
const milliseconds = 500

// Progressbar object
let progress = document.querySelector(".progress-bar")

// Default value
let numberOfSearch = 90 

$('#numberOfSearchForm').val(numberOfSearch)
$("#totNumberOfSearchSpan").html(numberOfSearch)

$('#numberOfSearchForm').on('change', function () {
    numberOfSearch = $('#numberOfSearchForm').val()
    $('#totNumberOfSearchSpan').html(numberOfSearch)

})

$("#search_button").on("click", () => {
    doSearch()
})

/**
 * Perform random search on Bing
 */
async function doSearch() {

    deactivateForms()

    for (var i = 0; i < numberOfSearch; i++) {

        let random_number = Math.floor(Math.random() * words.length)

        let perc = parseInt( ( (i + 1) / numberOfSearch) * 100)

        chrome.tabs.update({
            url: `https:www.bing.com/search?q=${words[random_number]}`
        })

        setProgress(perc)
        
        $("#numberOfSearchSpan").html(i + 1)
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
    $('#search_button').prop("disabled", true)
    $('#numberOfSearchForm').prop("disabled", true)
}

/**
 * Activate Make search button 
 * and Number of Search form
 */
function activateForms() {
    $('#search_button').prop("disabled", false)
    $('#numberOfSearchForm').prop("disabled", false)
}

/**
 * Update progressbar value
 * @param {*} value 
 */
function setProgress(value){
    progress.style.width = value + "%";
    progress.innerText = value + "%";
}