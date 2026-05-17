// ==UserScript==
// @name          MFO3 - Panel Ropucha
// @version       5.3
// @match         https://s1.mfo3.pl/game/
// @grant         GM_xmlhttpRequest
// @connect       raw.githubusercontent.com
// @run-at        document-start
// ==/UserScript==

(function() {
    'use strict';
    const REPO_URL = 'https://raw.githubusercontent.com/Ropuch1/mfo3-dodatki/main';

    function init() {
        // Szybkie ładowanie configu z pamięci podręcznej, jeśli istnieje
        const cachedConfig = localStorage.getItem('ropuch_cache_config');
        if (cachedConfig) {
            try { render(JSON.parse(cachedConfig), true); } catch(e) {}
        }

        // Pobieranie świeżego configu w tle
        GM_xmlhttpRequest({
            method: "GET",
            url: `${REPO_URL}/config.json?t=${Date.now()}`,
            onload: function(res) {
                try {
                    const config = JSON.parse(res.responseText);
                    localStorage.setItem('ropuch_cache_config', res.responseText);
                    if (!cachedConfig) render(config, false);
                } catch(e) {}
            }
        });
    }

    function render(config, isCached) {
        // Zapobiegamy dublowaniu panelu przy przeładowaniu z tła
        if (document.getElementById('ropuch-panel-main')) {
            if (!isCached) updateModulesUI(config);
            return;
        }

        const div = document.createElement('div');
        div.id = "ropuch-panel-main";
        const savedData = JSON.parse(localStorage.getItem('ropuch_panel_pos')) || { top: "60px", left: "auto", right: "15px", minimized: false };
        div.style.cssText = `position:fixed; top:${savedData.top}; left:${savedData.left}; right:${savedData.right}; z-index:10000; background:rgba(45,34,23,0.95); color:#e6d3a7; padding:12px; border:2px solid #7a5a3a; font-family:Verdana; font-size:11px; border-radius:8px; width:190px; box-shadow:0 0 15px black; cursor: move; user-select: none;`;

        div.innerHTML = `
            <div id="panel-header" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px; border-bottom:1px solid #7a5a3a; padding-bottom:5px; cursor:move;">
                <b style="color:#f1c40f; pointer-events:none;">DODATKI RZAPSONS</b>
                <span id="ropuch-minimize" style="cursor:pointer; color:#f1c40f; font-weight:bold; font-size:14px; padding:0 5px;">${savedData.minimized ? '▢' : '_'}</span>
            </div>
            <div id="mfo-mods-container" style="${savedData.minimized ? 'display:none;' : 'display:block;'}">
                <div id="mfo-mods"></div>
            </div>`;

        if (document.body) { document.body.appendChild(div); } else { document.documentElement.appendChild(div); }

        updateModulesUI(config);

        // DRAG & DROP I MINIMALIZACJA
        const modsContainer = document.getElementById('mfo-mods-container');
        const minBtn = document.getElementById('ropuch-minimize');
        const savePos = () => {
            const pos = { top: div.style.top, left: div.style.left, right: div.style.right, minimized: modsContainer.style.display === 'none' };
            localStorage.setItem('ropuch_panel_pos', JSON.stringify(pos));
        };

        minBtn.onclick = (e) => {
            e.stopPropagation();
            const isVisible = modsContainer.style.display !== 'none';
            modsContainer.style.display = isVisible ? 'none' : 'block';
            minBtn.innerText = isVisible ? '▢' : '_';
            savePos();
        };

        let isDragging = false; let offsetX, offsetY;
        div.addEventListener('mousedown', (e) => {
            if (e.target.tagName === 'INPUT' || e.target.id === 'ropuch-minimize') return;
            isDragging = true; offsetX = e.clientX - div.getBoundingClientRect().left; offsetY = e.clientY - div.getBoundingClientRect().top;
        });
        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            let x = Math.max(0, Math.min(e.clientX - offsetX, window.innerWidth - div.offsetWidth));
            let y = Math.max(0, Math.min(e.clientY - offsetY, window.innerHeight - div.offsetHeight));
            div.style.left = x + 'px'; div.style.top = y + 'px'; div.style.right = 'auto';
        });
        document.addEventListener('mouseup', () => { if (isDragging) { isDragging = false; savePos(); } });
    }

    function updateModulesUI(config) {
        const container = document.getElementById('mfo-mods');
        container.innerHTML = '';

        config.modules.forEach(mod => {
            const modKey = 'mfo3_setting_' + mod.id;
            const active = localStorage.getItem(modKey) === 'true';
            const mDiv = document.createElement('div');
            mDiv.style.marginBottom = "10px";

            const label = document.createElement('label');
            label.style.cssText = "display:flex; align-items:center; cursor:pointer; font-weight:bold;";
            label.innerHTML = `<input type="checkbox" id="c-${mod.id}" ${active ? 'checked' : ''} style="margin-right:8px;"> ${mod.name}`;
            mDiv.appendChild(label);

            if (mod.settings) {
                const sDiv = document.createElement('div');
                sDiv.style.cssText = "margin-left:22px; margin-top:5px; display:grid; grid-template-columns: 1fr 65px; gap:4px;";

                mod.settings.forEach(set => {
                    const storageKey = `mfo3_val_${mod.id}_${set.id}`;
                    const currentVal = localStorage.getItem(storageKey) || set.default;
                    sDiv.innerHTML += `
                        <span style="font-size:9px; align-self:center;">${set.label}:</span>
                        <input type="text" readonly data-key="${storageKey}" value="${currentVal}"
                               style="width:60px; background:#1a140e; color:#f1c40f; border:1px solid #7a5a3a; font-size:9px; text-align:center; cursor:pointer;"
                               placeholder="Kliknij...">
                    `;
                });
                mDiv.appendChild(sDiv);

                setTimeout(() => {
                    sDiv.querySelectorAll('input').forEach(inp => {
                        inp.addEventListener('mousedown', function(e) {
                            e.preventDefault();
                            this.value = "...";
                            this.style.borderColor = "#e74c3c";
                            const listener = (event) => {
                                event.preventDefault(); event.stopPropagation();
                                this.value = event.code; this.style.borderColor = "#7a5a3a";
                                localStorage.setItem(this.dataset.key, event.code);
                                window.removeEventListener('keydown', listener, true);
                                this.blur();
                            };
                            window.addEventListener('keydown', listener, true);
                        });
                    });
                }, 100);
            }

            container.appendChild(mDiv);
            document.getElementById('c-' + mod.id).addEventListener('change', (e) => {
                localStorage.setItem(modKey, e.target.checked);
                if(!e.target.checked) localStorage.removeItem('ropuch_cache_' + mod.id);
            });

            if (active) {
                // INSTANT: Odpalenie kodu bezpośrednio z pamięci lokalnej (jak w Tampermonkey)
                const cachedScript = localStorage.getItem('ropuch_cache_' + mod.id);
                if (cachedScript) {
                    injectScriptText(cachedScript);
                }

                // Pobranie nowej wersji z GitHuba w tle i aktualizacja pamięci podręcznej
                GM_xmlhttpRequest({
                    method: "GET", url: `${REPO_URL}/${mod.file}?t=${Date.now()}`,
                    onload: function(r) {
                        localStorage.setItem('ropuch_cache_' + mod.id, r.responseText);
                        if (!cachedScript) {
                            injectScriptText(r.responseText);
                        }
                    }
                });
            }
        });
    }

    function injectScriptText(text) {
        const script = document.createElement('script');
        script.textContent = text;
        document.documentElement.appendChild(script);
        script.remove();
    }

    init();
})();
