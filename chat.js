(function() {
    'use strict';

    const dbURL = "https://lootlogmfo-default-rtdb.europe-west1.firebasedatabase.app/";
    const chatURL = dbURL + "global_chat.json";
    const pinnedURL = dbURL + "pinned_msg.json";
    const onlineURL = dbURL + "online_users"; 
    const APP_SECRET = "MFO3_PANEL_ROP_9";

    const settings = JSON.parse(localStorage.getItem('mfo3_chat_pos')) || { top: 300, left: 10 };

    const style = document.createElement('style');
    style.innerHTML = `
        #mfo3-chat-ui {
            position: fixed; z-index: 999999; background: #141414; color: #f0f0f0; 
            padding: 10px; border: 2px solid #e67e22; border-radius: 10px; 
            font-family: Arial; width: 320px; box-shadow: 0 0 20px #000; box-sizing: border-box;
        }
        #chat-header { 
            display: flex; justify-content: space-between; align-items: center;
            margin-bottom: 8px; font-size: 11px; font-weight: bold; 
            color: #e67e22; border-bottom: 1px solid #333; padding-bottom: 5px; cursor: move; 
        }
        #online-indicator { color: #2ecc71; cursor: help; border-bottom: 1px dotted #2ecc71; }
        #pinned-msg {
            background: rgba(241, 196, 15, 0.1); border: 1px solid #f1c40f;
            padding: 8px; margin-bottom: 8px; font-size: 11px; border-radius: 5px;
            display: none; color: #f1c40f;
        }
        #global-msg-container { 
            height: 200px; overflow-y: auto; background: #000; padding: 8px; 
            font-size: 12px; border: 1px solid #222; border-radius: 5px;
        }
        #input-wrapper { display: flex; gap: 5px; margin-top: 10px; height: 32px; }
        #global-input { 
            flex: 1; min-width: 0; background: #000; color: #fff; 
            border: 1px solid #e67e22; padding: 0 8px; border-radius: 4px; font-size: 12px;
        }
        .btn { 
            width: 40px; flex-shrink: 0; background: #e67e22; border: none; 
            color: white; cursor: pointer; border-radius: 4px; font-weight: bold; font-size: 16px;
        }
        #pin-btn { background: #f1c40f; color: #000; width: 36px; font-size: 14px; }
        .msg-line { margin-bottom: 4px; border-bottom: 1px solid #1a1a1a; padding-bottom: 2px; }
    `;
    document.head.appendChild(style);

    const ui = document.createElement('div');
    ui.id = "mfo3-chat-ui";
    ui.style.top = settings.top + "px";
    ui.style.left = settings.left + "px";
    ui.innerHTML = `
        <div id="chat-header">
            <span>MFO3 GLOBAL PANEL</span>
            <span id="online-indicator" title="Ładowanie listy...">● Online: 0</span>
        </div>
        <div id="pinned-msg"></div>
        <div id="global-msg-container"></div>
        <div id="input-wrapper">
            <input id="global-input" type="text" placeholder="Napisz wiadomość..." maxlength="180">
            <button id="pin-btn" class="btn">★</button>
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

    // PRZESUWANIE
    let isDragging = false, offset = { x: 0, y: 0 };
    ui.querySelector('#chat-header').onmousedown = (e) => {
        isDragging = true;
        offset.x = e.clientX - ui.offsetLeft;
        offset.y = e.clientY - ui.offsetTop;
    };
    document.onmousemove = (e) => {
        if (!isDragging) return;
        ui.style.left = (e.clientX - offset.x) + 'px';
        ui.style.top = (e.clientY - offset.y) + 'px';
    };
    document.onmouseup = () => {
        if (isDragging) {
            isDragging = false;
            localStorage.setItem('mfo3_chat_pos', JSON.stringify({ top: parseInt(ui.style.top), left: parseInt(ui.style.left) }));
        }
    };

    // KOMUNIKACJA
    async function updatePresence() {
        fetch(`${onlineURL}/${getNick()}.json`, {
            method: 'PUT',
            body: JSON.stringify({ lastActive: { ".sv": "timestamp" }, app_secret: APP_SECRET })
        }).catch(()=>{});
    }

    async function fetchOnlineUsers() {
        try {
            const res = await fetch(`${onlineURL}.json`);
            const data = await res.json();
            if (!data) return;
            const now = Date.now();
            const onlineList = Object.keys(data).filter(nick => {
                return data[nick].app_secret === APP_SECRET && (now - data[nick].lastActive < 60000);
            });
            onlineSign.innerText = `● Online: ${onlineList.length}`;
            onlineSign.title = "Gracze online:\n" + onlineList.join("\n");
        } catch (e) {}
    }

    async function performSend(isPinned = false) {
        const text = input.value.trim();
        if (!text) return;
        
        const url = isPinned ? pinnedURL : chatURL;
        const method = isPinned ? 'PUT' : 'POST';
        const payload = { nick: getNick(), msg: text, time: { ".sv": "timestamp" }, app_secret: APP_SECRET };

        try {
            const res = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            
            if (res.ok) {
                input.value = "";
                setTimeout(isPinned ? fetchPinned : fetchMessages, 300);
            } else {
                console.error("Błąd Firebase:", res.status);
            }
        } catch (e) {
            console.error("Błąd wysyłania:", e);
        }
    }

    async function fetchMessages() {
        try {
            const res = await fetch(`${chatURL}?orderBy="$key"&limitToLast=25`);
            const data = await res.json();
            if (!data) return;
            container.innerHTML = "";
            Object.keys(data).forEach(key => {
                const m = data[key];
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
            if (m && m.msg && m.app_secret === APP_SECRET) {
                pinnedBox.style.display = "block";
                pinnedBox.innerHTML = `📌 <b>${m.nick}:</b> ${m.msg}`;
            } else {
                pinnedBox.style.display = "none";
            }
        } catch (e) {}
    }

    ui.querySelector('#send-btn').onclick = () => performSend(false);
    ui.querySelector('#pin-btn').onclick = () => performSend(true);
    input.onkeypress = (e) => { if (e.key === 'Enter') performSend(false); };

    setInterval(fetchMessages, 4000);
    setInterval(fetchPinned, 10000);
    setInterval(updatePresence, 30000);
    setInterval(fetchOnlineUsers, 12000);

    fetchMessages(); fetchPinned(); updatePresence(); fetchOnlineUsers();
})();
