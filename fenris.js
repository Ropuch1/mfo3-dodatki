(function() {
    'use strict';

    let czyWWalce = false;
    let kliknietoWTejWalce = false;

    // Pomocnicza funkcja do losowania czasu w milisekundach
    const losujCzas = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

    // Sprawdzanie widoczności elementu w DOM
    const isVisible = (el) => {
        if (!el) return false;
        const style = window.getComputedStyle(el);
        return !!(el.offsetWidth || el.offsetHeight || el.getClientRects().length) && 
               style.display !== 'none' && 
               style.visibility !== 'hidden';
    };

    // Robustna funkcja przeskoku i zamykania okna wyników
    const wykonajZamykanieIPrzeskok = () => {
        // 1. Spróbuj kliknąć przycisk przeskoku (#)
        const toEndBtns = Array.from(document.querySelectorAll('.BattlePlayback .to-end'));
        const activeToEndBtn = toEndBtns.find(isVisible);

        if (activeToEndBtn) {
            activeToEndBtn.click();
            console.log("%c[AutoFenris] Kliknięto przeskok walki (#).", "color: #17a2b8;");
        }

        // 2. Cykliczne sprawdzanie i zamykanie okna wyniku
        let proby = 0;
        const maxProb = 40; // 12 sekund na zamykanie

        const interval = setInterval(() => {
            proby++;

            // Szukamy otwartych okien raportu
            const allDialogs = Array.from(document.querySelectorAll('.BattleResultsDialog'));
            const visibleDialogs = allDialogs.filter(isVisible);

            // Jeśli raport się pojawił – zamykamy
            if (visibleDialogs.length > 0) {
                let zamknieto = false;
                visibleDialogs.forEach(dialog => {
                    const closeBtn = dialog.closest('.WUI_Dialog')?.querySelector('.dialog-close') ||
                                     dialog.querySelector('.dialog-close') ||
                                     document.getElementById('dialog0_content_close') ||
                                     document.querySelector('.WUI_Dialog .dialog-close');

                    if (closeBtn && isVisible(closeBtn)) {
                        closeBtn.click();
                        zamknieto = true;
                    }
                });

                if (zamknieto) {
                    console.log("%c[AutoFenris] Zamknięto raport. Resetowanie flag na kolejną walkę.", "color: #28a745; font-weight: bold;");
                    
                    // FORSOWNE RESETOWANIE FLAG PO ZAMKNIĘCIU
                    czyWWalce = false;
                    kliknietoWTejWalce = false;
                    
                    clearInterval(interval);
                    return;
                }
            }

            // Ponowne kliknięcie przeskoku, jeśli raport się nie pojawia
            if (proby % 5 === 0) {
                const retryBtn = Array.from(document.querySelectorAll('.BattlePlayback .to-end')).find(isVisible);
                if (retryBtn) retryBtn.click();
            }

            if (proby >= maxProb) {
                console.log("%c[AutoFenris] Timeout zamykania. Resetowanie blokady na wszelki wypadek.", "color: #dc3545;");
                czyWWalce = false;
                kliknietoWTejWalce = false;
                clearInterval(interval);
            }
        }, 300);
    };

    // DOKŁADNIE TWOJA FUNKCJA KLIKAJĄCA
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
            const isVisibleArena = arena && arena.style.display !== 'none';

            // Standardowy reset po zniknięciu areny
            if (!isVisibleArena && czyWWalce) {
                czyWWalce = false;
                kliknietoWTejWalce = false;
                console.log("%c[AutoFenris] Arena ukryta. Reset stanu.", "color: #6c757d;");
                return;
            }

            // Wykrycie startu walki
            if (isVisibleArena && !czyWWalce) {
                czyWWalce = true;

                setTimeout(() => {
                    const enemies = document.querySelector('.BattleMenuLeft');

                    if (enemies && enemies.textContent.includes("Fenris")) {
                        if (!kliknietoWTejWalce) {
                            kliknietoWTejWalce = true;

                            // 1. Aktywacja F po opóźnieniu (1.2s - 2.8s)
                            const opoznienieAkcji = losujCzas(1200, 2800);
                            console.log(`%c[AutoFenris] !!! WYKRYTO FENRISA !!! Czekam ${(opoznienieAkcji/1000).toFixed(2)}s przed wciśnięciem F...`, "color: #007bff; font-weight: bold; font-size: 13px;");
                            setTimeout(wykonajLogikeF, opoznienieAkcji);

                            // 2. Przeskok i zamknięcie po ok. 5 sekundach (4.8s - 5.3s)
                            const opoznienieZamykania = losujCzas(4800, 5300);
                            console.log(`%c[AutoFenris] Przeskok i zamknięcie ustawione za ${(opoznienieZamykania/1000).toFixed(2)}s...`, "color: #17a2b8;");
                            setTimeout(wykonajZamykanieIPrzeskok, opoznienieZamykania);
                        }
                    } else {
                        console.log("[AutoFenris] Wykryto walkę, ale przeciwnik to nie Fenris.");
                        // Jeśli to nie Fenris, odblokuj, aby skrypt działał przy następnej walce
                        czyWWalce = false;
                    }
                }, 400);
            }
        });

        observer.observe(targetNode, { childList: true, subtree: true });
        console.log("%c[AutoFenris] Skrypt gotowy do działania (obsługuje wielokrotne walki)!", "color: #28a745; font-weight: bold;");
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', inicjalizujObserwator);
    } else {
        inicjalizujObserwator();
    }
})();
