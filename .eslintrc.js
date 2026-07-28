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
    "globals": {
        "Capacitor": "readonly",
        "StatusBar": "readonly",
        "Share": "readonly",
        "Filesystem": "readonly"
    },
    "rules": {
        // Fehlerprävention
        "no-unused-vars": ["warn", { 
            "argsIgnorePattern": "^_",
            "varsIgnorePattern": "^_"
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
        "no-alert": "warn",
        "no-console": ["warn", { 
            "allow": ["warn", "error", "log"] 
        }]
    }
};
