(function() {
    'use strict';

    const display = document.createElement('div');
    display.style.cssText = `
        position: fixed; top: 60px; left: 10px; z-index: 10000;
        background: rgba(10, 10, 10, 0.9); color: #f0f0f0;
        padding: 12px; border: 2px solid #e67e22; border-radius: 8px;
        font-family: sans-serif; font-size: 13px; pointer-events: none;
        box-shadow: 0 4px 15px rgba(0,0,0,0.7); min-width: 140px;
    `;
    document.body.appendChild(display);

    function scan() {
        const eggs = document.querySelectorAll('div[style*="Easter.png"], div[style*="Food.png?"][style*="-264px 0px"]');
        let found = [];

        eggs.forEach(el => {
            let parent = el.closest('.animator-clip') || el.closest('.overlay') || el;
            if (parent.style.left) {
                let x = Math.floor(parseInt(parent.style.left) / 32);
                let y = Math.floor(parseInt(parent.style.top) / 32);
                if (!found.some(e => e.x === x && e.y === y)) {
                    found.push({x, y});
                }
            }
        });

        let html = '<b style="color: #f1c40f;">🥚 Radar Jajek:</b>';
        if (found.length > 0) {
            html += '<hr style="border:0; border-top:1px solid #444; margin:5px 0;">';
            found.forEach((egg, i) => {
                html += `<div style="margin-top:2px;">#${i+1}: <b style="color:#2ecc71;">${egg.x}, ${egg.y}</b></div>`;
            });
            display.style.borderColor = "#2ecc71";
        } else {
            // TUTAJ BYŁ BŁĄD - TERAZ JEST JAK W ORYGINALE
            html += '<div style="color:#95a5a6; margin-top:5px; font-style: italic;">Brak jajek na mapie</div>';
            display.style.borderColor = "#e74c3c";
        }
        display.innerHTML = html;
    }

    setInterval(scan, 500);
})();
