(function() {
    'use strict';

    // --- KONFIGURACJA ---
    const dbURL = "https://lootlogmfo-default-rtdb.europe-west1.firebasedatabase.app/";
    const chatURL = dbURL + "global_chat.json";
    const onlineURL = dbURL + "online_users"; 
    const APP_SECRET = "MFO3_PANEL_ROP_9";
    const ANN_MARKER = "\u200B"; 

    let hasCalledForHelp = false;
    let isAFK = false;
    let afkTimer;
    let isClosedByUser = false; // <-- Flaga sprawdzająca, czy użytkownik sam zamknął czat

    const resetAFK = () => {
        isAFK = false;
        clearTimeout(afkTimer);
        afkTimer = setTimeout(() => { isAFK = true; }, 300000);
    };

    window.addEventListener('mousemove', resetAFK);
    window.addEventListener('keydown', resetAFK);
    resetAFK();

    // --- STYLE ---
    const style = document.createElement('style');
    style.innerHTML = `
        #mfo3-chat-ui {
            position: fixed; z-index: 999999; background: rgba(20, 20, 20, 0.95);
            color: #f0f0f0; padding: 8px; border: 2px solid #e67e22;
            border-radius: 8px; font-family: Arial, sans-serif;
            box-shadow: 0 0 15px #000; display: flex; flex-direction: column;
            box-sizing: border-box; min-width: 300px;
            max-width: 98vw; max-height: 98vh;
            resize: both; overflow: hidden;
        }
        #mfo3-chat-ui.minimized { 
            height: 34px !important; 
            min-height: 34px !important; 
            resize: none !important; 
        }
        
        #pinned-container {
            display: flex; flex-direction: column; gap: 4px;
            margin: 5px 0; padding: 2px 0;
            max-height: 100px; overflow-y: auto;
            flex-shrink: 0;
        }
        .pinned-msg {
            background: rgba(230, 126, 34, 0.2);
            border-left: 3px solid #e67e22;
            padding: 5px 8px; font-size: 11px; color: #ffcc00;
            border-radius: 2px; line-height: 1.3;
            word-wrap: break-word;
        }
        .pinned-time { color: rgba(255, 204, 0, 0.6); font-size: 9px; margin-right: 4px; }

        #global-msg-container {
            flex-grow: 1; overflow-y: auto; background: #000;
            padding: 8px; margin-bottom: 5px; font-size: 11px;
            border: 1px solid #333; scroll-behavior: smooth;
        }
        #input-wrapper { display: flex; gap: 4px; width: 100%; align-items: stretch; flex-shrink: 0; }
        #global-input {
            flex-grow: 1; background: #222; border: 1px solid #e67e22;
            color: white; padding: 6px; border-radius: 3px;
            outline: none; font-size: 12px; min-width: 0;
        }
        .action-btn {
            border: none; color: white; padding: 0 8px;
            border-radius: 3px; cursor: pointer; font-weight: bold;
            font-size: 11px;
        }
        #quick-ide-btn { background: #2980b9; }
        #hydraulik-btn { background: #5d4037; }
        #announcement-btn { background: #c0392b; }
        #send-btn { background: #e67e22; }
        
        .msg-announcement {
            background: rgba(192, 57, 43, 0.2) !important;
            border: 1px solid #c0392b !important;
            padding: 5px !important; border-radius: 4px;
            animation: pulse-red 2s infinite;
        }
        @keyframes pulse-red {
            0% { border-color: #c0392b; }
            50% { border-color: #ff4d4d; }
            100% { border-color: #c0392b; }
        }
        .chat-btn { cursor: pointer; margin-left: 8px; font-weight: bold; font-size: 14px; }
        #online-indicator { cursor: pointer; color: #2ecc71; font-size: 11px; font-weight: bold; margin-right: 10px; position: relative; }
        #online-indicator:hover::after {
            content: attr(data-online-list);
            position: absolute; right: 0; top: 22px;
            background: #1a1a1a; border: 1px solid #e67e22;
            padding: 8px; border-radius: 4px; white-space: pre;
            z-index: 1000001; font-size: 11px; color: #fff;
            box-shadow: 0 4px 12px #000; min-width: 120px;
        }
    `;
    document.head.appendChild(style);

    const settings = JSON.parse(localStorage.getItem('mfo3_chat_v6')) || {
        top: 300, left: 10, width: 320, height: 250, minimized: false
    };

    const ui = document.createElement('div');
    ui.id = "mfo3-chat-ui";
    if (settings.minimized) ui.classList.add('minimized');
    ui.style.top = settings.top + "px";
    ui.style.left = settings.left + "px";
    ui.style.width = settings.width + "px";
    if (!settings.minimized) ui.style.height = settings.height + "px";
    document.body.appendChild(ui);

    ui.innerHTML = `
        <div id="chat-header" style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid #e67e22; padding-bottom:4px; cursor:move; flex-shrink:0; height:18px;">
            <b style="color:#e67e22; font-size:11px; pointer-events:none;">GLOBAL CHAT</b>
            <div style="display:flex; align-items:center;">
                <span id="online-indicator" data-online-list="Ładowanie...">● Online</span>
                <span id="toggle-chat" class="chat-btn">${settings.minimized ? '▢' : '_'}</span>
                <span id="close-chat" class="chat-btn">&times;</span>
            </div>
        </div>
        <div id="pinned-container"></div>
        <div id="global-msg-container"></div>
        <div id="input-wrapper">
            <button id="quick-ide-btn" class="action-btn">ide</button>
            <button id="hydraulik-btn" class="action-btn">hydraulik</button>
            <button id="announcement-btn" class="action-btn">📢</button>
            <input id="global-input" type="text" placeholder="Napisz..." maxlength="200">
            <button id="send-btn" class="action-btn">➤</button>
        </div>
    `;

    const container = ui.querySelector('#global-msg-container');
    const pinnedContainer = ui.querySelector('#pinned-container');
    const input = ui.querySelector('#global-input');
    const sendBtn = ui.querySelector('#send-btn');
    const onlineSign = ui.querySelector('#online-indicator');

    const saveSettings = () => {
        const isMin = ui.classList.contains('minimized');
        const oldData = JSON.parse(localStorage.getItem('mfo3_chat_v6')) || {};
        localStorage.setItem('mfo3_chat_v6', JSON.stringify({
            top: parseInt(ui.style.top),
            left: parseInt(ui.style.left),
            width: ui.offsetWidth,
            height: isMin ? (oldData.height || 250) : ui.offsetHeight,
            minimized: isMin
        }));
    };

    const getMyNick = () => {
        const nickElement = document.querySelector('.PlayerInfo .name .profile');
        return nickElement ? nickElement.innerText.trim() : "Anonim";
    };

    async function sendMessage(text, isAnnouncement = false) {
        if (!text.trim()) return;
        const finalMsg = isAnnouncement ? ANN_MARKER + text : text;
        try {
            await fetch(chatURL, {
                method: 'POST',
                body: JSON.stringify({ 
                    nick: getMyNick(), 
                    msg: finalMsg, 
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
            const response = await fetch(`${chatURL}?orderBy="$key"&limitToLast=50`);
            const data = await response.json();
            if (!data) return;
            
            container.innerHTML = ""; 
            const announcements = {}; 
            const now = Date.now();

            Object.keys(data).forEach(id => {
                const m = data[id];
                const d = new Date(m.time);
                const isAnn = m.msg.startsWith(ANN_MARKER) || m.msg.startsWith("[OGŁOSZENIE]");
                const cleanMsg = m.msg.replace(ANN_MARKER, "").replace("[OGŁOSZENIE]", "").trim();
                
                const div = document.createElement('div');
                div.style.cssText = "margin-bottom:6px; font-size:11px; word-wrap:break-word;";
                
                if (isAnn) {
                    div.classList.add('msg-announcement');
                    if (now - m.time < 3600000) {
                        announcements[m.nick] = { msg: cleanMsg, time: d.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) };
                    }
                }

                div.innerHTML = `<span style="color:#777; font-size:10px;">[${d.toLocaleTimeString()}]</span> <b style="color:#f1c40f">${m.nick}:</b> <span style="color:#eee">${cleanMsg}</span>`;
                container.appendChild(div);
            });

            pinnedContainer.innerHTML = "";
            const keys = Object.keys(announcements);
            if (keys.length > 0) {
                pinnedContainer.style.display = "flex";
                keys.forEach(nick => {
                    const p = document.createElement('div');
                    p.className = 'pinned-msg';
                    p.innerHTML = `<span class="pinned-time">[${announcements[nick].time}]</span> 📌 <b>${nick}:</b> ${announcements[nick].msg}`;
                    pinnedContainer.appendChild(p);
                });
            } else {
                pinnedContainer.style.display = "none";
            }

            container.scrollTop = container.scrollHeight;
        } catch (err) { }
    }

    ui.querySelector('#quick-ide-btn').onclick = () => sendMessage("ide");
    ui.querySelector('#hydraulik-btn').onclick = () => sendMessage("ile jeszcze tego gnoju");
    ui.querySelector('#announcement-btn').onclick = () => { if(input.value.trim()) sendMessage(input.value, true); };
    sendBtn.onclick = () => sendMessage(input.value);
    input.onkeypress = (e) => { if (e.key === 'Enter') sendMessage(input.value); };

    ui.querySelector('#toggle-chat').onclick = function() {
        const isMin = ui.classList.toggle('minimized');
        this.innerText = isMin ? '▢' : '_';
        
        if (isMin) {
            ui.style.height = "34px";
        } else {
            const saved = JSON.parse(localStorage.getItem('mfo3_chat_v6'));
            ui.style.height = (saved ? saved.height : 250) + "px";
        }
        saveSettings();
        if (!isMin) fetchMessages();
    };

    let isDragging = false, oL, oT;
    ui.addEventListener('mousedown', (e) => { 
        if (e.target.id === 'chat-header') { 
            isDragging = true; 
            oL = e.clientX - ui.offsetLeft; oT = e.clientY - ui.offsetTop; 
        } 
    });
    document.addEventListener('mousemove', (e) => { 
        if (isDragging) { 
            let newL = e.clientX - oL;
            let newT = e.clientY - oT;

            const maxL = window.innerWidth - ui.offsetWidth;
            const maxT = window.innerHeight - ui.offsetHeight;

            ui.style.left = Math.max(0, Math.min(newL, maxL)) + 'px'; 
            ui.style.top = Math.max(0, Math.min(newT, maxT)) + 'px';
        } 
    });
    document.addEventListener('mouseup', () => { if (isDragging) { isDragging = false; saveSettings(); } });

    new ResizeObserver(() => { 
        if (!ui.classList.contains('minimized')) saveSettings(); 
    }).observe(ui);

    async function updatePresence() {
        if (document.hidden) return;
        try { 
            await fetch(`${onlineURL}/${getMyNick()}.json`, { 
                method: 'PUT', 
                body: JSON.stringify({ 
                    lastActive: { ".sv": "timestamp" },
                    app_secret: APP_SECRET 
                }) 
            }); 
        } catch (e) { }
    }

    async function fetchOnlineUsers() {
        if (document.hidden || isAFK) return;
        try {
            const response = await fetch(`${onlineURL}.json`);
            const data = await response.json();
            if (!data) return;
            const now = Date.now();
            let onlineList = Object.keys(data).filter(nick => now - data[nick].lastActive < 45000);
            onlineSign.innerText = `● ${onlineList.length}`;
            onlineSign.setAttribute('data-online-list', "Gracze online:\n" + onlineList.join('\n'));
        } catch (e) { }
    }

    // ZAMKNIĘCIE CZATU
    ui.querySelector('#close-chat').onclick = () => {
        isClosedByUser = true; // Ustaw flagę ręcznego zamknięcia
        ui.remove();
    };

    // --- STRAŻNIK CZATU (Anti-Deactivate przy przechodzeniu między mapami) ---
    // Sprawdza co 1 sekundę czy czat zniknął z dokumentu (DOM). 
    // Jeśli tak (i użytkownik nie kliknął "X"), wstrzykuje go ponownie.
    setInterval(() => {
        if (!isClosedByUser && !document.body.contains(ui)) {
            document.body.appendChild(ui);
        }
    }, 1000);

    setInterval(fetchMessages, 4000);
    setInterval(updatePresence, 30000);
    setInterval(fetchOnlineUsers, 10000);

    fetchMessages(); updatePresence(); fetchOnlineUsers();
})();
