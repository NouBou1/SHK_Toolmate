// ==========================================
// SHK-MATE - Material & Projekt Management
// ==========================================
// Verwaltung von Baustellen, Material und Archiv
// Mit sicherer LocalStorage-Verwendung

/**
 * Lädt Projekte aus LocalStorage mit Fehlerbehandlung
 * @returns {Array} Array von Projekt-Objekten
 */
function loadProjectsFromStorage() {
    try {
        const data = localStorage.getItem('shk_projects');
        if (!data) return [];
        
        const projects = JSON.parse(data);
        
        // Validierung: Muss ein Array sein
        if (!Array.isArray(projects)) {
            console.error('Invalid projects data format - expected array');
            return [];
        }
        
        return projects;
    } catch (error) {
        console.error('Error loading projects from localStorage:', error);
        
        // Bei Parsing-Fehler: Backup erstellen und neu starten
        const corruptedData = localStorage.getItem('shk_projects');
        if (corruptedData) {
            const backupKey = 'shk_projects_backup_' + Date.now();
            try {
                localStorage.setItem(backupKey, corruptedData);
                console.log('Corrupted data backed up to:', backupKey);
            } catch (e) {
                console.error('Could not create backup:', e);
            }
        }
        
        return [];
    }
}

let projectsDB = loadProjectsFromStorage();
let currentProjectId = null;
let currentViewMode = 'active';

function setProjectView(mode) {
    currentViewMode = mode;
    updateViewButtons(mode);
    toggleNewProjectInput(mode);
    renderProjectList();
}

function updateViewButtons(mode) {
    const btnActive = document.getElementById('btn_view_active');
    const btnArchived = document.getElementById('btn_view_archived');
    
    if (btnActive) btnActive.classList.toggle('active', mode === 'active');
    if (btnArchived) btnArchived.classList.toggle('active', mode === 'archived');
}

function toggleNewProjectInput(mode) {
    const wrapper = document.getElementById('new_project_wrapper');
    if (wrapper) {
        wrapper.style.display = (mode === 'active') ? 'flex' : 'none';
    }
}

function addProject() {
    const inputName = document.getElementById('new_project_name');
    const inputDate = document.getElementById('new_project_date');
    const name = inputName.value.trim();
    
    if (!validateProjectName(name)) return;
    
    const dateVal = inputDate.value || getTodayISO();
    const newProject = createProject(name, dateVal);
    
    projectsDB.unshift(newProject);
    saveProjects();
    
    if (currentViewMode !== 'active') {
        setProjectView('active');
    } else {
        renderProjectList();
    }
    
    clearInputs(inputName, inputDate);
}

function validateProjectName(name) {
    if (!name) {
        alert('[FEHLER] Bitte Projektname eingeben');
        return false;
    }
    
    if (name.length > 50) {
        alert('[FEHLER] Projektname zu lang (max. 50 Zeichen)');
        return false;
    }
    
    if (projectsDB.some(p => p.name.toLowerCase() === name.toLowerCase() && !p.archived)) {
        alert('[WARNUNG] Projekt mit diesem Namen existiert bereits!');
        return false;
    }
    
    return true;
}

function getTodayISO() {
    return new Date().toISOString().split('T')[0];
}

function createProject(name, dateVal) {
    const dateObj = new Date(dateVal);
    const dateDisplay = dateObj.toLocaleDateString('de-DE');
    
    return {
        id: Date.now(),
        name: name,
        date: dateDisplay,
        isoDate: dateVal,
        archived: false,
        items: []
    };
}

function clearInputs(inputName, inputDate) {
    inputName.value = '';
    inputDate.value = '';
}

function renderProjectList() {
    const container = document.getElementById('project_list_container');
    if (!container) return;
    
    container.innerHTML = '';
    const filtered = filterProjects();
    
    if (filtered.length === 0) {
        showEmptyMessage(container);
        return;
    }
    
    filtered.forEach(proj => {
        const div = createProjectItem(proj);
        container.appendChild(div);
    });
}

function filterProjects() {
    return projectsDB.filter(p => {
        const isArchived = !!p.archived;
        return currentViewMode === 'active' ? !isArchived : isArchived;
    });
}

function showEmptyMessage(container) {
    const message = currentViewMode === 'active' 
        ? 'Keine offenen Baustellen.' 
        : 'Archiv leer.';
    container.innerHTML = `<p style="color:#aaa; text-align:center;">${message}</p>`;
}

function createProjectItem(proj) {
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
    return div;
}

function openProject(id) {
    currentProjectId = id;
    const project = projectsDB.find(p => p.id === id);
    if (!project) return;

    switchView('detail');
    updateProjectDetails(project);
    window.renderMaterialItems?.();
}

function switchView(view) {
    document.getElementById('mat-overview').style.display = view === 'overview' ? 'block' : 'none';
    document.getElementById('mat-detail').style.display = view === 'detail' ? 'block' : 'none';
}

function updateProjectDetails(project) {
    document.getElementById('detail_title').innerText = project.name;
    document.getElementById('detail_date').innerText = 'Erstellt: ' + project.date;
    updateArchiveButton(project.archived);
}

function updateArchiveButton(isArchived) {
    const btn = document.getElementById('btn_archive_action');
    if (!btn) return;
    
    if (isArchived) {
        btn.innerText = "🔄 Wiederherstellen";
        btn.style.backgroundColor = "#28a745";
        btn.style.color = "white";
    } else {
        btn.innerText = "📥 Ins Archiv verschieben";
        btn.style.backgroundColor = "";
        btn.style.color = "";
    }
}

function closeProject() {
    currentProjectId = null;
    switchView('overview');
    renderProjectList();
}

