(function() {
    'use strict';

    const zombieItemsList = [
        "różdżka zjawy", "miecz mroku", "różdżka mroku", "pancerz mroku", "amulet mroku", 
        "hełm mroku", "buty mroku", "peleryna pogromcy wilków", "magiczny krzyżyk", 
        "ogrzy wisiorek", "pierścień odporności", "kościana różdżka", "wampirzy diadem", 
        "żółwi hełm", "wampirza szata", "kościany pierścień", "czepek garudy", 
        "kapelusz gothar", "przegniły wisior", "maska odporności", "górniczy pas", 
        "astralny diadem", "zbroja oświeconych", "koralowe buty", "krasnoludzkie spinki", 
        "włócznia eskimosa", "kapelusz arktosa", "kryształowa zbroja", "klasztorne buty", 
        "pierścień many", "kowbojskie spinki", "złowrogie buty", "potworny hełm", 
        "prehistoryczne pazury", "topór izanami", "prehistoryczne buty", "bransoleta łowcy", 
        "czapka błazna", "kapelusz zaklinacza", "prymitywny płaszcz", "bagienne buty", 
        "bagienny wisior", "pierścień stabilizacji"
    ];

    const zatrucieItemsList = [
        "skórzany wisiorek", "zbroja kajana", "wężowe buty", "wężowa kurtka", "wężowa bransoleta",
        "wężowy kaptur", "pasiasta bransoleta", "pasiasty hełm", "banicki płaszcz", "ochronny fartuch",
        "amulet pomyślności", "pierścień odporności", "wampirzy diadem", "widmowa maska", "zbroja szczurołaka",
        "wampirze buty", "czepek garudy", "kaptur kapłana", "pancerz orka", "przegniłe kalosze",
        "kilof kalvadora", "perłowe spinki", "jaszczurza maska", "zbroja olbrzyma", "muszelkowa różdżka",
        "mythrilowa różdżka", "pajęczy hełm", "koralowa zbroja", "astralny pierścień", "pierścień oświeconych",
        "buty niebieskiego smoka", "krasnoludzki amulet", "polarne buty", "kobaltowy wisiorek", "różdżka arktosa",
        "kryształowy topór", "klasztorny kaptur", "wilcza zbroja", "amulet nietykalności", "naszyjnik z kłów bestii",
        "wilczy wisiorek", "broszka farmera", "różdżka równowagi", "zatruty sztylet", "buława celności",
        "potworny hełm", "potworna zbroja", "złowroga szata", "kowbojskie spinki", "prehistoryczna maska",
        "księżycowy topór", "hełm potępionych", "szata zaklinacza", "toksyczny naszyjnik", "wisior potępionych"
    ];

    const uspienieItemsList = [
        "amulet czujności", "peleryna nimfy", "pasiasty pancerz", "goblinowy hełm", "banicki kapelusz",
        "pierścień kontroli", "ochronny czepek", "ogrza zbroja", "pierścień odporności", "wampirza szata",
        "kościane buty", "kapelusz gothar", "trzewiki garudy", "przegniły kapelusz", "koszmarna zbroja",
        "górniczy pas", "harpia zbroja", "astralne trzewiki", "mythrilowe buty", "harpi wisiorek",
        "krasnoludzki pierścień", "magmowa zbroja", "laska eskimosa", "kobaltowy wisiorek", "kapelusz arktosa",
        "maska udręki", "klasztorny wisiorek", "kryształowy wisiorek", "potworny hełm", "złowrogie buty",
        "kamienny hełm", "prehistoryczne buty", "bransoleta łowcy", "kunsztowny wisior", "baśniowa zbroja",
        "bagienny wisior", "wisior potępionych"
    ];

    const slepotaItemsList = [
        "magiczna broszka", "pancerz mroku", "tygrysia maska", "płomienna zbroja", "bojowy pierścień",
        "rękawice magii ognia", "ogrze buty", "okulary", "widmowe chodaki", "żółwie buty",
        "pancerz garudy", "bransoleta garudy", "przegniły kapelusz", "błękitna buława", "koszmarne rękawice",
        "perłowy pierścień", "rozpraszający miecz", "różdżka paralizacji", "górniczy pas", "pajęcza buława",
        "hełm walkirii", "czarcie buty", "pajęcze buty", "wyklęte japonki", "krasnoludzki pierścień",
        "magmowy wisiorek", "kobaltowy wisiorek", "miecz arktosa", "włócznia turniejowa", "kryształowy hełm",
        "wilczy hełm", "buty arktosa", "klasztorny wisiorek", "pas uników", "buty opuszczonych",
        "kalosze farmera", "kowbojski sygnet", "potworne rękawice", "wszechstronne rękawice", "topór izanami",
        "bransoleta łowcy", "kunsztowna kokardka", "kunsztowne buty", "cierniowy hełm", "zbroja potępionych",
        "prymitywne buty", "baśniowy amulet", "bransolety uników", "wisior potępionych", "bagienny hełm"
    ];

    const spowolnienieItemsList = [
        "buty kajana", "goblinowa zbroja", "goblinowe buty", "goblinowy pas", "goblinowy hełm",
        "bandycka peleryna", "banicki pas", "pierścień odporności", "żółwia różdżka", "żółwi pancerz",
        "wampirzy pierścień", "różdżka gothar", "pierścień gothar", "przegniły wisior", "rękawice pośpiechu",
        "różdżka pośpiechu", "astralna szata", "astralne trzewiki", "buty oświeconych", "wyklęte japonki",
        "krzyż zwycięzcy", "krasnoludzki wisiorek", "buława paniki", "polarny kaptur", "polarny pierścień",
        "włócznia eskimosa", "kobaltowy wisiorek", "buty żniwiarza", "buty z głębin", "niebieska szata",
        "peleryna arktosa", "wilcza zbroja", "buty berserkera", "wilcze buty", "amulet zorzy",
        "klasztorny wisiorek", "włócznia uników", "kowbojska broszka", "potworny pas", "złowrogi pierścień",
        "kamienna zbroja", "różdżka izanagi", "prehistoryczne kolczyki", "kunsztowne buty", "różdżka potępionych",
        "różdżka zaklinacza", "buława pośpiechu", "szata zaklinacza", "bagienne buty", "buty turniejowe"
    ];

    const skamienienieItemsList = [
        "tygrysi płaszcz", "jastrzębie piórko", "gryfi pierścień", "pierścień odporności", "żółwi pierścień",
        "sandały kapłana", "pierścień gothar", "antracytowa różdżka", "perłowe korale", "górnicze rękawice",
        "astralna szata", "krasnoludzki sygnet", "buty z głębin", "pierścień z głębin", "pierścień shivy",
        "klasztorne buty", "kaptur adepta", "kowbojski pas", "kunsztowna kokardka", "baśniowy hełm",
        "zielona toga", "buty potępionych", "bagienny wisior"
    ];

    const pomylenieItemsList = [
        "hełm kajana", "amulet mroku", "peleryna nimfy", "tygrysie buty", "jastrzębie piórko",
        "płomienny amulet", "pierścień kontroli", "okrągły hełm", "skrzydlaty hełm", "ogrze buty",
        "pierścień odporności", "żółwi hełm", "brązowa szata", "szpony garudy", "pierścień gothar",
        "przegniły kapelusz", "maska odporności", "koszmarne buty", "astralny diadem", "diadem oświeconych",
        "czarcia bransoleta", "polarne buty", "laska eskimosa", "laska żniwiarza", "hełm zorzy",
        "naszyjnik z kłów bestii", "pierścień arktosa", "złowręga maska", "złowroga maska", "kowbojski pas",
        "złowrogi pierścień", "cierniowe buty", "kunsztowna zbroja", "buty potępionych", "buty turniejowe",
        "pierścień zaklinacza"
    ];

    const paralizItemsList = [
        "bandycki pierścień", "okrągła zbroja", "pierścień odporności", "widmowy płaszcz", "buty szczurołaka",
        "widmowy amulet", "różdżka gothar", "buty orka", "bransoleta garudy", "przegniły płaszcz",
        "koszmarna bransoleta", "perłowa broszka", "astralna szata", "koralowe buty", "wyklęte japonki",
        "czarcia bransoleta", "harpi wisiorek", "magmowy hełm", "magmowe buty", "zbroja z głębin",
        "klasztorna różdżka", "zbroja zorzy", "klasztorne buty", "wilcze buty", "złowroga szata",
        "potworne buty", "kowbojski sygnet", "kowbojski wisior", "potworny pas", "prehistoryczna różdżka",
        "prehistoryczna zbroja", "chitynowe buty", "bagienna różdżka", "bagienna włócznia", "buty zaklinacza",
        "baśniowy amulet", "pierścień stabilizacji", "kapelusz zaklinacza"
    ];

    const klatwaItemsList = [
        "kapelusz z piórkiem", "pierścień wzmocnienia", "zaklęty amulet", "okrągła różdżka", "ogrzy hełm",
        "okrągły hełm", "widmowy płaszcz", "wampirze buty", "pancerz garudy", "sandały kapłana",
        "przegniłe kalosze", "perłowy amulet", "różdżka lewiatana", "górniczy pas", "koralowa różdżka",
        "laska oświeconych", "harpia zbroja", "mythrilowe buty", "wyklęte japonki", "koralowy pierścień",
        "krasnoludzki wisiorek", "magmowa zbroja", "polarny pierścień", "kobaltowy wisiorek", "laska żniwiarza",
        "różdżka zorzy", "klasztorna zbroja", "pas uników", "bransoleta opuszczonych", "złowroga różdżka",
        "potworne buty", "kowbojski wisior", "różdżka izanagi", "prehistoryczna maska", "bransoleta łowcy",
        "chitynowa zbroja", "laska natury", "bagienna zbroja", "baśniowa zbroja", "buty zaklinacza",
        "bransolety uników", "pierścień zaklinacza", "prymitywny pierścień", "czapka błazna"
    ];

    const furiaItemsList = [
        "bandycka peleryna", "pierścień kontroli", "gryfia peleryna", "skrzydlate buty", "kapelusz gothar",
        "przegniły płaszcz", "koszmarna maska", "górniczy pas", "mythrilowe buty", "koralowy pierścień",
        "krasnoludzki sygnet", "kapelusz drwala", "pierścień z głębin", "kryształowa zbroja", "buty zorzy",
        "pierścień arktosa", "prehistoryczna maska", "bransoleta łowcy", "prehistoryczne kolczyki",
        "cierniowa zbroja", "zbroja potępionych", "bagienne buty", "prymitywne buty", "buty turniejowe"
    ];

    const getSaved = (key, def) => {
        const val = localStorage.getItem(key);
        return val !== null ? parseInt(val) : def;
    };
    
    const getSavedStr = (key, def) => {
        const val = localStorage.getItem(key);
        return val !== null ? val : def;
    };

    let state = {
        minLvl: getSaved('mfo3_filter_min', 0),
        maxLvl: getSaved('mfo3_filter_max', 999),
        statFilter: getSavedStr('mfo3_filter_stat', 'all'),
        nameFilter: getSavedStr('mfo3_filter_name', '')
    };

    const style = document.createElement('style');
    style.innerHTML = `
        .mfo3-clean-filter { background: #efdfbb; border-bottom: 2px solid #8c6d46; padding: 4px; display: flex; justify-content: center; align-items: center; gap: 4px; font-family: Tahoma, sans-serif; font-size: 11px; font-weight: bold; color: #3e2723; width: 100%; box-sizing: border-box; flex-wrap: nowrap; }
        .mfo3-clean-filter input, .mfo3-clean-filter select { border: 1px solid #8c6d46; background: #f3e5bc; color: #000; font-weight: bold; height: 20px; font-size: 11px; box-sizing: border-box; padding: 0 2px; }
        .mfo3-clean-filter input[type="number"] { width: 32px; text-align: center; }
        .mfo3-clean-filter input.js-name { width: 65px; }
        .mfo3-clean-filter select { width: 90px; }
        .mfo3-btn { cursor: pointer; border: 1px solid #3e2723; font-weight: bold; padding: 2px 4px; color: #3e2723; text-transform: uppercase; height: 20px; font-size: 10px; box-sizing: border-box; }
    `;
    document.head.appendChild(style);

    const applyFiltration = () => {
        document.querySelectorAll('.WUI_FancySelect_option').forEach(opt => {
            const lvlEl = opt.querySelector('.level');
            const nameEl = opt.querySelector('.name');
            
            if (lvlEl && nameEl) {
                const lvl = parseInt(lvlEl.innerText.replace(/[^0-9]/g, '')) || 0;
                const lvlMatch = (lvl >= state.minLvl && lvl <= state.maxLvl);
                
                const itemText = nameEl.innerText.toLowerCase();
                
                // Poprawione dokładne sprawdzanie nazwy z wewnętrznego diva gry
                let nameMatch = true;
                if (state.nameFilter.trim() !== '') {
                    nameMatch = itemText.includes(state.nameFilter.toLowerCase());
                }

                let statMatch = true;
                if (state.statFilter === 'zombie') {
                    statMatch = zombieItemsList.some(zombieItem => itemText.includes(zombieItem));
                } else if (state.statFilter === 'zatrucie') {
                    statMatch = zatrucieItemsList.some(zatrItem => itemText.includes(zatrItem));
                } else if (state.statFilter === 'uspienie') {
                    statMatch = uspienieItemsList.some(uspItem => itemText.includes(uspItem));
                } else if (state.statFilter === 'slepota') {
                    statMatch = slepotaItemsList.some(slepItem => itemText.includes(slepItem));
                } else if (state.statFilter === 'spowolnienie') {
                    statMatch = spowolnienieItemsList.some(spowItem => itemText.includes(spowItem));
                } else if (state.statFilter === 'skamienienie') {
                    statMatch = skamienienieItemsList.some(skamItem => itemText.includes(skamItem));
                } else if (state.statFilter === 'pomylenie') {
                    statMatch = pomylenieItemsList.some(pomItem => itemText.includes(pomItem));
                } else if (state.statFilter === 'paraliz') {
                    statMatch = paralizItemsList.some(parItem => itemText.includes(parItem));
                } else if (state.statFilter === 'klatwa') {
                    statMatch = klatwaItemsList.some(klatItem => itemText.includes(klatItem));
                } else if (state.statFilter === 'furia') {
                    statMatch = furiaItemsList.some(furItem => itemText.includes(furItem));
                } else if (state.statFilter !== 'all') {
                    statMatch = itemText.includes(state.statFilter.toLowerCase());
                }

                opt.style.display = (lvlMatch && nameMatch && statMatch) ? "block" : "none";
            }
        });
    };

    const saveAndExecute = (min, max, stat, name) => {
        state.minLvl = min;
        state.maxLvl = max;
        state.statFilter = stat;
        state.nameFilter = name;
        
        localStorage.setItem('mfo3_filter_min', min);
        localStorage.setItem('mfo3_filter_max', max);
        localStorage.setItem('mfo3_filter_stat', stat);
        localStorage.setItem('mfo3_filter_name', name);
        
        document.querySelectorAll('.js-min').forEach(i => i.value = state.minLvl);
        document.querySelectorAll('.js-max').forEach(i => i.value = state.maxLvl);
        document.querySelectorAll('.js-stat').forEach(s => s.value = state.statFilter);
        document.querySelectorAll('.js-name').forEach(n => n.value = state.nameFilter);
        
        applyFiltration();
    };

    const createUI = () => {
        const div = document.createElement('div');
        div.className = "mfo3-clean-filter";
        div.innerHTML = `
            <input type="text" class="js-name" value="${state.nameFilter}" placeholder="Nazwa...">
            <span>LVL:</span>
            <input type="number" class="js-min" value="${state.minLvl}">
            <span>-</span>
            <input type="number" class="js-max" value="${state.maxLvl}">
            <select class="js-stat">
                <option value="all">Wszystkie</option>
                <option value="zombie">Zombie</option>
                <option value="zatrucie">Zatrucie</option>
                <option value="uspienie">Uśpienie</option>
                <option value="slepota">Ślepota</option>
                <option value="spowolnienie">Spowolnienie</option>
                <option value="skamienienie">Skamienienie</option>
                <option value="pomylenie">Pomylenie</option>
                <option value="paraliz">Paraliż</option>
                <option value="klatwa">Klątwa</option>
                <option value="furia">Furia</option>
            </select>
            <button class="mfo3-btn btn-ok" style="background: #d4a76a;">OK</button>
            <button class="mfo3-btn btn-reset" style="background: #ccc;">X</button>
        `;

        div.querySelector('.js-stat').value = state.statFilter;

        const triggerSearch = (e) => {
            if (e.key === 'Enter') {
                div.querySelector('.btn-ok').click();
            }
        };
        div.querySelector('.js-name').onkeydown = triggerSearch;
        div.querySelector('.js-min').onkeydown = triggerSearch;
        div.querySelector('.js-max').onkeydown = triggerSearch;

        div.querySelector('.btn-ok').onclick = (e) => {
            e.preventDefault();
            const m = parseInt(div.querySelector('.js-min').value);
            const x = parseInt(div.querySelector('.js-max').value);
            const s = div.querySelector('.js-stat').value;
            const n = div.querySelector('.js-name').value;
            saveAndExecute(isNaN(m) ? 0 : m, isNaN(x) ? 999 : x, s, n);
        };

        div.querySelector('.btn-reset').onclick = (e) => {
            e.preventDefault();
            saveAndExecute(0, 999, 'all', '');
        };
        
        return div;
    };

    setInterval(() => {
        const tabs = document.querySelectorAll('.PlayerArmorsCatalog .WUI_Concatenator:not(.footer)');
        
        tabs.forEach(tab => {
            if (!tab.querySelector('.mfo3-clean-filter')) {
                tab.prepend(createUI());
            }
            const list = tab.querySelector('.CatalogItems');
            if (list) {
                list.style.height = "355px";
                list.style.overflowY = "auto";
                list.style.boxSizing = "border-box";
            }
        });

        document.querySelectorAll('.footer .mfo3-clean-filter').forEach(el => el.remove());
        applyFiltration();
    }, 500);

})();
