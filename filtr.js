(function() {
    'use strict';

    // Stan aplikacji
    let state = {
        minLvl: 0,
        maxLvl: 999
    };

    // Wstrzykiwanie stylów bazowych
    const style = document.createElement('style');
    style.innerHTML = `
        .mfo3-clean-filter {
            background: #efdfbb;
            border-bottom: 2px solid #8c6d46;
            padding: 8px;
            display: flex;
            justify-content: center;
            align-items: center;
            gap: 10px;
            font-family: Tahoma, sans-serif;
            font-size: 11px;
            font-weight: bold;
            color: #3e2723;
            width: 100%;
            box-sizing: border-box;
        }
        .mfo3-clean-filter input {
            width: 40px; 
            border: 1px solid #8c6d46; 
            background: #f3e5bc; 
            text-align: center;
        }
        .mfo3-btn {
            cursor: pointer;
            border: 1px solid #3e2723;
            font-weight: bold;
            padding: 2px 8px;
        }
    `;
    document.head.appendChild(style);

    const updateVisibility = () => {
        document.querySelectorAll('.WUI_FancySelect_option').forEach(opt => {
            const lvlEl = opt.querySelector('.level');
            if (lvlEl) {
                const lvl = parseInt(lvlEl.innerText.replace(/[^0-9]/g, '')) || 0;
                opt.style.display = (lvl >= state.minLvl && lvl <= state.maxLvl) ? "block" : "none";
            }
        });
    };

    const createUI = () => {
        const ui = document.createElement('div');
        ui.className = "mfo3-clean-filter";
        ui.innerHTML = `
            <span>LVL:</span>
            <input type="number" class="js-min" value="${state.minLvl}">
            <span>-</span>
            <input type="number" class="js-max" value="${state.maxLvl}">
            <button class="mfo3-btn" style="background: #d4a76a;">OK</button>
            <button class="mfo3-btn js-reset" style="background: #c2c2c2;">X</button>
        `;

        ui.querySelector('button:not(.js-reset)').onclick = (e) => {
            e.preventDefault();
            state.minLvl = parseInt(ui.querySelector('.js-min').value) || 0;
            state.maxLvl = parseInt(ui.querySelector('.js-max').value) || 999;
            updateVisibility();
        };

        ui.querySelector('.js-reset').onclick = (e) => {
            e.preventDefault();
            state.minLvl = 0; state.maxLvl = 999;
            document.querySelectorAll('.js-min').forEach(i => i.value = 0);
            document.querySelectorAll('.js-max').forEach(i => i.value = 999);
            updateVisibility();
        };

        return ui;
    };

    const mainLoop = () => {
        const containers = document.querySelectorAll('.PlayerArmorsCatalog .WUI_Concatenator:not(.footer)');
        
        containers.forEach(container => {
            if (!container.querySelector('.mfo3-clean-filter')) {
                container.prepend(createUI());
            }

            const list = container.querySelector('.CatalogItems');
            if (list) {
                list.style.height = "380px";
                list.style.overflowY = "auto";
            }
        });

        // Usuwanie pozostałości po starych wersjach/stopkach
        document.querySelectorAll('.footer .mfo3-clean-filter').forEach(el => el.remove());
        updateVisibility();
    };

    setInterval(mainLoop, 400);
})();
