(function() {
    'use strict';

    // --- KONFIGURACJA ---
    const dbURL = "https://lootlogmfo-default-rtdb.europe-west1.firebasedatabase.app/";
    const chatURL = dbURL + "global_chat.json";
    const pinnedURL = dbURL + "pinned_msg.json";
    const onlineURL = dbURL + "online_users"; 
    const APP_SECRET = "MFO3_PANEL_ROP_9"; // Kod dostępu przywrócony

    // --- STYLE ---
    const style = document.createElement('style');
    style.innerHTML = `
        #mfo3-chat-ui {
            position: fixed; bottom: 20px; right: 20px; z-index: 999999;
            background: #141414; color: #f0f0f0; padding: 12px;
            border: 2px solid #e67e22; border-radius: 10px; font-family: Arial, sans-serif;
            width: 320px; box-shadow: 0 0 20px #000; box-sizing: border-box;
        }
        #chat-header { display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 11px; font-weight: bold; color: #e67e22; border-bottom: 1px solid #333; padding-bottom: 5px; }
        #online-indicator { color: #2ecc71; font-weight: bold; }
        #pinned-msg {
            background: rgba(241, 196, 15, 0.1); border: 1px solid #f1c40f;
            padding: 8px; margin-bottom: 8px; font-size: 11px; border-radius: 5px;
            display: none; word-wrap: break-word; color: #f1c40f; line-height: 1.4;
        }
        #global-msg-container { 
            height: 200px; overflow-y: auto; background: #000; padding: 8px; 
            font-size: 12px; border: 1px solid #222; border-radius: 5px;
        }
        #input-wrapper { display: flex; gap: 6px; margin-top: 10px; height: 32px; }
        #global-input { 
            flex: 1; min-width: 0; background: #000; color: #fff; 
            border: 1px solid #e67e22; padding: 0 8px; border-radius: 4px; font-size: 12px; outline: none;
        }
        .btn { 
            width: 40px; flex-shrink: 0; background: #e67e22; border: none; 
            color: white; cursor: pointer; border-radius: 4px; font-weight: bold; font-size: 16px;
            display: flex; align-items: center; justify-content: center; transition: 0.2s;
        }
        .btn:hover { background: #d35400; }
        #pin-btn { background: #f1c40f; color: #000; width: 36px; font-size: 14px; }
        #pin-btn:hover { background: #d4ac0d; }
        .msg-line { margin-bottom: 6px; word-wrap: break-word; line-height: 1.4; border-bottom: 1px solid #1a1a1a; padding-bottom: 2px; }
    `;
    document.head.appendChild(style);

    const ui = document.createElement('div');
    ui.id = "mfo3-chat-ui";
    ui.innerHTML = `
        <div id="chat-header">
            <span>MFO3 GLOBAL</span>
            <span id="online-indicator">● Online: 0</span>
        </div>
        <div id="pinned-msg"></div>
        <div id="global-msg-container"></div>
        <div id="input-wrapper">
            <input id="global-input" type="text" placeholder="Napisz..." maxlength="180">
            <button id="pin-btn" class="btn" title="Wyróżnij">★</button>
            <button id="send-btn" class="btn">➤</button>
        </div>
    `;
    document.body.appendChild(ui);

    const container = ui.querySelector('#global-msg-container');
    const pinnedBox = ui.querySelector('#pinned-msg');
    const input = ui.querySelector('#global-input');
    const onlineSign = ui.querySelector('#online-indicator');

    const getNick = () => {
        const n = document.querySelector('.PlayerInfo .name .profile');
        return n ? n.innerText.trim() : "Gracz";
    };

    // --- FUNKCJE ONLINE ---
    async function updatePresence() {
        try {
            await fetch(`${onlineURL}/${getNick()}.json`, {
                method: 'PUT',
                body: JSON.stringify({ 
                    lastActive: { ".sv": "timestamp" },
                    app_secret: APP_SECRET 
                })
            });
        } catch (e) {}
    }

    async function fetchOnlineUsers() {
        try {
            const res = await fetch(`${onlineURL}.json`);
            const data = await res.json();
            if (!data) return;
            const now = Date.now();
            const onlineList = Object.keys(data).filter(nick => {
                // Sprawdzamy tylko użytkowników z poprawnym kodem aplikacji i aktywnych w ciągu 60s
                return data[nick].app_secret === APP_SECRET && (now - data[nick].lastActive < 60000);
            });
            onlineSign.innerText = `● Online: ${onlineList.length}`;
        } catch (e) {}
    }

    // --- CZAT I PIN ---
    async function performSend(isPinned = false) {
        const text = input.value.trim();
        if (!text) return;
        const url = isPinned ? pinnedURL : chatURL;
        const method = isPinned ? 'PUT' : 'POST';
        
        try {
            await fetch(url, {
                method: method,
                body: JSON.stringify({
                    nick: getNick(),
                    msg: text,
                    time: { ".sv": "timestamp" },
                    app_secret: APP_SECRET
                })
            });
            input.value = "";
            setTimeout(isPinned ? fetchPinned : fetchMessages, 500);
        } catch (e) {}
    }

    async function fetchMessages() {
        try {
            const res = await fetch(`${chatURL}?orderBy="$key"&limitToLast=25`);
            const data = await res.json();
            if (!data) return;
            container.innerHTML = "";
            
            Object.keys(data).forEach(key => {
                const m = data[key];
                // Wyświetl tylko jeśli wiadomość ma ten sam APP_SECRET (opcjonalnie)
                if (m && m.nick && m.msg && m.app_secret === APP_SECRET) {
                    const div = document.createElement('div');
                    div.className = "msg-line";
                    div.innerHTML = `<b style="color:#e67e22">${m.nick}:</b> <span>${m.msg}</span>`;
                    container.appendChild(div);
                }
            });
            container.scrollTop = container.scrollHeight;
        } catch (e) {}
    }

    async function fetchPinned() {
        try {
            const res = await fetch(pinnedURL);
            const m = await res.json();
            if (m && m.msg && m.nick && m.app_secret === APP_SECRET) {
                pinnedBox.style.display = "block";
                pinnedBox.innerHTML = `📌 <b>${m.nick}:</b> ${m.msg}`;
            } else if (!m || m.app_secret !== APP_SECRET) {
                pinnedBox.style.display = "none";
            }
        } catch (e) {}
    }

    // --- EVENTY ---
    ui.querySelector('#send-btn').onclick = () => performSend(false);
    ui.querySelector('#pin-btn').onclick = () => performSend(true);
    input.onkeypress = (e) => { if (e.key === 'Enter') performSend(false); };

    // --- PĘTLE ---
    setInterval(fetchMessages, 4000);
    setInterval(fetchPinned, 10000);
    setInterval(updatePresence, 30000);
    setInterval(fetchOnlineUsers, 12000);

    fetchMessages(); fetchPinned(); updatePresence(); fetchOnlineUsers();
})();
