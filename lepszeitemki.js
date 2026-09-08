(function() {
    'use strict';

    const oldModal = document.getElementById('mfo-item-modal');
    if (oldModal) oldModal.remove();

    const style = document.createElement('style');
    style.id = 'mfo-modal-style';
    style.innerHTML = `
        .mfo-item-modal {
            position: fixed;
            z-index: 9000;
            cursor: grab;
            user-select: none;
            width: max-content;
            height: max-content;
        }
        .mfo-item-modal:active { cursor: grabbing; }

        .mfo-modal-close {
            position: absolute; top: -6px; right: -6px; cursor: pointer;
            background: #8E621F; color: #FAECD5; font-weight: bold; font-size: 12px;
            width: 22px; height: 22px; display: flex; align-items: center; justify-content: center;
            border-radius: 50%; border: 2px solid #FAECD5;
            box-shadow: 0 2px 5px rgba(0,0,0,0.5);
            z-index: 9999;
        }
        .mfo-modal-close:hover { background: #6b4712; }

        .mfo-modal-body {
            position: relative;
        }
    `;
    document.head.appendChild(style);

    let activeModal = null;
    let startX, startY, initialLeft, initialTop;
    let highestZIndex = 9000;

    document.addEventListener('mousedown', (e) => {
        const modal = e.target.closest('.mfo-item-modal');
        if (!modal) return;
        if (e.target.closest('a') || e.target.classList.contains('mfo-modal-close')) return;

        highestZIndex++;
        modal.style.zIndex = highestZIndex;

        activeModal = modal;
        startX = e.clientX;
        startY = e.clientY;
        const rect = modal.getBoundingClientRect();
        initialLeft = rect.left;
        initialTop = rect.top;
    });

    document.addEventListener('mousemove', (e) => {
        if (!activeModal) return;
        const dx = e.clientX - startX;
        const dy = e.clientY - startY;
        activeModal.style.left = `${initialLeft + dx}px`;
        activeModal.style.top = `${initialTop + dy}px`;
    });

    document.addEventListener('mouseup', () => {
        activeModal = null;
    });

    document.addEventListener('click', function(e) {
        const link = e.target.closest('a');
        if (link && link.href && (link.href.includes('/view/ga/') || link.href.includes('/view/a/'))) {
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();

            highestZIndex++;

            const modal = document.createElement('div');
            modal.className = 'mfo-item-modal';
            modal.style.zIndex = highestZIndex;
            modal.style.left = Math.min(e.clientX + 15, window.innerWidth - 300) + 'px';
            modal.style.top = Math.min(e.clientY + 15, window.innerHeight - 250) + 'px';
            
            modal.innerHTML = `
                <div class="mfo-modal-close">✕</div>
                <div class="mfo-modal-body"><div style="padding: 20px; font-weight: bold; text-align: center; color: #fff; background: rgba(0,0,0,0.5); border-radius: 4px;">Ładowanie...</div></div>
            `;
            
            document.body.appendChild(modal);

            const modalBody = modal.querySelector('.mfo-modal-body');
            const closeBtn = modal.querySelector('.mfo-modal-close');

            closeBtn.addEventListener('mousedown', (ev) => ev.stopPropagation());
            closeBtn.addEventListener('click', () => {
                modal.remove();
            });

            fetch(link.href, { credentials: 'include' })
                .then(response => {
                    if (!response.ok) throw new Error(`Błąd HTTP: ${response.status}`);
                    return response.text();
                })
                .then(html => {
                    const parser = new DOMParser();
                    const doc = parser.parseFromString(html, "text/html");
                    
                    const armorInfo = doc.querySelector('.ArmorInfo');
                    
                    if (armorInfo) {
                        modalBody.innerHTML = '';
                        modalBody.appendChild(armorInfo);
                        
                        modalBody.querySelectorAll('script').forEach(oldScript => {
                            const newScript = document.createElement('script');
                            Array.from(oldScript.attributes).forEach(attr => {
                                newScript.setAttribute(attr.name, attr.value);
                            });
                            newScript.text = oldScript.innerHTML;
                            oldScript.parentNode.replaceChild(newScript, oldScript);
                        });
                    } else {
                        modalBody.innerHTML = '<div style="color: red; padding: 10px; background: rgba(0,0,0,0.8);">Nie znaleziono przedmiotu.</div>';
                    }
                })
                .catch(() => {
                    modalBody.innerHTML = '<div style="color: red; padding: 10px; background: rgba(0,0,0,0.8);">Błąd pobierania danych.</div>';
                });
        }
    }, true);
})();
