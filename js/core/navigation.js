// Navigation & Tab-Switching
// Verwaltung von Tabs und Calculator Kategorien

import { loadFavorites } from '../modules/favorites-storage.js';
import { renderProjectList } from '../modules/projects.js';

export function switchTab(viewId, btn) {
    hideAllContainers();
    showContainer(viewId);
    updateActiveButton(btn);

    if (viewId === 'material') {
        renderProjectList();
    }
}

function hideAllContainers() {
    document.querySelectorAll('.container').forEach(el => {
        el.classList.remove('active');
    });
}

function showContainer(viewId) {
    const container = document.getElementById('view-' + viewId);
    if (container) {
        container.classList.add('active');
    }
}

function updateActiveButton(btn) {
    document.querySelectorAll('.nav-item').forEach(el => {
        el.classList.remove('active');
    });
    btn.classList.add('active');
    btn.focus();
}

// Reiter der Rechner-Ansicht
const CATEGORY_TABS = [
    { id: 'favoriten', name: 'Favoriten' },
    { id: 'alle', name: 'Alle' },
    { id: 'heizung', name: 'Heizung' },
    { id: 'wasser', name: 'Wasser' },
    { id: 'lueftung', name: 'Lüftung' },
    { id: 'misc', name: 'Sonstiges' }
];

// Ordnet Rechner anhand eines Stichworts im Titel einer Kategorie zu
const CALCULATOR_CATEGORIES = {
    'Gaszähler': 'heizung',
    'Heizlast': 'heizung',
    'MAG': 'heizung',
    'HK-Leistung': 'heizung',
    'Leistung-Check': 'heizung',
    'Hydraulischer Abgleich': 'heizung',
    'Pumpe': 'heizung',
    'Kesselleistung': 'heizung',
    'Spreizung': 'heizung',
    'Mischwasser': 'wasser',
    'Aufheizzeit': 'wasser',
    'Zirkulation': 'wasser',
    'Strömungsgeschwindigkeit': 'wasser',
    'Rohr-Inhalt': 'wasser',
    'Abwasser': 'wasser',
    'Kondensat': 'wasser',
    'Tank': 'wasser',
    'Lüftung': 'lueftung',
    'Kernbohrung': 'misc',
    'Schellen': 'misc',
    'Etagen': 'misc'
};

export function initCalculatorCategories() {
    assignCategoriesToCards();
    renderCategoryButtons(CATEGORY_TABS);
}

function findCategory(title) {
    const match = Object.keys(CALCULATOR_CATEGORIES).find(keyword => title.includes(keyword));
    return match ? CALCULATOR_CATEGORIES[match] : 'misc';
}

function assignCategoriesToCards() {
    const cards = document.querySelectorAll('#view-rechner .card:not(.note-card)');

    cards.forEach(card => {
        const heading = card.querySelector('h3');
        if (heading) {
            card.setAttribute('data-calc-category', findCategory(heading.textContent));
        }
    });
}

function renderCategoryButtons(categories) {
    const container = document.getElementById('calc-categories');
    if (!container) {
        return;
    }

    categories.forEach(cat => {
        const btn = createCategoryButton(cat, cat.id === 'alle');
        container.appendChild(btn);
    });
}

function createCategoryButton(cat, isActive) {
    const btn = document.createElement('button');
    btn.className = 'calc-cat-btn';
    btn.classList.toggle('active', isActive);
    btn.dataset.cat = cat.id;
    btn.dataset.action = 'filterByCategory';

    const label = document.createElement('span');
    label.textContent = cat.name;
    btn.append(label);
    return btn;
}

export function filterByCategory(categoryId, button) {
    updateActiveCategoryButton(button);
    filterCards(categoryId);
}

function updateActiveCategoryButton(button) {
    document.querySelectorAll('.calc-cat-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    button.classList.add('active');
}

function shouldShowCard(card, categoryId, favoriteIds) {
    if (favoriteIds) {
        return favoriteIds.includes(card.dataset.cardId);
    }
    return categoryId === 'alle' || card.getAttribute('data-calc-category') === categoryId;
}

/**
 * Blendet die Rechner-Karten ein bzw. aus
 * @returns {number} Anzahl der sichtbaren Rechner (ohne Notiz-Karte)
 */
function applyCardFilter(categoryId, favoriteIds) {
    let visible = 0;

    document.querySelectorAll('#view-rechner .card').forEach(card => {
        if (card.classList.contains('note-card')) {
            card.classList.remove('u-hidden');
            return;
        }
        const show = shouldShowCard(card, categoryId, favoriteIds);
        card.classList.toggle('u-hidden', !show);
        visible += show ? 1 : 0;
    });
    return visible;
}

function filterCards(categoryId) {
    const favoriteIds = categoryId === 'favoriten' ? getFavoriteIds() : null;
    const visible = applyCardFilter(categoryId, favoriteIds);

    updateEmptyFavoritesHint(categoryId === 'favoriten' && visible === 0);
}

function getFavoriteIds() {
    return loadFavorites();
}

function createFavoritesHint() {
    const hint = document.createElement('p');
    hint.id = 'fav-empty-hint';
    hint.className = 'fav-empty-hint';
    hint.innerText = 'Noch keine Favoriten. Tippe den Stern neben einem Rechner an, um ihn hier abzulegen.';
    return hint;
}

function updateEmptyFavoritesHint(show) {
    const existing = document.getElementById('fav-empty-hint');
    if (!show) {
        existing?.remove();
        return;
    }
    if (existing) {
        return;
    }
    const categories = document.getElementById('calc-categories');
    categories?.parentElement?.insertBefore(createFavoritesHint(), categories.nextSibling);
}

export function applyInitialCategory() {
    const favs = getFavoriteIds();
    if (!favs.length) {
        return;
    }

    const btn = document.querySelector('.calc-cat-btn[data-cat="favoriten"]');
    if (!btn) {
        return;
    }
    filterByCategory('favoriten', btn);
}

export function refreshFavoriteFilter() {
    const active = document.querySelector('.calc-cat-btn.active');
    if (active?.dataset.cat === 'favoriten') {filterCards('favoriten');}
}

function handleNavKeydown(event, navItems, index) {
    const nextIndex = getNextIndex(event.key, index, navItems.length);
    if (nextIndex === index) {
        return;
    }
    event.preventDefault();
    navItems[nextIndex].focus();
    navItems[nextIndex].click();
}

export function setupNavigationKeyboard() {
    const navItems = document.querySelectorAll('.nav-item');

    navItems.forEach((item, index) => {
        item.addEventListener('keydown', event => handleNavKeydown(event, navItems, index));
    });
}

function getNextIndex(key, currentIndex, totalItems) {
    if (key === 'ArrowRight') {
        return (currentIndex + 1) % totalItems;
    } else if (key === 'ArrowLeft') {
        return (currentIndex - 1 + totalItems) % totalItems;
    }
    return currentIndex;
}

