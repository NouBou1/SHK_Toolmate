// Wartungs-Checkliste Modul
// Verwaltung der Wartungsaufgaben mit Fortschrittsanzeige

import { STORAGE_KEYS } from '../core/constants.js';

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

export function loadChecklist() {
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

function createChecklistLabel(task, isDone) {
    const box = document.createElement('span');
    box.className = 'checklist-box';
    box.textContent = isDone ? '[X]' : '[ ]';

    const label = document.createElement('span');
    label.classList.toggle('is-done', isDone);
    label.textContent = task;
    return [box, label];
}

function createChecklistItem(task, index, isDone) {
    const div = document.createElement('div');
    div.className = 'checklist-item';
    div.dataset.action = 'toggleCheck';
    div.dataset.index = String(index);
    div.append(...createChecklistLabel(task, isDone));
    return div;
}

function updateProgressBar(doneCount) {
    const percent = (doneCount / checklistData.length) * 100;
    const progressBar = document.getElementById('check_progress');
    if (progressBar) {
        progressBar.style.width = percent + '%';
    }
}

export function toggleCheck(index) {
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

export function resetChecklist() {
    if (confirm('Alles zurücksetzen?')) {
        localStorage.removeItem(STORAGE_KEYS.MAINTENANCE);
        loadChecklist();
    }
}
