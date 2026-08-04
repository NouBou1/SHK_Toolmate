// ==========================================
// SHK-MATE - Projektverwaltung
// ==========================================
// Baustellen anlegen, oeffnen, archivieren und loeschen.
// Materialliste: materials.js | Speichern: projects-storage.js
// ==========================================

const MAX_PROJECT_NAME_LENGTH = 50;

let projectsDB = loadProjectsFromStorage();
let currentProjectId = null;
let currentViewMode = 'active';

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
        wrapper.style.display = (mode === 'active') ? 'flex' : 'none';
    }
}

function setProjectView(mode) {
    currentViewMode = mode;
    updateViewButtons(mode);
    toggleNewProjectInput(mode);
    renderProjectList();
}

// ========== PROJEKT ANLEGEN ==========

function isDuplicateProjectName(name) {
    return projectsDB.some(project =>
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
    if (currentViewMode !== 'active') {
        setProjectView('active');
    } else {
        renderProjectList();
    }
}

function clearProjectInputs(inputName, inputDate) {
    inputName.value = '';
    inputDate.value = '';
}

function addProject() {
    const inputName = document.getElementById('new_project_name');
    const inputDate = document.getElementById('new_project_date');
    const name = inputName.value.trim();

    if (!validateProjectName(name)) {
        return;
    }
    projectsDB.unshift(createProject(name, inputDate.value || getTodayISO()));
    saveProjects();
    showNewProject();
    clearProjectInputs(inputName, inputDate);
}

// ========== PROJEKTLISTE ==========

function filterProjects() {
    return projectsDB.filter(project =>
        currentViewMode === 'active' ? !project.archived : Boolean(project.archived)
    );
}

function showEmptyMessage(container) {
    const message = currentViewMode === 'active'
        ? 'Keine offenen Baustellen.'
        : 'Archiv leer.';
    container.innerHTML = `<p style="color:#aaa; text-align:center;">${message}</p>`;
}

function createProjectItemHTML(project) {
    return `
        <div>
            <strong>${project.name}</strong><br>
            <small style="color:#aaa;">${project.date} • ${project.items.length} Pos.</small>
        </div>
        <span>➜</span>
    `;
}

function createProjectItem(project) {
    const div = document.createElement('div');
    div.className = 'project-item';
    div.style.opacity = project.archived ? '0.7' : '';
    div.innerHTML = createProjectItemHTML(project);
    div.onclick = () => openProject(project.id);
    return div;
}

function renderProjectList() {
    const container = document.getElementById('project_list_container');
    if (!container) {
        return;
    }
    container.innerHTML = '';
    const projects = filterProjects();

    if (projects.length === 0) {
        showEmptyMessage(container);
        return;
    }
    projects.forEach(project => container.appendChild(createProjectItem(project)));
}

// ========== PROJEKT ÖFFNEN / SCHLIESSEN ==========

function switchView(view) {
    document.getElementById('mat-overview').style.display = view === 'overview' ? 'block' : 'none';
    document.getElementById('mat-detail').style.display = view === 'detail' ? 'block' : 'none';
}

function updateArchiveButton(isArchived) {
    const btn = document.getElementById('btn_archive_action');
    if (!btn) {
        return;
    }
    btn.innerText = isArchived ? '🔄 Wiederherstellen' : '📥 Ins Archiv verschieben';
    btn.style.backgroundColor = isArchived ? '#28a745' : '';
    btn.style.color = isArchived ? 'white' : '';
}

function updateProjectDetails(project) {
    document.getElementById('detail_title').innerText = project.name;
    document.getElementById('detail_date').innerText = 'Erstellt: ' + project.date;
    updateArchiveButton(project.archived);
}

function getCurrentProjectEntry() {
    return projectsDB.find(project => project.id === currentProjectId);
}

function openProject(id) {
    currentProjectId = id;
    const project = getCurrentProjectEntry();
    if (!project) {
        return;
    }
    switchView('detail');
    updateProjectDetails(project);
    window.renderMaterialItems?.();
}

function closeProject() {
    currentProjectId = null;
    switchView('overview');
    renderProjectList();
}

// ========== ARCHIVIEREN / LÖSCHEN ==========

function toggleArchiveStatus() {
    const project = getCurrentProjectEntry();
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

function deleteCurrentProject() {
    const project = getCurrentProjectEntry();
    if (!project || !confirmDeletion(project)) {
        return;
    }
    projectsDB.splice(projectsDB.indexOf(project), 1);
    saveProjects();
    closeProject();
}
