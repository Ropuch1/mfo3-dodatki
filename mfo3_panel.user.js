// ==UserScript==
// @name         MFO3 - Panel Ropucha (Dynamic)
// @version      3.0
// @match        *://*.mfo3.pl/*
// @grant        none
// @run-at       document-end
// ==/UserScript==

(function() {
    'use strict';

    const CONFIG_URL = 'https://raw.githubusercontent.com/Ropuch1/mfo3-dodatki/main/config.json';
    const BASE_URL = 'https://raw.githubusercontent.com/Ropuch1/mfo3-dodatki/main/';

    async function init() {
        try {
            // 1. Pobierz listę dodatków
            const response = await fetch(`${CONFIG_URL}?t=${Date.now()}`);
            const config = await response.json();

            // 2. Wyświetl panel
            const panel = document.createElement('div');
            panel.innerHTML = `
                <div id="mfo-dynamic-panel" style="position: fixed; top: 60px; right: 15px; z-index: 10000; 
                    background: rgba(45, 34, 23, 0.95); color: #e6d3a7; padding: 12px; 
                    border: 2px solid #7a5a3a; font-family: Verdana; font-size: 11px; border-radius: 8px; width: 180px;">
                    <b style="color: #f1c40f;">PANEL ROPUCHA</b><hr style="border-color:#7a5a3a">
                    <div id="module-list"></div>
                    <div style="font-size:8px; margin-top:8px; text-align:center; opacity:0.6;">Zmień i kliknij F5</div>
                </div>
            `;
            document.body.appendChild(panel);

            const listCont = document.getElementById('module-list');

            // 3. Generuj checkboxy i ładuj skrypty
            config.modules.forEach(mod => {
                const isEnabled = localStorage.getItem('mfo3_' + mod.id) === 'true';

                // Dodaj do listy w panelu
                const label = document.createElement('label');
                label.style.display = 'block';
                label.style.cursor = 'pointer';
                label.innerHTML = `<input type="checkbox" id="chk-${mod.id}" ${isEnabled ? 'checked' : ''}> ${mod.name}`;
                listCont.appendChild(label);

                // Reakcja na kliknięcie
                document.getElementById('chk-' + mod.id).addEventListener('change', (e) => {
                    localStorage.setItem('mfo3_' + mod.id, e.target.checked);
                });

                // JEŚLI WŁĄCZONY -> ŁADUJ PLIK JS
                if (isEnabled) {
                    const script = document.createElement('script');
                    script.src = `${BASE_URL}${mod.file}?t=${Date.now()}`;
                    document.head.appendChild(script);
                }
            });

        } catch (e) {
            console.error("Panel: Błąd ładowania configu", e);
        }
    }

    init();
})();
