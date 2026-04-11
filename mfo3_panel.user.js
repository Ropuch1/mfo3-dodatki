// ==UserScript==
// @name         MFO3 - Panel Ropucha
// @version      4.4
// @match        https://s1.mfo3.pl/game/
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
                } catch(e) { console.error("Błąd configu"); }
            }
        });
    }

    function render(config) {
        const div = document.createElement('div');
        div.id = "ropuch-panel-main";
        
        // Odczytujemy zapisaną pozycję i stan zwinięcia
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
            font-size:11px; border-radius:8px; width:180px; box-shadow:0 0 15px black;
            cursor: move; user-select: none;
        `;
        
        div.innerHTML = `
            <div id="panel-header" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:5px; border-bottom:1px solid #7a5a3a; padding-bottom:5px;">
                <b style="color:#f1c40f;">DODATKI RZAPSONS</b>
                <span id="ropuch-minimize" style="cursor:pointer; color:#f1c40f; font-weight:bold; font-size:14px; padding:0 5px;">${savedData.minimized ? '▢' : '_'}</span>
            </div>
            <div id="mfo-mods-container" style="${savedData.minimized ? 'display:none;' : ''}">
                <div id="mfo-mods"></div>
            </div>`;
            
        document.body.appendChild(div);

        const modsContainer = document.getElementById('mfo-mods-container');
        const minBtn = document.getElementById('ropuch-minimize');

        // --- FUNKCJA ZWIJANIA ---
        minBtn.addEventListener('mousedown', (e) => e.stopPropagation()); // Żeby nie dragowało przy kliku
        minBtn.onclick = () => {
            const isMin = modsContainer.style.display === 'none';
            if (isMin) {
                modsContainer.style.display = 'block';
                minBtn.innerText = '_';
            } else {
                modsContainer.style.display = 'none';
                minBtn.innerText = '▢';
            }
            savePos();
        };

        // --- FUNKCJA PRZESUWANIA (DRAG & DROP) ---
        let isDragging = false;
        let offsetX, offsetY;

        const savePos = () => {
            const pos = { 
                top: div.style.top, 
                left: div.style.left, 
                right: 'auto',
                minimized: modsContainer.style.display === 'none'
            };
            localStorage.setItem('ropuch_panel_pos', JSON.stringify(pos));
        };

        div.addEventListener('mousedown', (e) => {
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'LABEL' || e.id === 'ropuch-minimize') return;
            isDragging = true;
            offsetX = e.clientX - div.getBoundingClientRect().left;
            offsetY = e.clientY - div.getBoundingClientRect().top;
        });

        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            let x = e.clientX - offsetX;
            let y = e.clientY - offsetY;
            
            // Prosty clamping (nie wyjeżdżaj poza ekran)
            x = Math.max(0, Math.min(x, window.innerWidth - div.offsetWidth));
            y = Math.max(0, Math.min(y, window.innerHeight - div.offsetHeight));

            div.style.left = x + 'px';
            div.style.top = y + 'px';
            div.style.right = 'auto';
        });

        document.addEventListener('mouseup', () => {
            if (isDragging) {
                isDragging = false;
                savePos();
            }
        });

        // --- ŁADOWANIE MODUŁÓW ---
        config.modules.forEach(mod => {
            const key = 'mfo3_setting_' + mod.id;
            const active = localStorage.getItem(key) === 'true';
            const label = document.createElement('label');
            label.style.cssText = "display:flex; align-items:center; margin-bottom:6px; cursor:pointer;";
            label.innerHTML = `<input type="checkbox" id="c-${mod.id}" ${active ? 'checked' : ''} style="margin-right:8px;"> ${mod.name}`;
            document.getElementById('mfo-mods').appendChild(label);

            document.getElementById('c-' + mod.id).addEventListener('change', (e) => {
                localStorage.setItem(key, e.target.checked);
            });

            if (active) {
                GM_xmlhttpRequest({
                    method: "GET",
                    url: `${REPO_URL}/${mod.file}?t=${Date.now()}`,
                    onload: function(r) {
                        const script = document.createElement('script');
                        script.textContent = r.responseText;
                        document.documentElement.appendChild(script);
                        script.remove();
                    }
                });
            }
        });
    }
    init();
})();
