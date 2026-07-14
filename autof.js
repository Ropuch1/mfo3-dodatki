(function() {
    'use strict';
    window.confirm = function() { return true; };
    window.addEventListener('keydown', function(e) {
        if (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA') return;
        if (e.key.toLowerCase() === 'f') {
            const clickByText = (text) => {
                const elements = document.querySelectorAll('div, span, .menuItemTitleDiv, .WUI_Button');
                for (let el of elements) {
                    if (el.textContent.trim() === text) {
                        el.click();
                        return true;
                    }
                }
                return false;
            };
            if (!clickByText("Aktywuj auto-walkę")) {
                console.log("MFO3: Otwieram opcje w tle...");
                clickByText("Opcje");
                setTimeout(() => {
                    if (clickByText("Aktywuj auto-walkę")) {
                        console.log("MFO3: Auto-walka kliknięta!");
                    }
                }, 30);
            } else {
                console.log("MFO3: Auto-walka aktywowana błyskawicznie.");
            }
        }
    });
})();
