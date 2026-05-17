// --- CAPACITOR INITIALISIERUNG für Android Status/Navigation Bar ---
async function initializeAndroidBars() {
    try {
        // Nutze dynamische imports für Capacitor
        const { StatusBar } = await import('@capacitor/status-bar');
        
        // Statusleiste Konfiguration
        try {
            await StatusBar.setStyle({ style: 'DARK' });
            await StatusBar.setBackgroundColor({ color: '#0a0a0a' });
            // overlaysWebView FALSE = WICHTIG! Die WebView wird unter der Statusleiste gerendert
            await StatusBar.setOverlaysWebView({ overlay: false });
            console.log("✅ StatusBar: overlaysWebView=false, color=#0a0a0a");
        } catch(e) {
            console.log("StatusBar API nicht verfügbar (OK für Desktop):", e.message);
        }
        
        // Navigationsleiste Konfiguration
        try {
            const { NavigationBar } = await import('@capacitor/navigation-bar');
            await NavigationBar.setColor({ color: '#0a0a0a' });
            // Auch overlaysWebView für NavigationBar FALSE setzen wenn verfügbar
            if (typeof NavigationBar.setOverlaysWebView !== 'undefined') {
                await NavigationBar.setOverlaysWebView({ overlay: false });
            }
            console.log("✅ NavigationBar: color=#0a0a0a");
        } catch(e) {
            console.log("NavigationBar API nicht verfügbar (OK):", e.message);
        }
        
        // Wende Safe Area Insets an
        applyAndroidSafeAreaInsets();
        
        // Re-apply bei Orientierungswechsel (NUR bei Orientierungswechsel, nicht bei Keyboard!)
        window.addEventListener('orientationchange', () => {
            setTimeout(applyAndroidSafeAreaInsets, 100);
        });
        
        // Fallback: bei Größenänderungen (z.B. Tastatur) Safe-Area neu anwenden
        window.addEventListener('resize', () => {
            setTimeout(applyAndroidSafeAreaInsets, 100);
        });
        
    } catch(error) {
        console.log("Capacitor Init Error (OK für Desktop):", error.message);
        // Auf Desktop trotzdem safe areas anwenden
        applyAndroidSafeAreaInsets();
    }
}

// Manuelle Berechnung und Anwendung der Safe Area Insets
function applyAndroidSafeAreaInsets() {
    // Hole actual viewport Höhe
    const viewportHeight = window.innerHeight;
    const screenHeight = window.screen.height;
    
    // Berechne die System UI Höhen basierend auf dem Unterschied
    const statusBarHeight = 25; // Android Standard
    const navBarHeight = Math.max(48, screenHeight - viewportHeight - statusBarHeight);
    
    // Setze CSS custom properties
    document.documentElement.style.setProperty('--status-bar-height', statusBarHeight + 'px');
    document.documentElement.style.setProperty('--nav-bar-height', navBarHeight + 'px');
    
    // WICHTIG: Wende auf body an mit genug Padding
    const body = document.querySelector('body');
    if (body) {
        body.style.paddingTop = statusBarHeight + 'px';
        // Mindestens 70px für die App-Navigation + die System Navigationsleiste
        const bottomPadding = Math.max(70, 60 + navBarHeight);
        body.style.paddingBottom = bottomPadding + 'px';
        console.log("📱 Body padding applied: top=" + statusBarHeight + "px, bottom=" + bottomPadding + "px");
    }
    
    // Wende auf header an - extra padding-top für die System Statusleiste
    const header = document.querySelector('header');
    if (header) {
        header.style.paddingTop = (18 + statusBarHeight) + 'px';
        console.log("🔝 Header padding-top adjusted: " + (18 + statusBarHeight) + "px (18px + " + statusBarHeight + "px status bar)");
    }
    
    // Wende auf nav an - padding-bottom für die System Navigationsleiste
    const nav = document.querySelector('nav');
    if (nav) {
        nav.style.paddingBottom = navBarHeight + 'px';
        nav.style.minHeight = (60 + navBarHeight) + 'px';
        console.log("🗂️ Nav height adjusted: " + (60 + navBarHeight) + "px (60px + " + navBarHeight + "px nav bar)");
    }
    
    // Debug Log
    if (window.location.hostname === 'localhost' || window.location.hostname.includes('192.168')) {
        console.log("🎯 Android Safe Area Berechnung:", {
            "viewport": viewportHeight + "px",
            "screen": screenHeight + "px",
            "statusBar": statusBarHeight + "px",
            "navBar": navBarHeight + "px",
            "totalBottomPadding": Math.max(70, 60 + navBarHeight) + "px"
        });
    }
}

// --- KEYBOARD HANDLING - Ultra-minimal ---
function setupKeyboardHandling() {
    // Nur das absolut notwendige: Input fokussiert → scroll ihn in Sicht
    document.addEventListener('focusin', (e) => {
        if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) {
            console.log("🎯 Input focused: " + (e.target.id || e.target.tagName));
            setTimeout(() => {
                e.target.scrollIntoView({ behavior: 'auto', block: 'center' });
            }, 100);
        }
    });
    
    console.log("✅ Keyboard handling: scrollIntoView only");
}

// Starte bar initialization wenn DOM ready ist
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        initializeAndroidBars();
        setupKeyboardHandling();
    });
} else {
    initializeAndroidBars();
    setupKeyboardHandling();
}

// --- NAVIGATION LOGIC ---
function switchTab(viewId, btn) {
    document.querySelectorAll('.container').forEach(el => el.classList.remove('active'));
    document.getElementById('view-' + viewId).classList.add('active');

    document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
    btn.classList.add('active');
    btn.focus();
    
    // Wenn zu Material-Tab gewechselt wird, Liste aktualisieren
    if (viewId === 'material') {
        renderProjectList();
    }
}

// Calculator Category System
function initCalculatorCategories() {
    const categories = [
        { id: 'alle', name: 'Alle', dotClass: 'chip-dot-alle' },
        { id: 'heizung', name: 'Heizung', dotClass: 'chip-dot-heizung' },
        { id: 'wasser', name: 'Wasser', dotClass: 'chip-dot-wasser' },
        { id: 'lueftung', name: 'Lueftung', dotClass: 'chip-dot-lueftung' },
        { id: 'misc', name: 'Sonstiges', dotClass: 'chip-dot-misc' }
    ];

    // Mapping: Rechner-Titel → Kategorie
    const calcMapping = {
        'Gaszähler': 'heizung',
        'Heizlast': 'heizung',
        'MAG': 'heizung',
        'HK-Leistung': 'heizung',
        'Leistung-Check': 'heizung',
        'Hydraulischer Abgleich': 'heizung',
        'Pumpe': 'heizung',
        'Kesselleistung': 'heizung',
        'Spreizung': 'heizung',
        'Mischwasser': 'wasser',
        'Aufheizzeit': 'wasser',
        'Zirkulation': 'wasser',
        'Strömungsgeschwindigkeit': 'wasser',
        'Rohr-Inhalt': 'wasser',
        'Abwasser': 'wasser',
        'Kondensat': 'wasser',
        'Tank': 'wasser',
        'Lüftung': 'lueftung',
        'Kernbohrung': 'misc',
        'Schellen': 'misc',
        'Etagen': 'misc'
    };

    // Alle Rechner-Cards finden (aber NICHT die note-card!)
    const allCards = Array.from(document.querySelectorAll('#view-rechner .card:not(.note-card)'));
    
    // Kategorien zu Cards zuweisen
    allCards.forEach(card => {
        const h3 = card.querySelector('h3');
        if (!h3) return;
        
        const title = h3.textContent;
        let category = 'misc';
        
        // Finde passende Kategorie
        for (const [keyword, cat] of Object.entries(calcMapping)) {
            if (title.includes(keyword)) {
                category = cat;
                break;
            }
        }
        
        card.setAttribute('data-calc-category', category);
    });

    // Kategorie-Buttons erstellen
    const container = document.getElementById('calc-categories');
    if (!container) return;

    categories.forEach((cat, index) => {
        const btn = document.createElement('button');
        btn.className = 'calc-cat-btn' + (index === 0 ? ' active' : '');
        btn.innerHTML = `<span class="chip-dot ${cat.dotClass}"></span><span>${cat.name}</span>`;
        btn.onclick = () => filterByCategory(cat.id, btn);
        container.appendChild(btn);
    });
}

