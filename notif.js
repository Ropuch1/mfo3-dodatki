(function() {
    'use strict';

    // Wczytywanie ustawień z obsługą starszych wersji
    const savedSettings = JSON.parse(localStorage.getItem('mfo3_loot_settings')) || {};
    const settings = { 
        top: savedSettings.top || "100px", 
        left: savedSettings.left || "10px", 
        minimized: savedSettings.minimized || false,
        glowColor: savedSettings.glowColor || "#ffd700", 
        textColor: savedSettings.textColor || "#00ff00",
        confettiEnabled: savedSettings.confettiEnabled !== false, 
        massiveConfetti: savedSettings.massiveConfetti || false,  
        showJackpotText: savedSettings.showJackpotText !== false, 
        soundUrl: savedSettings.soundUrl || "" 
    };
    
    const saveSettings = () => localStorage.setItem('mfo3_loot_settings', JSON.stringify(settings));

    // Ładowanie biblioteki dla "Więcej konfetti" (Canvas Confetti)
    function loadConfettiLib() {
        if (document.getElementById('canvas-confetti-lib')) return;
        const script = document.createElement('script');
        script.id = 'canvas-confetti-lib';
        script.src = 'https://cdn.jsdelivr.net/npm/canvas-confetti@1.9.3/dist/confetti.browser.min.js';
        document.head.appendChild(script);
    }
    
    if (settings.massiveConfetti) {
        loadConfettiLib();
    }

    // Wstrzyknięcie stylów dynamicznych
    const styleEl = document.createElement('style');
    styleEl.id = 'mfo-loot-styles';
    styleEl.innerHTML = `
        @keyframes mfoFade { 0%{opacity:0; margin-top:-20px} 10%{opacity:1; margin-top:0} 90%{opacity:1} 100%{opacity:0; margin-top:-40px} }
        .mfo-loot-jackpot-glow {
            outline: 5px solid ${settings.glowColor} !important;
            box-shadow: 0 0 50px 20px ${settings.glowColor}b3 !important;
        }
        .upgrade-result {
            transition: none !important;
            animation: none !important;
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
        box-shadow: 0 4px 15px rgba(0,0,0,0.7); min-width: 170px;
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
    function triggerMassiveConfetti() {
        if (typeof confetti !== 'function') return;
        const duration = 5 * 1000;
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 10000 };

        function randomInRange(min, max) { return Math.random() * (max - min) + min; }

        const interval = setInterval(function() {
            const timeLeft = animationEnd - Date.now();
            if (timeLeft <= 0) return clearInterval(interval);
            const particleCount = 80 * (timeLeft / duration);
            
            confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } }));
            confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } }));
        }, 200);

        setTimeout(() => { confetti({ particleCount: 400, spread: 160, origin: { y: 0.6 } }); }, 1000);
    }

    const launchConfetti = () => {
        // Zwykłe konfetti emoji
        if (settings.confettiEnabled && document.body) {
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
        }
        

        if (settings.massiveConfetti) {
            if (typeof confetti === 'function') {
                triggerMassiveConfetti();
            } else {
                loadConfettiLib();
                setTimeout(triggerMassiveConfetti, 500);
            }
        }
    };

    const showJackpotText = (name) => {
        if (!settings.showJackpotText) return; 

        if (!document.body) return;
        const old = document.getElementById('mfo-jackpot-text');
        if (old) old.remove();
        
        const div = document.createElement('div');
        div.id = 'mfo-jackpot-text';
        
        div.innerHTML = `${name}`;
        div.style.cssText = `position:fixed; top:35%; left:50%; transform:translate(-50%, -50%); z-index: 10005; color:${settings.glowColor}; font-weight:bold; font-size:42px; text-align:center; text-shadow:0 0 20px #000, 0 0 10px ${settings.glowColor}; pointer-events:none; animation: mfoFade 4s forwards;`;
        setTimeout(() => { if(div.parentElement) div.remove(); }, 4100);
        
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
                .upgrade-result {
                    transition: none !important;
                    animation: none !important;
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
                            <input type="checkbox" id="c-confetti" ${settings.confettiEnabled ? 'checked' : ''}> Zwykłe konfetti
                        </label>
                    </div>
                    <div style="margin-bottom:6px;">
                        <label style="cursor:pointer; display:flex; align-items:center; gap:5px; color:#3498db;">
                            <input type="checkbox" id="c-massive-confetti" ${settings.massiveConfetti ? 'checked' : ''}> Więcej konfetti
                        </label>
                    </div>
                    <div style="margin-bottom:6px;">
                        <label style="cursor:pointer; display:flex; align-items:center; gap:5px; color:#9b59b6;">
                            <input type="checkbox" id="c-jackpot-text" ${settings.showJackpotText ? 'checked' : ''}> Pokazuj napis na środku
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
        display.querySelector('#c-massive-confetti').onchange = (e) => { 
            settings.massiveConfetti = e.target.checked; 
            saveSettings(); 
            if (settings.massiveConfetti) loadConfettiLib(); 
        };
        display.querySelector('#c-jackpot-text').onchange = (e) => { settings.showJackpotText = e.target.checked; saveSettings(); };
        
        display.querySelector('#c-sound').onchange = (e) => { settings.soundUrl = e.target.value.trim(); saveSettings(); };
        
        display.querySelector('#test-sound').onclick = () => {
            playLootSound();
            launchConfetti();
            showJackpotText("★ Testowy Przedmiot +8");
        };

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

    let activeGlows = [];

    function scan() {
        activeGlows = activeGlows.filter(item => {
            if (!document.body.contains(item.report)) {
                if (item.target) {
                    item.target.classList.remove('mfo-loot-jackpot-glow');
                }
                return false;
            }
            return true;
        });

        // 1. SKANOWANIE RAPORTÓW Z WALK
        const results = document.querySelectorAll('.BattleResultsDialog');
        results.forEach(res => {
            if (res.getAttribute('data-notified-once') === 'true') return;

            const parent = res.closest('.WUI_Dialog') || res.closest('.LayoutBox2');
            const target = parent ? (parent.querySelector('.dialog-container') || parent) : null;

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
                    activeGlows.push({ report: res, target: target });
                }
            } else {
                res.setAttribute('data-notified-once', 'true');
            }
        });

        // 2. SKANOWANIE KOWALA / CRAFTINGU
        const crafts = document.querySelectorAll('.upgrade-result');
        crafts.forEach(res => {
            if (res.getAttribute('data-notified-once') === 'true') return;

            const itemNameElement = res.querySelector('.armor_name a.link');
            if (!itemNameElement) return;

            const itemName = itemNameElement.textContent.trim();
            
            if (itemName.includes('+8')) {
                res.setAttribute('data-notified-once', 'true');
                
                playLootSound();
                launchConfetti();
                showJackpotText(itemName);

                const parent = res.closest('.WUI_Dialog') || res.closest('.LayoutBox2');
                const target = parent ? (parent.querySelector('.dialog-container') || parent) : res;

                if (target) {
                    target.classList.add('mfo-loot-jackpot-glow');
                    activeGlows.push({ report: res, target: target });
                }

                itemNameElement.style.color = settings.textColor;
                itemNameElement.style.fontWeight = "bold";
                if (!itemNameElement.innerHTML.includes('★')) itemNameElement.innerHTML = "★ " + itemNameElement.innerHTML;

            } else {
                res.setAttribute('data-notified-once', 'true');
            }
        });
    }

    initUI();
    setInterval(scan, 300);
})();
