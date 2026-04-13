// ==UserScript==
// @name         MFO3 - Panel Ropucha 
// @version      4.6
// @description  Zamykanie/Otwieranie okienek po kliknięciu w nazwę + Pamięć stanu
// @author       Ropuch
// @match        *://*.mfo3.pl/game/*
// @grant        GM_xmlhttpRequest
// @connect      raw.githubusercontent.com
// @run-at       document-end
// ==/UserScript==

(function() {
    'use strict';
    const REPO_URL = 'https://raw.githubusercontent.com/Ropuch1/mfo3-dodatki/main';

    function init() {
        GM_xmlhttpRequest({
            method: "GET",
            url: `${REPO_URL}/config.json?t=${Date.now()}`,
            onload: function(res) {
                try {
                    const config = JSON.parse(res.responseText);
                    render(config);
                } catch(e) { console.error("Błąd configu panelu"); }
            }
        });
    }

    function render(config) {
        const div = document.createElement('div');
        div.id = "ropuch-panel-main";
        
        // Odczytujemy zapisaną pozycję i stan zwinięcia głównego panelu
        const savedData = JSON.parse(localStorage.getItem('ropuch_panel_pos')) || { 
            top: "60px", 
            left: "auto", 
            right: "15px", 
            minimized: false 
        };
        
        div.style.cssText = `
            position:fixed; top:${savedData.top}; left:${savedData.left}; right:${savedData.right}; 
            z-index:10000; background:rgba(45,34,23,0.95); color:#e6d3a7; 
            padding:12px; border:2px solid #7a5a3a; font-family:Verdana; 
            font-size:11px; border-radius:8px; width:190px; box-shadow:0 0 15px black;
            cursor: move; user-select: none;
        `;
        
        div.innerHTML = `
            <div id="panel-header" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:5px; border-bottom:1px solid #7a5a3a; padding-bottom:5px; cursor:move;">
                <b style="color:#f1c40f; pointer-events:none;">DODATKI RZAPSONS</b>
                <span id="ropuch-minimize" style="cursor:pointer; color:#f1c40f; font-weight:bold; font-size:14px; padding:0 5px;">${savedData.minimized ? '▢' : '_'}</span>
            </div>
            <div id="mfo-mods-container" style="${savedData.minimized ? 'display:none;' : 'display:block;'}">
                <div id="mfo-mods"></div>
                <div style="font-size:9px; color:#8a7a5a; margin-top:8px; border-top:1px dotted #7a5a3a; padding-top:4px;">Kliknij w nazwę, by ukryć okno</div>
            </div>`;
            
        document.body.appendChild(div);

        const modsContainer = document.getElementById('mfo-mods-container');
        const minBtn = document.getElementById('ropuch-minimize');

        const savePos = () => {
            const pos = { 
                top: div.style.top, 
                left: div.style.left, 
                right: div.style.right,
                minimized: modsContainer.style.display === 'none'
            };
            localStorage.setItem('ropuch_panel_pos', JSON.stringify(pos));
        };

        minBtn.onclick = (e) => {
            e.stopPropagation();
            const isCurrentlyVisible = modsContainer.style.display !== 'none';
            modsContainer.style.display = isCurrentlyVisible ? 'none' : 'block';
            minBtn.innerText = isCurrentlyVisible ? '▢' : '_';
            savePos();
        };

        // --- DRAG & DROP ---
        let isDragging = false;
        let offsetX, offsetY;

        div.addEventListener('mousedown', (e) => {
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'LABEL' || e.target.id === 'ropuch-minimize') return;
            isDragging = true;
            offsetX = e.clientX - div.getBoundingClientRect().left;
            offsetY = e.clientY - div.getBoundingClientRect().top;
        });

        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            let x = e.clientX - offsetX;
            let y = e.clientY - offsetY;
            x = Math.max(0, Math.min(x, window.innerWidth - div.offsetWidth));
            y = Math.max(0, Math.min(y, window.innerHeight - div.offsetHeight));
            div.style.left = x + 'px';
            div.style.top = y + 'px';
            div.style.right = 'auto';
        });

        document.addEventListener('mouseup', () => { if (isDragging) { isDragging = false; savePos(); } });

        // --- ŁADOWANIE MODUŁÓW ---
        config.modules.forEach(mod => {
            const settingKey = 'mfo3_setting_' + mod.id;
            const visibilityKey = 'mfo3_visible_' + mod.id;
            const active = localStorage.getItem(settingKey) === 'true';
            
            const label = document.createElement('div');
            label.style.cssText = "display:flex; align-items:center; margin-bottom:6px; cursor:pointer;";
            label.innerHTML = `
                <input type="checkbox" id="c-${mod.id}" ${active ? 'checked' : ''} style="margin-right:8px; cursor:pointer;">
                <span class="mod-toggle-name" style="flex:1; transition:color 0.2s;">${mod.name}</span>
            `;
            document.getElementById('mfo-mods').appendChild(label);

            const checkbox = label.querySelector('input');
            const nameSpan = label.querySelector('.mod-toggle-name');

            // 1. Obsługa checkboxa (Włącz/Wyłącz całkowicie)
            checkbox.onchange = (e) => {
                localStorage.setItem(settingKey, e.target.checked);
                location.reload(); 
            };

            // 2. Obsługa kliknięcia w nazwę (Ukryj/Pokaż okienko)
            nameSpan.onclick = () => {
                if (!active) return;
                const targetModWindow = document.getElementById(mod.id);
                if (targetModWindow) {
                    const isHidden = targetModWindow.style.display === 'none';
                    targetModWindow.style.display = isHidden ? 'block' : 'none';
                    localStorage.setItem(visibilityKey, targetModWindow.style.display);
                    nameSpan.style.color = isHidden ? '#e6d3a7' : '#8a7a5a'; // Przyciemnij nazwę jeśli okno ukryte
                }
            };

            // 3. Pobieranie skryptu jeśli aktywny
            if (active) {
                GM_xmlhttpRequest({
                    method: "GET",
                    url: `${REPO_URL}/${mod.file}?t=${Date.now()}`,
                    onload: function(r) {
                        const script = document.createElement('script');
                        script.textContent = r.responseText;
                        document.documentElement.appendChild(script);
                        script.remove();

                        // Przywróć stan widoczności okienka po załadowaniu
                        setTimeout(() => {
                            const savedVis = localStorage.getItem(visibilityKey);
                            const targetModWindow = document.getElementById(mod.id);
                            if (targetModWindow && savedVis) {
                                targetModWindow.style.display = savedVis;
                                if (savedVis === 'none') nameSpan.style.color = '#8a7a5a';
                            }
                        }, 300);
                    }
                });
            } else {
                nameSpan.style.color = '#555'; // Szary kolor dla wyłączonych
            }
        });
    }
    init();
})();
