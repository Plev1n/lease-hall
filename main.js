/* ============================================
   LEASE HALL — Main Application
   ============================================ */

// ── Hall Data (edit availability here) ──────
const HALLS = [
    { id: 1,  name: "Administrativní budova", type: "kanceláře", area: 120,  available: true,  description: "Kancelářské prostory v administrativní budově u vstupu do areálu." },
    { id: 2,  name: "Trafo stanice",          type: "technické",  area: 50,   available: false, description: "Technický objekt — trafostanice." },
    { id: 3,  name: "Garáže",                 type: "garáže",     area: 180,  available: true,  description: "Garážové prostory vhodné pro parkování a drobné skladování." },
    { id: 4,  name: "Hala",                   type: "hala",       area: 500,  available: true,  description: "Velká halová plocha vhodná pro výrobu, skladování nebo logistiku." },
    { id: 5,  name: "Jídelna",                type: "komerční",   area: 220,  available: true,  description: "Prostor bývalé jídelny — vhodný pro gastro provoz nebo komerční využití." },
    { id: 6,  name: "Stolárna",               type: "dílna",      area: 120,  available: true,  description: "Dílenský prostor s historickým využitím jako stolárna." },
    { id: 7,  name: "Administrativní budova",  type: "kanceláře", area: 80,   available: true,  description: "Menší administrativní budova vhodná pro zázemí firmy." },
    { id: 8,  name: "3 patrová budova",        type: "kanceláře", area: 350,  available: true,  description: "Třípatrová budova s kancelářskými prostory na každém patře." },
    { id: 9,  name: "2 patrová hala",          type: "hala",      area: 280,  available: true,  description: "Dvoupatrová hala kombinující halové a kancelářské prostory." },
    { id: 10, name: "Hala",                    type: "hala",      area: 532,  available: true,  description: "Halová plocha v centrální části areálu." },
    { id: 11, name: "Hala",                    type: "hala",      area: 660,  available: false, description: "Halový prostor — aktuálně pronajato." },
    { id: 12, name: "Administrativní budova",  type: "kanceláře", area: 100,  available: true,  description: "Kompaktní administrativní budova v centru areálu." },
    { id: 13, name: "Hala a úpravna vody",     type: "hala",      area: 400,  available: false, description: "Hala s úpravnou vody — aktuálně pronajato." },
    { id: 14, name: "Hala",                    type: "hala",      area: 1340, available: false, description: "Velká halová plocha — aktuálně nedostupná." },
    { id: 15, name: "Zastřešená plocha",        type: "zastřešená plocha", area: 1220, available: true, description: "Velká zastřešená plocha vhodná pro skladování materiálu nebo techniky." },
    { id: 16, name: "Hala",                    type: "hala",      area: 1500, available: true,  description: "Prostorná hala vhodná pro výrobu, skladování nebo logistiku." },
    { id: 17, name: "Hala",                    type: "hala",      area: 200,  available: true,  description: "Menší halový prostor v horní části areálu." },
    { id: 18, name: "Hala",                    type: "hala",      area: 1875, available: true,  description: "Největší halová plocha v areálu — ideální pro velkovýrobu nebo centrální sklad." },
    { id: 19, name: "Hala",                    type: "hala",      area: 625,  available: true,  description: "Středně velká hala v centrální části areálu." },
    { id: 20, name: "Hala",                    type: "hala",      area: 800,  available: true,  description: "Halový prostor vhodný pro výrobu nebo skladování." },
    { id: 21, name: "Hala",                    type: "hala",      area: 1400, available: true,  description: "Velká hala v severozápadní části areálu." },
];

const PRICE_PER_M2 = 100;       // CZK bez DPH
const PRICE_PER_M2_VAT = 121;   // CZK s DPH

// ── Helpers ─────────────────────────────────
function fmt(n) {
    return n.toLocaleString('cs-CZ');
}

function getHall(id) {
    return HALLS.find(h => h.id === id);
}

function getTypeLabel(type) {
    const labels = {
        'hala': 'Hala',
        'kanceláře': 'Kanceláře',
        'komerční': 'Komerční',
        'garáže': 'Garáže',
        'dílna': 'Dílna',
        'zastřešená plocha': 'Zastřešená plocha',
        'technické': 'Technické zázemí',
    };
    return labels[type] || type;
}

function matchesFilter(hall, filter) {
    if (filter === 'all') return true;
    if (filter === 'hala') return hall.type === 'hala';
    if (filter === 'kanceláře') return hall.type === 'kanceláře';
    return !['hala', 'kanceláře'].includes(hall.type);
}

// ── Hero Stats ──────────────────────────────
function updateHeroStats() {
    const available = HALLS.filter(h => h.available);
    const countEl = document.querySelector('[data-count="available"]');
    const areaEl = document.querySelector('[data-count="totalArea"]');
    if (countEl) countEl.textContent = available.length;
    if (areaEl) areaEl.textContent = fmt(available.reduce((sum, h) => sum + h.area, 0)) + ' m²';
}

