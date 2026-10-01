(function() {
    'use strict';

    if (window.__mfoEggTrackerLoaded) return;
    window.__mfoEggTrackerLoaded = true;

    // Funkcja pomocnicza do poruszania postacią po mapie (poprawiona pod MFO3 - kliknięcie w zasięgu widoku)
    function walkToCoords(targetX, targetY) {
        const me = window.MapEngine ? window.MapEngine.instance : null;
        if (!me || !me.mapClickHandler) {
            console.error('[MFO3] Brak MapEngine lub mapClickHandler!');
            return;
        }

        const gameLayout = typeof $=== 'function' ?$('GameLayout') : document.getElementById('GameLayout');
        const b = me.container.getPosition ? me.container.getPosition(gameLayout) : { x: 0, y: 0 };
        const tileSizeX = me.options.tile_size.x;
        const tileSizeY = me.options.tile_size.y;
        const scrollLeft = me.container.scrollLeft || 0;
        const scrollTop = me.container.scrollTop || 0;

        const pageX = b.x - scrollLeft + (targetX * tileSizeX) + (tileSizeX / 2);
        const pageY = b.y - scrollTop + (targetY * tileSizeY) + (tileSizeY / 2);

        const fakeEvent = {
            stop: function() {},
            type: 'click',
            control: false,
            page: { x: pageX, y: pageY }
        };

        console.log(`[Wykrywacz] Idę do kafelka: (${targetX}, ${targetY})`);
        me.mapClickHandler(fakeEvent);
    }

    function initEggTracker() {
        if (document.getElementById('egg-tracker-gui')) return;

        let targetNames = JSON.parse(localStorage.getItem('mfo_target_names')) || ['nasiono górskiej trawy', 'nasiono dzikiego grochu'];
        let blacklistedIds = JSON.parse(localStorage.getItem('mfo_blacklisted_ids')) || [];
        
        let isCollapsed = JSON.parse(localStorage.getItem('mfo_gui_collapsed')) || false;
        let isClosed = JSON.parse(localStorage.getItem('mfo_gui_closed')) || false;
        let savedPos = JSON.parse(localStorage.getItem('mfo_gui_position')) || { top: '100px', left: '20px' };

        const loggedEvents = new Set();

        const gui = document.createElement('div');
        gui.id = 'egg-tracker-gui';
        gui.innerHTML = `
            <div id="egg-tracker-header" style="cursor: move; background: #222; padding: 6px 10px; font-weight: bold; border-bottom: 1px solid #444; display: flex; justify-content: space-between; align-items: center; border-top-left-radius: 6px; border-top-right-radius: 6px;">
                <span style="color: #4da6ff; pointer-events: none;">😭Brak jajka cię dobija?😭</span>
                <div style="display: flex; gap: 6px; align-items: center;">
                    <span id="mfo-settings-btn" style="cursor: pointer; font-size: 13px;" title="Zarządzaj czarną listą">⚙️</span>
                    <span id="mfo-toggle-btn" style="cursor: pointer; font-size: 13px; font-weight: bold; user-select: none; width: 14px; text-align: center;" title="Zwiń / Rozwiń">${isCollapsed ? '➕' : '—'}</span>
                    <span id="mfo-close-btn" style="cursor: pointer; font-size: 13px; font-weight: bold; color: #ff4d4d; user-select: none; width: 14px; text-align: center;" title="Zamknij dodatek">✕</span>
                </div>
            </div>
            
            <div id="mfo-body-container" style="display: ${isCollapsed ? 'none' : 'block'};">
                <!-- WIDOK GŁÓWNY -->
                <div id="mfo-main-view" style="padding: 10px; font-size: 11px; font-family: sans-serif;">
                    <div style="display: flex; gap: 4px; margin-bottom: 8px;">
                        <input type="text" id="mfo-new-input" placeholder="Wpisz nazwę..." style="flex: 1; background: #111; border: 1px solid #555; color: #fff; padding: 3px 6px; border-radius: 3px; font-size: 11px;">
                        <button id="mfo-add-btn" style="background: #28a745; color: white; border: none; padding: 3px 8px; border-radius: 3px; cursor: pointer; font-weight: bold;">Dodaj</button>
                    </div>
                    
                    <div style="margin-bottom: 8px; max-height: 60px; overflow-y: auto;" id="mfo-targets-list"></div>
                    
                    <hr style="border: 0; border-top: 1px solid #444; margin: 6px 0;">
                    
                    <div id="egg-tracker-content" style="font-family: monospace; max-height: 140px; overflow-y: auto;">
                        <span style="color: #aaa;">Szukam obiektów...</span>
                    </div>

                    <hr style="border: 0; border-top: 1px solid #444; margin: 6px 0;">
                    
                    <button id="mfo-center-hero-btn" style="width: 100%; background: #007bff; color: white; border: none; padding: 5px; border-radius: 3px; cursor: pointer; font-weight: bold; font-size: 11px;">👤 Powrót do postaci</button>
                </div>

                <!-- WIDOK USTAWIEŃ / CZARNEJ LISTY -->
                <div id="mfo-settings-view" style="display: none; padding: 10px; font-size: 11px; font-family: sans-serif;">
                    <div style="color: #ffcc00; font-weight: bold; margin-bottom: 5px;">🚫 Zablokowane obiekty:</div>
                    <div id="mfo-blacklist-content" style="max-height: 160px; overflow-y: auto; font-family: monospace; margin-bottom: 8px;">
                        <span style="color: #888;">Brak zablokowanych obiektów.</span>
                    </div>
                    <button id="mfo-back-btn" style="width: 100%; background: #555; color: white; border: none; padding: 5px; border-radius: 3px; cursor: pointer; font-weight: bold; font-size: 11px;">⬅ Powrót do wykrywacza</button>
                </div>
            </div>
        `;

        Object.assign(gui.style, {
            position: 'fixed',
            top: savedPos.top,
            left: savedPos.left,
            width: '260px',
            background: 'rgba(18, 18, 18, 0.95)',
            color: '#fff',
            borderRadius: '6px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.6)',
            zIndex: '9999999',
            userSelect: 'none',
            border: '1px solid #444',
            display: isClosed ? 'none' : 'block'
        });

        document.body.appendChild(gui);

        const mainView = document.getElementById('mfo-main-view');
        const settingsView = document.getElementById('mfo-settings-view');
        const bodyContainer = document.getElementById('mfo-body-container');
        const toggleBtn = document.getElementById('mfo-toggle-btn');
        const closeBtn = document.getElementById('mfo-close-btn');

        toggleBtn.addEventListener('click', () => {
            isCollapsed = !isCollapsed;
            bodyContainer.style.display = isCollapsed ? 'none' : 'block';
            toggleBtn.textContent = isCollapsed ? '➕' : '—';
            localStorage.setItem('mfo_gui_collapsed', JSON.stringify(isCollapsed));
        });

        closeBtn.addEventListener('click', () => {
            gui.style.display = 'none';
            localStorage.setItem('mfo_gui_closed', JSON.stringify(true));
        });

        document.getElementById('mfo-settings-btn').addEventListener('click', () => {
            mainView.style.display = 'none';
            settingsView.style.display = 'block';
            renderBlacklistPanel();
        });

        document.getElementById('mfo-back-btn').addEventListener('click', () => {
            settingsView.style.display = 'none';
            mainView.style.display = 'block';
        });

        let isDragging = false, offsetLeft = 0, offsetTop = 0;
        const header = document.getElementById('egg-tracker-header');

        header.addEventListener('mousedown', (e) => {
            if (e.target.closest('#mfo-settings-btn, #mfo-toggle-btn, #mfo-close-btn')) return;
            
            e.preventDefault();
            isDragging = true;
            offsetLeft = e.clientX - gui.offsetLeft;
            offsetTop = e.clientY - gui.offsetTop;
        });

        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            gui.style.left = `${e.clientX - offsetLeft}px`;
            gui.style.top = `${e.clientY - offsetTop}px`;
        });

        document.addEventListener('mouseup', () => {
            if (isDragging) {
                isDragging = false;
                localStorage.setItem('mfo_gui_position', JSON.stringify({
                    top: gui.style.top,
                    left: gui.style.left
                }));
            }
        });

        function renderTargetsList() {
            const container = document.getElementById('mfo-targets-list');
            container.innerHTML = '';
            targetNames.forEach((name, index) => {
                const tag = document.createElement('div');
                tag.style.cssText = 'display: flex; justify-content: space-between; align-items: center; background: #2a2a2a; margin-bottom: 2px; padding: 2px 5px; border-radius: 3px; font-size: 10px;';
                tag.innerHTML = `<span style="color: #ffcc00; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 180px;" title="${name}">${name}</span> <span style="color: #ff4d4d; cursor: pointer; font-weight: bold;" data-index="${index}">[×]</span>`;
                
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

        function renderBlacklistPanel() {
            const container = document.getElementById('mfo-blacklist-content');
            if (blacklistedIds.length === 0) {
                container.innerHTML = `<span style="color: #888;">Brak zablokowanych obiektów.</span>`;
                return;
            }

            let html = '';
            blacklistedIds.forEach((key) => {
                html += `
                    <div style="background: #2a1a1a; border-left: 3px solid #dc3545; padding: 4px; margin-bottom: 4px; border-radius: 2px; display: flex; justify-content: space-between; align-items: center;">
                        <div>
                            <div style="color: #ff6b6b; font-weight: bold; font-size: 10px;">ID: ${key}</div>
                        </div>
                        <button class="mfo-unban-btn" data-key="${key}" style="background: #28a745; color: white; border: none; padding: 2px 5px; border-radius: 2px; cursor: pointer; font-size: 9px;">Przywróć</button>
                    </div>
                `;
            });
            container.innerHTML = html;

            document.querySelectorAll('.mfo-unban-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const key = e.target.getAttribute('data-key');
                    blacklistedIds = blacklistedIds.filter(id => id !== key);
                    localStorage.setItem('mfo_blacklisted_ids', JSON.stringify(blacklistedIds));
                    renderBlacklistPanel();
                });
            });
        }

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

        function updateTracker() {
            if (gui.style.display === 'none') return;

            if (typeof MapEngine === 'undefined' || !MapEngine.instance || !MapEngine.instance.objects) {
                return;
            }

            const objects = MapEngine.instance.objects;
            let foundItemsHTML = '';
            let foundAny = false;

            document.querySelectorAll('[id^="overlay-border-"]').forEach(overlay => {
                const key = overlay.id.replace('overlay-border-', '');
                if (!objects[key]) {
                    overlay.remove();
                }
            });

            for (let key in objects) {
                const obj = objects[key];
                if (!obj) continue;

                if (blacklistedIds.includes(key)) continue;

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
                                <span style="font-size: 9px;">X:${posX} Y:${posY}</span>
                                <div style="display: flex; gap: 3px;">
                                    <button class="mfo-walk-btn" data-x="${posX}" data-y="${posY}" style="background: #28a745; color: white; border: none; padding: 1px 4px; border-radius: 2px; cursor: pointer; font-size: 9px; font-weight: bold;">Podejdź</button>
                                    <button class="mfo-ban-btn" data-key="${key}" style="background: #dc3545; color: white; border: none; padding: 1px 4px; border-radius: 2px; cursor: pointer; font-size: 9px;" title="Ukryj ten konkretny egzemplarz">Ukryj</button>
                                </div>
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
            if (contentDiv) {
                if (foundAny) {
                    contentDiv.innerHTML = foundItemsHTML;
                    gui.style.borderColor = '#00ff00';

                    document.querySelectorAll('.mfo-walk-btn').forEach(btn => {
                        btn.addEventListener('click', (e) => {
                            const x = parseInt(e.target.getAttribute('data-x'), 10);
                            const y = parseInt(e.target.getAttribute('data-y'), 10);
                            if (!isNaN(x) && !isNaN(y)) {
                                walkToCoords(x, y);
                            } else {
                                console.warn('[MFO3] Błędne współrzędne obiektu.');
                            }
                        });
                    });

                    document.querySelectorAll('.mfo-ban-btn').forEach(btn => {
                        btn.addEventListener('click', (e) => {
                            const key = e.target.getAttribute('data-key');
                            if (!blacklistedIds.includes(key)) {
                                blacklistedIds.push(key);
                                localStorage.setItem('mfo_blacklisted_ids', JSON.stringify(blacklistedIds));
                                
                                const borderOverlay = document.getElementById(`overlay-border-${key}`);
                                if (borderOverlay) borderOverlay.remove();

                                updateTracker();
                            }
                        });
                    });

                } else {
                    contentDiv.innerHTML = `<span style="color: #888;">Brak obiektów na mapie...</span>`;
                    gui.style.borderColor = '#444';
                }
            }
        }

        setInterval(updateTracker, 300);
    }

    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        initEggTracker();
    } else {
        document.addEventListener('DOMContentLoaded', initEggTracker);
        window.addEventListener('load', initEggTracker);
    }
})();
