// MODUŁ WASD 7.0 - Ładowany dynamicznie przez Panel Ropucha
(function() {
    'use strict';

    const keyMap = {
        'w': { key: 'ArrowUp', code: 'ArrowUp', keyCode: 38 },
        'a': { key: 'ArrowLeft', code: 'ArrowLeft', keyCode: 37 },
        's': { key: 'ArrowDown', code: 'ArrowDown', keyCode: 40 },
        'd': { key: 'ArrowRight', code: 'ArrowRight', keyCode: 39 }
    };

    const handleKey = (e) => {
        const char = e.key.toLowerCase();
        if (!keyMap[char]) return;

        // Sprawdzanie czy użytkownik nie pisze na czacie/polach tekstowych
        const active = document.activeElement;
        if (active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA' || active.isContentEditable)) return;

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

    // Rejestracja zdarzeń
    window.addEventListener('keydown', handleKey, true);
    window.addEventListener('keyup', handleKey, true);

    console.log("MFO3 WASD 7.0: Moduł wczytany pomyślnie!");
})();