function filterByCategory(categoryId, button) {
    // Alle Buttons deaktivieren
    document.querySelectorAll('.calc-cat-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Aktiven Button markieren
    button.classList.add('active');
    
    // Cards filtern
    const allCards = document.querySelectorAll('#view-rechner .card');
    allCards.forEach(card => {
        if (card.classList.contains('note-card')) {
            card.classList.remove('u-hidden');
            return;
        }

        const cardCategory = card.getAttribute('data-calc-category');
        
        if (categoryId === 'alle' || cardCategory === categoryId) {
            card.classList.remove('u-hidden');
        } else {
            card.classList.add('u-hidden');
        }
    });
}

// Add keyboard support for navigation & initialize Android bars
document.addEventListener('DOMContentLoaded', function() {
    // Initialisiere Android Status/Navigation Bar
    initializeAndroidBars();
    
    // Initialisiere Calculator Kategorien
    initCalculatorCategories();
    
    const navItems = document.querySelectorAll('.nav-item');
    
    navItems.forEach((item, index) => {
        item.addEventListener('keydown', function(e) {
            let nextIndex = index;
            if (e.key === 'ArrowRight') {
                nextIndex = (index + 1) % navItems.length;
                e.preventDefault();
            } else if (e.key === 'ArrowLeft') {
                nextIndex = (index - 1 + navItems.length) % navItems.length;
                e.preventDefault();
            }
            
            if (nextIndex !== index) {
                navItems[nextIndex].focus();
                navItems[nextIndex].click();
            }
        });
    });
});

// --- ERGEBNIS ANZEIGEN & TEILEN ---
function showResult(elementId, text, isError = false) {
    const el = document.getElementById(elementId);

    // 1. Sichtbar machen & Stylen
    el.style.display = 'block';
    el.style.backgroundColor = isError ? 'rgba(180, 0, 0, 0.2)' : 'rgba(0, 86, 179, 0.2)';
    el.style.borderColor = isError ? '#ff4444' : '#0056b3';

    // 2. Text für HTML aufbereiten (Zeilenumbrüche \n zu <br> wandeln)
    const htmlText = text.replace(/\n/g, '<br>');

    // 3. Inhalt setzen: Text + Teilen-Button (nur wenn kein Fehler)
    if (isError) {
        el.innerHTML = `<strong>⚠️ Fehler:</strong><br>${htmlText}`;
    } else {
        // Wir speichern den rohen Text in einem data-Attribut, damit wir ihn leicht teilen können
        el.setAttribute('data-result-text', text);

        el.innerHTML = `
            <div>${htmlText}</div>
            <div style="margin-top:10px; border-top:1px solid rgba(255,255,255,0.1); padding-top:8px;">
                <button class="small-btn secondary" onclick="shareResult(this)" style="width:auto; display:inline-flex; align-items:center; gap:5px;">
                    📤 Senden / Kopieren
                </button>
            </div>
        `;
    }

    // 4. Animation
    el.classList.remove('updated');
    void el.offsetWidth;
    el.classList.add('updated');
}

// --- DIE TEILEN-LOGIK ---
function shareResult(btn) {
    // Den Text aus dem Eltern-Element (der Box) holen
    const box = btn.closest('.result-box');
    const textToShare = "SHK-Mate Ergebnis:\n\n" + box.getAttribute('data-result-text');

    // Prüfen, ob der Browser "Teilen" unterstützt (Handys können das meistens)
    if (navigator.share) {
        navigator.share({
            title: 'SHK-Mate Berechnung',
            text: textToShare
        })
            .then(() => console.log('Erfolgreich geteilt'))
            .catch((error) => console.log('Teilen abgebrochen', error));
    } else {
        // Fallback für PC: In Zwischenablage kopieren
        navigator.clipboard.writeText(textToShare).then(() => {
            const originalText = btn.innerHTML;
            btn.innerHTML = "✅ Kopiert!";
            setTimeout(() => btn.innerHTML = originalText, 2000);
        });
    }
}


// function showResult(elementId, text, isError = false) {
//     const el = document.getElementById(elementId);

//     // 1. Sichtbar machen
//     el.style.display = 'block';

//     // 2. Farben setzen (Das war dein "bestehender Code")
//     el.style.backgroundColor = isError ? 'rgba(180, 0, 0, 0.2)' : 'rgba(0, 86, 179, 0.2)';
//     el.style.borderColor = isError ? '#ff4444' : '#0056b3';

//     // 3. Text einfügen
//     el.innerText = text;

//     // 4. Animation neu starten (Der neue Teil)
//     el.classList.remove('updated'); // Klasse wegnehmen
//     void el.offsetWidth;            // "Reflow" erzwingen (Browser-Trick, damit er merkt, dass die Klasse weg war)
//     el.classList.add('updated');    // Klasse wieder hinzufügen -> Animation startet neu
// }




// --- TOOLS FUNKTIONEN ---
function convertUnits() {
    const val = parseFloat(document.getElementById('conv_val').value);
    const from = document.getElementById('conv_from').value;
    const to = document.getElementById('conv_to').value;

    if (isNaN(val)) return;

    let res = 0;
    let base = val;

    if (from === 'mbar') base = val / 1000;
    if (from === 'pascal') base = val / 100000;

    if (to === 'bar') res = base;
    if (to === 'mbar') res = base * 1000;
    if (to === 'pascal') res = base * 100000;

    if (from === 'kw' && to === 'watt') res = val * 1000;

    if ((from === 'kw' && to !== 'watt') || (from !== 'kw' && to === 'watt')) {
        showResult('res_conv', "Fehler: Kann Druck nicht in Leistung umrechnen!", true);
        return;
    }

    showResult('res_conv', `${val} ${from} = ${res} ${to}`);
}

function searchError() {
    const code = document.getElementById('error_code').value;
    if (code) {
        window.open(`https://www.google.com/search?q=Heizung+Fehlercode+${encodeURIComponent(code)}`, '_blank');
    }
}



// --- MATERIAL LISTE MODUL ---

// --- MATERIAL LISTE & ARCHIV (KOMPLETT) ---

let projectsDB = JSON.parse(localStorage.getItem('shk_projects')) || [];
let currentProjectId = null;
let currentViewMode = 'active'; // Start-Ansicht

// 1. Ansicht wechseln (Aktuell <-> Archiv)
function setProjectView(mode) {
    currentViewMode = mode;

    // Buttons färben
    document.getElementById('btn_view_active').classList.toggle('active', mode === 'active');
    document.getElementById('btn_view_archived').classList.toggle('active', mode === 'archived');

    // Eingabefeld nur bei "Aktuell" zeigen
    const wrapper = document.getElementById('new_project_wrapper');
    if (wrapper) {
        wrapper.style.display = (mode === 'active') ? 'flex' : 'none';
    }

    renderProjectList();
}

// 2. Projekt hinzufügen mit Input Validierung
function addProject() {
    const input = document.getElementById('new_project_name');
    const name = input.value.trim();

    if (!name) {
        alert('❌ Bitte Projektname eingeben');
        return;
    }
    
    if (name.length > 50) {
        alert('❌ Projektname zu lang (max. 50 Zeichen)');
        return;
    }
    
    // Prüfe auf Duplikate
    if (projectsDB.some(p => p.name.toLowerCase() === name.toLowerCase() && !p.archived)) {
        alert('⚠️ Projekt mit diesem Namen existiert bereits!');
        return;
    }

    const newProject = {
        id: Date.now(),
        name: name,
        date: new Date().toLocaleDateString('de-DE'),
        archived: false,
        items: []
    };

    projectsDB.unshift(newProject);
    saveProjects();

    // Falls wir im Archiv waren, zurück zu Aktuell springen
    if (currentViewMode !== 'active') {
        setProjectView('active');
    } else {
        renderProjectList();
    }
    input.value = '';
}

// 3. Liste rendern
function renderProjectList() {
    const container = document.getElementById('project_list_container');
    container.innerHTML = '';

    // Filterlogik
    const filtered = projectsDB.filter(p => {
        const isArchived = !!p.archived;
        return currentViewMode === 'active' ? !isArchived : isArchived;
    });

    if (filtered.length === 0) {
        container.innerHTML = `<p style="color:#aaa; text-align:center;">${currentViewMode === 'active' ? 'Keine offenen Baustellen.' : 'Archiv leer.'}</p>`;
        return;
    }

    filtered.forEach(proj => {
        const div = document.createElement('div');
        div.className = 'project-item';
        if (proj.archived) div.style.opacity = '0.7';

        div.innerHTML = `
            <div>
                <strong>${proj.name}</strong><br>
                <small style="color:#aaa;">${proj.date} • ${proj.items.length} Pos.</small>
            </div>
            <span>➜</span>
        `;
        div.onclick = () => openProject(proj.id);
        container.appendChild(div);
    });
}

// 4. Projekt öffnen
function openProject(id) {
    currentProjectId = id;
    const project = projectsDB.find(p => p.id === id);
    if (!project) return;

    // View umschalten
    document.getElementById('mat-overview').style.display = 'none';
    document.getElementById('mat-detail').style.display = 'block';

    // Infos füllen
    document.getElementById('detail_title').innerText = project.name;
    document.getElementById('detail_date').innerText = 'Erstellt: ' + project.date;

    // Archiv-Button Text anpassen
    const btn = document.getElementById('btn_archive_action');
    if (project.archived) {
        btn.innerText = "🔄 Wiederherstellen";
        btn.style.backgroundColor = "#28a745";
        btn.style.color = "white";
    } else {
        btn.innerText = "📥 Ins Archiv verschieben";
        btn.style.backgroundColor = "";
        btn.style.color = "";
    }

    renderMaterialItems();
}

// 5. Projekt schließen
function closeProject() {
    currentProjectId = null;
    document.getElementById('mat-detail').style.display = 'none';
    document.getElementById('mat-overview').style.display = 'block';
    renderProjectList();
}

// 6. Material hinzufügen
function addMaterialItem() {
    if (!currentProjectId) return;

    const inputName = document.getElementById('new_item_name');
    const inputAmount = document.getElementById('new_item_amount');

    const text = inputName.value.trim();
    let amount = inputAmount.value.trim();
    if (amount === '') amount = '1'; // Default

    if (!text) return;

    const projectIndex = projectsDB.findIndex(p => p.id === currentProjectId);
    if (projectIndex > -1) {
        projectsDB[projectIndex].items.push({ text: text, amount: amount });
        saveProjects();
        renderMaterialItems();

        // Unterschrift invalidieren bei neuen Items
        signatureDataURL = null;

        inputName.value = '';
        inputAmount.value = '';
        inputName.focus();
    }
}

// 7. Material Items rendern
function renderMaterialItems() {
    const listContainer = document.getElementById('material_list_items');
    listContainer.innerHTML = '';

    const project = projectsDB.find(p => p.id === currentProjectId);
    if (!project) return;

    project.items.forEach((item, index) => {
        const li = document.createElement('li');
        li.className = 'material-item';

        const displayAmount = item.amount ? item.amount : '1';
        const hasImage = item.image ? true : false;

        li.innerHTML = `
            <div style="display:flex; flex-direction:column; width:100%;">
        
        <div style="display:flex; justify-content:space-between; align-items:center;">
            <span>
               <strong>${item.amount}x</strong> ${item.name || item.text || 'Ohne Namen'}
            </span>
            <div class="material_item_btns">
                <button class="small-btn secondary" onclick="triggerPhoto(${index})" style="margin-right:5px;">
                    📷
                </button>
                <button class="small-btn btn-danger" onclick="deleteMaterialItem(${index})">×</button>
            </div>
        </div>

        ${hasImage ? `
            <div style="margin-top:10px; position:relative; width:fit-content;">
                <img src="${item.image}" onclick="showBigImage('${item.image}')" 
                     style="height:60px; border-radius:4px; border:1px solid #555; cursor:pointer;">
                
                <button onclick="deletePhoto(${index})" 
                        style="position:absolute; top:-8px; right:-8px; background:red; color:white; border-radius:50%; width:20px; height:20px; font-size:12px; line-height:1; padding:0; border:none;">
                    ×
                </button>
            </div>
        ` : ''}

    </div>
        `;
        listContainer.appendChild(li);
    });
}

// 8. Material löschen
function deleteMaterialItem(index) {
    const projectIndex = projectsDB.findIndex(p => p.id === currentProjectId);
    if (projectIndex > -1) {
        projectsDB[projectIndex].items.splice(index, 1);
        saveProjects();
        renderMaterialItems();
        
        // Unterschrift invalidieren bei Änderungen
        signatureDataURL = null;
    }
}

// 9. Archiv Status ändern
function toggleArchiveStatus() {
    if (!currentProjectId) return;
    const project = projectsDB.find(p => p.id === currentProjectId);
    if (project) {
        project.archived = !project.archived;
        saveProjects();
        closeProject();
    }
}

// 10. Projekt löschen mit Zwei-Schritt Bestätigung
function deleteCurrentProject() {
    const project = projectsDB.find(p => p.id === currentProjectId);
    if (!project) return;
    
    // Zwei-Schritt Bestätigung
    const firstConfirm = confirm(`🗑️ Projekt \"${project.name}\" wirklich löschen?\\n\\nDies kann nicht rückgängig gemacht werden!`);
    if (!firstConfirm) return;
    
    const secondConfirm = confirm(`⚠️ Letzte Chance! Projekt \"${project.name}\" mit ${project.items.length} Materialien ENDGÜLTIG löschen?`);
    if (!secondConfirm) return;
    
    if (confirm("Wirklich?")) {
        const idx = projectsDB.findIndex(p => p.id === currentProjectId);
        if (idx > -1) {
            projectsDB.splice(idx, 1);
            saveProjects();
            closeProject();
        }
    }
}

// --- FOTO MODUL ---
let currentPhotoItemIndex = null; // Merkt sich, wo das Foto hin soll

// 1. Button wurde geklickt -> Kamera öffnen
function triggerPhoto(index) {
    currentPhotoItemIndex = index;
    document.getElementById('global_camera_input').click();
}

// 2. Foto wurde gemacht -> Komprimieren & Speichern mit Error Handling
function processPhoto(input) {
    if (input.files && input.files[0]) {
        const file = input.files[0];
        
        // Validierung: Dateigröße
        const maxSize = 5 * 1024 * 1024; // 5MB
        if (file.size > maxSize) {
            alert(`❌ Datei zu groß (${(file.size / 1024 / 1024).toFixed(1)}MB). Max. 5MB erlaubt.`);
            input.value = '';
            return;
        }
        
        // Validierung: Dateityp
        if (!file.type.startsWith('image/')) {
            alert('❌ Nur Bilder erlaubt!');
            input.value = '';
            return;
        }
        
        const reader = new FileReader();

        reader.onerror = function() {
            alert('❌ Fehler beim Laden des Fotos. Bitte versuchen Sie es erneut.');
            console.error('FileReader error:', reader.error);
            input.value = '';
        };

        // Erst wenn die Datei gelesen wurde...
        reader.onload = function(e) {
            try {
                const img = new Image();
                
                // Erst wenn das Bild als Objekt bereit ist...
                img.onload = function() {
                    // --- BILD VERKLEINERN ---
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');
                    const MAX_WIDTH = 800;
                    const scaleSize = MAX_WIDTH / img.width;
                    canvas.width = MAX_WIDTH;
                    canvas.height = img.height * scaleSize;
                    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                    
                    // Als Text holen
                    const dataUrl = canvas.toDataURL('image/jpeg', 0.7);

                    // --- SPEICHERN ---
                    const activeProj = projectsDB.find(p => p.id === currentProjectId);
                    
                    if (activeProj && activeProj.items[currentPhotoItemIndex]) {
                        // 1. Daten ändern
                        activeProj.items[currentPhotoItemIndex].image = dataUrl;
                        
                        // 2. Speichern
                        saveProjects();
                        
                        // 3. WICHTIG: Genau HIER aktualisieren!
                        // Nur hier ist sicher, dass das Bild schon in der Datenbank liegt.
                        console.log("Bild gespeichert, aktualisiere Liste..."); // Zur Kontrolle in der Konsole
                        renderMaterialItems(); 
                    }
                };

                img.src = e.target.result;
            } catch (err) {
                console.error('Fehler beim Verarbeiten des Fotos:', err);
                alert('❌ Foto konnte nicht verarbeitet werden. Bitte erneut versuchen.');
            }
        };

        reader.readAsDataURL(file);
    }
    // Input leeren
    input.value = '';
}

function deletePhoto(index) {
    // Sicherheitsfrage
    if(!confirm("Möchtest du dieses Foto entfernen?")) return;

    const activeProj = projectsDB.find(p => p.id === currentProjectId);
    
    if(activeProj && activeProj.items[index]) {
        // 1. Bild aus dem Objekt löschen
        delete activeProj.items[index].image; 
        
        // 2. Datenbank speichern
        saveProjects();
        
        // 3. Ansicht aktualisieren
        // Achte genau auf den Namen: renderMaterialItems()
        console.log("Bild gelöscht, aktualisiere Liste..."); 
        renderMaterialItems(); 
    }
}
// 4. Foto groß anzeigen (Modal)
function showBigImage(src) {
    // Einfaches Overlay erzeugen
    const overlay = document.createElement('div');
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.background = 'rgba(0,0,0,0.9)';
    overlay.style.zIndex = '2000';
    overlay.style.display = 'flex';
    overlay.style.justifyContent = 'center';
    overlay.style.alignItems = 'center';
    overlay.onclick = () => document.body.removeChild(overlay); // Klick schließt es

    const img = document.createElement('img');
    img.src = src;
    img.style.maxWidth = '95%';
    img.style.maxHeight = '95%';
    img.style.border = '2px solid white';
    
    overlay.appendChild(img);
    document.body.appendChild(overlay);
}

// Hilfsfunktion: Speichern mit Fehlerbehandlung & Size Check
function saveProjects() {
    try {
        const data = JSON.stringify(projectsDB);
        const sizeInBytes = new Blob([data]).size;
        const sizeInMB = (sizeInBytes / (1024 * 1024)).toFixed(2);
        
        // Warnung wenn über 4MB
        if (sizeInMB > 4) {
            console.warn(`⚠️ localStorage ist ${sizeInMB}MB groß! Speicher wird knapp.`);
        }
        
        localStorage.setItem('shk_projects', data);
    } catch (err) {
        if (err.name === 'QuotaExceededError') {
            alert('❌ Speicher voll! Bitte alte Projekte und Fotos löschen um Platz zu machen.');
            console.error('localStorage quota exceeded:', err);
        } else {
            alert('❌ Fehler beim Speichern: ' + err.message);
        }
    }
}

// Start
setProjectView('active');

function copyListToClipboard() {
    if (!currentProjectId) return;
    const project = projectsDB.find(p => p.id === currentProjectId);

    if (!project || project.items.length === 0) {
        alert("Liste ist leer!");
        return;
    }

    // Text zusammenbauen
    let text = `📅 *Material - ${project.name}*\n`; // Fettgedruckt für WhatsApp
    text += `(${project.date})\n\n`;

    project.items.forEach(item => {
        // Format: "5x Bogen HT DN50"
        const amount = item.amount ? item.amount : '1';
        text += `- ${amount}x ${item.text}\n`;
    });

    text += `\nGesendet mit SHK-Tool`;

    // In die Zwischenablage schreiben
    navigator.clipboard.writeText(text).then(() => {
        alert("✅ Liste kopiert! Jetzt in WhatsApp einfügen.");
    }).catch(err => {
        console.error('Fehler beim Kopieren:', err);
        alert("Fehler beim Kopieren.");
    });
}



// --- SCHNELL-NOTIZ MODUL ---

// 1. Laden beim Start
function loadQuickNote() {
    const noteField = document.getElementById('quick_note');
    if (!noteField) return;

    const saved = localStorage.getItem('shk_quick_note');
    if (saved) {
        noteField.value = saved;
    }
}

// 2. Automatisch Speichern
let saveTimeout;
function autoSaveNote() {
    const noteField = document.getElementById('quick_note');
    const statusSpan = document.getElementById('note_status');

    // Speichern
    localStorage.setItem('shk_quick_note', noteField.value);

    // Feedback anzeigen
    if (statusSpan) {
        statusSpan.style.opacity = '1';

        // Alten Timer löschen, falls man schnell weitertippt
        clearTimeout(saveTimeout);

        // Nach 1.5 Sekunden ausblenden
        saveTimeout = setTimeout(() => {
            statusSpan.style.opacity = '0';
        }, 1500);
    }
}

// 3. Kopieren
function copyNote() {
    const noteField = document.getElementById('quick_note');
    if (!noteField.value) return;

    navigator.clipboard.writeText(noteField.value).then(() => {
        // Feedback via Alert oder auch Status-Span nutzen
        alert("📋 Notiz in Zwischenablage kopiert!");
    });
}

// 4. Löschen
function clearNote() {
    const noteField = document.getElementById('quick_note');
    if (noteField.value === '') return;

    if (confirm('Notiz wirklich löschen?')) {
        noteField.value = '';
        localStorage.removeItem('shk_quick_note');
    }
}

// Direkt beim Laden ausführen
document.addEventListener('DOMContentLoaded', function() {
    loadQuickNote();
    renderCalendar();
    renderInventory();
    
    // Add keyboard support to toggleable headers
    document.querySelectorAll('[aria-controls]').forEach(button => {
        button.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.click();
            }
        });
    });
});



