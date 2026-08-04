module.exports = {
    "root": true,
    "env": {
        "browser": true,
        "es2022": true
    },
    "extends": "eslint:recommended",
    // Die App besteht aus ES-Modulen. Jede Datei deklariert selbst, was sie
    // braucht und was sie bereitstellt - eine Liste projektweiter Globals
    // ist damit nicht mehr noetig.
    "parserOptions": {
        "ecmaVersion": 2022,
        "sourceType": "module"
    },
    "globals": {
        // Capacitor-Plugins, zur Laufzeit von der nativen Huelle bereitgestellt
        "Capacitor": "readonly",
        "StatusBar": "readonly",
        "Share": "readonly",
        "Filesystem": "readonly"
    },
    "rules": {
        // Fehlerprävention
        "no-unused-vars": ["warn", {
            "args": "after-used",
            "argsIgnorePattern": "^_"
        }],
        "no-undef": "error",
        "no-redeclare": "error",
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
    },
    "overrides": [
        {
            // Der Service Worker laeuft in einem eigenen Kontext,
            // nicht im Fenster und nicht als Modul.
            "files": ["sw.js"],
            "env": { "browser": false, "serviceworker": true },
            "parserOptions": { "sourceType": "script" }
        },
        {
            // Die Tests laufen in Node, nicht im Browser.
            "files": ["tests/**/*.js"],
            "env": { "browser": false, "node": true },
            "rules": { "no-console": "off" }
        }
    ]
};
