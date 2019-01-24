(function() {
    'use strict';

    const flipMessage = 'VideoMirror - All Videos are now mirrored!';

    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.executeScript(
            tabs[0].id,
            {file: 'flip.js', allFrames: true}
        );

        chrome.pageAction.getTitle({ tabId: tabs[0].id }, (title) => {
            chrome.pageAction.setTitle({
                tabId: tabs[0].id,
                title: (title == flipMessage) ? 'VideoMirror - Videos have been reverted' : flipMessage
            });

            window.close();
        });
    });
})();
