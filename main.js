/* ============================================
   LEASE HALL — Main Application
   ============================================ */

// ── Hall Data (edit availability here) ──────
// Fields: photos = count of photos in assets/photos/<id>/ (1.jpg..N.jpg + thumbs)
//         plan   = floor-plan PDF path in assets/plans/ (optional)
//         areaOnRequest = true → "na vyžádání" instead of a number
const HALLS = [
    { id: 1,  name: "Administrativní budova", type: "kanceláře", area: 120,  available: true,  description: "Kancelářské prostory v administrativní budově u vstupu do areálu." },
    { id: 2,  name: "Trafo stanice",          type: "technické",  area: 50,   available: false, description: "Technický objekt — trafostanice." },
    { id: 3,  name: "Garáže",                 type: "garáže",     area: 180,  available: true,  description: "Garážové prostory vhodné pro parkování a drobné skladování.", photos: 2 },
    { id: 4,  name: "Hala",                   type: "hala",       area: 500,  available: true,  description: "Velká halová plocha vhodná pro výrobu, skladování nebo logistiku.", photos: 11 },
    { id: 5,  name: "Jídelna",                type: "komerční",   area: 220,  available: true,  description: "Prostor bývalé jídelny — vhodný pro gastro provoz nebo komerční využití.", photos: 19 },
    { id: 6,  name: "Stolárna",               type: "dílna",      area: 120,  available: true,  description: "Dílenský prostor s historickým využitím jako stolárna.", photos: 7 },
    { id: 7,  name: "Administrativní budova",  type: "kanceláře", area: 80,   available: true,  description: "Menší administrativní budova vhodná pro zázemí firmy.", photos: 1 },
    { id: 8,  name: "3 patrová budova",        type: "kanceláře", area: 350,  available: true,  description: "Třípatrová budova s kancelářskými prostory na každém patře.", photos: 5 },
    { id: 9,  name: "2 patrová hala",          type: "hala",      area: 1060, available: true,  description: "Dvoupatrová hala 35,8 × 14,8 m. Přízemí: max. výška 4 m. 1. patro: max. výška 3,6 m. Celková plocha cca 1 060 m² (530 m² na patro).", photos: 3, plan: "hala-9" },
    { id: 10, name: "Hala",                    type: "hala",      area: 540,  available: true,  description: "Hala 38,2 × 14,9 m, max. výška 7,5 m, min. 4 m. Halová plocha v centrální části areálu.", photos: 1, plan: "hala-10" },
    { id: 11, name: "Hala",                    type: "hala",      area: 660,  available: false, description: "Hala 44 × 15 m, max. výška 5,8 m, min. 3,8 m — aktuálně pronajato.", plan: "hala-11" },
    { id: 12, name: "Administrativní budova",  type: "kanceláře", area: 100,  available: true,  description: "Kompaktní administrativní budova v centru areálu." },
    { id: 13, name: "Hala a úpravna vody",     type: "hala",      area: 400,  available: false, description: "Hala s úpravnou vody — aktuálně pronajato." },
    { id: 14, name: "Hala",                    type: "hala",      area: 1340, available: true,  description: "Velká halová plocha 1 340 m².", photos: 3 },
    { id: 15, name: "Zastřešená plocha",        type: "zastřešená plocha", area: 1220, available: true, description: "Velká zastřešená plocha vhodná pro skladování materiálu nebo techniky.", photos: 4 },
    { id: 16, name: "Hala",                    type: "hala",      area: 1630, available: true,  description: "Dlouhá hala 100 × 16,3 m. Prostorná plocha vhodná pro výrobu, skladování nebo logistiku.", photos: 3, plan: "hala-16" },
    { id: 17, name: "Hala",                    type: "hala",      area: 225,  available: true,  description: "Hala 18,2 × 12,4 m, max. výška 7 m, min. 5,3 m. Menší halový prostor v horní části areálu.", photos: 1, plan: "hala-17" },
    { id: 18, name: "Hala",                    type: "hala",      area: 1930, available: true,  description: "Největší hala v areálu, 77 × 25 m, max. výška 8,6 m, min. 6 m. Přízemí + 1. patro (cca 250 m² kancelářského zázemí). Ideální pro velkovýrobu nebo centrální sklad.", photos: 7, plan: "hala-18" },
    { id: 19, name: "Hala",                    type: "hala",      area: 770,  available: true,  description: "Dvoupatrový objekt — přízemí cca 290 m² (max. výška 8,5 m), 1. patro cca 480 m² (max. výška 8,5 m / 2,5 m). Středně velká hala v centrální části areálu.", photos: 6, plan: "hala-19" },
    { id: 20, name: "Hala",                    type: "hala",      area: 470,  available: true,  description: "Hala 24,3 × 19,2 m, max. výška 8,6 m, min. 6,5 m. Vhodná pro výrobu nebo skladování.", photos: 3, plan: "hala-20" },
    { id: 21, name: "Hala",                    type: "hala",      area: 1020, available: true,  description: "Dvoupatrová hala — přízemí cca 650 m² (max. výška 8,2 m, min. 6,4 m), 1. patro cca 370 m² (max. výška 4,7 m). V severozápadní části areálu.", photos: 4, plan: "hala-21" },
    // Additional halls — details na vyžádání
    { id: 22, name: "Hala",                    type: "hala",      area: null, areaOnRequest: true, available: true, description: "Halový prostor — rozměry a detaily na vyžádání.", photos: 6 },
    { id: 23, name: "Hala",                    type: "hala",      area: null, areaOnRequest: true, available: true, description: "Halový prostor — rozměry a detaily na vyžádání.", photos: 2 },
    { id: 26, name: "Hala",                    type: "hala",      area: null, areaOnRequest: true, available: true, description: "Halový prostor — rozměry a detaily na vyžádání.", photos: 7 },
    { id: 35, name: "Hala",                    type: "hala",      area: null, areaOnRequest: true, available: true, description: "Halový prostor — rozměry a detaily na vyžádání.", photos: 4 },
    { id: 36, name: "Hala",                    type: "hala",      area: null, areaOnRequest: true, available: true, description: "Halový prostor — rozměry a detaily na vyžádání.", photos: 2 },
];

