(function() {
    'use strict';

    let czyWWalce = false;
    let kliknietoWTejWalce = false;

    // Funkcja klikająca
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
        const czyMamJuzAuto = document.querySelector('.item.me.auto-battle');
        if (czyMamJuzAuto) return;

        console.log("MFO3 [AutoFenris]: Klikam autowalkę.");
        if (!clickByText("Aktywuj auto-walkę")) {
            clickByText("Opcje");
            setTimeout(() => {
                clickByText("Aktywuj auto-walkę");
            }, 30);
        }
    };

    // Główna logika obserwatora
    const inicjalizujObserwator = () => {
        const targetNode = document.body;
        if (!targetNode) {
            // Jeśli jakimś cudem body nadal nie ma, spróbuj ponownie za chwilę
            setTimeout(inicjalizujObserwator, 50);
            return;
        }

        const observer = new MutationObserver(() => {
            if (localStorage.getItem('mfo3_setting_autofenris') !== 'true') return;

            const arena = document.getElementById('BattleArena');
            const isVisible = arena && arena.style.display !== 'none';

            // 1. Koniec walki -> Reset
            if (!isVisible && czyWWalce) {
                czyWWalce = false;
                kliknietoWTejWalce = false;
                console.log("MFO3 [AutoFenris]: Walka zakończona. Blokada zdjęta.");
                return;
            }

            // 2. Początek walki -> Kliknięcie raz
            if (isVisible && !czyWWalce) {
                czyWWalce = true;

                // Sprawdzamy czy na arenie jest Fenris
                const enemies = document.querySelector('.BattleMenuLeft');
                if (enemies && enemies.textContent.includes("Fenris") && !kliknietoWTejWalce) {
                    kliknietoWTejWalce = true;
                    aktywujAutoWalke();
                }
            }
        });

        observer.observe(targetNode, { childList: true, subtree: true });
        console.log("MFO3 [AutoFenris]: Obserwator zainicjalizowany poprawnie.");
    };

    // Odpalamy dopiero, gdy struktura DOM jest w pełni gotowa
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', inicjalizujObserwator);
    } else {
        inicjalizujObserwator();
    }
})();
