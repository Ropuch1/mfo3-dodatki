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
            if (typeof window.clickNearestMonsterDOM === 'function') {
                window.clickNearestMonsterDOM();
            }
        }
    }, true);

    const injectedCode = function() {
        window.clickNearestMonsterDOM = function() {
            if (typeof MapEngine === 'undefined' || !MapEngine.instance) {
                return;
            }

            const engine = MapEngine.instance;
            const posEl = document.id('_player_position');
            if (!posEl) return;
            const [playerX, playerY] = posEl.get('text').split(',').map(num => parseInt(num.trim()));

            const monsterElements = document.getElements('div[id^="monster_"][id$="_dom"]');
            
            let closestMonsterDOM = null;
            let minDistance = Infinity;

            monsterElements.each(function(el) {
                const overlay = el.getNext('.overlay');
                if (overlay && overlay.getStyle('visibility') !== 'hidden' && overlay.getStyle('opacity') !== '0') {
                    
                    const rawId = el.get('id');
                    const cleanId = rawId.replace('_dom', '');

                    let monsterX, monsterY;
                    const engineNPC = (engine.npcs && engine.npcs[cleanId]) || 
                                      (engine.map && engine.map.events && engine.map.events[cleanId]);

                    if (engineNPC && engineNPC.x !== undefined && engineNPC.y !== undefined) {
                        monsterX = engineNPC.x;
                        monsterY = engineNPC.y;
                    } else {
                        const left = parseInt(el.getStyle('left'));
                        const top = parseInt(el.getStyle('top'));
                        const height = parseInt(el.getStyle('height')) || 80;
                        if (!isNaN(left) && !isNaN(top)) {
                            monsterX = Math.round(left / 32);
                            monsterY = Math.round((top + height - 16) / 32);
                        }
                    }

                    if (monsterX !== undefined && monsterY !== undefined) {
                        const distance = Math.abs(playerX - monsterX) + Math.abs(playerY - monsterY);
                        if (distance < minDistance) {
                            minDistance = distance;
                            closestMonsterDOM = el;
                        }
                    }
                }
            });

            if (closestMonsterDOM) {
                const fakeEvent = {
                    stop: function() {},
                    target: closestMonsterDOM,
                    type: 'click'
                };

                if (typeof closestMonsterDOM.fireEvent === 'function') {
                    closestMonsterDOM.fireEvent('click', fakeEvent);
                }

                const overlayEl = closestMonsterDOM.getNext('.overlay');
                if (overlayEl && typeof overlayEl.fireEvent === 'function') {
                    fakeEvent.target = overlayEl;
                    overlayEl.fireEvent('click', fakeEvent);
                }
            }
        };
    };

    const script = document.createElement('script');
    script.textContent = `(${injectedCode.toString()})();`;
    document.documentElement.appendChild(script);
})();
