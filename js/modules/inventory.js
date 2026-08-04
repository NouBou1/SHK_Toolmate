// Fahrzeug-Lager / Inventar Modul
// Verwaltung von Materialbeständen im Fahrzeug

// Ab dieser Menge wird der Bestand rot hervorgehoben
import { STORAGE_KEYS } from '../core/constants.js';

const LOW_STOCK_THRESHOLD = 3;

let inventoryDB = JSON.parse(localStorage.getItem(STORAGE_KEYS.INVENTORY)) || [];

export function renderInventory() {
    const list = document.getElementById('inventory_list');
    if (!list) {
        return;
    }
    list.className = 'inventory-list';
    list.replaceChildren(...inventoryDB.map(createInventoryItem));
}

function createStockButton(index, delta, label) {
    const button = document.createElement('button');
    button.className = 'inventory-btn';
    button.textContent = label;
    button.dataset.action = 'updateStock';
    button.dataset.index = String(index);
    button.dataset.delta = String(delta);
    return button;
}

function createStockControls(item, index) {
    const wrapper = document.createElement('div');
    wrapper.className = 'inventory-controls';

    const count = document.createElement('span');
    count.className = 'inventory-count';
    count.classList.toggle('low-stock', item.amount < LOW_STOCK_THRESHOLD);
    count.textContent = item.amount;

    wrapper.append(createStockButton(index, -1, '-'), count, createStockButton(index, 1, '+'));
    return wrapper;
}

function createDeleteButton(index) {
    const button = document.createElement('button');
    button.className = 'btn-icon-small btn-danger btn-delete-item';
    button.textContent = '×';
    button.dataset.action = 'deleteInventoryItem';
    button.dataset.index = String(index);
    return button;
}

function createInventoryItem(item, index) {
    const li = document.createElement('li');
    li.className = 'inventory-item';

    const name = document.createElement('div');
    name.className = 'inventory-name';
    name.textContent = item.name;

    li.append(createStockControls(item, index), name, createDeleteButton(index));
    return li;
}

export function updateStock(index, change) {
    inventoryDB[index].amount += change;

    if (inventoryDB[index].amount < 0) {
        inventoryDB[index].amount = 0;
    }

    saveInventory();
    renderInventory();
}

function readInventoryInput() {
    const nameInput = document.getElementById('inv_name');
    const amountInput = document.getElementById('inv_amount');
    const amount = parseInt(amountInput.value, 10);

    return { nameInput, amountInput, name: nameInput.value.trim(), amount };
}

export function addInventoryItem() {
    const input = readInventoryInput();
    if (!input.name) {
        return;
    }
    inventoryDB.push({ name: input.name, amount: isNaN(input.amount) ? 1 : input.amount });
    saveInventory();
    renderInventory();

    input.nameInput.value = '';
    input.amountInput.value = '';
}

export function deleteInventoryItem(index) {
    if (confirm('Löschen?')) {
        inventoryDB.splice(index, 1);
        saveInventory();
        renderInventory();
    }
}

function saveInventory() {
    localStorage.setItem(STORAGE_KEYS.INVENTORY, JSON.stringify(inventoryDB));
}
