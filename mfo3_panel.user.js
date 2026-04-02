// ==UserScript==
// @name         MFO3 - Panel Ropucha
// @namespace    http://tampermonkey.net/
// @version      1.2
// @description  Główny panel sterowania dodatkami
// @author       Ropuch1
// @match        *://*.mfo3.pl/*
// @grant        none
// @run-at       document-end
// @updateURL    https://raw.githubusercontent.com/Ropuch1/mfo3-dodatki/main/mfo3_panel.user.js
// @downloadURL  https://raw.githubusercontent.com/Ropuch1/mfo3-dodatki/main/mfo3_panel.user.js
//
// --- TO JEST POŁĄCZENIE Z MODUŁEM WASD ---
// @require      https://raw.githubusercontent.com/Ropuch1/mfo3-dodatki/main/wasd.js
// ==/UserScript==

(function() {
    'use strict';

    // 1. Zarządzanie ustawieniami w localStorage
    const getSetting = (name) => localStorage.getItem('mfo3_' + name) === 'true';
    const setSetting = (name, value) => localStorage.setItem('mfo3_' + name, value);

    // Domyślne wartości (jeśli ktoś odpala pierwszy raz)
    if (localStorage.getItem('mfo3_wasd') === null) setSetting('wasd', true);

    // 2. Budowa interfejsu (Panelu)
    const panel = document.createElement('div');
    panel.id = 'ropuch-ui'; // Nadajemy ID, żeby łatwo było go stylować
    panel.innerHTML = `
        <div style="position: fixed; top: 60px; right: 15px; z-index: 10000; 
            background: rgba(45, 34, 23, 0.95); color: #e6d3a7; padding: 12px; 
            border: 2px solid #7a5a3a; font-family: 'Verdana', sans-serif; 
            font-size: 11px; border-radius: 8px; box-shadow: 0 0 15px rgba(0,0,0,0.7); width: 160px;">
            <div style="color: #f1c40f; font-weight: bold; margin-bottom: 8px; text-align: center; border-bottom: 1px solid #7a5a3a; padding-bottom: 5px;">
                MENU ROPUCHA
            </div>
            <label style="display: flex; align-items: center; cursor: pointer; margin-bottom: 8px;">
                <input type="checkbox" id="chk-wasd" ${getSetting('wasd') ? 'checked' : ''} style="margin-right: 8px;"> 
                <span>Sterowanie WASD</span>
            </label>
            <div style="font-size: 9px; margin-top: 10px; color: #7a5a3a; text-align: center; font-style: italic;">
                v${GM_info.script.version} | Moduły: 1
            </div>
        </div>
    `;
    document.body.appendChild(panel);

    // 3. Obsługa checkboxa
    document.getElementById('chk-wasd').addEventListener('change', (e) => {
        setSetting('wasd', e.target.checked);
        // Możemy odświeżyć stronę, żeby zmiany weszły w życie natychmiast, 
        // lub moduł sam będzie sprawdzał stan (nasz wasd.js sprawdza go przy każdym kliknięciu)
    });

})();
