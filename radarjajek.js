(function() {
    'use strict';

    // 1. Odczytujemy zapisaną pozycję lub ustawiamy domyślną (lewy górny róg)
    const savedPos = JSON.parse(localStorage.getItem('mfo3_radar_pos')) || { top: "60px", left: "10px" };
    let count = parseInt(localStorage.getItem('mfo3_egg_counter')) || 0;

    const display = document.createElement('div');
    display.id = "mfo3-radar-draggable";
    display.style.cssText = `
        position: fixed; top: ${savedPos.top}; left: ${savedPos.left}; z-index: 10000;
        background: rgba(10, 10, 10, 0.9); color: #f0f0f0;
        padding: 12px; border: 2px solid #e67e22; border-radius: 8px;
        font-family: sans-serif; font-size: 13px;
        box-shadow: 0 4px 15px rgba(0,0,0,0.7); min-width: 140px;
        cursor: default; user-select: none;
    `;
    document.body.appendChild(display);

    // --- FUNKCJA PRZESUWANIA (DRAG & DROP) ---
    let isDragging = false;
    let offsetX, offsetY;

    display.addEventListener('mousedown', (e) => {
        // Pozwól klikać przyciski bez przesuwania
        if (e.target.tagName === 'BUTTON') return;
        
        isDragging = true;
        offsetX = e.clientX - display.getBoundingClientRect().left;
        offsetY = e.clientY - display.getBoundingClientRect().top;
        display.style.cursor = 'move';
    });

    document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        display.style.left = (e.clientX - offsetX) + 'px';
        display.style.top = (e.clientY - offsetY) + 'px';
    });

    document.addEventListener('mouseup', () => {
        if (isDragging) {
            isDragging = false;
            display.style.cursor = 'default';
            // Zapisz pozycję w pamięci
            const pos = { top: display.style.top, left: display.style.left };
            localStorage.setItem('mfo3_radar_pos', JSON.stringify(pos));
        }
    });

    // --- LOGIKA RADARU I LICZNIKA ---
    function updateCounter(val) {
        count = Math.max(0, count + val);
        localStorage.setItem('mfo3_egg_counter', count);
        render();
    }

    function resetCounter() {
        if(confirm("Zresetować licznik jajek?")) {
            count = 0;
            localStorage.setItem('mfo3_egg_counter', count);
            render();
        }
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
        let html = `
            <b style="color: #f1c40f; cursor: move; display: block; text-align: center; border-bottom: 1px solid #444; padding-bottom: 4px; margin-bottom: 8px;">🥚 Radar Jajek</b>
            <div style="margin: 5px 0; text-align: center; background: rgba(255,255,255,0.1); padding: 5px; border-radius: 4px;">
                <b style="font-size: 16px; color: #fff;">${count}</b>
                <div style="margin-top: 5px; display: flex; justify-content: center; gap: 4px;">
                    <button id="e-m" style="cursor:pointer; width:22px; background:#e74c3c; color:white; border:none; border-radius:3px;">-</button>
                    <button id="e-p" style="cursor:pointer; width:22px; background:#2ecc71; color:white; border:none; border-radius:3px;">+</button>
                    <button id="e-r" style="cursor:pointer; background:#95a5a6; color:white; border:none; border-radius:3px; font-size:9px; padding: 0 4px;">R</button>
                </div>
            </div>
        `;

        if (found.length > 0) {
            found.forEach((egg, i) => {
                html += `<div style="font-size:11px; margin-top:2px;">#${i+1}: <b style="color:#2ecc71;">${egg.x}, ${egg.y}</b></div>`;
            });
            display.style.borderColor = "#2ecc71";
        } else {
            html += '<div style="color:#95a5a6; font-size:11px; margin-top:5px; font-style: italic;">Brak jajek</div>';
            display.style.borderColor = "#e74c3c";
        }
        
        display.innerHTML = html;

        display.querySelector('#e-p').onclick = (e) => { e.stopPropagation(); updateCounter(1); };
        display.querySelector('#e-m').onclick = (e) => { e.stopPropagation(); updateCounter(-1); };
        display.querySelector('#e-r').onclick = (e) => { e.stopPropagation(); resetCounter(); };
    }

    setInterval(render, 500);
})();
