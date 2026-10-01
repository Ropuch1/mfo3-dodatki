(function () {
    'use strict';

    // 1. Style CSS (Ukrywanie lewej kolumny + korekta pozycji mapy i kontenera)
    const style = document.createElement('style');
    style.id = 'mfo-widget-custom-style';
    style.innerHTML = `
        /* Ukrycie lewej kolumny */
        body.mfo-hide-left .left-column {
            display: none !important;
        }

        /* Poprawka pozycji absolutnej silnika mapy na zwolnione miejsce */
        body.mfo-hide-left #map-frame,
        body.mfo-hide-left .MapEngine,
        body.mfo-hide-left #map-placeholder {
            left: 15px !important;
        }

        /* Dopasowanie szerokości głównej ramki gry */
        body.mfo-hide-left #page_wrapper {
            width: 807px !important;
        }
    `;

    if (!document.getElementById('mfo-widget-custom-style')) {
        document.head.appendChild(style);
    }

    // 2. Aktualizacja układu strony na podstawie ustawień
    function updateLayout() {
        const isHidden = localStorage.getItem('mfo_hide_left') === 'true';

        if (isHidden) {
            document.body.classList.add('mfo-hide-left');
        } else {
            document.body.classList.remove('mfo-hide-left');
        }

        // Odświeżenie płótna gry i czatu
        window.dispatchEvent(new Event('resize'));
    }

    // 3. Wstrzykiwanie wiersza "Lewa kolumna" do okna widżetów
    function injectWidgetOption() {
        const dialogTitle = document.querySelector('.dialog-title');
        if (!dialogTitle || !dialogTitle.textContent.includes('Konfiguracja widżetów')) return;

        const tableBody = document.querySelector('.data-table tbody');
        if (!tableBody || document.getElementById('mfo-custom-left-col-row')) return;

        // Domyślnie kolumna jest widoczna (aktywna = true)
        const isHidden = localStorage.getItem('mfo_hide_left') === 'true';
        const isChecked = !isHidden;

        const rowClass = tableBody.children.length % 2 === 0 ? 'even' : 'odd';

        const tr = document.createElement('tr');
        tr.id = 'mfo-custom-left-col-row';
        tr.className = rowClass;
        tr.innerHTML = `
            <td class="enabled">
                <div class="WUI_Checkbox">
                    <input class="WUI_Checkbox" type="checkbox" id="mfo-left-col-checkbox" ${isChecked ? 'checked="checked"' : ''}>
                </div>
            </td>
            <td class="name">Lewa kolumna</td>
            <td class="collapsed" style="color: #888; text-align: center;">-</td>
            <td class="max_height" style="color: #888; text-align: center;">-</td>
        `;

        tableBody.appendChild(tr);

        const checkbox = document.getElementById('mfo-left-col-checkbox');

        const saveState = () => {
            if (!checkbox) return;
            const active = checkbox.checked;
            localStorage.setItem('mfo_hide_left', (!active).toString());
            updateLayout();
        };

        checkbox.addEventListener('change', saveState);

        const saveBtn = document.querySelector('.commandButtons a');
        if (saveBtn) {
            saveBtn.addEventListener('click', saveState);
        }
    }

    // 4. Obserwator zmian struktury DOM (wykrywa moment otwarcia okna)
    const observer = new MutationObserver(() => {
        injectWidgetOption();
    });

    observer.observe(document.body, { childList: true, subtree: true });

    // Uruchomienie układu przy starcie skryptu
    updateLayout();
})();
