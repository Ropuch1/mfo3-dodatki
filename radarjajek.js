(function() {
    'use strict';

    // Pobieramy zapisany licznik lub ustawiamy na 0
    let count = parseInt(localStorage.getItem('mfo3_egg_counter')) || 0;

    const display = document.createElement('div');
    display.style.cssText = `
        position: fixed; top: 60px; left: 10px; z-index: 10000;
        background: rgba(10, 10, 10, 0.9); color: #f0f0f0;
        padding: 12px; border: 2px solid #e67e22; border-radius: 8px;
        font-family: sans-serif; font-size: 13px;
        box-shadow: 0 4px 15px rgba(0,0,0,0.7); min-width: 140px;
    `;
    // Usunąłem pointer-events: none, żeby dało się klikać przyciski!
    document.body.appendChild(display);

    function updateCounter(val) {
        count = Math.max(0, count + val); // Nie schodzimy poniżej 0
        localStorage.setItem('mfo3_egg_counter', count);
        render();
    }

    function resetCounter() {
        if(confirm("Czy na pewno chcesz zresetować licznik?")) {
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
                if (!found.some(e => e.x === x && e.y === y)) {
                    found.push({x, y});
                }
            }
        });
        return found;
    }

    function render() {
        const found = scan();
        let html = `
            <b style="color: #f1c40f;">🥚 Radar Jajek:</b>
            <div style="margin: 8px 0; text-align: center; background: rgba(255,255,255,0.1); padding: 5px; border-radius: 4px;">
                <span style="display:block; font-size: 10px; color: #aaa; text-transform: uppercase;">Zebrane łącznie</span>
                <b style="font-size: 18px; color: #fff;" id="egg-val">${count}</b>
                <div style="margin-top: 5px; display: flex; justify-content: center; gap: 5px;">
                    <button id="egg-minus" style="cursor:pointer; width:25px; background:#e74c3c; color:white; border:none; border-radius:3px;">-</button>
                    <button id="egg-plus" style="cursor:pointer; width:25px; background:#2ecc71; color:white; border:none; border-radius:3px;">+</button>
                    <button id="egg-reset" style="cursor:pointer; background:#95a5a6; color:white; border:none; border-radius:3px; font-size:10px; padding: 0 5px;">R</button>
                </div>
            </div>
        `;

        if (found.length > 0) {
            html += '<hr style="border:0; border-top:1px solid #444; margin:5px 0;">';
            found.forEach((egg, i) => {
                html += `<div style="margin-top:2px;">#${i+1}: <b style="color:#2ecc71;">${egg.x}, ${egg.y}</b></div>`;
            });
            display.style.borderColor = "#2ecc71";
        } else {
            html += '<div style="color:#95a5a6; margin-top:5px; font-style: italic;">Brak jajek na mapie</div>';
            display.style.borderColor = "#e74c3c";
        }
        
        display.innerHTML = html;

        // Podpinamy eventy pod przyciski po wyrenderowaniu HTML
        display.querySelector('#egg-plus').onclick = () => updateCounter(1);
        display.querySelector('#egg-minus').onclick = () => updateCounter(-1);
        display.querySelector('#egg-reset').onclick = () => resetCounter();
    }

    // Odświeżanie skanu jajek co 500ms, ale render całego okna też co 500ms
    setInterval(render, 500);
})();
