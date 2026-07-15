(function() {
    'use strict';

    let czyWWalce = false;
    let kliknietoWTejWalce = false;

    // Funkcja szukająca i klikająca przycisk po tekście
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
        // Jeśli postać ma już włączoną autowalkę, nic nie klikaj
        const czyMamJuzAuto = document.querySelector('.item.me.auto-battle');
        if (czyMamJuzAuto) return;

        console.log("MFO3 [AutoFenris]: Klikam autowalkę.");
        if (!clickByText("Aktywuj auto-walkę")) {
            clickByText("Opcje");
            setTimeout(() => {
                clickByText("Aktywuj auto-walkę");
            }, 30); // To minimalne opóźnienie jest wymagane przez silnik gry, aby menu opcji zdążyło się otworzyć
        }
    };

    // Obserwator reagujący TYLKO na wejście/wyjście z walki (zmiany struktury DOM)
    const observer = new MutationObserver(() => {
        // Sprawdzamy czy dodatek jest aktywny w panelu
        if (localStorage.getItem('mfo3_setting_autofenris') !== 'true') return;

        const arena = document.getElementById('BattleArena');
        const isVisible = arena && arena.style.display !== 'none';

        // SCENARIUSZ 1: Wyjście z walki (koniec walki) -> Resetujemy flagi
        if (!isVisible && czyWWalce) {
            czyWWalce = false;
            kliknietoWTejWalce = false;
            console.log("MFO3 [AutoFenris]: Walka zakończona. Blokada zdjęta.");
            return;
        }

        // SCENARIUSZ 2: Początek walki (wejście na arenę)
        if (isVisible && !czyWWalce) {
            czyWWalce = true; // Zaznaczamy, że walka trwa. Ten blok wykona się tylko RAZ na walkę.

            // Sprawdzamy przeciwnika w momencie zainicjowania areny
            const enemies = document.querySelector('.BattleMenuLeft');
            if (enemies && enemies.textContent.includes("Fenris") && !kliknietoWTejWalce) {
                kliknietoWTejWalce = true; // Natychmiastowa blokada na tę walkę
                aktywujAutoWalke();
            }
        }
    });

    observer.observe(document.body, { childList: true, subtree: true });
})();
