// ==UserScript==
// @name         MFO3 - Panel Ropucha
// @namespace    http://tampermonkey.net/
// @version      1.8
// @description  Panel sterowania dodatkami (WASD + Leczenie)
// @author       Ropuch1
// @match        *://*.mfo3.pl/*
// @grant        none
// @run-at       document-end
// @updateURL    https://raw.githubusercontent.com/Ropuch1/mfo3-dodatki/main/mfo3_panel.user.js
// @downloadURL  https://raw.githubusercontent.com/Ropuch1/mfo3-dodatki/main/mfo3_panel.user.js
//
// --- POŁĄCZENIE Z MODUŁAMI ---
// @require      https://raw.githubusercontent.com/Ropuch1/mfo3-dodatki/main/wasd.js
// @require      https://raw.githubusercontent.com/Ropuch1/mfo3-dodatki/main/leczenie.js
// ==/UserScript==

(function() {
    'use strict';

    const getSetting = (name) => localStorage.getItem('mfo3_' + name) === 'true';
    const setSetting = (name, value) => localStorage.setItem('mfo3_' + name, value);

    // Domyślne wartości
    if (localStorage.getItem('mfo3_wasd') === null) setSetting('wasd', true);
    if (localStorage.getItem('mfo3_heal') === null) setSetting('heal', true);

    const panel = document.createElement('div');
    panel.innerHTML = `
        <div id="mfo-panel" style="position: fixed; top: 60px; right: 15px; z-index: 10000; 
            background: rgba(45, 34, 23, 0.95); color: #e6d3a7; padding: 12px; 
            border: 2px solid #7a5a3a; font-family: Verdana; font-size: 11px; border-radius: 8px; width: 170px;">
            <b style="color: #f1c40f;">MENU ROPUCHA</b><br><br>
            <label style="display:block; margin-bottom:8px; cursor:pointer;">
                <input type="checkbox" id="chk-wasd" ${getSetting('wasd') ? 'checked' : ''}> Sterowanie WASD
            </label>
            <label style="display:block; cursor:pointer;">
                <input type="checkbox" id="chk-heal" ${getSetting('heal') ? 'checked' : ''}> Leczenie (T/M4)
            </label>
            <div style="font-size:9px; margin-top:10px; color: #7a5a3a; text-align: center; border-top: 1px solid #444; padding-top: 5px;">
                v1.8 | Zmień i odśwież (F5)
            </div>
        </div>
    `;
    document.body.appendChild(panel);

    document.getElementById('chk-wasd').addEventListener('change', (e) => setSetting('wasd', e.target.checked));
    document.getElementById('chk-heal').addEventListener('change', (e) => setSetting('heal', e.target.checked));
})();
