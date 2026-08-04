// Fahrzeug-Lager / Inventar Modul
// Verwaltung von Materialbeständen im Fahrzeug

// Ab dieser Menge wird der Bestand rot hervorgehoben
const LOW_STOCK_THRESHOLD = 3;

let inventoryDB = JSON.parse(localStorage.getItem(STORAGE_KEYS.INVENTORY)) || [];

function renderInventory() {
    const list = document.getElementById('inventory_list');
    if (!list) {
        return;
    }

    list.innerHTML = '';
    list.className = 'inventory-list';

    inventoryDB.forEach((item, index) => {
        const li = createInventoryItem(item, index);
        list.appendChild(li);
    });
}

function createStockControlsHTML(item, index) {
    const lowStockClass = item.amount < LOW_STOCK_THRESHOLD ? 'low-stock' : '';
    return `
        <div class="inventory-controls">
            <button class="inventory-btn" onclick="window.updateStock(${index}, -1)">-</button>
            <span class="inventory-count ${lowStockClass}">${item.amount}</span>
            <button class="inventory-btn" onclick="window.updateStock(${index}, 1)">+</button>
        </div>
    `;
}

function createInventoryItem(item, index) {
    const li = document.createElement('li');
    li.className = 'inventory-item';
    li.innerHTML = `
        ${createStockControlsHTML(item, index)}
        <div class="inventory-name">${item.name}</div>
        <button class="btn-icon-small btn-danger" onclick="window.deleteInventoryItem(${index})" style="height:35px; width:35px;">
            ×
        </button>
    `;
    return li;
}

function updateStock(index, change) {
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

function addInventoryItem() {
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

function deleteInventoryItem(index) {
    if (confirm('Löschen?')) {
        inventoryDB.splice(index, 1);
        saveInventory();
        renderInventory();
    }
}

function saveInventory() {
    localStorage.setItem(STORAGE_KEYS.INVENTORY, JSON.stringify(inventoryDB));
}
