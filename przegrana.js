(function() {
    'use strict';

    // Pobranie ustawień z localStorage (panel sam będzie je zapisywał)
    const getSetting = (id) => localStorage.getItem(`mfo3_val_przegrana_${id}`);
    
    // Funkcja odtwarzająca dźwięk
    function playDefeatSound() {
        const soundUrl = getSetting('s_link') || "https://github.com/Ropuch1/sdfgh/raw/refs/heads/main/1492896090981142568.mp3";
        if (!soundUrl) return;
        
        const audio = new Audio(soundUrl);
        audio.volume = parseFloat(localStorage.getItem('mfo3_defeat_volume')) || 0.5;
        audio.play().catch(e => console.log("Przegrana: Kliknij w grę, aby odblokować dźwięk"));
    }

    // Monitorowanie walki
    setInterval(() => {
        const resultDialog = document.querySelector('.BattleResultsDialog.looser');
        if (resultDialog && resultDialog.getAttribute('data-defeat-notified') !== 'true') {
            resultDialog.setAttribute('data-defeat-notified', 'true');
            playDefeatSound();
        }
    }, 500);
})();
