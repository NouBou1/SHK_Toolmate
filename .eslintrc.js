module.exports = {
    "env": {
        "browser": true,
        "es2021": true
    },
    "extends": "eslint:recommended",
    "parserOptions": {
        "ecmaVersion": 2021,
        "sourceType": "script"
    },
    // Die App laedt alle Dateien als klassische <script>-Tags.
    // Damit teilen sich alle Dateien einen globalen Namensraum -
    // was eine Datei bereitstellt, muss hier stehen, sonst meldet
    // ESLint es in allen anderen Dateien als "not defined".
    "globals": {
        // Capacitor-Plugins
        "Capacitor": "readonly",
        "StatusBar": "readonly",
        "Share": "readonly",
        "Filesystem": "readonly",

        // js/core/constants.js
        "CIRCULATION_LIMIT_LITERS": "readonly",
        "GAS_HEATING_VALUES": "readonly",
        "INPUT_LIMITS": "readonly",
        "MAG_CONFIG": "readonly",
        "PIPE_VOLUME_FACTORS": "readonly",
        "STORAGE_KEYS": "readonly",
        "WATER_HEAT_CAPACITY": "readonly",

        // js/core/utils.js
        "showResult": "readonly",

        // js/core/external-scripts.js
        "EXTERNAL_LIB_URLS": "readonly",
        "EXTERNAL_OPT_IN_KEYS": "readonly",
        "askForExternalOptIn": "readonly",
        "hasExternalOptIn": "readonly",
        "loadExternalScriptOnce": "readonly",

        // js/core/android-init.js, navigation.js
        "initializeAndroidBars": "readonly",
        "setupInputAutoScroll": "readonly",
        "setupKeyboardHandling": "readonly",
        "initCalculatorCategories": "readonly",

        // js/calc/common.js
        "runCalculator": "readonly",

        // js/modules/projects*.js, materials.js
        "currentProjectId": "writable",
        "projectsDB": "writable",
        "getCurrentProjectEntry": "readonly",
        "loadProjectsFromStorage": "readonly",
        "saveProjects": "readonly",
        "setProjectView": "readonly",

        // js/modules/ (PDF & Unterschrift)
        "createPDF": "readonly",
        "exportMaterialListPDFWithSignature": "readonly",
        "getSignatureDataURL": "readonly",
        "resetSignature": "readonly",
        "savePDF": "readonly",

        // js/modules/ (uebrige Features)
        "initFavorites": "readonly",
        "loadChecklist": "readonly",
        "loadFavorites": "readonly",
        "loadQuickNote": "readonly",
        "renderCalendar": "readonly",
        "renderInventory": "readonly"
    },
    "rules": {
        // Fehlerprävention
        // "vars": "local" - globale Funktionen werden aus index.html
        // per onclick aufgerufen, das sieht ESLint nicht.
        "no-unused-vars": ["warn", {
            "vars": "local",
            "args": "after-used",
            "argsIgnorePattern": "^_"
        }],
        "no-undef": "error",
        // builtinGlobals: false - die oben deklarierten Projekt-Globals
        // werden ja genau in einer Datei auch definiert.
        "no-redeclare": ["error", { "builtinGlobals": false }],
        "no-const-assign": "error",
        
        // Best Practices
        "eqeqeq": ["error", "always"],
        "curly": ["error", "all"],
        "no-eval": "error",
        "no-implied-eval": "error",
        "no-with": "error",
        "no-multi-spaces": "warn",
        "no-trailing-spaces": "warn",
        
        // Styling
        "indent": ["warn", 4, { "SwitchCase": 1 }],
        "quotes": ["warn", "single", { "avoidEscape": true }],
        "semi": ["error", "always"],
        "comma-dangle": ["warn", "never"],
        "space-before-blocks": "warn",
        "keyword-spacing": "warn",
        
        // Sicherheit
        // alert/confirm sind in dieser App die bewusste Dialogform
        // (kein eigenes Modal-System) - daher keine Warnung.
        "no-alert": "off",
        "no-console": ["warn", { 
            "allow": ["warn", "error", "log"] 
        }]
    }
};
