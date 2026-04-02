// MODUŁ LECZENIE I ODŚWIEŻANIE - Ładowany przez Panel Ropucha
(function() {
    'use strict';

    function isTyping() {
        return document.activeElement.tagName === 'INPUT' ||
               document.activeElement.tagName === 'TEXTAREA' ||
               document.activeElement.isContentEditable;
    }

    function doHeal(e) {
        if (!isTyping()) {
            const btn = document.querySelector('a[id$="_widget_heal_autoheal"]');
            if (btn) {
                if (e) e.preventDefault();
                btn.click();
            }
        }
    }

    function doRefresh(e) {
        if (!isTyping()) {
            if (e) e.preventDefault();
            location.reload();
        }
    }

    document.addEventListener('keydown', function(e) {
        if (e.code === 'KeyT') doHeal(e);
        if (e.code === 'KeyR') doRefresh(e);
    });

    document.addEventListener('mousedown', function(e) {
        if (e.button === 3) doHeal(e); // Mouse 4
        if (e.button === 4) doRefresh(e); // Mouse 5
    });

    console.log("Moduł Leczenie/Odśwież załadowany.");
})();
