// Kalender Modul
// Monatsansicht mit Projekt-Verknüpfung

let currentDate = new Date();

function renderCalendar() {
    const grid = document.getElementById('calendar_grid');
    const title = document.getElementById('cal_month_year');
    if (!grid) {
        return;
    }

    grid.innerHTML = '';
    const { year, month } = getCurrentMonthYear();

    updateCalendarTitle(title, month, year);
    renderCalendarDays(grid, year, month);
}

function getCurrentMonthYear() {
    return {
        year: currentDate.getFullYear(),
        month: currentDate.getMonth()
    };
}

function updateCalendarTitle(title, month, year) {
    const monthNames = ['Januar','Februar','März','April','Mai','Juni',
        'Juli','August','September','Oktober','November','Dezember'];
    if (title) {
        title.innerText = `${monthNames[month]} ${year}`;
    }
}

function renderCalendarDays(grid, year, month) {
    renderWeekdayHeaders(grid);
    const { startDay, daysInMonth } = getMonthInfo(year, month);
    renderEmptyDays(grid, startDay);
    renderDayNumbers(grid, year, month, daysInMonth);
}

function renderWeekdayHeaders(grid) {
    const daysHeader = ['Mo','Di','Mi','Do','Fr','Sa','So'];
    daysHeader.forEach(d => {
        const div = document.createElement('div');
        div.className = 'cal-header';
        div.innerText = d;
        grid.appendChild(div);
    });
}

function getMonthInfo(year, month) {
    const firstDayIndex = new Date(year, month, 1).getDay();
    const startDay = (firstDayIndex === 0) ? 6 : firstDayIndex - 1;
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    return { startDay, daysInMonth };
}

function renderEmptyDays(grid, count) {
    for (let i = 0; i < count; i++) {
        grid.appendChild(document.createElement('div'));
    }
}

function renderDayNumbers(grid, year, month, daysInMonth) {
    const today = new Date();

    for (let d = 1; d <= daysInMonth; d++) {
        const div = createDayElement(d, year, month, today);
        grid.appendChild(div);
    }
}

function appendProjectDot(dayElement) {
    const dot = document.createElement('div');
    dot.className = 'cal-dot';
    dayElement.appendChild(dot);
}

function createDayElement(day, year, month, today) {
    const div = document.createElement('div');
    div.className = 'cal-day';
    div.innerText = day;
    div.classList.toggle('today', isToday(day, month, year, today));

    const dateString = formatDateISO(year, month, day);
    if (checkForProjects(dateString)) {
        appendProjectDot(div);
    }
    div.onclick = () => window.showEventsForDay?.(dateString, day);
    return div;
}

function isToday(day, month, year, today) {
    return day === today.getDate() &&
           month === today.getMonth() &&
           year === today.getFullYear();
}

function formatDateISO(year, month, day) {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function checkForProjects(dateString) {
    const projectsDB = window.projectsDB || [];
    return projectsDB.some(p => p.isoDate === dateString);
}

function changeMonth(dir) {
    currentDate.setMonth(currentDate.getMonth() + dir);
    renderCalendar();
}

function showEventsForDay(isoDate, dayNum) {
    const container = document.getElementById('calendar_events');
    if (!container) {
        return;
    }

    const events = getEventsForDate(isoDate);
    container.innerHTML = buildEventsHTML(events, dayNum);
    highlightSelectedDay();
}

function getEventsForDate(isoDate) {
    const projectsDB = window.projectsDB || [];
    return projectsDB.filter(p => p.isoDate === isoDate);
}

function buildEventsHTML(events, dayNum) {
    let html = `<h5>Projekte am ${dayNum}.:</h5>`;

    if (events.length === 0) {
        html += '<p style="color:#777;">Keine Einträge.</p>';
    } else {
        events.forEach(p => {
            html += createEventCardHTML(p);
        });
    }

    return html;
}

function createEventCardHTML(project) {
    return `
        <div class="cal-event-card" onclick="window.jumpToProject(${project.id})">
            <strong>${project.name}</strong><br>
            <small>${project.items.length} Positionen</small>
            <span style="float:right;">➜</span>
        </div>
    `;
}

function highlightSelectedDay() {
    document.querySelectorAll('.cal-day').forEach(el => {
        el.classList.remove('selected');
    });
}

function jumpToProject(id) {
    const switchTab = window.switchTab;
    const navItems = document.querySelectorAll('.nav-item');

    if (switchTab && navItems[1]) {
        switchTab('material', navItems[1]);
    }

    window.openProject?.(id);
}
