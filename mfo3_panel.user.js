// ==UserScript==
// @name         MFO3 - Panel Ropucha (Dynamic)
// @version      3.5
// @description  Dynamiczny panel sterowania dodatkami MFO3
// @author       Ropuch1
// @match        *://*.mfo3.pl/*
// @grant        GM_xmlhttpRequest
// @connect      raw.githubusercontent.com
// @run-at       document-end
// ==/UserScript==

(function() {
    'use strict';

    const REPO_URL = 'https://raw.githubusercontent.com/Ropuch1/mfo3-dodatki/main';

    // Używamy bezpiecznej metody Tampermonkey do pobrania JSONa (omija blokady CORS)
    function loadConfig() {
        GM_xmlhttpRequest({
            method: "GET",
            url: `${REPO_URL}/config.json?t=${Date.now()}`,
            onload: function(response) {
                try {
                    const config = JSON.parse(response.responseText);
                    buildPanel(config);
                } catch (e) {
                    console.error("Błąd parsowania JSONa:", e);
                }
            },
            onerror: function(err) {
                console.error("Błąd połączenia z GitHubem:", err);
            }
        });
    }

    function buildPanel(config) {
        const panel = document.createElement('div');
        panel.style.cssText = "position:fixed; top:60px; right:15px; z-index:10000; background:rgba(45,34,23,0.95); color:#e6d3a7; padding:12px; border:2px solid #7a5a3a; font-family:Verdana; font-size:11px; border-radius:8px; width:180px; box-shadow:0 0 15px black;";
        panel.innerHTML = `<b style="color:#f1c40f; display:block; text-align:center; margin-bottom:8px;">MENU ROPUCHA</b><div id="mod-list"></div>`;
        document.body.appendChild(panel);

        config.modules.forEach(mod => {
            const key = 'mfo3_setting_' + mod.id;
            const isEnabled = localStorage.getItem(key) === 'true';

            const label = document.createElement('label');
            label.style.cssText = "display:flex; align-items:center; margin-bottom:6px; cursor:pointer;";
            label.innerHTML = `<input type="checkbox" id="chk-${mod.id}" ${isEnabled ? 'checked' : ''} style="margin-right:8px;"> ${mod.name}`;
            document.getElementById('mod-list').appendChild(label);

            document.getElementById('chk-' + mod.id).addEventListener('change', (e) => {
                localStorage.setItem(key, e.target.checked);
                console.log(`[Panel] Zmieniono ${mod.id}. Odśwież F5.`);
            });

            if (isEnabled) {
                injectScript(mod.file, mod.name);
            }
        });
    }

    function injectScript(fileName, niceName) {
        const s = document.createElement('script');
        s.src = `${REPO_URL}/${fileName}?t=${Date.now()}`;
        s.type = 'text/javascript';
        s.async = false;
        document.head.appendChild(s);
        console.log(`%c[Panel] Wczytano: ${niceName}`, "color: #2ecc71; font-weight: bold;");
    }

    // Start
    loadConfig();

})();
