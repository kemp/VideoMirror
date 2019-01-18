(function() {
    const flipDuration = 250;

    document.querySelectorAll('video').forEach((e) => {
        e.style.transition = 'transform ' + flipDuration + 'ms ease-out';
    });

    if (window.videoMirrorIsFlipped == false) {
        document.querySelectorAll('video').forEach((e) => {
            e.style.transform = 'rotateY(0deg)';
        });
        window.videoMirrorIsFlipped = true;
    } else {
        document.querySelectorAll('video').forEach((e) => {
            e.style.transform = 'rotateY(180deg)';
        });
        window.videoMirrorIsFlipped = false;
    }

    setTimeout(() => {
        document.querySelectorAll('video').forEach((e) => {
            e.style.transition = '';
        });
    }, flipDuration);
})();

