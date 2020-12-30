(function() {

    const flipDuration = 250;
    const flipQuery = [
        'video',                                        // Support normal videos
        '.meeting-app .active-video-container__canvas', // Zoom: The other main camera
        '.meeting-app .self-video-container__canvas',   // Zoom: Your own camera
        'iframe[src^="https://player.vimeo.com"]',       // Embedded vimeo
    ].join(', ');  // (note: this must also be changed in background.js)

    let watchList = [];

    if (typeof window.videoMirrorIsFlipped === 'undefined') {
        // First run
        flipAllVideos();
        window.videoMirrorIsFlipped = true;

        // Add mutation observers
        startMutationObserver();
        // setInterval(flipAllVideos, 1000); // Temp

    } else if (window.videoMirrorIsFlipped == false) {
        window.videoMirrorIsFlipped = true;
        flipAllVideos();
    } else {
        window.videoMirrorIsFlipped = false;
        unflipAllVideos();
    }

    function flipVideo(video, animate, flip) {
        if (typeof flip === 'undefined') flip = true; // Flip defaults to true

        if (animate) {
            video.style.transition = 'transform ' + flipDuration + 'ms ease-out';

            setTimeout(() => {
                video.style.transition = '';
            }, flipDuration);
        }

        video.style.transform = flip ? 'rotateY(180deg)' : 'rotateY(0deg)';

        // Keep watch over the video if it is flipped, otherwise stop keeping watch of it.
        if (watchList.indexOf(video) == -1) {
            observeVideo(video);
            watchList.push(video);
        }
    }

    function unflipVideo(video, animate) {
        flipVideo(video, animate, false);
    }

    function flipAllVideos() {
        document.querySelectorAll(flipQuery).forEach(video => flipVideo(video, true));
    }

    function unflipAllVideos() {
        document.querySelectorAll(flipQuery).forEach(video => unflipVideo(video, true));
    }

    function observeVideo(video) {
        let observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type == 'attributes' && mutation.attributeName == 'style') {
                    // The style attribute was updated on this element.
                    // We should make sure that our transforms are still there.
                    flipVideo(mutation.target, false, window.videoMirrorIsFlipped);
                }
            });
        });

        observer.observe(video, { attributes: true });
    }

    function startMutationObserver() {
        let observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                Array.from(mutation.addedNodes).filter(function(addedNode) { return addedNode.nodeName == 'VIDEO' }).forEach(function(addedNode) {
                    // If a video is added randomly, we should make sure that it is flipped too.
                    flipVideo(mutation.target, false, window.videoMirrorIsFlipped);
                });
            });
        });

        observer.observe(document.body, {childList: true, subtree: true});
    }
})();

