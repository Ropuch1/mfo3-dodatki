(function() {
    'use strict';

    let czyWWalce = false;
    let kliknietoWTejWalce = false;

    // Pomocnicza funkcja do losowania czasu w milisekundach
    const losujCzas = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

    // Pomocnicza funkcja z drugiego skryptu do sprawdzania widoczności elementów
    const isVisible = (el) => {
        if (!el) return false;
        const style = window.getComputedStyle(el);
        return !!(el.offsetWidth || el.offsetHeight || el.getClientRects().length) && 
               style.display !== 'none' && 
               style.visibility !== 'hidden';
    };

    // Funkcja realizująca automatyczny przeskok walki oraz zamknięcie raportu po przeskoku
    const wykonajZamykanieIPrzeskok = () => {
        // 1. SZUKANIE PRZYCISKU PRZESKOKU (#)
        const toEndBtns = Array.from(document.querySelectorAll('.BattlePlayback .to-end'));
        const activeToEndBtn = toEndBtns.find(isVisible);

        if (activeToEndBtn) {
            activeToEndBtn.click();
            console.log("%c[AutoFenris] Kliknięto przeskok walki.", "color: #17a2b8;");
        }

        // 2. SZUKAMY WSZYSTKICH RAPORTÓW (BattleResultsDialog) I ZAMYKAMY JE
        let proby = 0;
        const interval = setInterval(() => {
            proby++;
            const allDialogs = Array.from(document.querySelectorAll('.BattleResultsDialog'));
            const visibleDialogs = allDialogs.filter(isVisible);

            if (visibleDialogs.length > 0) {
                visibleDialogs.forEach(dialog => {
                    const closeBtn = dialog.closest('.WUI_Dialog')?.querySelector('.dialog-close') ||
                                     document.getElementById('dialog0_content_close') ||
                                     document.querySelector('.dialog-close');
                    if (closeBtn) closeBtn.click();
                });
                console.log("%c[AutoFenris] Zamknięto raport z wynikiem walki.", "color: #28a745;");
                clearInterval(interval);
            }

            if (proby >= 10) clearInterval(interval); // Zakończ próby po 5 sekundach
        }, 500);
    };

    // DOKŁADNIE TWOJA FUNKCJA KLIKAJĄCA (BEZ ZMIAN)
    const wykonajLogikeF = () => {
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

        if (!clickByText("Aktywuj auto-walkę")) {
            console.log("%c[AutoFenris] MFO3: Otwieram opcje w tle...", "color: #ffc107; font-weight: bold;");
            clickByText("Opcje");

            // Losowe małe opóźnienie między Opcjami a kliknięciem Auto-walki (40 - 90 ms)
            const opoznienieMenu = losujCzas(40, 90);
            setTimeout(() => {
                if (clickByText("Aktywuj auto-walkę")) {
                    console.log("%c[AutoFenris] SUCCESS: Auto-walka kliknięta!", "color: #28a745; font-weight: bold; font-size: 13px;");
                } else {
                    console.log("%c[AutoFenris] ERROR: Nie znaleziono przycisku po otwarciu opcji.", "color: #dc3545; font-weight: bold;");
                }
            }, opoznienieMenu);
        } else {
            console.log("%c[AutoFenris] SUCCESS: Auto-walka aktywowana błyskawicznie.", "color: #28a745; font-weight: bold; font-size: 13px;");
        }
    };

    // Obserwator walki
    const inicjalizujObserwator = () => {
        const targetNode = document.body;
        if (!targetNode) {
            setTimeout(inicjalizujObserwator, 50);
            return;
        }

        const observer = new MutationObserver(() => {
            const arena = document.getElementById('BattleArena');
            const isVisible = arena && arena.style.display !== 'none';

            // Reset po walce
            if (!isVisible && czyWWalce) {
                czyWWalce = false;
                kliknietoWTejWalce = false;
                console.log("%c[AutoFenris] Walka zakończona. Reset blokady.", "color: #6c757d;");
                return;
            }

            // Wykrycie startu walki
            if (isVisible && !czyWWalce) {
                czyWWalce = true;

                // Czekamy 400ms na załadowanie interfejsu
                setTimeout(() => {
                    const enemies = document.querySelector('.BattleMenuLeft');

                    if (enemies && enemies.textContent.includes("Fenris")) {
                        if (!kliknietoWTejWalce) {
                            kliknietoWTejWalce = true; // Rezerwujemy od razu, by nie odpałować kilku timerów

                            // Losowanie opóźnienia od 1200 ms (1.2s) do 2800 ms (2.8s)
                            const opoznienieAkcji = losujCzas(1200, 2800);
                            console.log(`%c[AutoFenris] !!! WYKRYTO FENRISA !!! Czekam ${(opoznienieAkcji/1000).toFixed(2)}s przed wciśnięciem F...`, "color: #007bff; font-weight: bold; font-size: 13px;");

                            setTimeout(wykonajLogikeF, opoznienieAkcji);

                            // Automatyczne przeskoczenie i zamknięcie walki po ok. 5 sekundach (4800-5300ms)
                            const opoznienieZamykania = losujCzas(4800, 5300);
                            console.log(`%c[AutoFenris] Przeskok i zamknięcie ustawione za ${(opoznienieZamykania/1000).toFixed(2)}s...`, "color: #17a2b8;");
                            setTimeout(wykonajZamykanieIPrzeskok, opoznienieZamykania);
                        }
                    } else {
                        console.log("[AutoFenris] Wykryto walkę, ale przeciwnik to nie Fenris.");
                    }
                }, 400);
            }
        });

        observer.observe(targetNode, { childList: true, subtree: true });
        console.log("%c[AutoFenris] Skrypt gotowy do działania!", "color: #28a745; font-weight: bold;");
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', inicjalizujObserwator);
    } else {
        inicjalizujObserwator();
    }
})();