const PRICE_PER_M2 = 100;       // CZK bez DPH
const PRICE_PER_M2_VAT = 121;   // CZK s DPH

// ── Config ──────────────────────────────────
const RECAPTCHA_SITE_KEY = '6LfSj8EsAAAAANNN7x6Qgr5rCAdEc71ixh4rbxMj';
const WEB3FORMS_ACCESS_KEY = '5eaea807-5d6e-4955-a876-cefbd5b20f33';
const API_ENDPOINT = 'https://api.web3forms.com/submit';

// ── Helpers ─────────────────────────────────
function fmt(n) {
    return n.toLocaleString('cs-CZ');
}

function getHall(id) {
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

function photoUrl(hall, i, thumb = false) {
    return `assets/photos/${hall.id}/${i}${thumb ? '-thumb' : ''}.jpg`;
}

// Returns ordered gallery items for a hall: photos first, then floor-plan (if any).
function galleryItems(hall) {
    const items = [];
    if (hall.photos) {
        for (let i = 1; i <= hall.photos; i++) {
            items.push({
                type: 'photo',
                full: photoUrl(hall, i),
                thumb: photoUrl(hall, i, true),
                alt: `${hall.name} č. ${hall.id} k pronájmu – Areál NORMA FnO, Frýdlant nad Ostravicí – foto ${i}`,
            });
        }
    }
    if (hall.plan) {
        items.push({
            type: 'plan',
            full: `assets/plans/thumbs/plan-${hall.id}.jpg`,
            thumb: `assets/plans/thumbs/plan-${hall.id}-thumb.jpg`,
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
        const id = parseInt(g.dataset.hallId);
        const hall = getHall(id);
        if (!hall) return;

        if (!hall.available) {
            g.classList.add('unavailable');
        }

        // Hover tooltip
        g.addEventListener('mouseenter', (e) => {
            tooltipName.textContent = `${hall.name} #${hall.id}`;
            if (!hall.available) {
                tooltipArea.textContent = 'Pronajato';
            } else if (hall.areaOnRequest) {
                tooltipArea.textContent = 'Plocha na vyžádání';
            } else {
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

    grid.innerHTML = available.map(hall => {
        const cover = hall.photos ? `<div class="hall-card__cover" style="background-image:url('${photoUrl(hall, 1, true)}')"></div>` : `<div class="hall-card__cover hall-card__cover--empty"></div>`;
        const price = hall.areaOnRequest ? 'na vyžádání' : `${fmt(hall.area * PRICE_PER_M2)} Kč/měs.`;
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
                    <span class="hall-card__price">${price}</span>
                </div>
            </div>
        </div>`;
    }).join('');

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
        const label = `#${hall.id} — ${hall.name} (${areaLabel(hall)})`;
        option.value = label;
        option.textContent = label;
        select.appendChild(option);
    });
}

// ── Modal ───────────────────────────────────
function openModal(hall) {
    const overlay = document.getElementById('modal-overlay');
    document.getElementById('modal-type').textContent = getTypeLabel(hall.type);
    document.getElementById('modal-title').textContent = `${hall.name} #${hall.id}`;
    document.getElementById('modal-area').textContent = areaLabel(hall);
    document.getElementById('modal-price').textContent = priceLabel(hall, false);
    document.getElementById('modal-price-vat').textContent = priceLabel(hall, true);
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
                    <img src="${item.thumb}" alt="${item.alt}" loading="lazy">
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
        const hallId = parseInt(btn.dataset.hallId);
        const index = parseInt(btn.dataset.index);
        const hall = getHall(hallId);
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

async function getRecaptchaToken(action) {
    if (typeof grecaptcha === 'undefined' || !grecaptcha.enterprise) {
        return '';
    }
    try {
        return await new Promise((resolve, reject) => {
            grecaptcha.enterprise.ready(async () => {
                try {
                    const token = await grecaptcha.enterprise.execute(RECAPTCHA_SITE_KEY, { action });
                    resolve(token);
                } catch (err) { reject(err); }
            });
        });
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
            access_key: WEB3FORMS_ACCESS_KEY,
            subject: hall
                ? `Areál NORMA FnO — poptávka ${hall}`
                : 'Areál NORMA FnO — poptávka',
            from_name: 'arealfno.cz',
            name,
            email,
            phone,
            hall,
            message,
            'g-recaptcha-response': token,
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
            throw new Error(result.message || 'Chyba při odesílání.');
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
    initGalleryLightbox();
    initKeyboard();
    initForms();
    initSmoothScroll();
});
