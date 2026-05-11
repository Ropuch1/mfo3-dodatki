(function() {
    window.addEventListener('keydown', function(e) {
        if (e.key.toLowerCase() === 'x') {
            // Blokada jeśli piszesz na czacie
            if (['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) return;

            const battleDialog = document.querySelector('.BattleResultsDialog');
            if (battleDialog) {
                // Szuka krzyżyka w różnych typach okien gry
                const closeBtn = battleDialog.closest('.WUI_Dialog')?.querySelector('.dialog-close') || 
                                 document.getElementById('dialog0_content_close') ||
                                 document.querySelector('.dialog-close');

                if (closeBtn) {
                    closeBtn.click();
                    e.preventDefault();
                    e.stopPropagation();
                }
            }
        }
    }, true);

})();
