// ==========================================
// SHK-MATE - Validierungs-Hilfsfunktionen
// ==========================================
// Wiederverwendbare Funktionen für Input-Validierung
// und Fehlerbehandlung

// Konstanten aus constants.js global verf�gbar

/**
 * Prüft ob ein Wert eine gültige Zahl ist
 * @param {any} value - Zu prüfender Wert
 * @returns {boolean} True wenn gültige Zahl
 */
function isValidNumber(value) {
    return !isNaN(value) && isFinite(value) && value !== null && value !== '';
}

/**
 * Holt und validiert einen numerischen Input aus einem Formular-Element
 * 
 * @param {string} elementId - ID des Input-Elements
 * @param {Object} options - Validierungs-Optionen
 * @param {number} options.min - Minimalwert (optional)
 * @param {number} options.max - Maximalwert (optional)
 * @param {boolean} options.allowZero - Erlaube 0 als Wert (Standard: false)
 * @param {boolean} options.required - Feld ist Pflichtfeld (Standard: true)
 * 
 * @returns {number|null} Validierter Wert oder null bei Fehler
 * 
 * @example
 * const area = getValidatedInput('floor_area', { min: 0.1, max: 1000 });
 * if (area === null) {
 *     showResult('result_id', 'Ungültige Fläche', true);
 *     return;
 * }
 */
function getValidatedInput(elementId, options = {}) {
    const {
        min = -Infinity,
        max = Infinity,
        allowZero = false,
        required = true
    } = options;

    try {
        // Element holen
        const element = document.getElementById(elementId);
        if (!element) {
            console.error(`Element not found: ${elementId}`);
            return null;
        }

        // Wert holen und parsen
        const rawValue = element.value.trim();
        
        // Leeres Feld prüfen
        if (rawValue === '') {
            if (required) {
                return null;
            }
            return null; // Optional und leer = null
        }

        const value = parseFloat(rawValue);

        // Validierung
        if (!isValidNumber(value)) {
            return null;
        }

        if (!allowZero && value === 0) {
            return null;
        }

        if (value < min || value > max) {
            return null;
        }

        return value;

    } catch (error) {
        console.error(`Error in getValidatedInput(${elementId}):`, error);
        return null;
    }
}

/**
 * Validiert mehrere Inputs gleichzeitig
 * 
 * @param {Array<Object>} inputs - Array von Input-Definitionen
 * @returns {Object|null} Objekt mit validierten Werten oder null bei Fehler
 * 
 * @example
 * const values = validateMultipleInputs([
 *     { id: 'floor_area', key: 'area', min: 0.1, max: 1000 },
 *     { id: 'heat_factor', key: 'factor', min: 10, max: 200 }
 * ]);
 * 
 * if (!values) {
 *     showResult('result', 'Ungültige Eingaben', true);
 *     return;
 * }
 * 
 * // Verwendung: values.area, values.factor
 */
function validateMultipleInputs(inputs) {
    const result = {};
    
    for (const input of inputs) {
        const value = getValidatedInput(input.id, {
            min: input.min,
            max: input.max,
            allowZero: input.allowZero,
            required: input.required
        });
        
        if (value === null) {
            console.warn(`Validation failed for: ${input.id}`);
            return null;
        }
        
        result[input.key || input.id] = value;
    }
    
    return result;
}

/**
 * Erstellt eine detaillierte Fehlermeldung basierend auf Validierungs-Optionen
 * 
 * @param {string} fieldName - Name des Feldes für Fehlermeldung
 * @param {Object} options - Validierungs-Optionen
 * @returns {string} Fehlermeldung
 */
function getValidationErrorMessage(fieldName, options = {}) {
    const { min, max, allowZero } = options;
    
    if (min !== undefined && max !== undefined) {
        return `${fieldName}: Bitte Wert zwischen ${min} und ${max} eingeben`;
    }
    
    if (min !== undefined) {
        if (!allowZero && min === 0) {
            return `${fieldName}: Bitte Wert größer als 0 eingeben`;
        }
        return `${fieldName}: Bitte Wert mindestens ${min} eingeben`;
    }
    
    if (max !== undefined) {
        return `${fieldName}: Bitte Wert maximal ${max} eingeben`;
    }
    
    return `${fieldName}: ${ERROR_MESSAGES.INVALID_NUMBER}`;
}

