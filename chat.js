(function() {
    'use strict';

    // Jeśli czat już istnieje na stronie, nie twórz go drugi raz
    if (document.getElementById('tm-discord-chat')) return;

    // Funkcja dynamicznie wczytująca bibliotekę Socket.IO
    function loadSocketIO(callback) {
        if (typeof io !== 'undefined') {
            callback();
            return;
        }
        const script = document.createElement('script');
        script.src = 'https://cdn.socket.io/4.7.2/socket.io.min.js';
        script.onload = callback;
        document.head.appendChild(script);
    }

    loadSocketIO(() => {
        const SERVER_URL = 'https://van-educated-geo-occasion.trycloudflare.com';
        let PLAYER_NAME = localStorage.getItem('tm_discord_chat_nick') || 'Ropuch';

        const savedPos = JSON.parse(localStorage.getItem('tm_discord_chat_pos') || 'null');
        const savedCollapsed = localStorage.getItem('tm_discord_chat_collapsed') === 'true';

        const chatContainer = document.createElement('div');
        chatContainer.id = 'tm-discord-chat';

        if (savedPos && savedPos.left !== undefined && savedPos.top !== undefined) {
            chatContainer.style.left = savedPos.left + 'px';
            chatContainer.style.top = savedPos.top + 'px';
            chatContainer.style.right = 'auto';
            chatContainer.style.bottom = 'auto';
        } else {
            chatContainer.style.bottom = '20px';
            chatContainer.style.right = '20px';
        }

        if (savedCollapsed) {
            chatContainer.classList.add('tm-collapsed');
        }

        chatContainer.innerHTML = `
            <style>
                #tm-discord-chat {
                    position: fixed;
                    width: 320px;
                    height: 380px;
                    background: #1e1e2e;
                    border: 2px solid #5865F2;
                    border-radius: 10px;
                    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.6);
                    color: white;
                    font-family: Arial, sans-serif;
                    display: flex;
                    flex-direction: column;
                    z-index: 999999;
                    font-size: 13px;
                    user-select: none;
                    box-sizing: border-box;
                }
                #tm-discord-chat.tm-collapsed {
                    height: auto !important;
                }
                #tm-discord-chat.tm-collapsed #tm-chat-messages,
                #tm-discord-chat.tm-collapsed #tm-chat-input-box {
                    display: none !important;
                }
                #tm-chat-header {
                    background: #5865F2;
                    padding: 8px 12px;
                    font-weight: bold;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    border-radius: 8px 8px 0 0;
                    cursor: move;
                }
                .tm-header-right {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }
                .tm-btn-icon {
                    cursor: pointer;
                    font-size: 13px;
                    user-select: none;
                    transition: opacity 0.2s;
                }
                .tm-btn-icon:hover {
                    opacity: 0.7;
                }
                #tm-chat-messages {
                    flex: 1;
                    padding: 10px;
                    overflow-y: auto;
                    display: flex;
                    flex-direction: column;
                    gap: 6px;
                    user-select: text;
                }
                .tm-msg {
                    word-break: break-word;
                    line-height: 1.3;
                }
                .tm-time {
                    opacity: 0.5;
                    font-size: 10px;
                    margin-right: 4px;
                }
                .tm-author {
                    font-weight: bold;
                }
                #tm-chat-input-box {
                    display: flex;
                    border-top: 1px solid #333;
                }
                #tm-chat-input {
                    flex: 1;
                    padding: 8px 10px;
                    border: none;
                    background: #2b2b3b;
                    color: white;
                    outline: none;
                    border-bottom-left-radius: 8px;
                    user-select: text;
                }
                #tm-chat-send {
                    padding: 8px 12px;
                    background: #5865F2;
                    color: white;
                    border: none;
                    cursor: pointer;
                    border-bottom-right-radius: 8px;
                    font-weight: bold;
                }
                #tm-chat-send:hover {
                    background: #4752c4;
                }
            </style>

            <div id="tm-chat-header">
                <span>Czat Discord</span>
                <div class="tm-header-right">
                    <span id="tm-chat-status" style="font-size: 10px; opacity: 0.8;">Łączenie...</span>
                    <span id="tm-chat-settings" class="tm-btn-icon" title="Zmień swój nick">⚙️</span>
                    <span id="tm-chat-toggle" class="tm-btn-icon" title="Zwiń / Rozwiń">${savedCollapsed ? '➕' : '➖'}</span>
                </div>
            </div>
            <div id="tm-chat-messages"></div>
            <div id="tm-chat-input-box">
                <input type="text" id="tm-chat-input" placeholder="Napisz coś..." tabindex="-1" />
                <button id="tm-chat-send">Wyślij</button>
            </div>
        `;

        document.body.appendChild(chatContainer);

        const messagesDiv = document.getElementById('tm-chat-messages');
        const input = document.getElementById('tm-chat-input');
        const sendBtn = document.getElementById('tm-chat-send');
        const statusSpan = document.getElementById('tm-chat-status');
        const settingsBtn = document.getElementById('tm-chat-settings');
        const toggleBtn = document.getElementById('tm-chat-toggle');
        const header = document.getElementById('tm-chat-header');

        // Zwijanie / Rozwijanie
        let isCollapsed = savedCollapsed;
        toggleBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            isCollapsed = !isCollapsed;
            chatContainer.classList.toggle('tm-collapsed', isCollapsed);
            toggleBtn.innerText = isCollapsed ? '➕' : '➖';
            localStorage.setItem('tm_discord_chat_collapsed', isCollapsed);
        });

        // Przesuwanie okna
        let isDragging = false;
        let offsetX = 0, offsetY = 0;

        header.addEventListener('mousedown', (e) => {
            if (e.target.classList.contains('tm-btn-icon')) return;
            isDragging = true;
            const rect = chatContainer.getBoundingClientRect();
            offsetX = e.clientX - rect.left;
            offsetY = e.clientY - rect.top;

            chatContainer.style.right = 'auto';
            chatContainer.style.bottom = 'auto';
            chatContainer.style.left = rect.left + 'px';
            chatContainer.style.top = rect.top + 'px';
        });

        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;

            let newX = e.clientX - offsetX;
            let newY = e.clientY - offsetY;

            const winWidth = window.innerWidth;
            const winHeight = window.innerHeight;
            const rect = chatContainer.getBoundingClientRect();

            if (newX < 0) newX = 0;
            if (newY < 0) newY = 0;
            if (newX + rect.width > winWidth) newX = winWidth - rect.width;
            if (newY + rect.height > winHeight) newY = winHeight - rect.height;

            chatContainer.style.left = newX + 'px';
            chatContainer.style.top = newY + 'px';
        });

        document.addEventListener('mouseup', () => {
            if (isDragging) {
                isDragging = false;
                const rect = chatContainer.getBoundingClientRect();
                localStorage.setItem('tm_discord_chat_pos', JSON.stringify({ left: rect.left, top: rect.top }));
            }
        });

        // Renderowanie wiadomości
        function renderMessage(author, content, color, timestamp = Date.now()) {
            const timeStr = new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            const msgDiv = document.createElement('div');
            msgDiv.className = 'tm-msg';
            msgDiv.innerHTML = `<span class="tm-time">[${timeStr}]</span><span class="tm-author" style="color:${color}">${author}:</span> ${content}`;
            messagesDiv.appendChild(msgDiv);
            messagesDiv.scrollTop = messagesDiv.scrollHeight;
        }

        const socket = io(SERVER_URL);

        // Zmiana nicku
        settingsBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const newNick = prompt("Podaj nowy nick, który będzie widoczny w czacie:", PLAYER_NAME);
            if (newNick && newNick.trim() !== "") {
                PLAYER_NAME = newNick.trim();
                localStorage.setItem('tm_discord_chat_nick', PLAYER_NAME);
                renderMessage('System', `Twój nick został zmieniony na: ${PLAYER_NAME}`, '#f1c40f');
            }
        });

        // Status połączenia
        socket.on('connect', () => {
            statusSpan.innerText = 'ONLINE';
            statusSpan.style.color = '#2ecc71';
        });

        socket.on('disconnect', () => {
            statusSpan.innerText = 'OFFLINE';
            statusSpan.style.color = '#e74c3c';
        });

        // Historia
        socket.on('chatHistory', (history) => {
            messagesDiv.innerHTML = '';
            history.forEach(msg => {
                renderMessage(msg.author, msg.content, msg.color, msg.timestamp);
            });
        });

        // Wiadomości na żywo
        socket.on('discordMessage', (data) => {
            renderMessage(data.author, data.content, data.color || '#5865F2', data.timestamp);
        });

        // Wysyłanie
        function sendMessage() {
            const text = input.value.trim();
            if (!text) return;

            socket.emit('gameMessage', {
                author: PLAYER_NAME,
                content: text
            });

            input.value = '';
        }

        sendBtn.addEventListener('click', sendMessage);
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') sendMessage();
        });
    });
})();
