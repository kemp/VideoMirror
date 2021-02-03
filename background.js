"use strict";

chrome.runtime.onInstalled.addListener(function(details) {
    chrome.declarativeContent.onPageChanged.removeRules(undefined, function() {
        console.log('Load page rules was called!');

        let conditions = [
            new chrome.declarativeContent.PageStateMatcher({
                css: ["video, .active-video-container__canvas, .self-video-container__canvas, .gallery-video-container__canvas"]
            }),
            new chrome.declarativeContent.PageStateMatcher({
                pageUrl: {
                    hostEquals: 'meet.google.com',
                }
            })
        ];

        let actions = [
            new chrome.declarativeContent.ShowPageAction(),
        ];

        chrome.declarativeContent.onPageChanged.addRules([{
            conditions: conditions,
            actions: actions,
        }]);

    });
});
