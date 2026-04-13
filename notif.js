(function() {
    'use strict';

    const settings = JSON.parse(localStorage.getItem('mfo3_loot_settings')) || { 
        top: "100px", left: "10px", minimized: false,
        glowColor: "#ffd700", textColor: "#00ff00",
        confettiEnabled: true,
        soundUrl: "" // Nowe ustawienie
    };
    
    const saveSettings = () => localStorage.setItem('mfo3_loot_settings', JSON.stringify(settings));

    const display = document.createElement('div');
    display.id = "mfo3-loot-monitor";
    display.style.cssText = `
        position: fixed; top: ${settings.top}; left: ${settings.left}; z-index: 10000;
        background: rgba(10, 10, 10, 0.9); color: #f0f0f0;
        padding: 12px; border: 2px solid #e67e22; border-radius: 8px;
        font-family: sans-serif; font-size: 13px;
        box-shadow: 0 4px 15px rgba(0,0,0,0.7); min-width: 160px;
        cursor: default; user-select: none; box-sizing: border-box;
    `;
    document.body.appendChild(display);

    // --- FUNKCJA DŹWIĘKU (MAX 10 SEK) ---
    const playLootSound = () => {
        if (!settings.soundUrl || !settings.soundUrl.toLowerCase().endsWith('.mp4')) return;
        
        const audio = new Audio(settings.soundUrl);
        audio.play().catch(e => console.warn("Nie udało się odtworzyć dźwięku (brak interakcji?)"));
        
        // Timer bezpieczeństwa - wyłącza po 10s
        setTimeout(() => {
            audio.pause();
            audio.remove();
        }, 10000);
    };

    // --- DRAG LOGIC ---
    let isDragging = false, offsetX, offsetY;
    display.addEventListener('mousedown', (e) => {
        if (e.target.tagName === 'INPUT' || e.target.classList.contains('ctrl-btn')) return;
        isDragging = true;
        offsetX = e.clientX - display.getBoundingClientRect().left;
        offsetY = e.clientY - display.getBoundingClientRect().top;
    });
    document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        let x = Math.max(0, Math.min(e.clientX - offsetX, window.innerWidth - display.offsetWidth));
        let y = Math.max(0, Math.min(e.clientY - offsetY, window.innerHeight - display.offsetHeight));
        settings.left = x + 'px'; settings.top = y + 'px';
        display.style.left = settings.left; display.style.top = settings.top;
    });
    document.addEventListener('mouseup', () => { if (isDragging) { isDragging = false; saveSettings(); } });

    // --- EFEKTY ---
    const launchConfetti = () => {
        if (!settings.confettiEnabled) return;
        for (let i = 0; i < 25; i++) {
            const c = document.createElement('div');
            c.innerText = ['🎉', '✨', '⭐', '💰'][Math.floor(Math.random() * 4)];
            c.style.cssText = `position:fixed; left:${Math.random()*100}vw; top:-5vh; z-index:10001; font-size:25px; pointer-events:none; transition: transform ${Math.random()*2+2}s linear, opacity 2s;`;
            document.body.appendChild(c);
            setTimeout(() => {
                c.style.transform = `translate(${(Math.random()-0.5)*200}px, 110vh) rotate(${Math.random()*360}deg)`;
                c.style.opacity = '0';
            }, 50);
            setTimeout(() => c.remove(), 4000);
        }
    };

    const showJackpotText = (name) => {
        if (!settings.confettiEnabled) return;
        const old = document.getElementById('mfo-jackpot-text');
        if (old) old.remove();
        const div = document.createElement('div');
        div.id = 'mfo-jackpot-text';
        div.innerHTML = `<div style="font-size:16px; opacity:0.8;">JACKPOT!</div>${name}`;
        div.style.cssText = `position:fixed; top:35%; left:50%; transform:translate(-50%, -50%); z-index: 10005; color:${settings.glowColor}; font-weight:bold; font-size:42px; text-align:center; text-shadow:0 0 20px #000, 0 0 10px ${settings.glowColor}; pointer-events:none; animation: mfoFade 4s forwards;`;
        if (!document.getElementById('mfo-anim-style')) {
            const s = document.createElement('style'); s.id = 'mfo-anim-style';
            s.innerHTML = `@keyframes mfoFade { 0%{opacity:0; margin-top:-20px} 15%{opacity:1; margin-top:0} 85%{opacity:1} 100%{opacity:0; margin-top:-40px} }`;
            document.head.appendChild(s);
        }
        document.body.appendChild(div);
        setTimeout(() => div.remove(), 4100);
    };

    function initUI() {
        display.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #444; padding-bottom: 4px; margin-bottom: 8px;">
                <b style="color: #f1c40f;">💎 Loot Monitor</b>
                <div style="display: flex; gap: 8px;">
                    <span id="l-min" class="ctrl-btn" style="cursor:pointer; font-weight:bold; color: #f1c40f;">${settings.minimized ? '▢' : '_'}</span>
                    <span id="l-close" class="ctrl-btn" style="cursor:pointer; color:#e74c3c; font-weight:bold;">&times;</span>
                </div>
            </div>
            <div id="loot-content-wrapper" style="display: ${settings.minimized ? 'none' : 'block'};">
                <div style="font-size:11px;">
                    <div style="margin-bottom:6px;">
                        <label style="cursor:pointer; display:flex; align-items:center; gap:5px; color:#2ecc71;">
                            <input type="checkbox" id="c-confetti" ${settings.confettiEnabled ? 'checked' : ''}> Konfeti & Napis
                        </label>
                    </div>
                    <div style="margin-bottom:6px;">
                        Link MP4 (10s):<br>
                        <input type="text" id="c-sound" value="${settings.soundUrl}" placeholder="http://...plik.mp4" style="width:100%; background:#222; border:1px solid #e67e22; color:white; font-size:10px; margin-top:2px; padding:2px;">
                    </div>
                    <div style="margin-bottom:4px;">Ramka: <input type="color" id="c-glow" value="${settings.glowColor}" style="width:25px; height:15px; border:none; background:none; cursor:pointer; vertical-align:middle;"></div>
                    <div>Tekst: <input type="color" id="c-text" value="${settings.textColor}" style="width:25px; height:15px; border:none; background:none; cursor:pointer; vertical-align:middle;"></div>
                </div>
            </div>`;

        display.querySelector('#c-confetti').onchange = (e) => { settings.confettiEnabled = e.target.checked; saveSettings(); };
        display.querySelector('#c-sound').onchange = (e) => { 
            const val = e.target.value.trim();
            if (val === "" || val.toLowerCase().endsWith('.mp4')) {
                settings.soundUrl = val; 
                saveSettings(); 
            } else {
                alert("Tylko format .mp4!");
                e.target.value = settings.soundUrl;
            }
        };
        display.querySelector('#c-glow').oninput = (e) => { settings.glowColor = e.target.value; saveSettings(); };
        display.querySelector('#c-text').oninput = (e) => { settings.textColor = e.target.value; saveSettings(); };
        display.querySelector('#l-min').onclick = () => {
            settings.minimized = !settings.minimized;
            display.querySelector('#loot-content-wrapper').style.display = settings.minimized ? 'none' : 'block';
            display.querySelector('#l-min').innerText = settings.minimized ? '▢' : '_';
            saveSettings();
        };
        display.querySelector('#l-close').onclick = () => display.remove();
    }

    function scan() {
        const results = document.querySelectorAll('.BattleResultsDialog');
        results.forEach(res => {
            if (res.getAttribute('data-notified-once') === 'true') return;

            const items = res.querySelectorAll('.WUI_CatalogItem');
            let luckyItemsNames = [];

            items.forEach(item => {
                const nameEl = item.querySelector('.name');
                const animEl = item.querySelector('.Animator');
                const bgStyle = animEl?.style.background || "";
                
                const isCard = bgStyle.includes('Misc.png') && bgStyle.includes('-24px');
                const isHigh = nameEl?.innerText.match(/\+(\d+)/) && parseInt(nameEl.innerText.match(/\+(\d+)/)[1]) >= 5;

                if (isCard || isHigh) {
                    luckyItemsNames.push(nameEl.innerText);
                    nameEl.style.color = settings.textColor;
                    nameEl.style.fontWeight = "bold";
                    if (!nameEl.innerHTML.includes('★')) nameEl.innerHTML = "★ " + nameEl.innerHTML;
                }
            });

            if (luckyItemsNames.length > 0) {
                res.setAttribute('data-notified-once', 'true');
                
                launchConfetti(); 
                showJackpotText(luckyItemsNames[0]);
                playLootSound(); // Odpala dźwięk

                const parent = res.closest('.WUI_Dialog') || res.closest('.LayoutBox2');
                if (parent) {
                    const target = parent.querySelector('.dialog-container') || parent;
                    target.style.boxShadow = `0 0 50px 20px ${settings.glowColor}b3`;
                    target.style.outline = `5px solid ${settings.glowColor}`;
                }
            }
        });
    }

    initUI();
    setInterval(scan, 500);
})();
