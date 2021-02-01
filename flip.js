(function() {

    const DEBUG_MODE = true;

    const flipDuration = 250;
    const flipQuery = [
        'video',                                        // Support normal videos
        '.meeting-app .active-video-container__canvas', // Zoom: The other main camera
        '.meeting-app .self-video-container__canvas',   // Zoom: Your own camera
        'iframe[src^="https://player.vimeo.com"]',       // Embedded vimeo
    ].join(', ');  // (note: this must also be changed in background.js)

    let watchList = [];

    window.videoMirrorIsFlipped = false;

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

    function videoMirrorSetFlip(flipped) {
        DEBUG_MODE && console.debug(`The following NodeList is what VideoMirror will ${flipped ? 'flip' : 'unflip'}:`);
        DEBUG_MODE && console.debug(document.querySelectorAll(flipQuery));

        window.videoMirrorIsFlipped = flipped;
        document.querySelectorAll(flipQuery).forEach(video => flipVideo(video, true, flipped));
    }

    window.videoMirrorSetFlip = videoMirrorSetFlip;
})();

