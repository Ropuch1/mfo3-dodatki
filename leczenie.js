(function() {
    'use strict';
    console.log("%c[Leczenie] Skróty klawiszowe załadowane!", "color: #2ecc71; font-weight: bold;");

    function doHeal() {
        const btn = document.querySelector('.auto-heal-link') || 
                    document.querySelector('a[id$="_widget_heal_autoheal"]') ||
                    document.querySelector('.auto-heal-btn');
        if (btn) {
            btn.click();
            console.log("[Leczenie] Wykonano!");
        }
    }

    window.addEventListener('keydown', (e) => {
        if (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA') return;
        
        // Pobieranie aktualnych ustawień z pamięci
        const keyHeal = localStorage.getItem('mfo3_key_heal') || 'KeyT';
        const keyReload = localStorage.getItem('mfo3_key_reload') || 'KeyR';

        if (e.code === keyHeal) { 
            e.preventDefault(); 
            doHeal(); 
        }
        if (e.code === keyReload) { 
            e.preventDefault(); 
            location.reload(); 
        }
    }, true);

    // Środkowy przycisk myszy
    window.addEventListener('mousedown', (e) => {
        if (e.button === 1) { 
            doHeal(); 
        }
    }, true);
})();
