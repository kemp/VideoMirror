var flipScript = 'rotateY(180deg)';

document.querySelectorAll('video').forEach((e) => {
    e.style.transform = e.style.transform == flipScript ? '' : flipScript;
});

console.log('videos reversed');
