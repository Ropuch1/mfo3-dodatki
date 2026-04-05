(function() {
    const colorMap = {
        '6_0.png': { s: 'N' }, '5_1.png': { s: 'F' }, '7_0.png': { s: 'Z' },
        '7_1.png': { s: 'C' }, '6_1.png': { s: 'P' }
    };

    const arrowMap = {
        '5_2.png': '→', '3_4.png': '→', '4_4.png': '←', '6_2.png': '←',
        '1_4.png': '↓', '6_3.png': '↓', '5_3.png': '↓', '1_3.png': '↓'
    };

    const savedPos = JSON.parse(localStorage.getItem('mfo3_solver_pos')) || { top: "150px", left: "10px" };
    let memory = { a1: [], a2: [], e3: [] };
    let lastTarget = "";
    let currentData = null; // Do raportowania błędów
    let currentSol = null;

    const ui = document.createElement('div');
    ui.id = "mfo3-solver-v47";
    ui.style.cssText = `
        position: fixed; top: ${savedPos.top}; left: ${savedPos.left}; z-index: 10001;
        background: rgba(10, 10, 10, 0.95); color: #f0f0f0; padding: 7px;
        border: 2px solid #e67e22; border-radius: 8px; font-family: sans-serif;
        font-size: 11px; width: 120px; cursor: default; user-select: none;
        box-shadow: 0 4px 15px rgba(0,0,0,0.8);
    `;
    document.body.appendChild(ui);

    // DRAG & DROP
    let isDragging = false, offsetX, offsetY;
    ui.onmousedown = (e) => {
        if (e.target.tagName === 'BUTTON') return;
        isDragging = true;
        offsetX = e.clientX - ui.getBoundingClientRect().left;
        offsetY = e.clientY - ui.getBoundingClientRect().top;
    };
    document.onmousemove = (e) => {
        if (!isDragging) return;
        ui.style.left = (e.clientX - offsetX) + 'px';
        ui.style.top = (e.clientY - offsetY) + 'px';
    };
    document.onmouseup = () => {
        if (isDragging) {
            isDragging = false;
            localStorage.setItem('mfo3_solver_pos', JSON.stringify({ top: ui.style.top, left: ui.style.left }));
        }
    };

    function resetMemory() { memory = { a1: [], a2: [], e3: [] }; }

    function reportError() {
        console.log("%c--- RAPORT BŁĘDU MFO3 SOLVER ---", "color: #e67e22; font-weight: bold; font-size: 14px;");
        console.log("CEL:", lastTarget);
        console.log("PAMIĘĆ UKŁADÓW:", memory);
        console.log("ZESKANOWANE DANE:", currentData);
        console.log("WYLICZONE ROZWIĄZANIE:", currentSol);
        console.log("SUROWE PLIKI GRAFICZNE:");
        document.querySelectorAll('.animator-clip').forEach(clip => {
             const inner = clip.querySelector('.animator-display');
             if (inner?.style.backgroundImage) {
                 console.log(`Top: ${clip.style.top}, File: ${inner.style.backgroundImage}`);
             }
        });
        alert("Dane błędu zostały wypisane w konsoli (F12). Skopiuj je i prześlij.");
    }

    function scan() {
        let d = { target: [], e1: [], a1: [], e2: [], a2: [], e3: [], raw: [] };
        document.querySelectorAll('.animator-clip').forEach(clip => {
            const inner = clip.querySelector('.animator-display');
            if (!inner?.style.backgroundImage) return;
            let f = inner.style.backgroundImage.split('/').pop().split('?')[0].replace(/["')]/g, '');
            const top = parseInt(clip.style.top) || 0;
            const x = (parseInt(clip.style.left) || 0) + (parseInt(clip.style.marginLeft) || 0);

            let item = { s: colorMap[f]?.s || arrowMap[f] || '?', x, file: f };
            if (top === 0 && colorMap[f]) d.target.push(item);
            else if (top === 160 && colorMap[f]) d.e1.push(item);
            else if (top === 192 && arrowMap[f]) d.a1.push({dir: arrowMap[f], x, file: f});
            else if (top === 224 && colorMap[f]) d.e2.push(item);
            else if (top === 256 && arrowMap[f]) d.a2.push({dir: arrowMap[f], x, file: f});
            else if (top === 288 && colorMap[f]) d.e3.push(item);
        });

        const sortX = (a, b) => a.x - b.x;
        Object.values(d).forEach(arr => { if(Array.isArray(arr)) arr.sort(sortX); });

        if (d.target.length > 0) {
            const curT = d.target.map(t => t.s).join(' ');
            if (lastTarget && lastTarget !== curT) resetMemory();
            lastTarget = curT;
        }

        const save = (curr, store) => {
            if (curr.length === 5) {
                const val = curr[0].dir ? curr.map(a => a.dir).join('') : curr.map(e => e.s).join('');
                if (!store.includes(val)) { store.push(val); if(store.length > 2) store.shift(); }
            }
        };
        save(d.a1, memory.a1); save(d.a2, memory.a2); save(d.e3, memory.e3);
        currentData = d;
        return d;
    }

    function update() {
        const d = scan();
        if (d.e1.length < 5 && d.target.length === 0) { ui.style.display = 'none'; return; }
        ui.style.display = 'block';

        const targetSorted = lastTarget.replace(/\s/g, '').split('').sort().join('');
        let sol = null;

        for (let s1 = 0; s1 < memory.a1.length; s1++) {
            for (let s2 = 0; s2 < memory.a2.length; s2++) {
                for (let s3 = 0; s3 < memory.e3.length; s3++) {
                    const tA1 = memory.a1[s1].split(''), tA2 = memory.a2[s2].split(''), tE3 = memory.e3[s3].split('');
                    for (let r = 0; r < 5; r++) {
                        let path = [], curX = r;
                        path.push(d.e1[curX]?.s || '?');
                        if (tA1[curX] === '→') curX = Math.min(4, curX + 1); else if (tA1[curX] === '←') curX = Math.max(0, curX - 1);
                        path.push(d.e2[curX]?.s || '?');
                        if (tA2[curX] === '→') curX = Math.min(4, curX + 1); else if (tA2[curX] === '←') curX = Math.max(0, curX - 1);
                        path.push(tE3[curX]);
                        if ([...path].sort().join('') === targetSorted) { sol = { r: r+1, d1: s1+1, d3: s2+1, d2: s3+1 }; break; }
                    }
                    if (sol) break;
                }
                if (sol) break;
            }
            if (sol) break;
        }
        currentSol = sol;

        let html = `
            <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid #444; padding-bottom:3px; margin-bottom:5px;">
                <b style="color:#f1c40f; font-size:10px;">MALOWANIE</b>
                <button id="res-btn" style="cursor:pointer; background:#95a5a6; color:white; border:none; border-radius:3px; font-size:9px; padding:0 3px;">R</button>
            </div>
        `;

        if (sol) {
            ui.style.borderColor = "#2ecc71";
            const c1 = d.a1.map(a=>a.dir).join('') === memory.a1[sol.d1-1];
            const c3 = d.a2.map(a=>a.dir).join('') === memory.a2[sol.d3-1];
            const c2 = d.e3.map(e=>e.s).join('') === memory.e3[sol.d2-1];
            html += `
                <div style="font-size:10px; line-height:1.2; text-align:center; margin-bottom:5px;">
                    D1:<b style="color:${c1?'#2ecc71':'#e74c3c'}">U${sol.d1}</b> 
                    D2:<b style="color:${c2?'#2ecc71':'#e74c3c'}">U${sol.d2}</b> 
                    D3:<b style="color:${c3?'#2ecc71':'#e74c3c'}">U${sol.d3}</b>
                </div>
                <div style="background:#1b4d2e; padding:3px; text-align:center; border-radius:4px; font-weight:bold; font-size:12px; border:1px solid #2ecc71;">
                    RURA: ${sol.r}
                </div>
            `;
        } else {
            const isFull = (memory.a1.length === 2 && memory.a2.length === 2 && memory.e3.length === 2);
            ui.style.borderColor = isFull ? "#e74c3c" : "#e67e22";
            html += `<div style="color:${isFull?'#e74c3c':'#95a5a6'}; text-align:center; font-weight:bold; font-size:10px; padding:4px;">
                ${isFull ? 'BRAK' : 'KLIKAJ DŹWIGNIE'}
            </div>`;
        }

        html += `
            <button id="err-btn" style="width:100%; margin-top:6px; cursor:pointer; background:rgba(255,255,255,0.1); color:#95a5a6; border:1px dashed #444; border-radius:3px; font-size:8px; padding:2px;">ZGŁOŚ BŁĄD</button>
        `;

        ui.innerHTML = html;
        ui.querySelector('#res-btn').onclick = (e) => { e.stopPropagation(); resetMemory(); };
        ui.querySelector('#err-btn').onclick = (e) => { e.stopPropagation(); reportError(); };
    }

    setInterval(update, 600);
})();
