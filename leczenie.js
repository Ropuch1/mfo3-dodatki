(function() {
    'use strict';
    console.log("%c[Leczenie] Uruchomione", "color: #2ecc71; font-weight: bold;");

    function doHeal() {
        const btn = document.querySelector('.auto-heal-link') || 
                    document.querySelector('a[id$="_widget_heal_autoheal"]') ||
                    document.querySelector('.auto-heal-btn');
        if (btn) btn.click();
    }

    window.addEventListener('keydown', (e) => {
        if (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA') return;
        
        // Pobieramy wartości ustawione przez użytkownika w panelu
        const keyHeal = localStorage.getItem('mfo3_val_heal_k_heal') || 'KeyT';
        const keyRef = localStorage.getItem('mfo3_val_heal_k_ref') || 'KeyR';

        if (e.code === keyHeal) { e.preventDefault(); doHeal(); }
        if (e.code === keyRef) { e.preventDefault(); location.reload(); }
    }, true);

    window.addEventListener('mousedown', (e) => {
        if (e.button === 1) { doHeal(); }
    }, true);
})();
