// ==UserScript==
// @name         MFO3 - Panel Ropucha
// @version      4.6
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
            <div id="panel-header" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:5px; border-bottom:1px solid #7a5a3a; padding-bottom:5px; cursor:move;">
                <b style="color:#f1c40f; pointer-events:none;">DODATKI RZAPSONS</b>
                <span id="ropuch-minimize" style="cursor:pointer; color:#f1c40f; font-weight:bold; font-size:14px; padding:0 5px; user-select:none;">${savedData.minimized ? '▢' : '_'}</span>
            </div>
            <div id="mfo-mods-container" style="${savedData.minimized ? 'display:none;' : 'display:block;'}">
                <div id="mfo-mods"></div>
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

        // DRAG & DROP
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

        // MODUŁY
        config.modules.forEach(mod => {
            const key = 'mfo3_setting_' + mod.id;
            const active = localStorage.getItem(key) === 'true';
            
            const container = document.createElement('div');
            container.style.marginBottom = "10px";

            const label = document.createElement('label');
            label.style.cssText = "display:flex; align-items:center; cursor:pointer;";
            label.innerHTML = `<input type="checkbox" id="c-${mod.id}" ${active ? 'checked' : ''} style="margin-right:8px;"> ${mod.name}`;
            container.appendChild(label);

            // Specjalne pola dla leczenia
            if (mod.id === 'heal') {
                const sDiv = document.createElement('div');
                sDiv.style.cssText = "margin-left:22px; margin-top:4px; display:grid; grid-template-columns: 1fr 60px; gap:4px; align-items:center;";
                
                const kh = localStorage.getItem('mfo3_key_heal') || 'KeyT';
                const kr = localStorage.getItem('mfo3_key_reload') || 'KeyR';

                sDiv.innerHTML = `
                    <span style="font-size:9px;">Lecz (code):</span><input type="text" id="k-heal" value="${kh}" style="width:55px; background:#1a140e; color:#f1c40f; border:1px solid #7a5a3a; font-size:9px; text-align:center;">
                    <span style="font-size:9px;">Ref (code):</span><input type="text" id="k-reload" value="${kr}" style="width:55px; background:#1a140e; color:#f1c40f; border:1px solid #7a5a3a; font-size:9px; text-align:center;">
                `;
                container.appendChild(sDiv);

                setTimeout(() => {
                    document.getElementById('k-heal').onchange = (e) => localStorage.setItem('mfo3_key_heal', e.target.value.trim());
                    document.getElementById('k-reload').onchange = (e) => localStorage.setItem('mfo3_key_reload', e.target.value.trim());
                }, 100);
            }

            document.getElementById('mfo-mods').appendChild(container);

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
