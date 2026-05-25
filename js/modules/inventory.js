// Fahrzeug-Lager / Inventar Modul
// Verwaltung von Materialbeständen im Fahrzeug

let inventoryDB = JSON.parse(localStorage.getItem('shk_inventory')) || [];

function renderInventory() {
    const list = document.getElementById('inventory_list');
    if (!list) return;
    
    list.innerHTML = '';
    list.className = 'inventory-list';

    inventoryDB.forEach((item, index) => {
        const li = createInventoryItem(item, index);
        list.appendChild(li);
    });
}

function createInventoryItem(item, index) {
    const li = document.createElement('li');
    li.className = 'inventory-item';
    const isLow = item.amount < 3;

    li.innerHTML = `
        <div class="inventory-controls">
            <button class="inventory-btn" onclick="window.updateStock(${index}, -1)">-</button>
            <span class="inventory-count ${isLow ? 'low-stock' : ''}">${item.amount}</span>
            <button class="inventory-btn" onclick="window.updateStock(${index}, 1)">+</button>
        </div>

        <div class="inventory-name">
            ${item.name}
        </div>

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

function addInventoryItem() {
    const nameInput = document.getElementById('inv_name');
    const amountInput = document.getElementById('inv_amount');
    
    const name = nameInput.value.trim();
    let amount = parseInt(amountInput.value);
    
    if (!name) return;
    if (isNaN(amount)) amount = 1;

    inventoryDB.push({ name, amount });
    saveInventory();
    renderInventory();
    
    clearInventoryInputs(nameInput, amountInput);
}

function clearInventoryInputs(nameInput, amountInput) {
    nameInput.value = '';
    amountInput.value = '';
}

function deleteInventoryItem(index) {
    if (confirm("Löschen?")) {
        inventoryDB.splice(index, 1);
        saveInventory();
        renderInventory();
    }
}

function saveInventory() {
    localStorage.setItem('shk_inventory', JSON.stringify(inventoryDB));
}
