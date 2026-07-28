// ==========================================
// SHK-MATE - Konstanten & Konfiguration
// ==========================================
// Zentrale Definition aller Konstanten für Berechnungen
// und Konfigurationsparameter der App
//
// WICHTIG: Diese Datei MUSS vor allen anderen Scripts geladen werden!

// ========== HEIZUNG ==========

/**
 * Heizlast-Faktoren nach Gebäudestandard (W/m²)
 * Quelle: DIN EN 12831, Überschlägswerte
 */
const HEAT_LOAD_FACTORS = {
    UNINSULATED: 120,      // Altbau ungedämmt
    RENOVATED: 80,         // Altbau saniert
    NEW_BUILD: 50,         // Neubau Standard
    PASSIVE_HOUSE: 15      // Passivhaus
};

/**
 * MAG (Membran-Ausdehnungsgefäß) Konfiguration
 * Quelle: VDI 4708
 */
const MAG_CONFIG = {
    METERS_TO_BAR: 10,              // Umrechnung: 10m = 1 bar
    SAFETY_OFFSET_BAR: 0.3,         // Mindestzuschlag zur Verdampfungsvermeidung
    FILL_PRESSURE_OFFSET_BAR: 0.3   // Zusätzlicher Fülldruck über P0
};

/**
 * Volumenstrom-Berechnung
 * Spezifische Wärmekapazität Wasser
 */
const WATER_HEAT_CAPACITY = 1.163; // Wh/(kg*K)

// ========== WASSER ==========

/**
 * Rohrinhalt pro Meter nach DN (Liter/Meter)
 * Annäherungswerte für Cu/C-Stahl Rohre
 */
const PIPE_VOLUME_FACTORS = {
    12: 0.13,  // DN 12 (~13mm innen)
    15: 0.20,  // DN 15 (~16mm innen)
    20: 0.31,  // DN 20 (~20mm innen)
    25: 0.53,  // DN 25 (~26mm innen)
    32: 0.85,  // DN 32 (~33mm innen)
    40: 1.25,  // DN 40 (~40mm innen)
    50: 2.04   // DN 50 (~51mm innen)
};

/**
 * Zirkulation: Kritische Grenze
 * Nach DVGW W 551 (Trinkwasserhygiene)
 */
const CIRCULATION_LIMIT_LITERS = 3; // Max. Inhalt ohne Zirkulation

/**
 * Strömungsgeschwindigkeit: Empfohlene Bereiche (m/s)
 * Quelle: VDI 2035
 */
const FLOW_VELOCITY = {
    MIN: 0.5,  // Minimum (Ablagerungsgefahr)
    MAX: 2.0   // Maximum (Erosion/Geräusche)
};

// ========== LÜFTUNG ==========

/**
 * Luftwechselraten nach Raumtyp (1/h)
 * Quelle: DIN 1946-6
 */
const AIR_CHANGE_RATES = {
    LIVING_ROOM: 0.5,
    BEDROOM: 0.5,
    KITCHEN: 1.5,
    BATHROOM: 2.0,
    WC: 2.0
};

/**
 * Luftdichte bei 20°C (kg/m³)
 */
const AIR_DENSITY = 1.2;

// ========== GAS ==========

/**
 * Gaszähler: Standard-Messvolumen
 */
const GAS_METER_VOLUMES = {
    SMALL: 0.01,   // 0,01 m³ = 10 Liter (Standard)
    MEDIUM: 0.1,   // 0,1 m³ = 100 Liter
    LARGE: 1.0     // 1,0 m³ = 1000 Liter
};

/**
 * Gas-Brennwerte (kWh/m³)
 * Durchschnittswerte
 */
const GAS_HEATING_VALUES = {
    NATURAL_GAS: 10.0,  // Erdgas H (ca. 10 kWh/m³)
    PROPANE: 25.9,      // Flüssiggas Propan
    BUTANE: 34.0        // Flüssiggas Butan
};

// ========== VALIDIERUNG ==========

/**
 * Eingabe-Validierung: Grenzen
 */
const INPUT_LIMITS = {
    // Heizung
    FLOOR_AREA_MIN: 0.1,        // m²
    FLOOR_AREA_MAX: 10000,      // m²
    HEIGHT_MIN: 0.1,            // m
    HEIGHT_MAX: 200,            // m
    POWER_MIN: 0.1,             // kW
    POWER_MAX: 10000,           // kW
    
    // Wasser
    PIPE_LENGTH_MIN: 0.1,       // m
    PIPE_LENGTH_MAX: 10000,     // m
    TEMPERATURE_MIN: -273.15,   // °C (absoluter Nullpunkt)
    TEMPERATURE_MAX: 300,       // °C
    VOLUME_MIN: 0.001,          // Liter
    VOLUME_MAX: 1000000,        // Liter
    
    // Allgemein
    TIME_MIN: 0.1,              // Sekunden
    TIME_MAX: 86400             // Sekunden (24h)
};

// ========== UI KONFIGURATION ==========

/**
 * Verzögerungen für UI-Updates (Millisekunden)
 */
const UI_DELAYS = {
    INIT_FAVORITES: 500,        // Zeit für HTML-Rendering
    ANIMATION_DURATION: 300,    // Standard-Animation
    SAVE_DEBOUNCE: 1000,       // Auto-Save Verzögerung
    NOTIFICATION_DISPLAY: 2000  // Benachrichtigungsdauer
};

/**
 * LocalStorage Keys
 */
const STORAGE_KEYS = {
    PROJECTS: 'shk_projects',
    QUICK_NOTE: 'shk_quicknote',
    FAVORITES: 'shk_favorites',
    CHECKLIST: 'shk_checklist',
    INVENTORY: 'shk_inventory',
    CALENDAR_EVENTS: 'shk_calendar_events'
};

// ========== FEHLER-MELDUNGEN ==========

/**
 * Standardisierte Fehlermeldungen
 */
const ERROR_MESSAGES = {
    INVALID_NUMBER: 'Bitte gültige Zahl eingeben',
    NEGATIVE_VALUE: 'Wert muss positiv sein',
    OUT_OF_RANGE: 'Wert außerhalb des gültigen Bereichs',
    ELEMENT_NOT_FOUND: 'UI-Element nicht gefunden',
    CALCULATION_ERROR: 'Fehler bei der Berechnung',
    STORAGE_FULL: 'Speicher voll! Bitte Daten aufräumen.',
    STORAGE_ERROR: 'Fehler beim Speichern der Daten'
};

// ========== ENTWICKLERMODUS ==========

/**
 * Debug-Einstellungen
 */
const DEBUG = {
    ENABLED: false,             // Aktiviert erweiterte Logs
    LOG_CALCULATIONS: false,    // Loggt alle Berechnungen
    LOG_STORAGE: false          // Loggt LocalStorage Operationen
};