function addMaterialItem() {
    if (!currentProjectId) return;

    const inputName = document.getElementById('new_item_name');
    const inputAmount = document.getElementById('new_item_amount');
    const text = inputName.value.trim();
    const amount = inputAmount.value.trim() || '1';

    if (!text) return;

    const projectIndex = projectsDB.findIndex(p => p.id === currentProjectId);
    if (projectIndex > -1) {
        projectsDB[projectIndex].items.push({ text: text, amount: amount });
        saveProjects();
        window.renderMaterialItems?.();
        window.signatureDataURL = null;

        inputName.value = '';
        inputAmount.value = '';
        inputName.focus();
    }
}

function renderMaterialItems() {
    const listContainer = document.getElementById('material_list_items');
    if (!listContainer) return;
    
    listContainer.innerHTML = '';
    const project = projectsDB.find(p => p.id === currentProjectId);
    if (!project) return;

    project.items.forEach((item, index) => {
        const li = createMaterialItemElement(item, index);
        listContainer.appendChild(li);
    });
}

function createMaterialItemElement(item, index) {
    const li = document.createElement('li');
    li.className = 'material-item';
    const hasImage = !!item.image;

    li.innerHTML = `
        <div style="display:flex; flex-direction:column; width:100%;">
            <div style="display:flex; justify-content:space-between; align-items:center;">
                <span>
                   <strong>${item.amount}x</strong> ${item.name || item.text || 'Ohne Namen'}
                </span>
                <div class="material_item_btns">
                    <button class="small-btn secondary" onclick="window.triggerPhoto(${index})" style="margin-right:5px;">
                        📷
                    </button>
                    <button class="small-btn btn-danger" onclick="window.deleteMaterialItem(${index})">×</button>
                </div>
            </div>
            ${hasImage ? createImageHTML(item.image, index) : ''}
        </div>
    `;
    return li;
}

function createImageHTML(imageSrc, index) {
    return `
        <div style="margin-top:10px; position:relative; width:fit-content;">
            <img src="${imageSrc}" onclick="window.showBigImage('${imageSrc}')" 
                 style="height:60px; border-radius:4px; border:1px solid #555; cursor:pointer;">
            
            <button onclick="window.deletePhoto(${index})" 
                    style="position:absolute; top:-8px; right:-8px; background:red; color:white; border-radius:50%; width:20px; height:20px; font-size:12px; line-height:1; padding:0; border:none;">
                ×
            </button>
        </div>
    `;
}

function deleteMaterialItem(index) {
    const projectIndex = projectsDB.findIndex(p => p.id === currentProjectId);
    if (projectIndex > -1) {
        projectsDB[projectIndex].items.splice(index, 1);
        saveProjects();
        renderMaterialItems();
        window.signatureDataURL = null;
    }
}

function toggleArchiveStatus() {
    if (!currentProjectId) return;
    const project = projectsDB.find(p => p.id === currentProjectId);
    if (project) {
        project.archived = !project.archived;
        saveProjects();
        closeProject();
    }
}

function deleteCurrentProject() {
    const project = projectsDB.find(p => p.id === currentProjectId);
    if (!project) return;
    
    if (!confirmDeletion(project)) return;
    
    const idx = projectsDB.findIndex(p => p.id === currentProjectId);
    if (idx > -1) {
        projectsDB.splice(idx, 1);
        saveProjects();
        closeProject();
    }
}

function confirmDeletion(project) {
    const firstConfirm = confirm(
        `[LÖSCHEN] Projekt \"${project.name}\" wirklich löschen?\n\nDies kann nicht rückgängig gemacht werden!`
    );
    if (!firstConfirm) return false;
    
    const secondConfirm = confirm(
        `[WARNUNG] Letzte Chance! Projekt \"${project.name}\" mit ${project.items.length} Materialien ENDGÜLTIG löschen?`
    );
    if (!secondConfirm) return false;
    
    return confirm("Wirklich?");
}

function copyListToClipboard() {
    if (!currentProjectId) return;
    const project = projectsDB.find(p => p.id === currentProjectId);

    if (!project || project.items.length === 0) {
        alert("Liste ist leer!");
        return;
    }

    const text = buildClipboardText(project);
    copyText(text);
}

function buildClipboardText(project) {
    let text = `📅 *Material - ${project.name}*\n`;
    text += `(${project.date})\n\n`;

    project.items.forEach(item => {
        const amount = item.amount || '1';
        text += `- ${amount}x ${item.text}\n`;
    });

    text += `\nGesendet mit SHK-Tool`;
    return text;
}

function copyText(text) {
    navigator.clipboard.writeText(text).then(() => {
        alert("[OK] Liste kopiert! Jetzt in WhatsApp einfügen.");
    }).catch(err => {
        console.error('Fehler beim Kopieren:', err);
        alert("Fehler beim Kopieren.");
    });
}

function saveProjects() {
    try {
        const data = JSON.stringify(projectsDB);
        checkStorageSize(data);
        localStorage.setItem('shk_projects', data);
    } catch (err) {
        handleSaveError(err);
    }
}

function checkStorageSize(data) {
    const sizeInBytes = new Blob([data]).size;
    const sizeInMB = (sizeInBytes / (1024 * 1024)).toFixed(2);
    
    if (sizeInMB > 4) {
        console.warn(`[WARNUNG] localStorage ist ${sizeInMB}MB groß! Speicher wird knapp.`);
    }
}

function handleSaveError(err) {
    if (err.name === 'QuotaExceededError') {
        alert('[FEHLER] Speicher voll! Bitte alte Projekte und Fotos löschen um Platz zu machen.');
        console.error('localStorage quota exceeded:', err);
    } else {
        alert('[FEHLER] Fehler beim Speichern: ' + err.message);
    }
}
