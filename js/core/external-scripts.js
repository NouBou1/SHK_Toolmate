// Nachladen externer Bibliotheken
// Externe Skripte werden erst nach ausdruecklicher Zustimmung geladen,
// weil dabei die IP-Adresse an den Drittanbieter uebertragen wird.

export const EXTERNAL_OPT_IN_KEYS = {
    pdf: 'shk_external_pdf_opt_in'
};

export const EXTERNAL_LIB_URLS = {
    jsPdf: 'https://cdn.jsdelivr.net/npm/jspdf@2.5.1/dist/jspdf.umd.min.js'
};

export function hasExternalOptIn(optInKey) {
    return localStorage.getItem(optInKey) === 'true';
}

export function askForExternalOptIn(optInKey, serviceName) {
    const accepted = confirm(
        `${serviceName} wird von einem Drittanbieter geladen. ` +
        'Dabei wird deine IP an den Dienst uebertragen. Fortfahren?'
    );
    if (accepted) {
        localStorage.setItem(optInKey, 'true');
    }
    return accepted;
}

function attachScriptCallbacks(script, resolve, reject) {
    script.addEventListener('load', () => resolve());
    script.addEventListener('error', () => reject(new Error('Script load failed')));
}

function createExternalScript(scriptId, src, resolve, reject) {
    const script = document.createElement('script');
    script.id = scriptId;
    script.src = src;
    script.async = true;
    script.onload = () => {
        script.dataset.loaded = 'true';
        resolve();
    };
    script.onerror = () => reject(new Error('Script load failed'));
    document.head.appendChild(script);
}

/**
 * Laedt ein externes Skript genau einmal nach.
 * Ein bereits vorhandenes Tag wird wiederverwendet.
 */
export function loadExternalScriptOnce(scriptId, src) {
    return new Promise((resolve, reject) => {
        const existing = document.getElementById(scriptId);
        if (!existing) {
            createExternalScript(scriptId, src, resolve, reject);
        } else if (existing.dataset.loaded === 'true') {
            resolve();
        } else {
            attachScriptCallbacks(existing, resolve, reject);
        }
    });
}
