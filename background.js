"use strict";


/* https://stackoverflow.com/a/64475504 */
function loadImageData(url) {
    return new Promise((resolve) => {
        const canvas = document.body.appendChild(
            document.createElement("canvas")
        );
        const context = canvas.getContext("2d");
        const img = new Image();
        img.onload = () => {
            context.drawImage(img, 0, 0);
            const data = context.getImageData(0, 0, img.width, img.height);
            canvas.remove();
            resolve(data);
        };
        img.src = url;
    });
}

chrome.runtime.onInstalled.addListener(function(details) {
    chrome.declarativeContent.onPageChanged.removeRules(undefined, async function() {
        let conditions = [
            new chrome.declarativeContent.PageStateMatcher({
                css: ["video, .active-video-container__canvas, .self-video-container__canvas, .gallery-video-container__canvas"]
            })
        ];

        let actions = [
            new chrome.declarativeContent.SetIcon({
                imageData: {
                    "16": await loadImageData('images/VideoMirror16.png'),
                    "32": await loadImageData('images/VideoMirror32.png'),
                    "48": await loadImageData('images/VideoMirror48.png'),
                    "128": await loadImageData('images/VideoMirror128.png'),
                }
            }),
            new chrome.declarativeContent.ShowPageAction(),
        ];

        chrome.declarativeContent.onPageChanged.addRules([{
            conditions: conditions,
            actions: actions,
        }]);

    });
});
