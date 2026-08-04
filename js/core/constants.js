// ==========================================
// SHK-MATE - Konstanten & Konfiguration
// ==========================================
// Zentrale Definition aller Konstanten für Berechnungen
// und Konfigurationsparameter der App.
//
// WICHTIG: Diese Datei MUSS vor allen anderen Scripts geladen werden!

// ========== HEIZUNG ==========

/**
 * MAG (Membran-Ausdehnungsgefäß) Konfiguration
 * Quelle: VDI 4708
 */
export const MAG_CONFIG = {
    METERS_TO_BAR: 10, // Umrechnung: 10m = 1 bar
    SAFETY_OFFSET_BAR: 0.3, // Mindestzuschlag zur Verdampfungsvermeidung
    FILL_PRESSURE_OFFSET_BAR: 0.3 // Zusätzlicher Fülldruck über P0
};

/**
 * Spezifische Wärmekapazität von Wasser
 */
export const WATER_HEAT_CAPACITY = 1.163; // Wh/(kg*K)

// ========== WASSER ==========

/**
 * Rohrinhalt pro Meter nach DN (Liter/Meter)
 * Annäherungswerte für Cu/C-Stahl Rohre
 */
export const PIPE_VOLUME_FACTORS = {
    12: 0.13, // DN 12 (~13mm innen)
    15: 0.20, // DN 15 (~16mm innen)
    20: 0.31, // DN 20 (~20mm innen)
    25: 0.53, // DN 25 (~26mm innen)
    32: 0.85, // DN 32 (~33mm innen)
    40: 1.25, // DN 40 (~40mm innen)
    50: 2.04 // DN 50 (~51mm innen)
};

/**
 * Zirkulation: Kritische Grenze
 * Nach DVGW W 551 (Trinkwasserhygiene)
 */
export const CIRCULATION_LIMIT_LITERS = 3; // Max. Inhalt ohne Zirkulation

// ========== GAS ==========

/**
 * Gas-Brennwerte (kWh/m³)
 * Durchschnittswerte
 */
export const GAS_HEATING_VALUES = {
    NATURAL_GAS: 10.0, // Erdgas H (ca. 10 kWh/m³)
    PROPANE: 25.9, // Flüssiggas Propan
    BUTANE: 34.0 // Flüssiggas Butan
};

// ========== VALIDIERUNG ==========

/**
 * Eingabe-Validierung: Grenzen
 */
export const INPUT_LIMITS = {
    // Heizung
    FLOOR_AREA_MIN: 0.1, // m²
    FLOOR_AREA_MAX: 10000, // m²
    HEIGHT_MIN: 0.1, // m
    HEIGHT_MAX: 200, // m
    POWER_MIN: 0.1, // kW
    POWER_MAX: 10000, // kW

    // Wasser
    PIPE_LENGTH_MIN: 0.1, // m
    PIPE_LENGTH_MAX: 10000, // m
    TEMPERATURE_MIN: -273.15, // °C (absoluter Nullpunkt)
    TEMPERATURE_MAX: 300, // °C
    VOLUME_MIN: 0.001, // Liter
    VOLUME_MAX: 1000000, // Liter

    // Allgemein
    TIME_MIN: 0.1, // Sekunden
    TIME_MAX: 86400 // Sekunden (24h)
};

// ========== SPEICHERUNG ==========

/**
 * LocalStorage Keys
 *
 * ACHTUNG: Diese Werte stehen auf den Geräten der Nutzer.
 * Wird ein Key geändert, sind die bisherigen Daten nicht mehr auffindbar.
 */
export const STORAGE_KEYS = {
    PROJECTS: 'shk_projects',
    QUICK_NOTE: 'shk_quick_note',
    FAVORITES: 'shk_favs',
    MAINTENANCE: 'shk_maintenance',
    INVENTORY: 'shk_inventory'
};
