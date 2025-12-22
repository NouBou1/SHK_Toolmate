// --- NORMEN DATENBANK (Debug Version) ---
let normenDB = [];

console.log("Starte Laden der Normen..."); // Taucht in der Konsole auf

fetch('normen.json')
    .then(response => {
        if (!response.ok) {
            throw new Error("HTTP Fehler! Status: " + response.status);
        }
        return response.json();
    })
    .then(data => {
        console.log("Daten erfolgreich geladen:", data); // Zeigt die Daten in der Konsole
        normenDB = data;

        // Sicherheits-Check: Gibt es die Funktion renderNormen überhaupt?
        if (typeof renderNormen === "function") {
            renderNormen(normenDB);
        } else {
            console.error("Fehler: Funktion 'renderNormen' nicht gefunden!");
        }
    })
    .catch(error => {
        console.error("KRITISCHER FEHLER:", error);
        // Zeigt den Fehler direkt auf dem Bildschirm an:
        const listEl = document.getElementById('normList');
        if (listEl) {
            listEl.innerHTML = `<div style="color:red; border:1px solid red; padding:10px;">
                <strong>Fehler beim Laden:</strong><br>${error.message}<br>
                <em>(Schau in die F12 Konsole für Details)</em>
            </div>`;
        }
    });



// --- NAVIGATION LOGIC ---
function switchTab(viewId, btn) {
    document.querySelectorAll('.container').forEach(el => el.classList.remove('active'));
    document.getElementById('view-' + viewId).classList.add('active');

    document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
    btn.classList.add('active');
}

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

// --- RECHNER FUNKTIONEN ---
function calcHeizlast() {
    const qm = parseFloat(document.getElementById('hl_flaeche').value);
    const factor = parseFloat(document.getElementById('hl_typ').value);

    if (!qm) return;

    const watt = qm * factor;
    const kw = (watt / 1000).toFixed(2);

    showResult('res_heizlast', `Bedarf: ca. ${watt} Watt (${kw} kW)`);
}

function calcVolumenstrom() {
    const kw = parseFloat(document.getElementById('vs_kw').value);
    const dt = parseFloat(document.getElementById('vs_dt').value);

    if (!kw || !dt) return;

    const result = (kw * 1000) / (1.163 * dt);
    showResult('res_volumen', `Volumenstrom: ${Math.round(result)} l/h`);
}

function calcZirkulation() {
    const len = parseFloat(document.getElementById('zirk_m').value);
    const contentPerM = parseFloat(document.getElementById('zirk_dn').value);

    if (!len) return;

    const totalVol = len * contentPerM;
    const isCritical = totalVol > 3;

    const msg = `Inhalt: ${totalVol.toFixed(2)} Liter.\n` +
        (isCritical ? "ACHTUNG: > 3 Liter! Zirkulation pflicht (DVGW W 551)." : "OK: Keine Zirkulation nötig.");

    showResult('res_zirk', msg, isCritical);
}


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

