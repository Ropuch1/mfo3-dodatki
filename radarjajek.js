(function() {
    'use strict';

    // Wczytywanie ustawień (pozycja i stan zwinięcia)
    const settings = JSON.parse(localStorage.getItem('mfo3_radar_settings')) || { 
        top: "60px", 
        left: "10px", 
        minimized: false 
    };
    let count = parseInt(localStorage.getItem('mfo3_egg_counter')) || 0;

    const display = document.createElement('div');
    display.id = "mfo3-radar-draggable";
    display.style.cssText = `
        position: fixed; top: ${settings.top}; left: ${settings.left}; z-index: 10000;
        background: rgba(10, 10, 10, 0.9); color: #f0f0f0;
        padding: 12px; border: 2px solid #e67e22; border-radius: 8px;
        font-family: sans-serif; font-size: 13px;
        box-shadow: 0 4px 15px rgba(0,0,0,0.7); min-width: 140px;
        cursor: default; user-select: none; box-sizing: border-box;
    `;
    document.body.appendChild(display);

    function saveSettings() {
        localStorage.setItem('mfo3_radar_settings', JSON.stringify(settings));
    }

    // --- DRAG & DROP ---
    let isDragging = false, offsetX, offsetY;
    display.addEventListener('mousedown', (e) => {
        if (e.target.tagName === 'BUTTON' || e.target.classList.contains('ctrl-btn')) return;
        isDragging = true;
        offsetX = e.clientX - display.getBoundingClientRect().left;
        offsetY = e.clientY - display.getBoundingClientRect().top;
    });

    document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        settings.left = (e.clientX - offsetX) + 'px';
        settings.top = (e.clientY - offsetY) + 'px';
        display.style.left = settings.left;
        display.style.top = settings.top;
    });

    document.addEventListener('mouseup', () => {
        if (isDragging) { isDragging = false; saveSettings(); }
    });

    // --- LOGIKA ---
    function updateCounter(val) {
        count = Math.max(0, count + val);
        localStorage.setItem('mfo3_egg_counter', count);
        render();
    }

    function scan() {
        const eggs = document.querySelectorAll('div[style*="Easter.png"], div[style*="Food.png?"][style*="-264px 0px"]');
        let found = [];
        eggs.forEach(el => {
            let parent = el.closest('.animator-clip') || el.closest('.overlay') || el;
            if (parent.style.left) {
                let x = Math.floor(parseInt(parent.style.left) / 32);
                let y = Math.floor(parseInt(parent.style.top) / 32);
                if (!found.some(e => e.x === x && e.y === y)) found.push({x, y});
            }
        });
        return found;
    }

    function render() {
        const found = scan();
        display.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #444; padding-bottom: 4px; margin-bottom: 8px;">
                <b style="color: #f1c40f;">🥚 Radar</b>
                <div style="display: flex; gap: 8px;">
                    <span id="r-min" class="ctrl-btn" style="cursor:pointer; color:#f1c40f; font-weight:bold;">${settings.minimized ? '▢' : '_'}</span>
                    <span id="r-close" class="ctrl-btn" style="cursor:pointer; color:#e74c3c; font-weight:bold;">&times;</span>
                </div>
            </div>
            <div id="radar-content" style="display: ${settings.minimized ? 'none' : 'block'};">
                <div style="margin: 5px 0; text-align: center; background: rgba(255,255,255,0.1); padding: 5px; border-radius: 4px;">
                    <b style="font-size: 16px; color: #fff;">${count}</b>
                    <div style="margin-top: 5px; display: flex; justify-content: center; gap: 4px;">
                        <button id="e-m" style="background:#e74c3c; color:white; border:none; border-radius:3px; width:22px; cursor:pointer;">-</button>
                        <button id="e-p" style="background:#2ecc71; color:white; border:none; border-radius:3px; width:22px; cursor:pointer;">+</button>
                        <button id="e-r" style="background:#95a5a6; color:white; border:none; border-radius:3px; font-size:9px; cursor:pointer;">R</button>
                    </div>
                </div>
                <div id="egg-list"></div>
            </div>`;

        const eggList = display.querySelector('#egg-list');
        if (!settings.minimized) {
            if (found.length > 0) {
                found.forEach((egg, i) => {
                    eggList.innerHTML += `<div style="font-size:11px; margin-top:2px;">#${i+1}: <b style="color:#2ecc71;">${egg.x}, ${egg.y}</b></div>`;
                });
                display.style.borderColor = "#2ecc71";
            } else {
                eggList.innerHTML = '<div style="color:#95a5a6; font-size:11px; margin-top:5px; font-style: italic;">Brak jajek</div>';
                display.style.borderColor = "#e74c3c";
            }
            display.querySelector('#e-p').onclick = () => updateCounter(1);
            display.querySelector('#e-m').onclick = () => updateCounter(-1);
            display.querySelector('#e-r').onclick = () => { if(confirm("Reset?")) updateCounter(-count); };
        }

        display.querySelector('#r-close').onclick = () => display.remove();
        display.querySelector('#r-min').onclick = () => {
            settings.minimized = !settings.minimized;
            saveSettings();
            render();
        };
    }

    render();
    setInterval(render, 500);
})();
