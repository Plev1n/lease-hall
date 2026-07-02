/* ============================================
   LEASE HALL — Main Application
   ============================================ */

// ── Hall Data (edit availability here) ──────
// Fields: photos = count of photos in assets/photos/<id>/ (1.jpg..N.jpg + thumbs)
//         plan   = floor-plan PDF path in assets/plans/ (optional)
//         areaOnRequest = true → "na vyžádání" instead of a number
const HALLS = [
    // Hidden per request (2026-06-12):
    // { id: 1,  name: "Administrativní budova", type: "kanceláře", area: 120,  available: true,  description: "Kancelářské prostory v administrativní budově u vstupu do areálu." },
    { id: 2,  name: "Trafo stanice",          type: "technické",  area: 50,   available: false, description: "Technický objekt — trafostanice." },
    { id: 3,  name: "Garáže",                 type: "garáže",     area: 180,  available: true,  description: "Garážové prostory vhodné pro parkování a drobné skladování.", photos: 2 },
    { id: 4,  name: "Hala",                   type: "hala",       area: 500,  available: false, description: "Velká halová plocha vhodná pro výrobu, skladování nebo logistiku — aktuálně pronajato.", photos: 11 },
    { id: 5,  name: "Jídelna",                type: "komerční",   area: 220,  available: true,  description: "Prostor bývalé jídelny — vhodný pro gastro provoz nebo komerční využití.", photos: 19 },
    { id: 6,  name: "Stolárna",               type: "dílna",      area: 120,  available: true,  description: "Dílenský prostor s historickým využitím jako stolárna.", photos: 7 },
    { id: 7,  name: "Administrativní budova",  type: "kanceláře", area: 80,   available: false, description: "Menší administrativní budova vhodná pro zázemí firmy — aktuálně pronajato.", photos: 1 },
    { id: 8,  name: "3 patrová budova",        type: "kanceláře", area: 350,  available: true,  description: "Třípatrová budova s kancelářskými prostory na každém patře.", photos: 5 },
    { id: 9,  name: "2 patrová hala",          type: "hala",      area: 532.5, available: true,  description: "Dvoupatrová hala 35,8 × 14,8 m (532,5 m² na patro). Přízemí: max. výška 4 m. 1. patro: max. výška 3,6 m.", photos: 4, plan: "hala-9" },
    { id: 10, name: "Hala",                    type: "hala",      area: 570,  available: true,  description: "Hala 38,2 × 14,9 m, max. výška 7,5 m, min. 4 m. Halová plocha v centrální části areálu.", photos: 3, plan: "hala-10" },
    { id: 11, name: "Hala",                    type: "hala",      area: 800,  available: false, description: "Hala spojená s objektem č. 13, max. výška 5,8 m, min. 3,8 m — aktuálně pronajato.", plan: "hala-11" },
    // Hidden per request (2026-06-12):
    // { id: 12, name: "Administrativní budova",  type: "kanceláře", area: 100,  available: true,  description: "Kompaktní administrativní budova v centru areálu." },
    { id: 13, name: "Hala a úpravna vody",     type: "hala",      area: 400,  available: false, description: "Hala s úpravnou vody — aktuálně pronajato." },
    { id: 14, name: "Hala",                    type: "hala",      area: 1340, available: true,  description: "Velká halová plocha 1 340 m².", photos: 3 },
    { id: 15, name: "Zastřešená plocha",        type: "zastřešená plocha", area: 1220, available: true, description: "Velká zastřešená plocha vhodná pro skladování materiálu nebo techniky.", photos: 8 },
    { id: 16, name: "Hala",                    type: "hala",      area: 1500, available: true,  description: "Dlouhá hala (cca 100 m). Prostorná plocha vhodná pro výrobu, skladování nebo logistiku.", photos: 8, plan: "hala-16" },
    { id: 17, name: "Hala",                    type: "hala",      area: 200,  available: true,  description: "Hala, max. výška 7 m, min. 5,3 m. Menší halový prostor v horní části areálu.", photos: 3, plan: "hala-17" },
    { id: 18, name: "Hala",                    type: "hala",      area: 1875, available: true,  description: "Největší hala v areálu, max. výška 8,6 m, min. 6 m. Přízemí + 1. patro (cca 250 m² kancelářského zázemí). Ideální pro velkovýrobu nebo centrální sklad.", photos: 10, plan: "hala-18" },
    { id: 19, name: "Hala",                    type: "hala",      area: 625,  available: true,  description: "Dvoupatrový objekt, max. výška 8,5 m (1. patro místy 2,5 m). Středně velká hala v centrální části areálu.", photos: 8, plan: "hala-19" },
    { id: 20, name: "Hala",                    type: "hala",      area: 800,  available: false, description: "Hala, max. výška 8,6 m, min. 6,5 m.", photos: 1, plan: "hala-20" },
    { id: 21, name: "Hala",                    type: "hala",      area: 930,  available: true,  description: "Dvoupatrová hala — přízemí max. výška 8,2 m (min. 6,4 m), 1. patro max. výška 4,7 m. V severozápadní části areálu.", photos: 5, plan: "hala-21" },
    // Additional halls
    { id: 22.1, name: "Hala",                  type: "hala",      area: null, areaOnRequest: true, available: false, description: "Halový prostor s přilehlou zpevněnou manipulační plochou — rozměry a detaily na vyžádání.", photos: 6 },
    { id: 22.2, name: "Hala",                  type: "hala",      area: 2817, available: true,  description: "Spojený halový prostor o celkové ploše 2 817 m².", photos: 12 },
    { id: 23, name: "Hala",                    type: "hala",      area: 1517, available: false, description: "Halový prostor o ploše 1 517 m².", photos: 4 },
    { id: 35, name: "Ubytovací a kancelářské kapacity", type: "kanceláře", area: 1651, available: true, description: "Ubytovací a kancelářské kapacity o ploše 1 651 m².", photos: 8 },
    { id: 36, name: "Ubytovací a kancelářské kapacity", type: "kanceláře", area: 524,  available: true, description: "Ubytovací a kancelářské kapacity o ploše 524 m².", photos: 7 },
];

