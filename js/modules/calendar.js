// Kalender Modul
// Monatsansicht mit Projekt-Verknüpfung

import { getProjects } from './project-state.js';
import { openProject } from './projects.js';
import { switchTab } from '../core/navigation.js';

let currentDate = new Date();

export function renderCalendar() {
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

function markDayAsClickable(div, dateString, day) {
    div.dataset.action = 'showEventsForDay';
    div.dataset.isoDate = dateString;
    div.dataset.day = String(day);
}

function createDayElement(day, year, month, today) {
    const div = document.createElement('div');
    div.className = 'cal-day';
    div.textContent = day;
    div.classList.toggle('today', isToday(day, month, year, today));

    const dateString = formatDateISO(year, month, day);
    if (checkForProjects(dateString)) {
        appendProjectDot(div);
    }
    markDayAsClickable(div, dateString, day);
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
    return getProjects().some(p => p.isoDate === dateString);
}

export function changeMonth(dir) {
    currentDate.setMonth(currentDate.getMonth() + dir);
    renderCalendar();
}

export function showEventsForDay(isoDate, dayNum) {
    const container = document.getElementById('calendar_events');
    if (!container) {
        return;
    }

    const events = getEventsForDate(isoDate);
    container.replaceChildren(...buildEventElements(events, dayNum));
    highlightSelectedDay();
}

function getEventsForDate(isoDate) {
    return getProjects().filter(p => p.isoDate === isoDate);
}

function createEmptyNote() {
    const note = document.createElement('p');
    note.className = 'empty-hint';
    note.textContent = 'Keine Einträge.';
    return note;
}

function createEventText(project) {
    const name = document.createElement('strong');
    name.textContent = project.name;

    const count = document.createElement('small');
    count.textContent = `${project.items.length} Positionen`;

    const pfeil = document.createElement('span');
    pfeil.className = 'cal-event-arrow';
    pfeil.textContent = '➜';

    return [name, document.createElement('br'), count, pfeil];
}

function createEventCard(project) {
    const card = document.createElement('div');
    card.className = 'cal-event-card';
    card.dataset.action = 'jumpToProject';
    card.dataset.projectId = String(project.id);
    card.append(...createEventText(project));
    return card;
}

function buildEventElements(events, dayNum) {
    const titel = document.createElement('h5');
    titel.textContent = `Projekte am ${dayNum}.:`;

    const inhalt = events.length === 0
        ? [createEmptyNote()]
        : events.map(createEventCard);
    return [titel, ...inhalt];
}

function highlightSelectedDay() {
    document.querySelectorAll('.cal-day').forEach(el => {
        el.classList.remove('selected');
    });
}

export function jumpToProject(id) {
    const navItems = document.querySelectorAll('.nav-item');

    if (navItems[1]) {
        switchTab('material', navItems[1]);
    }
    openProject(id);
}
