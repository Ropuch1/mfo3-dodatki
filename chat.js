(function() {
    'use strict';

    // --- KONFIGURACJA ---
    const dbURL = "https://lootlogmfo-default-rtdb.europe-west1.firebasedatabase.app/";
    const chatURL = dbURL + "global_chat.json";
    const pinnedURL = dbURL + "pinned_msg.json";
    const onlineURL = dbURL + "online_users"; 

    let isAFK = false;
    let afkTimer;

    const resetAFK = () => {
        isAFK = false;
        clearTimeout(afkTimer);
        afkTimer = setTimeout(() => { isAFK = true; }, 300000);
    };
    window.addEventListener('mousemove', resetAFK);
    window.addEventListener('keydown', resetAFK);
    resetAFK();

    // --- STYLE (PROSTE I SKUTECZNE) ---
    const style = document.createElement('style');
    style.innerHTML = `
        #mfo3-chat-ui {
            position: fixed; bottom: 10px; right: 10px; z-index: 999999;
            background: rgba(20, 20, 20, 0.98); color: #f0f0f0; padding: 10px;
            border: 2px solid #e67e22; border-radius: 8px; font-family: Arial, sans-serif;
            width: 320px; box-shadow: 0 0 15px #000; box-sizing: border-box;
        }
        #chat-header { display: flex; justify-content: space-between; margin-bottom: 5px; font-size: 11px; font-weight: bold; color: #e67e22; }
        #online-indicator { color: #2ecc71; cursor: help; }
        #pinned-msg {
            background: rgba(241, 196, 15, 0.15); border: 1px solid #f1c40f;
            padding: 6px; margin-bottom: 5px; font-size: 11px; border-radius: 4px;
            display: none; word-wrap: break-word;
        }
        #global-msg-container { 
            height: 180px; overflow-y: auto; background: #000; padding: 5px; 
            font-size: 11px; border: 1px solid #333; border-radius: 4px;
            display: block !important; visibility: visible !important;
        }
        #input-wrapper { 
            display: flex !important; gap: 4px; margin-top: 8px; align-items: stretch;
        }
        #global-input { 
            flex: 1; min-width: 0; background: #111; color: #fff; 
            border: 1px solid #e67e22; padding: 6px; border-radius: 3px; font-size: 12px; 
        }
        .btn { 
            width: 40px; flex-shrink: 0; background: #e67e22; border: none; 
            color: white; cursor: pointer; border-radius: 3px; font-weight: bold; font-size: 14px;
        }
        #pin-btn { background: #f1c40f; color: #000; width: 35px; }
        .msg-line { margin-bottom: 4px; word-wrap: break-word; line-height: 1.3; text-align: left; }
    `;
    document.head.appendChild(style);

    const ui = document.createElement('div');
    ui.id = "mfo3-chat-ui";
    ui.innerHTML = `
        <div id="chat-header">
            <span>MFO3 GLOBAL</span>
            <span id="online-indicator">● Online: ?</span>
        </div>
        <div id="pinned-msg"></div>
        <div id="global-msg-container"></div>
        <div id="input-wrapper">
            <input id="global-input" type="text" placeholder="Napisz..." maxlength="180">
            <button id="pin-btn" class="btn" title="Wyróżnij wiadomość">★</button>
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

    // --- FUNKCJE ---
    async function updatePresence() {
        if (document.hidden) return;
        try {
            await fetch(`${onlineURL}/${getNick()}.json`, {
                method: 'PUT',
                body: JSON.stringify({ lastActive: { ".sv": "timestamp" } })
            });
        } catch (e) {}
    }

    async function fetchOnlineUsers() {
        if (document.hidden || isAFK) return;
        try {
            const res = await fetch(`${onlineURL}.json`);
            const data = await res.json();
            if (!data) return;
            const now = Date.now();
            const onlineList = Object.keys(data).filter(nick => now - data[nick].lastActive < 45000);
            onlineSign.innerText = `● Online: ${onlineList.length}`;
            onlineSign.title = "Online: " + onlineList.join(', ');
        } catch (e) {}
    }

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
                    time: { ".sv": "timestamp" }
                })
            });
            input.value = "";
            isPinned ? fetchPinned() : fetchMessages();
        } catch (e) { console.error("Błąd wysyłki:", e); }
    }

    async function fetchMessages() {
        if (document.hidden || isAFK) return;
        try {
            const res = await fetch(`${chatURL}?orderBy="$key"&limitToLast=30`);
            const data = await res.json();
            if (!data) return;
            container.innerHTML = "";
            Object.values(data).forEach(m => {
                const div = document.createElement('div');
                div.className = "msg-line";
                div.innerHTML = `<b style="color:#e67e22">${m.nick}:</b> <span>${m.msg}</span>`;
                container.appendChild(div);
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
                pinnedBox.innerHTML = `📌 <b>${m.nick}:</b> ${m.msg}`;
            } else {
                pinnedBox.style.display = "none";
            }
        } catch (e) {}
    }

    // --- LOGIKA PRZYCISKÓW ---
    ui.querySelector('#send-btn').onclick = () => performSend(false);
    ui.querySelector('#pin-btn').onclick = () => performSend(true);
    input.onkeypress = (e) => { if (e.key === 'Enter') performSend(false); };

    // --- START ---
    setInterval(fetchMessages, 4000);
    setInterval(fetchPinned, 10000);
    setInterval(updatePresence, 30000);
    setInterval(fetchOnlineUsers, 12000);

    fetchMessages(); fetchPinned(); updatePresence(); fetchOnlineUsers();
})();
