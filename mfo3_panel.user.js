// ==UserScript==
// @name         MFO3 - Panel Ropucha
// @version      1.0
// @match        https://s1.mfo3.pl/game/
// @grant        GM_xmlhttpRequest
// @connect      raw.githubusercontent.com
// @run-at       document-start
// ==/UserScript==

(function() {
    'use strict';

    const REPO_URL = 'https://raw.githubusercontent.com/Ropuch1/mfo3-dodatki/main';
    let lastRenderedConfig = "";
    let currentLoadedConfig = null;

    window.ropuchInjectedScripts = window.ropuchInjectedScripts || {};

    let lokalneOpisy = {}, lokalneTagi = {}, githubMetadata = {}, modOrder = [];
    try { lokalneOpisy = JSON.parse(localStorage.getItem('ropuch_wlasne_opisy')) || {}; } catch(e) {}
    try { lokalneTagi = JSON.parse(localStorage.getItem('ropuch_wlasne_tagi')) || {}; } catch(e) {}
    try { githubMetadata = JSON.parse(localStorage.getItem('ropuch_cache_metadata')) || {}; } catch(e) {}
    try { modOrder = JSON.parse(localStorage.getItem('ropuch_mods_order')) || []; } catch(e) {}

    let currentAccentColor = localStorage.getItem('ropuch_accent_color') || '#d4af37';
    let currentOpacity = localStorage.getItem('ropuch_panel_opacity') || '0.95';
    let currentBlur = localStorage.getItem('ropuch_panel_blur') || '5';
    let currentDescFontSize = localStorage.getItem('ropuch_desc_font_size') || '10';
    let currentBaseFontSize = localStorage.getItem('ropuch_base_font_size') || '11';
    let currentUltraCompact = localStorage.getItem('ropuch_ultra_compact') === 'true';
    let editLocked = localStorage.getItem('ropuch_edit_locked') === 'true';

    function getModuleMeta(modId) {
        if (!githubMetadata || typeof githubMetadata !== 'object') return {};
        if (githubMetadata[modId]) return githubMetadata[modId];

        const cleanId = modId.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        for (let key in githubMetadata) {
            const cleanKey = key.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
            if (cleanKey === cleanId) return githubMetadata[key];
        }
        return {};
    }

    function buildUI() {
        if (document.getElementById('rzap-panel')) return;

        const style = document.createElement('style');
        style.id = 'rzap-dynamic-styles';
        updateDynamicStyles(style);
        document.head.appendChild(style);

        const container = document.createElement('div');
        container.innerHTML = `
            <div id="rzap-panel">
                <div class="rzap-header" id="rzap-drag-handle">
                    <h3 class="rzap-title">PANEL RZAPSONS <span style="font-size:9px; color:#888; font-weight:normal;">v1.0</span></h3>
                    <div class="rzap-btn-group">
                        <button class="rzap-akcja-btn" id="rzap-min-btn" title="Zwiń">−</button>
                        <button class="rzap-akcja-btn" id="rzap-close-btn" title="Ukryj">✕</button>
                    </div>
                </div>

                <div class="rzap-topnav">
                    <button class="rzap-tab-btn aktywna" data-target="tab-dodatki">Dodatki</button>
                    <button class="rzap-tab-btn" data-target="tab-ustawienia">Ustawienia</button>
                </div>

                <div class="rzap-body">
                    <div class="rzap-content-area">
                        <div id="tab-dodatki" class="rzap-tab-content aktywna">
                            <input type="text" id="rzap-search" placeholder="Szukaj (nazwa, opis, tagi)...">
                            <div id="mfo-mods-container"></div>
                        </div>
                        <div id="tab-ustawienia" class="rzap-tab-content">
                            <div class="settings-section">
                                <h4 style="margin-top:0; color:var(--rzap-accent);">Wygląd Panelu</h4>
                                <div class="keybind-row">
                                    <span style="color:#aaa;">Kolor:</span>
                                    <input type="color" id="rzap-color-picker" value="${currentAccentColor}" style="background:none; border:none; width:30px; height:20px; cursor:pointer;">
                                </div>
                                <div class="keybind-row">
                                    <span style="color:#aaa;">Zablokuj edycję (opisy/tagi/kolejność):</span>
                                    <label class="rzap-toggle">
                                        <input type="checkbox" id="rzap-edit-lock-toggle" ${editLocked ? 'checked' : ''}>
                                        <span class="rzap-slider"></span>
                                    </label>
                                </div>
                                <div class="keybind-row">
                                    <span style="color:#aaa;">Mniejsze okno:</span>
                                    <label class="rzap-toggle">
                                        <input type="checkbox" id="rzap-ultra-compact-toggle" ${currentUltraCompact ? 'checked' : ''}>
                                        <span class="rzap-slider"></span>
                                    </label>
                                </div>
                                <div class="keybind-row">
                                    <span style="color:#aaa;">Przezroczystość: <span id="opacity-val">${currentOpacity}</span></span>
                                    <input type="range" id="rzap-opacity-range" min="0.4" max="1" step="0.05" value="${currentOpacity}" style="cursor:pointer; width:110px;">
                                </div>
                                <div class="keybind-row">
                                    <span style="color:#aaa;">Rozmycie tła (Blur): <span id="blur-val">${currentBlur}px</span></span>
                                    <input type="range" id="rzap-blur-range" min="0" max="20" step="1" value="${currentBlur}" style="cursor:pointer; width:110px;">
                                </div>
                                <div class="keybind-row">
                                    <span style="color:#aaa;">Ogólna wielkość czcionki (px):</span>
                                    <input type="number" id="rzap-base-font-input" class="mod-input" value="${currentBaseFontSize}" min="8" max="20" step="0.5" style="width: 65px;">
                                </div>
                                <div class="keybind-row">
                                    <span style="color:#aaa;">Wielkość czcionki opisu (px):</span>
                                    <input type="number" id="rzap-desc-font-input" class="mod-input" value="${currentDescFontSize}" min="7" max="18" step="0.5" style="width: 65px;">
                                </div>
                            </div>
                            <div class="settings-section">
                                <h4 style="margin-top:0; color:var(--rzap-accent);">Skróty Klawiszowe</h4>
                                <div id="mfo-keybinds-container">Brak skrótów do skonfigurowania.</div>
                            </div>
                            <div class="settings-section">
                                <h4 style="margin-top:0; color:var(--rzap-accent);">Eksport Metadanych</h4>
                                <p style="color:#aaa; font-size:0.9em; margin-top:0;">Kod JSON do wklejenia do pliku metadata.json na GitHubie.</p>
                                <textarea id="export-textarea" style="width:100%; height:70px; background:#111; color:#0f0; border:1px solid #333; font-family:monospace;" readonly></textarea>
                                <button id="export-json-btn">Generuj Kod</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(container);

        document.getElementById('rzap-color-picker').addEventListener('input', (e) => {
            currentAccentColor = e.target.value;
            localStorage.setItem('ropuch_accent_color', currentAccentColor);
            updateDynamicStyles(document.getElementById('rzap-dynamic-styles'));
        });

        document.getElementById('rzap-edit-lock-toggle').addEventListener('change', (e) => {
            editLocked = e.target.checked;
            localStorage.setItem('ropuch_edit_locked', editLocked);
            lastRenderedConfig = "";
            if (currentLoadedConfig) updateModulesUI(currentLoadedConfig);
        });

        document.getElementById('rzap-ultra-compact-toggle').addEventListener('change', (e) => {
            currentUltraCompact = e.target.checked;
            localStorage.setItem('ropuch_ultra_compact', currentUltraCompact);
            updateDynamicStyles(document.getElementById('rzap-dynamic-styles'));
        });

        document.getElementById('rzap-opacity-range').addEventListener('input', (e) => {
            currentOpacity = e.target.value;
            document.getElementById('opacity-val').innerText = currentOpacity;
            localStorage.setItem('ropuch_panel_opacity', currentOpacity);
            updateDynamicStyles(document.getElementById('rzap-dynamic-styles'));
        });

        document.getElementById('rzap-blur-range').addEventListener('input', (e) => {
            currentBlur = e.target.value;
            document.getElementById('blur-val').innerText = currentBlur + 'px';
            localStorage.setItem('ropuch_panel_blur', currentBlur);
            updateDynamicStyles(document.getElementById('rzap-dynamic-styles'));
        });

        document.getElementById('rzap-base-font-input').addEventListener('input', (e) => {
            currentBaseFontSize = e.target.value || '11';
            localStorage.setItem('ropuch_base_font_size', currentBaseFontSize);
            updateDynamicStyles(document.getElementById('rzap-dynamic-styles'));
        });

        document.getElementById('rzap-desc-font-input').addEventListener('input', (e) => {
            currentDescFontSize = e.target.value || '10';
            localStorage.setItem('ropuch_desc_font_size', currentDescFontSize);
            updateDynamicStyles(document.getElementById('rzap-dynamic-styles'));
        });

        const panel = document.getElementById('rzap-panel');
        const header = document.getElementById('rzap-drag-handle');
        const minBtn = document.getElementById('rzap-min-btn');
        const closeBtn = document.getElementById('rzap-close-btn');

        let isMinimized = localStorage.getItem('ropuch_ui_min') === 'true';
        if(isMinimized) { panel.classList.add('zminimalizowany'); minBtn.innerText = '□'; }

        function trzymajWGranicach() {
            const obrys = panel.getBoundingClientRect();
            let x = obrys.left; let y = obrys.top;
            const maxX = window.innerWidth - panel.offsetWidth;
            const maxY = window.innerHeight - panel.offsetHeight;
            if (x < 0) x = 0; if (y < 0) y = 0;
            if (x > maxX) x = maxX; if (y > maxY) y = maxY;
            panel.style.left = x + 'px'; panel.style.top = y + 'px';
        }

        const zapisanaPozycja = JSON.parse(localStorage.getItem('ropuch_ui_pos') || 'null');
        if (zapisanaPozycja) { panel.style.left = zapisanaPozycja.x; panel.style.top = zapisanaPozycja.y; trzymajWGranicach(); }

        const zapisanyRozmiar = JSON.parse(localStorage.getItem('ropuch_ui_size') || 'null');
        if (zapisanyRozmiar) {
            if (zapisanyRozmiar.w) panel.style.width = zapisanyRozmiar.w;
            if (zapisanyRozmiar.h) panel.style.height = zapisanyRozmiar.h;
        }

        let isDragging = false, startX, startY;
        header.addEventListener('mousedown', (e) => {
            if(e.target.tagName === 'BUTTON' || e.target.tagName === 'INPUT') return;
            isDragging = true;
            startX = e.clientX - panel.getBoundingClientRect().left;
            startY = e.clientY - panel.getBoundingClientRect().top;
        });
        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            panel.style.left = (e.clientX - startX) + 'px'; panel.style.top = (e.clientY - startY) + 'px';
            trzymajWGranicach();
        });
        document.addEventListener('mouseup', () => {
            if (isDragging) {
                isDragging = false;
                localStorage.setItem('ropuch_ui_pos', JSON.stringify({ x: panel.style.left, y: panel.style.top }));
            }
            if (panel && !panel.classList.contains('zminimalizowany')) {
                localStorage.setItem('ropuch_ui_size', JSON.stringify({
                    w: panel.style.width,
                    h: panel.style.height
                }));
            }
        });

        minBtn.addEventListener('click', () => {
            panel.classList.toggle('zminimalizowany');
            isMinimized = panel.classList.contains('zminimalizowany');
            minBtn.innerText = isMinimized ? '□' : '−';
            localStorage.setItem('ropuch_ui_min', isMinimized);
            setTimeout(trzymajWGranicach, 50);
        });

        closeBtn.addEventListener('click', () => { panel.style.display = 'none'; });
        window.addEventListener('resize', trzymajWGranicach);

        document.querySelectorAll('.rzap-tab-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                document.querySelectorAll('.rzap-tab-btn').forEach(b => b.classList.remove('aktywna'));
                document.querySelectorAll('.rzap-tab-content').forEach(c => c.classList.remove('aktywna'));
                this.classList.add('aktywna');
                document.getElementById(this.getAttribute('data-target')).classList.add('aktywna');
            });
        });

        document.getElementById('rzap-search').addEventListener('input', function(e) {
            const query = e.target.value.toLowerCase();
            document.querySelectorAll('.mod-item').forEach(item => {
                const searchData = item.getAttribute('data-search') || "";
                item.style.display = searchData.includes(query) ? 'flex' : 'none';
            });
        });

        document.getElementById('export-json-btn').addEventListener('click', () => {
            const eksportData = {};
            const wszystkieKlucze = new Set([...Object.keys(lokalneOpisy), ...Object.keys(lokalneTagi), ...Object.keys(githubMetadata)]);
            wszystkieKlucze.forEach(id => {
                const metaItem = getModuleMeta(id);
                eksportData[id] = {
                    description: lokalneOpisy[id] || metaItem.description || "",
                    tags: lokalneTagi[id] || metaItem.tags || ""
                };
            });
            document.getElementById('export-textarea').value = JSON.stringify(eksportData, null, 2);
        });

        if (currentLoadedConfig) {
            updateModulesUI(currentLoadedConfig);
        }
    }

    function updateDynamicStyles(styleEl) {
        styleEl.innerHTML = `
            :root {
                --rzap-accent: ${currentAccentColor};
                --rzap-base-font: ${currentBaseFontSize}px;
                --rzap-desc-font: ${currentDescFontSize}px;
            }
            #rzap-panel {
                position: fixed; top: 10px; left: 10px; z-index: 999999;
                width: 520px; height: 440px;
                min-width: ${currentUltraCompact ? '280px' : '410px'};
                min-height: ${currentUltraCompact ? '200px' : '260px'};
                background: rgba(25, 25, 25, ${currentOpacity}); backdrop-filter: blur(${currentBlur}px);
                border: 1px solid var(--rzap-accent); border-radius: 8px;
                display: flex; flex-direction: column; resize: both; overflow: hidden;
                box-sizing: border-box; color: #eee; font-family: Verdana, sans-serif;
                font-size: var(--rzap-base-font);
                box-shadow: 0 4px 20px rgba(0,0,0,0.8);
            }
            #rzap-panel.zminimalizowany {
                width: 250px !important; height: 40px !important; min-height: 40px !important; min-width: 250px !important;
                resize: none;
            }
            #rzap-panel.zminimalizowany .rzap-body,
            #rzap-panel.zminimalizowany .rzap-topnav { display: none !important; }

            .rzap-header {
                display: flex; justify-content: space-between; align-items: center;
                border-bottom: 1px solid var(--rzap-accent);
                padding: 0 15px; background: rgba(0, 0, 0, 0.7);
                cursor: grab; user-select: none; flex-shrink: 0; height: 38px; box-sizing: border-box;
            }
            .rzap-title { color: var(--rzap-accent); font-weight: bold; margin: 0; font-size: 1.1em; pointer-events: none;}

            .rzap-btn-group { display: flex; gap: 8px; }
            .rzap-akcja-btn { background: transparent; color: #888; border: none; font-size: 1.2em; cursor: pointer; transition: 0.2s; padding: 2px 6px;}
            .rzap-akcja-btn:hover { color: var(--rzap-accent); }

            .rzap-topnav {
                display: flex; gap: 10px; padding: 8px 15px; background: rgba(0, 0, 0, 0.4);
                border-bottom: 1px solid rgba(255, 255, 255, 0.1); flex-shrink: 0;
            }
            .rzap-tab-btn {
                background: transparent; color: #aaa; border: none; padding: 6px 14px;
                cursor: pointer; border-radius: 4px; transition: 0.2s; font-size: 0.95em;
            }
            .rzap-tab-btn:hover { background: rgba(255,255,255,0.05); color: #fff; }
            .rzap-tab-btn.aktywna {
                background: color-mix(in srgb, var(--rzap-accent) 20%, transparent);
                color: var(--rzap-accent); font-weight: bold; border-bottom: 2px solid var(--rzap-accent);
            }

            .rzap-body { display: flex; flex-grow: 1; overflow: hidden; }

            .rzap-content-area {
                flex-grow: 1; padding: 15px; overflow-y: auto; overflow-x: hidden;
                container-type: inline-size;
            }
            .rzap-content-area::-webkit-scrollbar { width: 6px; }
            .rzap-content-area::-webkit-scrollbar-track { background: rgba(0, 0, 0, 0.2); border-radius: 3px; }
            .rzap-content-area::-webkit-scrollbar-thumb { background: color-mix(in srgb, var(--rzap-accent) 50%, transparent); border-radius: 3px; }
            .rzap-content-area::-webkit-scrollbar-thumb:hover { background: var(--rzap-accent); }

            .rzap-tab-content { display: none; }
            .rzap-tab-content.aktywna { display: block; }

            #rzap-search {
                width: 100%; background: rgba(0,0,0,0.5); border: 1px solid color-mix(in srgb, var(--rzap-accent) 40%, transparent);
                color: #eee; padding: 7px 10px; border-radius: 4px; margin-bottom: 12px;
                font-size: 1em; outline: none; box-sizing: border-box; transition: 0.2s;
            }
            #rzap-search:focus { border-color: var(--rzap-accent); background: rgba(0,0,0,0.7); }

            #mfo-mods-container { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }

            .mod-item { background: rgba(0,0,0,0.25); padding: 9px; border-radius: 6px; border: 1px solid rgba(255,255,255,0.05); display: flex; flex-direction: column;}
            .mod-header-row { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 4px; }
            .mod-title { font-weight: bold; color: #e6d3a7; margin-right: 5px; font-size: 0.95em; line-height: 1.2; display: flex; align-items: center; gap: 4px; }

            .mod-desc-container { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 6px; }
            .mod-desc { color: #ccc; font-size: var(--rzap-desc-font); line-height: 1.35; flex-grow: 1; padding-right: 5px; }

            .mod-tags-row { display: flex; align-items: center; gap: 4px; flex-wrap: wrap; margin-top: auto; padding-top: 4px;}
            .mod-tag { background: color-mix(in srgb, var(--rzap-accent) 10%, transparent); color: var(--rzap-accent); border: 1px solid color-mix(in srgb, var(--rzap-accent) 30%, transparent); padding: 1px 5px; border-radius: 3px; font-size: 0.8em; white-space: nowrap;}

            .action-icon-btn { cursor: pointer; color: #888; background: none; border: none; font-size: 0.9em; padding: 0 2px;}
            .action-icon-btn:hover { color: var(--rzap-accent); }

            .rzap-toggle { position: relative; display: inline-block; width: 28px; height: 15px; flex-shrink: 0; }
            .rzap-toggle input { opacity: 0; width: 0; height: 0; }
            .rzap-slider { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: rgba(0,0,0,0.8); border: 1px solid rgba(255,255,255,0.2); transition: .2s; border-radius: 15px; }
            .rzap-slider:before { position: absolute; content: ""; height: 9px; width: 9px; left: 2px; bottom: 2px; background-color: #888; transition: .2s; border-radius: 50%; }
            .rzap-toggle input:checked + .rzap-slider { background-color: color-mix(in srgb, var(--rzap-accent) 40%, transparent); border-color: var(--rzap-accent); }
            .rzap-toggle input:checked + .rzap-slider:before { transform: translateX(13px); background-color: var(--rzap-accent); }

            .settings-section { margin-bottom: 15px; border-bottom: 1px dashed rgba(255,255,255,0.1); padding-bottom: 12px;}
            .keybind-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; background: rgba(0,0,0,0.2); padding: 6px 8px; border-radius: 4px;}
            .mod-input { width: 90px; background: rgba(0,0,0,0.5); color: var(--rzap-accent); border: 1px solid color-mix(in srgb, var(--rzap-accent) 40%, transparent); font-size: 0.9em; text-align: center; cursor: pointer; padding: 4px; border-radius: 3px; }
            .mod-input:focus { outline: none; border-color: var(--rzap-accent); }
            #export-json-btn { background: var(--rzap-accent); color: #000; font-weight: bold; border: none; padding: 6px 12px; cursor: pointer; border-radius: 3px; margin-top: 6px; transition: 0.2s;}
            #export-json-btn:hover { filter: brightness(1.2); }

            @container (max-width: 330px) {
                #mfo-mods-container { grid-template-columns: 1fr !important; }
            }
        `;
    }

    function displayKeybind(code) {
        if (!code) return 'Brak';
        if (code.startsWith('Key')) return code.replace('Key', '');
        if (code.startsWith('Digit')) return code.replace('Digit', '');
        return code;
    }

    function updateModulesUI(config) {
        if (!config || !Array.isArray(config.modules)) return;
        currentLoadedConfig = config;

        const currentConfigStr = JSON.stringify(config) + JSON.stringify(lokalneOpisy) + JSON.stringify(lokalneTagi) + JSON.stringify(githubMetadata) + JSON.stringify(modOrder) + editLocked;
        if (lastRenderedConfig === currentConfigStr) return;
        lastRenderedConfig = currentConfigStr;

        const container = document.getElementById('mfo-mods-container');
        const keybindsContainer = document.getElementById('mfo-keybinds-container');
        if(!container || !keybindsContainer) return;

        container.innerHTML = '';
        keybindsContainer.innerHTML = '';

        let hasKeybinds = false;
        let modules = [...config.modules];

        if (modOrder.length > 0) {
            modules.sort((a, b) => {
                let indexA = modOrder.indexOf(a.id);
                let indexB = modOrder.indexOf(b.id);
                if (indexA === -1) indexA = 999;
                if (indexB === -1) indexB = 999;
                return indexA - indexB;
            });
        }

        modules.forEach((mod, index) => {
            const modKey = 'mfo3_setting_' + mod.id;
            const active = localStorage.getItem(modKey) === 'true';
            const metaFromGithub = getModuleMeta(mod.id);

            const mDiv = document.createElement('div');
            mDiv.className = 'mod-item';

            const headerRow = document.createElement('div');
            headerRow.className = 'mod-header-row';

            const titleGroup = document.createElement('div');
            titleGroup.className = 'mod-title';

            let moveButtonsHtml = '';
            if (!editLocked) {
                moveButtonsHtml = `
                    <span style="display:flex; gap:2px; margin-left:4px;">
                        <button class="action-icon-btn move-up" data-id="${mod.id}" title="Przesuń w górę">▲</button>
                        <button class="action-icon-btn move-down" data-id="${mod.id}" title="Przesuń w dół">▼</button>
                    </span>
                `;
            }

            titleGroup.innerHTML = `<span>${mod.name}</span>${moveButtonsHtml}`;
            headerRow.appendChild(titleGroup);

            const toggleLabel = document.createElement('label');
            toggleLabel.className = 'rzap-toggle';
            toggleLabel.innerHTML = `
                <input type="checkbox" id="c-${mod.id}" ${active ? 'checked' : ''}>
                <span class="rzap-slider"></span>
            `;
            headerRow.appendChild(toggleLabel);
            mDiv.appendChild(headerRow);

            const aktualnyOpis = lokalneOpisy[mod.id] !== undefined ? lokalneOpisy[mod.id] : (metaFromGithub.description !== undefined ? metaFromGithub.description : (mod.description || ""));
            const descContainer = document.createElement('div');
            descContainer.className = 'mod-desc-container';

            let editDescBtnHtml = editLocked ? '' : `<button class="action-icon-btn edit-desc-btn" data-id="${mod.id}" title="Edytuj opis">✎</button>`;
            descContainer.innerHTML = `
                <div class="mod-desc">${aktualnyOpis}</div>
                ${editDescBtnHtml}
            `;
            mDiv.appendChild(descContainer);

            const domyslneTagi = Array.isArray(mod.tags) ? mod.tags.join(', ') : (mod.tags || "");
            const aktualneTagiStr = lokalneTagi[mod.id] !== undefined ? lokalneTagi[mod.id] : (metaFromGithub.tags !== undefined ? metaFromGithub.tags : domyslneTagi);
            const tagsArray = aktualneTagiStr ? aktualneTagiStr.split(',').map(t => t.trim()).filter(t => t.length > 0) : [];

            const tagsContainer = document.createElement('div');
            tagsContainer.className = 'mod-tags-row';
            let tagsHtml = tagsArray.map(t => `<span class="mod-tag">#${t}</span>`).join('');

            let editTagsBtnHtml = editLocked ? '' : `<button class="action-icon-btn edit-tags-btn" data-id="${mod.id}" title="Edytuj tagi">🏷️</button>`;
            tagsContainer.innerHTML = `
                <div style="display:flex; flex-wrap:wrap; gap:4px; flex-grow:1;">${tagsHtml}</div>
                ${editTagsBtnHtml}
            `;
            mDiv.appendChild(tagsContainer);

            mDiv.setAttribute('data-search', `${mod.name} ${aktualnyOpis} ${aktualneTagiStr}`.toLowerCase());

            if (mod.settings && mod.settings.length > 0) {
                mod.settings.forEach(set => {
                    const storageKey = `mfo3_val_${mod.id}_${set.id}`;
                    const currentVal = localStorage.getItem(storageKey) || set.default;
                    const isKey = set.id.startsWith('k_');

                    if (isKey) {
                        hasKeybinds = true;
                        const keyRow = document.createElement('div');
                        keyRow.className = 'keybind-row';
                        keyRow.innerHTML = `
                            <span style="color:#aaa;"><b>${mod.name}</b>: ${set.label}</span>
                            <input type="text" class="mod-input keybind-input" readonly data-key="${storageKey}" value="${displayKeybind(currentVal)}" data-raw="${currentVal}" placeholder="Klawisz...">
                        `;
                        keybindsContainer.appendChild(keyRow);
                    } else {
                        const settingDiv = document.createElement('div');
                        settingDiv.style.cssText = "display:flex; justify-content:space-between; align-items:center; margin-top:6px; padding-top:4px; border-top: 1px dashed rgba(255,255,255,0.1);";
                        settingDiv.innerHTML = `
                            <span style="color:#aaa; font-size:0.9em;">${set.label}:</span>
                            <input type="text" class="mod-input text-input" data-key="${storageKey}" value="${currentVal}" placeholder="Wpisz...">
                        `;
                        mDiv.appendChild(settingDiv);
                    }
                });
            }

            container.appendChild(mDiv);

            if (!editLocked) {
                const btnUp = titleGroup.querySelector('.move-up');
                if (btnUp) {
                    btnUp.addEventListener('click', () => {
                        let currentIds = modules.map(m => m.id);
                        if (index > 0) {
                            let temp = currentIds[index];
                            currentIds[index] = currentIds[index - 1];
                            currentIds[index - 1] = temp;
                            modOrder = currentIds;
                            localStorage.setItem('ropuch_mods_order', JSON.stringify(modOrder));
                            lastRenderedConfig = "";
                            updateModulesUI(config);
                        }
                    });
                }

                const btnDown = titleGroup.querySelector('.move-down');
                if (btnDown) {
                    btnDown.addEventListener('click', () => {
                        let currentIds = modules.map(m => m.id);
                        if (index < currentIds.length - 1) {
                            let temp = currentIds[index];
                            currentIds[index] = currentIds[index + 1];
                            currentIds[index + 1] = temp;
                            modOrder = currentIds;
                            localStorage.setItem('ropuch_mods_order', JSON.stringify(modOrder));
                            lastRenderedConfig = "";
                            updateModulesUI(config);
                        }
                    });
                }

                const descBtn = descContainer.querySelector('.edit-desc-btn');
                if (descBtn) {
                    descBtn.addEventListener('click', function() {
                        const noweDane = prompt(`Wpisz nowy opis dla: ${mod.name}`, aktualnyOpis);
                        if (noweDane !== null) {
                            lokalneOpisy[mod.id] = noweDane;
                            localStorage.setItem('ropuch_wlasne_opisy', JSON.stringify(lokalneOpisy));
                            lastRenderedConfig = ""; updateModulesUI(config);
                        }
                    });
                }

                const tagsBtn = tagsContainer.querySelector('.edit-tags-btn');
                if (tagsBtn) {
                    tagsBtn.addEventListener('click', function() {
                        const noweDane = prompt(`Wpisz tagi po przecinku dla: ${mod.name}`, aktualneTagiStr);
                        if (noweDane !== null) {
                            lokalneTagi[mod.id] = noweDane;
                            localStorage.setItem('ropuch_wlasne_tagi', JSON.stringify(lokalneTagi));
                            lastRenderedConfig = ""; updateModulesUI(config);
                        }
                    });
                }
            }

            document.getElementById('c-' + mod.id).addEventListener('change', (e) => {
                localStorage.setItem(modKey, e.target.checked);
                if(!e.target.checked) {
                    localStorage.removeItem('ropuch_cache_' + mod.id);
                    delete window.ropuchInjectedScripts[mod.id];
                }
            });

            if (active) {
                if (!window.ropuchInjectedScripts[mod.id]) {
                    window.ropuchInjectedScripts[mod.id] = true;

                    const cachedScript = localStorage.getItem('ropuch_cache_' + mod.id);
                    if (cachedScript) injectScriptText(cachedScript);

                    GM_xmlhttpRequest({
                        method: "GET", url: `${REPO_URL}/${mod.file}?t=${Date.now()}`,
                        onload: function(r) {
                            localStorage.setItem('ropuch_cache_' + mod.id, r.responseText);
                            if (!cachedScript) injectScriptText(r.responseText);
                        }
                    });
                }
            }
        });

        if(!hasKeybinds) keybindsContainer.innerHTML = '<span style="color:#777;">Brak przypisanych skrótów.</span>';

        const searchInput = document.getElementById('rzap-search');
        if (searchInput && searchInput.value) searchInput.dispatchEvent(new Event('input'));

        setTimeout(() => {
            document.querySelectorAll('.keybind-input').forEach(inp => {
                inp.addEventListener('mousedown', function(e) {
                    e.preventDefault();
                    this.value = "...";
                    this.style.borderColor = "#e74c3c";

                    const listener = (event) => {
                        if (['Control', 'Shift', 'Alt', 'Meta'].includes(event.key)) return;

                        event.preventDefault();
                        event.stopPropagation();
                        event.stopImmediatePropagation();

                        const rawCode = event.code;
                        this.value = displayKeybind(rawCode);
                        this.style.borderColor = currentAccentColor;
                        localStorage.setItem(this.dataset.key, rawCode);

                        window.removeEventListener('keydown', listener, true);
                        this.blur();
                    };
                    window.addEventListener('keydown', listener, true);
                });
            });

            document.querySelectorAll('.text-input').forEach(inp => {
                inp.addEventListener('input', function() {
                    localStorage.setItem(this.dataset.key, this.value);
                });
            });
        }, 50);
    }

    function injectScriptText(text) {
        const script = document.createElement('script');
        script.textContent = text;
        document.documentElement.appendChild(script);
        script.remove();
    }

    function init() {
        if(document.body) { buildUI(); }
        else { document.addEventListener('DOMContentLoaded', buildUI); }

        const cachedConfig = localStorage.getItem('ropuch_cache_config');
        if (cachedConfig) {
            try {
                const config = JSON.parse(cachedConfig);
                currentLoadedConfig = config;
                if(document.body) updateModulesUI(config);
            } catch(e) {}
        }

        GM_xmlhttpRequest({
            method: "GET",
            url: `${REPO_URL}/metadata.json?t=${Date.now()}`,
            onload: function(res) {
                try {
                    githubMetadata = JSON.parse(res.responseText);
                    localStorage.setItem('ropuch_cache_metadata', res.responseText);
                    if (currentLoadedConfig) updateModulesUI(currentLoadedConfig);
                } catch(e) {}
            }
        });

        GM_xmlhttpRequest({
            method: "GET",
            url: `${REPO_URL}/config.json?t=${Date.now()}`,
            onload: function(res) {
                try {
                    const config = JSON.parse(res.responseText);
                    localStorage.setItem('ropuch_cache_config', res.responseText);
                    updateModulesUI(config);
                } catch(e) {}
            }
        });
    }

    init();
})();
