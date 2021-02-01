chrome.runtime.onInstalled.addListener(function(details) {
	chrome.declarativeContent.onPageChanged.removeRules(undefined, function() {
		let conditions = [
            new chrome.declarativeContent.PageStateMatcher({
                css: ["video, .active-video-container__canvas, .self-video-container__canvas"]
            })
        ];

        chrome.declarativeContent.onPageChanged.addRules([{
			conditions: conditions,
            actions: [ 
                (new chrome.declarativeContent.ShowPageAction()),
            ]
        }]);

    });
});