/**
 * Safe localStorage Getter mit Fehlerbehandlung
 * 
 * @param {string} key - Storage Key
 * @param {any} defaultValue - Standard-Rückgabewert bei Fehler
 * @returns {any} Gespeicherter Wert oder defaultValue
 */
function safeGetStorage(key, defaultValue = null) {
    try {
        const item = localStorage.getItem(key);
        if (item === null) {
            return defaultValue;
        }
        
        // Versuche JSON zu parsen
        try {
            return JSON.parse(item);
        } catch {
            // Wenn kein JSON, gib String zurück
            return item;
        }
    } catch (error) {
        console.error(`Error reading from localStorage (${key}):`, error);
        return defaultValue;
    }
}

/**
 * Safe localStorage Setter mit Fehlerbehandlung
 * 
 * @param {string} key - Storage Key
 * @param {any} value - Zu speichernder Wert
 * @returns {boolean} True bei Erfolg, false bei Fehler
 */
function safeSetStorage(key, value) {
    try {
        const serialized = typeof value === 'string' ? value : JSON.stringify(value);
        localStorage.setItem(key, serialized);
        return true;
    } catch (error) {
        if (error.name === 'QuotaExceededError') {
            console.error('LocalStorage quota exceeded!');
            showUserNotification(ERROR_MESSAGES.STORAGE_FULL, 'error');
        } else {
            console.error(`Error writing to localStorage (${key}):`, error);
            showUserNotification(ERROR_MESSAGES.STORAGE_ERROR, 'error');
        }
        return false;
    }
}

/**
 * Safe localStorage Remover
 * 
 * @param {string} key - Storage Key
 * @returns {boolean} True bei Erfolg
 */
function safeRemoveStorage(key) {
    try {
        localStorage.removeItem(key);
        return true;
    } catch (error) {
        console.error(`Error removing from localStorage (${key}):`, error);
        return false;
    }
}

/**
 * Zeigt eine Benachrichtigung für den Benutzer
 * 
 * @param {string} message - Nachricht
 * @param {string} type - Typ: 'success', 'error', 'warning', 'info'
 */
function showUserNotification(message, type = 'info') {
    // Existierendes Notification-Element suchen oder erstellen
    let notification = document.getElementById('app-notification');
    
    if (!notification) {
        notification = document.createElement('div');
        notification.id = 'app-notification';
        notification.style.cssText = `
            position: fixed;
            top: 80px;
            left: 50%;
            transform: translateX(-50%);
            padding: 12px 24px;
            border-radius: 8px;
            font-size: 0.9rem;
            font-weight: 600;
            z-index: 10000;
            box-shadow: 0 4px 12px rgba(0,0,0,0.4);
            max-width: 90%;
            text-align: center;
            animation: slideDown 0.3s ease;
        `;
        document.body.appendChild(notification);
    }
    
    // Styling nach Typ
    const colors = {
        success: { bg: '#22C55E', text: '#fff' },
        error: { bg: '#EF4444', text: '#fff' },
        warning: { bg: '#f97316', text: '#fff' },
        info: { bg: '#0056b3', text: '#fff' }
    };
    
    const color = colors[type] || colors.info;
    notification.style.backgroundColor = color.bg;
    notification.style.color = color.text;
    notification.textContent = message;
    notification.style.display = 'block';
    
    // Auto-hide nach 3 Sekunden
    setTimeout(() => {
        notification.style.display = 'none';
    }, 3000);
}

/**
 * Rundet eine Zahl auf n Dezimalstellen
 * 
 * @param {number} value - Zu rundende Zahl
 * @param {number} decimals - Anzahl Dezimalstellen (Standard: 2)
 * @returns {number} Gerundeter Wert
 */
function roundTo(value, decimals = 2) {
    const factor = Math.pow(10, decimals);
    return Math.round(value * factor) / factor;
}

/**
 * Formatiert eine Zahl für die Anzeige (mit Tausender-Trennung)
 * 
 * @param {number} value - Zu formatierende Zahl
 * @param {number} decimals - Anzahl Dezimalstellen
 * @returns {string} Formatierte Zahl
 */
function formatNumber(value, decimals = 2) {
    return new Intl.NumberFormat('de-DE', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
    }).format(value);
}

/**
 * Debounce-Funktion für verzögerte Ausführung
 * 
 * @param {Function} func - Auszuführende Funktion
 * @param {number} wait - Wartezeit in ms
 * @returns {Function} Debounced-Funktion
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}
