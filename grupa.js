(function() {
    'use strict';

    const WHITELIST = [
        "Gotrek Gurnisson", 
        "Foxed", 
        "Black Shadow", 
        "Lisiara", 
        "Czarny Cukier", 
        "Kazador",
        "Sugar"
    ];

    const getInviteKey = () => localStorage.getItem('mfo3_val_grupa_k_invite') || "KeyZ";
    const getAcceptKey = () => localStorage.getItem('mfo3_val_grupa_k_accept') || "Enter";

    function quickInvite() {
        const menus = document.querySelectorAll('.itemContainer');
        menus.forEach(menu => {
            const title = menu.querySelector('.menuItemTitleDiv')?.innerText || "";
            if (WHITELIST.some(nick => title.includes(nick))) {
                const btn = Array.from(menu.querySelectorAll('.menuItem, .menuItemHidden'))
                                 .find(el => el.innerText.includes('Zaproś'));
                if (btn) btn.click();
            }
        });
    }

    function quickAccept() {
        const notifies = document.querySelectorAll('.notify-container');
        notifies.forEach(notify => {
            const prompt = notify.querySelector('.NotifierPrompt');
            if (!prompt) return;

            const text = prompt.querySelector('.text')?.innerText || "";
            const isFriend = WHITELIST.some(nick => text.includes(nick));

            if (isFriend) {
                const yesBtn = prompt.querySelector('.yes');
                if (yesBtn) yesBtn.click();
            }
        });
    }

    window.addEventListener('keydown', (e) => {
        const activeTag = document.activeElement.tagName.toLowerCase();
        if (activeTag === 'input' || activeTag === 'textarea') return;

        if (e.code === getInviteKey()) {
            quickInvite();
        }

        if (e.code === getAcceptKey()) {
            quickAccept();
        }
    });
})();
