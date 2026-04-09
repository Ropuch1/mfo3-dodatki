(function() {
    'use strict';

    // Konfiguracja bazy z Twoich ustawień Firebase
    const dbURL = "https://lootlogmfo-default-rtdb.europe-west1.firebasedatabase.app/global_chat.json";

    // Wstrzyknięcie stylów dla scrollbara i wyglądu okna
    const style = document.createElement('style');
    style.innerHTML = `
        #global-msg-container::-webkit-scrollbar { width: 8px; }
        #global-msg-container::-webkit-scrollbar-track { background: #111; border-radius: 4px; }
        #global-msg-container::-webkit-scrollbar-thumb { background: #e67e22; border-radius: 4px; border: 1px solid #111; }
        #global-msg-container::-webkit-scrollbar-thumb:hover { background: #d35400; }
        .global-chat-ui { position:fixed; z-index:999999; background:rgba(20,20,20,0.95); color:#f0f0f0; padding:8px; border:2px solid #e67e22; border-radius:8px; font-family:Arial, sans-serif; width:260px; box-shadow: 0 0 15px #000; }
    `;
    document.head.appendChild(style);

    // Inicjalizacja pozycji okna
    const savedPos = JSON.parse(localStorage.getItem('mfo3_global_pos')) || {top: "300px", left: "10px"};
    const ui = document.createElement('div');
    ui.className = 'global-chat-ui';
    ui.style.top = savedPos.top;
    ui.style.left = savedPos.left;
    document.body.appendChild(ui);

    ui.innerHTML = `
        <div style="display:flex; justify-content:space-between; margin-bottom:5px; border-bottom:1px solid #e67e22; padding-bottom:3px; cursor:move;">
            <b style="color:#e67e22; font-size:12px;">GLOBAL CHAT</b>
            <span id="close-chat" style="cursor:pointer; color:#e74c3c; font-weight:bold; padding:0 5px;">X</span>
        </div>
        <div id="global-msg-container" style="height:180px; overflow-y:scroll; background:#000; padding:8px; margin-bottom:5px; font-size:11px; display:block; border:1px solid #333; scroll-behavior: smooth;"></div>
        <input id="global-input" type="text" placeholder="Napisz i Enter..." style="width:calc(100% - 14px); background:#222; border:1px solid #e67e22; color:white; padding:5px; border-radius:3px; outline:none; font-size:12px;">
    `;

    const container = ui.querySelector('#global-msg-container');
    const input = ui.querySelector('#global-input');

    // Pobieranie danych (używa standardowego fetch zamiast GM_xmlhttpRequest)
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
            console.error("Błąd pobierania z Firebase:", err);
        }
    }

    // Wysyłanie danych
    input.onkeypress = async function(e) {
        if (e.key === 'Enter' && input.value.trim() !== "") {
            // Pobieranie nicku z profilu gracza (np. Black Shadow)
            const profileNick = document.querySelector('.name .profile')?.innerText;
            const myNick = profileNick || "Gracz";
            
            const msgBody = {
                nick: myNick,
                msg: input.value,
                time: Date.now()
            };

            input.value = "";

            try {
                await fetch(dbURL, {
                    method: 'POST',
                    body: JSON.stringify(msgBody)
                });
                fetchMessages();
            } catch (err) {
                console.error("Błąd wysyłania do Firebase:", err);
            }
        }
    };

    // Odświeżanie i obsługa okna
    setInterval(fetchMessages, 3000);
    fetchMessages();

    // Prosta obsługa przeciągania
    let isDragging = false, ox, oy;
    ui.onmousedown = (e) => { 
        if(e.target.tagName !== 'INPUT' && e.target.id !== 'close-chat'){ 
            isDragging = true; 
            ox = e.clientX - ui.getBoundingClientRect().left; 
            oy = e.clientY - ui.getBoundingClientRect().top; 
        }
    };
    document.addEventListener('mousemove', (e) => { 
        if(isDragging){ 
            ui.style.left = (e.clientX - ox) + 'px'; 
            ui.style.top = (e.clientY - oy) + 'px'; 
        }
    });
    document.addEventListener('mouseup', () => { 
        if(isDragging) {
            isDragging = false; 
            localStorage.setItem('mfo3_global_pos', JSON.stringify({top: ui.style.top, left: ui.style.left})); 
        }
    });

    ui.querySelector('#close-chat').onclick = () => ui.remove();

})();
