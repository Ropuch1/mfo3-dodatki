(function() {
    'use strict';

    let lastActionTime = 0;
    const COOLDOWN = 250;

    const handleKeyX = function(e) {
        // Reaguj tylko na X
        if (e.key.toLowerCase() !== 'x') return;

        // Ignoruj, gdy piszesz w polach tekstowych
        const active = document.activeElement;
        if (['INPUT', 'TEXTAREA'].includes(active.tagName) || active.isContentEditable) return;

        const now = Date.now();
        if (now - lastActionTime < COOLDOWN) return;

        // Szukaj elementów dynamicznie przy każdym kliknięciu
        const battleDialog = document.querySelector('.BattleResultsDialog');
        const toEndBtn = document.querySelector('.BattlePlayback .to-end');

        // LOGIKA ZAMYKANIA RAPORTU
        if (battleDialog) {
            const closeBtn = battleDialog.closest('.WUI_Dialog')?.querySelector('.dialog-close') ||
                             document.getElementById('dialog0_content_close') ||
                             document.querySelector('.dialog-close');

            if (closeBtn) {
                e.preventDefault();
                e.stopImmediatePropagation();
                closeBtn.click();
                lastActionTime = now;
            }
            return;
        }

        // LOGIKA PRZESKOKU (#)
        if (toEndBtn && toEndBtn.offsetParent !== null) {
            e.preventDefault();
            e.stopImmediatePropagation();
            toEndBtn.click();
            lastActionTime = now;
        }
    };

    // Usuwamy starego listenera (jeśli był) i dodajemy nowego na window
    window.removeEventListener('keydown', handleKeyX, true);
    window.addEventListener('keydown', handleKeyX, true);

})();
