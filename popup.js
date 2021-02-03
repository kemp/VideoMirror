(function() {
    'use strict';

    const flipMessage = 'Videos are mirrored! Click again to undo.';
    const revertedMessage = 'Videos have been reverted to normal.';


    function getProp( object, keys, defaultVal ){
        keys = Array.isArray( keys )? keys : keys.split('.');
        object = object[keys[0]];
        if( object && keys.length>1 ){
            return getProp( object, keys.slice(1) );
        }
        return object === undefined? defaultVal : object;
    }


    function chromeAsync(method, ...args) {
        return new Promise((resolve, reject) => {
            let met = getProp(chrome, method);
            met(...args, response => {
                if (chrome.runtime.lastError) {
                    reject(chrome.runtime.lastError)
                }

                resolve(response);
            });
        });
    }


    chromeAsync('tabs.query', {active: true, currentWindow: true})
        .then(async (tabs) => {
            let activeTab = tabs[0].id;

            // Use the page action's title to determine if the videos have been flipped or not.
            let title = await chromeAsync('pageAction.getTitle', {tabId: activeTab });
            let isFlipped = (title == flipMessage);
            let isReverted = (title == revertedMessage);

            if (!isFlipped && !isReverted) {
                // Only insert flip.js if VideoMirror hasn't been flipped yet.
                await chromeAsync('tabs.executeScript', 
                    activeTab, 
                    { file: 'flip.js', allFrames: true, runAt: "document_end" })
            }

            // Send the command to flip the videos
            await chromeAsync('tabs.executeScript', activeTab, {
                code: `window.videoMirrorSetFlip(${!isFlipped})`,
                allFrames: true,
                runAt: 'document_end'
            });

            // Set the page action's title
            await chromeAsync('pageAction.setTitle', {
                tabId: tabs[0].id,
                title: isFlipped ? revertedMessage : flipMessage
            });

            // Set the page action's icon
            let iconName = isFlipped ? 'VideoMirror' : 'VideoMirror-filled';
            await chromeAsync('pageAction.setIcon', {
                tabId: tabs[0].id,
                path: {
                    "16": `images/${iconName}16.png`,
                    "32": `images/${iconName}32.png`,
                    "48": `images/${iconName}48.png`,
                    "128": `images/${iconName}128.png`
                }
            });

            // Close the pop-up window with the loading spinner
            window.close();
        }).catch((error) => {
            console.error('There was an error while flipping VideoMirror.');

            let errorContainerEl = document.getElementById('error-container');
            let errorMessageEl = document.getElementById('error-message');
            let spinnerEl = document.getElementById('loading-spinner');

            errorMessageEl.innerText = JSON.stringify(error);
            errorContainerEl.classList.remove('hidden');
            spinnerEl.classList.add('hidden');
        });

})();
