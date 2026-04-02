(function() {
    'use strict';

    async function toggleMonsters() {
        let dialog = document.querySelector('.MapConfigEditor');
        if (!dialog) {
            const configBtn = document.querySelector('.icon-settings, [title*="Konfiguracja"]');
            if (configBtn) {
                configBtn.click();
                // Bardzo szybkie otwarcie: 180-250ms
                await new Promise(r => setTimeout(r, 180 + Math.random() * 70));
                dialog = document.querySelector('.MapConfigEditor');
            }
        }

        if (dialog) {
            const rows = document.querySelectorAll('.ConfigValue');
            let monsterSelect = null;

            for (let row of rows) {
                if (row.innerText.includes('Widoczne potwory')) {
                    monsterSelect = row.querySelector('select');
                    break;
                }
            }

            if (monsterSelect) {
                monsterSelect.value = (monsterSelect.value === "1") ? "0" : "1";
                monsterSelect.dispatchEvent(new Event('change', { bubbles: true }));

                const allButtons = document.querySelectorAll('.button-orange, .WUI_FancyButton');
                let saveBtn = Array.from(allButtons).find(el => el.innerText.includes('Zapisz'));

                if (!saveBtn) {
                    saveBtn = document.querySelector('a[id*="content_save"]');
                }

                if (saveBtn) {
                    // Czekamy tylko 70-120ms przed zapisem (żeby gra "załapała" selecta)
                    setTimeout(() => {
                        saveBtn.click();

                        // Zamykanie X niemal natychmiast: 50-100ms po zapisie
                        setTimeout(() => {
                            const closeBtn = document.querySelector('.dialog-close') ||
                                           document.querySelector('.WUI_Window .close');
                            if (closeBtn) closeBtn.click();
                        }, 50 + Math.random() * 50);

                    }, 70 + Math.random() * 50);
                }
            }
        }
    }

    window.addEventListener('keydown', function(e) {
        if (["INPUT", "TEXTAREA"].includes(document.activeElement.tagName)) return;
        if (e.key.toLowerCase() === 'v') {
            e.preventDefault();
            toggleMonsters();
        }
    }, true);
})();
