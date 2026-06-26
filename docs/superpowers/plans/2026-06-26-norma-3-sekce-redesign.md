# NORMA FnO — 3 sekce + výměna fotek — Implementační plán

> **Pro agentní workery:** implementuj task po tasku. Kroky mají checkboxy (`- [ ]`).
> Spec: `docs/superpowers/specs/2026-06-26-norma-3-sekce-redesign.md`

**Goal:** Přestavět arealfno.cz na 3 nabídkové sekce (prodej areálu / prodej hal ≥16 / pronájem hal ≤15 + #24) s prioritou prodeje a vyměnit fotky + hero video za nové z focení 2026-06-12.

**Architecture:** Statický web (HTML/CSS/vanilla JS). Data hal v poli `HALLS` (`main.js`), karty se renderují do kontejnerů v `index.html`. Přidá se pole `offer` (sale/rent) a konstanta `SALE_PRICE_PER_M2`. Fotky se dávkově komprimují přes `sips`, video přes `ffmpeg`/`avconvert`. Ověření přes `agent-browser`.

**Tech Stack:** HTML5, CSS, vanilla JS; `sips` (foto), `ffmpeg` nebo `avconvert` (video); `agent-browser` (QA); git + Vercel (deploy z `main`).

## Global Constraints

- `SALE_PRICE_PER_M2 = 14000` Kč/m²; `PRICE_PER_M2 = 100` Kč/m²/měs (beze změny).
- Hranice kategorií: `id >= 16 → 'sale'`, jinak `'rent'`. **Výjimka: #24 → 'rent'.**
- Prodej hal: zobrazit i pronajaté (`available:false`) s odznakem „Pronajato · na prodej i s nájemcem". Pronájem: jen `available:true`.
- Skryté zůstávají skryté: `#1`, `#12`.
- Foto: full max 1800 px (JPEG q~72), náhled max 600 px; číslování `1.jpg`/`1-thumb.jpg`…
- Video < 100 MB; zachovat `data-src-mobile` mechanismus.
- Zdroj médií: `/Users/davidpleva/Projects/PPS/PRIM/PRIM/PNG/NORMA`.
- Záloha/rollback: tag `backup-2026-06-26-pre-3sections`.
- Diakritika v cestách → media operace psát jako bash skripty v scratchpadu a pouštět `bash skript.sh`.

---

## Task 1: Foto pipeline — komprese + výměna fotek hal

**Files:**
- Create: `scratchpad/photos.sh` (dávkový skript)
- Modify: `assets/photos/{9,10,15,16,17,18,19,20,21,23,35,36}/*` (přepis)
- Create: `assets/photos/24/*` (nová hala)

**Mapování (zdrojová složka → id):** `9→9, 10→10, "15 - zastřešená plocha"→15, 16→16, 17→17, 18→18, 19→19, 20→20, 21→21, 23→23, "24 - manipulační plocha"→24, 35→35, 36→36`.

- [ ] **Krok 1:** Napsat `photos.sh`: pro každou dvojici (src, id) smaž starý obsah `assets/photos/<id>/`, projdi zdrojové `*.jpg` setříděné, výstup `n.jpg` (`sips -s format jpeg -s formatOptions 72 -Z 1800`) a `n-thumb.jpg` (`-Z 600`), n od 1.
- [ ] **Krok 2:** Spustit `bash scratchpad/photos.sh`; vypsat počet souborů a velikosti na halu.
- [ ] **Krok 3 (ověření):** `find assets/photos/16 -name '*.jpg' ! -name '*-thumb*' | wc -l` = 8; náhodný full ~200–500 kB, thumb < 90 kB. Zkontrolovat všechny haly proti počtům: 9=4,10=3,15=8,16=8,17=3,18=10,19=8,20=1,21=5,23=4,24=3,35=8,36=7.
- [ ] **Krok 4 (commit):** `git add assets/photos && git commit -m "Replace hall photos with 2026-06-12 shoot + add #24"`

## Task 2: Letecké fotky areálu — banner + galerie

**Files:**
- Create: `assets/areal/banner.jpg` (panorama), `assets/photos/areal/{1..8}.jpg` + `-thumb`
- Create: `scratchpad/areal.sh`

- [ ] **Krok 1:** Zobrazit kandidáty banneru (`areál grafika/704.jpg, 688.jpg, 715 1.jpg`) přes Read a vybrat nejlepší panorama.
- [ ] **Krok 2:** Zobrazit kontaktní náhled „Dron"/„web" (vygenerovat montáž nebo projít Read) a vybrat 6–8 nejostřejších/nejreprezentativnějších leteckých.
- [ ] **Krok 3:** `areal.sh`: banner → `assets/areal/banner.jpg` (`-Z 1920 -s formatOptions 72`); galerie → `assets/photos/areal/n.jpg` (`-Z 1800`) + `n-thumb.jpg` (`-Z 600`).
- [ ] **Krok 4 (ověření):** banner existuje a < 600 kB; galerie 6–8 ks full+thumb.
- [ ] **Krok 5 (commit):** `git add assets/areal assets/photos/areal && git commit -m "Add curated aerial areal photos + banner"`

## Task 3: Hero video — výměna za NORMA 2

**Files:**
- Modify: `assets/video/hero-drone.mp4`, `assets/video/hero-drone-mobile.mp4`, poster
- Create: `scratchpad/video.sh`

- [ ] **Krok 1:** Zjistit nástroj: `command -v ffmpeg || echo "use avconvert"`.
- [ ] **Krok 2:** Vybrat zdroj (`norma 2/...HD.mp4` 74 MB jako základ). Zkontrolovat délku/rozlišení (`ffprobe` nebo `sips`/`mdiutil`).
- [ ] **Krok 3:** Re-encode desktop: scale 960×540, bez zvuku, ~25–40 Mb cíl. ffmpeg: `ffmpeg -i SRC -an -vf scale=960:-2 -c:v libx264 -crf 28 -preset slow -movflags +faststart -t 30 hero-drone.mp4`. (Bez ffmpeg: `avconvert -p Preset960x540 -s SRC -o ...`.)
- [ ] **Krok 4:** Mobilní: `scale=568:-2 -crf 30 -t 30` → `hero-drone-mobile.mp4` (< 8 MB).
- [ ] **Krok 5:** Poster: 1. snímek → WebP (`ffmpeg -i hero-drone.mp4 -frames:v 1 -vf scale=960:-2 poster.png` → převést na webp přes `sips -s format webp` nebo `cwebp`). Nahradit stávající poster, zachovat název.
- [ ] **Krok 6 (ověření):** oba mp4 < 100 MB; přehrání 1. snímku přes agent-browser (hero se hýbe). 
- [ ] **Krok 7 (commit):** `git add assets/video && git commit -m "Swap hero video to NORMA 2 footage"`

## Task 4: Datový model + render 3 nabídek (main.js)

**Files:**
- Modify: `main.js`

**Interfaces (produkuje):** `SALE_PRICE_PER_M2`, `offerOf(hall)`, `salePriceLabel(hall)`, render do `#prodej-hal-grid` a `#pronajem-hal-grid`.

- [ ] **Krok 1:** Přečíst celé `main.js` (zjistit přesné názvy render/price/filter funkcí, číslo řádků).
- [ ] **Krok 2:** Přidat `const SALE_PRICE_PER_M2 = 14000;` k `PRICE_PER_M2`. Přidat `function offerOf(h){ return h.offer || (h.id >= 16 ? 'sale' : 'rent'); }`.
- [ ] **Krok 3:** Přidat halu #24 do `HALLS`: `{ id: 24, name: "Manipulační plocha", type: "manipulační plocha", area: null, areaOnRequest: true, available: true, offer: 'rent', description: "Zpevněná manipulační plocha — rozměry a detaily na vyžádání.", photos: 3 }`.
- [ ] **Krok 4:** Aktualizovat `photos:` počty: 9→4,10→3,15→8,16→8,17→3,18→10,19→8,20→1,21→5,23→4,35→8,36→7.
- [ ] **Krok 5:** Render PRODEJ: `HALLS.filter(h=>offerOf(h)==='sale')` (i pronajaté), seřadit dle plochy desc (areaOnRequest na konec), do `#prodej-hal-grid`. Cena: `salePriceLabel(h) = h.areaOnRequest ? 'cena na vyžádání' : 'orientačně ' + fmt(h.area*SALE_PRICE_PER_M2) + ' Kč'`. Pokud `!h.available` → odznak „Pronajato · na prodej i s nájemcem".
- [ ] **Krok 6:** Render PRONÁJEM: `HALLS.filter(h=>offerOf(h)==='rent' && h.available)` do `#pronajem-hal-grid`, cena měsíční jako dnes (areaOnRequest → „na vyžádání").
- [ ] **Krok 7:** Formulář „Prostor": naplnit `<optgroup label="Prodej">` (sale) + `<optgroup label="Pronájem">` (rent volné) + volba „Celý areál". CTA „Poptat areál" předvybere „Celý areál" a odscrolluje na formulář.
- [ ] **Krok 8:** Mapa: počty/zvýraznění – polygonům přiřadit třídu dle `offerOf` + stavu (`is-sale`/`is-rent`/`is-rented`).
- [ ] **Krok 9 (ověření):** otevřít lokálně přes agent-browser, `eval` zkontrolovat počty karet v obou gridech a několik cen (#18 = „orientačně 27 020 000 Kč").
- [ ] **Krok 10 (commit):** `git add main.js && git commit -m "main.js: offer model, sale pricing, 3 listings, hall #24"`

## Task 5: HTML struktura — 3 sekce (index.html)

**Files:**
- Modify: `index.html` (sekce 03 → 3 sekce; nav; JSON-LD/meta)

- [ ] **Krok 1:** Nahradit sekci `#prostory` třemi sekcemi v pořadí: `#prodej-areal` (banner + 43 000 m² + přednosti + galerie + CTA „Poptat areál"), `#prodej-hal` (header + `#prodej-hal-grid`), `#pronajem` (header + `#pronajem-hal-grid`). Přečíslovat tagy: 01 Vybavení, 02 Mapa, 03 Prodej areálu, 04 Prodej hal, 05 Pronájem, 06 Kontakt.
- [ ] **Krok 2:** Areál sekce: `style="background-image:url(assets/areal/banner.jpg)"` overlay, H2 „Prodej celého areálu", text „43 000 m² pozemku…", bullet přednosti (z existujícího obsahu), CTA tlačítko, galerie z `assets/photos/areal/` (stejný lightbox pattern).
- [ ] **Krok 3:** Horní menu: odkazy Prodej areálu / Prodej hal / Pronájem / Kontakt (kotvy `#prodej-areal` atd.). Aktualizovat i mobilní menu pokud existuje.
- [ ] **Krok 4:** `<title>` + meta description + JSON-LD `description`: doplnit „prodej celého areálu (43 000 m²), prodej i pronájem hal".
- [ ] **Krok 5 (ověření):** agent-browser screenshot celé stránky (struktura, pořadí sekcí); JSON-LD `JSON.parse` validní.
- [ ] **Krok 6 (commit):** `git add index.html && git commit -m "index.html: 3 nabídkové sekce + areal banner + nav + SEO"`

## Task 6: CSS — styly nových sekcí + legenda mapy

**Files:**
- Modify: `style.css`

- [ ] **Krok 1:** Styl areál banneru (overlay, výška, responsivita), CTA, galerie grid.
- [ ] **Krok 2:** Karty prodeje: cena (výrazná), odznak „Pronajato · na prodej i s nájemcem".
- [ ] **Krok 3:** Legenda mapy: třídy `.is-sale`/`.is-rent`/`.is-rented` barvy polygonů + položky legendy (Prodej / Pronájem / Pronajato) místo available/unavailable.
- [ ] **Krok 4 (ověření):** agent-browser screenshot desktop + mobil (375px) všech sekcí + mapy s legendou.
- [ ] **Krok 5 (commit):** `git add style.css && git commit -m "CSS: areal banner, sale cards/badge, map legend"`

## Task 7: Vizuální QA + deploy

**Files:** žádné nové (ověření + deploy)

- [ ] **Krok 1:** agent-browser desktop (1280) + mobil (375): hero (nové video), Prodej areálu (banner+galerie), Prodej hal (ceny+odznaky), Pronájem (jen volné+#24), mapa s legendou, formulář (Celý areál). Screenshoty zkontrolovat Readem.
- [ ] **Krok 2:** Validace: JSON-LD parse; ceny (#16,18,21) správně; počty karet; velikosti (video<100MB, fotky OK).
- [ ] **Krok 3:** Opravit nalezené vady (iterovat) — žádné „done" bez screenshotu.
- [ ] **Krok 4 (deploy):** `git push origin main`; poll živého webu; finální screenshot z `arealfno.cz`.
- [ ] **Krok 5:** Aktualizovat paměť projektu (3 sekce, ceny, nové fotky/video).

---

## Self-review (pokrytí specu)

- §2 struktura → Task 5/6 · §3 kategorizace → Task 4 · §4 ceny → Task 4 · §5 fotky → Task 1 · §6 areál → Task 2/5 · §7 video → Task 3 · §8 mapa → Task 4/6 · §9 nav+formulář → Task 4/5 · §10 SEO → Task 5 · §12 ověření → Task 7. Žádná sekce specu bez tasku.
- Typy/názvy konzistentní: `offerOf`, `salePriceLabel`, `SALE_PRICE_PER_M2`, gridy `#prodej-hal-grid`/`#pronajem-hal-grid` použity shodně v Task 4 i 5.
