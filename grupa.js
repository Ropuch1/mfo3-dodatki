(function() {
    'use strict';

    // === 1. KONFIGURACJA EKIPY I KLAWISZY ===
    const WHITELIST = [
        "Gotrek Gurnisson",
        "Foxed",
        "Black Shadow",
        "Lisiara",
        "Czarny Cukier",
        "Kazador"
    ];
    
    // Pobieranie klawiszy z Twoich ustawień (lub domyślne jeśli nie ustawiono)
    const K_INVITE = "KeyZ"; 
    const K_ACCEPT = "Enter";

    // === 2. PANEL WIZUALNY ===
    const panel = document.createElement('div');
    panel.style.cssText = `
        position: fixed; top: 150px; right: 10px; width: 160px;
        background: rgba(15, 15, 15, 0.95); color: white;
        padding: 10px; border: 2px solid #c9a031; border-radius: 8px;
        font-family: Tahoma; font-size: 11px; z-index: 10001;
        box-shadow: 0 0 15px rgba(0,0,0,0.8); pointer-events: none;
    `;
    panel.innerHTML = `
        <div style="text-align:center; color:#c9a031; font-weight:bold; border-bottom:1px solid #444; margin-bottom:8px; padding-bottom:5px; letter-spacing:1px;">
            GRUPA [${K_INVITE.replace('Key', '')}/${K_ACCEPT}]
        </div>
        <div id="mfo-team-list"></div>
    `;
    document.body.appendChild(panel);

    const activeInDOM = new Set();

    // === 3. AKTUALIZACJA STATUSU WIDOCZNOŚCI ===
    function updatePanel() {
        const listDiv = document.getElementById('mfo-team-list');
        if (!listDiv) return;
        listDiv.innerHTML = '';

        WHITELIST.forEach(nick => {
            const isReady = activeInDOM.has(nick);
            const row = document.createElement('div');
            row.style.cssText = `
                margin-bottom: 4px; padding: 5px; border-radius: 3px;
                background: ${isReady ? 'rgba(45, 90, 39, 0.5)' : 'rgba(40, 40, 40, 0.3)'};
                border-left: 3px solid ${isReady ? '#5cb85c' : '#555'};
                color: ${isReady ? '#fff' : '#888'};
                display: flex; justify-content: space-between;
            `;
            row.innerHTML = `<span>${nick}</span> <span>${isReady ? '✔' : '✘'}</span>`;
            listDiv.appendChild(row);
        });
    }

    // === 4. LOGIKA ZAPROSZEŃ I AKCEPTACJI ===
    function doQuickInvite() {
        const menus = document.querySelectorAll('.itemContainer');
        menus.forEach(menu => {
            const title = menu.querySelector('.menuItemTitleDiv')?.innerText || "";
            if (WHITELIST.some(friend => title.includes(friend))) {
                const inviteBtn = Array.from(menu.querySelectorAll('.menuItem, .menuItemHidden'))
                                     .find(el => el.innerText.includes('Zaproś'));
                if (inviteBtn) {
                    inviteBtn.click();
                    console.log("[Grupa] Zaproszono: " + title.split(' p. ')[0]);
                }
            }
        });
    }

    function doQuickAccept() {
        const notifications = document.querySelectorAll('.notify-container');
        notifications.forEach(notify => {
            const text = notify.querySelector('.text')?.innerText || "";
            // Akceptujemy tylko jeśli to zaproszenie do grupy od kogoś z listy
            if (text.includes("zgrupować") && WHITELIST.some(f => text.includes(f))) {
                const yesBtn = notify.querySelector('.yes');
                if (yesBtn) {
                    yesBtn.click();
                    console.log("[Grupa] Zaakceptowano zaproszenie!");
                }
            }
        });
    }

    // === 5. OBSERWATOR (ŚLEDZENIE MENU) ===
    const observer = new MutationObserver(() => {
        const menus = document.querySelectorAll('.itemContainer');
        const currentInCode = new Set();
        
        menus.forEach(menu => {
            const title = menu.querySelector('.menuItemTitleDiv')?.innerText || "";
            WHITELIST.forEach(nick => {
                if (title.includes(nick)) currentInCode.add(nick);
            });
        });

        if (currentInCode.size !== activeInDOM.size || [...currentInCode].some(n => !activeInDOM.has(n))) {
            activeInDOM.clear();
            currentInCode.forEach(n => activeInDOM.add(n));
            updatePanel();
        }
    });

    observer.observe(document.body, { childList: true, subtree: true });

    // === 6. OBSŁUGA KLAWIATURY ===
    window.addEventListener('keydown', (e) => {
        // Blokada jeśli focus jest na polach tekstowych
        if (['input', 'textarea'].includes(document.activeElement.tagName.toLowerCase())) return;

        // Zapraszanie (domyślnie Z)
        if (e.code === K_INVITE) {
            doQuickInvite();
        }

        // Akceptowanie (domyślnie Enter)
        if (e.code === K_ACCEPT) {
            doQuickAccept();
        }
    });

    updatePanel();
})();
