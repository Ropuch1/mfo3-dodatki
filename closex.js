(function() {
    'use strict';

    let lastActionTime = 0;
    const COOLDOWN = 250; // Czas blokady w milisekundach (0.25 sekundy)

    window.addEventListener('keydown', function(e) {
        if (e.key.toLowerCase() !== 'x') return;

        // Blokada jeśli piszesz na czacie
        if (['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) return;

        // Blokada spamowania klawiszem (zapobiega podwójnemu logowi)
        const now = Date.now();
        if (now - lastActionTime < COOLDOWN) return;

        // Zatrzymujemy inne zdarzenia
        e.preventDefault();
        e.stopImmediatePropagation();

        // 1. Sprawdzamy najpierw czy okno raportu już jest otwarte
        const battleDialog = document.querySelector('.BattleResultsDialog');

        if (battleDialog) {
            // Jeśli log jest otwarty, szukamy tylko przycisku zamknięcia
            const closeBtn = battleDialog.closest('.WUI_Dialog')?.querySelector('.dialog-close') ||
                             document.getElementById('dialog0_content_close') ||
                             document.querySelector('.dialog-close');

            if (closeBtn) {
                closeBtn.click();
                lastActionTime = now;
            }
            return; // Kończymy, nie sprawdzamy przycisku # gdy log jest otwarty
        }

        // 2. Jeśli log NIE jest otwarty, szukamy przycisku przeskoku (#)
        const toEndBtn = document.querySelector('.BattlePlayback .to-end');
        // Sprawdzamy czy przycisk istnieje i czy nie jest ukryty (np. przez display:none u rodzica)
        const isSkipVisible = toEndBtn && toEndBtn.offsetParent !== null;

        if (isSkipVisible) {
            toEndBtn.click();
            lastActionTime = now;
        }

    }, true);
})();