// Deine bereits vorhandene Toggle-Funktion
function toggleTable(id) {
    const el = document.getElementById(id);
    const isHidden = el.style.display === 'none';
    
    el.style.display = isHidden ? 'block' : 'none';
    
    // Update ARIA for accessibility
    const header = el.previousElementSibling;
    if (header && header.hasAttribute('aria-controls')) {
        header.setAttribute('aria-expanded', isHidden.toString());
    }
}
// --- RECHNER FILTER FUNKTION ---
function filterCalculators() {
    // 1. Suchbegriff holen
    const input = document.getElementById('calcSearchInput');
    const filter = input.value.toLowerCase();

    // 2. Den Container holen, wo die Rechner drin sind
    const container = document.getElementById('view-rechner');

    // 3. Alle Karten DARIN holen
    const cards = container.getElementsByClassName('card');

    // 4. Durch alle Karten gehen und prüfen
    for (let i = 0; i < cards.length; i++) {
        const card = cards[i];

        // Wir suchen im gesamten Text der Karte (Titel + Inhalt)
        const text = card.innerText || card.textContent;

        if (text.toLowerCase().indexOf(filter) > -1) {
            // Treffer: Anzeigen
            card.style.display = "";
        } else {
            // Kein Treffer: Ausblenden
            card.style.display = "none";
        }
    }
}

