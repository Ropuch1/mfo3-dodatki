(function() {
    'use strict';

    let lastActionTime = 0;
    const COOLDOWN = 250;

    // Funkcja pomocnicza do sprawdzania, czy element jest faktycznie widoczny dla gracza
    const isVisible = (el) => {
        if (!el) return false;
        const style = window.getComputedStyle(el);
        return !!(el.offsetWidth || el.offsetHeight || el.getClientRects().length) && 
               style.display !== 'none' && 
               style.visibility !== 'hidden';
    };

    const handleKeyX = function(e) {
        // Reaguj tylko na klawisz X (wielkość litery nie ma znaczenia)
        if (e.key.toLowerCase() !== 'x') return;

        // Ignoruj, gdy użytkownik pisze na czacie lub w polach tekstowych
        const active = document.activeElement;
        if (['INPUT', 'TEXTAREA'].includes(active.tagName) || active.isContentEditable) return;

        const now = Date.now();
        if (now - lastActionTime < COOLDOWN) return;

        // 1. SZUKANIE PRZYCISKU PRZESKOKU (#)
        // Szukamy wszystkich przycisków przeskoku i wybieramy ten, który jest widoczny
        const toEndBtns = Array.from(document.querySelectorAll('.BattlePlayback .to-end'));
        const activeToEndBtn = toEndBtns.find(isVisible);

        if (activeToEndBtn) {
            e.preventDefault();
            e.stopImmediatePropagation();
            activeToEndBtn.click();
            lastActionTime = now;
            return; // Jeśli kliknęliśmy przeskok, nie sprawdzamy zamykania raportu w tej samej milisekundzie
        }

        // 2. SZUKANIE PRZYCISKU ZAMKNIĘCIA RAPORTU
        // Szukamy aktywnego dialogu wyniku walki
        const battleDialogs = Array.from(document.querySelectorAll('.BattleResultsDialog'));
        const activeDialog = battleDialogs.find(isVisible);

        if (activeDialog) {
            // Próbujemy znaleźć przycisk zamknięcia (X w rogu lub specyficzne ID)
            const closeBtn = activeDialog.closest('.WUI_Dialog')?.querySelector('.dialog-close') ||
                             document.getElementById('dialog0_content_close') ||
                             document.querySelector('.dialog-close');

            if (isVisible(closeBtn)) {
                e.preventDefault();
                e.stopImmediatePropagation();
                closeBtn.click();
                lastActionTime = now;
            }
        }
    };

    // Czyszczenie i rejestracja eventu (capture: true pozwala wyprzedzić inne skrypty gry)
    window.removeEventListener('keydown', handleKeyX, true);
    window.addEventListener('keydown', handleKeyX, true);

    console.log('%c Skrypt na X (Przeskok/Zamknij) został załadowany! ', 'background: #222; color: #bada55');
})();
