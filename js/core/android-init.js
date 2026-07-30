// Android/Capacitor Initialisierung - Status/Navigation Bar
// Keyboard Handling

async function initializeAndroidBars() {
    try {
        const { StatusBar } = await import('@capacitor/status-bar');
        await configureStatusBar(StatusBar);
        await configureNavigationBar();
    } catch(error) {
        console.log("Capacitor Init Error (OK für Desktop):", error.message);
    }
}

async function configureStatusBar(StatusBar) {
    try {
        await StatusBar.setStyle({ style: 'DARK' });
        await StatusBar.setBackgroundColor({ color: '#0a0a0a' });
        await StatusBar.setOverlaysWebView({ overlay: false });
        console.log("[OK] StatusBar: overlaysWebView=false, color=#0a0a0a");
    } catch(e) {
        console.log("StatusBar API nicht verfügbar (OK für Desktop):", e.message);
    }
}

async function configureNavigationBar() {
    try {
        const { NavigationBar } = await import('@capacitor/navigation-bar');
        await NavigationBar.setColor({ color: '#0a0a0a' });
        if (typeof NavigationBar.setOverlaysWebView !== 'undefined') {
            await NavigationBar.setOverlaysWebView({ overlay: false });
        }
        console.log("[OK] NavigationBar: color=#0a0a0a");
    } catch(e) {
        console.log("NavigationBar API nicht verfügbar (OK):", e.message);
    }
}

function setupKeyboardHandling() {
    document.addEventListener('focusin', (e) => {
        if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) {
            console.log("[DEBUG] Input focused: " + (e.target.id || e.target.tagName));
            setTimeout(() => {
                e.target.scrollIntoView({ behavior: 'auto', block: 'center' });
            }, 100);
        }
    });
    
    console.log("[OK] Keyboard handling: scrollIntoView only");
}

function setupInputAutoScroll() {
    const inputs = document.querySelectorAll('input, textarea, select');
    
    inputs.forEach(input => {
        if (input.dataset.autoScrollEnabled) return;
        input.dataset.autoScrollEnabled = 'true';
        
        input.addEventListener('focus', (e) => {
            setTimeout(() => {
                scrollElementIntoView(e.target);
            }, 300);
        });
    });
}

function scrollElementIntoView(element) {
    const container = element.closest('.container') || document.querySelector('main');
    if (container) {
        element.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
            inline: 'nearest'
        });
    }
}