// --- FAVORITEN SYSTEM ---

function initFavorites() {
    const container = document.getElementById('view-rechner');
    if (!container) return;

    const cards = Array.from(container.querySelectorAll('.card:not(.note-card)'));

    // Gespeicherte Favoriten laden
    const favs = JSON.parse(localStorage.getItem('shk_favs')) || [];

    // Durch alle Karten gehen
    cards.forEach((card, index) => {
        const titleEl = card.querySelector('h3');
        if (!titleEl) return;

        // Eindeutige ID für die Karte erzeugen (anhand des Titels)
        const cardId = titleEl.innerText.trim();

        // Speichere Original-Reihenfolge
        if (!card.dataset.originalIndex) {
            card.dataset.originalIndex = String(index);
        }
        card.dataset.cardId = cardId;

        // Sternchen erstellen
        const star = document.createElement('span');
        star.style.float = 'right';
        star.style.cursor = 'pointer';
        star.style.fontSize = '1.2rem';

        // Ist es schon ein Favorit?
        if (favs.includes(cardId)) {
            star.innerText = '⭐'; // Voll
            card.classList.add('is-favorite');
        } else {
            star.innerText = '☆'; // Leer
        }

        // Klick-Event
        star.onclick = function (e) {
            e.stopPropagation(); // Verhindert, dass Accordions (falls vorhanden) zuklappen
            toggleFavorite(card, cardId, star);
        };

        titleEl.appendChild(star);
    });

    reorderFavoriteCards(favs);
}