const PRICE_PER_M2 = 100;       // CZK bez DPH (pronájem / měsíc)
const PRICE_PER_M2_VAT = 121;   // CZK s DPH

// Pseudo-položka pro leteckou galerii celého areálu (assets/photos/areal/)
const AREAL_GALLERY = { id: 'areal', name: 'Areál NORMA FnO — letecký pohled', photos: 8 };

// Zařazení haly: id >= 16 → prodej, jinak pronájem (lze přebít přes hall.offer).
function offerOf(hall) {
    return hall.offer || (hall.id >= 16 ? 'sale' : 'rent');
}

// Společné letecké/orientační snímky přidané do galerie KAŽDÉ haly na prodej (assets/aerials/).
const SALE_AERIALS = [1, 2, 3, 4].map(i => ({
    type: 'photo',
    full: `assets/aerials/${i}.webp`,
    fullJpg: `assets/aerials/${i}.jpg`,
    thumb: `assets/aerials/${i}-thumb.webp`,
    thumbJpg: `assets/aerials/${i}-thumb.jpg`,
    alt: `Areál NORMA FnO, Frýdlant nad Ostravicí – letecký pohled a poloha haly na prodej ${i}`,
}));

// ── Config ──────────────────────────────────
const RECAPTCHA_SITE_KEY = '6LfSj8EsAAAAANNN7x6Qgr5rCAdEc71ixh4rbxMj';
const API_ENDPOINT = '/api/submit';

// ── Helpers ─────────────────────────────────
function fmt(n) {
    return n.toLocaleString('cs-CZ');
}

function getHall(id) {
    if (id === 'areal') return AREAL_GALLERY;
    return HALLS.find(h => h.id === id);
}

function areaLabel(hall) {
    return hall.areaOnRequest ? 'na vyžádání' : `${fmt(hall.area)} m²`;
}

function priceLabel(hall, withVat = false) {
    if (hall.areaOnRequest) return 'na vyžádání';
    const rate = withVat ? PRICE_PER_M2_VAT : PRICE_PER_M2;
    return `${fmt(hall.area * rate)} Kč`;
}

