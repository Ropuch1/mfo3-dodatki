// ==UserScript==
// @name         MFO3 - Panel Ropucha
// @version      1.6
// @match        *://*.mfo3.pl/*
// @grant        none
// @run-at       document-end
// @updateURL    https://raw.githubusercontent.com/Ropuch1/mfo3-dodatki/main/mfo3_panel.user.js
// @downloadURL  https://raw.githubusercontent.com/Ropuch1/mfo3-dodatki/main/mfo3_panel.user.js
// ==/UserScript==

(function() {
    'use strict';

    const getSetting = (name) => localStorage.getItem('mfo3_' + name) === 'true';
    const setSetting = (name, value) => localStorage.setItem('mfo3_' + name, value);

    function loadModule(fileName) {
        const script = document.createElement('script');
        script.src = `https://raw.githubusercontent.com/Ropuch1/mfo3-dodatki/main/${fileName}?t=${Date.now()}`;
        document.head.appendChild(script);
    }

    // --- ŁADOWANIE MODUŁÓW ---
    if (getSetting('wasd')) loadModule('wasd.js');
    if (getSetting('heal')) loadModule('leczenie.js'); // NOWE

    // --- INTERFEJS ---
    const panel = document.createElement('div');
    panel.innerHTML = `
        <div style="position: fixed; top: 60px; right: 15px; z-index: 10000; 
            background: rgba(45, 34, 23, 0.95); color: #e6d3a7; padding: 12px; 
            border: 2px solid #7a5a3a; font-family: Verdana; font-size: 11px; border-radius: 8px; width: 170px;">
            <b style="color: #f1c40f;">PANEL ROPUCHA</b><br><br>
            
            <label style="display:block; margin-bottom:5px; cursor:pointer;">
                <input type="checkbox" id="chk-wasd" ${getSetting('wasd') ? 'checked' : ''}> Sterowanie WASD
            </label>
            
            <label style="display:block; cursor:pointer;">
                <input type="checkbox" id="chk-heal" ${getSetting('heal') ? 'checked' : ''}> Leczenie (T/M4/M5)
            </label>
            
            <hr style="border:0; border-top:1px solid #7a5a3a; margin: 10px 0;">
            <div style="font-size:9px; text-align:center; opacity:0.7;">Wymaga F5 po zmianie</div>
        </div>
    `;
    document.body.appendChild(panel);

    // Obsługa zmian
    document.getElementById('chk-wasd').addEventListener('change', (e) => setSetting('wasd', e.target.checked));
    document.getElementById('chk-heal').addEventListener('change', (e) => setSetting('heal', e.target.checked));

})();
