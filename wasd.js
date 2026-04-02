(function() {
    'use strict';
    
    // STRAŻNIK: Jeśli w panelu odznaczone, zatrzymaj skrypt
    if (localStorage.getItem('mfo3_wasd') !== 'true') {
        console.log("WASD: Wyłączone w panelu.");
        return; 
    }

    const keyMap = {
        'w': { key: 'ArrowUp', keyCode: 38 },
        'a': { key: 'ArrowLeft', keyCode: 37 },
        's': { key: 'ArrowDown', keyCode: 40 },
        'd': { key: 'ArrowRight', keyCode: 39 }
    };

    const handleKey = (e) => {
        const char = e.key.toLowerCase();
        if (!keyMap[char]) return;
        if (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA') return;

        const mapFrame = document.getElementById('map-frame') || document.querySelector('.MapEngine');
        if (mapFrame) {
            e.preventDefault();
            const eventData = { key: keyMap[char].key, keyCode: keyMap[char].keyCode, bubbles: true };
            const newEv = new KeyboardEvent(e.type, eventData);
            Object.defineProperty(newEv, 'keyCode', { value: keyMap[char].keyCode });
            mapFrame.dispatchEvent(newEv);
        }
    };

    window.addEventListener('keydown', handleKey, true);
    window.addEventListener('keyup', handleKey, true);
    console.log("WASD: Aktywne.");
})();
