(function() {
    let lastBattleId = "";
    setInterval(() => {
        const dialog = document.querySelector('.BattleResultsDialog');
        if (dialog && dialog.offsetParent !== null) {
            const replayInput = dialog.querySelector('.replay-link input');
            const currentId = replayInput ? replayInput.value : "";

            if (currentId && currentId !== lastBattleId) {
                lastBattleId = currentId;
                // Szuka potwora (M:) lub pierwszego przegranego
                const enemy = dialog.querySelector('.fighter[real_id^="M:"]') || 
                              dialog.querySelector('.loosers .fighter');
                if (enemy) {
                    setTimeout(() => enemy.click(), 150);
                }
            }
        }
    }, 300);

})();
