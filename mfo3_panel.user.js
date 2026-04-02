// ==UserScript==
// @name         MFO3 - Panel Ropucha (ALL-IN-ONE)
// @version      1.5
// @match        https://s1.mfo3.pl/game/
// @grant        none
// @run-at       document-end
// @updateURL    https://raw.githubusercontent.com/Ropuch1/mfo3-dodatki/main/mfo3_panel.user.js
// @downloadURL  https://raw.githubusercontent.com/Ropuch1/mfo3-dodatki/main/mfo3_panel.user.js
// ==/UserScript==

(function() {
    'use strict';

    const getSetting = (name) => localStorage.getItem('mfo3_' + name) === 'true';
    const setSetting = (name, value) => localStorage.setItem('mfo3_' + name, value);

    // Funkcja do ładowania skryptów z Twojego GitHuba
    function loadModule(fileName) {
        const script = document.createElement('script');
        script.src = `https://raw.githubusercontent.com/Ropuch1/mfo3-dodatki/main/${fileName}?t=${Date.now()}`;
        document.head.appendChild(script);
    }

    // ŁADUJEMY DODATKI TYLKO JEŚLI SĄ WŁĄCZONE
    if (getSetting('wasd')) {
        loadModule('wasd.js');
    }

    // INTERFEJS
    const panel = document.createElement('div');
    panel.innerHTML = `
        <div style="position: fixed; top: 60px; right: 15px; z-index: 10000; 
            background: rgba(45, 34, 23, 0.95); color: #e6d3a7; padding: 12px; 
            border: 2px solid #7a5a3a; font-family: Verdana; font-size: 11px; border-radius: 8px;">
            <b style="color: #f1c40f;">PANEL ROPUCHA</b><br><br>
            <label style="cursor:pointer;"><input type="checkbox" id="chk-wasd" ${getSetting('wasd') ? 'checked' : ''}> WASD (Wymaga odświeżenia)</label>
        </div>
    `;
    document.body.appendChild(panel);

    document.getElementById('chk-wasd').addEventListener('change', (e) => {
        setSetting('wasd', e.target.checked);
        alert("Zmieniono ustawienia. Odśwież stronę (F5), aby zatwierdzić dodatki.");
    });

})();