function photoUrl(hall, i, thumb = false, ext = 'webp') {
    return `assets/photos/${hall.id}/${i}${thumb ? '-thumb' : ''}.${ext}`;
}

// Returns ordered gallery items for a hall: photos first, then floor-plan (if any).
// Each item carries both WebP (primary) and JPG (fallback) URLs.
function galleryItems(hall) {
    const items = [];
    if (hall.photos) {
        for (let i = 1; i <= hall.photos; i++) {
            items.push({
                type: 'photo',
                full: photoUrl(hall, i, false, 'webp'),
                fullJpg: photoUrl(hall, i, false, 'jpg'),
                thumb: photoUrl(hall, i, true, 'webp'),
                thumbJpg: photoUrl(hall, i, true, 'jpg'),
                alt: hall.id === 'areal'
                    ? `Areál NORMA FnO, Frýdlant nad Ostravicí – letecký pohled ${i}`
                    : `${hall.name} #${hall.id} – Areál NORMA FnO, Frýdlant nad Ostravicí – foto ${i}`,
            });
        }
    }
    // Letecké snímky u všech hal na prodej (za vlastními fotkami, před půdorysem)
    if (offerOf(hall) === 'sale') {
        items.push(...SALE_AERIALS);
    }
    if (hall.plan) {
        items.push({
            type: 'plan',
            full: `assets/plans/thumbs/plan-${hall.id}.jpg`,
            fullJpg: `assets/plans/thumbs/plan-${hall.id}.jpg`,
            thumb: `assets/plans/thumbs/plan-${hall.id}-thumb.jpg`,
            thumbJpg: `assets/plans/thumbs/plan-${hall.id}-thumb.jpg`,
            pdf: `assets/plans/${hall.plan}.pdf`,
            alt: `Půdorys – ${hall.name} č. ${hall.id}, Areál NORMA FnO, Frýdlant nad Ostravicí`,
        });
    }
    return items;
}

