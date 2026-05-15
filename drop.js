function initDropSwitcher() {
    document.addEventListener('keydown', function(e) {
        // Ignoruj, jeśli użytkownik pisze w polu tekstowym
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
            return;
        }

        // Reaguj na klawisz 'c' lub 'C'
        if (e.key.toLowerCase() === 'c') {
            // Pobierz wszystkie kontenery walczących
            const allFighters = Array.from(document.querySelectorAll('.dialog-content .fighter-cnt'));
            
            // Filtruj: zostaw tylko graczy (real_id zaczyna się od 'P:')
            const humanFighters = allFighters.filter(cnt => {
                const fighterSpan = cnt.querySelector('.fighter');
                if (!fighterSpan) return false;
                const realId = fighterSpan.getAttribute('real_id') || '';
                return realId.startsWith('P:');
            });

            if (humanFighters.length === 0) return;

            // Znajdź pozycję aktualnie wybranego gracza
            const currentIndex = humanFighters.findIndex(f => f.classList.contains('selected'));

            // Oblicz indeks następnego gracza (z zapętleniem do zera)
            let nextIndex = 0;
            if (currentIndex !== -1) {
                nextIndex = (currentIndex + 1) % humanFighters.length;
            }

            // Kliknij element gracza
            const nextFighter = humanFighters[nextIndex].querySelector('.fighter') || humanFighters[nextIndex];
            nextFighter.click();
        }
    });
}

// Uruchomienie skryptu po pełnym załadowaniu drzewa DOM strony
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initDropSwitcher);
} else {
    initDropSwitcher();
}
