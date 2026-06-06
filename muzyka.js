(function() {
    'use strict';

    // Pobranie ustawień z panelu (domyślne wartości przy braku zapisu)
    const getSetting = (id) => localStorage.getItem(`mfo3_val_muzyka_${id}`);
    
    // Inicjalizacja dźwięku
    const defaultLink = "https://github.com/Ropuch1/sdfgh/raw/refs/heads/main/Vogeljongen%20-%20Hakken%20In%20De%20Mijnen%20%E2%9B%8F%EF%B8%8F%F0%9F%91%B7.mp3";
    let bgMusic = new Audio(getSetting('m_link') || defaultLink);
    bgMusic.loop = true;
    bgMusic.volume = parseFloat(localStorage.getItem('mfo3_music_volume')) || 0.5;
    
    let isPlaying = false;

    function monitorMusic() {
        const titleEl = document.getElementById('MapBox_title');
        const targetMap = getSetting('m_mapa') || "Zakazana Kopalnia";
        const currentMap = titleEl ? titleEl.innerText.trim() : "";
        const currentLink = getSetting('m_link') || defaultLink;

        // Aktualizacja źródła, jeśli zmieniono link w panelu
        if (bgMusic.src !== currentLink) {
            bgMusic.src = currentLink;
        }

        // Logika odtwarzania
        if (currentMap === targetMap) {
            if (!isPlaying) {
                bgMusic.play().catch(() => console.log("Muzyka czeka na kliknięcie w grę..."));
                isPlaying = true;
            }
        } else {
            if (isPlaying) {
                bgMusic.pause();
                isPlaying = false;
            }
        }
    }

    // Dodanie suwaka głośności do panelu Ropucha
    function initVolumeSlider() {
        const panel = document.getElementById('ropuch-panel-main');
        if (panel && !document.getElementById('mfo-music-volume-slider')) {
            const sliderDiv = document.createElement('div');
            sliderDiv.id = 'mfo-music-volume-slider';
            sliderDiv.style.cssText = "margin-top:10px; padding-top:5px; border-top:1px solid #7a5a3a; font-size:9px; color:#f1c40f; text-align:center;";
            sliderDiv.innerHTML = `
                Głośność: <input type="range" min="0" max="1" step="0.1" value="${bgMusic.volume}" style="width:80px; vertical-align:middle; cursor:pointer;">
            `;
            
            sliderDiv.querySelector('input').oninput = function() {
                bgMusic.volume = this.value;
                localStorage.setItem('mfo3_music_volume', this.value);
            };
            panel.appendChild(sliderDiv);
        }
    }

    // Pętla sprawdzająca
    setInterval(() => {
        monitorMusic();
        initVolumeSlider();
    }, 1000);
})();
