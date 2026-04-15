(function() {
    'use strict';

    // --- KONFIGURACJA ---
    const dbURL = "https://lootlogmfo-default-rtdb.europe-west1.firebasedatabase.app/";
    const chatURL = dbURL + "global_chat.json";
    const pinnedURL = dbURL + "pinned_msg.json";
    const APP_SECRET = "MFO3_PANEL_ROP_9";

    const style = document.createElement('style');
    style.innerHTML = `
        #mfo3-chat-ui {
            position: fixed; bottom: 20px; right: 20px; z-index: 999999;
            background: rgba(25, 25, 25, 0.98); color: #fff; padding: 10px;
            border: 2px solid #e67e22; border-radius: 10px; font-family: 'Segoe UI', Tahoma, sans-serif;
            width: 320px; box-shadow: 0 4px 20px rgba(0,0,0,0.8); display: flex; flex-direction: column;
        }
        #pinned-msg {
            background: rgba(241, 196, 15, 0.15); border: 1px dashed #f1c40f;
            padding: 8px; margin-bottom: 8px; font-size: 11px; color: #f1c40f;
            display: none; border-radius: 4px; line-height: 1.4;
        }
        #global-msg-container {
            height: 180px; overflow-y: auto; background: #000;
            padding: 6px; font-size: 12px; border: 1px solid #333; border-radius: 4px;
        }
        #input-wrapper { display: flex; gap: 5px; margin-top: 8px; }
        #global-input { 
            flex-grow: 1; background: #111; color: #fff; border: 1px solid #444; 
            padding: 5px; border-radius: 4px; outline: none;
        }
        #global-input:focus { border-color: #e67e22; }
        .btn { 
            background: #e67e22; border: none; color: white; cursor: pointer; 
            padding: 5px 10px; border-radius: 4px; font-weight: bold; font-size: 12px;
        }
        #pin-btn { background: #f1c40f; color: #000; }
        .msg-line { margin-bottom: 5px; border-bottom: 1px solid #1a1a1a; padding-bottom: 2px; }
    `;
    document.head.appendChild(style);

    const ui = document.createElement('div');
    ui.id = "mfo3-chat-ui";
    ui.innerHTML = `
        <div style="font-size: 11px; color: #e67e22; margin-bottom: 5px; font-weight: bold;">MFO3 GLOBAL PANEL</div>
        <div id="pinned-msg"></div>
        <div id="global-msg-container"></div>
        <div id="input-wrapper">
            <input id="global-input" type="text" placeholder="Wiadomość..." maxlength="150">
            <button id="pin-btn" class="btn" title="Wyróżnij wiadomość">★</button>
            <button id="send-btn" class="btn">➤</button>
        </div>
    `;
    document.body.appendChild(ui);

    const container = ui.querySelector('#global-msg-container');
    const pinnedBox = ui.querySelector('#pinned-msg');
    const input = ui.querySelector('#global-input');

    const getNick = () => {
        const el = document.querySelector('.PlayerInfo .name .profile');
        return el ? el.innerText.trim() : "Gracz";
    };

    // FUNKCJA WYSYŁANIA
    async function performSend(isPinned = false) {
        const text = input.value.trim();
        if (!text) return;

        const url = isPinned ? pinnedURL : chatURL;
        const method = isPinned ? 'PUT' : 'POST';
        
        // Zapisujemy tekst na wypadek błędu
        const backupText = text;
        input.value = ""; 

        try {
            const response = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    nick: getNick(),
                    msg: text,
                    time: { ".sv": "timestamp" },
                    secret: APP_SECRET
                })
            });

            if (!response.ok) {
                throw new Error("Błąd serwera: " + response.status);
            }

            // Odśwież natychmiast po wysłaniu
            if (isPinned) fetchPinned(); else fetchMessages();

        } catch (err) {
            console.error("Błąd wysyłania:", err);
            alert("Błąd wysyłania! Sprawdź reguły Firebase (Rules).");
            input.value = backupText; // Przywróć tekst jeśli nie wyszło
        }
    }

    async function fetchMessages() {
        try {
            const res = await fetch(`${chatURL}?limitToLast=25`);
            const data = await res.json();
            if (!data) return;
            container.innerHTML = "";
            Object.values(data).forEach(m => {
                const d = document.createElement('div');
                d.className = "msg-line";
                d.innerHTML = `<b style="color:#e67e22">${m.nick}:</b> ${m.msg}`;
                container.appendChild(d);
            });
            container.scrollTop = container.scrollHeight;
        } catch (e) {}
    }

    async function fetchPinned() {
        try {
            const res = await fetch(pinnedURL);
            const m = await res.json();
            if (m && m.msg) {
                pinnedBox.style.display = "block";
                pinnedBox.innerHTML = `<strong>WYRÓŻNIONE:</strong><br><span style="color:#fff">${m.nick}: ${m.msg}</span>`;
            } else {
                pinnedBox.style.display = "none";
            }
        } catch (e) {}
    }

    // Eventy
    ui.querySelector('#send-btn').onclick = () => performSend(false);
    ui.querySelector('#pin-btn').onclick = () => performSend(true);
    input.onkeypress = (e) => { if (e.key === 'Enter') performSend(false); };

    // Pętle odświeżania
    setInterval(fetchMessages, 4000);
    setInterval(fetchPinned, 7000);
    fetchMessages();
    fetchPinned();

})();
