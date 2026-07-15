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
        if (czyMamJuzAuto) {
            console.log("MFO3 [AutoFenris]: Postać ma już włączone auto. Przerywam.");
            return;
        }

        console.log("MFO3 [AutoFenris]: Próba kliknięcia auto-walki...");
        if (!clickByText("Aktywuj auto-walkę")) {
            console.log("MFO3 [AutoFenris]: Nie znaleziono przycisku bezpośrednio. Próbuję przez Opcje...");
            clickByText("Opcje");
            setTimeout(() => {
                if (clickByText("Aktywuj auto-walkę")) {
                    console.log("MFO3 [AutoFenris]: Sukces! Auto-walka włączona przez Opcje.");
                } else {
                    console.log("MFO3 [AutoFenris]: Błąd! Nie udało się kliknąć auto-walki nawet po otwarciu Opcji.");
                }
            }, 50);
        } else {
            console.log("MFO3 [AutoFenris]: Sukces! Auto-walka włączona bezpośrednio.");
        }
    };

    // Główna logika obserwatora
    const inicjalizujObserwator = () => {
        const targetNode = document.body;
        if (!targetNode) {
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
                console.log("MFO3 [AutoFenris]: Walka zakończona. Resetuję blokady.");
                return;
            }

            // 2. Początek walki -> Logowanie i próba wykrycia Fenrisa
            if (isVisible && !czyWWalce) {
                czyWWalce = true;
                console.log("MFO3 [AutoFenris]: Arena wykryta! Czekam 300ms na załadowanie interfejsu...");

                // Dajemy grze 300ms na wyrenderowanie tekstu "Fenris" w BattleMenuLeft
                setTimeout(() => {
                    const enemies = document.querySelector('.BattleMenuLeft');
                    
                    if (!enemies) {
                        console.log("MFO3 [AutoFenris]: Nie znaleziono kontenera .BattleMenuLeft!");
                        return;
                    }

                    console.log("MFO3 [AutoFenris]: Wykryte teksty w menu walki: ", enemies.textContent);

                    if (enemies.textContent.includes("Fenris")) {
                        console.log("MFO3 [AutoFenris]: !!! WYKRYTO FENRISA !!!");
                        if (!kliknietoWTejWalce) {
                            kliknietoWTejWalce = true;
                            aktywujAutoWalke();
                        }
                    } else {
                        console.log("MFO3 [AutoFenris]: W tej walce nie ma Fenrisa.");
                    }
                }, 300);
            }
        });

        observer.observe(targetNode, { childList: true, subtree: true });
        console.log("MFO3 [AutoFenris]: Obserwator zainicjalizowany poprawnie.");
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', inicjalizujObserwator);
    } else {
        inicjalizujObserwator();
    }
})();
