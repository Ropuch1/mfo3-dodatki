// ==UserScript==
// @name         MFO3 - Mega Panel Ropucha
// @namespace    http://tampermonkey.net/
// @version      7.1
// @description  Zintegrowany panel sterowania: WASD i zarządzanie dodatkami
// @author       Ropuch1
// @match        *://*.mfo3.pl/*
// @grant        none
// @run-at       document-end
// @updateURL    https://raw.githubusercontent.com/Ropuch1/mfo3-dodatki/main/mfo3_panel.user.js
// @downloadURL  https://raw.githubusercontent.com/Ropuch1/mfo3-dodatki/main/mfo3_panel.user.js
// ==/UserScript==

(function() {
    'use strict';

    // --- 1. SYSTEM ZAPISYWANIA USTAWIEŃ (Local Storage) ---
    const getSetting = (name) => localStorage.getItem('mfo3_' + name) === 'true';
    const setSetting = (name, value) => localStorage.setItem('mfo3_' + name, value);

    // Domyślnie włączamy WASD przy pierwszym uruchomieniu
    if (localStorage.getItem('mfo3_wasd') === null) setSetting('wasd', true);

    // --- 2. TWORZENIE PANELU UI ---
    const panel = document.createElement('div');
    panel.innerHTML = `
        <div id="mfo-panel" style="position: fixed; top: 60px; right: 15px; z-index: 10000; 
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
            <label style="display: flex; align-items: center; color: #888; margin-bottom: 5px; opacity: 0.6;">
                <input type="checkbox" disabled style="margin-right: 8px;"> 
                <span>Auto-Leczenie</span>
            </label>
            <div style="font-size: 9px; margin-top: 10px; color: #7a5a3a; text-align: center; font-style: italic;">
                v7.1 by Ropuch1
            </div>
        </div>
    `;
    document.body.appendChild(panel);

    // Reakcja na kliknięcie w checkbox
    document.getElementById('chk-wasd').addEventListener('change', (e) => {
        setSetting('wasd', e.target.checked);
    });

    // --- 3. LOGIKA WASD (PRZEROBIONA) ---
    const keyMap = {
        'w': { key: 'ArrowUp', code: 'ArrowUp', keyCode: 38 },
        'a': { key: 'ArrowLeft', code: 'ArrowLeft', keyCode: 37 },
        's': { key: 'ArrowDown', code: 'ArrowDown', keyCode: 40 },
        'd': { key: 'ArrowRight', code: 'ArrowRight', keyCode: 39 }
    };

    const handleKey = (e) => {
        // KLUCZOWE: Sprawdzamy czy dodatek jest aktywny w panelu
        if (!getSetting('wasd')) return;

        const char = e.key.toLowerCase();
        if (!keyMap[char]) return;

        // Blokada dla czatu
        const active = document.activeElement;
        if (active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA' || active.isContentEditable)) return;

        // Celowanie w silnik mapy
        const mapFrame = document.getElementById('map-frame') || document.querySelector('.MapEngine');

        if (mapFrame) {
            e.preventDefault();
            e.stopPropagation();

            const eventData = {
                key: keyMap[char].key,
                code: keyMap[char].code,
                keyCode: keyMap[char].keyCode,
                which: keyMap[char].keyCode,
                bubbles: true,
                cancelable: true
            };

            // Wyzwalanie zdarzenia w zależności od typu (keydown/keyup)
            const newEv = new KeyboardEvent(e.type, eventData);
            Object.defineProperty(newEv, 'keyCode', { value: keyMap[char].keyCode });
            mapFrame.dispatchEvent(newEv);
        }
    };

    // Nasłuchiwanie klawiszy
    window.addEventListener('keydown', handleKey, true);
    window.addEventListener('keyup', handleKey, true);

    console.log("MFO3 Mega Panel: Aktywny.");
})();