function toggleFavorite(card, id, starEl) {
    let favs = JSON.parse(localStorage.getItem('shk_favs')) || [];

    if (favs.includes(id)) {
        // Löschen
        favs = favs.filter(f => f !== id);
        starEl.innerText = '☆';
        card.classList.remove('is-favorite');
    } else {
        // Hinzufügen
        favs.push(id);
        starEl.innerText = '⭐';
        card.classList.add('is-favorite');

        // Kleines Feedback
        alert("Zu Favoriten hinzugefügt! (Erscheint jetzt immer oben)");
    }

    localStorage.setItem('shk_favs', JSON.stringify(favs));
    reorderFavoriteCards(favs);
}

function reorderFavoriteCards(favs) {
    const container = document.getElementById('view-rechner');
    if (!container) return;

    const cards = Array.from(container.querySelectorAll('.card:not(.note-card)'));
    if (!cards.length) return;

    const sorted = cards.slice().sort((a, b) => {
        const aId = a.dataset.cardId || '';
        const bId = b.dataset.cardId || '';
        const aFav = favs.includes(aId) ? 1 : 0;
        const bFav = favs.includes(bId) ? 1 : 0;

        if (aFav !== bFav) return bFav - aFav;

        const aIndex = Number(a.dataset.originalIndex || 0);
        const bIndex = Number(b.dataset.originalIndex || 0);
        return aIndex - bIndex;
    });

    const searchInput = document.getElementById('calcSearchInput');
    let insertAfter = searchInput ? searchInput.parentElement : null;

    if (!insertAfter) {
        insertAfter = container.querySelector('#calc-categories') || container.firstElementChild;
    }

    if (!insertAfter) {
        sorted.forEach(card => container.appendChild(card));
        return;
    }

    sorted.forEach(card => {
        container.insertBefore(card, insertAfter.nextSibling);
        insertAfter = card;
    });
}

// System starten (kurze Verzögerung, damit HTML sicher da ist)
setTimeout(initFavorites, 500);



// --- WASSERWAAGE ---
function requestLevelPerm() {
    // iOS (iPhone) braucht eine Erlaubnis per Klick
    if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
        DeviceOrientationEvent.requestPermission()
            .then(response => {
                if (response === 'granted') {
                    window.addEventListener('deviceorientation', handleOrientation);
                } else {
                    alert("Erlaubnis verweigert.");
                }
            })
            .catch(console.error);
    } else {
        // Android & PC funktionieren meist direkt
        window.addEventListener('deviceorientation', handleOrientation);
    }
}

function handleOrientation(event) {
    // Werte holen (Beta = Vor/Zurück, Gamma = Links/Rechts)
    const x = event.gamma; // Neigung links/rechts (-90 bis 90)
    const y = event.beta;  // Neigung vor/zurück (-180 bis 180)

    // Anzeigen
    document.getElementById('tilt_x').innerText = Math.round(x);
    document.getElementById('tilt_y').innerText = Math.round(y);

    // Blase bewegen (Begrenzen auf den Kreis)
    // Wir skalieren die Werte etwas, damit sie nicht sofort aus dem Bild fliegen
    let moveX = x * 2;
    let moveY = y * 2;

    // Begrenzung (Radius ca. 80px)
    const max = 80;
    if (moveX > max) moveX = max;
    if (moveX < -max) moveX = -max;
    if (moveY > max) moveY = max;
    if (moveY < -max) moveY = -max;

    // Blase bewegen
    const bubble = document.getElementById('bubble');
    bubble.style.transform = `translate(calc(-50% + ${moveX}px), calc(-50% + ${moveY}px))`;

    // Farbe ändern wenn "im Wasser" (nahe 0)
    if (Math.abs(x) < 2 && Math.abs(y) < 2) {
        bubble.style.backgroundColor = "#00c851"; // Grün
        bubble.style.boxShadow = "0 0 15px #00c851";
    } else {
        bubble.style.backgroundColor = "#ff4444"; // Rot
        bubble.style.boxShadow = "none";
    }
}


// --- UNTERSCHRIFTEN MODUL ---
let canvas, ctx, isDrawing = false;

function openSignatureModal() {
    document.getElementById('sig_modal').style.display = 'flex';
    canvas = document.getElementById('sig_canvas');
    ctx = canvas.getContext('2d');
    
    // Einstellungen für den Stift
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 2;

    // Events für Touch (Handy) & Maus (PC)
    canvas.addEventListener('mousedown', startDraw);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', endDraw);
    canvas.addEventListener('touchstart', startDraw, {passive: false});
    canvas.addEventListener('touchmove', draw, {passive: false});
    canvas.addEventListener('touchend', endDraw);
}

function closeSignatureModal() {
    document.getElementById('sig_modal').style.display = 'none';
}

function startDraw(e) {
    isDrawing = true;
    draw(e); // Erster Punkt
}

function endDraw() {
    isDrawing = false;
    ctx.beginPath(); // Pfad unterbrechen
}

