// ==UserScript==
// @name         MFO3 - Panel Ropucha 
// @version      4.2
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
        
        // Odczytujemy zapisaną pozycję lub ustawiamy domyślną
        const savedPos = JSON.parse(localStorage.getItem('ropuch_panel_pos')) || { top: "60px", left: "auto", right: "15px" };
        
        div.style.cssText = `
            position:fixed; top:${savedPos.top}; left:${savedPos.left}; right:${savedPos.right}; 
            z-index:10000; background:rgba(45,34,23,0.95); color:#e6d3a7; 
            padding:12px; border:2px solid #7a5a3a; font-family:Verdana; 
            font-size:11px; border-radius:8px; width:180px; box-shadow:0 0 15px black;
            cursor: move; user-select: none;
        `;
        
        div.innerHTML = `<b id="panel-handle" style="color:#f1c40f; display:block; text-align:center; margin-bottom:8px; border-bottom:1px solid #7a5a3a; padding-bottom:5px;">☰ MENU ROPUCHA</b><div id="mfo-mods"></div>`;
        document.body.appendChild(div);

        // --- FUNKCJA PRZESUWANIA (DRAG & DROP) ---
        let isDragging = false;
        let offsetX, offsetY;

        div.addEventListener('mousedown', (e) => {
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'LABEL') return;
            isDragging = true;
            offsetX = e.clientX - div.getBoundingClientRect().left;
            offsetY = e.clientY - div.getBoundingClientRect().top;
        });

        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            div.style.left = (e.clientX - offsetX) + 'px';
            div.style.top = (e.clientY - offsetY) + 'px';
            div.style.right = 'auto';
        });

        document.addEventListener('mouseup', () => {
            if (isDragging) {
                isDragging = false;
                // Zapisujemy nową pozycję
                const pos = { top: div.style.top, left: div.style.left, right: 'auto' };
                localStorage.setItem('ropuch_panel_pos', JSON.stringify(pos));
            }
        });
        // --- KONIEC PRZESUWANIA ---

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
