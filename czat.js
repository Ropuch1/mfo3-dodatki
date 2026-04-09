// ==UserScript==
// @name         MFO3 - Box Drużyna (Solver Style)
// @version      22.0
// @description  Wyświetla wiadomości z czatu drużynowego w stylowym, przesuwalnym boxie.
// @author       Gemini
// @match        https://s1.mfo3.pl/game/
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // Pobieramy zapisaną pozycję (lub domyślną)
    const savedPos = JSON.parse(localStorage.getItem('mfo3_team_pos')) || {top: "250px", left: "10px"};

    // 1. Kontener główny
    const teamUi = document.createElement('div');
    teamUi.id = "mfo3-team-box-solver-style";
    teamUi.style.cssText = `
        position: fixed; 
        top: ${savedPos.top}; 
        left: ${savedPos.left}; 
        z-index: 99998;
        background: rgba(10, 10, 10, 0.95); 
        color: #f0f0f0; 
        padding: 7px;
        border: 2px solid #e67e22; 
        border-radius: 8px; 
        font-family: sans-serif;
        font-size: 11px; 
        width: 200px; 
        user-select: none; 
        display: block;
        box-shadow: 0 4px 15px rgba(0,0,0,0.8);
    `;
    document.body.appendChild(teamUi);

    // 2. Struktura wewnętrzna
    teamUi.innerHTML = `
        <div style="display:flex; justify-content:space-between; margin-bottom:5px; border-bottom:1px solid #444; padding-bottom:2px;">
            <b style="color:#e67e22; font-size:10px;">DRUŻYNA</b>
            <button id="team-res-btn" style="background:#e74c3c; color:white; border:none; border-radius:2px; font-size:9px; padding:0 4px; cursor:pointer;">X</button>
        </div>
        <div id="team-messages-container" style="max-height: 200px; overflow: hidden; display: flex; flex-direction: column-reverse;">
            <div id="team-placeholder" style="color:#666; font-size:9px; text-align:center; padding:5px;">Oczekiwanie na wiadomości...</div>
        </div>
    `;

    const msgContainer = teamUi.querySelector('#team-messages-container');

    // --- PRZECIĄGANIE (Z zapamiętywaniem pozycji) ---
    let isDragging = false, ox, oy;
    teamUi.onmousedown = (e) => {
        if(e.target.tagName !== 'BUTTON'){
            isDragging = true;
            ox = e.clientX - teamUi.getBoundingClientRect().left;
            oy = e.clientY - teamUi.getBoundingClientRect().top;
        }
    };

    document.addEventListener('mousemove', (e) => {
        if(isDragging){
            teamUi.style.left = (e.clientX - ox) + 'px';
            teamUi.style.top = (e.clientY - oy) + 'px';
        }
    });

    document.addEventListener('mouseup', () => {
        if(isDragging){
            isDragging = false;
            localStorage.setItem('mfo3_team_pos', JSON.stringify({
                top: teamUi.style.top, 
                left: teamUi.style.left
            }));
        }
    });

    // Przycisk X (czyści wiadomości)
    teamUi.querySelector('#team-res-btn').onclick = () => {
        msgContainer.innerHTML = '<div style="color:#666; font-size:9px; text-align:center; padding:5px;">Wyczyszczono.</div>';
    };

    // --- FUNKCJA DODAWANIA WIADOMOŚCI ---
    function addTeamMessage(nick, text) {
        const placeholder = document.getElementById('team-placeholder');
        if(placeholder) placeholder.remove();

        const msgRow = document.createElement('div');
        msgRow.style.cssText = "margin-bottom: 4px; border-bottom: 1px solid #222; padding-bottom: 2px;";

        msgRow.innerHTML = `
            <b style="color:#f1c40f; font-size:10px;">${nick}:</b>
            <span style="color:#fff; font-size:10px;">${text}</span>
        `;

        msgContainer.prepend(msgRow);

        if (msgContainer.children.length > 10) {
            msgContainer.lastChild.remove();
        }
    }

    // --- OBSERWATOR ---
    const observer = new MutationObserver((mutations) => {
        mutations.forEach(mutation => {
            mutation.addedNodes.forEach(node => {
                if (node.nodeType === 1 && node.classList.contains('log-item')) {
                    const channel = node.closest('.GameChannel');
                    if (channel && (channel.id.endsWith('_tabs_2') || channel.classList.contains('PrivateChatChannel'))) {
                        const nick = node.querySelector('.profile')?.innerText || "Gracz";
                        const text = node.querySelector('.text')?.innerText || "";
                        if (text) addTeamMessage(nick, text);
                    }
                }
            });
        });
    });

    observer.observe(document.body, { childList: true, subtree: true });

})();