function draw(e) {
    if (!isDrawing) return;
    e.preventDefault(); // Verhindert Scrollen beim Malen!

    // Position ermitteln (Maus oder Touch)
    const rect = canvas.getBoundingClientRect();
    let x, y;
    
    if(e.type.includes('touch')) {
        x = e.touches[0].clientX - rect.left;
        y = e.touches[0].clientY - rect.top;
    } else {
        x = e.clientX - rect.left;
        y = e.clientY - rect.top;
    }

    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
}

function clearSignature() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}


// --- WARTUNGS CHECKLISTE ---
const checklistData = [
    "Anlage spannungsfrei schalten",
    "Gashahn schließen",
    "Verkleidung entfernen",
    "Wärmetauscher reinigen",
    "Elektroden prüfen/tauschen",
    "Siphon reinigen & füllen",
    "Vordruck MAG prüfen (Drucklos!)",
    "Wasserdruck prüfen & füllen",
    "Gashahn öffnen & Dichtheit prüfen",
    "Abgasmessung durchführen (Schornsteinfeger-Taste)",
    "Aufkleber anbringen"
];

// Laden & Anzeigen
function loadChecklist() {
    const container = document.getElementById('checklist_container');
    if(!container) return; // Nur wenn View existiert
    
    container.innerHTML = '';
    
    // Gespeicherte Haken laden
    const saved = JSON.parse(localStorage.getItem('shk_maintenance')) || {};

    let doneCount = 0;

    checklistData.forEach((task, index) => {
        const isDone = saved[index] === true;
        if(isDone) doneCount++;

        const div = document.createElement('div');
        div.style.padding = "10px";
        div.style.borderBottom = "1px solid #444";
        div.style.display = "flex";
        div.style.alignItems = "center";
        div.style.cursor = "pointer";
        
        // Checkbox Logik
        div.onclick = () => toggleCheck(index);

        div.innerHTML = `
            <span style="font-size:1.5rem; margin-right:10px;">${isDone ? '✅' : '⬜'}</span>
            <span style="${isDone ? 'text-decoration:line-through; color:#777;' : ''}">${task}</span>
        `;
        
        container.appendChild(div);
    });

    // Fortschrittsbalken updaten
    const percent = (doneCount / checklistData.length) * 100;
    document.getElementById('check_progress').style.width = percent + "%";
}

function toggleCheck(index) {
    const saved = JSON.parse(localStorage.getItem('shk_maintenance')) || {};
    
    // Status umkehren
    if(saved[index]) {
        delete saved[index];
    } else {
        saved[index] = true;
    }
    
    localStorage.setItem('shk_maintenance', JSON.stringify(saved));
    loadChecklist(); // Neu malen
}

function resetChecklist() {
    if(confirm("Alles zurücksetzen?")) {
        localStorage.removeItem('shk_maintenance');
        loadChecklist();
    }
}

// Initial laden
document.addEventListener('DOMContentLoaded', loadChecklist);


// --- FAHRZEUG LAGER ---
let inventoryDB = JSON.parse(localStorage.getItem('shk_inventory')) || [];

// --- FAHRZEUG LAGER (Repariert) ---

function renderInventory() {
    const list = document.getElementById('inventory_list');
    if(!list) return;
    
    // Liste leeren
    list.innerHTML = '';
    
    // Klasse hinzufügen für CSS Styling
    list.className = 'inventory-list';

    inventoryDB.forEach((item, index) => {
        const li = document.createElement('li');
        li.className = 'inventory-item';
        
        // Ist der Bestand niedrig? (unter 3)
        const isLow = item.amount < 3;

        li.innerHTML = `
            <div class="inventory-controls">
                <button class="inventory-btn" onclick="updateStock(${index}, -1)">-</button>
                <span class="inventory-count ${isLow ? 'low-stock' : ''}">${item.amount}</span>
                <button class="inventory-btn" onclick="updateStock(${index}, 1)">+</button>
            </div>

            <div class="inventory-name">
                ${item.name}
            </div>

            <button class="btn-icon-small btn-danger" onclick="deleteInventoryItem(${index})" style="height:35px; width:35px;">
                ×
            </button>
        `;
        list.appendChild(li);
    });
}

function updateStock(index, change) {
    // 1. Wert ändern
    inventoryDB[index].amount += change;
    
    // Nicht unter 0 gehen
    if(inventoryDB[index].amount < 0) inventoryDB[index].amount = 0;
    
    // 2. Speichern
    saveInventory();
    
    // 3. Neu anzeigen (WICHTIG!)
    renderInventory();
}

// (Die deleteInventoryItem, addInventoryItem und saveInventory kannst du lassen wie sie waren, 
//  solange addInventoryItem am Ende auch renderInventory() aufruft)

function addInventoryItem() {
    const name = document.getElementById('inv_name').value;
    let amount = parseInt(document.getElementById('inv_amount').value);
    if(!name) return;
    if(isNaN(amount)) amount = 1;

    inventoryDB.push({ name, amount });
    saveInventory();
    renderInventory();
    
    document.getElementById('inv_name').value = '';
    document.getElementById('inv_amount').value = '';
}

function updateStock(index, change) {
    // 1. Wert ändern
    inventoryDB[index].amount += change;
    
    // Nicht unter 0 gehen
    if(inventoryDB[index].amount < 0) inventoryDB[index].amount = 0;
    
    // 2. Speichern
    saveInventory();
    
    // 3. Neu anzeigen (WICHTIG!)
    renderInventory();
}

function deleteInventoryItem(index) {
    if(confirm("Löschen?")) {
        inventoryDB.splice(index, 1);
        saveInventory();
        renderInventory();
    }
}

function saveInventory() {
    localStorage.setItem('shk_inventory', JSON.stringify(inventoryDB));
}

// Initial laden
document.addEventListener('DOMContentLoaded', renderInventory);


// --- KALENDER MODUL ---
let currentDate = new Date();

