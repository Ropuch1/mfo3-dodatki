// ==UserScript==
// @name         MFO3 - Panel Ropucha (PRO)
// @version      4.1
// @description  Stabilny panel hybrydowy
// @author       Ropuch1
// @match        *://*.mfo3.pl/*
// @grant        GM_xmlhttpRequest
// @grant        GM_log
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
        div.style.cssText = "position:fixed; top:60px; right:15px; z-index:10000; background:rgba(45,34,23,0.95); color:#e6d3a7; padding:12px; border:2px solid #7a5a3a; font-family:Verdana; font-size:11px; border-radius:8px; width:180px; box-shadow:0 0 15px black;";
        div.innerHTML = `<b style="color:#f1c40f; display:block; text-align:center; margin-bottom:8px;">MENU ROPUCHA</b><div id="mfo-mods"></div>`;
        document.body.appendChild(div);

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
                // POBIERAMY I WSTRZYKUJEMY BEZPOŚREDNIO
                GM_xmlhttpRequest({
                    method: "GET",
                    url: `${REPO_URL}/${mod.file}?t=${Date.now()}`,
                    onload: function(r) {
                        const script = document.createElement('script');
                        script.textContent = r.responseText; // Wstrzykujemy czysty tekst kodu
                        (document.head || document.documentElement).appendChild(script);
                        console.log(`%c[Panel] Aktywowano: ${mod.name}`, "color: #2ecc71; font-weight: bold;");
                    }
                });
            }
        });
    }

    init();
})();
