(function() {
    'use strict';

    GM_addStyle(`
        /* Tło dla wybranych Bossów */
        .WUI_Table.data-table tr {
            background-color: #f8e3b6 !important;
        }

        /* Tło dla pozostałych wierszy ROOT (miasta) */
        .WUI_Table.data-table tr.root.odd:not(.boss-row):not(#boss-root) {
            background-color: #f6f0ce !important;
        }
        .WUI_Table.data-table tr.root.even:not(.boss-row):not(#boss-root) {
            background-color: #f6f0ce !important;
        }

        /* Styl okna edycji */
        #boss-editor-window {
            position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
            background: #eee; border: 3px solid #444; padding: 20px; z-index: 10001;
            color: #000; font-family: sans-serif; box-shadow: 0 0 15px rgba(0,0,0,0.5);
            min-width: 450px; border-radius: 8px;
        }
        .boss-edit-row { display: flex; gap: 5px; margin-bottom: 5px; align-items: center; }
        .boss-edit-row input { padding: 4px; border: 1px solid #ccc; flex: 1; }
        .boss-edit-row button { cursor: pointer; padding: 4px 8px; }
        .boss-footer { margin-top: 15px; display: flex; gap: 10px; flex-wrap: wrap; }
        .btn-main { padding: 8px; flex: 1; cursor: pointer; font-weight: bold; }

        /* Styl dla nowych przycisków */
        .btn-sub { padding: 4px; flex: 1; cursor: pointer; font-size: 11px; }
    `);

    const defaultData = [
        { map: "Błękitna Laguna", name: "Bogini" },
        { map: "Miasto Krasnoludów", name: "Lavos" },
        { map: "Biały Las", name: "Nixxly" },
        { map: "Nadbrzeżna Jaskinia", name: "Jaszczur" },
        { map: "Jezioro Lewitujących Skał", name: "Żółw" },
        { map: "Podmokła Grota: Poziom 2", name: "Garuda" }
    ];

    function getBosses() { return GM_getValue("boss_config_v4", defaultData); }

    function openEditor() {
        if (document.getElementById("boss-editor-window")) return;
        const win = document.createElement("div");
        win.id = "boss-editor-window";
        document.body.appendChild(win);

        const render = () => {
            const list = getBosses();
            win.innerHTML = `<h3 style="margin-top:0">Konfiguracja Bossów</h3>
                             <div style="display:flex; font-weight:bold; margin-bottom:5px; font-size:12px;">
                                <div style="flex:1">Nazwa Mapy</div>
                                <div style="flex:1">Nazwa Bossa</div>
                                <div style="width:100px">Kolejność</div>
                             </div>
                             <div id="boss-list-container" style="max-height:300px; overflow-y:auto;"></div>`;

            const container = win.querySelector("#boss-list-container");
            list.forEach((item, i) => {
                const row = document.createElement("div");
                row.className = "boss-edit-row";
                row.innerHTML = `
                    <input type="text" class="m-in" value="${item.map}">
                    <input type="text" class="n-in" value="${item.name}">
                    <button class="b-up">↑</button>
                    <button class="b-down">↓</button>
                    <button class="b-del" style="color:red">X</button>
                `;
                row.querySelector(".b-up").onclick = () => { if(i>0) { [list[i], list[i-1]] = [list[i-1], list[i]]; save(list); } };
                row.querySelector(".b-down").onclick = () => { if(i<list.length-1) { [list[i], list[i+1]] = [list[i+1], list[i]]; save(list); } };
                row.querySelector(".b-del").onclick = () => { list.splice(i, 1); save(list); };
                row.querySelectorAll("input").forEach(inp => {
                    inp.onchange = () => {
                        list[i] = { map: row.querySelector(".m-in").value, name: row.querySelector(".n-in").value };
                        GM_setValue("boss_config_v4", list);
                    };
                });
                container.appendChild(row);
            });

            const footer = document.createElement("div");
            footer.className = "boss-footer";
            footer.innerHTML = `
                <button class="btn-main" id="b-add" style="background:#d4edda"> + Dodaj </button>
                <button class="btn-main" id="b-save" style="background:#cce5ff"> Zastosuj (F5) </button>
                <button class="btn-main" id="b-cancel"> Anuluj </button>
                <div style="width:100%; display:flex; gap:5px; margin-top:5px;">
                    <button class="btn-sub" id="b-export">Eksportuj Plik</button>
                    <button class="btn-sub" id="b-import">Importuj Plik</button>
                    <input type="file" id="file-input" style="display:none" accept=".json">
                </div>
            `;
            win.appendChild(footer);

            win.querySelector("#b-add").onclick = () => { list.push({map:"", name:""}); save(list); };
            win.querySelector("#b-save").onclick = () => location.reload();
            win.querySelector("#b-cancel").onclick = () => win.remove();

            // Logika Eksportu
            win.querySelector("#b-export").onclick = () => {
                const dataStr = JSON.stringify(getBosses(), null, 2);
                const blob = new Blob([dataStr], {type: "application/json"});
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = 'bossy_mfo3.json';
                link.click();
            };

            // Logika Importu
            const fileInput = win.querySelector("#file-input");
            win.querySelector("#b-import").onclick = () => fileInput.click();
            fileInput.onchange = (e) => {
                const file = e.target.files[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = (event) => {
                    try {
                        const importedData = JSON.parse(event.target.result);
                        if (Array.isArray(importedData)) {
                            GM_setValue("boss_config_v4", importedData);
                            render();
                        } else { alert("Błędny format pliku!"); }
                    } catch (err) { alert("Błąd odczytu pliku!"); }
                };
                reader.readAsText(file);
            };
        };

        const save = (newList) => { GM_setValue("boss_config_v4", newList); render(); };
        render();
    }

    function processPortal(table) {
        const bosses = getBosses();
        const mapToName = {};
        bosses.forEach(b => { if(b.map) mapToName[b.map] = b.name; });

        // 1. SKLONUJ nagłówek (header) na samą górę, jeśli go tam nie ma
        let existingHeader = table.querySelector("tr.header");
        let topHeader = table.querySelector("#top-header-clone");

        if (existingHeader && !topHeader) {
            topHeader = existingHeader.cloneNode(true);
            topHeader.id = "top-header-clone";
            table.prepend(topHeader);
        }

        // 2. Dodaj lub znajdź wiersz "Bossy" (zawsze pod sklonowanym headerem)
        let bossRoot = table.querySelector("#boss-root");
        if (!bossRoot) {
            bossRoot = document.createElement("tr");
            bossRoot.id = "boss-root";
            bossRoot.className = "root odd";
            bossRoot.innerHTML = `<td class="state"></td><td class="name"><b>Bossy</b> <button id="boss-cfg-btn" style="cursor:pointer; font-size:10px; margin-left:5px;">⚙️</button></td><td colspan="2"></td>`;

            if (topHeader) topHeader.after(bossRoot);
            else table.prepend(bossRoot);

            bossRoot.querySelector("#boss-cfg-btn").onclick = (e) => { e.stopPropagation(); openEditor(); };
        }

        // 3. Rozpoznaj wiersze bossów
        const rows = {};
        table.querySelectorAll("tr").forEach(row => {
            if (row.id === "boss-root" || row.classList.contains("header") || row.id === "top-header-clone") return;
            const span = row.querySelector(".name span");
            if (!span) return;

            const mapName = span.innerText.trim();
            if (mapName in mapToName) {
                span.innerText = mapToName[mapName];
                row.classList.add("boss-row");
                rows[mapToName[mapName]] = row;
            }
        });

        // 4. Ustaw bossów pod wierszem "Bossy"
        let last = bossRoot;
        bosses.forEach(b => {
            if (rows[b.name]) {
                last.after(rows[b.name]);
                last = rows[b.name];
            }
        });

        // 5. Upewnij się, że ORYGINALNY nagłówek jest zawsze pod ostatnim bossem
        if (existingHeader && existingHeader !== topHeader) {
            last.after(existingHeader);
        }
    }

    const observer = new MutationObserver(() => {
        const table = document.querySelector(".PortalDialog table.WUI_Table.data-table");
        if (table) processPortal(table);
    });
    observer.observe(document.body, { childList: true, subtree: true });

})();
