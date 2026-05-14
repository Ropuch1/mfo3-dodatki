(function() {
    'use strict';

    let lastActionTime = 0;
    const COOLDOWN = 200; 

    const handleAction = (e) => {
        // Tylko klawisz X
        if (e.key.toLowerCase() !== 'x') return;

        // Blokada jeśli użytkownik pisze
        const active = document.activeElement;
        if (['INPUT', 'TEXTAREA'].includes(active.tagName) || active.isContentEditable) return;

        const now = Date.now();
        if (now - lastActionTime < COOLDOWN) return;

        // --- SZUKANIE ELEMENTÓW ---
        // Szukamy przycisku zamknięcia (różne warianty klas)
        const closeBtn = document.querySelector('.BattleResultsDialog .dialog-close, .WUI_Dialog .dialog-close, #dialog0_content_close, .battle-results .close-btn, .close-battle-report');
        
        // Szukamy przycisku przeskoku (#)
        const toEndBtn = document.querySelector('.BattlePlayback .to-end, .battle-skip-button, button[label="#"], .skip-battle-btn, [data-tooltip*="Przeskocz"]');

        // --- LOGIKA KLIKANIA ---
        
        // 1. Jeśli jest raport (nawet jeśli toEndBtn też jest widoczny), zamknij go najpierw
        if (closeBtn && (closeBtn.offsetParent !== null || window.getComputedStyle(closeBtn).display !== 'none')) {
            closeBtn.click();
            lastActionTime = now;
            e.preventDefault();
            e.stopImmediatePropagation();
            return;
        }

        // 2. Jeśli trwa walka i jest przycisk #
        if (toEndBtn && (toEndBtn.offsetParent !== null || window.getComputedStyle(toEndBtn).visibility !== 'hidden')) {
            toEndBtn.click();
            lastActionTime = now;
            e.preventDefault();
            e.stopImmediatePropagation();
        }
    };

    // Używamy 'keydown' z parametrem 'true' (capture phase)
    // Dzięki temu nasz skrypt ma pierwszeństwo przed skryptami gry
    window.addEventListener('keydown', handleAction, true);

   
