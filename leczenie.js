(function() {
    'use strict';

    // STRAŻNIK: Jeśli w panelu odznaczone, zatrzymaj skrypt
    if (localStorage.getItem('mfo3_heal') !== 'true') {
        console.log("Leczenie: Wyłączone w panelu.");
        return;
    }

    function isTyping() {
        return document.activeElement.tagName === 'INPUT' || 
               document.activeElement.tagName === 'TEXTAREA' || 
               document.activeElement.isContentEditable;
    }

    function doHeal() {
        const btn = document.querySelector('a[id$="_widget_heal_autoheal"]');
        if (btn) btn.click();
    }

    document.addEventListener('keydown', (e) => {
        if (isTyping()) return;
        if (e.code === 'KeyT') { e.preventDefault(); doHeal(); }
        if (e.code === 'KeyR') { e.preventDefault(); location.reload(); }
    });

    document.addEventListener('mousedown', (e) => {
        if (e.button === 3) { e.preventDefault(); doHeal(); }
        if (e.button === 4) { e.preventDefault(); location.reload(); }
    });

    console.log("Leczenie: Aktywne.");
})();
