(function() {
    'use strict';

    let lastActionTime = 0;
    const COOLDOWN = 300; // Nieco zwiększony cooldown dla stabilności

    const isVisible = (el) => {
        if (!el) return false;
        const style = window.getComputedStyle(el);
        return !!(el.offsetWidth || el.offsetHeight || el.getClientRects().length) && 
               style.display !== 'none' && 
               style.visibility !== 'hidden';
    };

    const handleKeyX = function(e) {
        // Pobieramy wartość ustawioną przez użytkownika w panelu (domyślnie KeyX)
        const keyClose = localStorage.getItem('mfo3_val_close_k_close') || 'KeyX';

        if (e.code !== keyClose) return;

        const active = document.activeElement;
        if (['INPUT', 'TEXTAREA'].includes(active.tagName) || active.isContentEditable) return;

        const now = Date.now();
        if (now - lastActionTime < COOLDOWN) return;

        // 1. SZUKAMY WSZYSTKICH RAPORTÓW (BattleResultsDialog)
        const allDialogs = Array.from(document.querySelectorAll('.BattleResultsDialog'));
        const visibleDialogs = allDialogs.filter(isVisible);

        // JEŚLI SĄ JAKIEKOLWIEK OTWARTE RAPORTY - ZAMKNIJ JE WSZYSTKIE
        if (visibleDialogs.length > 0) {
            e.preventDefault();
            e.stopImmediatePropagation();
            
            visibleDialogs.forEach(dialog => {
                const closeBtn = dialog.closest('.WUI_Dialog')?.querySelector('.dialog-close') ||
                                 document.getElementById('dialog0_content_close') ||
                                 document.querySelector('.dialog-close');
                if (closeBtn) closeBtn.click();
            });

            lastActionTime = now;
            return; // Kończymy tutaj, żeby nie klikać przeskoku pod raportem
        }

        // 2. SZUKANIE PRZYCISKU PRZESKOKU (#)
        // Szukamy go TYLKO jeśli nie ma otwartych raportów (punkt wyżej)
        const toEndBtns = Array.from(document.querySelectorAll('.BattlePlayback .to-end'));
        const activeToEndBtn = toEndBtns.find(isVisible);

        if (activeToEndBtn) {
            e.preventDefault();
            e.stopImmediatePropagation();
            activeToEndBtn.click();
            lastActionTime = now;
        }
    };

    window.removeEventListener('keydown', handleKeyX, true);
    window.addEventListener('keydown', handleKeyX, true);
})();
