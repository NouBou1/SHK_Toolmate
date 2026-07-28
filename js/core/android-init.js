// Android/Capacitor Initialisierung - Status/Navigation Bar
// Verwaltung von Safe Area Insets und Keyboard Handling

async function initializeAndroidBars() {
    try {
        const { StatusBar } = await import('@capacitor/status-bar');
        await configureStatusBar(StatusBar);
        await configureNavigationBar();
        applyAndroidSafeAreaInsets();
        setupEventListeners();
    } catch(error) {
        console.log("Capacitor Init Error (OK für Desktop):", error.message);
        applyAndroidSafeAreaInsets();
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

function setupEventListeners() {
    window.addEventListener('orientationchange', () => {
        setTimeout(applyAndroidSafeAreaInsets, 100);
    });
    
    window.addEventListener('resize', () => {
        setTimeout(applyAndroidSafeAreaInsets, 100);
    });
}

function applyAndroidSafeAreaInsets() {
    const viewportHeight = window.innerHeight;
    const screenHeight = window.screen.height;
    const statusBarHeight = 25;
    const navBarHeight = Math.max(48, screenHeight - viewportHeight - statusBarHeight);
    
    setCSSProperties(statusBarHeight, navBarHeight);
    applyBodyPadding(statusBarHeight, navBarHeight);
    applyHeaderPadding(statusBarHeight);
    applyNavPadding(navBarHeight);
    logDebugInfo(viewportHeight, screenHeight, statusBarHeight, navBarHeight);
}

function setCSSProperties(statusBarHeight, navBarHeight) {
    document.documentElement.style.setProperty('--status-bar-height', statusBarHeight + 'px');
    document.documentElement.style.setProperty('--nav-bar-height', navBarHeight + 'px');
}

function applyBodyPadding(statusBarHeight, navBarHeight) {
    const body = document.querySelector('body');
    if (body) {
        body.style.paddingTop = statusBarHeight + 'px';
        const bottomPadding = Math.max(70, 60 + navBarHeight);
        body.style.paddingBottom = bottomPadding + 'px';
        console.log("[DEBUG] Body padding applied: top=" + statusBarHeight + "px, bottom=" + bottomPadding + "px");
    }
}

function applyHeaderPadding(statusBarHeight) {
    const header = document.querySelector('header');
    if (header) {
        header.style.paddingTop = (18 + statusBarHeight) + 'px';
        console.log("[DEBUG] Header padding-top adjusted: " + (18 + statusBarHeight) + "px");
    }
}

function applyNavPadding(navBarHeight) {
    const nav = document.querySelector('nav');
    if (nav) {
        nav.style.paddingBottom = navBarHeight + 'px';
        nav.style.minHeight = (60 + navBarHeight) + 'px';
        console.log("[DEBUG] Nav height adjusted: " + (60 + navBarHeight) + "px");
    }
}

function logDebugInfo(viewportHeight, screenHeight, statusBarHeight, navBarHeight) {
    if (window.location.hostname === 'localhost' || window.location.hostname.includes('192.168')) {
        console.log("[DEBUG] Android Safe Area Berechnung:", {
            "viewport": viewportHeight + "px",
            "screen": screenHeight + "px",
            "statusBar": statusBarHeight + "px",
            "navBar": navBarHeight + "px",
            "totalBottomPadding": Math.max(70, 60 + navBarHeight) + "px"
        });
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
