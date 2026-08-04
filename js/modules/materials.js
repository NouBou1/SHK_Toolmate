// Materialliste eines Projekts
// Positionen erfassen, anzeigen, loeschen und als Text teilen.
//
// Die Listeneintraege werden per DOM-API aufgebaut, nicht per innerHTML:
// Projekt- und Materialnamen kommen aus Nutzereingaben und wuerden als
// HTML interpretiert, sobald jemand ein < eintippt.

import { getCurrentProject, getCurrentProjectId, saveProjects } from './project-state.js';
import { resetSignature } from './signature.js';

/**
 * Eine geaenderte Materialliste macht eine vorhandene Unterschrift ungueltig
 */
function invalidateSignature() {
    resetSignature();
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

export function addMaterialItem() {
    const project = getCurrentProject();
    const input = readMaterialInput();
    if (!project || !input.text) {
        return;
    }
    project.items.push({ text: input.text, amount: input.amount });
    saveProjects();
    renderMaterialItems();
    invalidateSignature();
    clearMaterialInput(input);
}

export function deleteMaterialItem(index) {
    const project = getCurrentProject();
    if (!project) {
        return;
    }
    project.items.splice(index, 1);
    saveProjects();
    renderMaterialItems();
    invalidateSignature();
}

// ========== ANZEIGE ==========

function createActionButton(action, index, label, className) {
    const button = document.createElement('button');
    button.className = className;
    button.textContent = label;
    button.dataset.action = action;
    button.dataset.index = String(index);
    return button;
}

function createItemButtons(index) {
    const wrapper = document.createElement('div');
    wrapper.className = 'material_item_btns';
    wrapper.append(
        createActionButton('triggerPhoto', index, '📷', 'small-btn secondary btn-photo'),
        createActionButton('deleteMaterialItem', index, '×', 'small-btn btn-danger')
    );
    return wrapper;
}

function createItemLabel(item) {
    const label = document.createElement('span');
    const amount = document.createElement('strong');
    amount.textContent = `${item.amount}x`;
    label.append(amount, ` ${item.name || item.text || 'Ohne Namen'}`);
    return label;
}

function createThumbnail(item, index) {
    const image = document.createElement('img');
    image.className = 'item-thumbnail';
    image.src = item.image;
    image.alt = 'Foto zur Position';
    image.dataset.action = 'showBigImage';
    image.dataset.index = String(index);
    return image;
}

function createItemImage(item, index) {
    const wrapper = document.createElement('div');
    wrapper.className = 'item-image-wrapper';
    wrapper.append(
        createThumbnail(item, index),
        createActionButton('deletePhoto', index, '×', 'btn-delete-photo')
    );
    return wrapper;
}

function createItemRow(item, index) {
    const row = document.createElement('div');
    row.className = 'material-item-row';
    row.append(createItemLabel(item), createItemButtons(index));
    return row;
}

function createMaterialItemElement(item, index) {
    const column = document.createElement('div');
    column.className = 'material-item-column';
    column.append(createItemRow(item, index));
    if (item.image) {
        column.append(createItemImage(item, index));
    }
    const li = document.createElement('li');
    li.className = 'material-item';
    li.append(column);
    return li;
}

export function renderMaterialItems() {
    const listContainer = document.getElementById('material_list_items');
    if (!listContainer) {
        return;
    }
    const project = getCurrentProject();
    const eintraege = project ? project.items.map(createMaterialItemElement) : [];
    listContainer.replaceChildren(...eintraege);
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

/**
 * Materialliste als Text in die Zwischenablage (z.B. für WhatsApp)
 *
 * NOCH NICHT VERDRAHTET: Es gibt bisher keinen Knopf dafür. Zum Aktivieren
 * die Funktion in app.js unter KLICK_AKTIONEN eintragen und in der
 * Detailansicht einen Button mit passendem Aktionsnamen ergänzen.
 */
export function copyListToClipboard() {
    if (!getCurrentProjectId()) {
        return;
    }
    const project = getCurrentProject();
    if (!project || project.items.length === 0) {
        alert('Liste ist leer!');
        return;
    }
    copyText(buildClipboardText(project));
}
