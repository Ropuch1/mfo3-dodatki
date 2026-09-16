(function() {
    'use strict';

    const MIN_ILOSC = 10;
    const KEY_LAST_VAL = 'mfo3_pyl_last_val';
    const KEY_LAST_NICK = 'mfo3_pyl_last_nick';

    let obecnaIlosc = null;
    let ostatnioSprawdzanoEq = 0;
    let ostatniKomunikatCzas = 0;
    let ostatniKomunikatTresc = "";

    function getCharacterName() {
        try {
            if (typeof mapengine !== 'undefined' && mapengine.instance && mapengine.instance.name) {
                return mapengine.instance.name;
            }
            if (typeof g !== 'undefined') {
                if (g.char && g.char.name) return g.char.name;
                if (g.user && g.user.name) return g.user.name;
                if (g.player && g.player.name) return g.player.name;
            }
        } catch (e) {
            console.warn("[Licznik Pyłu] Błąd odczytu postaci:", e);
        }
        return null;
    }

    function pokazPowiadomienie(ilosc) {
        if (document.getElementById('mfo-dust-alert')) return;

        const alertDiv = document.createElement('div');
        alertDiv.id = 'mfo-dust-alert';
        alertDiv.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background-color: rgba(220, 20, 60, 0.95);
            color: #fff;
            padding: 12px 24px;
            border-radius: 8px;
            z-index: 10000;
            font-weight: bold;
            font-size: 15px;
            box-shadow: 0 4px 10px rgba(0,0,0,0.4);
            pointer-events: none;
            text-align: center;
            font-family: sans-serif;
        `;
        alertDiv.innerText = `⚠️ Pora kupić błękitny pył! Zostało tylko ${ilosc} szt.`;

        document.body.appendChild(alertDiv);

        setTimeout(() => {
            if (alertDiv.parentNode) alertDiv.parentNode.removeChild(alertDiv);
        }, 4000);
    }

    function zapiszIlosc(ilosc) {
        obecnaIlosc = Math.max(0, ilosc);
        const nick = getCharacterName() || localStorage.getItem(KEY_LAST_NICK) || "Gracz";

        localStorage.setItem(KEY_LAST_VAL, obecnaIlosc);
        localStorage.setItem(KEY_LAST_NICK, nick);
        localStorage.setItem(`mfo3_pyl_${nick}`, obecnaIlosc);

        if (obecnaIlosc < MIN_ILOSC) {
            pokazPowiadomienie(obecnaIlosc);
        }
    }

    function wczytajZPamieci() {
        const nick = getCharacterName() || localStorage.getItem(KEY_LAST_NICK);
        let ilosc = null;

        if (nick && localStorage.getItem(`mfo3_pyl_${nick}`) !== null) {
            ilosc = parseInt(localStorage.getItem(`mfo3_pyl_${nick}`), 10);
        } else if (localStorage.getItem(KEY_LAST_VAL) !== null) {
            ilosc = parseInt(localStorage.getItem(KEY_LAST_VAL), 10);
        }

        if (ilosc !== null && !isNaN(ilosc)) {
            obecnaIlosc = ilosc;
            if (obecnaIlosc < MIN_ILOSC) {
                pokazPowiadomienie(obecnaIlosc);
            }
        }
    }

    function skanujKomunikatyCzatu() {
        if (obecnaIlosc === null) return;

        const teraz = Date.now();
        const elementy = document.querySelectorAll('div, span, p');

        elementy.forEach(el => {
            if (el.dataset.dustProcessed) return;

            if (el.closest('#mfo-dust-alert')) return;
            if (el.closest('.ItemsCatalogItem') || el.closest('.ShopCatalogItem')) return;

            const txt = (el.innerText || el.textContent || "").trim();
            if (!txt.toLowerCase().includes("błękitny pył") && !txt.toLowerCase().includes("blekitny pyl")) return;

            const straconoMatch = txt.match(/stracił(?:eś|aś)?\s+(\d+)\s+sztuk[a-z]*\s+przedmiotu\s+błękitny pył/i);
            const zyskanoMatch = txt.match(/(?:zyskał|otrzymał)(?:eś|aś)?\s+(\d+)\s+sztuk[a-z]*\s+przedmiotu\s+błękitny pył/i);

            if (straconoMatch || zyskanoMatch) {
                el.dataset.dustProcessed = "true";

                const dopasowanie = straconoMatch || zyskanoMatch;
                const kluczAkcji = `${dopasowanie[0].toLowerCase()}`;

                if (ostatniKomunikatTresc === kluczAkcji && (teraz - ostatniKomunikatCzas < 3000)) {
                    return;
                }

                ostatniKomunikatCzas = teraz;
                ostatniKomunikatTresc = kluczAkcji;

                const iloscZmiany = parseInt(dopasowanie[1], 10);

                if (straconoMatch) {
                    zapiszIlosc(obecnaIlosc - iloscZmiany);
                } else if (zyskanoMatch) {
                    zapiszIlosc(obecnaIlosc + iloscZmiany);
                }
            }
        });
    }

    function skanujEkwipunek() {
        const teraz = Date.now();
        if (teraz - ostatnioSprawdzanoEq < 1000) return;
        ostatnioSprawdzanoEq = teraz;

        const items = document.querySelectorAll('.ItemsCatalogItem:not(.ShopCatalogItem)');

        for (const item of items) {
            if (item.closest('.ShopCatalogItem') || item.closest('[id*="buy_catalog"]')) {
                continue;
            }

            const nameEl = item.querySelector('.name');
            const amountEl = item.querySelector('.amount');

            if (nameEl && amountEl) {
                const nazwa = nameEl.innerText.trim().toLowerCase();

                if (nazwa === "błękitny pył" || nazwa === "blekitny pyl") {
                    const ilosc = parseInt(amountEl.innerText.trim(), 10);

                    if (!isNaN(ilosc)) {
                        zapiszIlosc(ilosc);
                        return;
                    }
                }
            }
        }
    }

    function inicjalizujSkrypt() {
        setTimeout(() => {
            wczytajZPamieci();
        }, 600);

        setInterval(() => {
            skanujEkwipunek();
            skanujKomunikatyCzatu();
        }, 1000);

        const observer = new MutationObserver(() => {
            skanujEkwipunek();
            skanujKomunikatyCzatu();
        });
        observer.observe(document.body, { childList: true, subtree: true });
    }

    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        inicjalizujSkrypt();
    } else {
        window.addEventListener('load', inicjalizujSkrypt);
    }
})();
