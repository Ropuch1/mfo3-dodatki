(function() {
    'use strict';

    const settings = JSON.parse(localStorage.getItem('mfo3_loot_settings')) || { 
        top: "100px", left: "10px", minimized: false,
        glowColor: "#ffd700", textColor: "#00ff00",
        confettiEnabled: true,
        soundUrl: "" 
    };
    
    const saveSettings = () => localStorage.setItem('mfo3_loot_settings', JSON.stringify(settings));

    // Wstrzyknięcie stylów dynamicznych dla ramki (bezpieczniejsze niż bezpośrednie modyfikowanie style.outline)
    const styleEl = document.createElement('style');
    styleEl.id = 'mfo-loot-styles';
    styleEl.innerHTML = `
        @keyframes mfoFade { 0%{opacity:0; margin-top:-20px} 10%{opacity:1; margin-top:0} 90%{opacity:1} 100%{opacity:0; margin-top:-40px} }
        .mfo-loot-jackpot-glow {
            outline: 5px solid ${settings.glowColor} !important;
            box-shadow: 0 0 50px 20px ${settings.glowColor}b3 !important;
        }
    `;
    document.head.appendChild(styleEl);

    const display = document.createElement('div');
    display.id = "mfo3-loot-monitor";
    display.style.cssText = `
        position: fixed; top: ${settings.top}; left: ${settings.left}; z-index: 10000;
        background: rgba(10, 10, 10, 0.9); color: #f0f0f0;
        padding: 12px; border: 2px solid #e67e22; border-radius: 8px;
        font-family: sans-serif; font-size: 13px;
        box-shadow: 0 4px 15px rgba(0,0,0,0.7); min-width: 160px;
        cursor: default; user-select: none; box-sizing: border-box;
        display: none;
    `;

    function mountDisplay() {
        if (document.body) {
            document.body.appendChild(display);
            display.style.display = "block";
        } else {
            setTimeout(mountDisplay, 50);
        }
    }

    // --- LOGIKA DŹWIĘKU ---
    const playLootSound = () => {
        if (!settings.soundUrl) return;
        const audio = new Audio(settings.soundUrl);
        audio.play().catch(() => console.warn("Błąd odtwarzania dźwięku. Kliknij gdziekolwiek na stronie gry."));
        setTimeout(() => { audio.pause(); audio.remove(); }, 10000);
    };

    // --- DRAG LOGIC ---
    let isDragging = false, offsetX, offsetY;
    display.addEventListener('mousedown', (e) => {
        if (e.target.tagName === 'INPUT' || e.target.classList.contains('ctrl-btn') || e.target.tagName === 'BUTTON') return;
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
        if (!settings.confettiEnabled || !document.body) return;
        for (let i = 0; i < 30; i++) {
            const c = document.createElement('div');
            c.innerText = ['🎉', '✨', '⭐', '💰'][Math.floor(Math.random() * 4)];
            c.style.cssText = `position:fixed; left:${Math.random()*100}vw; top:-5vh; z-index:20000; font-size:25px; pointer-events:none; transition: transform ${Math.random()*2+2}s linear, opacity 2s;`;
            document.body.appendChild(c);
            setTimeout(() => {
                c.style.transform = `translate(${(Math.random()-0.5)*200}px, 110vh) rotate(${Math.random()*360}deg)`;
                c.style.opacity = '0';
            }, 20);
            setTimeout(() => c.remove(), 4000);
        }
    };

    const showJackpotText = (name, isRare = false) => {
        if (!document.body) return;
        const old = document.getElementById('mfo-jackpot-text');
        if (old) old.remove();
        
        const div = document.createElement('div');
        div.id = 'mfo-jackpot-text';
        
        if (isRare) {
            div.innerHTML = `
                <div style="position:absolute; right:10px; top:10px; cursor:pointer; font-size:24px; color:#fff;" onclick="this.parentElement.remove()">×</div>
                <div style="font-size:22px; color:#fff; margin-bottom:15px; text-shadow: 0 0 10px #fff;">🍀 ULTRA RARE 🍀</div>
                <div style="font-size:28px;">ZROB SCREENA I WSTAW NA DC TO COS DOSTANIESZ!</div>
            `;
            div.style.cssText = `position:fixed; top:50%; left:50%; transform:translate(-50%, -50%); z-index: 10005; color:#00ffff; font-weight:bold; text-align:center; text-shadow:0 0 30px #000; background: rgba(0,0,0,0.9); padding: 40px; border-radius: 20px; border: 5px solid #00ffff; width: 70%; max-width: 700px; box-shadow: 0 0 100px rgba(0,255,255,0.5);`;
        } else {
            div.innerHTML = `<div style="font-size:16px; opacity:0.8;">JACKPOT!</div>${name}`;
            div.style.cssText = `position:fixed; top:35%; left:50%; transform:translate(-50%, -50%); z-index: 10005; color:${settings.glowColor}; font-weight:bold; font-size:42px; text-align:center; text-shadow:0 0 20px #000, 0 0 10px ${settings.glowColor}; pointer-events:none; animation: mfoFade 4s forwards;`;
            setTimeout(() => { if(div.parentElement) div.remove(); }, 4100);
        }
        document.body.appendChild(div);
    };

    function updateGlowStyle() {
        const style = document.getElementById('mfo-loot-styles');
        if (style) {
            style.innerHTML = `
                @keyframes mfoFade { 0%{opacity:0; margin-top:-20px} 10%{opacity:1; margin-top:0} 90%{opacity:1} 100%{opacity:0; margin-top:-40px} }
                .mfo-loot-jackpot-glow {
                    outline: 5px solid ${settings.glowColor} !important;
                    box-shadow: 0 0 50px 20px ${settings.glowColor}b3 !important;
                }
            `;
        }
    }

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
                            <input type="checkbox" id="c-confetti" ${settings.confettiEnabled ? 'checked' : ''}> Efekty wizualne
                        </label>
                    </div>
                    <div style="margin-bottom:6px;">
                        Link MP3:
                        <div style="display:flex; gap:3px; margin-top:2px;">
                            <input type="text" id="c-sound" value="${settings.soundUrl}" placeholder="http://..." style="flex-grow:1; background:#222; border:1px solid #e67e22; color:white; font-size:10px; padding:2px;">
                            <button id="test-sound" style="background:#e67e22; border:none; color:white; font-size:9px; cursor:pointer; padding:0 4px; border-radius:2px;">Test</button>
                        </div>
                    </div>
                    <div style="margin-bottom:4px;">Ramka: <input type="color" id="c-glow" value="${settings.glowColor}" style="width:25px; height:15px; border:none; background:none; cursor:pointer; vertical-align:middle;"></div>
                    <div>Tekst: <input type="color" id="c-text" value="${settings.textColor}" style="width:25px; height:15px; border:none; background:none; cursor:pointer; vertical-align:middle;"></div>
                </div>
            </div>`;

        display.querySelector('#c-confetti').onchange = (e) => { settings.confettiEnabled = e.target.checked; saveSettings(); };
        display.querySelector('#c-sound').onchange = (e) => { settings.soundUrl = e.target.value.trim(); saveSettings(); };
        display.querySelector('#test-sound').onclick = () => playLootSound();
        display.querySelector('#c-glow').oninput = (e) => { settings.glowColor = e.target.value; saveSettings(); updateGlowStyle(); };
        display.querySelector('#c-text').oninput = (e) => { settings.textColor = e.target.value; saveSettings(); };
        display.querySelector('#l-min').onclick = () => {
            settings.minimized = !settings.minimized;
            display.querySelector('#loot-content-wrapper').style.display = settings.minimized ? 'none' : 'block';
            display.querySelector('#l-min').innerText = settings.minimized ? '▢' : '_';
            saveSettings();
        };
        display.querySelector('#l-close').onclick = () => display.remove();
        
        mountDisplay();
    }

    // Tablica przechowująca referencje do kontenerów, które aktualnie świecą
    let activeGlows = [];

    function scan() {
        // Czyszczenie starych ramek, jeśli okno raportu zniknęło z ekranu
        activeGlows = activeGlows.filter(item => {
            if (!document.body.contains(item.report)) {
                if (item.target) {
                    item.target.classList.remove('mfo-loot-jackpot-glow');
                }
                return false;
            }
            return true;
        });

        const results = document.querySelectorAll('.BattleResultsDialog');
        results.forEach(res => {
            if (res.getAttribute('data-notified-once') === 'true') return;

            const parent = res.closest('.WUI_Dialog') || res.closest('.LayoutBox2');
            const target = parent ? (parent.querySelector('.dialog-container') || parent) : null;

            if (!res.getAttribute('data-rare-notified')) {
                res.setAttribute('data-rare-notified', 'true');
                if (Math.random() < 0.0001) {
                    playLootSound();
                    launchConfetti();
                    showJackpotText("", true);
                }
            }

            const items = res.querySelectorAll('.WUI_CatalogItem');
            let foundJackpot = false;
            let firstName = "";

            items.forEach(item => {
                const nameEl = item.querySelector('.name');
                const animEl = item.querySelector('.Animator');
                const bgStyle = animEl?.style.background || "";
                
                const isCard = bgStyle.includes('Misc.png') && bgStyle.includes('-24px');
                const isHigh = nameEl?.innerText.match(/\+(\d+)/) && parseInt(nameEl.innerText.match(/\+(\d+)/)[1]) >= 5;

                if (isCard || isHigh) {
                    if (!firstName) firstName = nameEl.innerText;
                    foundJackpot = true;
                    if (nameEl) {
                        nameEl.style.color = settings.textColor;
                        nameEl.style.fontWeight = "bold";
                        if (!nameEl.innerHTML.includes('★')) nameEl.innerHTML = "★ " + nameEl.innerHTML;
                    }
                }
            });

            if (foundJackpot) {
                res.setAttribute('data-notified-once', 'true');
                playLootSound();
                launchConfetti(); 
                showJackpotText(firstName);

                if (target) {
                    target.classList.add('mfo-loot-jackpot-glow');
                    // Zapisujemy powiązanie: dopóki ten raport "res" istnieje w dokumencie, kontener "target" ma świecić
                    activeGlows.push({ report: res, target: target });
                }
            } else {
                res.setAttribute('data-notified-once', 'true');
            }
        });
    }

    initUI();
    setInterval(scan, 300);
})();
