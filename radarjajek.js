(function() {
    'use strict';
    console.log("%c[Radar] Uruchomiono wykrywacz jajek!", "color: #e67e22; font-weight: bold;");

    const display = document.createElement('div');
    display.id = "mfo3-radar-display";
    display.style.cssText = `
        position: fixed; top: 180px; right: 15px; z-index: 9999;
        background: rgba(45, 34, 23, 0.9); color: #e6d3a7;
        padding: 10px; border: 2px solid #e67e22; border-radius: 8px;
        font-family: Verdana; font-size: 11px; pointer-events: none;
        box-shadow: 0 0 10px black; min-width: 120px;
    `;
    document.body.appendChild(display);

    function scan() {
        // Szukamy elementów z grafiką jajek
        const eggs = document.querySelectorAll('div[style*="Easter.png"], div[style*="Food.png?"][style*="-264px 0px"]');
        let found = [];

        eggs.forEach(el => {
            let parent = el.closest('.animator-clip') || el.closest('.overlay') || el;
            if (parent && parent.style.left) {
                let x = Math.round(parseInt(parent.style.left) / 32);
                let y = Math.round(parseInt(parent.style.top) / 32);
                if (!found.some(e => e.x === x && e.y === y)) {
                    found.push({x, y});
                }
            }
        });

        let html = '<b style="color: #f1c40f;">🥚 Radar Jajek:</b>';
        if (found.length > 0) {
            html += '<hr style="border:0; border-top:1px solid #7a5a3a; margin:5px 0;">';
            found.forEach((egg, i) => {
                html += `<div style="margin-top:2px;">#${i+1}: <b style="color:#2ecc71;">${egg.x}, ${egg.y}</b></div>`;
            });
            display.style.borderColor = "#2ecc71";
            display.style.display = "block";
        } else {
            // Ukrywamy radar, gdy nie ma jajek, żeby nie zasłaniał ekranu bez potrzeby
            display.style.display = "none";
        }
        display.innerHTML = html;
    }

    setInterval(scan, 800);
})();
