(function() {
    const STEP_PX = 16;
    const CENTER_X = 184; // Środek tarczy 368px / 2
    const BOX_WIDTH = 16;  // Szerokość celownika (16px)

    function getDartContainer() {
        const elements = document.querySelectorAll('.animator-display');
        for (const el of elements) {
            const bg = el.style.backgroundImage || '';
            if (bg.includes('Dart01.png') || el.style.width === '368px') {
                return el;
            }
        }
        return null;
    }

    function createRuler(container) {
        let ruler = document.getElementById('dart-ruler');
        if (ruler) return ruler;

        ruler = document.createElement('div');
        ruler.id = 'dart-ruler';
        ruler.style.cssText = 'position: absolute; top: 275px; left: 0px; width: 368px; height: 35px; pointer-events: none; z-index: 99998;';

        for (let i = -9; i <= 9; i++) {
            const val = 10 - Math.abs(i);
            const posX = CENTER_X + (i * STEP_PX);

            const tick = document.createElement('div');
            tick.className = 'dart-tick';
            tick.dataset.index = i;
            tick.style.cssText = `position: absolute; left: ${posX}px; transform: translateX(-50%); display: flex; flex-direction: column; align-items: center;`;

            const mark = document.createElement('div');
            mark.className = 'dart-mark';
            mark.style.cssText = `width: 1px; height: ${val === 10 ? '10px' : '5px'}; background-color: ${val === 10 ? '#ff3333' : 'rgba(255, 255, 255, 0.7)'};`;

            const label = document.createElement('span');
            label.className = 'dart-label';
            label.innerText = val;
            label.style.cssText = `font-size: 9px; font-family: monospace, sans-serif; font-weight: bold; color: ${val === 10 ? '#ff4444' : '#ffffff'}; text-shadow: 1px 1px 2px #000, -1px -1px 2px #000; line-height: 1; margin-top: 2px;`;

            tick.appendChild(mark);
            tick.appendChild(label);
            ruler.appendChild(tick);
        }

        container.appendChild(ruler);
        return ruler;
    }

    function updateGuideLines() {
        const container = getDartContainer();
        if (!container) return;

        if (getComputedStyle(container).position === 'static') {
            container.style.position = 'relative';
        }

        const ruler = createRuler(container);

        // Odczyt wiatru
        const fullText = document.body.innerText || document.body.textContent || "";
        const windMatch = fullText.match(/Kierunek wiatru:\s*([A-Za-zĄĆĘŁŃÓŚŹŻąćęłńóśźż]+)[\s\S]*?Siła wiatru:\s*(\d+|Brak)/i);

        let windDir = "Brak";
        let windPower = 0;

        if (windMatch) {
            windDir = windMatch[1].trim();
            windPower = windMatch[2] === "Brak" ? 0 : parseInt(windMatch[2], 10);
        }

        let targetIndex = 0;
        const dirLower = windDir.toLowerCase();
        if (dirLower.includes('prawo')) {
            targetIndex = -windPower;
        } else if (dirLower.includes('lewo')) {
            targetIndex = windPower;
        }

        const targetX = CENTER_X + (targetIndex * STEP_PX);

        // Linie celownicze
        let leftLine = document.getElementById('dart-line-left');
        if (!leftLine) {
            leftLine = document.createElement('div');
            leftLine.id = 'dart-line-left';
            leftLine.style.cssText = 'position: absolute; top: 0px; height: 352px; width: 2px; background-color: #00ff00; box-shadow: 0 0 6px #00ff00, 0 0 2px #000; z-index: 99999; pointer-events: none;';
            container.appendChild(leftLine);
        }

        let rightLine = document.getElementById('dart-line-right');
        if (!rightLine) {
            rightLine = document.createElement('div');
            rightLine.id = 'dart-line-right';
            rightLine.style.cssText = 'position: absolute; top: 0px; height: 352px; width: 2px; background-color: #00ff00; box-shadow: 0 0 6px #00ff00, 0 0 2px #000; z-index: 99999; pointer-events: none;';
            container.appendChild(rightLine);
        }

        leftLine.style.left = `${targetX - (BOX_WIDTH / 2)}px`;
        rightLine.style.left = `${targetX + (BOX_WIDTH / 2) - 2}px`;

        // Podświetlenie liczby na linijce
        const ticks = ruler.querySelectorAll('.dart-tick');
        ticks.forEach(tick => {
            const idx = parseInt(tick.dataset.index, 10);
            const label = tick.querySelector('.dart-label');
            const mark = tick.querySelector('.dart-mark');

            if (idx === targetIndex) {
                mark.style.backgroundColor = '#00ff00';
                mark.style.height = '12px';
                mark.style.width = '2px';
                label.style.color = '#00ff00';
                label.style.fontSize = '11px';
            } else {
                const isTen = idx === 0;
                mark.style.backgroundColor = isTen ? '#ff3333' : 'rgba(255, 255, 255, 0.6)';
                mark.style.height = isTen ? '8px' : '4px';
                mark.style.width = '1px';
                label.style.color = isTen ? '#ff4444' : '#ffffff';
                label.style.fontSize = '9px';
            }
        });
    }

    if (window.dartHelperInterval) {
        clearInterval(window.dartHelperInterval);
    }
    window.dartHelperInterval = setInterval(updateGuideLines, 100);
})();
