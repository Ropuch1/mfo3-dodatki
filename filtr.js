(function() {
    'use strict';

    const getSaved = (key, def) => {
        const val = localStorage.getItem(key);
        return val !== null ? parseInt(val) : def;
    };

    let state = {
        minLvl: getSaved('mfo3_filter_min', 60),
        maxLvl: getSaved('mfo3_filter_max', 100)
    };

    const style = document.createElement('style');
    style.innerHTML = `
        .mfo3-clean-filter { background: #efdfbb; border-bottom: 2px solid #8c6d46; padding: 8px; display: flex; justify-content: center; align-items: center; gap: 10px; font-family: Tahoma, sans-serif; font-size: 11px; font-weight: bold; color: #3e2723; width: 100%; box-sizing: border-box; }
        .mfo3-clean-filter input { width: 45px; border: 1px solid #8c6d46; background: #f3e5bc; text-align: center; color: #000; font-weight: bold; }
        .mfo3-btn { cursor: pointer; border: 1px solid #3e2723; font-weight: bold; padding: 2px 8px; color: #3e2723; text-transform: uppercase; }
    `;
    document.head.appendChild(style);

    const applyFiltration = () => {
        document.querySelectorAll('.WUI_FancySelect_option').forEach(opt => {
            const lvlEl = opt.querySelector('.level');
            if (lvlEl) {
                const lvl = parseInt(lvlEl.innerText.replace(/[^0-9]/g, '')) || 0;
                opt.style.display = (lvl >= state.minLvl && lvl <= state.maxLvl) ? "block" : "none";
            }
        });
    };

    const saveAndExecute = (min, max) => {
        state.minLvl = min;
        state.maxLvl = max;
        localStorage.setItem('mfo3_filter_min', min);
        localStorage.setItem('mfo3_filter_max', max);
        
        document.querySelectorAll('.js-min').forEach(i => i.value = state.minLvl);
        document.querySelectorAll('.js-max').forEach(i => i.value = state.maxLvl);
        applyFiltration();
    };

    const createUI = () => {
        const div = document.createElement('div');
        div.className = "mfo3-clean-filter";
        div.innerHTML = `
            <span>LVL:</span>
            <input type="number" class="js-min" value="${state.minLvl}">
            <span>-</span>
            <input type="number" class="js-max" value="${state.maxLvl}">
            <button class="mfo3-btn btn-ok" style="background: #d4a76a;">OK</button>
            <button class="mfo3-btn btn-reset" style="background: #ccc;">X</button>
        `;

        div.querySelector('.btn-ok').onclick = (e) => {
            e.preventDefault();
            const m = parseInt(div.querySelector('.js-min').value);
            const x = parseInt(div.querySelector('.js-max').value);
            saveAndExecute(isNaN(m) ? 0 : m, isNaN(x) ? 999 : x);
        };

        div.querySelector('.btn-reset').onclick = (e) => {
            e.preventDefault();
            saveAndExecute(0, 999);
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
                list.style.height = "385px";
                list.style.overflowY = "auto";
            }
        });

        document.querySelectorAll('.footer .mfo3-clean-filter').forEach(el => el.remove());
        applyFiltration();
    }, 500);

})();
