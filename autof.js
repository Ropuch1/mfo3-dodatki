(function() {
    'use strict';

    const clickByText = (text) => {
        const elements = document.querySelectorAll('div, span, .menuItemTitleDiv, .WUI_Button');
        for (let el of elements) {
            if (el.textContent.trim() === text) {
                el.click();
                return true;
            }
        }
        return false;
    };

    const aktywujAutoWalke = () => {
        if (!clickByText("Aktywuj auto-walkę")) {
            clickByText("Opcje");
            setTimeout(() => {
                clickByText("Aktywuj auto-walkę");
            }, 50);
        }
    };

    // Monitorowanie walki
    const monitor = setInterval(() => {
        // Sprawdzenie czy moduł włączony w panelu
        if (localStorage.getItem('mfo3_setting_autof') !== 'true') return;

        // Szukamy kontenera przeciwników
        const enemiesContainer = document.querySelector('.BattleMenuLeft');
        if (enemiesContainer && enemiesContainer.textContent.includes("Fenris")) {
            // Dodatkowe zabezpieczenie: nie klikaj jeśli już jest włączona (opcjonalnie)
            // Jeśli auto-walka jest aktywna, zazwyczaj przycisk "Aktywuj auto-walkę" znika lub zmienia tekst
            aktywujAutoWalke();
        }
    }, 1000); // Sprawdzanie co 1 sekundę, żeby nie obciążać gry

    window.addEventListener('beforeunload', () => clearInterval(monitor));
})();
