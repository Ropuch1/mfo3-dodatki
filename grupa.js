(function() {
    'use strict';

    // === 1. KONFIGURACJA EKIPY ===
    const WHITELIST = [
        "Gotrek Gurnisson",
        "Foxed",
        "Black Shadow",
        "Lisiara",
        "Czarny Cukier",
        "Kazador"
    ];
    
    const INVITE_KEY = 'z';
    const ACCEPT_KEY = 'Enter';

    // === 2. TWORZENIE PANELU GRAFICZNEGO ===
    const panel = document.createElement('div');
    panel.id = "mfo-team-panel";
    panel.style.cssText = `
        position: fixed; top: 120px; right: 10px; width: 170px;
        background: rgba(10, 10, 10, 0.9); color: white;
        padding: 10px; border: 2px solid #c9a031; border-radius: 8px;
        font-family: Tahoma, sans-serif; font-size: 11px; z-index: 9999;
        box-shadow: 0 0 15px black; pointer-events: none;
    `;
    panel.innerHTML = `
        <div style="text-align:center; color:#c9a031; font-weight:bold; border-bottom:1px solid #444; margin-bottom:8px; padding-bottom:5px;">
            EKIPA [${INVITE_KEY.toUpperCase()}/${ACCEPT_KEY}]
        </div>
        <div id="mfo-team-list"></div>
    `;
    document.body.appendChild(panel);

    const activeInDOM = new Set(); // Nicki, których menu jest aktualnie wczytane

    // === 3. LOGIKA AKTUALIZACJI PANELU ===
    function updatePanel() {
        const listDiv = document.getElementById('mfo-team-list');
        listDiv.innerHTML = '';

        WHITELIST.forEach(nick => {
            const isReady = activeInDOM.has(nick);
            const row = document.createElement('div');
            row.style.cssText = `
                margin-bottom: 4px; padding: 4px 8px; border-radius: 4px;
                background: ${isReady ? 'rgba(45, 90, 39, 0.6)' : 'rgba(50, 50, 50, 0.4)'};
                border-left: 3px solid ${isReady ? '#5cb85c' : '#777'};
                color: ${isReady ? '#fff' : '#aaa'};
                transition: all 0.3s;
            `;
            row.innerHTML = `<strong>${nick}</strong> <span style="float:right; font-size:9px;">${isReady ? 'GOTOWY' : 'BRAK'}</span>`;
            listDiv.appendChild(row);
        });
    }

    // === 4. FUNKCJE ZAPRASZANIA I AKCEPTOWANIA ===
    function doQuickInvite() {
        const menus = document.querySelectorAll('.itemContainer');
        menus.forEach(menu => {
            const title = menu.querySelector('.menuItemTitleDiv')?.innerText || "";
            if (WHITELIST.some(friend => title.includes(friend))) {
                const inviteBtn = Array.from(menu.querySelectorAll('.menuItem, .menuItemHidden'))
                                     .find(el => el.innerText.includes('Zaproś'));
                if (inviteBtn) inviteBtn.click();
            }
        });
    }

    function doQuickAccept() {
        const notifies = document.querySelectorAll('.notify-container');
        notifies.forEach(notify => {
            const text = notify.querySelector('.text')?.innerText || "";
            if (text.includes("chce się z tobą zgrupować") && WHITELIST.some(f => text.includes(f))) {
                notify.querySelector('.yes')?.click();
            }
        });
    }

    // === 5. OBSERWATOR SILNIKA (Śledzenie menu) ===
    const observer = new MutationObserver(() => {
        const menus = document.querySelectorAll('.itemContainer');
        let changed = false;
        
        // Sprawdzamy kogo z listy mamy aktualnie w kodzie strony
        const currentInCode = new Set();
        menus.forEach(menu => {
            const title = menu.querySelector('.menuItemTitleDiv')?.innerText || "";
            WHITELIST.forEach(nick => {
                if (title.includes(nick)) currentInCode.add(nick);
            });
        });

        // Jeśli stan się zmienił (ktoś doszedł/odszedł), odśwież panel
        if (JSON.stringify([...currentInCode]) !== JSON.stringify([...activeInDOM])) {
            activeInDOM.clear();
            currentInCode.forEach(n => activeInDOM.add(n));
            updatePanel();
        }
    });

    observer.observe(document.body, { childList: true, subtree: true });

    // === 6. OBSŁUGA KLAWIATURY ===
    window.addEventListener('keydown', (e) => {
        if (['input', 'textarea'].includes(document.activeElement.tagName.toLowerCase())) return;

        if (e.key.toLowerCase() === INVITE_KEY) doQuickInvite();
        if (e.key === ACCEPT_KEY) doQuickAccept();
    });

    // Inicjalizacja
    updatePanel();
    console.log("%c[MFO3 TeamPanel] Załadowano pomyślnie!", "color: #c9a031; font-weight: bold;");
})();
