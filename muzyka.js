(function() {
    'use strict';
    
    // Pobranie ustawień zapisanych przez panel
    const getSetting = (id) => localStorage.getItem(`mfo3_val_muzyka_${id}`);
    
    let bgMusic = new Audio(getSetting('m_link') || "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3");
    bgMusic.loop = true;
    let isPlaying = false;

    function monitorMusic() {
        const titleEl = document.getElementById('MapBox_title');
        const targetMap = getSetting('m_mapa') || "Zakazana Kopalnia";
        const currentMap = titleEl ? titleEl.innerText.trim() : "";
        const currentLink = getSetting('m_link');

        // Aktualizacja źródła, jeśli link się zmienił w panelu
        if (bgMusic.src !== currentLink && currentLink) {
            bgMusic.src = currentLink;
        }

        if (currentMap === targetMap) {
            if (!isPlaying) {
                bgMusic.play().catch(() => {});
                isPlaying = true;
            }
        } else {
            if (isPlaying) {
                bgMusic.pause();
                isPlaying = false;
            }
        }
    }

    setInterval(monitorMusic, 1000);
})();
