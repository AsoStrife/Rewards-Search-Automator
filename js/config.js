let config = {
    general: {
        appVersion: "v1.5.0",
        authorWebsiteLink: "https://andreacorriga.com",
        repositoryGithubLink: "https://github.com/AsoStrife/Bing-Search-Automator", 
        storeLink: "https://chrome.google.com/webstore/detail/bing-search-automator/ohjecpfbaodieoicfnpnigjbinkjgnkb",
        rewardsLink: "https://rewards.microsoft.com/",
    },
    bing: {
        url: "https:www.bing.com/search?q={q}&form={form}",
        form: "QBLH"
    },
    phonesArray: [{
        title: "Google Nexus 4",
        width: 384,
        height: 640,
        deviceScaleFactor: 2,
        userAgent: "Mozilla/5.0 (Linux; Android 4.2.1; en-us; Nexus 4 Build/JOP40D) AppleWebKit/535.19 (KHTML, like Gecko) Chrome/18.0.1025.166 Mobile Safari/535.19",
        touch: true,
        mobile: true
    }],

    searches: {
        milliseconds: 500,
        desktop: 90,
        mobile: 60,
    }, 
    

    domElements: {
        desktopButton: '#desktopButton',
        mobileButton: '#mobileButton',
        totDesktopSearchesForm: '#totDesktopSearchesForm',
        totMobileSearchesForm: '#totMobileSearchesForm',
        waitingBetweenSearchesForm: '#waitingBetweenSearchesForm',
        appVersion: "#appVersion",
        authorWebsiteLink: "#authorWebsiteLink",
        repositoryGithubLink: "#repositoryGithubLink", 
        storeLink: "#storeLink", 
        rewardsLink: "#rewardsLink",
        progressBar: ".progress-bar"

    }
}

export default config