(function() {
    'use strict';

    if (window.__zamekSolverRunning) {
        console.log("[ZAMEK] Stara instancja skryptu została zamknięta.");
        if (window.__zamekCleanup) window.__zamekCleanup();
    }
    window.__zamekSolverRunning = true;

    let currentPos = 0;
    let isPanelVisible = true;
    let intervalId = null;

    document.querySelectorAll('#zamek-solver-panel').forEach(p => p.remove());

    const panel = document.createElement('div');
    panel.id = 'zamek-solver-panel';
    panel.style.cssText = `
        position: fixed;
        top: 10px;
        left: 10px;
        z-index: 999999;
        background: rgba(0, 0, 0, 0.9);
        color: #00ff00;
        padding: 10px 14px;
        border-radius: 6px;
        font-family: monospace;
        font-size: 13px;
        border: 1px solid #00ff00;
        user-select: none;
    `;

    panel.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
            <b>ZAMEK SOLVER v8.5</b>
            <span id="z-close" style="cursor:pointer; color:#ff5555; font-weight:bold; padding: 0 4px;" title="Zamknij (Ctrl+O)">[X]</span>
        </div>
        Pozycja: <span id="z-pos" style="color:yellow; font-weight:bold;">0</span>
        <button id="z-reset" style="cursor:pointer; padding: 0 4px; font-weight:bold;" title="Reset do 0">0</button>
        <button id="z-minus" style="cursor:pointer; padding: 0 5px;">-</button>
        <button id="z-plus" style="cursor:pointer; padding: 0 5px;">+</button><br>
        Cel (Żółty): <span id="z-target" style="color:cyan">Brak</span><br>
        Kombinacja: <span id="z-combo" style="color:#ff00ff">Oczekiwanie...</span>
    `;
    document.body.appendChild(panel);

    const posEl = panel.querySelector('#z-pos');
    const targetEl = panel.querySelector('#z-target');
    const comboEl = panel.querySelector('#z-combo');

    panel.querySelector('#z-close').onclick = (e) => {
        e.stopPropagation();
        isPanelVisible = false;
        panel.style.display = 'none';
    };

    panel.querySelector('#z-reset').onclick = (e) => {
        e.stopPropagation();
        currentPos = 0;
        posEl.textContent = currentPos;
    };

    panel.querySelector('#z-minus').onclick = (e) => {
        e.stopPropagation();
        currentPos = (currentPos - 1 + 40) % 40;
        posEl.textContent = currentPos;
    };

    panel.querySelector('#z-plus').onclick = (e) => {
        e.stopPropagation();
        currentPos = (currentPos + 1) % 40;
        posEl.textContent = currentPos;
    };

    function updatePanelDisplay(targetStr, comboText) {
        posEl.textContent = currentPos;
        targetEl.textContent = targetStr || 'Brak';
        comboEl.textContent = comboText || 'Oczekiwanie...';
    }

    function runSolver() {
        let textEl = null;
        const allDivs = document.querySelectorAll('div');
        for (let div of allDivs) {
            if (div.innerText && div.innerText.includes('Szyfr do zamka')) {
                textEl = div;
                break;
            }
        }

        if (!textEl) {
            panel.style.display = 'none';
            return;
        }

        panel.style.display = isPanelVisible ? 'block' : 'none';
        if (!isPanelVisible) return;

        let yellowEl = textEl.querySelector('b[style*="yellow"], b[style*="COLOR: yellow"]');
        let currentTargetStr = "";

        if (yellowEl) {
            currentTargetStr = yellowEl.innerText.trim();
        } else {
            let cipherMatches = textEl.innerText.match(/[LP]\d+/g);
            if (cipherMatches && cipherMatches.length > 0) {
                currentTargetStr = cipherMatches[0];
            }
        }

        if (!currentTargetStr) return;

        const targetDir = currentTargetStr[0];
        const targetVal = parseInt(currentTargetStr.substring(1), 10);

        let options = Array.from(document.querySelectorAll('.WUI_FancySelect_option'));
        let parsedOptions = [];

        options.forEach((opt, index) => {
            opt.style.backgroundColor = '';
            opt.style.border = '';

            const optText = opt.innerText.toLowerCase();
            if (optText.includes('zakończ')) return;

            let optDir = optText.includes('lewo') ? 'L' : (optText.includes('prawo') ? 'P' : '');
            const matchesNumbers = optText.match(/\d+/);
            if (!matchesNumbers || !optDir) return;

            parsedOptions.push({
                element: opt,
                index: index,
                dir: optDir,
                val: parseInt(matchesNumbers[0], 10)
            });
        });

        if (parsedOptions.length === 0) return;

        let baseDistance = 0;
        if (targetDir === 'L') {
            baseDistance = (targetVal - currentPos + 40) % 40;
        } else {
            baseDistance = (currentPos - targetVal + 40) % 40;
        }
        if (baseDistance === 0) baseDistance = 40;

        let bestComboText = "Brak rozwiązania";
        let bestFirstElement = null;
        let minTotalClicks = Infinity;

        let v = parsedOptions.map(o => o.val);
        while (v.length < 3) v.push(999);

        let targetDistances = [baseDistance, baseDistance + 40, baseDistance + 80];

        for (let targetSum of targetDistances) {
            for (let c1 = 0; c1 <= 10; c1++) {
                for (let c2 = 0; c2 <= 10; c2++) {
                    for (let c3 = 0; c3 <= 10; c3++) {
                        let sum = c1 * v[0] + c2 * v[1] + c3 * v[2];
                        if (sum === targetSum) {
                            let totalClicks = c1 + c2 + c3;
                            if (totalClicks < minTotalClicks && totalClicks > 0) {
                                minTotalClicks = totalClicks;
                                let parts = [];
                                if (c1 > 0 && parsedOptions[0]) parts.push(`${c1}x ${v[0]}`);
                                if (c2 > 0 && parsedOptions[1]) parts.push(`${c2}x ${v[1]}`);
                                if (c3 > 0 && parsedOptions[2]) parts.push(`${c3}x ${v[2]}`);
                                bestComboText = parts.join(" + ") + ` (Suma: ${sum})`;

                                if (c1 > 0 && parsedOptions[0]) bestFirstElement = parsedOptions[0].element;
                                else if (c2 > 0 && parsedOptions[1]) bestFirstElement = parsedOptions[1].element;
                                else if (c3 > 0 && parsedOptions[2]) bestFirstElement = parsedOptions[2].element;
                            }
                        }
                    }
                }
            }
            if (bestFirstElement !== null) break;
        }

        updatePanelDisplay(currentTargetStr, bestComboText);

        if (bestFirstElement !== null) {
            bestFirstElement.style.backgroundColor = 'rgba(0, 255, 0, 0.4)';
            bestFirstElement.style.border = '2px solid #00ff00';
        }
    }

    const clickHandler = (e) => {
        const optionEl = e.target.closest('.WUI_FancySelect_option');
        if (optionEl) {
            const text = optionEl.innerText || '';
            const lowerText = text.toLowerCase();
            if (lowerText.includes('przekręć w lewo') || lowerText.includes('przekręć w prawo')) {
                const numMatch = lowerText.match(/\d+/);
                if (numMatch) {
                    let stepVal = parseInt(numMatch[0], 10);
                    let optDir = lowerText.includes('lewo') ? 'L' : 'P';

                    if (optDir === 'L') {
                        currentPos = (currentPos + stepVal) % 40;
                    } else {
                        currentPos = (currentPos - stepVal + 40) % 40;
                    }
                    posEl.textContent = currentPos;
                }
            }
        }
    };

    const keyHandler = (e) => {
        if (e.ctrlKey && e.key.toLowerCase() === 'o') {
            e.preventDefault();
            isPanelVisible = !isPanelVisible;
            panel.style.display = isPanelVisible ? 'block' : 'none';
        }
    };

    document.addEventListener('click', clickHandler, true);
    document.addEventListener('keydown', keyHandler);

    intervalId = setInterval(runSolver, 400);

    window.__zamekCleanup = () => {
        clearInterval(intervalId);
        document.removeEventListener('click', clickHandler, true);
        document.removeEventListener('keydown', keyHandler);
        panel.remove();
        window.__zamekSolverRunning = false;
    };
})();
