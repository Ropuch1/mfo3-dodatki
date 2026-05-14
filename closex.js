(function() {
    'use strict';

    let lastActionTime = 0;
    const COOLDOWN = 200; 

    const performAction = (e) => {
        // Blokada na klawisz X
        if (e.key.toLowerCase() !== 'x') return;

        // Sprawdzenie czy użytkownik nie pisze wiadomości
        const active = document.activeElement;
        if (['INPUT', 'TEXTAREA'].includes(active.tagName) || active.isContentEditable) return;

        const now = Date.now();
        if (now - lastActionTime < COOLDOWN) return;

        // Szukanie elementów (zawsze świeże zapytanie do DOM)
        const closeBtn = document.querySelector('.BattleResultsDialog .dialog-close, .WUI_Dialog .dialog-close, #dialog0_content_close, .battle-results .close-btn');
        const toEndBtn = document.querySelector('.BattlePlayback .to-end, .battle-skip-button, button[label="#"], .skip-battle-btn, [data-tooltip*="Przeskocz"]');

        // Logika zamknięcia raportu (priorytet)
        if (closeBtn && (closeBtn.offsetParent !== null || window.getComputedStyle(closeBtn).display !== 'none')) {
            closeBtn.click();
            lastActionTime = now;
            e.preventDefault();
            e.stopImmediatePropagation();
            return;
        }

        // Logika przeskoku animacji (#)
        if (toEndBtn && (toEndBtn.offsetParent !== null || window.getComputedStyle(toEndBtn).display !== 'none')) {
            toEndBtn.click();
            lastActionTime = now;
            e.preventDefault();
            e.stopImmediatePropagation();
        }
    };

    // Nasłuchiwanie z flagą 'true' (przechwytywanie przed skryptami gry)
    window.addEventListener('keydown', performAction, true);
})();
