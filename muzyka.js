(function() {
    'use strict';
    
    // Pobranie ustawień zapisanych przez panel
    const getSetting = (id) => localStorage.getItem(`mfo3_val_muzyka_${id}`);
    
    let bgMusic = new Audio(getSetting('m_link') || "https://github.com/Ropuch1/sdfgh/raw/refs/heads/main/Vogeljongen%20-%20Hakken%20In%20De%20Mijnen%20%E2%9B%8F%EF%B8%8F%F0%9F%91%B7.mp3");
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
