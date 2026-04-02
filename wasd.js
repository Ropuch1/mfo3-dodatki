// ==UserScript==
// @name         MFO3 - WASD (Moduł)
// @version      7.0
// @match        *://*.mfo3.pl/*
// @grant        none
// @updateURL    https://raw.githubusercontent.com/Ropuch1/mfo3-dodatki/main/wasd.js
// @downloadURL  https://raw.githubusercontent.com/Ropuch1/mfo3-dodatki/main/wasd.js
// ==/UserScript==

(function() {
    'use strict';

    const keyMap = {
        'w': { key: 'ArrowUp', code: 'ArrowUp', keyCode: 38 },
        'a': { key: 'ArrowLeft', code: 'ArrowLeft', keyCode: 37 },
        's': { key: 'ArrowDown', code: 'ArrowDown', keyCode: 40 },
        'd': { key: 'ArrowRight', code: 'ArrowRight', keyCode: 39 }
    };

    const handleKey = (e) => {
        // SPRAWDZENIE PANELU: Jeśli w localStorage jest 'false', nic nie rób
        if (localStorage.getItem('mfo3_wasd') === 'false') return;

        const char = e.key.toLowerCase();
        if (!keyMap[char]) return;

        const active = document.activeElement;
        if (active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA')) return;

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

            if (e.type === 'keydown') {
                const downEv = new KeyboardEvent('keydown', eventData);
                Object.defineProperty(downEv, 'keyCode', { value: keyMap[char].keyCode });
                mapFrame.dispatchEvent(downEv);
            } else {
                const upEv = new KeyboardEvent('keyup', eventData);
                Object.defineProperty(upEv, 'keyCode', { value: keyMap[char].keyCode });
                mapFrame.dispatchEvent(upEv);
            }
        }
    };

    window.addEventListener('keydown', handleKey, true);
    window.addEventListener('keyup', handleKey, true);
    console.log("MFO3 WASD 7.0: Aktywny (zintegrowany z panelem)");
})();
