(function() {
    'use strict';
    // USUNĘLIŚMY STĄD IF (LOCALSTORAGE...)

    function isTyping() {
        return document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA';
    }

    function doHeal() {
        const btn = document.querySelector('a[id$="_widget_heal_autoheal"]');
        if (btn) btn.click();
    }

    document.addEventListener('keydown', (e) => {
        if (!isTyping() && e.code === 'KeyT') { e.preventDefault(); doHeal(); }
        if (!isTyping() && e.code === 'KeyR') { e.preventDefault(); location.reload(); }
    });

    document.addEventListener('mousedown', (e) => {
        if (e.button === 3) { e.preventDefault(); doHeal(); }
        if (e.button === 4) { e.preventDefault(); location.reload(); }
    });
})();
