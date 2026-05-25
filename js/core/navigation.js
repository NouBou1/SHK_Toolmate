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
        { id: 'alle', name: 'Alle' },
        { id: 'heizung', name: 'Heizung' },
        { id: 'wasser', name: 'Wasser' },
        { id: 'lueftung', name: 'Lüftung' },
        { id: 'misc', name: 'Sonstiges' }
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
    
    // Realistische SVG Icons (16x16px)
    const icons = {
        'alle': `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="1.5" y="1.5" width="5.5" height="5.5" rx="1.5" fill="#8ea9e0"/>
            <rect x="9" y="1.5" width="5.5" height="5.5" rx="1.5" fill="#8ea9e0"/>
            <rect x="1.5" y="9" width="5.5" height="5.5" rx="1.5" fill="#8ea9e0"/>
            <rect x="9" y="9" width="5.5" height="5.5" rx="1.5" fill="#8ea9e0"/>
        </svg>`,
        
        'heizung': `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="1" y="2" width="14" height="12" rx="1.5" fill="none" stroke="#fe9400" stroke-width="1.2"/>
            <rect x="3" y="4" width="1.8" height="8" rx="0.6" fill="#fe9400"/>
            <rect x="6.1" y="4" width="1.8" height="8" rx="0.6" fill="#fe9400"/>
            <rect x="9.2" y="4" width="1.8" height="8" rx="0.6" fill="#fe9400"/>
            <rect x="12.3" y="4" width="1.8" height="8" rx="0.6" fill="#fe9400"/>
            <circle cx="2" cy="8" r="1.2" fill="#fe9400"/>
            <circle cx="14" cy="8" r="1.2" fill="#fe9400"/>
        </svg>`,
        
        'wasser': `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M8 1.5C8 1.5 4 6.5 4 9.5C4 12 5.8 14 8 14C10.2 14 12 12 12 9.5C12 6.5 8 1.5 8 1.5Z" 
                  fill="#4b8eff" stroke="#2563eb" stroke-width="1"/>
            <ellipse cx="6.2" cy="8.5" rx="1.2" ry="1.8" fill="#74d1ff" opacity="0.6"/>
        </svg>`,
        
        'lueftung': `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="8" cy="8" r="2.5" fill="#74d1ff"/>
            <path d="M8 1C8 1 10.5 3 9.5 7C9.5 7 13 4.5 14.5 7.5C14.5 7.5 12 10 8 9C8 9 11 11.5 8.5 15C8.5 15 6 12.5 7 9C7 9 3.5 11.5 1.5 8.5C1.5 8.5 4 5.5 8 7C8 7 5.5 4 8 1Z" 
                  fill="#74d1ff" stroke="#5fb8e0" stroke-width="1"/>
        </svg>`,
        
        'misc': `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M8 1L9.5 5L14 6L10.5 9L11.5 14L8 11.5L4.5 14L5.5 9L2 6L6.5 5L8 1Z" fill="#8b90a0"/>
            <path d="M4 10L4.5 11.5L6 12L4.5 12.5L4 14L3.5 12.5L2 12L3.5 11.5L4 10Z" fill="#8b90a0" opacity="0.8"/>
            <circle cx="13" cy="13" r="1.5" fill="#8b90a0" opacity="0.7"/>
        </svg>`
    };
    
    const icon = icons[cat.id] || '';
    btn.innerHTML = `${icon}<span>${cat.name}</span>`;
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
