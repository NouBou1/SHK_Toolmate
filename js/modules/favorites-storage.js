// Favoriten-Speicher
//
// Nur Lesen und Schreiben der gemerkten Rechner-IDs. Bewusst getrennt von
// favorites.js: Die Navigation braucht die Liste zum Filtern, die
// Sternchen-Logik braucht zusaetzlich die Navigation. Ohne diese Trennung
// wuerden sich beide Module gegenseitig importieren.

import { STORAGE_KEYS } from '../core/constants.js';

/**
 * @returns {string[]} IDs der als Favorit markierten Rechner
 */
export function loadFavorites() {
    try {
        return JSON.parse(localStorage.getItem(STORAGE_KEYS.FAVORITES)) || [];
    } catch (err) {
        console.error('Favoriten konnten nicht gelesen werden:', err);
        return [];
    }
}

export function saveFavorites(favs) {
    localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(favs));
}
