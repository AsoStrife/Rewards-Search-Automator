let config = {
    general: {
        appVersion: "v1.5.3",
        authorWebsiteLink: "https://andreacorriga.com",
        repositoryGithubLink: "https://github.com/AsoStrife/Rewards-Search-Automator",
        storeLink: "https://chromewebstore.google.com/detail/rewards-search-automator/paohfpjfibchbhbkdnlhjpfblafifehg?hl=it",
        rewardsLink: "https://rewards.microsoft.com/",
    },
    bing: {
        url: "https:www.bing.com/search?q={q}&form={form}&cvid={cvid}",
        form: "QBLH"
    },

    devices: {
        phone: {
            title: "Google Nexus 4",
            width: 384,
            height: 640,
            deviceScaleFactor: 2,
            userAgent: "Mozilla/5.0 (Linux; Android 4.2.1; en-us; Nexus 4 Build/JOP40D) AppleWebKit/535.19 (KHTML, like Gecko) Chrome/18.0.1025.166 Mobile Safari/535.19",
            touch: true,
            mobile: true
        },
        desktop: {
            title: "Dell Xps 15",
            width: 1920,
            height: 1080,
            deviceScaleFactor: 1,
            userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
            touch: false,
            mobile: false
        }
    },

    searches: {
        millisecondsMin: 8000,
        millisecondsMax: 10000,
        desktop: 30,
        mobile: 20,
    }, 
    

    domElements: {
        desktopButton: '#desktopButton',
        mobileButton: '#mobileButton',
        totDesktopSearchesForm: '#totDesktopSearchesForm',
        totMobileSearchesForm: '#totMobileSearchesForm',
        waitingBetweenSearchesFormMin: '#waitingBetweenSearchesFormMin',
        waitingBetweenSearchesFormMax: '#waitingBetweenSearchesFormMax',
        appVersion: "#appVersion",
        authorWebsiteLink: "#authorWebsiteLink",
        repositoryGithubLink: "#repositoryGithubLink", 
        storeLink: "#storeLink", 
        rewardsLink: "#rewardsLink",
        progressBar: ".progress-bar"

    }
}

export default config