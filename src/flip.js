(function() {
    const DEBUG_MODE = false;
    const MUTATION_OBSERVER_MAX_COUNT = 1000;

    DEBUG_MODE && console.log('VideoMirror script loaded!');

    // Prevent duplicate instances of VideoMirror from loading.
    if (window.videoMirrorIsLoaded === true) {
        DEBUG_MODE && console.log('Anti-double loading activated.');
        return;
    }
    window.videoMirrorIsLoaded = true;

    window.videoMirrorIsFlipped = false;
    window.videoMirrorObserver = null;

    const flipDuration = 250;
    const flipQuery = [
        'video',                                        // Support normal videos
        '.meeting-app .active-video-container__canvas', // Zoom: The other main camera
        '.meeting-app .self-video-container__canvas',   // Zoom: Your own camera
        '.meeting-app .gallery-video-container__canvas',// Zoom: Gallery view
        'iframe[src^="https://player.vimeo.com"]',      // Embedded vimeo
    ].join(', ');

    let watchList = new Map();

    // Detect short-circuits within VideoMirror. If two instances are running,
    // this counter keeps track of how many times the mutation observer has been called.
    // If it is called too many times it is disconnected.
    let mutationObserverCount = 0;

    function flipVideo(video, animate, flip) {
        if (typeof flip === 'undefined') flip = true; // Flip defaults to true


        if (mutationObserverCount > MUTATION_OBSERVER_MAX_COUNT) {
            let observer = watchList.get(video);

            if (typeof observer != 'undefined') {
                observer.disconnect();
                DEBUG_MODE && console.log('Mutation observer disconnected. Too many calls');
            }

        }
        mutationObserverCount++;

        // Set a timer to reduce the mutation observer count.
        setTimeout(() => {
            mutationObserverCount -= 2;
        }, 500);

        if (animate) {
            video.style.transition = 'transform ' + flipDuration + 'ms ease-out';

            setTimeout(() => {
                video.style.transition = '';
            }, flipDuration);
        }

        // Make VideoMirror compatible with other transforms
        let transformString = video.style.transform;
        let transformArray = video.style.transform.split(' ');
        let newTransformArray = [];

        DEBUG_MODE && console.log('This is what VM saw: ' + transformString);

        let flippedFromLoop = false;
        for (transformComponent of transformArray) {
            if (transformComponent.includes('rotateY')) {
                newTransformArray.push(flip ? 'rotateY(180deg)' : 'rotateY(0deg)');
                flippedFromLoop = true;
            } else if (transformComponent.includes('scaleX') && window.location.host == 'meet.google.com'){
                // Google Meet uses a scale transform to flip the video for the user.
                // This keeps that so pressing the button doesn't appear to do nothing.
            } else {
                newTransformArray.push(transformComponent);
            }
        }

        if (window.location.host == 'meet.google.com') {
            // Google Meet uses a scale transform to flip the video for the user.
            // This keeps that so pressing the button doesn't appear to do nothing.
            newTransformArray.push('scaleX(-1)');
        }


        if (flippedFromLoop) {
            video.style.transform = newTransformArray.join(' ');
            DEBUG_MODE && console.log('This is what VM changed it to: ' + newTransformArray.join(' '));
        } else {
            DEBUG_MODE && console.log('This is what VM changed it to: ' + video.style.transform + (flip ? 'rotateY(180deg)' : 'rotateY(0deg)'));
            video.style.transform = video.style.transform + (flip ? 'rotateY(180deg)' : 'rotateY(0deg)');
        }

        // Keep watch over the video if it is flipped, otherwise stop keeping watch of it.
        if (flip) {
            if (window.videoMirrorObserver === null) {
                window.videoMirrorObserver = observeBodyForNewVideos();
            }

            if (typeof watchList.get(video) == 'undefined') {
                let observer = observeVideo(video);
                watchList.set(video, observer);
            }
        } else {
            if (window.videoMirrorObserver !== null) {
                window.videoMirrorObserver.disconnect();
                window.videoMirrorObserver = null;
            }

            let observer = watchList.get(video);

            if (typeof observer != 'undefined') {
                observer.disconnect();
                watchList.delete(video);
            }
        }
    }

    function observeVideo(video) {
        let observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type == 'attributes' && mutation.attributeName == 'style') {
                    // The style attribute was updated on this element.
                    // We should make sure that our transforms are still there.
                    DEBUG_MODE && console.log('Mutation Observer called');
                    flipVideo(mutation.target, false, window.videoMirrorIsFlipped);
                }
            });
        });

        observer.observe(video, { attributes: true });

        return observer;
    }

    function observeBodyForNewVideos() {
        let observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                Array.from(mutation.addedNodes).filter(function(addedNode) { return addedNode.nodeName == 'VIDEO' }).forEach(function(addedNode) {
                    // If a video is added randomly, we should make sure that it is flipped too.
                    flipVideo(mutation.target, false, window.videoMirrorIsFlipped);
                });
            });
        });

        observer.observe(document.body, {childList: true, subtree: true});

        return observer;
    }

    function videoMirrorSetFlip(flipped) {
        DEBUG_MODE && console.debug(`The following NodeList is what VideoMirror will ${flipped ? 'flip' : 'unflip'}:`);
        DEBUG_MODE && console.debug(document.querySelectorAll(flipQuery));

        window.videoMirrorIsFlipped = flipped;
        document.querySelectorAll(flipQuery).forEach(video => flipVideo(video, true, flipped));
    }

    function videoMirrorGetVideoCount() {
        return document.querySelectorAll(flipQuery).length;
    }

    window.videoMirrorSetFlip = videoMirrorSetFlip;
    window.videoMirrorGetVideoCount = videoMirrorGetVideoCount;
})();

