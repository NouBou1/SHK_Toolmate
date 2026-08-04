// Wartungs-Checkliste Modul
// Verwaltung der Wartungsaufgaben mit Fortschrittsanzeige

const checklistData = [
    'Anlage spannungsfrei schalten',
    'Gashahn schließen',
    'Verkleidung entfernen',
    'Wärmetauscher reinigen',
    'Elektroden prüfen/tauschen',
    'Siphon reinigen & füllen',
    'Vordruck MAG prüfen (Drucklos!)',
    'Wasserdruck prüfen & füllen',
    'Gashahn öffnen & Dichtheit prüfen',
    'Abgasmessung durchführen (Schornsteinfeger-Taste)',
    'Aufkleber anbringen'
];

function loadChecklist() {
    const container = document.getElementById('checklist_container');
    if (!container) {
        return;
    }

    container.innerHTML = '';
    const saved = getSavedChecklist();
    const doneCount = renderChecklistItems(container, saved);
    updateProgressBar(doneCount);
}

function getSavedChecklist() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.MAINTENANCE)) || {};
}

function renderChecklistItems(container, saved) {
    let doneCount = 0;

    checklistData.forEach((task, index) => {
        const isDone = saved[index] === true;
        if (isDone) {doneCount++;}

        const div = createChecklistItem(task, index, isDone);
        container.appendChild(div);
    });

    return doneCount;
}

function createChecklistItem(task, index, isDone) {
    const div = document.createElement('div');
    applyChecklistItemStyles(div);
    div.onclick = () => toggleCheck(index);

    div.innerHTML = `
        <span style="font-size:1.5rem; margin-right:10px;">${isDone ? '[X]' : '[ ]'}</span>
        <span style="${isDone ? 'text-decoration:line-through; color:#777;' : ''}">${task}</span>
    `;

    return div;
}

function applyChecklistItemStyles(div) {
    div.style.padding = '10px';
    div.style.borderBottom = '1px solid #444';
    div.style.display = 'flex';
    div.style.alignItems = 'center';
    div.style.cursor = 'pointer';
}

function updateProgressBar(doneCount) {
    const percent = (doneCount / checklistData.length) * 100;
    const progressBar = document.getElementById('check_progress');
    if (progressBar) {
        progressBar.style.width = percent + '%';
    }
}

function toggleCheck(index) {
    const saved = getSavedChecklist();

    if (saved[index]) {
        delete saved[index];
    } else {
        saved[index] = true;
    }

    saveChecklist(saved);
    loadChecklist();
}

function saveChecklist(data) {
    localStorage.setItem(STORAGE_KEYS.MAINTENANCE, JSON.stringify(data));
}

function resetChecklist() {
    if (confirm('Alles zurücksetzen?')) {
        localStorage.removeItem(STORAGE_KEYS.MAINTENANCE);
        loadChecklist();
    }
}
