(function() {
    'use strict';

    const getLink = () => localStorage.getItem('mfo3_val_przegrana_s_link');
    const getVolume = () => parseFloat(localStorage.getItem('mfo3_defeat_volume')) || 0.5;

    let audio = new Audio();

    setInterval(() => {
        const resultDialogs = document.querySelectorAll('.BattleResultsDialog');
        
        resultDialogs.forEach(dialog => {
            if (dialog.getAttribute('data-defeat-played') === 'true') return;

            // Szukamy sekcji zwycięzców i przegranych
            const winnersSection = dialog.querySelector('[id$="_winners"]');
            const loosersSection = dialog.querySelector('[id$="_loosers"]');
            
            // Sprawdzamy czy w obu sekcjach jest jakikolwiek gracz (P:)
            const winnerIsPlayer = winnersSection ? Array.from(winnersSection.querySelectorAll('.fighter')).some(f => 
                (f.getAttribute('real_id') || '').startsWith('P:')
            ) : false;

            const looserIsPlayer = loosersSection ? Array.from(loosersSection.querySelectorAll('.fighter')).some(f => 
                (f.getAttribute('real_id') || '').startsWith('P:')
            ) : false;

            // LOGIKA: Jeśli w obu są gracze (PvP), NIE DZIAŁAMY
            // Działamy tylko jeśli w przegranych jest gracz, a w zwycięzcach go NIE MA (np. wygrana z bossem)
            if (looserIsPlayer && !winnerIsPlayer) {
                const link = getLink();
                if (link) {
                    audio.src = link;
                    audio.volume = getVolume();
                    audio.play().catch(e => console.log("Przegrana: Kliknij w grę!"));
                }
            }
            
            dialog.setAttribute('data-defeat-played', 'true');
        });
    }, 500);
})();
