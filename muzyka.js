(function() {
    'use strict';

    const getLink = () => localStorage.getItem('mfo3_val_przegrana_s_link');
    const getVolume = () => parseFloat(localStorage.getItem('mfo3_defeat_volume')) || 0.5;

    let audio = new Audio();

    setInterval(() => {
        // Znajdź wszystkie okna wyników walki
        const resultDialogs = document.querySelectorAll('.BattleResultsDialog');
        
        resultDialogs.forEach(dialog => {
            if (dialog.getAttribute('data-defeat-played') === 'true') return;

            // Szukamy sekcji przegranych (gdzie ID kończy się na _loosers)
            const loosersSection = dialog.querySelector('[id$="_loosers"]');
            
            if (loosersSection) {
                // Znajdź wszystkich zawodników w tej sekcji
                const allFighters = Array.from(loosersSection.querySelectorAll('.fighter-cnt'));
                
                // Sprawdź czy jest tam jakikolwiek gracz (real_id zaczyna się od P:)
                const isPlayerDefeat = allFighters.some(cnt => {
                    const fighterSpan = cnt.querySelector('.fighter');
                    return fighterSpan && (fighterSpan.getAttribute('real_id') || '').startsWith('P:');
                });

                // Jeśli w przegranych jest gracz (P:), graj dźwięk
                if (isPlayerDefeat) {
                    const link = getLink();
                    if (link) {
                        audio.src = link;
                        audio.volume = getVolume();
                        audio.play().catch(e => console.log("Przegrana: Kliknij w grę!"));
                    }
                }
            }
            
            // Oznaczamy okno jako obsłużone
            dialog.setAttribute('data-defeat-played', 'true');
        });
    }, 500);
})();
