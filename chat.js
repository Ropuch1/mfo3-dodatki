(function() {
    'use strict';

    const existingChat = document.getElementById('tm-discord-chat');
    if (existingChat) {
        existingChat.remove();
    }

    // Lista użytkowników z aliasami (np. foxed dla Ibiquera)
    const USERS = [
        { name: 'Ropuch', tag: '@Ropuch', id: '<@700040434759630898>', aliases: [] },
        { name: 'Savage', tag: '@Savage', id: '<@320276627231604736>', aliases: [] },
        { name: 'Cukier', tag: '@Cukier', id: '<@336824138155163649>', aliases: [] },
        { name: 'Ibiquer', tag: '@Ibiquer', id: '<@420325804640174080>', aliases: ['foxed'] }
    ];

    // Odwrotne mapowanie (ID -> Nick) do ładnego wyświetlania w grze
    const REVERSE_PINGS = {
        '&lt;@700040434759630898&gt;': '@Ropuch',
        '&lt;@320276627231604736&gt;': '@Savage',
        '&lt;@336824138155163649&gt;': '@Cukier',
        '&lt;@420325804640174080&gt;': '@Ibiquer'
    };

    function initChat() {
        const SERVER_URL = 'https://mfo3chat.tojest.dev';
        let PLAYER_NAME = localStorage.getItem('tm_discord_chat_nick') || 'Ropuch';
        let PLAYER_COLOR = localStorage.getItem('tm_discord_chat_color') || '#e67e22';

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
                    height: 410px;
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
                #tm-discord-chat.tm-collapsed #tm-quick-bar,
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
                #tm-color-picker {
                    width: 22px;
                    height: 22px;
                    border: none;
                    background: none;
                    cursor: pointer;
                    padding: 0;
                    border-radius: 50%;
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
                .tm-mention {
                    background-color: rgba(88, 101, 242, 0.3);
                    color: #c9cdfb;
                    padding: 0 4px;
                    border-radius: 3px;
                    font-weight: bold;
                }
                #tm-quick-bar {
                    display: flex;
                    gap: 6px;
                    padding: 6px 10px;
                    background: #181825;
                    border-top: 1px solid #333;
                }
                .tm-quick-btn {
                    border: none;
                    color: white;
                    padding: 4px 8px;
                    border-radius: 4px;
                    cursor: pointer;
                    font-weight: bold;
                    font-size: 11px;
                    transition: opacity 0.2s;
                }
                .tm-quick-btn:hover {
                    opacity: 0.8;
                }
                #tm-btn-ide { background: #2980b9; }
                #tm-btn-hydraulik { background: #5d4037; }

                #tm-chat-input-box {
                    position: relative;
                    display: flex;
                    border-top: 1px solid #222;
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
                #tm-chat-send:hover { background: #4752c4; }

                /* Stylizacja podpowiedzi pingu */
                #tm-mention-popup {
                    display: none;
                    position: absolute;
                    bottom: 100%;
                    left: 0;
                    right: 0;
                    background: #232428;
                    border: 1px solid #5865F2;
                    border-bottom: none;
                    border-top-left-radius: 6px;
                    border-top-right-radius: 6px;
                    max-height: 130px;
                    overflow-y: auto;
                    z-index: 1000000;
                    box-shadow: 0 -4px 10px rgba(0,0,0,0.5);
                }
                .tm-mention-item {
                    padding: 6px 12px;
                    cursor: pointer;
                    color: #dbdee1;
                    font-size: 12px;
                    font-weight: bold;
                    display: flex;
                    align-items: center;
                }
                .tm-mention-item:hover, .tm-mention-item.selected {
                    background: #5865F2;
                    color: white;
                }
            </style>

            <div id="tm-chat-header">
                <span>Czat Discord</span>
                <div class="tm-header-right">
                    <span id="tm-chat-status" style="font-size: 10px; opacity: 0.8;">Łączenie...</span>
                    <input type="color" id="tm-color-picker" value="${PLAYER_COLOR}" title="Kliknij, aby zmienić kolor nicku">
                    <span id="tm-chat-settings" class="tm-btn-icon" title="Zmień swój nick">⚙️</span>
                    <span id="tm-chat-toggle" class="tm-btn-icon" title="Zwiń / Rozwiń">${savedCollapsed ? '➕' : '➖'}</span>
                </div>
            </div>
            <div id="tm-chat-messages"></div>
            
            <div id="tm-quick-bar">
                <button id="tm-btn-ide" class="tm-quick-btn">ide</button>
                <button id="tm-btn-hydraulik" class="tm-quick-btn">hydraulik</button>
            </div>

            <div id="tm-chat-input-box">
                <div id="tm-mention-popup"></div>
                <input type="text" id="tm-chat-input" placeholder="Napisz coś..." />
                <button id="tm-chat-send">Wyślij</button>
            </div>
        `;

        document.body.appendChild(chatContainer);

        const messagesDiv = document.getElementById('tm-chat-messages');
        const input = document.getElementById('tm-chat-input');
        const sendBtn = document.getElementById('tm-chat-send');
        const statusSpan = document.getElementById('tm-chat-status');
        const settingsBtn = document.getElementById('tm-chat-settings');
        const colorPicker = document.getElementById('tm-color-picker');
        const toggleBtn = document.getElementById('tm-chat-toggle');
        const header = document.getElementById('tm-chat-header');
        const mentionPopup = document.getElementById('tm-mention-popup');

        // Blokada przechwytywania klawiszy przez grę
        ['keydown', 'keyup', 'keypress'].forEach(eventType => {
            input.addEventListener(eventType, (e) => {
                e.stopPropagation();
            });
        });

        // Logika autouzupełniania pingów (z obsługą aliasów)
        let selectedIndex = 0;
        let currentMatches = [];

        function updateMentionPopup() {
            const text = input.value;
            const cursorPos = input.selectionStart;
            const textBeforeCursor = text.slice(0, cursorPos);
            
            const match = textBeforeCursor.match(/@([a-zA-Z0-9_]*)$/);

            if (match) {
                const query = match[1].toLowerCase();
                
                // Szukanie po nazwie lub aliasach
                currentMatches = USERS.filter(u => {
                    const nameMatch = u.name.toLowerCase().startsWith(query);
                    const aliasMatch = u.aliases.some(a => a.toLowerCase().startsWith(query));
                    return nameMatch || aliasMatch;
                });

                if (currentMatches.length > 0) {
                    if (selectedIndex >= currentMatches.length) selectedIndex = 0;
                    renderPopup();
                    mentionPopup.style.display = 'block';
                    return;
                }
            }
            hidePopup();
        }

        function renderPopup() {
            mentionPopup.innerHTML = '';
            currentMatches.forEach((user, index) => {
                const item = document.createElement('div');
                item.className = `tm-mention-item ${index === selectedIndex ? 'selected' : ''}`;
                item.innerText = `@${user.name}`; // Zawsze wyświetla główny nick (@Ibiquer)
                item.addEventListener('mousedown', (e) => {
                    e.preventDefault();
                    applyMention(user);
                });
                mentionPopup.appendChild(item);
            });
        }

        function hidePopup() {
            mentionPopup.style.display = 'none';
            currentMatches = [];
            selectedIndex = 0;
        }

        function applyMention(user) {
            const text = input.value;
            const cursorPos = input.selectionStart;
            const textBeforeCursor = text.slice(0, cursorPos);
            const textAfterCursor = text.slice(cursorPos);

            // Podmienia wpisany ciąg (np. @foxed) na główny nick (@Ibiquer)
            const newTextBefore = textBeforeCursor.replace(/@([a-zA-Z0-9_]*)$/, `@${user.name} `);
            input.value = newTextBefore + textAfterCursor;
            
            const newCursorPos = newTextBefore.length;
            input.setSelectionRange(newCursorPos, newCursorPos);
            
            hidePopup();
            input.focus();
        }

        input.addEventListener('input', updateMentionPopup);

        // Wybór i zapisywanie koloru
        colorPicker.addEventListener('input', (e) => {
            PLAYER_COLOR = e.target.value;
            localStorage.setItem('tm_discord_chat_color', PLAYER_COLOR);
        });

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
            if (e.target.classList.contains('tm-btn-icon') || e.target.id === 'tm-color-picker') return;
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

        function escapeHtml(str) {
            if (!str) return '';
            return String(str).replace(/[&<>"']/g, function(m) {
                return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[m];
            });
        }

        function renderMessage(author, content, color, timestamp = Date.now()) {
            const timeStr = new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            let safeContent = escapeHtml(content);

            for (const [idTag, prettyName] of Object.entries(REVERSE_PINGS)) {
                const regex = new RegExp(idTag, 'g');
                safeContent = safeContent.replace(regex, `<span class="tm-mention">${prettyName}</span>`);
            }

            const msgDiv = document.createElement('div');
            msgDiv.className = 'tm-msg';
            msgDiv.innerHTML = `<span class="tm-time">[${timeStr}]</span><span class="tm-author" style="color:${color}">${escapeHtml(author)}:</span> ${safeContent}`;
            messagesDiv.appendChild(msgDiv);
            messagesDiv.scrollTop = messagesDiv.scrollHeight;
        }

        const socket = (typeof io !== 'undefined') ? io(SERVER_URL) : null;

        if (!socket) {
            statusSpan.innerText = 'BŁĄD IO';
            statusSpan.style.color = '#e74c3c';
            return;
        }

        settingsBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const newNick = prompt("Podaj nowy nick, który będzie widoczny w czacie:", PLAYER_NAME);
            if (newNick && newNick.trim() !== "") {
                PLAYER_NAME = newNick.trim();
                localStorage.setItem('tm_discord_chat_nick', PLAYER_NAME);
                renderMessage('System', `Twój nick został zmieniony na: ${PLAYER_NAME}`, '#f1c40f');
            }
        });

        socket.on('connect', () => {
            statusSpan.innerText = 'ONLINE';
            statusSpan.style.color = '#2ecc71';
        });

        socket.on('disconnect', () => {
            statusSpan.innerText = 'OFFLINE';
            statusSpan.style.color = '#e74c3c';
        });

        socket.on('chatHistory', (history) => {
            messagesDiv.innerHTML = '';
            if (Array.isArray(history)) {
                history.forEach(msg => {
                    renderMessage(msg.author, msg.content, msg.color || '#5865F2', msg.timestamp);
                });
            }
        });

        socket.on('discordMessage', (data) => {
            renderMessage(data.author, data.content, data.color || '#5865F2', data.timestamp);
        });

        function sendCustomText(text) {
            if (!text || !text.trim()) return;
            
            let processedText = text.trim();
            
            // Podmiana zarówno nazw jak i ich aliasów na ID Discorda
            USERS.forEach(user => {
                const targets = [user.name, ...user.aliases];
                targets.forEach(target => {
                    const regex = new RegExp(`@${target}`, 'gi');
                    processedText = processedText.replace(regex, user.id);
                });
            });

            socket.emit('gameMessage', {
                author: PLAYER_NAME,
                content: processedText,
                color: PLAYER_COLOR
            });
        }

        function sendMessageFromInput() {
            const text = input.value;
            if (!text.trim()) return;
            sendCustomText(text);
            input.value = '';
            hidePopup();
        }

        document.getElementById('tm-btn-ide').onclick = () => sendCustomText("ide");
        document.getElementById('tm-btn-hydraulik').onclick = () => sendCustomText("ile jeszcze tego gnoju");

        sendBtn.addEventListener('click', sendMessageFromInput);

        input.addEventListener('keydown', (e) => {
            if (mentionPopup.style.display === 'block' && currentMatches.length > 0) {
                if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    selectedIndex = (selectedIndex + 1) % currentMatches.length;
                    renderPopup();
                    return;
                }
                if (e.key === 'ArrowUp') {
                    e.preventDefault();
                    selectedIndex = (selectedIndex - 1 + currentMatches.length) % currentMatches.length;
                    renderPopup();
                    return;
                }
                if (e.key === 'Enter' || e.key === 'Tab') {
                    e.preventDefault();
                    applyMention(currentMatches[selectedIndex]);
                    return;
                }
                if (e.key === 'Escape') {
                    e.preventDefault();
                    hidePopup();
                    return;
                }
            }

            if (e.key === 'Enter') {
                e.preventDefault();
                sendMessageFromInput();
            }
        });
    }

    if (typeof io !== 'undefined') {
        initChat();
    } else {
        const script = document.createElement('script');
        script.src = 'https://cdn.socket.io/4.7.5/socket.io.min.js';
        script.onload = initChat;
        document.head.appendChild(script);
    }
})();
