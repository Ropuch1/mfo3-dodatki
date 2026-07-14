(function() {
    'use strict';

    // 1. Blokada okienka potwierdzenia
    window.confirm = function() { return true; };

    // FUNKCJA SZUKAJĄCA PRZYCISKU PO TEKŚCIE
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
        console.log("MFO3: Próba aktywacji auto-walki...");
        // Jeśli przycisk "Aktywuj auto-walkę" nie istnieje, prawdopodobnie już jest włączona
        if (!clickByText("Aktywuj auto-walkę")) {
            clickByText("Opcje");
            setTimeout(() => {
                clickByText("Aktywuj auto-walkę");
            }, 50);
        }
    };

    // --- OBSŁUGA RĘCZNA (Klawisz F) ---
    window.addEventListener('keydown', function(e) {
        if (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA') return;
        if (e.key.toLowerCase() === 'f') {
            aktywujAutoWalke();
        }
    });

    // --- OBSŁUGA AUTOMATYCZNA (Fenris) ---
    const observer = new MutationObserver((mutations) => {
        // Sprawdzamy tylko jeśli dodatek jest włączony w panelu
        if (localStorage.getItem('mfo3_setting_autof') !== 'true') return;

        // Szukamy tekstu "Fenris" wewnątrz kontenera przeciwników
        const enemiesContainer = document.querySelector('.BattleMenuLeft');
        if (enemiesContainer && enemiesContainer.textContent.includes("Fenris")) {
            
            // Sprawdzenie: czy auto-walka nie jest już włączona?
            // Element z klasą "auto-battle" zazwyczaj oznacza włączony tryb
            const isAlreadyActive = document.querySelector('.item.auto-battle.active');
            
            if (!isAlreadyActive) {
                console.log("MFO3: Wykryto Fenrisa, włączam auto-walkę!");
                aktywujAutoWalke();
            }
        }
    });

    // Obserwujemy zmiany w strukturze strony
    observer.observe(document.body, { childList: true, subtree: true });

})();
