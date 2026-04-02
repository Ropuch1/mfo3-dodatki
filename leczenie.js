(function() {
    'use strict';
    console.log("%c[Leczenie] Silnik uruchomiony!", "color: #e74c3c; font-weight: bold;");

    function doHeal() {
        const btn = document.querySelector('.auto-heal-link') || 
                    document.querySelector('a[id$="_widget_heal_autoheal"]') ||
                    document.querySelector('.auto-heal-btn');
        if (btn) {
            btn.click();
            console.log("[Leczenie] Kliknięto!");
        } else {
            console.log("[Leczenie] Nie znaleziono przycisku.");
        }
    }

    window.addEventListener('keydown', (e) => {
        if (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA') return;
        
        if (e.code === 'KeyT') { 
            e.preventDefault(); 
            doHeal(); 
        }
        if (e.code === 'KeyR') { 
            e.preventDefault(); 
            location.reload(); 
        }
    }, true);

    // Myszka (M4/M5)
    window.addEventListener('mousedown', (e) => {
        if (e.button === 1) { doHeal(); }
        if (e.button === 1) { location.reload(); }
    }, true);
})();
