const defaultData = [
      { map: "Scythe", name: "Lilith", category: "dzienne", pinned: true },
      { map: "Behemocia Gawra", name: "Behemoth", category: "dzienne", pinned: true },
      { map: "Otchłań Odkupienia", name: "Antyczna Maszyna/Rendels", category: "dzienne", pinned: true },
      { map: "Miasto Krasnoludów", name: "Lavos", category: "dzienne", pinned: true },
      { map: "Biały Las", name: "Nixxly", category: "dzienne", pinned: true },
      { map: "Błękitna Laguna", name: "Bogini Dnia i Nocy", category: "dzienne", pinned: true },
      { map: "Nadbrzeżna Jaskinia", name: "Zielony Jaszczur", category: "dzienne", pinned: true },
      { map: "Jaskinia Złego Oddechu", name: "Anakonda Olbrzymia", category: "dzienne", pinned: true },
      { map: "Jezioro Lewitujących Skał", name: "Wodny Żółw", category: "dzienne", pinned: true },
      { map: "Podmokła Grota: Poziom 2", name: "Garuda", category: "dzienne", pinned: true },
      { map: "Sekretna Piwniczka", name: "Monkenstein", category: "miniboss", pinned: false },
      { map: "Grota Szkieletów", name: "Smok Mroku", category: "dzienne", pinned: false },
      { map: "Jadowite Wzniesienia", name: "Trójgłowy Smok", category: "dzienne", pinned: false },
      { map: "Samotne Wzgórze", name: "Wywerna Pasiasta", category: "dzienne", pinned: false },
      { map: "Hawira Złoczyńców", name: "Gomez", category: "dzienne", pinned: false },
      { map: "Pustelnia Hermita", name: "Mięsożer", category: "miniboss", pinned: false },
      { map: "Podmokła Polana", name: "Ogr", category: "dzienne", pinned: false },
      { map: "Urocza Polana", name: "Skrzydlata Kobra", category: "dzienne", pinned: false },
      { map: "Diabelska Forteca: Przedsionek Piekła", name: "Diablos", category: "miniboss", pinned: false },
      { map: "Sosnowy Zagajnik", name: "Gryf", category: "miniboss", pinned: false },
      { map: "Lochy Urkaden: Poziom 2", name: "Szczurołak", category: "miniboss", pinned: false },
      { map: "Przeklęta Jaskinia", name: "Wampirzyca", category: "miniboss", pinned: false },
      { map: "Nawiedzone Cmentarzysko", name: "Nieumarły Kapłan", category: "miniboss", pinned: false },
      { map: "Grota Orków", name: "Ork Królewski", category: "miniboss", pinned: false },
      { map: "Podziemia Devos: Poziom 2", name: "Skrzydlaty Demon", category: "miniboss", pinned: false },
      { map: "Stara Kopalnia: Poziom 2", name: "Czarna Wdowa", category: "miniboss", pinned: false },
      { map: "Koralowe Rafy", name: "Kraken", category: "miniboss", pinned: false },
      { map: "Tunele Wargów", name: "Fenris", category: "miniboss", pinned: false },
      { map: "Mroźna Plątanina: Podziemia", name: "Kryształowy Gigant", category: "miniboss", pinned: false },
      { map: "Zamek Arktosa: Lodowa Ściana", name: "Arktos", category: "miniboss", pinned: false },
      { map: "Zgniły Lasek", name: "Malboro", category: "miniboss", pinned: false },
      { map: "Warsztat Czarnoksiężnika", name: "Mefit Żywiołów", category: "miniboss", pinned: false },
      { map: "Świątynia Teoyaomqui", name: "Nesu Lan Padu", category: "miniboss", pinned: false },
      { map: "Kłujący Wąwóz", name: "Mesmenir", category: "miniboss", pinned: false },
      { map: "Zapomniana Grota", name: "Mimic", category: "unikat", pinned: false },
      { map: "Wyklęta Świątynia: Komnata Zstąpienia", name: "Amaterasu", category: "inne", pinned: false },
      { map: "Równina Błyskawic", name: "Plazma Energetyczna", category: "unikat", pinned: false },
      { map: "Ustronny Zakątek", name: "Tonberry", category: "unikat", pinned: false },
      { map: "Stara Kopalnia: Poziom 1", name: "Diabelski Pomiot", category: "unikat", pinned: false },
      { map: "Lodowe Zamczysko: Wschodnia Komnata", name: "Shakti", category: "unikat", pinned: false },
      { map: "Preludium Ciemności", name: "Tanatos", category: "unikat", pinned: false },
      { map: "Jurajski Zakątek", name: "Protoceratops", category: "unikat", pinned: false },
      { map: "Pustynna Grota", name: "Banshee", category: "unikat", pinned: false },
      { map: "Szczere Pole", name: "Rój Termitów", category: "unikat", pinned: false }
    ];

    let config = [];
    try {
        const saved = localStorage.getItem('mfo3_portal_config_v10') || localStorage.getItem('mfo3_portal_config_v9');
        if (saved) {
            const parsed = JSON.parse(saved);
            if (Array.isArray(parsed)) {
                config = parsed.map(item => ({
                    map: item.map || '',
                    name: item.name || '',
                    // Zmiana: wymuszamy aby kategoria była tablicą (konwersja starych danych)
                    category: Array.isArray(item.category) ? item.category : [item.category || 'inne'],
                    pinned: item.pinned !== undefined ? !!item.pinned : true
                }));
            } else {
                config = Object.keys(parsed).map(k => ({
                    map: k,
                    name: parsed[k].name || '',
                    category: Array.isArray(parsed[k].category) ? parsed[k].category : [parsed[k].category || 'inne'],
                    pinned: parsed[k].pinned !== undefined ? !!parsed[k].pinned : true
                }));
            }
        } else {
            // Mapujemy domyślne dane, aby format String zmienić na Array
            config = defaultData.map(item => ({ ...item, category: [item.category] }));
        }
    } catch(e) {
        config = defaultData.map(item => ({ ...item, category: [item.category] }));
    }

    let hideCopyBtn = localStorage.getItem('mfo3_portal_hide_copy') === 'true';
    let currentFilter = localStorage.getItem('mfo3_portal_filter_v9') || 'all';

    function saveConfig() {
        localStorage.setItem('mfo3_portal_config_v10', JSON.stringify(config));
        localStorage.setItem('mfo3_portal_hide_copy', hideCopyBtn);
    }

    function showToast(msg) {
        let toast = document.getElementById("mfo3-copy-toast");
        if (!toast) {
            toast = document.createElement("div");
            toast.id = "mfo3-copy-toast";
            toast.style.cssText = "position:fixed; bottom:20px; right:20px; background:#222; color:#fff; padding:8px 14px; border-radius:6px; font-size:12px; z-index:999999; box-shadow:0 2px 10px rgba(0,0,0,0.5); font-family:sans-serif; transition:opacity 0.3s; border:1px solid #777;";
            document.body.appendChild(toast);
        }
        toast.textContent = msg;
        toast.style.opacity = "1";
        setTimeout(() => { toast.style.opacity = "0"; }, 1500);
    }

    const style = document.createElement('style');
    style.textContent = `
        #portal-controls-wrapper { display: flex; justify-content: center; align-items: center; gap: 8px; margin-bottom: 10px; user-select: none; }
        #portal-pool-select { padding: 4px 8px; font-size: 12px; font-weight: bold; border-radius: 4px; border: 1px solid #888; background: #fff; color: #000; cursor: pointer; }
        #portal-cfg-btn { padding: 4px 8px; font-size: 12px; font-weight: bold; border-radius: 4px; border: 1px solid #666; background: #e0e0e0; color: #000; cursor: pointer; }
        #portal-modal-bg { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.6); z-index: 99999; display: flex; justify-content: center; align-items: center; user-select: none; }
        #portal-modal { background: #f4f4f4; border: 2px solid #333; border-radius: 8px; width: 750px; max-height: 80vh; padding: 15px; display: flex; flex-direction: column; color: #000; font-family: sans-serif; box-shadow: 0 4px 20px rgba(0,0,0,0.5); }
        .cfg-row { display: flex; gap: 6px; margin-bottom: 8px; align-items: center; border-bottom: 1px solid #ddd; padding-bottom: 5px; }
        .cfg-row input[type="text"] { padding: 4px; border: 1px solid #ccc; border-radius: 3px; font-size: 12px; user-select: text; }
        .cfg-btn-move { width: 22px; height: 24px; padding: 0; font-size: 10px; cursor: pointer; border: 1px solid #aaa; background: #fff; border-radius: 3px; font-weight: bold; }
        .cfg-cat-group { display: flex; flex-wrap: wrap; gap: 4px; font-size: 11px; width: 230px; }
        .cfg-cat-group label { display: flex; align-items: center; gap: 2px; cursor: pointer; }
        .PortalDialog table.WUI_Table.data-table, .PortalDialog table.WUI_Table.data-table * { user-select: none !important; }

        .PortalDialog table.WUI_Table.data-table td.state {
            width: 24px !important; min-width: 24px !important; max-width: 24px !important;
            text-align: left !important; vertical-align: middle !important; padding: 0 !important;
        }
        .PortalDialog table.WUI_Table.data-table td.state div.infinite { display: inline-block !important; margin: 5px !important; vertical-align: middle !important; }
        .PortalDialog table.WUI_Table.data-table tr.root[data-pinned="false"], .PortalDialog table.WUI_Table.data-table tr.normal[data-pinned="false"] {
            background-color: rgb(248, 227, 182) !important;
        }
        .PortalDialog table.WUI_Table.data-table tr.root[data-pinned="false"] { box-shadow: inset 3px 0 0 0 #ff0000 !important; }
        .PortalDialog table.WUI_Table.data-table tr[data-pinned="true"] { background-color: rgb(246, 240, 206) !important; }
        .PortalDialog table.WUI_Table.data-table tr[data-pinned="true"] td.state div.infinite,
        .PortalDialog table.WUI_Table.data-table tr[data-pinned="true"] td.state div.single,
        .PortalDialog table.WUI_Table.data-table tr[data-pinned="true"] td.name span,
        .PortalDialog table.WUI_Table.data-table tr[data-pinned="true"] td.name small { position: static !important; }
        .PortalDialog table.WUI_Table.data-table td.state div.single { display: inline-block !important; margin: 5px !important; vertical-align: middle !important; }
        .PortalDialog table.WUI_Table.data-table td.name { vertical-align: middle !important; }

        .mfo3-copy-btn {
            display: inline-flex; align-items: center; justify-content: center; margin-left: 8px; padding: 1px 5px; font-size: 10px; font-family: Tahoma, Geneva, sans-serif; font-weight: bold; cursor: pointer;
            border: 1px solid #734a1d; background: linear-gradient(to bottom, #ffe89e 0%, #e6aa43 50%, #cc8110 100%); border-radius: 3px; color: #3b1e00; box-shadow: inset 0 1px 0 rgba(255,255,255,0.6), 0 1px 2px rgba(0,0,0,0.2); vertical-align: middle; text-shadow: 0 1px 0 rgba(255,255,255,0.4); white-space: nowrap;
        }
        .mfo3-copy-btn:hover { background: linear-gradient(to bottom, #fff2c4 0%, #f0be5d 50%, #e0941f 100%); border-color: #523310; color: #000; }
        .mfo3-copy-btn:active { background: linear-gradient(to bottom, #cc8110 0%, #e6aa43 100%); box-shadow: inset 0 1px 2px rgba(0,0,0,0.4); }
    `;
    document.documentElement.appendChild(style);

    function openConfigModal() {
        if (document.getElementById("portal-modal-bg")) return;
        const bg = document.createElement("div");
        bg.id = "portal-modal-bg";
        bg.innerHTML = `
            <div id="portal-modal">
                <h3 style="margin-top:0; margin-bottom:10px; text-align:center;">Konfiguracja i Kolejność Portali</h3>
                <div style="display:flex; justify-content:space-between; align-items:center; background:#e9e9e9; padding:8px; border-radius:4px; margin-bottom:10px; border:1px solid #ddd;">
                    <label style="font-size:12px; font-weight:bold; cursor:pointer; display:flex; align-items:center; gap:6px;">
                        <input type="checkbox" id="cfg-hide-copy" ${hideCopyBtn ? 'checked' : ''}> Ukryj przycisk "Kopiuj" w tabeli
                    </label>
                </div>
                <div style="display:flex; font-weight:bold; font-size:11px; margin-bottom:5px; text-align:left; gap:6px; align-items:center;">
                    <div style="width:48px; text-align:center;">Poz.</div>
                    <div style="flex:1">Oryginalna Mapa</div>
                    <div style="flex:1">Moja Nazwa</div>
                    <div style="width:230px">Tagi / Kategorie</div>
                    <div style="width:55px; text-align:center;">Przypnij</div>
                    <div style="width:30px"></div>
                </div>
                <div id="cfg-list" style="overflow-y:auto; flex:1; max-height:400px; padding-right:5px;"></div>
                <div style="margin-top:10px; display:flex; gap:8px;">
                    <button id="cfg-add" style="flex:1; padding:6px; background:#d4edda; border:1px solid #c3e6cb; border-radius:4px; cursor:pointer; font-weight:bold; color:#155724;">+ Dodaj mapę</button>
                    <button id="cfg-save" style="flex:1; padding:6px; background:#cce5ff; border:1px solid #b8daff; border-radius:4px; cursor:pointer; font-weight:bold; color:#004085;">Zapisz (Wymaga odświeżenia tabeli)</button>
                </div>
            </div>
        `;
        document.body.appendChild(bg);

        const list = bg.querySelector("#cfg-list");
        
        // Zmiana: argument kategoria domyślnie jest tablicą
        function createRow(map = "", name = "", category = ["inne"], pinned = true) {
            const row = document.createElement("div");
            row.className = "cfg-row";
            // Checkboxy generowane dynamicznie w oparciu o przekazaną tablicę category
            row.innerHTML = `
                <div style="display:flex; gap:2px; width:48px;">
                    <button class="cfg-btn-move c-up" title="Przesuń w górę">▲</button><button class="cfg-btn-move c-down" title="Przesuń w dół">▼</button>
                </div>
                <input type="text" class="c-map" value="${map}" placeholder="Mapa w MFO3" style="flex:1">
                <input type="text" class="c-name" value="${name}" placeholder="Własna nazwa" style="flex:1">
                <div class="cfg-cat-group">
                    <label><input type="checkbox" class="c-cat" value="dzienne" ${category.includes('dzienne') ? 'checked' : ''}> Dzienne</label>
                    <label><input type="checkbox" class="c-cat" value="miniboss" ${category.includes('miniboss') ? 'checked' : ''}> Miniboss</label>
                    <label><input type="checkbox" class="c-cat" value="unikat" ${category.includes('unikat') ? 'checked' : ''}> Unikat</label>
                    <label><input type="checkbox" class="c-cat" value="miasta" ${category.includes('miasta') ? 'checked' : ''}> Miasta</label>
                    <label><input type="checkbox" class="c-cat" value="inne" ${category.includes('inne') ? 'checked' : ''}> Inne</label>
                </div>
                <div style="width:55px; display:flex; justify-content:center; align-items:center;">
                    <input type="checkbox" class="c-pinned" ${pinned ? 'checked' : ''} title="Przypnij">
                </div>
                <button class="c-del" style="color:red; font-weight:bold; cursor:pointer; width:30px; border:1px solid #ccc; background:#fff; height:24px;">X</button>
            `;
            row.querySelector(".c-up").onclick = () => { if (row.previousElementSibling) list.insertBefore(row, row.previousElementSibling); };
            row.querySelector(".c-down").onclick = () => { if (row.nextElementSibling) list.insertBefore(row.nextElementSibling, row); };
            row.querySelector(".c-del").onclick = () => row.remove();
            return row;
        }

        config.forEach(item => list.appendChild(createRow(item.map, item.name, item.category, item.pinned !== false)));
        bg.querySelector("#cfg-add").onclick = () => list.appendChild(createRow("", "", ["inne"], true));

        bg.querySelector("#cfg-save").onclick = () => {
            hideCopyBtn = bg.querySelector("#cfg-hide-copy").checked;
            const newConfig = [];
            list.querySelectorAll(".cfg-row").forEach(r => {
                const map = r.querySelector(".c-map").value.trim();
                const name = r.querySelector(".c-name").value.trim();
                
                // Zmiana: zbieramy wszystkie zaznaczone checkboxy
                const checkboxes = r.querySelectorAll(".c-cat:checked");
                let categories = Array.from(checkboxes).map(cb => cb.value);
                if (categories.length === 0) categories = ["inne"]; // Domyślnie jak nic nie zaznaczono
                
                const pinned = r.querySelector(".c-pinned").checked;
                if (map) newConfig.push({ map, name, category: categories, pinned });
            });
            config = newConfig;
            saveConfig();
            bg.remove();

            const table = document.querySelector(".PortalDialog table.WUI_Table.data-table");
            if (table) {
                const rows = table.querySelectorAll("tr");
                rows.forEach(r => { delete r.dataset.mfo3Processed; });
            }
        };
    }

    function getConfigForMap(rawMapName) {
        if (!rawMapName) return { item: { map: "", name: "", category: ["inne"], pinned: false }, index: 9999 };
        const clean = rawMapName.toLowerCase().trim();
        for (let i = 0; i < config.length; i++) {
            const item = config[i];
            const mapClean = item.map.toLowerCase().trim();
            if (clean === mapClean) {
                return { item, index: i };
            }
        }
        return { item: { map: rawMapName, name: "", category: ["inne"], pinned: false }, index: 9999 };
    }

    function processPortalTable(table) {
        const tbody = table.querySelector("tbody") || table;

        let controls = document.getElementById('portal-controls-wrapper');
        if (!controls) {
            controls = document.createElement("div");
            controls.id = "portal-controls-wrapper";
            controls.innerHTML = `
                <label style="font-weight:bold; font-size:12px;">Widoczna pula:</label>
                <select id="portal-pool-select">
                    <option value="all" ${currentFilter === 'all' ? 'selected' : ''}>Wszystko</option>
                    <option value="dzienne" ${currentFilter === 'dzienne' ? 'selected' : ''}>Dzienne</option>
                    <option value="miniboss" ${currentFilter === 'miniboss' ? 'selected' : ''}>Minibossy</option>
                    <option value="unikat" ${currentFilter === 'unikat' ? 'selected' : ''}>Unikaty</option>
                    <option value="miasta" ${currentFilter === 'miasta' ? 'selected' : ''}>Miasta</option>
                    <option value="inne" ${currentFilter === 'inne' ? 'selected' : ''}>Inne</option>
                </select>
                <button id="portal-cfg-btn">⚙️ Konfiguracja</button>
            `;
            table.parentNode.insertBefore(controls, table);

            controls.querySelector('#portal-pool-select').onchange = (e) => {
                currentFilter = e.target.value;
                localStorage.setItem('mfo3_portal_filter_v9', currentFilter);
                processPortalTable(table);
            };
            controls.querySelector('#portal-cfg-btn').onclick = openConfigModal;
        }

        const allRows = Array.from(tbody.querySelectorAll("tr"));
        const dataRows = allRows.filter(r => !r.querySelector("th") && !r.classList.contains("header"));

        dataRows.forEach((row, idx) => {
            if (row.dataset.originalIndex === undefined) row.dataset.originalIndex = idx;

            const nameCell = row.querySelector("td.name") || row.children[1];
            if (!nameCell) return;

            if (!row.dataset.originalName) {
                let text = nameCell.textContent.trim().split('\n')[0].trim();
                text = text.replace(/\s*\(.*\)$/, '').replace(/Kopiuj/g, '').trim();
                row.dataset.originalName = text;
            }

            const rawName = row.dataset.originalName;
            const { item: mapCfg, index } = getConfigForMap(rawName);
            const isPinned = mapCfg.pinned !== false && mapCfg.pinned !== undefined;

            row.dataset.category = mapCfg.category.join(','); // Zamieniamy tablicę w string na potrzeby dataset
            row.dataset.pinned = isPinned ? "true" : "false";
            row.dataset.sortIndex = isPinned ? index : 9999;

            // Zmiana logiczna filtra: używamy .includes zamiast ===
            const shouldShow = currentFilter === 'all' || mapCfg.category.includes(currentFilter);
            
            if (row.style.display !== (shouldShow ? "" : "none")) {
                row.style.display = shouldShow ? "" : "none";
            }

            if (row.dataset.mfo3Processed !== "true" || hideCopyBtn !== (row.dataset.mfo3HideCopy === "true")) {
                nameCell.style.setProperty('text-align', 'left', 'important');
                nameCell.style.setProperty('padding-left', '0px', 'important');

                const customName = mapCfg.name ? mapCfg.name.trim() : "";
                const textToCopy = customName || rawName;
                let nameHtml = "";

                if (customName && customName.toLowerCase() !== rawName.toLowerCase()) {
                    nameHtml = `<span>${customName}</span> <small style="font-weight:normal; color:#777;">(${rawName})</small>`;
                } else {
                    nameHtml = `<span>${rawName}</span>`;
                }

                const copyBtnHtml = hideCopyBtn ? '' : `<button class="mfo3-copy-btn" title="Kliknij, aby skopiować">Kopiuj</button>`;

                nameCell.innerHTML = `${nameHtml}${copyBtnHtml}`;

                if (!hideCopyBtn) {
                    const btn = nameCell.querySelector(".mfo3-copy-btn");
                    if (btn) {
                        btn.onclick = (e) => {
                            e.stopPropagation(); e.preventDefault();
                            navigator.clipboard.writeText(textToCopy).then(() => { showToast(`Skopiowano: "${textToCopy}"`); });
                        };
                    }
                }

                row.dataset.mfo3Processed = "true";
                row.dataset.mfo3HideCopy = hideCopyBtn ? "true" : "false";
            }
        });

        let sepHeader = tbody.querySelector("#top-header-clone");
        if (!sepHeader) {
            sepHeader = document.createElement("tr");
            sepHeader.className = "header";
            sepHeader.id = "top-header-clone";
            sepHeader.innerHTML = `
                <th width="24" class="state"></th><th width="200" class="name"></th><th width="80" class="cost"></th><th width="100" class="go"></th>
            `;
        }

        const pinnedRows = dataRows.filter(r => r.dataset.pinned === "true").sort((a, b) => parseInt(a.dataset.sortIndex, 10) - parseInt(b.dataset.sortIndex, 10));
        const unpinnedRows = dataRows.filter(r => r.dataset.pinned !== "true").sort((a, b) => parseInt(a.dataset.originalIndex, 10) - parseInt(b.dataset.originalIndex, 10));

        const expectedOrder = [];
        const origHeader = tbody.querySelector("tr.header:not(#top-header-clone)");
        if (origHeader) expectedOrder.push(origHeader);

        expectedOrder.push(...pinnedRows);

        if (unpinnedRows.length > 0) {
            expectedOrder.push(sepHeader);
            expectedOrder.push(...unpinnedRows);
        }

        let currentNodes = Array.from(tbody.children);
        for (let i = 0; i < expectedOrder.length; i++) {
            if (currentNodes[i] !== expectedOrder[i]) {
                tbody.insertBefore(expectedOrder[i], currentNodes[i] || null);
                currentNodes = Array.from(tbody.children);
            }
        }
    }

    let observer;
    function startObserver() {
        if (!observer) {
            observer = new MutationObserver(() => {
                const table = document.querySelector(".PortalDialog table.WUI_Table.data-table");
                if (table) {
                    observer.disconnect();
                    processPortalTable(table);
                    observer.observe(document.body, { childList: true, subtree: true });
                }
            });
        }
        observer.observe(document.body, { childList: true, subtree: true });
    }

    if (document.body) {
        startObserver();
    } else {
        window.addEventListener('DOMContentLoaded', startObserver);
    }
