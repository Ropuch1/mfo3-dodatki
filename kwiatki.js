(function() {
    'use strict';

    const TARGET_FILE = 'Herbs.png';

    // Lista 4 kwiatków eventowych:
    const TARGET_POSITIONS = [
        '-240px -144px', // Płomienna Iskra
        '-336px -96px',  // Szmaragdowe Serce
        '0px -120px',    // Jaskółcze Ziele
        '-24px -168px'   // Królewski Korzeń / Kwiat
    ];

    // Czyszczenie starego stylu, jeśli kod był wcześniej uruchamiany
    const oldStyle = document.getElementById('mfo-flower-finder-style');
    if (oldStyle) oldStyle.remove();

    // Dodanie stałego, czytelnego stylu podświetlenia
    const style = document.createElement('style');
    style.id = 'mfo-flower-finder-style';
    style.innerHTML = `
        .mfo-target-flower {
            box-shadow: 0 0 12px 4px #00ff66, inset 0 0 6px #00ff66 !important;
            outline: 3px solid #00ff66 !important;
            border-radius: 50% !important;
            z-index: 999999 !important;
            overflow: visible !important;
        }

        /* Statyczna strzałka nad kwiatkiem */
        .mfo-target-flower::before {
            content: '⬇';
            position: absolute;
            top: -35px;
            left: 50%;
            transform: translateX(-50%);
            font-size: 30px;
            color: #00ffff;
            font-weight: bold;
            text-shadow: 0 0 4px #000, 0 0 8px #000;
            pointer-events: none;
        }
    `;
    document.head.appendChild(style);

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

    // Resetowanie interwału przy ponownym wklejeniu
    if (window.mfoFlowerInterval) {
        clearInterval(window.mfoFlowerInterval);
    }

    window.mfoFlowerInterval = setInterval(scanForFlowers, 150);
    
})();
