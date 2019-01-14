chrome.runtime.onInstalled.addListener(function(details) {
    chrome.runtime.setUninstallURL('https://goo.gl/forms/GNFClkKG46UxBc7n2');
    
    chrome.declarativeContent.onPageChanged.removeRules(undefined, function() {
        chrome.declarativeContent.onPageChanged.addRules([{
            conditions: [
                new chrome.declarativeContent.PageStateMatcher({
                    css: ["video"]
                })
            ],
            actions: [ new chrome.declarativeContent.ShowPageAction() ]
        }]);
    });
});
