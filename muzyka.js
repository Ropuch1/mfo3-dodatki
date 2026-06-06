(function() {
    'use strict';

    const getSetting = (id) => localStorage.getItem(`mfo3_val_muzyka_${id}`);
    const defaultLink = "https://github.com/Ropuch1/sdfgh/raw/refs/heads/main/Vogeljongen%20-%20Hakken%20In%20De%20Mijnen%20%E2%9B%8F%EF%B8%8F%F0%9F%91%B7.mp3";
    
    let bgMusic = new Audio();
    bgMusic.loop = true;
    bgMusic.volume = parseFloat(localStorage.getItem('mfo3_music_volume')) || 0.5;
    
    // Przywracanie czasu z ostatniego F5
    const savedTime = localStorage.getItem('mfo3_music_time');
    if (savedTime) bgMusic.currentTime = parseFloat(savedTime);
    
    let isPlaying = false;

    // Zapisywanie czasu co sekundę
    setInterval(() => {
        if (!bgMusic.paused) localStorage.setItem('mfo3_music_time', bgMusic.currentTime);
    }, 1000);

    function monitorMusic() {
        const titleEl = document.getElementById('MapBox_title');
        const targetMap = getSetting('m_mapa') || "Zakazana Kopalnia";
        const currentMap = titleEl ? titleEl.innerText.trim() : "";
        const currentLink = getSetting('m_link') || defaultLink;

        // Ustaw źródło tylko jeśli jest inne niż aktualne
        if (bgMusic.src !== currentLink) {
            bgMusic.src = currentLink;
            bgMusic.load(); // Wymuszenie załadowania nowego pliku
        }

        if (currentMap === targetMap) {
            if (!isPlaying) {
                // Próba odtworzenia - jeśli przeglądarka blokuje, nic się nie stanie (bezpieczne)
                bgMusic.play().then(() => { isPlaying = true; }).catch(() => {
                    console.warn("Autoplay zablokowany. Kliknij w grę!");
                });
            }
        } else {
            if (isPlaying) {
                bgMusic.pause();
                isPlaying = false;
            }
        }
    }

    // Suwak głośności wstrzykiwany do panelu
    function injectVolume() {
        const panel = document.getElementById('ropuch-panel-main');
        if (panel && !document.getElementById('mfo-music-vol')) {
            const container = document.createElement('div');
            container.id = 'mfo-music-vol';
            container.style.cssText = "margin-top:10px; padding:5px; border-top:1px solid #7a5a3a; text-align:center; font-size:9px; color:#f1c40f;";
            container.innerHTML = `Głośność: <input type="range" min="0" max="1" step="0.01" value="${bgMusic.volume}" style="width:100%; cursor:pointer;">`;
            
            container.querySelector('input').oninput = function() {
                bgMusic.volume = this.value;
                localStorage.setItem('mfo3_music_volume', this.value);
            };
            panel.appendChild(container);
        }
    }

    setInterval(() => {
        monitorMusic();
        injectVolume();
    }, 1000);
})();
