// Event-Delegation
// ==========================================
// Statt onclick="..." im Markup trägt ein Element ein data-Attribut mit
// dem Namen einer Aktion. Ein einziger Listener pro Ereignistyp am
// document leitet weiter - auch an Elemente, die erst später entstehen.
//
//   <button data-action="calcHeizlast">          Klick
//   <input  data-input-action="autoSaveNote">    Eingabe
//   <input  data-change-action="processPhoto">   Auswahl geändert
//
// Zusätzliche Werte reisen als weitere data-Attribute mit und werden
// dem Handler über das Element übergeben:
//
//   <button data-action="updateStock" data-index="3" data-delta="-1">
// ==========================================

const ATTRIBUTE = {
    click: 'data-action',
    input: 'data-input-action',
    change: 'data-change-action'
};

const registries = {
    click: new Map(),
    input: new Map(),
    change: new Map()
};

/**
 * Meldet Aktionen für einen Ereignistyp an
 * @param {string} type - 'click', 'input' oder 'change'
 * @param {Object} handlers - Name der Aktion -> Funktion(element, event)
 */
export function registerActions(type, handlers) {
    for (const [name, handler] of Object.entries(handlers)) {
        registries[type].set(name, handler);
    }
}

function findHandler(type, event) {
    const element = event.target.closest(`[${ATTRIBUTE[type]}]`);
    if (!element) {
        return null;
    }
    const handler = registries[type].get(element.getAttribute(ATTRIBUTE[type]));
    return handler ? { element, handler } : null;
}

function createDispatcher(type) {
    return event => {
        const treffer = findHandler(type, event);
        if (treffer) {
            treffer.handler(treffer.element, event);
        }
    };
}

/**
 * Hängt die Listener ans document. Einmal beim App-Start aufrufen.
 */
export function startActionDispatch() {
    for (const type of Object.keys(ATTRIBUTE)) {
        document.addEventListener(type, createDispatcher(type));
    }
}

/**
 * Kurzform für Handler, die einen Zahlenwert aus einem data-Attribut brauchen
 */
export function withNumber(attribute, handler) {
    return element => handler(Number(element.dataset[attribute]));
}
