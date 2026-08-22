(function() {
    'use strict';

    function switchFighter() {
        const allFighters = Array.from(document.querySelectorAll('.dialog-content .fighter-cnt'));
        
        const humanFighters = allFighters.filter(cnt => {
            const fighterSpan = cnt.querySelector('.fighter');
            if (!fighterSpan) return false;
            const realId = fighterSpan.getAttribute('real_id') || '';
            return realId.startsWith('P:');
        });

        if (humanFighters.length === 0) return;

        const currentIndex = humanFighters.findIndex(f => f.classList.contains('selected'));

        let nextIndex = 0;
        if (currentIndex !== -1) {
            nextIndex = (currentIndex + 1) % humanFighters.length;
        }

        const nextFighter = humanFighters[nextIndex].querySelector('.fighter') || humanFighters[nextIndex];
        nextFighter.click();
    }

    window.addEventListener('keydown', (e) => {
        // Ignorujemy skrót, jeśli wciśnięto Ctrl, Alt, Shift lub Meta (pozwala na Ctrl+C, Ctrl+Shift+C itp.)
        if (e.ctrlKey || e.altKey || e.shiftKey || e.metaKey) return;
        if (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA') return;
        
        const keyDrop = localStorage.getItem('mfo3_val_drop_k_drop') || 'KeyC';

        if (e.code === keyDrop) { 
            e.preventDefault(); 
            switchFighter(); 
        }
    }, true);
})();
