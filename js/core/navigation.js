// Navigation & Tab-Switching
// Verwaltung von Tabs und Calculator Kategorien

function switchTab(viewId, btn) {
    hideAllContainers();
    showContainer(viewId);
    updateActiveButton(btn);
    
    if (viewId === 'material') {
        window.renderProjectList?.();
    }
}

function hideAllContainers() {
    document.querySelectorAll('.container').forEach(el => {
        el.classList.remove('active');
    });
}

function showContainer(viewId) {
    const container = document.getElementById('view-' + viewId);
    if (container) {
        container.classList.add('active');
    }
}

function updateActiveButton(btn) {
    document.querySelectorAll('.nav-item').forEach(el => {
        el.classList.remove('active');
    });
    btn.classList.add('active');
    btn.focus();
}

function initCalculatorCategories() {
    const categories = getCategories();
    const calcMapping = getCalculatorMapping();
    
    assignCategoriesToCards(calcMapping);
    renderCategoryButtons(categories);
}

function getCategories() {
    return [
        { id: 'alle', name: 'Alle', dotClass: 'chip-dot-alle' },
        { id: 'heizung', name: 'Heizung', dotClass: 'chip-dot-heizung' },
        { id: 'wasser', name: 'Wasser', dotClass: 'chip-dot-wasser' },
        { id: 'lueftung', name: 'Lueftung', dotClass: 'chip-dot-lueftung' },
        { id: 'misc', name: 'Sonstiges', dotClass: 'chip-dot-misc' }
    ];
}

function getCalculatorMapping() {
    return {
        'Gaszähler': 'heizung',
        'Heizlast': 'heizung',
        'MAG': 'heizung',
        'HK-Leistung': 'heizung',
        'Leistung-Check': 'heizung',
        'Hydraulischer Abgleich': 'heizung',
        'Pumpe': 'heizung',
        'Kesselleistung': 'heizung',
        'Spreizung': 'heizung',
        'Mischwasser': 'wasser',
        'Aufheizzeit': 'wasser',
        'Zirkulation': 'wasser',
        'Strömungsgeschwindigkeit': 'wasser',
        'Rohr-Inhalt': 'wasser',
        'Abwasser': 'wasser',
        'Kondensat': 'wasser',
        'Tank': 'wasser',
        'Lüftung': 'lueftung',
        'Kernbohrung': 'misc',
        'Schellen': 'misc',
        'Etagen': 'misc'
    };
}

function assignCategoriesToCards(calcMapping) {
    const allCards = Array.from(document.querySelectorAll('#view-rechner .card:not(.note-card)'));
    
    allCards.forEach(card => {
        const h3 = card.querySelector('h3');
        if (!h3) return;
        
        const category = findCategory(h3.textContent, calcMapping);
        card.setAttribute('data-calc-category', category);
    });
}

function findCategory(title, calcMapping) {
    for (const [keyword, cat] of Object.entries(calcMapping)) {
        if (title.includes(keyword)) {
            return cat;
        }
    }
    return 'misc';
}

function renderCategoryButtons(categories) {
    const container = document.getElementById('calc-categories');
    if (!container) return;

    categories.forEach((cat, index) => {
        const btn = createCategoryButton(cat, index === 0);
        container.appendChild(btn);
    });
}

function createCategoryButton(cat, isActive) {
    const btn = document.createElement('button');
    btn.className = 'calc-cat-btn' + (isActive ? ' active' : '');
    btn.innerHTML = `<span class="chip-dot ${cat.dotClass}"></span><span>${cat.name}</span>`;
    btn.onclick = () => filterByCategory(cat.id, btn);
    return btn;
}

function filterByCategory(categoryId, button) {
    updateActiveCategoryButton(button);
    filterCards(categoryId);
}

function updateActiveCategoryButton(button) {
    document.querySelectorAll('.calc-cat-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    button.classList.add('active');
}

function filterCards(categoryId) {
    const allCards = document.querySelectorAll('#view-rechner .card');
    allCards.forEach(card => {
        if (card.classList.contains('note-card')) {
            card.classList.remove('u-hidden');
            return;
        }

        const cardCategory = card.getAttribute('data-calc-category');
        const shouldShow = categoryId === 'alle' || cardCategory === categoryId;
        
        if (shouldShow) {
            card.classList.remove('u-hidden');
        } else {
            card.classList.add('u-hidden');
        }
    });
}

function setupNavigationKeyboard() {
    const navItems = document.querySelectorAll('.nav-item');
    
    navItems.forEach((item, index) => {
        item.addEventListener('keydown', function(e) {
            const nextIndex = getNextIndex(e.key, index, navItems.length);
            
            if (nextIndex !== index) {
                e.preventDefault();
                navItems[nextIndex].focus();
                navItems[nextIndex].click();
            }
        });
    });
}

function getNextIndex(key, currentIndex, totalItems) {
    if (key === 'ArrowRight') {
        return (currentIndex + 1) % totalItems;
    } else if (key === 'ArrowLeft') {
        return (currentIndex - 1 + totalItems) % totalItems;
    }
    return currentIndex;
}

function toggleTable(id) {
    const el = document.getElementById(id);
    const isHidden = el.style.display === 'none';
    
    el.style.display = isHidden ? 'block' : 'none';
    updateAriaExpanded(el, isHidden);
}

function updateAriaExpanded(el, isExpanded) {
    const header = el.previousElementSibling;
    if (header && header.hasAttribute('aria-controls')) {
        header.setAttribute('aria-expanded', isExpanded.toString());
    }
}