// ── SVG Map ─────────────────────────────────
function initMap() {
    const svg = document.getElementById('areal-map');
    const tooltip = document.getElementById('map-tooltip');
    const tooltipName = document.getElementById('tooltip-name');
    const tooltipArea = document.getElementById('tooltip-area');
    const wrapper = document.querySelector('.map-wrapper');

    document.querySelectorAll('.building').forEach(g => {
        const id = parseInt(g.dataset.hallId);
        const hall = getHall(id);
        if (!hall) return;

        if (!hall.available) {
            g.classList.add('unavailable');
        }

        // Hover tooltip
        g.addEventListener('mouseenter', (e) => {
            if (!hall.available) {
                tooltipName.textContent = `${hall.name} #${hall.id}`;
                tooltipArea.textContent = 'Pronajato';
            } else {
                tooltipName.textContent = `${hall.name} #${hall.id}`;
                tooltipArea.textContent = `${fmt(hall.area)} m² — ${fmt(hall.area * PRICE_PER_M2)} Kč/měs.`;
            }
            tooltip.classList.add('visible');
        });

        g.addEventListener('mousemove', (e) => {
            const rect = wrapper.getBoundingClientRect();
            const x = e.clientX - rect.left + 16;
            const y = e.clientY - rect.top - 10;
            tooltip.style.left = x + 'px';
            tooltip.style.top = y + 'px';
        });

        g.addEventListener('mouseleave', () => {
            tooltip.classList.remove('visible');
        });

        // Click to open modal
        g.addEventListener('click', () => {
            if (hall.available) {
                openModal(hall);
            }
        });
    });
}

// ── Hall Cards ──────────────────────────────
function renderHallCards(filter = 'all') {
    const grid = document.getElementById('halls-grid');
    const available = HALLS.filter(h => h.available && matchesFilter(h, filter));

    grid.innerHTML = available.map(hall => `
        <div class="hall-card" data-hall-id="${hall.id}">
            <div class="hall-card__header">
                <span class="hall-card__number">${hall.id}</span>
                <span class="hall-card__tag">${getTypeLabel(hall.type)}</span>
            </div>
            <div class="hall-card__name">${hall.name}</div>
            <div class="hall-card__type">${hall.description}</div>
            <div class="hall-card__meta">
                <span class="hall-card__area">${fmt(hall.area)} m²</span>
                <span class="hall-card__price">${fmt(hall.area * PRICE_PER_M2)} Kč/měs.</span>
            </div>
        </div>
    `).join('');

    // Click handlers
    grid.querySelectorAll('.hall-card').forEach(card => {
        card.addEventListener('click', () => {
            const hall = getHall(parseInt(card.dataset.hallId));
            if (hall) openModal(hall);
        });
    });
}

function initFilters() {
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            renderHallCards(btn.dataset.filter);
        });
    });
}

// ── Contact Form Select ─────────────────────
function populateFormSelect() {
    const select = document.getElementById('cf-hall');
    HALLS.filter(h => h.available).forEach(hall => {
        const option = document.createElement('option');
        option.value = `Hala #${hall.id} — ${hall.name} (${fmt(hall.area)} m²)`;
        option.textContent = `#${hall.id} — ${hall.name} (${fmt(hall.area)} m²)`;
        select.appendChild(option);
    });
}

// ── Modal ───────────────────────────────────
function openModal(hall) {
    const overlay = document.getElementById('modal-overlay');
    document.getElementById('modal-type').textContent = getTypeLabel(hall.type);
    document.getElementById('modal-title').textContent = `${hall.name} #${hall.id}`;
    document.getElementById('modal-area').textContent = fmt(hall.area) + ' m²';
    document.getElementById('modal-price').textContent = fmt(hall.area * PRICE_PER_M2) + ' Kč';
    document.getElementById('modal-price-vat').textContent = fmt(hall.area * PRICE_PER_M2_VAT) + ' Kč';
    document.getElementById('modal-description').textContent = hall.description;
    document.getElementById('mf-hall').value = `Hala #${hall.id} — ${hall.name} (${fmt(hall.area)} m²)`;

    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    const overlay = document.getElementById('modal-overlay');
    overlay.classList.remove('open');
    document.body.style.overflow = '';
}

function initModal() {
    const overlay = document.getElementById('modal-overlay');
    document.getElementById('modal-close').addEventListener('click', closeModal);
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) closeModal();
    });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeModal();
    });
}

// ── Form Handling ───────────────────────────
function showFormSuccess(form) {
    const wrapper = form.parentElement;
    const title = form.querySelector('.contact-form__title, .modal-form__title');
    const titleText = title ? title.textContent : '';

    form.style.display = 'none';

    const success = document.createElement('div');
    success.className = 'form-success';
    success.innerHTML = `
        <div class="form-success__icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
        </div>
        <div class="form-success__title">Poptávka odeslána!</div>
        <div class="form-success__text">Děkujeme za váš zájem. Ozveme se vám co nejdříve.</div>
    `;
    wrapper.appendChild(success);

    setTimeout(() => {
        success.remove();
        form.reset();
        form.style.display = '';
    }, 4000);
}

function initForms() {
    // Main contact form
    document.getElementById('contact-form').addEventListener('submit', (e) => {
        e.preventDefault();
        showFormSuccess(e.target);
    });

    // Modal form
    document.getElementById('modal-form').addEventListener('submit', (e) => {
        e.preventDefault();
        showFormSuccess(e.target);
        setTimeout(closeModal, 2000);
    });
}

// ── Smooth Scroll ───────────────────────────
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', (e) => {
            e.preventDefault();
            const target = document.querySelector(anchor.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });
}

// ── Init ────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    updateHeroStats();
    initMap();
    renderHallCards();
    initFilters();
    populateFormSelect();
    initModal();
    initForms();
    initSmoothScroll();
});
