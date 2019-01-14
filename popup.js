(function() {
    'use strict';

    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.executeScript(
            tabs[0].id,
            {file: 'flip.js'}
        );
    });

    window.close();
})();
