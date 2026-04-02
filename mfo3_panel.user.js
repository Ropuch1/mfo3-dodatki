// ==UserScript==
// @name         MFO3 - Panel Ropucha
// @namespace    http://tampermonkey.net/
// @version      2.0
// @description  Główny panel sterowania dodatkami (WASD + Leczenie)
// @author       Ropuch1
// @match        https://s1.mfo3.pl/game/
// @grant        none
// @run-at       document-end
// @updateURL    https://raw.githubusercontent.com/Ropuch1/mfo3-dodatki/main/mfo3_panel.user.js
// @downloadURL  https://raw.githubusercontent.com/Ropuch1/mfo3-dodatki/main/mfo3_panel.user.js
//
// --- WYMUSZENIE POBRANIA MODUŁÓW ---
// @require      https://raw.githubusercontent.com/Ropuch1/mfo3-dodatki/main/wasd.js
// @require      https://raw.githubusercontent.com/Ropuch1/mfo3-dodatki/main/leczenie.js
// ==/UserScript==

(function() {
    'use strict';

    // Funkcje do obsługi ustawień
    const getSetting = (name) => localStorage.getItem('mfo3_' + name) === 'true';
    const setSetting = (name, value) => localStorage.setItem('mfo3_' + name, value);

    // Ustawienie domyślne przy pierwszym uruchomieniu
    if (localStorage.getItem('mfo3_wasd') === null) setSetting('wasd', true);
    if (localStorage.getItem('mfo3_heal') === null) setSetting('heal', true);

    // Tworzenie wyglądu panelu
    const panel = document.createElement('div');
    panel.innerHTML = `
        <div id="ropuch-menu" style="position: fixed; top: 60px; right: 15px; z-index: 10000; 
            background: rgba(45, 34, 23, 0.95); color: #e6d3a7; padding: 12px; 
            border: 2px solid #7a5a3a; font-family: 'Verdana', sans-serif; 
            font-size: 11px; border-radius: 8px; box-shadow: 0 0 15px rgba(0,0,0,0.8); width: 170px;">
            
            <div style="color: #f1c40f; font-weight: bold; margin-bottom: 10px; text-align: center; border-bottom: 1px solid #7a5a3a; padding-bottom: 5px;">
                MENU ROPUCHA
            </div>
            
            <label style="display: flex; align-items: center; cursor: pointer; margin-bottom: 8px;">
                <input type="checkbox" id="chk-wasd" ${getSetting('wasd') ? 'checked' : ''} style="margin-right: 8px;"> 
                <span>Sterowanie WASD</span>
            </label>
            
            <label style="display: flex; align-items: center; cursor: pointer; margin-bottom: 8px;">
                <input type="checkbox" id="chk-heal" ${getSetting('heal') ? 'checked' : ''} style="margin-right: 8px;"> 
                <span>Leczenie (T / M4)</span>
            </label>
            
            <div style="font-size: 8px; margin-top: 10px; color: #7a5a3a; text-align: center; font-style: italic; border-top: 1px solid #444; padding-top: 5px;">
                v2.0 | Zmień i kliknij F5
            </div>
        </div>
    `;
    document.body.appendChild(panel);

    // Nasłuchiwanie zmian w checkboxach
    document.getElementById('chk-wasd').addEventListener('change', (e) => {
        setSetting('wasd', e.target.checked);
    });
    
    document.getElementById('chk-heal').addEventListener('change', (e) => {
        setSetting('heal', e.target.checked);
    });

})();
