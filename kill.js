(function() {
    'use strict';

    let TRIGGER_CODE = 'KeyX'; 
    try {
        const savedKey = localStorage.getItem('mfo3_val_kill_k_kill') || localStorage.getItem('kill_k_kill') || localStorage.getItem('k_kill');
        if (savedKey) {
            TRIGGER_CODE = savedKey;
        }
    } catch(e) {}

    window.addEventListener('keydown', function(event) {
        if (['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) {
            return;
        }

        if (event.code === TRIGGER_CODE) {
            event.preventDefault();
            if (typeof window.clickNearestMonsterDOM === 'function') {
                window.clickNearestMonsterDOM();
            }
        }
    }, true);

    const injectedCode = function() {
        let retryInterval = null;

        window.clickNearestMonsterDOM = function() {
            if (retryInterval) return;

            function tryAttack() {
                if (typeof MapEngine === 'undefined' || !MapEngine.instance || !document.id('_player_position')) {
                    return false;
                }

                const engine = MapEngine.instance;
                const posEl = document.id('_player_position');
                const [playerX, playerY] = posEl.get('text').split(',').map(num => parseInt(num.trim()));

                // ZMIANA TUTAJ: Szukamy elementów zaczynających się od "monster_" LUB "event_"
                const targetElements = document.getElements('div[id^="monster_"][id$="_dom"], div[id^="event_"][id$="_dom"]');
                let closestTargetDOM = null;
                let minDistance = Infinity;

                targetElements.each(function(el) {
                    const overlay = el.getNext('.overlay');
                    if (overlay && overlay.getStyle('visibility') !== 'hidden' && overlay.getStyle('opacity') !== '0') {
                        const rawId = el.get('id');
                        // Usuwamy "_dom" oraz obsługujemy oba prefiksy
                        const cleanId = rawId.replace('_dom', '');

                        let targetX, targetY;
                        const engineNPC = (engine.npcs && engine.npcs[cleanId]) ||  
                                          (engine.map && engine.map.events && engine.map.events[cleanId]);

                        if (engineNPC && engineNPC.x !== undefined && engineNPC.y !== undefined) {
                            targetX = engineNPC.x;
                            targetY = engineNPC.y;
                        } else {
                            const left = parseInt(el.getStyle('left'));
                            const top = parseInt(el.getStyle('top'));
                            const height = parseInt(el.getStyle('height')) || 80;
                            if (!isNaN(left) && !isNaN(top)) {
                                targetX = Math.round(left / 32);
                                targetY = Math.round((top + height - 16) / 32);
                            }
                        }

                        if (targetX !== undefined && targetY !== undefined) {
                            const distance = Math.abs(playerX - targetX) + Math.abs(playerY - targetY);
                            if (distance < minDistance) {
                                minDistance = distance;
                                closestTargetDOM = el;
                            }
                        }
                    }
                });

                if (closestTargetDOM) {
                    const fakeEvent = {
                        stop: function() {},
                        target: closestTargetDOM,
                        type: 'click'
                    };

                    if (typeof closestTargetDOM.fireEvent === 'function') {
                        closestTargetDOM.fireEvent('click', fakeEvent);
                    }

                    const overlayEl = closestTargetDOM.getNext('.overlay');
                    if (overlayEl && typeof overlayEl.fireEvent === 'function') {
                        fakeEvent.target = overlayEl;
                        overlayEl.fireEvent('click', fakeEvent);
                    }
                    return true;
                }
                return false;
            }

            const success = tryAttack();
            if (!success) {
                retryInterval = setInterval(function() {
                    if (tryAttack()) {
                        clearInterval(retryInterval);
                        retryInterval = null;
                    }
                }, 50);

                setTimeout(function() {
                    if (retryInterval) {
                        clearInterval(retryInterval);
                        retryInterval = null;
                    }
                }, 4000);
            }
        };
    };

    const script = document.createElement('script');
    script.textContent = `(${injectedCode.toString()})();`;
    document.documentElement.appendChild(script);
})();
