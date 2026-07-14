(function() {
    'use strict';

    // 1. Blokada okienka potwierdzenia
    window.confirm = function() { return true; };

    // Funkcja do klikania w przyciski po tekście
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

    // Główna logika aktywacji auto-walki
    const aktywujAutoWalke = () => {
        if (!clickByText("Aktywuj auto-walkę")) {
            clickByText("Opcje");
            setTimeout(() => {
                clickByText("Aktywuj auto-walkę");
            }, 30);
        }
    };

    // 2. Obsługa klawisza F
    window.addEventListener('keydown', function(e) {
        if (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA') return;
        if (e.key.toLowerCase() === 'f') {
            aktywujAutoWalke();
        }
    });

    // 3. Automatyczne wykrywanie Fenrisa (Monitorowanie walki)
    setInterval(() => {
        // Szukamy elementu z nazwą przeciwnika (dostosuj selektor, jeśli MFO3 ma inny dla okna walki)
        const nazwaPrzeciwnika = document.querySelector('.battle-opponent-name') || // przykładowa klasa
                                 document.querySelector('[data-name="Fenris"]'); 

        if (nazwaPrzeciwnika && nazwaPrzeciwnika.textContent.includes("Fenris")) {
            console.log("MFO3: Wykryto Fenrisa! Aktywuję auto-walkę...");
            aktywujAutoWalke();
        }
    }, 500); // Sprawdzanie co 500ms

})();
