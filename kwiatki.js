(function() {
    'use strict';

    const TARGET_FILE = 'Herbs.png';

    // Lista 4 kwiatków eventowych:
    // 1. Płomienna Iskra: -240px -144px
    // 2. Szmaragdowe Serce: -336px -96px
    // 3. Jaskółcze Ziele: 0px -120px
    // 4. Królewski Korzeń / Kwiat: -24px -168px
    const TARGET_POSITIONS = [
        '-240px -144px',
        '-336px -96px',
        '0px -120px',
        '-24px -168px'
    ];

    // Zapobieganie wielokrotnemu nakładaniu się stylów w konsoli
    if (!document.getElementById('mfo-flower-finder-style')) {
        const style = document.createElement('style');
        style.id = 'mfo-flower-finder-style';
        style.innerHTML = `
            @keyframes mfoFlowerPulse {
                0% {
                    box-shadow: 0 0 14px 6px #00ff66, inset 0 0 8px #00ff66;
                    outline: 3px solid #00ff66;
                    transform: scale(1);
                }
                50% {
                    box-shadow: 0 0 30px 14px #ff00ff, inset 0 0 12px #ff00ff;
                    outline: 4px solid #ff00ff;
                    transform: scale(1.25);
                }
                100% {
                    box-shadow: 0 0 14px 6px #00ff66, inset 0 0 8px #00ff66;
                    outline: 3px solid #00ff66;
                    transform: scale(1);
                }
            }

            .mfo-target-flower {
                animation: mfoFlowerPulse 0.8s infinite !important;
                border-radius: 50% !important;
                z-index: 999999 !important;
                overflow: visible !important;
            }

            .mfo-target-flower::before {
                content: '⬇';
                position: absolute;
                top: -38px;
                left: 50%;
                transform: translateX(-50%);
                font-size: 34px;
                color: #00ffff;
                font-weight: bold;
                text-shadow: 0 0 6px #000, 0 0 12px #ff0055;
                animation: mfoArrowBounceFlower 0.5s infinite alternate;
                pointer-events: none;
            }

            @keyframes mfoArrowBounceFlower {
                from { top: -42px; }
                to { top: -26px; }
            }
        `;
        document.head.appendChild(style);
    }

    function scanForFlowers() {
        const elements = document.querySelectorAll('.animator-display');

        elements.forEach(el => {
            const bgImage = el.style.backgroundImage || '';
            const bgPosition = el.style.backgroundPosition || '';

            if (bgImage.includes(TARGET_FILE)) {
                const isTarget = TARGET_POSITIONS.some(pos => bgPosition.includes(pos));

                if (isTarget) {
                    const parent = el.parentElement;

                    if (parent && !parent.classList.contains('mfo-target-flower')) {
                        parent.classList.add('mfo-target-flower');
                    }
                }
            }
        });
    }

    // Czyszczenie poprzedniego interwału, jeśli uruchamiasz kod ponownie
    if (window.mfoFlowerInterval) {
        clearInterval(window.mfoFlowerInterval);
    }

    window.mfoFlowerInterval = setInterval(scanForFlowers, 150);
    console.log('[MFO3] Wykrywacz kwiatków został pomyślnie uruchomiony!');
})();
