(function() {
    'use strict';

    function initRadar() {
        // 1. STYLE WIZUALNE
        const style = document.createElement('style');
        style.innerHTML = `
            .feather-neon-border {
                outline: 5px solid #ff0000 !important;
                outline-offset: 3px;
                box-shadow: 0 0 30px #ff0000 !important;
                z-index: 9999 !important;
                transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            }
            #feather-radar-js {
                position: fixed; top: 80px; left: 10px; z-index: 10000;
                background: rgba(0, 0, 0, 0.9); color: #00ffea;
                padding: 12px; border: 2px solid #ff0000; border-radius: 8px;
                font-family: 'Verdana', sans-serif; font-size: 14px;
                cursor: pointer; user-select: none; text-align: center;
                box-shadow: 0 0 15px rgba(255,0,0,0.4);
                min-width: 140px;
            }
        `;
        document.head.appendChild(style);

        // 2. TWORZENIE PANELU RADARU
        const display = document.createElement('div');
        display.id = "feather-radar-js";
        display.innerHTML = "🪶 Szukanie...";
        document.body.appendChild(display);

        let lastFoundFeather = null;
        let isInspecting = false;

        // 3. LOGIKA SKANOWANIA
        function scan() {
            // Szukamy grafiki piórka (obsługuje items.png oraz Items.png)
            const divs = document.querySelectorAll('div[style*="items.png" i], div[style*="Items.png" i]');
            let featherFound = false;

            divs.forEach((el) => {
                let parent = el.closest('.animator-clip') || el.closest('[id^="event_"]');
                if (parent && parent.style.left) {
                    // Nakładanie ramki
                    if (!parent.classList.contains('feather-neon-border')) {
                        parent.classList.add('feather-neon-border');
                    }
                    
                    // Koordynaty (Twoje 32px)
                    let x = Math.floor(parseInt(parent.style.left) / 32);
                    let y = Math.floor(parseInt(parent.style.top) / 32);

                    const label = isInspecting ? "🔙 WRÓĆ DO SIEBIE" : "🔍 POKAŻ PIÓRKO";
                    display.innerHTML = `📍 <b>${x}, ${y}</b><br><span style="font-size:10px; color:#fff; font-weight:bold;">${label}</span>`;
                    
                    lastFoundFeather = parent;
                    featherFound = true;
                }
            });

            if (!featherFound) {
                display.innerHTML = "🪶 Czekam na resp...";
                display.style.color = "#888";
                display.style.borderColor = "#444";
                lastFoundFeather = null;
                isInspecting = false;
            } else {
                display.style.color = isInspecting ? "#ff9900" : "#00ffea";
                display.style.borderColor = "#ff0000";
            }
        }

        // 4. OBSŁUGA KLIKNIĘCIA (SKOK / POWRÓT)
        display.addEventListener('click', () => {
            if (!lastFoundFeather) return;

            if (!isInspecting) {
                // SKOK DO PIÓRKA
                lastFoundFeather.scrollIntoView({ behavior: "smooth", block: "center", inline: "center" });
                lastFoundFeather.style.transform = "scale(3)";
                isInspecting = true;
            } else {
                // POWRÓT DO POSTACI
                const player = document.querySelector('.char_me') || 
                               document.querySelector('.char_hero') || 
                               document.querySelector('[id^="player_"]');
                
                if (player) {
                    player.scrollIntoView({ behavior: "smooth", block: "center", inline: "center" });
                }
                lastFoundFeather.style.transform = "scale(1)";
                isInspecting = false;
            }
        });

        // URUCHOMIENIE PĘTLI
        const radarInterval = setInterval(scan, 600);
        console.log("%c[MFO3 Radar] Uruchomiono pętlę skanowania!", "color: #00ffea; font-weight: bold;");
    }

    // BEZPIECZNY START: Czekamy, aż body i gra będą gotowe do manipulacji
    if (document.body) {
        initRadar();
    } else {
        window.addEventListener('DOMContentLoaded', initRadar);
    }
})();
