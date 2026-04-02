(function() {
    'use strict';
    // USUNĘLIŚMY STĄD IF (LOCALSTORAGE...) - to ważne!

    const keyMap = {
        'w': { key: 'ArrowUp', keyCode: 38 },
        'a': { key: 'ArrowLeft', keyCode: 37 },
        's': { key: 'ArrowDown', keyCode: 40 },
        'd': { key: 'ArrowRight', keyCode: 39 }
    };

    window.addEventListener('keydown', (e) => {
        const char = e.key.toLowerCase();
        if (!keyMap[char] || (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA')) return;
        const mapFrame = document.getElementById('map-frame') || document.querySelector('.MapEngine');
        if (mapFrame) {
            e.preventDefault();
            const downEv = new KeyboardEvent('keydown', { key: keyMap[char].key, keyCode: keyMap[char].keyCode, bubbles: true });
            Object.defineProperty(downEv, 'keyCode', { value: keyMap[char].keyCode });
            mapFrame.dispatchEvent(downEv);
        }
    }, true);

    window.addEventListener('keyup', (e) => {
        const char = e.key.toLowerCase();
        if (!keyMap[char]) return;
        const mapFrame = document.getElementById('map-frame') || document.querySelector('.MapEngine');
        if (mapFrame) {
            const upEv = new KeyboardEvent('keyup', { key: keyMap[char].key, keyCode: keyMap[char].keyCode, bubbles: true });
            Object.defineProperty(upEv, 'keyCode', { value: keyMap[char].keyCode });
            mapFrame.dispatchEvent(upEv);
        }
    }, true);
})();
