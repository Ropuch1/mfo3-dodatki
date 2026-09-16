(function() {
    'use strict';

    let targetNames = JSON.parse(localStorage.getItem('mfo_target_names')) || ['nasiono górskiej trawy', 'nasiono dziekiego grochu'];
    const loggedEvents = new Set();

    // 1. Tworzenie rozszerzonego okienka (GUI)
    const gui = document.createElement('div');
    gui.id = 'egg-tracker-gui';
    gui.innerHTML = `
        <div id="egg-tracker-header" style="cursor: move; background: #222; padding: 6px 10px; font-weight: bold; border-bottom: 1px solid #444; display: flex; justify-content: space-between; align-items: center; border-top-left-radius: 6px; border-top-right-radius: 6px;">
            <span style="color: #4da6ff;">🧭 Wykrywacz Obiektów</span>
            <span style="font-size: 9px; color: #888;">Przesuń</span>
        </div>
        <div style="padding: 10px; font-size: 11px; font-family: sans-serif;">
            <!-- Dodawanie nowego elementu -->
            <div style="display: flex; gap: 4px; margin-bottom: 8px;">
                <input type="text" id="mfo-new-input" placeholder="Wpisz nazwę..." style="flex: 1; background: #111; border: 1px solid #555; color: #fff; padding: 3px 6px; border-radius: 3px; font-size: 11px;">
                <button id="mfo-add-btn" style="background: #28a745; color: white; border: none; padding: 3px 8px; border-radius: 3px; cursor: pointer; font-weight: bold;">Dodaj</button>
            </div>
            
            <!-- Lista szukanych haseł -->
            <div style="margin-bottom: 8px; max-height: 60px; overflow-y: auto;" id="mfo-targets-list"></div>
            
            <hr style="border: 0; border-top: 1px solid #444; margin: 6px 0;">
            
            <!-- Status / Wyniki -->
            <div id="egg-tracker-content" style="font-family: monospace; max-height: 120px; overflow-y: auto;">
                <span style="color: #aaa;">Szukam obiektów...</span>
            </div>

            <hr style="border: 0; border-top: 1px solid #444; margin: 6px 0;">
            
            <!-- Przycisk powrotu do postaci -->
            <button id="mfo-center-hero-btn" style="width: 100%; background: #007bff; color: white; border: none; padding: 5px; border-radius: 3px; cursor: pointer; font-weight: bold; font-size: 11px;">👤 Powrót do postaci</button>
        </div>
    `;

    Object.assign(gui.style, {
        position: 'fixed',
        top: '100px',
        left: '20px',
        width: '240px',
        background: 'rgba(18, 18, 18, 0.95)',
        color: '#fff',
        borderRadius: '6px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.6)',
        zIndex: '9999999',
        userSelect: 'none',
        border: '1px solid #444'
    });

    document.body.appendChild(gui);

    // Mechanizm przeciągania okienka (Drag & Drop)
    let isDragging = false, offsetLeft = 0, offsetTop = 0;
    const header = document.getElementById('egg-tracker-header');

    header.addEventListener('mousedown', (e) => {
        isDragging = true;
        offsetLeft = e.clientX - gui.offsetLeft;
        offsetTop = e.clientY - gui.offsetTop;
    });

    document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        gui.style.left = `${e.clientX - offsetLeft}px`;
        gui.style.top = `${e.clientY - offsetTop}px`;
    });

    document.addEventListener('mouseup', () => { isDragging = false; });

    // Odświeżanie listy szukanych słów w GUI
    function renderTargetsList() {
        const container = document.getElementById('mfo-targets-list');
        container.innerHTML = '';
        targetNames.forEach((name, index) => {
            const tag = document.createElement('div');
            tag.style.cssText = 'display: flex; justify-content: space-between; align-items: center; background: #2a2a2a; margin-bottom: 2px; padding: 2px 5px; border-radius: 3px; font-size: 10px;';
            tag.innerHTML = `<span style="color: #ffcc00; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 170px;" title="${name}">${name}</span> <span style="color: #ff4d4d; cursor: pointer; font-weight: bold;" data-index="${index}">[×]</span>`;
            
            tag.querySelector('span:last-child').addEventListener('click', (e) => {
                const idx = e.target.getAttribute('data-index');
                targetNames.splice(idx, 1);
                localStorage.setItem('mfo_target_names', JSON.stringify(targetNames));
                renderTargetsList();
            });
            container.appendChild(tag);
        });
    }
    renderTargetsList();

    // Dodawanie nowego elementu
    document.getElementById('mfo-add-btn').addEventListener('click', () => {
        const input = document.getElementById('mfo-new-input');
        const val = input.value.trim().toLowerCase();
        if (val && !targetNames.includes(val)) {
            targetNames.push(val);
            localStorage.setItem('mfo_target_names', JSON.stringify(targetNames));
            input.value = '';
            renderTargetsList();
        }
    });

    // Powrót do postaci
    document.getElementById('mfo-center-hero-btn').addEventListener('click', () => {
        let heroEl = null;

        if (typeof MapEngine !== 'undefined' && MapEngine.instance) {
            const players = MapEngine.instance.players || (MapEngine.instance.Player ? MapEngine.instance.Player : null);
            if (players) {
                for (let id in players) {
                    const p = players[id];
                    if (p && (p.handle || p.id)) {
                        if (p.handle && p.handle.id) {
                            heroEl = document.getElementById(p.handle.id);
                        } else if (p.id) {
                            heroEl = document.getElementById(`player_${p.id}_dom`);
                        }
                        if (heroEl) break;
                    }
                }
            }
        }

        if (!heroEl) {
            heroEl = document.querySelector('[id^="player_"][id$="_dom"]');
        }

        if (heroEl) {
            heroEl.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
        } else {
            console.log('%c[Wykrywacz] Nie udało się namierzyć elementu postaci.', 'color: #ff4d4d;');
        }
    });

    // 2. Główna pętla sprawdzająca obiekty
    function updateTracker() {
        if (typeof MapEngine === 'undefined' || !MapEngine.instance || !MapEngine.instance.objects) {
            return;
        }

        const objects = MapEngine.instance.objects;
        let foundItemsHTML = '';
        let foundAny = false;

        for (let key in objects) {
            const obj = objects[key];
            if (!obj) continue;

            const name = (obj.name || (obj.event && obj.event.title) || '').toLowerCase();
            const matchedTarget = targetNames.find(target => name.includes(target));

            if (matchedTarget) {
                foundAny = true;

                let posX = 'b/d', posY = 'b/d';
                if (obj.event && obj.event.position) {
                    posX = obj.event.position.x;
                    posY = obj.event.position.y;
                } else if (obj.x !== undefined && obj.y !== undefined) {
                    posX = obj.x;
                    posY = obj.y;
                }

                foundItemsHTML += `
                    <div style="background: #1e1e1e; border-left: 3px solid #00ff00; padding: 4px; margin-bottom: 4px; border-radius: 2px;">
                        <div style="color: #00ff00; font-weight: bold; font-size: 10px;">${name}</div>
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 2px;">
                            <span>X:${posX} Y:${posY}</span>
                            <button class="mfo-show-btn" data-key="${key}" style="background: #17a2b8; color: white; border: none; padding: 1px 5px; border-radius: 2px; cursor: pointer; font-size: 9px;">Pokaż</button>
                        </div>
                    </div>
                `;

                if (!loggedEvents.has(key)) {
                    console.log(`%c[Znaleziono] ${name} | ID: ${key} | X: ${posX}, Y: ${posY}`, 'color: #00ff00; font-weight: bold;');
                    loggedEvents.add(key);
                }

                let targetEl = obj.dom_id ? document.getElementById(obj.dom_id) : (obj.sprite ? obj.sprite.element : null);

                if (targetEl) {
                    let borderOverlay = document.getElementById(`overlay-border-${key}`);
                    if (!borderOverlay) {
                        borderOverlay = document.createElement('div');
                        borderOverlay.id = `overlay-border-${key}`;
                        Object.assign(borderOverlay.style, {
                            position: 'absolute',
                            top: '0',
                            left: '0',
                            width: '100%',
                            height: '100%',
                            border: '2px solid #ff0000',
                            pointerEvents: 'none',
                            zIndex: '999999',
                            boxSizing: 'border-box'
                        });
                        
                        if (getComputedStyle(targetEl).position === 'static') {
                            targetEl.style.position = 'relative';
                        }
                        targetEl.appendChild(borderOverlay);
                    }
                }
            }
        }

        const contentDiv = document.getElementById('egg-tracker-content');
        if (foundAny) {
            contentDiv.innerHTML = foundItemsHTML;
            gui.style.borderColor = '#00ff00';

            document.querySelectorAll('.mfo-show-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const key = e.target.getAttribute('data-key');
                    const obj = objects[key];
                    if (obj) {
                        let targetEl = obj.dom_id ? document.getElementById(obj.dom_id) : (obj.sprite ? obj.sprite.element : null);
                        if (targetEl) {
                            targetEl.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
                        }
                    }
                });
            });

        } else {
            contentDiv.innerHTML = `<span style="color: #888;">Brak obiektów na mapie...</span>`;
            gui.style.borderColor = '#444';
        }
    }

    setInterval(updateTracker, 300);
})();
