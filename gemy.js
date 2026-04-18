(function() {
    'use strict';

    // SZTYWNA LISTA - tylko te gemy będą liczone
    const limits = {
        "Atak Plus": 4, 
        "Atak Magiczny Plus": 4, 
        "Obrona Plus": 4, 
        "Obrona Magiczna Plus": 4,
        "Szczęście Plus": 4, 
        "Szybkość Plus": 4, 
        "HP Plus": 5, 
        "MP Plus": 5,
        "Szybkość Plus 2": 3, 
        "Atak Plus 2": 3, 
        "Atak Magiczny Plus 2": 3,
        "Obrona Plus 2": 3, 
        "Obrona Magiczna Plus 2": 3, 
        "Szczęście Plus 2": 3
    };

    let isMinimized = false;

    function cleanName(rawName) {
        return rawName.replace(/[^a-zA-Z0-9 ąćęłńóśźżĄĆĘŁŃÓŚŹŻ]/g, '').trim();
    }

    function countGems() {
        const gems = document.querySelectorAll('.GemsCatalogItem');
        let data = { plus: { ready: {}, todo: {} }, plus2: { ready: {}, todo: {} } };

        gems.forEach(gem => {
            const nameEl = gem.querySelector('.name');
            if (!nameEl) return;
            const name = cleanName(nameEl.innerText);

            // KLUCZOWA ZMIANA: Sprawdza czy nazwa jest dokładnie w naszym słowniku 'limits'
            if (limits.hasOwnProperty(name)) {
                const stars = gem.querySelectorAll('.star.full').length;
                const limit = limits[name];
                const category = name.includes("Plus 2") ? "plus2" : "plus";
                const status = stars >= limit ? "ready" : "todo";

                if (!data[category][status][name]) data[category][status][name] = 0;
                data[category][status][name]++;
            }
        });
        updateUI(data);
    }

    function renderList(obj, color) {
        const keys = Object.keys(obj).sort();
        if (keys.length === 0) return '<div style="color: #555; font-style: italic; font-size: 10px; margin-bottom:5px;">Brak</div>';
        return keys.map(name => `
            <div style="display: flex; justify-content: space-between; margin-bottom: 2px;">
                <span style="color: #ccc;">${name}:</span>
                <span style="color: ${color}; font-weight: bold; margin-left: 15px;">x${obj[name]}</span>
            </div>`).join('');
    }

    function updateUI(data) {
        let panel = document.getElementById('gem-js-panel');
        if (!panel) panel = createPanel();
        
        const content = document.getElementById('gem-js-content');
        if (isMinimized) {
            content.style.display = 'none';
            panel.style.width = '150px';
        } else {
            content.style.display = 'block';
            panel.style.width = '220px';
            content.innerHTML = `
                <div style="color: #55ff55; font-weight: bold; font-size: 10px; margin-bottom: 3px;">✅ PLUS (GOTOWE)</div>
                <div style="margin-bottom: 12px; padding-left: 5px; border-left: 2px solid #55ff55;">${renderList(data.plus.ready, '#55ff55')}</div>
                
                <div style="color: #ff5555; font-weight: bold; font-size: 10px; margin-bottom: 3px;">❌ PLUS (DO WBIJANIA)</div>
                <div style="margin-bottom: 12px; padding-left: 5px; border-left: 2px solid #ff5555;">${renderList(data.plus.todo, '#ff5555')}</div>
                
                <div style="color: #55aaff; font-weight: bold; font-size: 10px; margin-bottom: 3px; border-top: 1px solid #333; padding-top: 5px;">💎 PLUS 2 (MAX = 3★)</div>
                <div style="margin-bottom: 5px; padding-left: 5px; border-left: 2px solid #55aaff;">
                    <div style="color: #55ff55; font-size: 9px; opacity: 0.8;">Gotowe:</div>
                    ${renderList(data.plus2.ready, '#55ff55')}
                    <div style="color: #ff5555; font-size: 9px; opacity: 0.8; margin-top: 3px;">Do wbijania:</div>
                    ${renderList(data.plus2.todo, '#ff5555')}
                </div>
            `;
        }
    }

    function createPanel() {
        const panel = document.createElement('div');
        panel.id = 'gem-js-panel';
        panel.style = "position: fixed; top: 100px; right: 20px; background: rgba(15, 15, 15, 0.98); color: #fff; border: 1px solid #ffd700; border-radius: 4px; z-index: 999999; font-family: Verdana, sans-serif; font-size: 11px; box-shadow: 0 0 20px rgba(0,0,0,0.8); user-select: none;";
        
        const header = document.createElement('div');
        header.style = "background: #ffd700; color: #000; padding: 5px 10px; font-weight: bold; cursor: move; display: flex; justify-content: space-between; align-items: center; border-radius: 3px 3px 0 0;";
        header.innerHTML = `<span>GEM STATUS</span> <span id="gem-js-min-btn" style="cursor: pointer; padding: 0 6px; background: #000; color: #ffd700; border-radius: 2px; font-size: 10px;">_</span>`;
        
        const content = document.createElement('div');
        content.id = 'gem-js-content';
        content.style = "padding: 10px; max-height: 80vh; overflow-y: auto;";

        panel.appendChild(header);
        panel.appendChild(content);
        document.body.appendChild(panel);

        document.getElementById('gem-js-min-btn').onclick = (e) => {
            isMinimized = !isMinimized;
            e.target.innerText = isMinimized ? "□" : "_";
            countGems();
        };

        let p1 = 0, p2 = 0, p3 = 0, p4 = 0;
        header.onmousedown = (e) => {
            p3 = e.clientX; p4 = e.clientY;
            document.onmouseup = () => { document.onmouseup = null; document.onmousemove = null; };
            document.onmousemove = (e) => {
                p1 = p3 - e.clientX; p2 = p4 - e.clientY; p3 = e.clientX; p4 = e.clientY;
                let nTop = panel.offsetTop - p2;
                let nLeft = panel.offsetLeft - p1;
                if (nTop < 0) nTop = 0;
                if (nLeft < 0) nLeft = 0;
                if (nTop + panel.offsetHeight > window.innerHeight) nTop = window.innerHeight - panel.offsetHeight;
                if (nLeft + panel.offsetWidth > window.innerWidth) nLeft = window.innerWidth - panel.offsetWidth;
                panel.style.top = nTop + "px"; panel.style.left = nLeft + "px"; panel.style.right = 'auto';
            };
        };
        return panel;
    }

    setInterval(countGems, 1000);
})();
