// Zustand der Projektverwaltung
//
// Einzige Quelle der Wahrheit für die Projektliste und das gerade geöffnete
// Projekt. Vorher lagen diese beiden Werte als globale Variablen herum und
// wurden aus vier Dateien beschrieben; jetzt führt jeder Zugriff hier vorbei.

import { loadProjectsFromStorage, saveProjectsToStorage } from './projects-storage.js';

let projects = loadProjectsFromStorage();
let currentProjectId = null;
let viewMode = 'active';

export function getProjects() {
    return projects;
}

export function saveProjects() {
    saveProjectsToStorage(projects);
}

export function addProjectEntry(project) {
    projects.unshift(project);
    saveProjects();
}

export function removeProjectEntry(project) {
    projects.splice(projects.indexOf(project), 1);
    saveProjects();
}

export function getCurrentProjectId() {
    return currentProjectId;
}

export function setCurrentProjectId(id) {
    currentProjectId = id;
}

/**
 * Das gerade geöffnete Projekt, oder undefined
 */
export function getCurrentProject() {
    return projects.find(project => project.id === currentProjectId);
}

export function getViewMode() {
    return viewMode;
}

export function setViewMode(mode) {
    viewMode = mode;
}
