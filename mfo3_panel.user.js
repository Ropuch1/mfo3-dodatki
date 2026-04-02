// ==UserScript==
// @name         MFO3 - Panel Dodatków
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Zintegrowany panel sterowania dodatkami do MFO3
// @author       Ropuch1
// @match        *://*.mfo3.pl/*
// @grant        none
// @updateURL    https://raw.githubusercontent.com/Ropuch1/mfo3-dodatki/main/mfo3_panel.user.js
// @downloadURL  https://raw.githubusercontent.com/Ropuch1/mfo3-dodatki/main/mfo3_panel.user.js
// ==/UserScript==

(function() {
    'use strict';

    // --- LOGIKA ZAPISYWANIA USTAWIEŃ ---
    const getSetting = (name) => localStorage.getItem('mfo3_' + name) === 'true';
    const setSetting = (name, value) => localStorage.setItem('mfo3_' + name, value);

    // Domyślne wartości przy pierwszym uruchomieniu
    if (localStorage.getItem('mfo3_wasd') === null) setSetting('wasd', true);

    // --- TWORZENIE PANELU UI ---
    const panel = document.createElement('div');
    panel.innerHTML = `
        <div id="mfo-panel" style="position: fixed; top: 60px; right: 15px; z-index: 10000; 
            background: rgba(45, 34, 23, 0.95); color: #e6d3a7; padding: 12px; 
            border: 2px solid #7a5a3a; font-family: 'Verdana', sans-serif; 
            font-size: 11px; border-radius: 8px; box-shadow: 0 0 15px rgba(0,0,0,0.7); width: 160px;">
            <div style="color: #f1c40f; font-weight: bold; margin-bottom: 8px; text-align: center; border-bottom: 1px solid #7a5a3a; padding-bottom: 5px;">
                MENU DODATKÓW
            </div>
            <label style="display: flex; align-items: center; cursor: pointer; margin-bottom: 8px;">
                <input type="checkbox" id="chk-wasd" ${getSetting('wasd') ? 'checked' : ''} style="margin-right: 8px;"> 
                <span>Sterowanie WASD</span>
            </label>
            <label style="display: flex; align-items: center; color: #888; margin-bottom: 5px; opacity: 0.6;">
                <input type="checkbox" disabled style="margin-right: 8px;"> 
                <span>Auto-Leczenie</span>
            </label>
            <div style="font-size: 9px; margin-top: 10px; color: #7a5a3a; text-align: center; font-style: italic;">
                v1.0 by Ropuch1
            </div>
        </div>
    `;
    document.body.appendChild(panel);

    // --- OBSŁUGA ZMIAN ---
    document.getElementById('chk-wasd').addEventListener('change', (e) => {
        setSetting('wasd', e.target.checked);
    });

    // --- LOGIKA WASD ---
    const keyMap = { 'w': 38, 'a': 37, 's': 40, 'd': 39 };
    const arrowNames = { 'w': 'ArrowUp', 'a': 'ArrowLeft', 's': 'ArrowDown', 'd': 'ArrowRight' };

    window.addEventListener('keydown', (e) => {
        if (!getSetting('wasd')) return;

        const char = e.key.toLowerCase();
        if (keyMap[char]) {
            const active = document.activeElement;
            if (active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA')) return;

            const mapFrame = document.getElementById('map-frame') || document.querySelector('.MapEngine');
            if (mapFrame) {
                e.preventDefault();
                const eventData = {
                    key: arrowNames[char],
                    keyCode: keyMap[char],
                    which: keyMap[char],
                    bubbles: true
                };
                const downEv = new KeyboardEvent('keydown', eventData);
                Object.defineProperty(downEv, 'keyCode', { value: keyMap[char] });
                mapFrame.dispatchEvent(downEv);
            }
        }
    }, true);

})();
