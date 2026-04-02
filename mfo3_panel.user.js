// ==UserScript==
// @name         MFO3 - Panel Ropucha (Dynamic)
// @version      3.4
// @description  Dynamiczny panel sterowania dodatkami MFO3 - Wersja Stabilna
// @author       Ropuch1
// @match        *://*.mfo3.pl/*
// @grant        none
// @run-at       document-start
// @updateURL    https://raw.githubusercontent.com/Ropuch1/mfo3-dodatki/main/mfo3_panel.user.js
// @downloadURL  https://raw.githubusercontent.com/Ropuch1/mfo3-dodatki/main/mfo3_panel.user.js
// ==/UserScript==

(function() {
    'use strict';

    const REPO_URL = 'https://raw.githubusercontent.com/Ropuch1/mfo3-dodatki/main';

    async function initPanel() {
        try {
            // Wymuszamy pobranie świeżego configu (bez cache)
            const response = await fetch(`${REPO_URL}/config.json?t=${Date.now()}`, {
                cache: "no-store",
                headers: { 'Cache-Control': 'no-cache', 'Pragma': 'no-cache' }
            });

            if (!response.ok) throw new Error('Nie można pobrać config.json');

            const lastMod = response.headers.get('last-modified');
            console.log(`%c[Panel Ropucha] Połączono. Ostatnia zmiana na GitHub: ${lastMod}`, "color: #f1c40f; font-weight: bold;");

            const config = await response.json();

            // Czekamy na załadowanie body, żeby wstawić panel
            if (document.readyState === 'loading') {
                await new Promise(resolve => document.addEventListener('DOMContentLoaded', resolve));
            }

            // Tworzenie UI Panelu
            const panel = document.createElement('div');
            panel.id = 'ropuch-dynamic-ui';
            panel.style.cssText = "position:fixed; top:60px; right:15px; z-index:10000; background:rgba(45,34,23,0.95); color:#e6d3a7; padding:12px; border:2px solid #7a5a3a; font-family:Verdana; font-size:11px; border-radius:8px; width:180px; box-shadow:0 0 15px black; pointer-events: auto;";
            panel.innerHTML = `
                <b style="color:#f1c40f; display:block; text-align:center; margin-bottom:8px; text-shadow: 1px 1px black;">MENU ROPUCHA</b>
                <div id="module-container"></div>
                <div style="font-size: 8px; text-align: center; margin-top: 10px; border-top: 1px solid #7a5a3a; padding-top: 5px; opacity: 0.7;">
                    Status: Połączono z GitHub<br>Zmień i kliknij F5
                </div>
            `;
            document.body.appendChild(panel);

            const container = document.getElementById('module-container');

            // Przetwarzanie modułów z config.json
            config.modules.forEach(mod => {
                const settingKey = 'mfo3_setting_' + mod.id;
                const isEnabled = localStorage.getItem(settingKey) === 'true';

                // Dodaj checkbox
                const label = document.createElement('label');
                label.style.cssText = "display:flex; align-items:center; margin-bottom:6px; cursor:pointer; user-select:none;";
                label.innerHTML = `<input type="checkbox" id="chk-${mod.id}" ${isEnabled ? 'checked' : ''} style="margin-right:8px;"> ${mod.name}`;
                container.appendChild(label);

                // Zapisywanie zmiany stanu
                document.getElementById('chk-' + mod.id).addEventListener('change', (e) => {
                    localStorage.setItem(settingKey, e.target.checked);
                    console.log(`[Panel] ${mod.id} -> ${e.target.checked}. Odśwież F5.`);
                });

                // JEŚLI WŁĄCZONY -> WSTRZYKNIJ SKRYPT
                if (isEnabled) {
                    const script = document.createElement('script');
                    // Cache-buster na końcu linku, żeby zawsze pobierać nową wersję wasd/leczenie
                    script.src = `${REPO_URL}/${mod.file}?t=${Date.now()}`;
                    script.type = 'text/javascript';
                    script.crossOrigin = "anonymous"; // Rozwiązuje problemy z uprawnieniami (CORS)
                    script.async = false; // Ładuj natychmiastowo
                    
                    (document.head || document.documentElement).appendChild(script);
                    
                    script.onload = () => console.log(`%c[Panel] Aktywowano moduł: ${mod.name}`, "color: #2ecc71; font-weight: bold;");
                    script.onerror = () => console.error(`[Panel] Błąd ładowania pliku: ${mod.file}`);
                }
            });

        } catch (err) {
            console.error('[Panel] Krytyczny błąd inicjalizacji:', err);
        }
    }

    // Uruchomienie
    initPanel();

})();
