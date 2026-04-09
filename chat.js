(function() {
    'use strict';

    // --- KONFIGURACJA ---
    const dbURL = "https://lootlogmfo-default-rtdb.europe-west1.firebasedatabase.app/";
    const chatURL = dbURL + "global_chat.json";
    const onlineURL = dbURL + "online_users"; // Bez .json tutaj, dodamy go w fetchach

    // --- STYLE CSS ---
    const style = document.createElement('style');
    style.innerHTML = `
        #mfo3-chat-ui {
            position: fixed; z-index: 999999; background: rgba(20, 20, 20, 0.95);
            color: #f0f0f0; padding: 8px; border: 2px solid #e67e22;
            border-radius: 8px; font-family: Arial, sans-serif;
            box-shadow: 0 0 15px #000; display: flex; flex-direction: column;
            box-sizing: border-box; min-width: 220px; min-height: 150px;
            resize: both; overflow: hidden;
        }
        #global-msg-container {
            flex-grow: 1; overflow-y: auto; background: #000;
            padding: 8px; margin-bottom: 5px; font-size: 11px;
            border: 1px solid #333; scroll-behavior: smooth;
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
        #global-input {
            width: 100%; background: #222; border: 1px solid #e67e22;
            color: white; padding: 6px; border-radius: 3px;
            outline: none; font-size: 12px; box-sizing: border-box;
        }
    `;
    document.head.appendChild(style);

    // --- STAN I USTAWIENIA ---
    const settings = JSON.parse(localStorage.getItem('mfo3_chat_v5')) || {
        top: 300, left: 10, width: 280, height: 200
    };

    const ui = document.createElement('div');
    ui.id = "mfo3-chat-ui";
    ui.style.top = settings.top + "px";
    ui.style.left = settings.left + "px";
    ui.style.width = settings.width + "px";
    document.body.appendChild(ui);

    ui.innerHTML = `
        <div id="chat-header" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:5px; border-bottom:1px solid #e67e22; padding-bottom:4px; cursor:move; user-select:none;">
            <b style="color:#e67e22; font-size:11px;">GLOBAL CHAT</b>
            <div style="display:flex; align-items:center;">
                <span id="online-indicator" data-online-list="Czekam na dane...">● Online</span>
                <span id="close-chat" style="cursor:pointer; color:#e74c3c; font-weight:bold; font-size:16px; line-height:1;">&times;</span>
            </div>
        </div>
        <div id="global-msg-container"></div>
        <input id="global-input" type="text" placeholder="Napisz coś..." maxlength="200">
    `;

    const container = ui.querySelector('#global-msg-container');
    const input = ui.querySelector('#global-input');
    const onlineSign = ui.querySelector('#online-indicator');
    container.style.height = settings.height + "px";

    const getMyNick = () => {
        const nick = document.querySelector('.name .profile')?.innerText;
        return nick ? nick.trim() : "Anonim";
    };

    // --- FUNKCJA OBECNOŚCI (HEARTBEAT) ---
    async function updatePresence() {
        const nick = getMyNick();
        try {
            // Używamy .sv: timestamp aby uniknąć problemów z zegarem lokalnym
            await fetch(`${onlineURL}/${nick}.json`, {
                method: 'PUT',
                body: JSON.stringify({ lastActive: { ".sv": "timestamp" } })
            });
        } catch (e) { console.warn("Presence Error", e); }
    }

    async function fetchOnlineUsers() {
        try {
            const response = await fetch(`${onlineURL}.json`);
            const data = await response.json();
            if (!data) return;

            const now = Date.now();
            let onlineList = [];

            for (let nick in data) {
                // Jeśli serwer odnotował aktywność w ciągu ostatnich 25 sekund
                if (now - data[nick].lastActive < 25000) {
                    onlineList.push(nick);
                }
            }
            
            onlineSign.innerText = `● ${onlineList.length}`;
            onlineSign.setAttribute('data-online-list', "Gracze online:\n" + (onlineList.length > 0 ? onlineList.join('\n') : "Nikt :("));
        } catch (e) { console.warn("Fetch Online Error", e); }
    }

    // --- FUNKCJE CZATU ---
    async function fetchMessages() {
        try {
            const response = await fetch(`${chatURL}?orderBy="$key"&limitToLast=40`);
            const data = await response.json();
            if (!data) return;

            container.innerHTML = "";
            Object.keys(data).forEach(id => {
                const m = data[id];
                const div = document.createElement('div');
                div.style.cssText = "margin-bottom:6px; word-wrap:break-word; border-bottom:1px solid #1a1a1a; padding-bottom:3px;";
                div.innerHTML = `<b style="color:#f1c40f; font-size:11px;">${m.nick}:</b> <span style="color:#eee; font-size:11px;">${m.msg}</span>`;
                container.appendChild(div);
            });
            container.scrollTop = container.scrollHeight;
        } catch (err) { console.warn("Fetch Msg Error", err); }
    }

    input.onkeypress = async function(e) {
        if (e.key === 'Enter' && input.value.trim() !== "") {
            const msg = input.value;
            input.value = "";
            try {
                await fetch(chatURL, {
                    method: 'POST',
                    body: JSON.stringify({ nick: getMyNick(), msg: msg, time: { ".sv": "timestamp" } })
                });
                fetchMessages();
            } catch (err) {}
        }
    };

    // --- PRZESUWANIE OKNA ---
    let isDragging = false, oL, oT;
    ui.addEventListener('mousedown', (e) => {
        if (e.target.id === 'chat-header') {
            isDragging = true;
            oL = e.clientX - ui.offsetLeft;
            oT = e.clientY - ui.offsetTop;
        }
    });

    document.addEventListener('mousemove', (e) => {
        if (isDragging) {
            ui.style.left = (e.clientX - oL) + 'px';
            ui.style.top = (e.clientY - oT) + 'px';
        }
    });

    document.addEventListener('mouseup', () => {
        if (isDragging || ui.style.width) {
            isDragging = false;
            localStorage.setItem('mfo3_chat_v5', JSON.stringify({
                top: parseInt(ui.style.top),
                left: parseInt(ui.style.left),
                width: parseInt(ui.style.width),
                height: parseInt(container.offsetHeight)
            }));
        }
    });

    // --- START ---
    setInterval(fetchMessages, 3000);
    setInterval(updatePresence, 15000); // Co 15 sekund daj znać, że żyjesz
    setInterval(fetchOnlineUsers, 7000); // Co 7 sekund sprawdź listę
    
    fetchMessages();
    updatePresence();
    fetchOnlineUsers();

    ui.querySelector('#close-chat').onclick = () => ui.remove();

})();
