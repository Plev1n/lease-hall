# NORMA FnO — Přestavba na 3 sekce + výměna fotek

**Datum:** 2026-06-26
**Web:** arealfno.cz (Vercel, deploy z `main`)
**Status:** Návrh ke schválení

**Záloha (bod návratu):**
- Git tag `backup-2026-06-26-pre-3sections` (na GitHubu)
- Git branch `backup/2026-06-26-pre-3sections` (na GitHubu)
- Lokální kompletní kopie `../lease-hall-BACKUP-2026-06-26/` (i s fotkami)

---

## 1. Cíl a priorita

Předělat web tak, aby **tlačil na PRODEJ** (priorita) před pronájmem, a vyměnit fotky za nové (focení 2026-06-12, fotograf Bujnoch). Tři jasné nabídky v pořadí podle priority:

1. **Prodej celého areálu** (priorita č. 1) — 43 000 m² pozemku, cena a více informací na vyžádání.
2. **Prodej jednotlivých hal** (#16 a výš).
3. **Pronájem hal** (#15 a níž) + nová manipulační plocha #24.

## 2. Struktura stránky (varianta A — schváleno)

```
HERO            claim + CTA  (NOVÉ video NORMA 2)
01  Vybavení areálu                              (beze změny)
02  Mapa areálu      → barevně: Prodej / Pronájem / Pronajato
──────────────────────────────────────────────────────────────
★  PRODEJ CELÉHO AREÁLU        (priorita, výrazný banner)
   43 000 m² pozemku · klíčové přednosti · letecký banner
   „Cena a více informací na vyžádání"        [Poptat areál]
   + malá galerie 6–8 leteckých snímků
──────────────────────────────────────────────────────────────
   PRODEJ HAL (#16+)
   karty: hala · plocha · orient. cena (14 000 Kč/m²)
   pronajaté označené „Pronajato · na prodej i s nájemcem"
──────────────────────────────────────────────────────────────
   PRONÁJEM HAL (#≤15) + manipulační plocha #24
   karty: hala · plocha · 100 Kč/m²/měs   (jen volné)
──────────────────────────────────────────────────────────────
04  Kontakt (formulář + Google mapa)            (beze změny)
```

Priorita = pořadí: areál → prodej hal → pronájem.

## 3. Kategorizace hal

Datový model v `main.js`: pole `offer` odvozené `id >= 16 ? 'sale' : 'rent'`, **výjimka `#24 → 'rent'`** (manipulační plocha).

- **Sekce Prodej hal** = všechny `offer === 'sale'` (i pronajaté — ty s odznakem „na prodej i s nájemcem").
- **Sekce Pronájem** = `offer === 'rent' && available === true` (jen volné).
- **Skryté:** `#1`, `#12` zůstávají skryté. Trafo `#2` a pronajaté pronájmové (`#4, 7, 11, 13`) se v pronájmu nezobrazí.

| Hala | Plocha | offer | Stav | Cena | Nové fotky |
|---|---|---|---|---|---|
| 16 | 1630 m² | sale | volné | ~22 820 000 Kč | 8 |
| 17 | 225 m² | sale | volné | ~3 150 000 Kč | 3 |
| 18 | 1930 m² | sale | volné | ~27 020 000 Kč | 10 |
| 19 | 770 m² | sale | volné | ~10 780 000 Kč | 8 |
| 20 | 470 m² | sale | pronajato | ~6 580 000 Kč (s nájemcem) | 1 |
| 21 | 1020 m² | sale | volné | ~14 280 000 Kč | 5 |
| 23 | na vyžádání | sale | pronajato | na vyžádání (s nájemcem) | 4 |
| 35 | na vyžádání | sale | volné | na vyžádání | 8 |
| 36 | na vyžádání | sale | volné | na vyžádání | 7 |
| 9 | 1060 m² | rent | volné | 100 Kč/m²/měs | 4 |
| 10 | 540 m² | rent | volné | 100 Kč/m²/měs | 3 |
| 15 | 1220 m² | rent | volné | 100 Kč/m²/měs | 8 |
| 3,5,6,8,14 | dle dat | rent | volné | 100 Kč/m²/měs | — (ponechat stávající) |
| 24 | na vyžádání | rent | volné | na vyžádání | 3 (nová) |
| 22.1, 22.2 | na vyžádání | sale | pronajato | na vyžádání (s nájemcem) | — (ponechat stávající) |
| 26 | na vyžádání | sale | volné | na vyžádání | — (ponechat stávající) |

## 4. Ceny

- **Prodej hal:** konstanta `SALE_PRICE_PER_M2 = 14000`. Zobrazení: „{plocha} m² · orientačně {plocha × 14 000} Kč". Bez známé plochy (#23, 35, 36) → „plocha i cena na vyžádání".
- **Pronájem:** 100 Kč/m²/měs (`PRICE_PER_M2`, beze změny). #24 bez plochy → „na vyžádání".
- **Celý areál:** cena na vyžádání (žádné číslo).

## 5. Výměna fotek (pipeline)

Zdroj: `/Users/davidpleva/Projects/PPS/PRIM/PRIM/PNG/NORMA`. Fotky hal 1800×1200 (~900 kB).

**Pipeline (sips, dle paměti):**
- Full: max rozměr ~1800 px, JPEG kvalita ~70 (~300–500 kB) → `assets/photos/<id>/<n>.jpg`
- Náhled: max rozměr 600 px → `assets/photos/<id>/<n>-thumb.jpg`
- Číslování `1, 2, 3…` (stávající konvence)

**Mapování složek → haly:** 9→9, 10→10, „15 - zastřešená plocha"→15, 16→16, 17→17, 18→18, 19→19, 20→20, 21→21, 23→23, 35→35, 36→36, „24 - manipulační plocha"→nová #24.

**Haly bez nových fotek ponechat beze změny:** `#3, 5, 6, 8, 14` (pronájem) a `#22.1, 22.2, 26`.

Po výměně aktualizovat `photos:` počty v `main.js` u dotčených hal a přidat halu `#24`.

## 6. Areál — letecké fotky

- **Banner:** 1 panorama ze složky „areál grafika" (3500 px → ~1920 px) jako výrazné pozadí/banner primární sekce.
- **Galerie:** 6–8 kurátorovaných leteckých snímků (ze složek „Dron" / „web"), full + thumb, do `assets/photos/areal/`.

## 7. Hero video

Nahradit současné hero video novým NORMA 2:
- Vybrat zdroj (HD 74 MB / FullHD 110 MB), re-encode přes `avconvert` (dle paměti) na desktop ~960×540 + mobilní variantu, **< 100 MB** (GitHub/Vercel limit), WebP poster z 1. snímku.
- Zachovat stávající mechanismus `data-src-mobile` v `main.js`.

## 8. Mapa areálu

Legenda + barevné odlišení polygonů podle kategorie: **Prodej** / **Pronájem** / **Pronajato**. Klik → detail haly jako dnes. (Areál jako celek lze zvýraznit obrysem.)

## 9. Navigace + formulář

- **Horní menu:** Prodej areálu / Prodej hal / Pronájem / Kontakt (kotvy na nové sekce).
- **Formulář, pole „Prostor":** přidat volbu „Celý areál" a vizuálně seskupit Prodej / Pronájem.

## 10. SEO / JSON-LD

- `<title>` + meta description doplnit o „prodej celého areálu (43 000 m²)" a „prodej i pronájem hal".
- JSON-LD `description` sladit s novým zaměřením. (Volitelně `makesOffer`.)
- Sitemap beze změny (jednostránkový web).

## 11. Mimo rozsah (non-goals)

- Kontakty, e-mail, Google mapa embed (už hotovo dříve).
- Texty sekce „01 Vybavení" — zůstávají.
- Fotky #22/#26 (ve zdroji nejsou).

## 12. Ověření (před deploy)

- `agent-browser` screenshoty **desktop + mobil**: hero (nové video), všechny 3 nové sekce, galerie areálu, několik karet s cenami, mapa s legendou.
- Validace JSON-LD (parse + správná čísla/ceny).
- Kontrola velikostí: video < 100 MB, fotky full ~300–500 kB.
- Teprve pak commit + push do `main` a ověření na živém webu.

## 13. Rollback

`git checkout backup-2026-06-26-pre-3sections` nebo přepsat `main` na tento tag a redeploynout. Lokální kopie `../lease-hall-BACKUP-2026-06-26/`.
