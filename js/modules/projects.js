// ==========================================
// SHK-ToolMate - Projektverwaltung
// ==========================================
// Baustellen anlegen, oeffnen, archivieren und loeschen.
// Zustand: project-state.js | Materialliste: materials.js
// ==========================================

import {
    getProjects, getCurrentProject, getViewMode, setViewMode,
    setCurrentProjectId, saveProjects, addProjectEntry, removeProjectEntry
} from './project-state.js';
import { renderMaterialItems } from './materials.js';

const MAX_PROJECT_NAME_LENGTH = 50;

// ========== ANSICHT UMSCHALTEN ==========

function updateViewButtons(mode) {
    const btnActive = document.getElementById('btn_view_active');
    const btnArchived = document.getElementById('btn_view_archived');

    if (btnActive) {
        btnActive.classList.toggle('active', mode === 'active');
    }
    if (btnArchived) {
        btnArchived.classList.toggle('active', mode === 'archived');
    }
}

function toggleNewProjectInput(mode) {
    const wrapper = document.getElementById('new_project_wrapper');
    if (wrapper) {
        wrapper.classList.toggle('u-hidden', mode !== 'active');
    }
}

export function setProjectView(mode) {
    setViewMode(mode);
    updateViewButtons(mode);
    toggleNewProjectInput(mode);
    renderProjectList();
}

// ========== PROJEKT ANLEGEN ==========

function isDuplicateProjectName(name) {
    return getProjects().some(project =>
        project.name.toLowerCase() === name.toLowerCase() && !project.archived
    );
}

function getProjectNameError(name) {
    if (!name) {
        return '[FEHLER] Bitte Projektname eingeben';
    }
    if (name.length > MAX_PROJECT_NAME_LENGTH) {
        return `[FEHLER] Projektname zu lang (max. ${MAX_PROJECT_NAME_LENGTH} Zeichen)`;
    }
    if (isDuplicateProjectName(name)) {
        return '[WARNUNG] Projekt mit diesem Namen existiert bereits!';
    }
    return null;
}

function validateProjectName(name) {
    const error = getProjectNameError(name);
    if (error) {
        alert(error);
    }
    return error === null;
}

function getTodayISO() {
    return new Date().toISOString().split('T')[0];
}

function createProject(name, isoDate) {
    return {
        id: Date.now(),
        name: name,
        date: new Date(isoDate).toLocaleDateString('de-DE'),
        isoDate: isoDate,
        archived: false,
        items: []
    };
}

function showNewProject() {
    if (getViewMode() !== 'active') {
        setProjectView('active');
    } else {
        renderProjectList();
    }
}

function clearProjectInputs(inputName, inputDate) {
    inputName.value = '';
    inputDate.value = '';
}

export function addProject() {
    const inputName = document.getElementById('new_project_name');
    const inputDate = document.getElementById('new_project_date');
    const name = inputName.value.trim();

    if (!validateProjectName(name)) {
        return;
    }
    addProjectEntry(createProject(name, inputDate.value || getTodayISO()));
    showNewProject();
    clearProjectInputs(inputName, inputDate);
}

// ========== PROJEKTLISTE ==========

function filterProjects() {
    return getProjects().filter(project =>
        getViewMode() === 'active' ? !project.archived : Boolean(project.archived)
    );
}

function showEmptyMessage(container) {
    const message = getViewMode() === 'active'
        ? 'Keine offenen Baustellen.'
        : 'Archiv leer.';
    const hinweis = document.createElement('p');
    hinweis.className = 'empty-hint';
    hinweis.textContent = message;
    container.replaceChildren(hinweis);
}

function createProjectSummary(project) {
    const wrapper = document.createElement('div');
    const name = document.createElement('strong');
    name.textContent = project.name;

    const meta = document.createElement('small');
    meta.className = 'project-meta';
    meta.textContent = `${project.date} • ${project.items.length} Pos.`;

    wrapper.append(name, document.createElement('br'), meta);
    return wrapper;
}

function createProjectItem(project) {
    const div = document.createElement('div');
    div.className = 'project-item';
    div.classList.toggle('is-archived', Boolean(project.archived));

    const pfeil = document.createElement('span');
    pfeil.textContent = '➜';
    div.append(createProjectSummary(project), pfeil);

    div.dataset.action = 'openProject';
    div.dataset.projectId = String(project.id);
    return div;
}

export function renderProjectList() {
    const container = document.getElementById('project_list_container');
    if (!container) {
        return;
    }
    const projects = filterProjects();
    if (projects.length === 0) {
        showEmptyMessage(container);
        return;
    }
    container.replaceChildren(...projects.map(createProjectItem));
}

// ========== PROJEKT ÖFFNEN / SCHLIESSEN ==========

function switchView(view) {
    document.getElementById('mat-overview').classList.toggle('u-hidden', view !== 'overview');
    document.getElementById('mat-detail').classList.toggle('u-hidden', view !== 'detail');
}

function updateArchiveButton(isArchived) {
    const btn = document.getElementById('btn_archive_action');
    if (!btn) {
        return;
    }
    btn.textContent = isArchived ? '🔄 Wiederherstellen' : '📥 Ins Archiv verschieben';
    btn.classList.toggle('btn-restore', Boolean(isArchived));
}

function updateProjectDetails(project) {
    document.getElementById('detail_title').textContent = project.name;
    document.getElementById('detail_date').textContent = 'Erstellt: ' + project.date;
    updateArchiveButton(project.archived);
}

export function openProject(id) {
    setCurrentProjectId(id);
    const project = getCurrentProject();
    if (!project) {
        return;
    }
    switchView('detail');
    updateProjectDetails(project);
    renderMaterialItems();
}

export function closeProject() {
    setCurrentProjectId(null);
    switchView('overview');
    renderProjectList();
}

// ========== ARCHIVIEREN / LÖSCHEN ==========

export function toggleArchiveStatus() {
    const project = getCurrentProject();
    if (!project) {
        return;
    }
    project.archived = !project.archived;
    saveProjects();
    closeProject();
}

function confirmDeletion(project) {
    const firstConfirm = confirm(
        `[LÖSCHEN] Projekt "${project.name}" wirklich löschen?\n\nDies kann nicht rückgängig gemacht werden!`
    );
    if (!firstConfirm) {
        return false;
    }
    const secondConfirm = confirm(
        `[WARNUNG] Letzte Chance! Projekt "${project.name}" mit ${project.items.length} Materialien ENDGÜLTIG löschen?`
    );
    return secondConfirm && confirm('Wirklich?');
}

export function deleteCurrentProject() {
    const project = getCurrentProject();
    if (!project || !confirmDeletion(project)) {
        return;
    }
    removeProjectEntry(project);
    closeProject();
}