function renderCalendar() {
    const grid = document.getElementById('calendar_grid');
    const title = document.getElementById('cal_month_year');
    if(!grid) return;

    grid.innerHTML = '';
    
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth(); // 0 = Jan
    
    // Titel setzen
    const monthNames = ["Januar","Februar","März","April","Mai","Juni","Juli","August","September","Oktober","November","Dezember"];
    title.innerText = `${monthNames[month]} ${year}`;

    // Erster Tag des Monats & Anzahl Tage
    const firstDayIndex = new Date(year, month, 1).getDay(); // 0 = So, 1 = Mo
    // Korrektur: Wir wollen Montag als Start (dt. Woche)
    const startDay = (firstDayIndex === 0) ? 6 : firstDayIndex - 1;
    
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // Wochentage Header
    const daysHeader = ['Mo','Di','Mi','Do','Fr','Sa','So'];
    daysHeader.forEach(d => {
        const div = document.createElement('div');
        div.className = 'cal-header';
        div.innerText = d;
        grid.appendChild(div);
    });

    // Leere Felder davor
    for(let i=0; i<startDay; i++) {
        const div = document.createElement('div');
        grid.appendChild(div);
    }

    // Tage füllen
    const today = new Date();
    
    for(let d=1; d<=daysInMonth; d++) {
        const div = document.createElement('div');
        div.className = 'cal-day';
        div.innerText = d;
        
        // Checken ob heute
        if(d === today.getDate() && month === today.getMonth() && year === today.getFullYear()) {
            div.classList.add('today');
        }

        // Checken ob Projekte an diesem Tag liegen
        // Format im Projekt DB: "2024-05-20" (ISO vom Input field)
        // Wir bauen den String für diesen Tag
        const dateString = `${year}-${String(month+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
        
        // Suchen in projectsDB (Globale Variable aus deinem Material-Teil)
        const hasProject = projectsDB.some(p => p.isoDate === dateString); // Achtung: Wir müssen addProject anpassen!

        if(hasProject) {
            const dot = document.createElement('div');
            dot.className = 'cal-dot';
            div.appendChild(dot);
        }

        // Klick Event
        div.onclick = () => showEventsForDay(dateString, d);
        
        grid.appendChild(div);
    }
}

function changeMonth(dir) {
    currentDate.setMonth(currentDate.getMonth() + dir);
    renderCalendar();
}

function showEventsForDay(isoDate, dayNum) {
    const container = document.getElementById('calendar_events');
    // Filter Projekte
    const events = projectsDB.filter(p => p.isoDate === isoDate);
    
    let html = `<h5>Projekte am ${dayNum}.:</h5>`;
    
    if(events.length === 0) {
        html += '<p style="color:#777;">Keine Einträge.</p>';
    } else {
        events.forEach(p => {
            // Wir nutzen onclick, um direkt zur Materialliste zu springen
            // Dafür müssen wir die ID kennen
            html += `
            <div class="cal-event-card" onclick="jumpToProject(${p.id})">
                <strong>${p.name}</strong><br>
                <small>${p.items.length} Positionen</small>
                <span style="float:right;">➜</span>
            </div>`;
        });
    }
    container.innerHTML = html;
    
    // Highlight Auswahl
    document.querySelectorAll('.cal-day').forEach(el => el.classList.remove('selected'));
    // (Einfache Lösung: Wir lassen das Highlighting erstmal weg oder machen es über event target)
}

function jumpToProject(id) {
    // 1. Tab wechseln
    switchTab('material', document.querySelectorAll('.nav-item')[1]); // Index 1 = Listen
    // 2. Projekt öffnen
    openProject(id);
}

// ACHTUNG: Wir müssen deine "addProject" Funktion patchen, 
// damit sie das Datum vom neuen Input-Feld speichert!
// Kopiere diese Funktion und überschreibe deine alte addProject:

function addProject() {
    const inputName = document.getElementById('new_project_name');
    const inputDate = document.getElementById('new_project_date');
    const name = inputName.value.trim();
    let dateVal = inputDate.value; // Format yyyy-mm-dd

    if (!name) return;

    // Wenn kein Datum gewählt, nimm heute
    if(!dateVal) {
        const now = new Date();
        dateVal = now.toISOString().split('T')[0];
    }

    // Deutsches Datum für die Anzeige
    const dateObj = new Date(dateVal);
    const dateDisplay = dateObj.toLocaleDateString('de-DE');

    const newProject = {
        id: Date.now(),
        name: name,
        date: dateDisplay,    // Für die Anzeige in der Liste
        isoDate: dateVal,     // NEU: Für den Kalender-Vergleich
        archived: false,
        items: []
    };

    projectsDB.unshift(newProject);
    saveProjects();
    
    // Refresh
    setProjectView('active');
    renderCalendar(); // Damit der Punkt im Kalender erscheint
    
    inputName.value = '';
    // Datum lassen wir evtl stehen oder löschen es auch
}


const EXTERNAL_OPT_IN_KEYS = {
    pdf: 'shk_external_pdf_opt_in'
};

const EXTERNAL_LIB_URLS = {
    jsPdf: 'https://cdn.jsdelivr.net/npm/jspdf@2.5.1/dist/jspdf.umd.min.js'
};

function loadExternalScriptOnce(scriptId, src) {
    return new Promise((resolve, reject) => {
        const existing = document.getElementById(scriptId);
        if (existing) {
            if (existing.dataset.loaded === 'true') {
                resolve();
                return;
            }
            existing.addEventListener('load', () => resolve());
            existing.addEventListener('error', () => reject(new Error('Script load failed')));
            return;
        }

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
    });
}

// --- AUTO-SCROLL FÜR EINGABEFELDER WENN TASTATUR ERSCHEINT ---
function setupInputAutoScroll() {
    // Alle input und textarea Felder
    const inputs = document.querySelectorAll('input, textarea, select');
    
    inputs.forEach(input => {
        // Verhindere doppelte Event-Listener
        if (input.dataset.autoScrollEnabled) return;
        input.dataset.autoScrollEnabled = 'true';
        
        input.addEventListener('focus', (e) => {
            setTimeout(() => {
                const element = e.target;
                const container = element.closest('.container') || document.querySelector('main');
                
                if (container) {
                    // Scrolle das Eingabefeld in die Mitte des sichtbaren Bereichs
                    element.scrollIntoView({
                        behavior: 'smooth',
                        block: 'center',
                        inline: 'nearest'
                    });
                }
            }, 300); // Verzögerung damit Tastatur Zeit hat zu erscheinen
        });
    });
}

// Event Delegation für dynamisch hinzugefügte Felder
document.addEventListener('focus', (e) => {
    if ((e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') 
        && !e.target.dataset.autoScrollEnabled) {
        setTimeout(() => {
            e.target.scrollIntoView({
                behavior: 'smooth',
                block: 'center',
                inline: 'nearest'
            });
        }, 300);
    }
}, true);

// Sobald die Seite geladen ist:
    window.addEventListener('load', () => {
        setupInputAutoScroll();
    });

// Initialer Render Kalender
document.addEventListener('DOMContentLoaded', renderCalendar);

// Service Worker registrieren (macht die App offline-fähig)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js?v=10')
            .then(reg => console.log('Service Worker registriert!', reg))
            .catch(err => console.log('Service Worker Fehler:', err));
    });
}


async function ensurePdfLibsLoaded() {
    if (window.jspdf && window.jspdf.jsPDF) return true;

    if (localStorage.getItem(EXTERNAL_OPT_IN_KEYS.pdf) !== 'true') {
        const ok = confirm(
            'PDF-Export laedt jsPDF von jsdelivr (Drittanbieter). Dabei wird deine IP an den Dienst uebertragen. Fortfahren?'
        );
        if (!ok) return false;
        localStorage.setItem(EXTERNAL_OPT_IN_KEYS.pdf, 'true');
    }

    try {
        await loadExternalScriptOnce('jspdf-lib', EXTERNAL_LIB_URLS.jsPdf);
        return !!(window.jspdf && window.jspdf.jsPDF);
    } catch (err) {
        console.error('jsPDF konnte nicht geladen werden:', err);
        alert('❌ PDF-Bibliothek konnte nicht geladen werden. Bitte spaeter erneut versuchen.');
        return false;
    }
}


// --- PDF EXPORT MODUL ---
let signatureDataURL = null; // Speichert die Unterschrift

function openSignatureModalForPDF() {
    signatureDataURL = null; // Unterschrift zurücksetzen
    openSignatureModal();
}

function openSignatureModal() {
    document.getElementById('sig_modal').style.display = 'flex';
    canvas = document.getElementById('sig_canvas');
    ctx = canvas.getContext('2d');
    
    // Einstellungen für den Stift
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    // Events für Touch (Handy) & Maus (PC)
    canvas.addEventListener('mousedown', startDraw);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', endDraw);
    canvas.addEventListener('touchstart', startDraw, {passive: false});
    canvas.addEventListener('touchmove', draw, {passive: false});
    canvas.addEventListener('touchend', endDraw);
}

function closeSignatureModal() {
    document.getElementById('sig_modal').style.display = 'none';
    canvas = null;
    ctx = null;
}

function previewPDFWithSignature() {
    const canvas = document.getElementById('sig_canvas');
    const ctx = canvas.getContext('2d');
    
    // Prüfe ob Canvas leer ist (alle Pixel transparent)
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    let hasContent = false;
    
    for (let i = 3; i < data.length; i += 4) {
        if (data[i] > 0) { // Alpha-Kanal prüfen
            hasContent = true;
            break;
        }
    }
    
    if (!hasContent) {
        alert("⚠️ Unterschrift ist leer! Bitte tatsächlich unterschreiben.");
        return;
    }
    
    signatureDataURL = canvas.toDataURL('image/png');
    closeSignatureModal();
    alert("✅ Unterschrift gespeichert! PDF wird erstellt...");
    
    // PDF wird automatisch erstellt nach kurzer Verzögerung
    setTimeout(() => {
        exportMaterialListPDFWithSignature();
    }, 300);
}

function exportMaterialListPDF() {
    // Ohne Unterschrift direkt exportieren
    signatureDataURL = null;
    exportMaterialListPDFWithSignature();
}

async function exportMaterialListPDFWithSignature() {
    try {
        const libsReady = await ensurePdfLibsLoaded();
        if (!libsReady) return;

        const project = projectsDB.find(p => p.id === currentProjectId);
        if (!project) {
            alert("❌ Kein Projekt ausgewählt!");
            return;
        }
        
        if (!project.items || project.items.length === 0) {
            const confirmEmpty = confirm('⚠️ Materialliste ist leer. Trotzdem PDF erstellen?');
            if (!confirmEmpty) return;
        }

        const { jsPDF } = window.jspdf || {};
        if (!jsPDF) {
            alert("❌ PDF-Bibliothek nicht geladen. Bitte Seite neu laden.");
            return;
        }
        
        const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4'
        });

        // Einstellungen
        let yPosition = 20;
        const pageWidth = pdf.internal.pageSize.getWidth();
        const margin = 15;
        const contentWidth = pageWidth - (2 * margin);

    // Titel
    pdf.setFontSize(20);
    pdf.setTextColor(0, 86, 179); // Blau
    pdf.text('SHK-MATE Rapport', margin, yPosition);
    yPosition += 12;

    // Projektname
    pdf.setFontSize(14);
    pdf.setTextColor(0, 0, 0);
    pdf.text(project.name, margin, yPosition);
    yPosition += 8;

    // Datum
    pdf.setFontSize(10);
    pdf.setTextColor(100, 100, 100);
    pdf.text('Erstellt: ' + project.date, margin, yPosition);
    yPosition += 12;

    // Materialliste Überschrift
    pdf.setFontSize(12);
    pdf.setTextColor(0, 0, 0);
    pdf.text('Materialliste:', margin, yPosition);
    yPosition += 10;

    // Tabelle Header
    pdf.setFontSize(10);
    pdf.setFillColor(240, 240, 240);
    pdf.rect(margin, yPosition - 5, contentWidth, 6, 'F');
    pdf.text('Anzahl', margin + 2, yPosition);
    pdf.text('Material', margin + 25, yPosition);
    yPosition += 8;

    // Tabellendaten
    project.items.forEach(item => {
        const amount = item.amount || '1';
        const text = item.text || 'Ohne Name';
        
        pdf.setFontSize(10);
        pdf.setTextColor(0, 0, 0);
        
        // Zellrahmen
        pdf.setDrawColor(200, 200, 200);
        pdf.rect(margin, yPosition - 5, contentWidth, 6);
        
        pdf.text(amount + 'x', margin + 2, yPosition);
        
        // Text umbrechen falls zu lang
        const splitText = pdf.splitTextToSize(text, contentWidth - 25);
        pdf.text(splitText, margin + 25, yPosition);
        
        yPosition += 6 + (splitText.length - 1) * 4;
    });

    yPosition += 5;

    // Unterschrift wenn vorhanden
    if (signatureDataURL) {
        pdf.setFontSize(12);
        pdf.setTextColor(0, 0, 0);
        pdf.text('Unterschrift:', margin, yPosition);
        yPosition += 8;
        
        try {
            pdf.addImage(signatureDataURL, 'PNG', margin, yPosition, 60, 30);
            yPosition += 35;
        } catch (err) {
            console.error('Fehler beim Einfügen der Unterschrift:', err);
        }
    }

    const isCap = typeof window !== 'undefined' && window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform();
    const Filesystem = isCap ? window.Capacitor.Plugins?.Filesystem : null;

    if (Filesystem) {
        // Native Android Weg mit Auto-Nummerierung bei Duplikaten
        try {
            const baseName = ('Rapport_' + project.name + '.pdf').replace(/[^a-zA-Z0-9_\-\.]/g, '_');
            const pdfBlob = pdf.output('blob');
            
            const reader = new FileReader();
            reader.onloadend = async function() {
                try {
                    const base64data = reader.result.split(',')[1];
                    
                    // Funktion um Duplikate zu vermeiden
                    const getUniqueFileName = async (baseName) => {
                        try {
                            // Erst versuchen, ob Datei schon existiert
                            await Filesystem.stat({
                                path: baseName,
                                directory: 'DOCUMENTS'
                            });
                            // Wenn keine Exception → Datei existiert, nummerieren
                            const nameParts = baseName.split('.');
                            const extension = nameParts.pop();
                            const nameWithoutExt = nameParts.join('.');
                            
                            let counter = 1;
                            let newName = `${nameWithoutExt}(${counter}).${extension}`;
                            
                            while (true) {
                                try {
                                    await Filesystem.stat({
                                        path: newName,
                                        directory: 'DOCUMENTS'
                                    });
                                    counter++;
                                    newName = `${nameWithoutExt}(${counter}).${extension}`;
                                } catch (e) {
                                    // Datei existiert nicht, diese nehmen wir
                                    return newName;
                                }
                            }
                        } catch (e) {
                            // Datei existiert nicht, Original verwenden
                            return baseName;
                        }
                    };
                    
                    const finalFileName = await getUniqueFileName(baseName);
                    
                    console.log('Schreibe PDF als:', finalFileName);
                    
                    // Schreibe in Dokumente-Verzeichnis
                    await Filesystem.writeFile({
                        path: finalFileName,
                        data: base64data,
                        directory: 'DOCUMENTS',
                        recursive: true
                    });
                    
                    console.log('PDF erfolgreich gespeichert:', finalFileName);
                    alert('✅ PDF gespeichert: ' + finalFileName);
                    
                    // Unterschrift zurücksetzen für nächsten Export
                    signatureDataURL = null;
                    console.log('Unterschrift gelöscht');
                    
                    // Canvas über Modal löschen (falls das Modal offen ist)
                    const sigCanvas = document.getElementById('sig_canvas');
                    if (sigCanvas) {
                        const sigCtx = sigCanvas.getContext('2d');
                        if (sigCtx) {
                            sigCtx.clearRect(0, 0, sigCanvas.width, sigCanvas.height);
                            console.log('Canvas über Modal geleert');
                        }
                    }
                } catch (err) {
                    console.error('PDF-Fehler:', err);
                    alert('❌ PDF-Fehler: ' + err.message);
                }
            };
            reader.readAsDataURL(pdfBlob);
            return;
        } catch (err) {
            console.error('PDF-Fehler:', err);
            alert('❌ PDF-Fehler: ' + err.message);
        }
    }

    // Fallback für Browser (nicht-Android)
    try {
        pdf.save('Rapport_' + project.name + '.pdf');
        alert('✅ PDF wurde heruntergeladen.');
    } catch (err) {
        alert('❌ PDF-Export fehlgeschlagen: ' + err.message);
    }

    // Fallback: klassischer Download im Browser
    pdf.save('Rapport_' + project.name + '.pdf');
    alert("✅ PDF wurde heruntergeladen!");
    }
    catch (err) {
        console.error('Fehler beim PDF Export:', err);
        alert('❌ PDF Export fehlgeschlagen. Bitte erneut versuchen.');
    }
}