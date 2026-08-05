// Utility Funktionen
// Ergebnis-Anzeige, Teilen und allgemeine Hilfsfunktionen

export function showResult(elementId, text, isError = false) {
    const el = document.getElementById(elementId);
    if (!el) {
        return;
    }

    makeVisible(el);
    setStyles(el, isError);
    setContent(el, text, isError);
    animateUpdate(el);
}

function makeVisible(el) {
    el.style.display = 'block';
}

function setStyles(el, isError) {
    el.style.backgroundColor = isError ? 'rgba(180, 0, 0, 0.2)' : 'rgba(0, 86, 179, 0.2)';
    el.style.borderColor = isError ? '#ff4444' : '#0056b3';
}

function setContent(el, text, isError) {
    const htmlText = text.replace(/\n/g, '<br>');

    if (isError) {
        el.innerHTML = `<strong>[FEHLER]</strong><br>${htmlText}`;
    } else {
        el.setAttribute('data-result-text', text);
        el.innerHTML = createResultHTML(htmlText);
    }
}

function createResultHTML(htmlText) {
    return `
        <div>${htmlText}</div>
        <div class="result-actions">
            <button class="small-btn secondary btn-share" data-action="shareResult">
                📤 Senden / Kopieren
            </button>
        </div>
    `;
}

function animateUpdate(el) {
    el.classList.remove('updated');
    void el.offsetWidth;
    el.classList.add('updated');
}

export function shareResult(btn) {
    const box = btn.closest('.result-box');
    const textToShare = 'SHK-ToolMate Ergebnis:\n\n' + box.getAttribute('data-result-text');

    if (navigator.share) {
        shareNatively(textToShare);
    } else {
        copyToClipboard(textToShare, btn);
    }
}

function shareNatively(text) {
    navigator.share({
        title: 'SHK-ToolMate Berechnung',
        text: text
    })
        .then(() => console.log('Erfolgreich geteilt'))
        .catch((error) => console.log('Teilen abgebrochen', error));
}

function copyToClipboard(text, btn) {
    navigator.clipboard.writeText(text).then(() => {
        showCopyConfirmation(btn);
    });
}

function showCopyConfirmation(btn) {
    const originalText = btn.innerHTML;
    btn.innerHTML = '[OK] Kopiert!';
    setTimeout(() => btn.innerHTML = originalText, 2000);
}

export function filterCalculators() {
    const input = document.getElementById('calcSearchInput');
    const filter = input.value.toLowerCase();
    const container = document.getElementById('view-rechner');
    const cards = container.getElementsByClassName('card');

    filterCardsByText(cards, filter);
}

function filterCardsByText(cards, filter) {
    for (let i = 0; i < cards.length; i++) {
        const card = cards[i];
        const text = card.innerText || card.textContent;

        if (text.toLowerCase().indexOf(filter) > -1) {
            card.style.display = '';
        } else {
            card.style.display = 'none';
        }
    }
}

export function setupAccessibilityFeatures() {
    const toggleableHeaders = document.querySelectorAll('[aria-controls]');

    toggleableHeaders.forEach(button => {
        button.addEventListener('keydown', handleAccessibleToggle);
    });
}

function handleAccessibleToggle(e) {
    if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        this.click();
    }
}

// Event Delegation für dynamisch hinzugefügte Felder
export function setupDynamicInputHandling() {
    document.addEventListener('focus', (e) => {
        if (isInputElement(e.target) && !e.target.dataset.autoScrollEnabled) {
            setTimeout(() => {
                scrollIntoView(e.target);
            }, 300);
        }
    }, true);
}

function isInputElement(element) {
    return element.tagName === 'INPUT' ||
           element.tagName === 'TEXTAREA' ||
           element.tagName === 'SELECT';
}

function scrollIntoView(element) {
    element.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
        inline: 'nearest'
    });
}
