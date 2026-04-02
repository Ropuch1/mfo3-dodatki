(function() {
    'use strict';
    console.log("%c[WASD] Silnik uruchomiony!", "color: #3498db; font-weight: bold;");

    const keyMap = {
        'w': { key: 'ArrowUp', keyCode: 38 },
        'a': { key: 'ArrowLeft', keyCode: 37 },
        's': { key: 'ArrowDown', keyCode: 40 },
        'd': { key: 'ArrowRight', keyCode: 39 }
    };

    const handler = (e) => {
        const char = e.key.toLowerCase();
        if (!keyMap[char]) return;
        
        // Nie blokuj, jeśli piszesz na czacie
        if (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA') return;

        e.preventDefault();
        e.stopPropagation();

        // Wysyłamy zdarzenie do głównego okna gry
        const eventData = {
            key: keyMap[char].key,
            code: keyMap[char].key,
            keyCode: keyMap[char].keyCode,
            which: keyMap[char].keyCode,
            bubbles: true,
            cancelable: true
        };

        const newEv = new KeyboardEvent(e.type, eventData);
        // Nadpisywanie keyCode dla starszych przeglądarek
        Object.defineProperty(newEv, 'keyCode', { value: keyMap[char].keyCode });
        
        window.dispatchEvent(newEv);
        document.dispatchEvent(newEv);
    };

    window.addEventListener('keydown', handler, true);
    window.addEventListener('keyup', handler, true);
})();
