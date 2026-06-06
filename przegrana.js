(function() {
    'use strict';

    const getLink = () => localStorage.getItem('mfo3_val_przegrana_s_link');
    const getVolume = () => parseFloat(localStorage.getItem('mfo3_defeat_volume')) || 0.5;

    let audio = new Audio();

    setInterval(() => {
        // Szukamy okna wyników walki, które jest oznaczone jako przegrana (looser)
        const resultDialog = document.querySelector('.BattleResultsDialog.looser');
        
        if (resultDialog && resultDialog.getAttribute('data-defeat-played') !== 'true') {
            
            // Skoro okno ma klasę 'looser' i jest otwarte, to znaczy, że przegrałeś
            // Dźwięk zagra natychmiast po wykryciu okna, bez sprawdzania klasy .selected
            const link = getLink();
            if (link) {
                audio.src = link;
                audio.volume = getVolume();
                audio.play().catch(e => console.log("Przegrana: Kliknij w grę, aby odblokować dźwięk"));
            }
            
            // Oznaczamy okno jako "obsłużone"
            resultDialog.setAttribute('data-defeat-played', 'true');
        }
    }, 500);
})();
