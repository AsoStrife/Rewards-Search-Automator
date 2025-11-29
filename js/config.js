let config = {
    general: {
        appVersion: "v2.1.0",
        authorWebsiteLink: "https://andreacorriga.com",
        authorWebsiteLinkThanks: [
            "https://andreacorriga.com/rewards-search-automator/thanks",
            "https://play.google.com/store/apps/details?id=com.strifelab.raweceek"
        ],
        repositoryGithubLink: "https://github.com/AsoStrife/Rewards-Search-Automator",
        storeLink: "https://chromewebstore.google.com/detail/rewards-search-automator/paohfpjfibchbhbkdnlhjpfblafifehg?hl=it",
        rewardsLink: "https://rewards.microsoft.com/",
    },
    bing: {
        url: "https://bing.com/search?q={q}&form={form}&cvid={cvid}",
        form: "QBRE"
    },

    devices: {
        phone: {
            title: "Samsung Galaxy S21",
            width: 360,
            height: 800,
            deviceScaleFactor: 3,
            userAgent: "Mozilla/5.0 (Linux; Android 13; SM-S908B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Mobile Safari/537.36",
            touch: true,
            mobile: true
        },
        desktop: {
            title: "Dell Xps 15",
            width: 1920,
            height: 1080,
            deviceScaleFactor: 1,
            userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
            touch: false,
            mobile: false
        }
    },

    searches: {
        millisecondsMin: 8000,
        millisecondsMax: 10000,
        desktop: 3,
        mobile: 3
    },


    domElements: {
        desktopButton: '#desktopButton',
        mobileButton: '#mobileButton',
        desktopMobileButton: '#desktopMobileButton',
        totDesktopSearchesForm: '#totDesktopSearchesForm',
        totMobileSearchesForm: '#totMobileSearchesForm',
        waitingBetweenSearchesFormMin: '#waitingBetweenSearchesFormMin',
        waitingBetweenSearchesFormMax: '#waitingBetweenSearchesFormMax',
        appVersion: "#appVersion",
        authorWebsiteLink: "#authorWebsiteLink",
        repositoryGithubLink: "#repositoryGithubLink",
        storeLink: "#storeLink",
        rewardsLink: "#rewardsLink",
        f1PromoLink: "#btn-f1-promo",
        progressBar: ".progress-bar"

    }
}

export default config