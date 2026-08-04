// Materialliste eines Projekts
// Positionen erfassen, anzeigen, loeschen und als Text teilen.

/**
 * Eine geaenderte Materialliste macht eine vorhandene Unterschrift ungueltig
 */
function invalidateSignature() {
    window.resetSignature?.();
}

function readMaterialInput() {
    const inputName = document.getElementById('new_item_name');
    const inputAmount = document.getElementById('new_item_amount');
    return {
        inputName,
        inputAmount,
        text: inputName.value.trim(),
        amount: inputAmount.value.trim() || '1'
    };
}

function clearMaterialInput(input) {
    input.inputName.value = '';
    input.inputAmount.value = '';
    input.inputName.focus();
}

function addMaterialItem() {
    const project = getCurrentProjectEntry();
    const input = readMaterialInput();
    if (!project || !input.text) {
        return;
    }
    project.items.push({ text: input.text, amount: input.amount });
    saveProjects();
    window.renderMaterialItems?.();
    invalidateSignature();
    clearMaterialInput(input);
}

function deleteMaterialItem(index) {
    const project = getCurrentProjectEntry();
    if (!project) {
        return;
    }
    project.items.splice(index, 1);
    saveProjects();
    renderMaterialItems();
    invalidateSignature();
}

// ========== ANZEIGE ==========

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

function createMaterialButtonsHTML(index) {
    return `
        <div class="material_item_btns">
            <button class="small-btn secondary" onclick="window.triggerPhoto(${index})" style="margin-right:5px;">
                📷
            </button>
            <button class="small-btn btn-danger" onclick="window.deleteMaterialItem(${index})">×</button>
        </div>
    `;
}

function createMaterialRowHTML(item, index) {
    const label = item.name || item.text || 'Ohne Namen';
    return `
        <div style="display:flex; justify-content:space-between; align-items:center;">
            <span><strong>${item.amount}x</strong> ${label}</span>
            ${createMaterialButtonsHTML(index)}
        </div>
    `;
}

function createMaterialItemElement(item, index) {
    const li = document.createElement('li');
    li.className = 'material-item';
    const imageHTML = item.image ? createImageHTML(item.image, index) : '';

    li.innerHTML = `
        <div style="display:flex; flex-direction:column; width:100%;">
            ${createMaterialRowHTML(item, index)}
            ${imageHTML}
        </div>
    `;
    return li;
}

function renderMaterialItems() {
    const listContainer = document.getElementById('material_list_items');
    if (!listContainer) {
        return;
    }
    listContainer.innerHTML = '';

    const project = getCurrentProjectEntry();
    project?.items.forEach((item, index) => {
        listContainer.appendChild(createMaterialItemElement(item, index));
    });
}

// ========== TEILEN ==========

function buildClipboardText(project) {
    let text = `📅 *Material - ${project.name}*\n`;
    text += `(${project.date})\n\n`;

    project.items.forEach(item => {
        text += `- ${item.amount || '1'}x ${item.text}\n`;
    });

    return text + '\nGesendet mit SHK-Tool';
}

function copyText(text) {
    navigator.clipboard.writeText(text).then(() => {
        alert('[OK] Liste kopiert! Jetzt in WhatsApp einfügen.');
    }).catch(err => {
        console.error('Fehler beim Kopieren:', err);
        alert('Fehler beim Kopieren.');
    });
}

function copyListToClipboard() {
    if (!currentProjectId) {
        return;
    }
    const project = getCurrentProjectEntry();
    if (!project || project.items.length === 0) {
        alert('Liste ist leer!');
        return;
    }
    copyText(buildClipboardText(project));
}
