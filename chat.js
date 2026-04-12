(function() {
    'use strict';

    const dbURL = "https://lootlogmfo-default-rtdb.europe-west1.firebasedatabase.app/";
    const chatURL = dbURL + "global_chat.json";
    const onlineURL = dbURL + "online_users"; 

    let hasCalledForHelp = false;

    // --- DODAWANIE STYLI ---
    const style = document.createElement('style');
    style.innerHTML = `
        #mfo3-chat-ui {
            position: fixed; z-index: 999999; background: rgba(20, 20, 20, 0.95);
            color: #f0f0f0; padding: 8px; border: 2px solid #e67e22;
            border-radius: 8px; font-family: Arial, sans-serif;
            box-shadow: 0 0 15px #000; display: flex; flex-direction: column;
            box-sizing: border-box; min-width: 250px;
            max-width: 95vw; max-height: 95vh;
            resize: both; overflow: hidden;
            user-select: none;
        }
        #mfo3-chat-ui.minimized {
            height: auto !important; min-height: 0 !important; resize: none;
        }
        #mfo3-chat-ui.minimized #global-msg-container, 
        #mfo3-chat-ui.minimized #input-wrapper {
            display: none;
        }
        #global-msg-container {
            flex-grow: 1; overflow-y: auto; background: #000;
            padding: 8px; margin-bottom: 5px; font-size: 11px;
            border: 1px solid #333; scroll-behavior: smooth;
            user-select: text;
        }
        .chat-timestamp {
            color: #777; font-size: 10px; margin-right: 5px; font-family: 'Courier New', monospace;
        }
        #online-indicator {
            cursor: pointer; color: #2ecc71; font-size: 11px; 
            margin-right: 10px; font-weight: bold; position: relative;
        }
        #online-indicator:hover::after {
            content: attr(data-online-list);
            position: absolute; right: 0; top: 22px;
            background: #1a1a1a; border: 1px solid #e67e22;
            padding: 8px; border-radius: 4px; white-space: pre;
            z-index: 1000001; font-size: 11px; color: #fff;
            box-shadow: 0 4px 12px #000; min-width: 120px;
        }
        #input-wrapper {
            display: flex; gap: 4px; width: 100%;
        }
        #global-input {
            flex-grow: 1; background: #222; border: 1px solid #e67e22;
            color: white; padding: 6px; border-radius: 3px;
            outline: none; font-size: 12px; box-sizing: border-box;
            user-select: text;
        }
        #send-btn {
            background: #e67e22; border: none; color: white;
            padding: 0 10px; border-radius: 3px; cursor: pointer;
            font-weight: bold; font-size: 12px; transition: background 0.2s;
        }
        #send-btn:hover { background: #d35400; }
        .chat-btn { cursor: pointer; margin-left: 8px; font-weight: bold; font-size: 14px; user-select: none; }
        #toggle-chat { color: #f1c40f; }
        #close-chat { color: #e74c3c; }
    `;
    document.head.appendChild(style);

    // --- WCZYTYWANIE USTAWIEŃ ---
    const settings = JSON.parse(localStorage.getItem('mfo3_chat_v6')) || {
        top: 300, left: 10, width: 280, height: 200, minimized: false
    };

    const ui = document.createElement('div');
    ui.id = "mfo3-chat-ui";
    if (settings.minimized) ui.classList.add('minimized');

    ui.style.top = Math.max(0, Math.min(settings.top, window.innerHeight - 40)) + "px";
    ui.style.left = Math.max(0, Math.min(settings.left, window.innerWidth - settings.width)) + "px";
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
        <div id="global-msg-container"></div>
        <div id="input-wrapper">
            <input id="global-input" type="text" placeholder="Napisz coś..." maxlength="200">
            <button id="send-btn">➤</button>
        </div>
    `;

    const container = ui.querySelector('#global-msg-container');
    const input = ui.querySelector('#global-input');
    const sendBtn = ui.querySelector('#send-btn');
    const onlineSign = ui.querySelector('#online-indicator');
    const toggleBtn = ui.querySelector('#toggle-chat');

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

    toggleBtn.onclick = () => {
        const isMin = ui.classList.toggle('minimized');
        toggleBtn.innerText = isMin ? '▢' : '_';
        ui.style.height = isMin ? "auto" : settings.height + "px";
        saveSettings();
    };

    const resizeObserver = new ResizeObserver(() => {
        if (!ui.classList.contains('minimized')) saveSettings();
    });
    resizeObserver.observe(ui);

    const getMyNick = () => {
        const nick = document.querySelector('.name .profile')?.innerText;
        return nick ? nick.trim() : "Anonim";
    };

    async function sendMessage(text) {
        if (!text.trim()) return;
        try {
            await fetch(chatURL, {
                method: 'POST',
                body: JSON.stringify({ nick: getMyNick(), msg: text, time: { ".sv": "timestamp" } })
            });
            fetchMessages();
        } catch (err) { }
    }

    // --- CHAT LOGIC ---
    async function updatePresence() {
        try { await fetch(`${onlineURL}/${getMyNick()}.json`, { method: 'PUT', body: JSON.stringify({ lastActive: { ".sv": "timestamp" } }) }); } catch (e) { }
    }

    async function fetchOnlineUsers() {
        try {
            const response = await fetch(`${onlineURL}.json`);
            const data = await response.json();
            if (!data) return;
            const now = Date.now();
            let onlineList = Object.keys(data).filter(nick => now - data[nick].lastActive < 25000);
            onlineSign.innerText = `● ${onlineList.length}`;
            onlineSign.setAttribute('data-online-list', "Gracze online:\n" + onlineList.join('\n'));
        } catch (e) { }
    }

    async function fetchMessages() {
        if (ui.classList.contains('minimized')) return;
        try {
            const response = await fetch(`${chatURL}?orderBy="$key"&limitToLast=40`);
            const data = await response.json();
            if (!data) return;
            container.innerHTML = "";
            Object.keys(data).forEach(id => {
                const m = data[id];
                const d = new Date(m.time);
                const h = String(d.getHours()).padStart(2, '0');
                const i = String(d.getMinutes()).padStart(2, '0');
                const s = String(d.getSeconds()).padStart(2, '0');
                const timeStr = `${h}:${i}:${s}`;

                const div = document.createElement('div');
                div.style.cssText = "margin-bottom:6px; word-wrap:break-word; border-bottom:1px solid #1a1a1a; padding-bottom:3px;";
                div.innerHTML = `
                    <span class="chat-timestamp">[${timeStr}]</span>
                    <b style="color:#f1c40f; font-size:11px;">${m.nick}:</b> 
                    <span style="color:#eee; font-size:11px;">${m.msg}</span>
                `;
                container.appendChild(div);
            });
            container.scrollTop = container.scrollHeight;
        } catch (err) { }
    }

    const handleSend = () => {
        if (input.value.trim() !== "") {
            sendMessage(input.value);
            input.value = "";
        }
    };

    input.onkeypress = (e) => {
        if (e.key === 'Enter') handleSend();
    };

    sendBtn.onclick = handleSend;

    // --- DRAG LOGIC ---
    let isDragging = false, oL, oT;
    ui.addEventListener('mousedown', (e) => { 
        if (e.target.id === 'chat-header') { 
            isDragging = true; 
            oL = e.clientX - ui.offsetLeft; 
            oT = e.clientY - ui.offsetTop; 
            document.body.style.userSelect = 'none';
        } 
    });

    document.addEventListener('mousemove', (e) => { 
        if (isDragging) { 
            let x = Math.max(0, Math.min(e.clientX - oL, window.innerWidth - ui.offsetWidth));
            let y = Math.max(0, Math.min(e.clientY - oT, window.innerHeight - ui.offsetHeight));
            ui.style.left = x + 'px'; ui.style.top = y + 'px';
        } 
    });

    document.addEventListener('mouseup', () => { 
        if (isDragging) { 
            isDragging = false; 
            document.body.style.userSelect = '';
            saveSettings(); 
        } 
    });

    setInterval(fetchMessages, 3000);
    setInterval(updatePresence, 15000);
    setInterval(fetchOnlineUsers, 7000);
    
    fetchMessages(); updatePresence(); fetchOnlineUsers();
    ui.querySelector('#close-chat').onclick = () => ui.remove();
})();