function getTypeLabel(type) {
    const labels = {
        'hala': 'Hala',
        'kanceláře': 'Kanceláře',
        'komerční': 'Komerční',
        'garáže': 'Garáže',
        'dílna': 'Dílna',
        'zastřešená plocha': 'Zastřešená plocha',
        'manipulační plocha': 'Manipulační plocha',
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
    if (areaEl) areaEl.textContent = fmt(available.reduce((sum, h) => sum + (h.area || 0), 0)) + ' m²';
}

// ── SVG Map ─────────────────────────────────
function initMap() {
    const svg = document.getElementById('areal-map');
    const tooltip = document.getElementById('map-tooltip');
    const tooltipName = document.getElementById('tooltip-name');
    const tooltipArea = document.getElementById('tooltip-area');
    const wrapper = document.querySelector('.map-wrapper');

    document.querySelectorAll('.building').forEach(g => {
        const id = parseFloat(g.dataset.hallId);
        const hall = getHall(id);
        if (!hall) return;

        const offer = offerOf(hall);
        if (offer === 'sale') {
            g.classList.add('is-sale');
        } else if (hall.available) {
            g.classList.add('is-rent');
        } else {
            g.classList.add('unavailable');
        }

        // Hover tooltip
        g.addEventListener('mouseenter', (e) => {
            tooltipName.textContent = `${hall.name} #${hall.id}`;
            if (offer === 'sale') {
                tooltipArea.textContent = hall.areaOnRequest
                    ? 'Na prodej — cena na vyžádání'
                    : `${fmt(hall.area)} m² — cena na vyžádání`;
            } else if (!hall.available) {
                tooltipArea.textContent = 'Pronajato';
            } else {
                tooltipArea.textContent = hall.areaOnRequest
                    ? 'K pronájmu — na vyžádání'
                    : `${fmt(hall.area)} m² — ${fmt(hall.area * PRICE_PER_M2)} Kč/měs.`;
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
            if (hall.available || offer === 'sale') {
                openModal(hall);
            }
        });
    });
}

// ── Hall Cards ──────────────────────────────
function priceTag(hall, mode) {
    if (mode === 'sale') {
        return 'Cena na vyžádání';
    }
    return hall.areaOnRequest ? 'na vyžádání' : `${fmt(hall.area * PRICE_PER_M2)} Kč/měs.`;
}

function hallCardHtml(hall, mode) {
    const cover = hall.photos
        ? `<div class="hall-card__cover"><picture>
                <source type="image/webp" srcset="${photoUrl(hall, 1, true, 'webp')}">
                <img src="${photoUrl(hall, 1, true, 'jpg')}" alt="${hall.name} #${hall.id} — náhled" loading="lazy" decoding="async" class="hall-card__cover-img">
           </picture></div>`
        : `<div class="hall-card__cover hall-card__cover--empty"></div>`;
    return `
    <div class="hall-card" data-hall-id="${hall.id}">
        ${cover}
        <div class="hall-card__body">
            <div class="hall-card__header">
                <span class="hall-card__number">${hall.id}</span>
                <span class="hall-card__tag">${getTypeLabel(hall.type)}</span>
            </div>
            <div class="hall-card__name">${hall.name}</div>
            <div class="hall-card__type">${hall.description}</div>
            <div class="hall-card__meta">
                <span class="hall-card__area">${areaLabel(hall)}</span>
                <span class="hall-card__price hall-card__price--${mode}">${priceTag(hall, mode)}</span>
            </div>
        </div>
    </div>`;
}

function renderListings() {
    const saleGrid = document.getElementById('prodej-hal-grid');
    const rentGrid = document.getElementById('pronajem-hal-grid');

    if (saleGrid) {
        const sale = HALLS.filter(h => offerOf(h) === 'sale').sort((a, b) => a.id - b.id);
        saleGrid.innerHTML = sale.map(h => hallCardHtml(h, 'sale')).join('');
    }
    if (rentGrid) {
        const rent = HALLS.filter(h => offerOf(h) === 'rent' && h.available)
            .sort((a, b) => a.id - b.id);
        rentGrid.innerHTML = rent.map(h => hallCardHtml(h, 'rent')).join('');
    }

    document.querySelectorAll('#prodej-hal-grid .hall-card, #pronajem-hal-grid .hall-card').forEach(card => {
        card.addEventListener('click', () => {
            const hall = getHall(parseFloat(card.dataset.hallId));
            if (hall) openModal(hall);
        });
    });
}

// Aerial gallery of the whole areál (primary "Prodej celého areálu" section)
function renderArealGallery() {
    const grid = document.getElementById('areal-gallery');
    if (!grid) return;
    grid.innerHTML = galleryItems(AREAL_GALLERY).map((item, i) =>
        `<button type="button" class="gallery-thumb areal-thumb" data-hall-id="areal" data-index="${i}" aria-label="${item.alt}">
            <picture>
                <source type="image/webp" srcset="${item.thumb}">
                <img src="${item.thumbJpg}" alt="${item.alt}" loading="lazy" decoding="async">
            </picture>
        </button>`).join('');
}

// ── Contact Form Select ─────────────────────
function populateFormSelect() {
    const select = document.getElementById('cf-hall');
    if (!select) return;

    const arealOpt = document.createElement('option');
    arealOpt.value = 'Celý areál (43 000 m²)';
    arealOpt.textContent = 'Celý areál (43 000 m²)';
    select.appendChild(arealOpt);

    const addGroup = (label, halls) => {
        if (!halls.length) return;
        const group = document.createElement('optgroup');
        group.label = label;
        halls.forEach(hall => {
            const option = document.createElement('option');
            const text = `#${hall.id} — ${hall.name} (${areaLabel(hall)})`;
            option.value = text;
            option.textContent = text;
            group.appendChild(option);
        });
        select.appendChild(group);
    };

    addGroup('Prodej hal', HALLS.filter(h => offerOf(h) === 'sale').sort((a, b) => a.id - b.id));
    addGroup('Pronájem hal', HALLS.filter(h => offerOf(h) === 'rent' && h.available).sort((a, b) => a.id - b.id));
}

// "Poptat areál" CTA → předvybere "Celý areál" v kontaktním formuláři
function initArealCta() {
    document.querySelectorAll('[data-prefill-hall]').forEach(el => {
        el.addEventListener('click', () => {
            const select = document.getElementById('cf-hall');
            if (select) select.value = el.dataset.prefillHall;
        });
    });
}

// ── Modal ───────────────────────────────────
function openModal(hall) {
    const overlay = document.getElementById('modal-overlay');
    const mode = offerOf(hall);
    document.getElementById('modal-type').textContent = getTypeLabel(hall.type);
    document.getElementById('modal-title').textContent = `${hall.name} #${hall.id}`;
    document.getElementById('modal-area').textContent = areaLabel(hall);

    const priceEl = document.getElementById('modal-price');
    const priceVatEl = document.getElementById('modal-price-vat');
    const priceLabelEl = document.getElementById('modal-price-label');
    const priceVatLabelEl = document.getElementById('modal-price-vat-label');
    const statsEl = document.querySelector('.modal__stats');
    const vatStat = priceVatEl.closest('.modal__stat');
    if (mode === 'sale') {
        priceEl.textContent = 'Cena na vyžádání';
        if (priceLabelEl) priceLabelEl.textContent = 'Cena';
        if (vatStat) vatStat.hidden = true;
        if (statsEl) statsEl.classList.add('modal__stats--two');
    } else {
        priceEl.textContent = priceLabel(hall, false);
        priceVatEl.textContent = priceLabel(hall, true);
        if (priceLabelEl) priceLabelEl.textContent = 'Měsíčně bez DPH';
        if (priceVatLabelEl) priceVatLabelEl.textContent = 'Měsíčně s DPH';
        if (vatStat) vatStat.hidden = false;
        if (statsEl) statsEl.classList.remove('modal__stats--two');
    }

    const noteEl = document.getElementById('modal-note');
    if (noteEl) noteEl.hidden = true;

    document.getElementById('modal-description').textContent = hall.description;
    document.getElementById('mf-hall').value = `#${hall.id} — ${hall.name} (${areaLabel(hall)})`;

    // Photo gallery (+ floor plan as last item)
    const gallery = document.getElementById('modal-gallery');
    if (gallery) {
        gallery.hidden = false;
        const items = galleryItems(hall);
        if (items.length) {
            gallery.classList.remove('modal__gallery--empty');
            gallery.innerHTML = items.map((item, i) => {
                const planBadge = item.type === 'plan'
                    ? `<span class="gallery-thumb__badge">Půdorys</span>`
                    : '';
                return `<button type="button" class="gallery-thumb gallery-thumb--${item.type}" data-hall-id="${hall.id}" data-index="${i}" aria-label="${item.alt}">
                    <picture>
                        <source type="image/webp" srcset="${item.thumb}">
                        <img src="${item.thumbJpg}" alt="${item.alt}" loading="lazy" decoding="async">
                    </picture>
                    ${planBadge}
                </button>`;
            }).join('');
        } else {
            gallery.classList.add('modal__gallery--empty');
            gallery.innerHTML = `
                <div class="modal__gallery-empty">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>
                    <span>Fotografie budou doplněny</span>
                </div>`;
        }
    }

    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
}

// Lightbox — gallery with prev/next navigation
const lightboxState = { items: [], index: 0 };

function openLightbox(hall, index) {
    const lightbox = document.getElementById('lightbox');
    if (!lightbox) return;
    const items = galleryItems(hall);
    if (!items.length) return;
    lightboxState.items = items;
    lightboxState.index = index;
    renderLightbox();
    lightbox.classList.add('open');
}

function renderLightbox() {
    const lightbox = document.getElementById('lightbox');
    const { items, index } = lightboxState;
    if (!items.length) return;
    const item = items[index];
    const img = lightbox.querySelector('.lightbox__img');
    const counter = lightbox.querySelector('.lightbox__counter');
    const pdfLink = lightbox.querySelector('.lightbox__pdf');
    img.decoding = 'async';
    // Fallback to JPG if WebP errors (extremely rare — ~97% support)
    img.onerror = () => { if (img.src.endsWith('.webp') && item.fullJpg) img.src = item.fullJpg; };
    img.src = item.full;
    img.alt = item.alt;
    counter.textContent = `${index + 1} / ${items.length}`;
    if (item.type === 'plan' && item.pdf) {
        pdfLink.href = item.pdf;
        pdfLink.hidden = false;
    } else {
        pdfLink.hidden = true;
    }
    const multi = items.length > 1;
    lightbox.querySelector('.lightbox__prev').hidden = !multi;
    lightbox.querySelector('.lightbox__next').hidden = !multi;
}

function closeLightbox() {
    const lightbox = document.getElementById('lightbox');
    lightbox.classList.remove('open');
    lightbox.querySelector('.lightbox__img').src = '';
    lightboxState.items = [];
}

function lightboxStep(delta) {
    const { items, index } = lightboxState;
    if (!items.length) return;
    lightboxState.index = (index + delta + items.length) % items.length;
    renderLightbox();
}

function initGalleryLightbox() {
    const lightbox = document.getElementById('lightbox');
    if (!lightbox) return;

    // Thumb click → open lightbox at that index
    document.addEventListener('click', (e) => {
        const btn = e.target.closest('.gallery-thumb');
        if (!btn) return;
        const raw = btn.dataset.hallId;
        const index = parseInt(btn.dataset.index);
        const hall = getHall(raw === 'areal' ? 'areal' : parseFloat(raw));
        if (hall) openLightbox(hall, index);
    });

    // Lightbox controls
    lightbox.addEventListener('click', (e) => {
        if (e.target.closest('.lightbox__prev')) { lightboxStep(-1); return; }
        if (e.target.closest('.lightbox__next')) { lightboxStep(1); return; }
        if (e.target.closest('.lightbox__close')) { closeLightbox(); return; }
        // Click on backdrop (outside image) closes
        if (e.target === lightbox) closeLightbox();
    });
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
}

// Unified keyboard handler — lightbox takes precedence over modal
function initKeyboard() {
    document.addEventListener('keydown', (e) => {
        const lightbox = document.getElementById('lightbox');
        const lightboxOpen = lightbox && lightbox.classList.contains('open');
        const modalOpen = document.getElementById('modal-overlay')?.classList.contains('open');

        if (lightboxOpen) {
            if (e.key === 'Escape') { closeLightbox(); e.stopPropagation(); }
            else if (e.key === 'ArrowLeft') lightboxStep(-1);
            else if (e.key === 'ArrowRight') lightboxStep(1);
            return;
        }
        if (modalOpen && e.key === 'Escape') closeModal();
    });
}

// ── Form Handling ───────────────────────────
function showFormSuccess(form) {
    const wrapper = form.parentElement;

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

function showFormError(form, message) {
    let errEl = form.querySelector('.form-error');
    if (!errEl) {
        errEl = document.createElement('div');
        errEl.className = 'form-error';
        errEl.style.cssText = 'background:rgba(239,68,68,0.1);border:1px solid rgba(239,68,68,0.3);color:#ef4444;padding:12px 16px;border-radius:8px;font-size:0.9rem;margin-bottom:16px;';
        form.prepend(errEl);
    }
    errEl.textContent = message;
    setTimeout(() => errEl.remove(), 5000);
}

function setSubmitting(form, loading) {
    const btn = form.querySelector('button[type="submit"]');
    if (loading) {
        btn.dataset.originalText = btn.textContent;
        btn.textContent = 'Odesílám...';
        btn.disabled = true;
        btn.style.opacity = '0.6';
    } else {
        btn.textContent = btn.dataset.originalText || 'Odeslat poptávku';
        btn.disabled = false;
        btn.style.opacity = '';
    }
}

// Lazy-load reCAPTCHA Enterprise on first interaction. Returns a promise that
// resolves once the script is ready. Repeat calls return the same promise.
let recaptchaReadyPromise = null;
function loadRecaptcha() {
    if (recaptchaReadyPromise) return recaptchaReadyPromise;
    recaptchaReadyPromise = new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = `https://www.google.com/recaptcha/enterprise.js?render=${RECAPTCHA_SITE_KEY}`;
        script.async = true;
        script.onload = () => {
            if (typeof grecaptcha !== 'undefined' && grecaptcha.enterprise) {
                grecaptcha.enterprise.ready(resolve);
            } else {
                resolve();
            }
        };
        script.onerror = reject;
        document.head.appendChild(script);
    });
    return recaptchaReadyPromise;
}

async function getRecaptchaToken(action) {
    try {
        await loadRecaptcha();
        if (typeof grecaptcha === 'undefined' || !grecaptcha.enterprise) return '';
        return await grecaptcha.enterprise.execute(RECAPTCHA_SITE_KEY, { action });
    } catch (err) {
        console.warn('reCAPTCHA error:', err);
        return '';
    }
}

async function submitForm(form, action) {
    setSubmitting(form, true);

    const formData = new FormData(form);
    const name = formData.get('name') || '';
    const email = formData.get('email') || '';
    const phone = formData.get('phone') || '';
    const hall = formData.get('hall') || '';
    const message = formData.get('message') || '';

    try {
        const token = await getRecaptchaToken(action);

        const payload = {
            name,
            email,
            phone,
            hall,
            message,
            action,
            recaptchaToken: token,
        };

        const res = await fetch(API_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        const result = await res.json();

        if (!res.ok || !result.success) {
            throw new Error(result.error || result.message || 'Chyba při odesílání.');
        }

        if (window.dataLayer) {
            window.dataLayer.push({
                event: 'form_submit_success',
                form_action: action,
                hall: hall || 'general',
            });
        }

        showFormSuccess(form);
        return true;
    } catch (err) {
        console.error('Form submit error:', err);
        showFormError(form, err.message || 'Nepodařilo se odeslat. Zkuste to znovu nebo nás kontaktujte telefonicky.');
        return false;
    } finally {
        setSubmitting(form, false);
    }
}

function initForms() {
    // Main contact form
    document.getElementById('contact-form').addEventListener('submit', (e) => {
        e.preventDefault();
        submitForm(e.target, 'contact_form');
    });

    // Modal form
    document.getElementById('modal-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const ok = await submitForm(e.target, 'modal_inquiry');
        if (ok) setTimeout(closeModal, 2000);
    });

    // Lazy-load reCAPTCHA on first interaction with any form input
    // (saves ~200 KB JS on initial page load for visitors who never submit)
    const primeRecaptcha = () => loadRecaptcha();
    document.querySelectorAll('#contact-form input, #contact-form textarea, #modal-form input, #modal-form textarea').forEach(el => {
        el.addEventListener('focus', primeRecaptcha, { once: true });
    });
}

// Defer hero video download until the page has fully loaded — the poster
// (173 KB WebP) already shows instantly. Mobile viewports get a smaller
// 360p variant (~23 MB vs 45 MB desktop) to cut cellular data usage
// while keeping a clean 2.2 Mbps bitrate (previous 320p/700 kbps
// version looked over-compressed on retina screens).
function initHeroVideo() {
    const video = document.getElementById('hero-video');
    if (!video) return;
    const source = video.querySelector('source[data-src]');
    if (!source) return;
    const mobileSrc = source.dataset.srcMobile;
    const resolvedSrc = mobileSrc && window.matchMedia('(max-width: 767px)').matches
        ? mobileSrc
        : source.dataset.src;
    const start = () => {
        source.src = resolvedSrc;
        video.load();
        const playPromise = video.play();
        if (playPromise && typeof playPromise.catch === 'function') {
            // autoplay can be blocked on some browsers; poster remains visible
            playPromise.catch(() => {});
        }
    };
    if (document.readyState === 'complete') {
        start();
    } else {
        window.addEventListener('load', () => {
            // use requestIdleCallback when available to avoid contending with
            // any last-frame work after load
            if ('requestIdleCallback' in window) {
                requestIdleCallback(start, { timeout: 1500 });
            } else {
                setTimeout(start, 500);
            }
        }, { once: true });
    }
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
    renderListings();
    renderArealGallery();
    initArealCta();
    populateFormSelect();
    initModal();
    initGalleryLightbox();
    initKeyboard();
    initForms();
    initSmoothScroll();
    initHeroVideo();
});
