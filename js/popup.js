import words from '../data/words.js'

const timer = ms => new Promise(res => setTimeout(res, ms))

let progress = document.querySelector(".progress-bar")

const totSearch = 60

$("#totSearch").html(totSearch)

$("#search_button").on("click", () => {
    doSearch()
})

async function doSearch() {
    for (var i = 0; i < totSearch; i++) {

        let random_number = Math.floor(Math.random() * words.length)

        let perc = parseInt( ( (i + 1) / totSearch) * 100)

        chrome.tabs.update({
            url: `https:www.bing.com/search?q=${words[random_number]}` //&form=QBLH&sp=-1&pq=&sc=0-0&qs=n&sk=&cvid=7EF859AA394440DD99A90C72195D9EA8
        })

        progress.style.width = perc + "%";
        progress.innerText = perc + "%";
        
        $("#numberOfSearch").html(i + 1)
        await timer(500)
    }
} 