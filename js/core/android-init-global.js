// Android Init Module - Auto-Start
// Wird automatisch beim Laden ausgeführt

// Auto-Start beim Laden
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', async () => {
        if (typeof initializeAndroidBars === 'function') {
            await initializeAndroidBars();
        }
        if (typeof setupKeyboardHandling === 'function') {
            setupKeyboardHandling();
        }
    });
} else {
    if (typeof initializeAndroidBars === 'function') {
        initializeAndroidBars();
    }
    if (typeof setupKeyboardHandling === 'function') {
        setupKeyboardHandling();
    }
}

// Setup Auto-Scroll
window.addEventListener('load', () => {
    if (typeof setupInputAutoScroll === 'function') {
        setupInputAutoScroll();
    }
});

console.log("[OK] Android Init Auto-Start geladen");
