(function() {
    'use strict';

    // 1. Blokada okienka potwierdzenia
    window.confirm = function() { return true; };

    window.addEventListener('keydown', function(e) {
        if (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA') return;

        if (e.key.toLowerCase() === 'f') {

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

            // KROK 1: Spróbuj kliknąć auto-walkę (może menu już jest w DOM, ale ukryte)
            if (!clickByText("Aktywuj auto-walkę")) {

                // KROK 2: Jeśli nie znalazł, kliknij "Opcje"
                console.log("MFO3: Otwieram opcje w tle...");
                clickByText("Opcje");

                // KROK 3: Czekaj ułamek sekundy i kliknij auto-walkę
                setTimeout(() => {
                    if (clickByText("Aktywuj auto-walkę")) {
                        console.log("MFO3: Auto-walka kliknięta!");
                    }
                }, 30);
            } else {
                console.log("MFO3: Auto-walka aktywowana błyskawicznie.");
            }
        }
    });
})();
