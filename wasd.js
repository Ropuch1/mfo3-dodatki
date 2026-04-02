(function() {
    'use strict';
    console.log("%c[WASD] Silnik aktywny - Szukam mapy...", "color: #3498db; font-weight: bold;");

    const keyMap = {
        'w': { key: 'ArrowUp', keyCode: 38 },
        'a': { key: 'ArrowLeft', keyCode: 37 },
        's': { key: 'ArrowDown', keyCode: 40 },
        'd': { key: 'ArrowRight', keyCode: 39 }
    };

    const handler = (e) => {
        const char = e.key.toLowerCase();
        if (!keyMap[char]) return;
        
        // Blokada pisania na czacie
        if (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA') return;

        e.preventDefault();
        e.stopImmediatePropagation();

        // Szukamy elementu mapy - sprawdzamy wszystkie możliwe miejsca
        const target = document.querySelector('#map-canvas') || 
                       document.querySelector('.MapEngine') || 
                       document.querySelector('canvas') ||
                       window;

        const eventData = {
            key: keyMap[char].key,
            code: keyMap[char].key,
            keyCode: keyMap[char].keyCode,
            which: keyMap[char].keyCode,
            bubbles: true,
            cancelable: true,
            view: window,
            isTrusted: true // Próbujemy zasugerować, że to prawdziwy klik
        };

        const newEv = new KeyboardEvent(e.type, eventData);
        
        // "Magiczne" nadpisanie parametrów, których gra wymaga do ruchu
        Object.defineProperty(newEv, 'keyCode', { value: keyMap[char].keyCode });
        Object.defineProperty(newEv, 'which', { value: keyMap[char].keyCode });

        // Wysyłamy zdarzenie prosto do mapy
        target.dispatchEvent(newEv);
    };

    // Rejestrujemy zdarzenia na najwyższym poziomie
    window.addEventListener('keydown', handler, true);
    window.addEventListener('keyup', handler, true);
})();
