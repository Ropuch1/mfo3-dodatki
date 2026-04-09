(function() {
    'use strict';

    // Konfiguracja bazy danych Firebase
    const dbURL = "https://lootlogmfo-default-rtdb.europe-west1.firebasedatabase.app/global_chat.json";

    // Wstrzyknięcie stylów CSS dla interfejsu i natywnego skalowania
    const style = document.createElement('style');
    style.innerHTML = `
        #mfo3-chat-ui {
            position: fixed;
            z-index: 999999;
            background: rgba(20, 20, 20, 0.95);
            color: #f0f0f0;
            padding: 8px;
            border: 2px solid #e67e22;
            border-radius: 8px;
            font-family: Arial, sans-serif;
            box-shadow: 0 0 15px #000;
            display: flex;
            flex-direction: column;
            box-sizing: border-box;
            min-width: 180px;
            min-height: 120px;
            resize: both; /* Włącza natywne skalowanie przeglądarki */
            overflow: hidden;
        }
        #global-msg-container {
            flex-grow: 1;
            overflow-y: auto;
            background: #000;
            padding: 8px;
            margin-bottom: 5px;
            font-size: 11px;
            border: 1px solid #333;
            scroll-behavior: smooth;
        }
        #global-msg-container::-webkit-scrollbar { width: 8px; }
        #global-msg-container::-webkit-scrollbar-track { background: #111; }
        #global-msg-container::-webkit-scrollbar-thumb { background: #e67e22; border-radius: 4px; }
        
        #mfo3-chat-ui::-webkit-resizer {
            background-color: #e67e22;
            border: 2px solid #1a1a1a;
        }
        #global-input {
            width: 100%;
            background: #222;
            border: 1px solid #e67e22;
            color: white;
            padding: 5px;
            border-radius: 3px;
            outline: none;
            font-size: 12px;
            box-sizing: border-box;
            flex-shrink: 0;
        }
    `;
    document.head.appendChild(style);

    // Wczytanie zapisanych ustawień rozmiaru i pozycji
    const settings = JSON.parse(localStorage.getItem('mfo3_chat_v5')) || {
        top: 300, left: 10, width: 260, height: 180
    };

    // Tworzenie głównego interfejsu
    const ui = document.createElement('div');
    ui.id = "mfo3-chat-ui";
    ui.style.top = settings.top + "px";
    ui.style.left = settings.left + "px";
    ui.style.width = settings.width + "px";
    document.body.appendChild(ui);

    ui.innerHTML = `
        <div id="chat-header" style="display:flex; justify-content:space-between; margin-bottom:5px; border-bottom:1px solid #e67e22; padding-bottom:3px; cursor:move; user-select:none; flex-shrink: 0;">
            <b style="color:#e67e22; font-size:12px; pointer-events:none;">GLOBAL CHAT</b>
            <span id="close-chat" style="cursor:pointer; color:#e74c3c; font-weight:bold; padding:0 5px;">X</span>
        </div>
        <div id="global-msg-container"></div>
        <input id="global-input" type="text" placeholder="Napisz i Enter...">
    `;

    const container = ui.querySelector('#global-msg-container');
    const input = ui.querySelector('#global-input');
    
    // Ustawienie początkowej wysokości kontenera wiadomości
    container.style.height = settings.height + "px";

    // Pobieranie wiadomości z Firebase (REST API)
    async function fetchMessages() {
        try {
            const response = await fetch(`${dbURL}?orderBy="$key"&limitToLast=30`);
            const data = await response.json();
            
            container.innerHTML = "";
            for (let id in data) {
                const m = data[id];
                const div = document.createElement('div');
                div.style.cssText = "margin-bottom:6px; word-wrap:break-word; border-bottom:1px solid #1a1a1a; padding-bottom:3px;";
                div.innerHTML = `<b style="color:#f1c40f;">${m.nick}:</b> <span style="color:#eee;">${m.msg}</span>`;
                container.appendChild(div);
            }
            container.scrollTop = container.scrollHeight;
        } catch (err) {
            console.error("Błąd pobierania:", err);
        }
    }

    // Wysyłanie wiadomości
    input.onkeypress = async function(e) {
        if (e.key === 'Enter' && input.value.trim() !== "") {
            const profileNick = document.querySelector('.name .profile')?.innerText;
            const myNick = profileNick || "Gracz";
            const text = input.value;
            input.value = "";

            try {
                await fetch(dbURL, {
                    method: 'POST',
                    body: JSON.stringify({ nick: myNick, msg: text, time: Date.now() })
                });
                fetchMessages();
            } catch (err) {
                console.error("Błąd wysyłania:", err);
            }
        }
    };

    // Przesuwanie okna (Drag)
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

    // Zapisywanie stanu po zmianie
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

    // Start odświeżania
    setInterval(fetchMessages, 3000);
    fetchMessages();
    ui.querySelector('#close-chat').onclick = () => ui.remove();

})();
