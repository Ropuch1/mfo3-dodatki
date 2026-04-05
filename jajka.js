(function() {
    const colorMap = {'7_1.png':'C','6_0.png':'N','6_1.png':'P','5_1.png':'F','7_0.png':'Z'};
    const arrowMap = {'5_2.png':'→','3_4.png':'→','4_4.png':'←','6_2.png':'←','1_4.png':'↓','6_3.png':'↓','5_3.png':'↓','1_3.png':'↓'};

    const savedPos = JSON.parse(localStorage.getItem('mfo3_solver_pos')) || {top:"150px",left:"10px"};
    let memory = {a1:[], a2:[], e3:[]}, lastTarget = "";

    const oldUi = document.getElementById('mfo3-solver-v52');
    if (oldUi) oldUi.remove();

    const ui = document.createElement('div');
    ui.id = "mfo3-solver-v52";
    ui.style.cssText = `
        position: fixed; top: ${savedPos.top}; left: ${savedPos.left}; z-index: 99999;
        background: rgba(10, 10, 10, 0.95); color: #f0f0f0; padding: 7px;
        border: 2px solid #e67e22; border-radius: 8px; font-family: sans-serif;
        font-size: 11px; width: 115px; user-select: none; display: block;
        box-shadow: 0 4px 15px rgba(0,0,0,0.8);
    `;
    document.body.appendChild(ui);

    let isDragging = false, ox, oy;
    ui.onmousedown = (e) => { if(e.target.tagName!=='BUTTON'){isDragging=true;ox=e.clientX-ui.getBoundingClientRect().left;oy=e.clientY-ui.getBoundingClientRect().top;}};
    document.onmousemove = (e) => { if(isDragging){ui.style.left=(e.clientX-ox)+'px';ui.style.top=(e.clientY-oy)+'px';}};
    document.onmouseup = () => { if(isDragging){isDragging=false;localStorage.setItem('mfo3_solver_pos',JSON.stringify({top:ui.style.top,left:ui.style.left}));}};

    function scan() {
        let d = {target:[], e1:[], a1:[], e2:[], a2:[], e3:[]};
        document.querySelectorAll('.animator-clip').forEach(clip => {
            const inner = clip.querySelector('.animator-display');
            if (!inner?.style.backgroundImage) return;
            let f = inner.style.backgroundImage.split('/').pop().split('?')[0].replace(/["')]/g, '');
            const top = parseInt(clip.style.top) || 0, x = (parseInt(clip.style.left)||0)+(parseInt(clip.style.marginLeft)||0);
            const val = colorMap[f] || arrowMap[f] || '?';
            
            if (top===0 && colorMap[f]) d.target.push({s:val, x});
            else if (top===160 && colorMap[f]) d.e1.push({s:val, x});
            else if (top===192 && arrowMap[f]) d.a1.push({dir:val, x});
            else if (top===224 && colorMap[f]) d.e2.push({s:val, x});
            else if (top===256 && arrowMap[f]) d.a2.push({dir:val, x});
            else if (top===288 && colorMap[f]) d.e3.push({s:val, x});
        });
        
        Object.keys(d).forEach(k => d[k].sort((a,b)=>a.x-b.x));
        
        if (d.target.length > 0) {
            let curT = d.target.map(t=>t.s).join(' ');
            if (lastTarget && lastTarget !== curT) memory = {a1:[], a2:[], e3:[]};
            lastTarget = curT;
        }

        const save = (curr, store) => {
            if (curr.length === 5) {
                let val = curr[0].dir ? curr.map(a=>a.dir).join('') : curr.map(e=>e.s).join('');
                if (!store.includes(val)) { store.push(val); if(store.length>2) store.shift(); }
            }
        };
        save(d.a1, memory.a1); save(d.a2, memory.a2); save(d.e3, memory.e3);
        return d;
    }

    function update() {
        const d = scan();
        if (d.e1.length < 5 && d.target.length === 0) { ui.style.display = 'none'; return; }
        ui.style.display = 'block';

        let targetSorted = lastTarget.replace(/\s/g,'').split('').sort().join(''), sol = null;

        for (let s1=0; s1<memory.a1.length; s1++) {
            for (let s2=0; s2<memory.a2.length; s2++) {
                for (let s3=0; s3<memory.e3.length; s3++) {
                    let tA1=memory.a1[s1].split(''), tA2=memory.a2[s2].split(''), tE3=memory.e3[s3].split('');
                    for (let r=0; r<5; r++) {
                        let path=[], curX=r;
                        path.push(d.e1[curX]?.s||'?');
                        if(tA1[curX]==='→') curX=Math.min(4,curX+1); else if(tA1[curX]==='←') curX=Math.max(0,curX-1);
                        path.push(d.e2[curX]?.s||'?');
                        if(tA2[curX]==='→') curX=Math.min(4,curX+1); else if(tA2[curX]==='←') curX=Math.max(0,curX-1);
                        path.push(tE3[curX]);
                        if ([...path].sort().join('')===targetSorted) { sol={r:r+1,d1:s1+1,d3:s2+1,d2:s3+1}; break; }
                    }
                    if(sol) break;
                } if(sol) break;
            } if(sol) break;
        }

        let html = `<div style="display:flex;justify-content:space-between;margin-bottom:5px;border-bottom:1px solid #444;padding-bottom:2px;"><b style="color:#f1c40f;font-size:10px;">MALOWANIE</b><button id="res-btn" style="background:#95a5a6;color:white;border:none;border-radius:2px;font-size:9px;padding:0 3px;cursor:pointer;">R</button></div>`;
        
        if (sol) {
            ui.style.borderColor = "#2ecc71";
            let c1 = d.a1.map(a=>a.dir).join('')===memory.a1[sol.d1-1], c3 = d.a2.map(a=>a.dir).join('')===memory.a2[sol.d3-1], c2 = d.e3.map(e=>e.s).join('')===memory.e3[sol.d2-1];
            html += `<div style="font-size:10px;text-align:center;margin-bottom:4px;">D1:<span style="color:${c1?'#2ecc71':'#e74c3c'}">U${sol.d1}</span> D2:<span style="color:${c2?'#2ecc71':'#e74c3c'}">U${sol.d2}</span> D3:<span style="color:${c3?'#2ecc71':'#e74c3c'}">U${sol.d3}</span></div><div style="background:#1b4d2e;padding:4px;text-align:center;border-radius:4px;font-weight:bold;font-size:12px;border:1px solid #2ecc71;">RURA: ${sol.r}</div>`;
        } else {
            let full = (memory.a1.length===2 && memory.a2.length===2 && memory.e3.length===2);
            ui.style.borderColor = full ? "#e74c3c" : "#e67e22";
            html += `<div style="color:${full?'#e74c3c':'#95a5a6'};text-align:center;font-size:10px;padding:6px;font-weight:bold;">${full?'BRAK ROZWIĄZANIA':'ZAPAMIĘTYWANIE...'}</div>`;
        }
        
        ui.innerHTML = html;
        ui.querySelector('#res-btn').onclick = () => { memory={a1:[],a2:[],e3:[]}; };
    }
    setInterval(update, 600);
})();
