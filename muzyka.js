(function() {
    'use strict';

    const getSetting = (id) => localStorage.getItem(`mfo3_val_muzyka_${id}`);
    const defaultLink = "https://github.com/Ropuch1/sdfgh/raw/refs/heads/main/Vogeljongen%20-%20Hakken%20In%20De%20Mijnen%20%E2%9B%8F%EF%B8%8F%F0%9F%91%B7.mp3";
    
    let bgMusic = new Audio(getSetting('m_link') || defaultLink);
    bgMusic.loop = true;
    bgMusic.volume = parseFloat(localStorage.getItem('mfo3_music_volume')) || 0.5;
    
    // Przywracanie czasu z ostatniego F5
    const savedTime = localStorage.getItem('mfo3_music_time');
    if (savedTime) bgMusic.currentTime = parseFloat(savedTime);
    
    let isPlaying = false;
    let autoPlayBlocked = false;

    // Zapisywanie czasu co sekundę
    setInterval(() => {
        if (!bgMusic.paused) {
            localStorage.setItem('mfo3_music_time', bgMusic.currentTime);
        }
    }, 1000);

    function monitorMusic() {
        const titleEl = document.getElementById('MapBox_title');
        const targetMap = getSetting('m_mapa') || "Zakazana Kopalnia";
        const currentMap = titleEl ? titleEl.innerText.trim() : "";
        const currentLink = getSetting('m_link') || defaultLink;

        if (bgMusic.src !== currentLink) bgMusic.src = currentLink;

        if (currentMap === targetMap) {
            if (!isPlaying) {
                bgMusic.play().then(() => {
                    isPlaying = true;
                    autoPlayBlocked = false;
                }).catch(() => {
                    autoPlayBlocked = true;
                });
            }
        } else {
            if (isPlaying) {
                bgMusic.pause();
                isPlaying = false;
            }
        }
    }

    function initVolumeSlider() {
        const panel = document.getElementById('ropuch-panel-main');
        if (panel && !document.getElementById('mfo-music-volume-slider')) {
            const sliderDiv = document.createElement('div');
            sliderDiv.id = 'mfo-music-volume-slider';
            sliderDiv.style.cssText = "margin-top:10px; padding-top:5px; border-top:1px solid #7a5a3a; font-size:9px; color:#f1c40f; text-align:center;";
            
            sliderDiv.innerHTML = `
                <div id="status-div" style="margin-bottom:5px;">
                    ${autoPlayBlocked ? '<button id="btn-play" style="background:#e74c3c; color:white; border:none; cursor:pointer;">ODBLOKUJ DŹWIĘK</button>' : 'Głośność: <span id="vol-val">'+Math.round(bgMusic.volume * 100)+'%</span>'}
                </div>
                <input type="range" id="vol-range" min="0" max="1" step="0.01" value="${bgMusic.volume}" style="width:100%; cursor:pointer; ${autoPlayBlocked ? 'display:none;' : ''}">
            `;
            
            panel.appendChild(sliderDiv);

            const btn = document.getElementById('btn-play');
            if (btn) {
                btn.onclick = () => {
                    bgMusic.play().then(() => {
                        autoPlayBlocked = false;
                        sliderDiv.remove();
                    });
                };
            }

            const input = document.getElementById('vol-range');
            const label = document.getElementById('vol-val');
            if (input) {
                input.oninput = function() {
                    bgMusic.volume = this.value;
                    if(label) label.innerText = Math.round(this.value * 100) + "%";
                    localStorage.setItem('mfo3_music_volume', this.value);
                };
            }
        }
    }

    setInterval(() => {
        monitorMusic();
        initVolumeSlider();
    }, 1000);
})();
