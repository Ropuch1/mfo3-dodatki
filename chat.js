(function() {
    'use strict';

    // --- KONFIGURACJA ---
    const dbURL = "https://lootlogmfo-default-rtdb.europe-west1.firebasedatabase.app/";
    const chatURL = dbURL + "global_chat.json";
    const pinnedURL = dbURL + "pinned_msg.json"; // Nowy punkt końcowy dla przypiętej wiadomości
    const onlineURL = dbURL + "online_users"; 
    const APP_SECRET = "MFO3_PANEL_ROP_9";

    let hasCalledForHelp = false;
    let isAFK = false;
    let afkTimer;
    let currentPinnedId = null;

    const resetAFK = () => {
        isAFK = false;
        clearTimeout(afkTimer);
        afkTimer = setTimeout(() => { isAFK = true; }, 300000);
    };

    window.addEventListener('mousemove', resetAFK);
    window.addEventListener('keydown', resetAFK);
    resetAFK();

    // --- DODAWANIE STYLI ---
    const style = document.createElement('style');
    style.innerHTML = `
        #mfo3-chat-ui {
            position: fixed; z-index: 999999; background: rgba(20, 20, 20, 0.95);
            color: #f0f0f0; padding: 8px; border: 2px solid #e67e22;
            border-radius: 8px; font-family: Arial, sans-serif;
            box-shadow: 0 0 15px #000; display: flex; flex-direction: column;
            box-sizing: border-box; min-width: 260px;
            max-width: 98vw; max-height: 98vh;
            resize: both; overflow: hidden;
            user-select: none;
        }
        #mfo3-chat-ui.minimized { height: auto !important; min-height: 0 !important; resize: none; }
        #mfo3-chat-ui.minimized #global-msg-container, 
        #mfo3-chat-ui.minimized #input-wrapper,
        #mfo3-chat-ui.minimized #pinned-msg { display: none; }
        
        #pinned-msg {
            background: rgba(230, 126, 34, 0.2);
            border-left: 3px solid #e67e22;
            padding: 5px; margin-bottom: 5px;
            font-size: 11px; display: none; /* Ukryty jeśli pusty */
            word-wrap: break-word;
        }

        #global-msg-container {
            flex-grow: 1; overflow-y: auto; background: #000;
            padding: 8px; margin-bottom: 5px; font-size: 11px;
            border: 1px solid #333; scroll-behavior: smooth;
            user-select: text;
        }
        #input-wrapper { display: flex; gap: 4px; width: 100%; align-items: stretch; }
        #global-input {
            flex-grow: 1; background: #222; border: 1px solid #e67e22;
            color: white; padding: 6px; border-radius: 3px;
            outline: none; font-size: 12px; box-sizing: border-box;
        }
        .action-btn {
            border: none; color: white; padding: 0 8px;
            border-radius: 3px; cursor: pointer; font-weight: bold;
            font-size: 11px; transition: background 0.2s;
        }
        #quick-ide-btn { background: #2980b9; min-width: 40px; }
        #pin-btn { background: #f1c40f; color: #000; } /* Przycisk wyróżnienia */
        #send-btn { background: #e67e22; }
        .chat-btn { cursor: pointer; margin-left: 8px; font-weight: bold; font-size: 14px; }
        #online-indicator { cursor: pointer; color: #2ecc71; font-size: 11px; font-weight: bold; margin-right: 10px; position: relative; }
        .chat-timestamp { color: #777; font-size: 10px; margin-right: 5px; }
    `;
    document.head.appendChild(style);

    const settings = JSON.parse(localStorage.getItem('mfo3_chat_v6')) || {
        top: 300, left: 10, width: 280, height: 200, minimized: false
    };

    const ui = document.createElement('div');
    ui.id = "mfo3-chat-ui";
    if (settings.minimized) ui.classList.add('minimized');
    ui.style.top = settings.top + "px";
    ui.style.left = settings.left + "px";
    ui.style.width = settings.width + "px";
    ui.style.height = settings.minimized ? "auto" : settings.height + "px";
    document.body.appendChild(ui);

    ui.innerHTML = `
        <div id="chat-header" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:5px; border-bottom:1px solid #e67e22; padding-bottom:4px; cursor:move;">
            <b style="color:#e67e22; font-size:11px; pointer-events:none;">GLOBAL CHAT</b>
            <div style="display:flex; align-items:center;">
                <span id="online-indicator" data-online-list="Ładowanie...">● Online</span>
                <span id="toggle-chat" class="chat-btn">${settings.minimized ? '▢' : '_'}</span>
                <span id="close-chat" class="chat-btn">&times;</span>
            </div>
        </div>
        <div id="pinned-msg"></div>
        <div id="global-msg-container"></div>
        <div id="input-wrapper">
            <button id="quick-ide-btn" class="action-btn">ide</button>
            <input id="global-input" type="text" placeholder="Napisz..." maxlength="200">
            <button id="pin-btn" class="action-btn" title="Wyróżnij wiadomość">⭐</button>
            <button id="send-btn" class="action-btn">➤</button>
        </div>
    `;

    const container = ui.querySelector('#global-msg-container');
    const pinnedContainer = ui.querySelector('#pinned-msg');
    const input = ui.querySelector('#global-input');
    const sendBtn = ui.querySelector('#send-btn');
    const pinBtn = ui.querySelector('#pin-btn');
    const ideBtn = ui.querySelector('#quick-ide-btn');
    const onlineSign = ui.querySelector('#online-indicator');
    const toggleBtn = ui.querySelector('#toggle-chat');

    const getMyNick = () => {
        const nickElement = document.querySelector('.PlayerInfo .name .profile');
        return nickElement ? nickElement.innerText.trim() : "Anonim";
    };

    // --- FUNKCJA WYRÓŻNIANIA (PIN) ---
    async function pinMessage(text) {
        if (!text.trim()) return;
        try {
            await fetch(pinnedURL, {
                method: 'PUT',
                body: JSON.stringify({
                    nick: getMyNick(),
                    msg: text,
                    time: { ".sv": "timestamp" },
                    app_secret: APP_SECRET
                })
            });
            input.value = "";
            fetchPinned();
        } catch (err) { }
    }

    async function fetchPinned() {
        if (document.hidden || isAFK || ui.classList.contains('minimized')) return;
        try {
            const response = await fetch(pinnedURL);
            const m = await response.json();
            if (m && m.msg) {
                pinnedContainer.style.display = "block";
                pinnedContainer.innerHTML = `<b style="color:#f1c40f; font-size:10px;">📌 WYRÓŻNIONE:</b><br>
                    <b style="color:#e67e22">${m.nick}:</b> <span>${m.msg}</span>`;
            } else {
                pinnedContainer.style.display = "none";
            }
        } catch (err) { }
    }

    async function sendMessage(text) {
        if (!text.trim()) return;
        try {
            await fetch(chatURL, {
                method: 'POST',
                body: JSON.stringify({ 
                    nick: getMyNick(), 
                    msg: text, 
                    time: { ".sv": "timestamp" },
                    app_secret: APP_SECRET 
                })
            });
            input.value = "";
            fetchMessages();
        } catch (err) { }
    }

    async function fetchMessages() {
        if (document.hidden || isAFK || ui.classList.contains('minimized')) return;
        try {
            const response = await fetch(`${chatURL}?orderBy="$key"&limitToLast=40`);
            const data = await response.json();
            if (!data) return;
            container.innerHTML = ""; 
            Object.keys(data).forEach(id => {
                const m = data[id];
                const d = new Date(m.time);
                const timeStr = d.toLocaleTimeString();
                const div = document.createElement('div');
                div.style.cssText = "margin-bottom:6px; font-size:11px; word-wrap:break-word;";
                div.innerHTML = `<span class="chat-timestamp">[${timeStr}]</span> <b style="color:#f1c40f">${m.nick}:</b> <span style="color:#eee">${m.msg}</span>`;
                container.appendChild(div);
            });
            container.scrollTop = container.scrollHeight;
        } catch (err) { }
    }

    // Obsługa przycisków
    ideBtn.onclick = () => sendMessage("ide");
    sendBtn.onclick = () => sendMessage(input.value);
    pinBtn.onclick = () => pinMessage(input.value);
    input.onkeypress = (e) => { if (e.key === 'Enter') sendMessage(input.value); };

    // Pozostała logika (Drag, Resize, Online, Interwały)
    const saveSettings = () => {
        const isMin = ui.classList.contains('minimized');
        localStorage.setItem('mfo3_chat_v6', JSON.stringify({
            top: parseInt(ui.style.top),
            left: parseInt(ui.style.left),
            width: parseInt(ui.style.width),
            height: isMin ? settings.height : parseInt(ui.style.height),
            minimized: isMin
        }));
    };

    const clampPosition = () => {
        let rect = ui.getBoundingClientRect();
        if (parseInt(ui.style.left) < 0) ui.style.left = "0px";
        if (parseInt(ui.style.top) < 0) ui.style.top = "0px";
    };

    toggleBtn.onclick = () => {
        const isMin = ui.classList.toggle('minimized');
        toggleBtn.innerText = isMin ? '▢' : '_';
        ui.style.height = isMin ? "auto" : settings.height + "px";
        saveSettings();
        if (!isMin) { fetchMessages(); fetchPinned(); }
        clampPosition();
    };

    // Logika przeciągania (uproszczona)
    let isDragging = false, oL, oT;
    ui.addEventListener('mousedown', (e) => { if (e.target.id === 'chat-header') { isDragging = true; oL = e.clientX - ui.offsetLeft; oT = e.clientY - ui.offsetTop; } });
    document.addEventListener('mousemove', (e) => { if (isDragging) { ui.style.left = (e.clientX - oL) + 'px'; ui.style.top = (e.clientY - oT) + 'px'; clampPosition(); } });
    document.addEventListener('mouseup', () => { if (isDragging) { isDragging = false; saveSettings(); } });

    // Interwały
    setInterval(fetchMessages, 4000);
    setInterval(fetchPinned, 10000); // Odświeżaj wyróżnienie co 10s
    setInterval(() => { if (!document.hidden) fetchOnlineUsers(); }, 15000);

    fetchMessages(); fetchPinned();
    ui.querySelector('#close-chat').onclick = () => ui.remove();
})();
