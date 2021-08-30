'use strict';

(async function(chrome) {
    const flipMessage = 'Videos are mirrored! Click again to undo.';
    const revertedMessage = 'Videos have been reverted to normal.';

    async function getCurrentTab() {
        let queryOptions = { active: true, currentWindow: true };
        let [tab] = await chrome.tabs.query(queryOptions);
        return tab;
    }

    try {
        let tab = await getCurrentTab();

        // Use the page action's title to determine if the videos have been flipped or not.
        let title = await chrome.action.getTitle({tabId: tab.id});

        let isFlipped = (title === flipMessage);
        let isReverted = (title === revertedMessage);

        if (!isFlipped && !isReverted) {
            // Only insert flip.js if VideoMirror hasn't been flipped yet.
            await chrome.scripting.executeScript({
                target: {tabId: tab.id},
                files: ['flip.js'],
            });

            await chrome.action.setBadgeBackgroundColor({
                tabId: tab.id,
                color: '#000000',
            });
        }

        // Send the command to flip the videos
        await chrome.scripting.executeScript({
            target: {tabId: tab.id, allFrames: true},
            func: setFlip,
            args: [!isFlipped],
        });

        // Set the page action's title
        await chrome.action.setTitle({
            tabId: tab.id,
            title: isFlipped ? revertedMessage : flipMessage
        });

        // Set the page action's icon
        let iconName = isFlipped ? 'images/VideoMirror128.png' : 'images/VideoMirror-filled128.png';
        const imageData = await getIconImageData(iconName, 128);
        await chrome.action.setIcon({tabId: tab.id, imageData: imageData});

        const counts = await chrome.scripting.executeScript({
            target: {tabId: tab.id, allFrames: true},
            func: getVideoCount,
        });

        const count = counts.reduce((i, c) => i + c.result, 0);

        await chrome.action.setBadgeText({
            tabId: tab.id,
            text: !isFlipped ? 'ON' : '',
        });

        // Close the pop-up window with the loading spinner
        if (count === 0 && !isFlipped) {
            showTemplate('no-videos-found');
        } else {
            window.close();
        }
    } catch (error) {
            console.error(error);

            showTemplate('error', { error })
    }

    function setFlip(isFlipped) {
        window.videoMirrorSetFlip(isFlipped);
    }

    function getVideoCount() {
        return window.videoMirrorGetVideoCount();
    }

    function showTemplate(name, data = {}) {
        hideSpinner();

        const target = document.getElementById('template-target');
        const templateDOM = document.getElementById(name).content.firstElementChild.cloneNode(true)

        for (const [name, value] of Object.entries(data)) {
            templateDOM.innerHTML = templateDOM.innerHTML.replace(new RegExp(`\{\{\w?${name}\w?\}\}`, 'g'), value);
        }

        target.appendChild(templateDOM);
    }

    function hideSpinner() {
        const spinnerEl = document.getElementById('loading-spinner');

        spinnerEl.classList.add('hidden');
    }

    function getIconImageData(imageUrl, size = 48) {
        return new Promise((resolve, reject) => {
            const canvas = new OffscreenCanvas(size, size);
            const context = canvas.getContext('2d');

            const image = new Image(size, size); // Using optional size for image

            image.onload = function () {
                // Use the intrinsic size of image in CSS pixels for the canvas element
                canvas.width = this.naturalWidth;
                canvas.height = this.naturalHeight;

                context.drawImage(this, 0, 0, this.width, this.height);

                const imageData = context.getImageData(0, 0, size, size);

                resolve(imageData);
            };

            image.src = imageUrl;
        });
    }

    function initCloseButtons() {
        document.querySelectorAll('button[data-close]').forEach((button) => {
            button.addEventListener('click', () => {
                window.close();
            });
        });
    }

    initCloseButtons();
})(chrome);
