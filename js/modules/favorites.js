// Favoriten System
// Stern-Markierung und Sortierung von Rechnern

function initFavorites() {
    const container = document.getElementById('view-rechner');
    if (!container) return;

    const cards = Array.from(container.querySelectorAll('.card:not(.note-card)'));
    const favs = loadFavorites();

    cards.forEach((card, index) => {
        processCard(card, index, favs);
    });

    reorderFavoriteCards(favs);

    if (typeof applyInitialCategory === 'function') {
        applyInitialCategory();
    }
}

function loadFavorites() {
    return JSON.parse(localStorage.getItem('shk_favs')) || [];
}

function processCard(card, index, favs) {
    const titleEl = card.querySelector('h3');
    if (!titleEl) return;

    const cardId = titleEl.innerText.trim();
    
    if (!card.dataset.originalIndex) {
        card.dataset.originalIndex = String(index);
    }
    card.dataset.cardId = cardId;

    const star = createStarElement(card, cardId, favs);
    titleEl.appendChild(star);
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
    let favs = loadFavorites();

    if (favs.includes(id)) {
        favs = removeFavorite(favs, id, starEl, card);
    } else {
        favs = addFavorite(favs, id, starEl, card);
    }

    saveFavorites(favs);
    reorderFavoriteCards(favs);

    if (typeof refreshFavoriteFilter === 'function') {
        refreshFavoriteFilter();
    }
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
    alert("Zu Favoriten hinzugefügt! (Erscheint jetzt immer oben)");
    return favs;
}

function saveFavorites(favs) {
    localStorage.setItem('shk_favs', JSON.stringify(favs));
}

function reorderFavoriteCards(favs) {
    const container = document.getElementById('view-rechner');
    if (!container) return;

    const cards = Array.from(container.querySelectorAll('.card:not(.note-card)'));
    if (!cards.length) return;

    const sorted = sortCardsByFavorite(cards, favs);
    insertSortedCards(container, sorted);
}

function sortCardsByFavorite(cards, favs) {
    return cards.slice().sort((a, b) => {
        const aId = a.dataset.cardId || '';
        const bId = b.dataset.cardId || '';
        const aFav = favs.includes(aId) ? 1 : 0;
        const bFav = favs.includes(bId) ? 1 : 0;

        if (aFav !== bFav) return bFav - aFav;

        const aIndex = Number(a.dataset.originalIndex || 0);
        const bIndex = Number(b.dataset.originalIndex || 0);
        return aIndex - bIndex;
    });
}

function insertSortedCards(container, sorted) {
    const searchInput = document.getElementById('calcSearchInput');
    let insertAfter = searchInput ? searchInput.parentElement : null;

    if (!insertAfter) {
        insertAfter = container.querySelector('#calc-categories') || container.firstElementChild;
    }

    if (!insertAfter) {
        sorted.forEach(card => container.appendChild(card));
        return;
    }

    sorted.forEach(card => {
        container.insertBefore(card, insertAfter.nextSibling);
        insertAfter = card;
    });
}