// 2. Projekt hinzufügen
function addProject() {
    const input = document.getElementById('new_project_name');
    const name = input.value.trim();

    if (!name) return;

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

        li.innerHTML = `
            <div style="display:flex; align-items:center;">
                <span class="item-amount">${displayAmount}x</span>
                <span>${item.text}</span>
            </div>
            <button class="btn-icon-small" onclick="deleteMaterialItem(${index})">×</button>
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

// 10. Projekt löschen
function deleteCurrentProject() {
    if (confirm("Wirklich löschen?")) {
        const idx = projectsDB.findIndex(p => p.id === currentProjectId);
        if (idx > -1) {
            projectsDB.splice(idx, 1);
            saveProjects();
            closeProject();
        }
    }
}

// Hilfsfunktion: Speichern
function saveProjects() {
    localStorage.setItem('shk_projects', JSON.stringify(projectsDB));
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

function calcMAG() {
    const h = parseFloat(document.getElementById('mag_hoehe').value);

    if (isNaN(h)) return;

    // Formel: Statische Höhe / 10 + 0.3 bar (VDI 4708 empfiehlt mind 0.3 Zuschlag zur Verdampfungsvermeidung)
    // Mindestens jedoch oft 1.0 bar bei Etagenheizungen, wir rechnen hier den reinen Sollwert.
    let p0 = (h / 10) + 0.3;

    // Runden
    p0 = Math.round(p0 * 10) / 10;

    // Fülldruck ist meist p0 + 0.3 bis 0.5
    const pFill = p0 + 0.3;

    showResult('res_mag',
        `Vordruck (P0): ${p0} bar\n` +
        `Anlagen-Fülldruck: ca. ${pFill.toFixed(1)} bar`
    );
}

function calcPipeVol() {
    const len = parseFloat(document.getElementById('vol_len').value);
    const dn = parseFloat(document.getElementById('vol_dim').value); // DN ist hier ca Innendurchmesser in mm

    if (!len) return;

    // Radius in cm umrechnen für Liter (dm³)
    // DN 15 = 15mm innen = 1.5cm -> r = 0.75cm
    // Volumen = r² * pi * länge(cm) / 1000 für Liter

    // Vereinfachte Faktoren pro Meter (gängige Rohrreihen Cu/C-Stahl)
    // DN 12 (~13mm innen) -> 0.13 l/m
    // DN 15 (~16mm innen) -> 0.20 l/m
    // DN 20 (~20mm innen) -> 0.31 l/m
    // DN 25 (~26mm innen) -> 0.53 l/m
    // DN 32 (~33mm innen) -> 0.85 l/m
    // DN 40 (~40mm innen) -> 1.25 l/m
    // DN 50 (~51mm innen) -> 2.04 l/m

    let factor = 0;
    switch (dn) {
        case 12: factor = 0.13; break;
        case 15: factor = 0.20; break;
        case 20: factor = 0.31; break;
        case 25: factor = 0.53; break;
        case 32: factor = 0.85; break;
        case 40: factor = 1.25; break;
        case 50: factor = 2.04; break;
    }

    const total = len * factor;

    showResult('res_pipevol',
        `Rohrinhalt: ${total.toFixed(2)} Liter\n` +
        `(Faktor ca. ${factor} l/m)`
    );
}


// --- NEUE TOOLS ---

function calcHardness() {
    const val = parseFloat(document.getElementById('hard_val').value);
    const mode = document.getElementById('hard_mode').value;

    if (isNaN(val)) return;

    let result = 0;
    // Faktoren: 1 °dH = 0.1783 mmol/l | 1 mmol/l = 5.608 °dH

    if (mode === 'dh_to_mmol') {
        result = val * 0.1783;
        showResult('res_hard', `${val} °dH = ${result.toFixed(2)} mmol/l`);
    } else {
        result = val * 5.608;
        showResult('res_hard', `${val} mmol/l = ${result.toFixed(1)} °dH`);
    }
}

function calcGasPower() {
    const sec = parseFloat(document.getElementById('gas_sec').value);
    const vol = parseFloat(document.getElementById('gas_vol').value); // m³

    if (!sec || !vol) return;

    // Brennwert H-Gas ca. 11,2 kWh/m³ | Heizwert ca 10.0
    // L-Gas ca. 8-9.
    // Wir nehmen einen realistischen Mittelwert für Heizwert Hi (ca 10 kWh/m³) für die Belastung
    // oder Brennwert Hs (ca 11 kWh/m³).
    // Für die Geräteeinstellung (Düsendruck/Volumenstrom) rechnet man oft mit Hi ~ 10.0 (Faustformel).

    const factor = 10.0; // kWh/m³ (Kann man optional konfigurierbar machen)

    // Formel: (Volumen * Faktor * 3600) / Zeit
    const load = (vol * factor * 3600) / sec;

    showResult('res_gas',
        `Durchsatz: ${(vol * 3600 / sec).toFixed(2)} m³/h\n` +
        `Feuerungsleistung: ca. ${load.toFixed(1)} kW\n` +
        `(bei Hi = 10 kWh/m³)`
    );
}


function calcMixWater() {
    const tHot = parseFloat(document.getElementById('mix_t_hot').value);
    const volHot = parseFloat(document.getElementById('mix_vol').value);
    const tCold = parseFloat(document.getElementById('mix_t_cold').value);
    const tTarget = 38; // Zieltemperatur Badewasser/Dusche

    if (!tHot || !volHot) return;

    // Physik: Wärmemengenbilanz
    // V_mix = V_hot * (T_hot - T_cold) / (T_mix - T_cold)

    const numerator = volHot * (tHot - tCold);
    const denominator = tTarget - tCold;

    if (denominator <= 0) {
        showResult('res_mix', 'Fehler: Kaltwasser wärmer als Ziel?', true);
        return;
    }

    const vMix = numerator / denominator;

    // Faktor: Wie viel mal mehr Wasser bekomme ich raus?
    const factor = (vMix / volHot).toFixed(1);

    showResult('res_mix',
        `Ertrag bei 38°C: ca. ${Math.round(vMix)} Liter\n` +
        `(Faktor ${factor}x des Speichervolumens)`
    );
}

function calcOffset() {
    const offset = parseFloat(document.getElementById('offset_cm').value);

    if (!offset) return;

    // Formel für 45 Grad: Hypotenuse = Kathete * Wurzel(2)
    // Wurzel(2) ist ca. 1.414
    const diag = offset * 1.4142;

    // Hinweis auf Einschubtiefe (Z-Maß)
    showResult('res_offset',
        `Rohrlänge (Mitte-Mitte): ${diag.toFixed(1)} cm\n` +
        `\n⚠️ Achtung: Einstecktiefe der Fittings noch abziehen!`
    );
}

function calcSlope() {
    const len = parseFloat(document.getElementById('slope_len').value);
    const perc = parseFloat(document.getElementById('slope_perc').value);

    if (!len) return;

    // Gefälle in cm = Länge(m) * Prozent
    // 2m * 2% = 4cm
    const diff = len * perc; // Da len in m, ergibt das Ergebnis eigentlich m/100 -> also cm
    // Beispiel: 1m * 2 (=2%) = 2cm. Korrekt.

    // cm in mm für genaues Messen
    const mm = diff * 10;

    showResult('res_slope',
        `Höhenunterschied: ${diff.toFixed(1)} cm\n` +
        `(${mm} mm am Zollstock)`
    );
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
document.addEventListener("DOMContentLoaded", loadQuickNote);



/* --- DATEN: Wichtige SHK Normen --- */
const normenData = [
    { kuerzel: "TRGI 2018", titel: "Technische Regeln für Gasinstallationen", tags: "gas leitung sicherheit" },
    { kuerzel: "DIN 1988", titel: "Technische Regeln für Trinkwasser-Installationen", tags: "trinkwasser hygiene spülung" },
    { kuerzel: "DIN EN 1717", titel: "Schutz des Trinkwassers vor Verunreinigungen", tags: "trinkwasser rückflussverhinderer" },
    { kuerzel: "DIN 18380", titel: "VOB/C Heizanlagen und zentrale Wassererwärmung", tags: "heizung vob installation" },
    { kuerzel: "TRWI", titel: "Technische Regeln für Wasserinstallationen", tags: "wasser allgemein" },
    { kuerzel: "DIN EN 12056", titel: "Schwerkraftentwässerungsanlagen innerhalb von Gebäuden", tags: "abwasser entwässerung" }
];

/* --- FUNKTION: Normen Liste initialisieren --- */
/* --- ANZEIGE FUNKTION (Passend zu deiner JSON) --- */
function renderNormen(list) {
    // 1. Das Ziel-Element im HTML suchen
    const container = document.getElementById('normList');

    // Sicherheits-Check: Gibt es das Element überhaupt?
    if (!container) {
        console.error("Fehler: HTML-Element mit ID 'normList' nicht gefunden!");
        return;
    }

    // 2. Liste leeren (damit nichts doppelt kommt)
    container.innerHTML = '';

    // 3. Wenn Liste leer ist, Meldung zeigen
    if (!list || list.length === 0) {
        container.innerHTML = '<p style="color:#aaa; padding:10px;">Keine Norm gefunden.</p>';
        return;
    }

    // 4. Für jeden Eintrag (item) eine Box bauen
    list.forEach(item => {
        const div = document.createElement('div');
        div.className = 'norm-item';

        // Style direkt hier setzen, damit man es sicher sieht
        div.style.padding = "12px";
        div.style.borderBottom = "1px solid #444";
        div.style.marginBottom = "5px";

        // Hier füllen wir die Daten ein (Code, Title, Text aus deiner Konsole)
        // Wir nutzen "|| ''", falls mal ein Text fehlt, damit kein "undefined" kommt
        div.innerHTML = `
            <div style="color: #ff9900; font-weight: bold; margin-bottom:4px;">${item.code || 'Code fehlt'}</div>
            <div style="font-weight: bold; font-size: 1.1rem; margin-bottom:4px; color: white;">${item.title || 'Titel fehlt'}</div>
            <div style="color: #ccc; font-size: 0.9rem; line-height: 1.4;">${item.text || ''}</div>
        `;

        container.appendChild(div);
    });
}

/* --- SUCHE FUNKTION --- */
function filterNormen() {
    const searchInput = document.getElementById('searchBar');
    if (!searchInput) return;

    const term = searchInput.value.toLowerCase();

    // Wir filtern basierend auf den echten Daten-Namen
    const filtered = normenDB.filter(n =>
        (n.code && n.code.toLowerCase().includes(term)) ||
        (n.title && n.title.toLowerCase().includes(term)) ||
        (n.text && n.text.toLowerCase().includes(term))
    );

    renderNormen(filtered);
}


// Deine bereits vorhandene Toggle-Funktion
function toggleTable(id) {
    const el = document.getElementById(id);
    const header = el.previousElementSibling.querySelector('span'); // Den Pfeil finden

    if (el.style.display === 'none') {
        el.style.display = 'block';
        if (header) header.innerText = '▲'; // Pfeil nach oben
    } else {
        el.style.display = 'none';
        if (header) header.innerText = '▼'; // Pfeil nach unten
    }
}

// WICHTIG: Beim Start einmal ausführen, um die Liste zu füllen
document.addEventListener('DOMContentLoaded', () => {
    renderNormen();
});


// --- NEUE FUNKTIONEN ---

function calcCoreDrill() {
    const dn = parseFloat(document.getElementById('kb_dn').value);
    const iso = parseFloat(document.getElementById('kb_iso').value);

    // Berechnung: Rohr Außen + (2 * Dämmung) + 20mm Montagespielraum
    // Wir nehmen an, der User wählt das DN Maß, das Rohr ist außen oft minimal größer (z.B. DN100 = 110mm)
    // Die Select Values im HTML sind bereits die echten Außendurchmesser (z.B. 110).

    const totalDiameter = dn + (2 * iso);
    const drillHole = totalDiameter + 30; // +3cm Luft für Mörtel/Schaum ist praxisnah

    // Aufrunden auf nächste 10er Stelle für Kronen-Maß
    const recommendation = Math.ceil(drillHole / 10) * 10;

    showResult('res_kb',
        `Rohr + Dämmung: ${totalDiameter} mm\n` +
        `Empfohlene Kernbohrung: ∅ ${recommendation} mm\n` +
        `(inkl. Montagespielraum)`
    );
}

function calcRadiator() {
    const factorType = parseFloat(document.getElementById('hk_typ').value); // Watt pro Meter bei Höhe 600 (Referenz)
    const factorHeight = parseFloat(document.getElementById('hk_height').value);
    const lenMm = parseFloat(document.getElementById('hk_len').value);

    if (!lenMm) return;

    // Faustformel-Logik:
    // Die Faktoren im Value sind ca. Watt pro lfm bei Typ X und Höhe 600.
    // Wir müssen das auf die Höhe skalieren.
    // Höhe 600 ist Faktor 1.0 (Referenz).
    // Höhe 300 hat ca. 55% der Leistung von 600.
    // Höhe 900 hat ca. 140% der Leistung von 600.

    let heightCorrection = 1.0;
    if (factorHeight === 0.3) heightCorrection = 0.55;
    if (factorHeight === 0.4) heightCorrection = 0.70;
    if (factorHeight === 0.5) heightCorrection = 0.85;
    if (factorHeight === 0.6) heightCorrection = 1.00;
    if (factorHeight === 0.9) heightCorrection = 1.45;

    // Berechnung: (Watt pro Meter * Korrektur * Länge in Meter)
    const power70 = factorType * heightCorrection * (lenMm / 1000);

    // Umrechnung auf Niedertemperatur (Wärmepumpe 55/45/20) - grob Faktor 0.5
    const powerWP = power70 * 0.5;

    showResult('res_hk',
        `Leistung (70/55°C): ca. ${Math.round(power70)} Watt\n` +
        `Leistung (55/45°C): ca. ${Math.round(powerWP)} Watt\n` +
        `(Schätzwert für Altbau-Bestand)`
    );
}


// --- NEUE PROFI-RECHNER ---

function calcTank() {
    // Eingaben in cm
    const d = parseFloat(document.getElementById('tank_d').value);
    const l = parseFloat(document.getElementById('tank_l').value);
    const h = parseFloat(document.getElementById('tank_h').value);

    if (!d || !l || !h) return;
    if (h > d) {
        showResult('res_tank', 'Fehler: Füllhöhe größer als Durchmesser!', true);
        return;
    }

    // Radius
    const r = d / 2;

    // Berechnung Segmentfläche des Kreises (komplexe Geometrie)
    // Alpha ist der Winkel des Segments
    // Wenn voll: Einfach Zylindervolumen

    let area;

    if (h === d) {
        area = Math.PI * r * r;
    } else {
        // Formel für Kreissegment
        // Wir rechnen mit Radius und Abstand Mittelpunkt zur Oberfläche
        const x = r - h; // Abstand Mittelpunkt

        // Fläche Segment = r² * arccos(x/r) - x * wurzel(r² - x²)
        // (Winkel im Bogenmaß)
        area = (r * r * Math.acos(x / r)) - (x * Math.sqrt(r * r - x * x));
    }

    // Volumen in cm³ (Area * Länge) -> / 1000 für Liter
    const volLiters = (area * l) / 1000;

    // Gesamtvolumen des Tanks zum Vergleich
    const totalVol = (Math.PI * r * r * l) / 1000;
    const percent = (volLiters / totalVol) * 100;

    showResult('res_tank',
        `Aktueller Inhalt: ${Math.round(volLiters)} Liter\n` +
        `Füllstand: ${percent.toFixed(1)} %\n` +
        `(Gesamtkapazität: ${Math.round(totalVol)} Liter)`
    );
}

function calcFlowSpeed() {
    let vol = parseFloat(document.getElementById('flow_vol').value);
    const unit = document.getElementById('flow_unit').value;
    const dnMm = parseFloat(document.getElementById('flow_dn').value);

    if (!vol || !dnMm) return;

    // Alles auf m³/s umrechnen (SI Einheit)
    let flowM3s = 0;

    if (unit === 'l_h') flowM3s = vol / 1000 / 3600;
    if (unit === 'l_min') flowM3s = vol / 1000 / 60;
    if (unit === 'm3_h') flowM3s = vol / 3600;

    // Querschnittsfläche Rohr in m²
    // A = pi * r²
    const rM = (dnMm / 1000) / 2;
    const area = Math.PI * rM * rM;

    // Geschwindigkeit v = Q / A
    const speed = flowM3s / area;

    // Bewertung (Ampel)
    let warning = "";
    // Grenzwerte grob: Heizung max 1.0 m/s, Trinkwasser max 2.0 m/s, Luft max 3-5 m/s
    if (unit === 'l_h' && speed > 1.0) warning = "\n⚠️ Achtung: > 1 m/s (Geräuschgefahr Heizung!)";
    if (unit === 'l_min' && speed > 2.0) warning = "\n⚠️ Achtung: > 2 m/s (Druckschlag/Korrosion!)";
    if (unit === 'm3_h' && speed > 5.0) warning = "\n⚠️ Achtung: > 5 m/s (Luftkanal laut!)";

    showResult('res_flow',
        `Geschwindigkeit: ${speed.toFixed(2)} m/s` + warning,
        warning !== ""
    );
}

function calcCondensate() {
    const kw = parseFloat(document.getElementById('cond_kw').value);
    const factor = parseFloat(document.getElementById('cond_fuel').value);
    const hours = parseFloat(document.getElementById('cond_hours').value);

    if (!kw || !hours) return;

    // Pro Stunde
    const perHour = kw * factor;
    // Pro Tag
    const perDay = perHour * hours;

    showResult('res_cond',
        `Kondensat: ca. ${perHour.toFixed(2)} Liter/Stunde\n` +
        `Tagesmenge: ca. ${perDay.toFixed(1)} Liter\n` +
        `(Bei Vollbrennwertnutzung)`
    );
}


// --- NEU: ABGLEICH & LÜFTUNG ---

function calcKvValue() {
    const watt = parseFloat(document.getElementById('kv_watt').value);
    const dt = parseFloat(document.getElementById('kv_dt').value);
    const dpMbar = parseFloat(document.getElementById('kv_dp').value);

    if (!watt || !dt || !dpMbar) return;

    // 1. Volumenstrom (l/h) = Watt / (1.163 * dt)
    const qLh = watt / (1.163 * dt);

    // 2. Kv-Wert Berechnung
    // Formel: Kv = Q (m³/h) / Wurzel(dp in bar)
    // Q in m³/h = qLh / 1000
    // dp in bar = dpMbar / 1000

    const qM3 = qLh / 1000;
    const dpBar = dpMbar / 1000;

    const kv = qM3 / Math.sqrt(dpBar);

    // 3. Schätzung der Voreinstellung (Standard Heimeier/Danfoss Skala 1-6)
    // Das ist eine Näherung, da jeder Ventilherteller andere Kennlinien hat!
    let setting = "?";
    // Grobe Kennlinie für Standard-Ventile (V-exakt o.ä.)
    if (kv < 0.13) setting = "1";
    else if (kv < 0.28) setting = "2";
    else if (kv < 0.42) setting = "3";
    else if (kv < 0.56) setting = "4";
    else if (kv < 0.70) setting = "5";
    else if (kv < 0.90) setting = "6";
    else setting = "Offen (7/N)";

    // Visualisierung updaten
    document.getElementById('valve_visual').innerText = setting;
    document.getElementById('valve_visual').style.color = "#ff9900";

    showResult('res_kv',
        `Durchfluss: ${Math.round(qLh)} l/h\n` +
        `Errechneter Kv-Wert: ${kv.toFixed(2)}\n` +
        `Empfohlene Stufe: ca. ${setting}`
    );
}

function calcAirExchange() {
    const qm = parseFloat(document.getElementById('air_qm').value);
    const h = parseFloat(document.getElementById('air_h').value);
    const typeVal = parseFloat(document.getElementById('air_type').value); // Faktor oder Pauschale

    if (!qm || !h) return;

    const volRaum = qm * h;
    let result = 0;
    let msg = "";

    // Wenn typeVal > 10 ist, gehen wir von Pauschalwert aus (z.B. 40m³/h für Bad nach DIN 18017)
    if (typeVal > 10) {
        // DIN 18017-3 fordert oft 40 oder 60 m³/h
        result = typeVal;
        msg = `Pauschal-Forderung (DIN 18017): ~${result} m³/h`;
    } else {
        // Luftwechselrate berechnen
        result = volRaum * typeVal;
        msg = `Luftwechsel (${typeVal}x / h): ${result.toFixed(1)} m³/h`;
    }

    showResult('res_air',
        `Raumvolumen: ${volRaum.toFixed(1)} m³\n` +
        msg + "\n" +
        "(Mindestleistung des Lüfters)"
    );
}


// --- NEUE FUNKTIONEN RUNDE 3 ---

function calcHeatUpTime() {
    const vol = parseFloat(document.getElementById('heatup_vol').value);
    const t1 = parseFloat(document.getElementById('heatup_t1').value);
    const t2 = parseFloat(document.getElementById('heatup_t2').value);
    const kw = parseFloat(document.getElementById('heatup_kw').value);

    if (!vol || !kw) return;
    if (t1 >= t2) {
        showResult('res_heatup', 'Start-Temperatur muss kleiner als Ziel sein.', true);
        return;
    }

    // Formel: Q = m * c * deltaT
    // c Wasser = 1.163 Wh/kgK
    const deltaT = t2 - t1;
    const energyWh = vol * 1.163 * deltaT; // Benötigte Energie in Wattstunden

    // Zeit = Energie / Leistung
    // energyWh / (kw * 1000) = Stunden
    const hours = energyWh / (kw * 1000);
    const minutes = Math.round(hours * 60);

    // Schöne Formatierung (z.B. 1h 20min)
    const hDisplay = Math.floor(minutes / 60);
    const mDisplay = minutes % 60;

    showResult('res_heatup',
        `Benötigte Energie: ${(energyWh / 1000).toFixed(1)} kWh\n` +
        `Dauer: ca. ${minutes} Min\n` +
        `(${hDisplay} Std. ${mDisplay} Min.)`
    );
}

function calcClipDist() {
    const mat = document.getElementById('clip_mat').value;
    const dn = parseInt(document.getElementById('clip_dn').value);

    let dist = 0;

    // Richtwerte (Mittelwerte aus gängigen Tabellen & Befestigungsregeln)
    // Stahlrohr trägt weiter als Kupfer, Kupfer weiter als Verbundrohr

    if (mat === 'plastic') {
        // Verbundrohr hängt schnell durch
        if (dn <= 16) dist = 0.80;
        else if (dn <= 20) dist = 1.00;
        else if (dn <= 26) dist = 1.25;
        else if (dn <= 32) dist = 1.50;
        else if (dn <= 40) dist = 1.75;
        else dist = 2.00;
    }
    else if (mat === 'cu') {
        // Kupfer / Edelstahl
        if (dn <= 15) dist = 1.25;
        else if (dn <= 22) dist = 1.50; // Standard 22er
        else if (dn <= 28) dist = 1.75; // Standard 28er
        else if (dn <= 35) dist = 2.00;
        else if (dn <= 42) dist = 2.25;
        else dist = 2.75;
    }
    else {
        // Stahlrohr (sehr steif)
        if (dn <= 18) dist = 1.50; // 3/8"
        else if (dn <= 22) dist = 2.00; // 1/2"
        else if (dn <= 28) dist = 2.25; // 3/4"
        else if (dn <= 35) dist = 2.75; // 1"
        else if (dn <= 42) dist = 3.00; // 1 1/4"
        else dist = 3.25;
    }

    showResult('res_clip',
        `Max. Abstand: ${dist.toFixed(2)} Meter\n` +
        `(Empfehlung für waagerechte Montage)`
    );
}

function calcRealPower() {
    const flow = parseFloat(document.getElementById('real_flow').value);
    const vl = parseFloat(document.getElementById('real_vl').value);
    const rl = parseFloat(document.getElementById('real_rl').value);

    if (!flow || isNaN(vl) || isNaN(rl)) return;

    const dt = vl - rl;
    if (dt <= 0) {
        showResult('res_realpower', 'Delta T ist 0 oder negativ!', true);
        return;
    }

    // P = V * c * dt
    // P (Watt) = Flow(l/h) * 1.163 * K
    const watt = flow * 1.163 * dt;
    const kw = watt / 1000;

    showResult('res_realpower',
        `Spreizung: ${dt.toFixed(1)} K\n` +
        `Leistung: ${kw.toFixed(2)} kW\n` +
        `(${Math.round(watt)} Watt)`
    );
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
    const cards = container.getElementsByClassName('card');

    // Gespeicherte Favoriten laden
    const favs = JSON.parse(localStorage.getItem('shk_favs')) || [];

    // Durch alle Karten gehen
    Array.from(cards).forEach((card, index) => {
        const titleEl = card.querySelector('h3');
        if (!titleEl) return;

        // Eindeutige ID für die Karte erzeugen (anhand des Titels)
        const cardId = titleEl.innerText.trim();

        // Sternchen erstellen
        const star = document.createElement('span');
        star.style.float = 'right';
        star.style.cursor = 'pointer';
        star.style.fontSize = '1.2rem';

        // Ist es schon ein Favorit?
        if (favs.includes(cardId)) {
            star.innerText = '⭐'; // Voll
            card.classList.add('is-favorite');
            // Karte nach oben schieben
            container.insertBefore(card, container.children[1]); // Index 1 wegen Suchleiste!
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
}

function toggleFavorite(card, id, starEl) {
    let favs = JSON.parse(localStorage.getItem('shk_favs')) || [];
    const container = document.getElementById('view-rechner');

    if (favs.includes(id)) {
        // Löschen
        favs = favs.filter(f => f !== id);
        starEl.innerText = '☆';
        card.classList.remove('is-favorite');
        // Optional: Wieder nach unten sortieren (komplex, lassen wir erstmal)
    } else {
        // Hinzufügen
        favs.push(id);
        starEl.innerText = '⭐';
        card.classList.add('is-favorite');
        // Sofort nach oben schieben (unter die Suchleiste)
        container.insertBefore(card, container.children[1]);

        // Kleines Feedback
        alert("Zu Favoriten hinzugefügt! (Erscheint jetzt immer oben)");
    }

    localStorage.setItem('shk_favs', JSON.stringify(favs));
}

// System starten (kurze Verzögerung, damit HTML sicher da ist)
setTimeout(initFavorites, 500);