(function() {
    'use strict';

    // === 1. TWOJA EKIPA ===
    const WHITELIST = [
        "Gotrek Gurnisson",
        "Foxed",
        "Black Shadow",
        "Lisiara",
        "Czarny Cukier",
        "Kazador"
    ];

    // === 2. POBIERANIE USTAWIEŃ Z TWOJEGO PANELU ===
    // Pobieramy wartości zapisane przez panel lub używamy domyślnych
    const getInviteKey = () => localStorage.getItem('mfo3_val_grupa_k_invite') || "KeyZ";
    const getAcceptKey = () => localStorage.getItem('mfo3_val_grupa_k_accept') || "Enter";

    // === 3. LOGIKA ZAPRASZANIA I AKCEPTOWANIA ===
    function quickInvite() {
        const menus = document.querySelectorAll('.itemContainer');
        menus.forEach(menu => {
            const title = menu.querySelector('.menuItemTitleDiv')?.innerText || "";
            if (WHITELIST.some(nick => title.includes(nick))) {
                const inviteBtn = Array.from(menu.querySelectorAll('.menuItem, .menuItemHidden'))
                                     .find(el => el.innerText.includes('Zaproś'));
                if (inviteBtn) inviteBtn.click();
            }
        });
    }

    function quickAccept() {
        const notifies = document.querySelectorAll('.notify-container');
        notifies.forEach(notify => {
            const text = notify.querySelector('.text')?.innerText || "";
            // Akceptujemy tylko jeśli tekst zawiera "zgrupować" i nick jest na liście
            if (text.includes("zgrupować") && WHITELIST.some(nick => text.includes(nick))) {
                const yesBtn = notify.querySelector('.yes');
                if (yesBtn) yesBtn.click();
            }
        });
    }

    // === 4. OBSŁUGA KLAWIATURY ===
    window.addEventListener('keydown', (e) => {
        // Blokada jeśli piszesz na czacie
        if (['input', 'textarea'].includes(document.activeElement.tagName.toLowerCase())) return;

        // Sprawdzamy co aktualnie jest ustawione w panelu
        if (e.code === getInviteKey()) {
            quickInvite();
        }

        if (e.code === getAcceptKey()) {
            quickAccept();
        }
    });

    // === 5. OPCJONALNY PANEL POMOCNICZY (Zintegrowany z Twoim UI) ===
    // Ten fragment sprawia, że w konsoli widzisz statusy ładowania
    console.log(`%c[Moduł QG] Załadowano! Zapraszanie: ${getInviteKey()} | Akceptowanie: ${getAcceptKey()}`, "color: #f1c40f; font-weight: bold;");

})();
