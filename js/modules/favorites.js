// Favoriten System
// Stern-Markierung und Sortierung von Rechnern

function initFavorites() {
    const container = document.getElementById('view-rechner');
    if (!container) {
        return;
    }
    const favs = loadFavorites();
    container.querySelectorAll('.card:not(.note-card)')
        .forEach((card, index) => processCard(card, index, favs));

    reorderFavoriteCards(favs);
    window.applyInitialCategory?.();
}

function loadFavorites() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.FAVORITES)) || [];
}

function rememberCardPosition(card, index, cardId) {
    if (!card.dataset.originalIndex) {
        card.dataset.originalIndex = String(index);
    }
    card.dataset.cardId = cardId;
}

function processCard(card, index, favs) {
    const titleEl = card.querySelector('h3');
    if (!titleEl) {
        return;
    }
    const cardId = titleEl.innerText.trim();
    rememberCardPosition(card, index, cardId);
    titleEl.appendChild(createStarElement(card, cardId, favs));
}

function createStarElement(card, cardId, favs) {
    const star = document.createElement('span');
    applyStarStyles(star);

    const isFavorite = favs.includes(cardId);
    updateStarState(star, card, isFavorite);

    star.onclick = function (e) {
        e.stopPropagation();
        toggleFavorite(card, cardId, star);
    };

    return star;
}

function applyStarStyles(star) {
    star.style.float = 'right';
    star.style.cursor = 'pointer';
    star.style.fontSize = '1.2rem';
}

function updateStarState(star, card, isFavorite) {
    star.innerText = isFavorite ? '⭐' : '☆';
    card.classList.toggle('is-favorite', isFavorite);
}

function toggleFavorite(card, id, starEl) {
    const current = loadFavorites();
    const updated = current.includes(id)
        ? removeFavorite(current, id, starEl, card)
        : addFavorite(current, id, starEl, card);

    saveFavorites(updated);
    reorderFavoriteCards(updated);
    window.refreshFavoriteFilter?.();
}

function removeFavorite(favs, id, starEl, card) {
    const filtered = favs.filter(f => f !== id);
    starEl.innerText = '☆';
    card.classList.remove('is-favorite');
    return filtered;
}

function addFavorite(favs, id, starEl, card) {
    favs.push(id);
    starEl.innerText = '⭐';
    card.classList.add('is-favorite');
    alert('Zu Favoriten hinzugefügt! (Erscheint jetzt immer oben)');
    return favs;
}

function saveFavorites(favs) {
    localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(favs));
}

function reorderFavoriteCards(favs) {
    const container = document.getElementById('view-rechner');
    if (!container) {
        return;
    }

    const cards = Array.from(container.querySelectorAll('.card:not(.note-card)'));
    if (!cards.length) {
        return;
    }

    const sorted = sortCardsByFavorite(cards, favs);
    insertSortedCards(container, sorted);
}

function isFavoriteCard(card, favs) {
    return favs.includes(card.dataset.cardId || '') ? 1 : 0;
}

function compareCards(a, b, favs) {
    const favDiff = isFavoriteCard(b, favs) - isFavoriteCard(a, favs);
    if (favDiff !== 0) {
        return favDiff;
    }
    return Number(a.dataset.originalIndex || 0) - Number(b.dataset.originalIndex || 0);
}

/**
 * Favoriten nach oben, sonst urspruengliche Reihenfolge
 */
function sortCardsByFavorite(cards, favs) {
    return cards.slice().sort((a, b) => compareCards(a, b, favs));
}

/**
 * Element, hinter dem die Rechner-Karten einsortiert werden
 */
function findCardInsertAnchor(container) {
    const searchInput = document.getElementById('calcSearchInput');
    return searchInput?.parentElement
        || container.querySelector('#calc-categories')
        || container.firstElementChild;
}

function insertSortedCards(container, sorted) {
    let insertAfter = findCardInsertAnchor(container);

    if (!insertAfter) {
        sorted.forEach(card => container.appendChild(card));
        return;
    }
    sorted.forEach(card => {
        container.insertBefore(card, insertAfter.nextSibling);
        insertAfter = card;
    });
}
