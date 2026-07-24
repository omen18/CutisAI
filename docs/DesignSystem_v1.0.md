# CutisAI — UI/UX Design System Document
**Version:** 1.0 | **Date:** March 2026 | **For:** Vibe Coder Handoff | **Author:** Yash Raj Sharan <yashraj10messi@gmail.com>

> Doctor Panel + User Panel — Complete Design Specification. Build exactly what is written — do not improvise aesthetics.

---

## 1. Design Philosophy & Aesthetic Direction

CutisAI's visual identity is built on a single governing idea: **the authority and warmth of a premium medical journal combined with the clarity of modern clinical software.** It should feel like something a specialist would trust — credible, refined, never cold or sterile.

### 1.1 Aesthetic Keywords

| Keyword | Description |
|---|---|
| **Warm Authority** | The palette uses deep burgundy and ivory — not blue and white. This intentional departure from generic medical blue communicates expertise without clinical coldness. |
| **Editorial Serif + Geometric Sans** | Two font families work in contrast: a serif for display moments (headings, large numbers, brand name) and a geometric sans for all UI body text. The tension between them creates visual interest. |
| **Cream, Not White** | Backgrounds are warm ivory (`#FAF7F2`), not pure white. Cards sit on this surface in clean white (`#FFFFFF`). The layering creates depth without shadows. |
| **Semantic Color Only** | Every accent color carries a fixed meaning. Burgundy = brand/primary. Rose = malignant/risk. Sage green = benign/safe. Gold = in-progress/warning. Never use these colors decoratively. |
| **Purposeful Restraint** | No gradients on UI surfaces. No drop shadows. No glows. Borders are 1px maximum. Whitespace does the heavy lifting. |

### 1.2 Two Panels, One Design Language

The **Doctor Panel** and **User Panel** share an identical design language — same fonts, same colors, same components — but differ in information density and navigational complexity.

- **Doctor Panel:** data-dense, sidebar navigation, multiple columns
- **User Panel:** simplified single-column experience focused on upload → result workflow

A user should instantly recognise both as the same product.

---

## 2. Typography System

### 2.1 Font Families

Add this import at the top of your global CSS:

```css
@import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Geist:wght@300;400;500;600&family=Geist+Mono:wght@400;500&display=swap');
```

| Role | Font Family |
|---|---|
| Display / Serif | **Instrument Serif** |
| Body / UI Sans | **Geist** |
| Code / Mono / Data | **Geist Mono** |

### 2.2 Type Scale

| Role | Font Family | Size / Weight / Color |
|---|---|---|
| Logo name | Instrument Serif | 18px / regular / `#FAF7F2` — topbar only |
| Page title (h1) | Instrument Serif | 26px / regular / `#4A1228` |
| Card title | Instrument Serif | 15px / regular / `#4A1228` — every card header |
| KPI number | Instrument Serif | 30px / regular / `#4A1228` — large stat numbers |
| Diagnosis value | Instrument Serif | 24px / regular / `#4A1228` — 'Malignant' / 'Benign' |
| Body / UI labels | Geist | 12–13px / 500 / `#3D4F5C` |
| Small labels / tags | Geist | 10–11px / 600 / varies — UPPERCASE badge text |
| Navigation items | Geist | 12px / 500 / `#8A7E75` → `#3D4F5C` on hover |
| Data values / IDs | Geist Mono | 11–12px / 400–500 / `#3D4F5C` |
| Micro labels | Geist Mono | 9–10px / 500 / `#A89D94` — letter-spacing: 1.2px, UPPERCASE |

### 2.3 Typography Rules

- **Never** use Instrument Serif for body copy, buttons, or navigation. It is display-only.
- **Never** use Geist Mono for headings or flowing paragraphs. It is data and code only.
- KPI numbers and the page title **always** use Instrument Serif — this creates the 'editorial number' feel.
- All caps text must use `letter-spacing: 1.2px` minimum.
- Font weight 300 (Geist Light) is used only for de-emphasised supporting copy.
- Font weight 600 (Geist Semibold) is used for button labels and important UI labels only.

> ⚠️ **Critical:** Do not substitute Instrument Serif with any other font. The warmth of this specific typeface is load-bearing for the aesthetic. If it fails to load, fall back to `Georgia`.

---

## 3. Color System

### 3.1 CSS Custom Properties — Paste into `:root`

```css
:root {
  /* ── Backgrounds ───────────────────────── */
  --bg:       #FAF7F2;   /* Page background — warm ivory */
  --bg2:      #F3EDE3;   /* Hover / subtle fill */
  --bg3:      #EDE4D6;   /* Active / pressed fill */
  --card:     #FFFFFF;   /* Card surface */

  /* ── Brand — Burgundy ──────────────────── */
  --burg:     #6B1E3A;   /* Primary brand accent */
  --burg2:    #8B2850;   /* Hover state of brand */
  --burg3:    #4A1228;   /* Darkest — headings, topbar bg */

  /* ── Semantic ──────────────────────────── */
  --rose:     #C9637A;   /* Malignant / risk / alert */
  --rose2:    #E8A0AF;   /* Rose light — topbar pulse dot */
  --sage:     #4A6741;   /* Benign / safe / success */
  --sage2:    #6B9463;   /* Sage lighter variant */
  --gold:     #B8860B;   /* In-progress / warning */
  --gold2:    #D4A017;   /* Gold lighter variant */

  /* ── Neutrals ──────────────────────────── */
  --slate:    #3D4F5C;   /* Primary body text */
  --slate2:   #5A6E7A;   /* Secondary body text */
  --muted:    #8A7E75;   /* Muted / de-emphasised */
  --muted2:   #A89D94;   /* Lighter muted */
  --muted3:   #C4BAB0;   /* Placeholder / hint */

  /* ── Borders ───────────────────────────── */
  --line:     rgba(107,30,58,0.10);   /* Default border */
  --line2:    rgba(107,30,58,0.18);   /* Hover border */
}
```

### 3.2 Color Semantics — Never Break These Rules

| Color | Meaning | Allowed Uses |
|---|---|---|
| `--burg` `#6B1E3A` | Brand primary | Buttons, sidebar active state, progress bars, KPI stripes, topbar text elements |
| `--burg3` `#4A1228` | Deepest brand | Topbar background, all major headings, KPI numbers |
| `--rose` `#C9637A` | Risk / malignant | Malignant badges, high-risk tags, alert borders, confidence bars for malignant class |
| `--sage` `#4A6741` | Safe / benign | Benign badges, model performance positive metrics, success states |
| `--gold` `#B8860B` | In progress / caution | Running/processing badges, progress animation, queued analysis states |
| `--slate` `#3D4F5C` | Body text | All body copy, table data cells, sidebar labels (non-active) |
| `--muted` `#8A7E75` | De-emphasised | Sidebar group labels, timestamp text, secondary metadata |
| `--bg` `#FAF7F2` | Page surface | Only the outermost page background and upload zone fill. Never for cards. |
| `--card` `#FFFFFF` | Card surface | All card backgrounds, sidebar background |

### 3.3 Approved Color Combinations

| Element | Combination |
|---|---|
| Topbar background | `#4A1228` bg / `#FAF7F2` text / `rgba(250,247,242,0.5)` inactive nav text |
| Primary button | `#6B1E3A` bg / `#FAF7F2` text / hover: `#8B2850` |
| Malignant badge | `rgba(201,99,122,0.10)` bg / `#C9637A` text |
| Benign badge | `rgba(74,103,65,0.10)` bg / `#4A6741` text |
| Running badge | `rgba(184,134,11,0.10)` bg / `#B8860B` text |
| Active sidebar item | `rgba(107,30,58,0.07)` bg / `#6B1E3A` text |
| KPI card stripe | 2px bottom border in semantic color per KPI type |
| Card border | `1px solid rgba(107,30,58,0.10)` |
| Upload zone | `#FAF7F2` bg / `1.5px dashed #C4BAB0` border / hover: rose border |
| Recommendation box (malignant) | `rgba(201,99,122,0.06)` bg / `rgba(201,99,122,0.18)` border / rose title |
| Recommendation box (benign) | `rgba(74,103,65,0.06)` bg / `rgba(74,103,65,0.18)` border / sage title |

---

## 4. Layout & Spacing System

### 4.1 Page Layout Structure

| Element | Value |
|---|---|
| Topbar height | `52px` — fixed, never scrolls |
| Sidebar width | `192px` — fixed (Doctor Panel only) |
| Main content padding | `20px` top/bottom, `24px` left/right |
| Content gap | `18px` between major layout blocks |
| Card `border-radius` | `14px` |
| Inner element radius | `7–8px` — buttons, badges, metric mini-cards |

### 4.2 Spacing Scale

| Token | Value | Used For |
|---|---|---|
| `--space-xs` | 4px | Badge padding horizontal |
| `--space-sm` | 7–8px | Button icon gap, small internal gaps |
| `--space-md` | 12px | Card compact padding, feed item gaps |
| `--space-lg` | 14–16px | Card section padding, grid column gap |
| `--space-xl` | 18–20px | Major layout block gap, upload zone horizontal padding |
| `--space-2xl` | 24px | Main content horizontal padding, large card padding |
| `--space-3xl` | 32px | Upload zone vertical padding |

### 4.3 Grid Definitions

```css
/* KPI row — Doctor Panel */
.kpi-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
}

/* Main 2-column grid */
.main-grid {
  display: grid;
  grid-template-columns: 1fr 320px;
  gap: 16px;
}

/* Bottom 3-column grid */
.bottom-grid {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 14px;
}

/* KPI row — User Panel (3 stats) */
.kpi-row-user {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}

/* User panel — single column centered */
.user-panel-content {
  max-width: 640px;
  margin: 0 auto;
  padding: 32px 24px;
}

/* Metric mini-grid — inside result card */
.metric-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 7px;
}
```

---

## 5. Component Library

### 5.1 Topbar

> The topbar is the only dark surface in the UI. Everything else is warm light.

```css
.topbar {
  height: 52px;
  background: #4A1228;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  border-bottom: 1px solid rgba(255,255,255,0.06);
  position: sticky;
  top: 0;
  z-index: 10;
}

.logo-name {
  font-family: 'Instrument Serif', Georgia, serif;
  font-size: 18px;
  color: #FAF7F2;
}

.logo-version {
  font-family: 'Geist Mono', monospace;
  font-size: 10px;
  color: rgba(250,247,242,0.4);
  letter-spacing: 1px;
  margin-left: 6px;
}

/* Nav pill states */
.nav-pill          { padding: 5px 13px; border-radius: 5px; font: 500 12px 'Geist'; color: rgba(250,247,242,0.5); background: transparent; }
.nav-pill:hover    { color: rgba(250,247,242,0.9); background: rgba(255,255,255,0.07); }
.nav-pill.active   { color: #FAF7F2; background: rgba(255,255,255,0.12); }

/* Status indicator */
.status-dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: #E8A0AF;
  animation: blink 2s ease-in-out infinite;
}
@keyframes blink { 0%,100%{opacity:1;} 50%{opacity:0.3;} }

/* Avatar */
.avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: #C9637A;
  font: 600 11px 'Geist';
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
}
```

---

### 5.2 Sidebar (Doctor Panel only)

```css
.sidebar {
  width: 192px;
  background: #FFFFFF;
  border-right: 1px solid rgba(107,30,58,0.10);
  padding: 16px 10px;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.sidebar-group-label {
  font: 600 9px 'Geist';
  letter-spacing: 1.8px;
  text-transform: uppercase;
  color: #C4BAB0;
  padding: 10px 10px 4px;
  margin-top: 4px;
}

.sidebar-item           { padding: 7px 10px; border-radius: 7px; font: 500 12px 'Geist'; color: #8A7E75; gap: 9px; }
.sidebar-item:hover     { color: #3D4F5C; background: #F3EDE3; }
.sidebar-item.active    { color: #6B1E3A; background: rgba(107,30,58,0.07); }
.sidebar-item svg       { width: 14px; height: 14px; opacity: 0.8; }

.sidebar-badge-green    { font: 500 9px 'Geist Mono'; padding: 2px 6px; border-radius: 4px; background: rgba(74,103,65,0.12); color: #4A6741; }
.sidebar-badge-rose     { background: rgba(201,99,122,0.12); color: #C9637A; }
```

---

### 5.3 Card Container

```css
.card {
  background: #FFFFFF;
  border: 1px solid rgba(107,30,58,0.10);
  border-radius: 14px;
  overflow: hidden;
  transition: border-color 0.2s ease;
}
.card:hover { border-color: rgba(107,30,58,0.18); }

.card-header {
  padding: 14px 18px;
  border-bottom: 1px solid rgba(107,30,58,0.10);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-title {
  font-family: 'Instrument Serif', Georgia, serif;
  font-size: 15px;
  color: #4A1228;
}
```

---

### 5.4 Badge / Tag Variants

```css
/* Base badge */
.badge {
  font: 600 9px 'Geist';
  letter-spacing: 1px;
  text-transform: uppercase;
  padding: 3px 8px;
  border-radius: 5px;
}

/* Card-level tags */
.tag-risk     { background: rgba(201,99,122,0.10); color: #C9637A; }
.tag-running  { background: rgba(184,134,11,0.10);  color: #B8860B; }
.tag-live     { background: rgba(74,103,65,0.10);   color: #4A6741; }
.tag-brand    { background: rgba(107,30,58,0.08);   color: #6B1E3A; }

/* Table row badges */
.badge-malignant { background: rgba(201,99,122,0.10); color: #993556; padding: 2px 7px; border-radius: 4px; letter-spacing: 0.5px; }
.badge-benign    { background: rgba(74,103,65,0.10);  color: #3B6D11; padding: 2px 7px; border-radius: 4px; letter-spacing: 0.5px; }
```

---

### 5.5 KPI Card

```css
.kpi-card {
  background: #FFFFFF;
  border: 1px solid rgba(107,30,58,0.10);
  border-radius: 12px;
  padding: 14px 16px;
  position: relative;
  overflow: hidden;
  transition: border-color 0.2s;
}
.kpi-card:hover { border-color: rgba(107,30,58,0.18); }

/* Bottom stripe — change color per KPI */
.kpi-stripe {
  position: absolute;
  bottom: 0; left: 0; right: 0;
  height: 2px;
}
/* Total analyses */    .kpi-stripe-burg  { background: #6B1E3A; }
/* Malignant flags */   .kpi-stripe-rose  { background: #C9637A; }
/* Model accuracy */    .kpi-stripe-sage  { background: #4A6741; }
/* Avg inference */     .kpi-stripe-gold  { background: #B8860B; }

.kpi-label {
  font: 600 10px 'Geist';
  letter-spacing: 1.2px;
  text-transform: uppercase;
  color: #A89D94;
  margin-bottom: 8px;
}

.kpi-value {
  font-family: 'Instrument Serif', Georgia, serif;
  font-size: 30px;
  color: #4A1228;
  line-height: 1;
  letter-spacing: -0.5px;
}

.kpi-sub         { font: 400 11px 'Geist Mono'; color: #A89D94; margin-top: 5px; }
.kpi-delta-up    { color: #4A6741; } /* positive change */
.kpi-delta-down  { color: #C9637A; } /* negative change */
```

---

### 5.6 Primary Button

```css
.btn-primary {
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 9px 18px;
  border-radius: 8px;
  background: #6B1E3A;
  color: #FAF7F2;
  border: none;
  font: 600 12px 'Geist';
  letter-spacing: 0.2px;
  cursor: pointer;
  transition: background 0.15s ease;
}
.btn-primary:hover  { background: #8B2850; }
.btn-primary svg    { width: 13px; height: 13px; }

/* Full-width variant — User Panel */
.btn-primary-full { width: 100%; justify-content: center; padding: 11px 18px; }
```

---

### 5.7 Upload Zone

```css
.upload-zone {
  margin: 18px;
  border: 1.5px dashed #C4BAB0;
  border-radius: 10px;
  padding: 32px 20px;
  text-align: center;
  cursor: pointer;
  background: #FAF7F2;
  transition: all 0.2s ease;
}
.upload-zone:hover {
  border-color: #C9637A;
  background: rgba(201,99,122,0.03);
}

.upload-icon-wrapper {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  background: rgba(107,30,58,0.07);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 12px;
}
.upload-icon-wrapper svg { width: 20px; height: 20px; color: #6B1E3A; stroke-width: 1.7; }

.upload-title {
  font-family: 'Instrument Serif', Georgia, serif;
  font-size: 16px;
  color: #4A1228;
  margin-bottom: 4px;
}
.upload-subtitle { font: 400 12px 'Geist'; color: #A89D94; }

.upload-format-pill {
  background: #F3EDE3;
  border: 1px solid rgba(107,30,58,0.10);
  color: #8A7E75;
  font: 600 10px 'Geist Mono';
  padding: 3px 8px;
  border-radius: 5px;
}
```

---

### 5.8 Active Analysis Row

```css
.analysis-row {
  display: flex;
  gap: 12px;
  padding: 14px 18px;
  border-top: 1px solid rgba(107,30,58,0.10);
  align-items: center;
}

/* Thumbnail — simulated dermoscopy photo */
.analysis-thumb {
  width: 52px;
  height: 52px;
  border-radius: 8px;
  overflow: hidden;
  position: relative;
  flex-shrink: 0;
  /* Simulated dermoscopy: radial gradient from tan to dark brown */
  background: radial-gradient(circle at 60% 45%, #D4956A 0%, #8B4513 45%, #3D2010 100%);
}
.analysis-thumb::after {
  content: '';
  position: absolute;
  inset: 0;
  border: 1.5px solid rgba(201,99,122,0.6);
  border-radius: 8px;
}

.analysis-filename { font: 600 12px 'Geist'; color: #3D4F5C; }
.analysis-stage    { font: 400 10px 'Geist Mono'; color: #A89D94; margin-top: 2px; }

/* Animated progress bar */
.progress-track { height: 2px; background: #F3EDE3; border-radius: 2px; margin-top: 8px; overflow: hidden; }
.progress-fill  {
  height: 100%;
  background: #6B1E3A;
  border-radius: 2px;
  animation: progress-pulse 2s ease-in-out infinite alternate;
}
@keyframes progress-pulse { from { width: 40%; } to { width: 80%; } }
```

---

### 5.9 Result Panel

```css
/* Simulated lesion image — radial gradient for photo effect */
.result-image-area {
  margin: 14px;
  border-radius: 10px;
  overflow: hidden;
  height: 150px;
  position: relative;
  background: radial-gradient(ellipse at 58% 48%, #C4835A 0%, #8B4A20 30%, #4A2010 65%, #1E0E08 100%);
}

/* Tinted mask overlay */
.result-mask-overlay {
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse at 58% 48%, rgba(107,30,58,0.25) 0%, rgba(107,30,58,0.1) 50%, transparent 75%);
}

/* Organic segmentation ring — irregular ellipse */
.result-seg-ring {
  position: absolute;
  top: 50%; left: 57%;
  transform: translate(-50%, -50%);
  width: 84px;
  height: 70px;
  border: 1.5px solid rgba(201,99,122,0.75);
  border-radius: 50% 55% 48% 52% / 52% 48% 55% 50%;
}

/* View tabs */
.result-tab        { padding: 5px 11px; border-radius: 6px; font: 500 11px 'Geist'; color: #A89D94; cursor: pointer; }
.result-tab.active { background: rgba(107,30,58,0.07); color: #6B1E3A; }

/* Diagnosis */
.diagnosis-label { font: 600 9px 'Geist'; letter-spacing: 1.5px; text-transform: uppercase; color: #A89D94; margin-bottom: 6px; }
.diagnosis-value {
  font-family: 'Instrument Serif', Georgia, serif;
  font-size: 24px;
  color: #4A1228;
  display: flex;
  align-items: center;
  gap: 8px;
}
.diagnosis-icon {
  width: 26px; height: 26px;
  border-radius: 50%;
  background: rgba(201,99,122,0.10); /* malignant */
  display: flex; align-items: center; justify-content: center;
}
.diagnosis-icon svg { width: 12px; height: 12px; color: #C9637A; }

/* Benign variant */
.diagnosis-icon.benign { background: rgba(74,103,65,0.10); }
.diagnosis-icon.benign svg { color: #4A6741; }

/* Confidence bars */
.conf-track { height: 4px; background: #F3EDE3; border-radius: 4px; overflow: hidden; margin-bottom: 5px; }
.conf-fill-malignant { height: 100%; border-radius: 4px; background: #C9637A; }
.conf-fill-benign    { height: 100%; border-radius: 4px; background: #C4BAB0; }

/* Metric mini-cards */
.metric-mini {
  background: #FAF7F2;
  border-radius: 8px;
  padding: 9px 11px;
}
.metric-mini-label { font: 600 9px 'Geist'; letter-spacing: 0.8px; text-transform: uppercase; color: #A89D94; margin-bottom: 3px; }
.metric-mini-value { font: 500 15px 'Geist Mono'; color: #4A1228; }
.metric-mini-value.primary { color: #6B1E3A; }

/* Recommendation box */
.recommendation {
  background: rgba(201,99,122,0.06);
  border: 1px solid rgba(201,99,122,0.18);
  border-radius: 8px;
  padding: 11px 13px;
  margin-top: 12px;
}
.recommendation.benign {
  background: rgba(74,103,65,0.06);
  border-color: rgba(74,103,65,0.18);
}
.recommendation-title { font: 600 9px 'Geist'; letter-spacing: 1.2px; text-transform: uppercase; color: #C9637A; margin-bottom: 5px; }
.recommendation.benign .recommendation-title { color: #4A6741; }
.recommendation-body  { font: 400 11px 'Geist'; color: #A89D94; line-height: 1.55; }
```

---

### 5.10 Data Table

```css
.data-table { width: 100%; border-collapse: collapse; }

.data-table th {
  font: 600 9px 'Geist';
  letter-spacing: 1.2px;
  text-transform: uppercase;
  color: #C4BAB0;
  padding: 9px 16px;
  text-align: left;
  border-bottom: 1px solid rgba(107,30,58,0.10);
}

.data-table td {
  font: 400 12px 'Geist';
  color: #8A7E75;
  padding: 9px 16px;
  border-bottom: 1px solid rgba(107,30,58,0.05);
  vertical-align: middle;
}

.data-table tr:hover td { background: #FAF7F2; color: #3D4F5C; }

/* First column — File ID */
.data-table td:first-child { font: 500 11px 'Geist Mono'; color: #3D4F5C; }
```

---

### 5.11 Bar Chart (Weekly Volume)

```css
.bar-chart-container {
  display: flex;
  align-items: flex-end;
  gap: 4px;
  height: 72px;
  padding: 0 18px;
}

.bar {
  flex: 1;
  border-radius: 3px 3px 0 0;
  background: #4A1228;   /* --burg3 */
  cursor: pointer;
  transition: opacity 0.2s;
}
.bar:hover     { opacity: 0.75; }
.bar.peak      { opacity: 1.0; }      /* highest value day */
.bar.high      { opacity: 0.65; }
.bar.mid       { opacity: 0.50; }
.bar.low       { opacity: 0.35; }

.bar-x-labels {
  display: flex;
  gap: 4px;
  padding: 3px 18px 14px;
}
.bar-x-label {
  flex: 1;
  font: 400 9px 'Geist Mono';
  color: #C4BAB0;
  text-align: center;
  letter-spacing: 0.5px;
  text-transform: uppercase;
}
```

---

### 5.12 Performance Metrics List

```css
.perf-list { padding: 6px 16px 14px; display: flex; flex-direction: column; gap: 9px; }

.perf-row { display: flex; align-items: center; gap: 9px; }
.perf-name  { width: 72px; font: 500 11px 'Geist'; color: #A89D94; flex-shrink: 0; }
.perf-track { flex: 1; height: 3px; background: #F3EDE3; border-radius: 3px; overflow: hidden; }
.perf-fill  { height: 100%; border-radius: 3px; }

/* Fill colors by metric type */
.perf-fill-burg  { background: #6B1E3A; } /* AUC-ROC, DSC */
.perf-fill-rose  { background: #C9637A; } /* Sensitivity, Specificity */
.perf-fill-sage  { background: #4A6741; } /* F1, IoU */

.perf-value { width: 38px; text-align: right; font: 500 11px 'Geist Mono'; color: #3D4F5C; }
```

---

### 5.13 Activity Feed

```css
.feed-list { padding: 6px 16px 14px; display: flex; flex-direction: column; }

.feed-item {
  display: flex;
  gap: 11px;
  padding: 9px 0;
  border-bottom: 1px solid rgba(107,30,58,0.08);
}
.feed-item:last-child { border-bottom: none; }

.feed-dot { width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; margin-top: 5px; }
.feed-dot-risk  { background: #C9637A; } /* malignant events */
.feed-dot-brand { background: #6B1E3A; } /* system/model updates */
.feed-dot-safe  { background: #4A6741; } /* benign results */
.feed-dot-warn  { background: #B8860B; } /* dataset / caution events */

.feed-text      { font: 400 11px 'Geist'; color: #A89D94; line-height: 1.45; }
.feed-text b    { font-weight: 600; color: #3D4F5C; }
.feed-timestamp { font: 400 10px 'Geist Mono'; color: #C4BAB0; margin-top: 3px; }
```

---

## 6. Doctor Panel — Page Specifications

### 6.1 Dashboard Page Structure

```
Topbar (sticky, 52px)
└── Body (display: flex)
    ├── Sidebar (192px)
    └── Main content (flex: 1, padding: 20px 24px, gap: 18px)
        ├── Page header row
        │   ├── Left: micro tag + h1 title + date/status
        │   └── Right: primary "New analysis" button
        ├── KPI row (4 cards)
        ├── Main 2-col grid
        │   ├── Left column (stacked)
        │   │   ├── Image Analysis card (upload zone + active row)
        │   │   └── Recent History card (data table)
        │   └── Right column (320px)
        │       └── Result Panel card
        └── Bottom 3-col grid
            ├── Weekly Volume card
            ├── Model Performance card
            └── Activity Feed card
```

### 6.2 KPI Cards Data

| Card | Example Value | Stripe Color |
|---|---|---|
| Total analyses | 2,847 / +12.4% this month | `#6B1E3A` |
| Malignant flags | 341 / +3.1% vs prior | `#C9637A` |
| Model accuracy | 91.7% / AUC-ROC 0.94 | `#4A6741` |
| Avg inference | 1.8s / −0.3s vs baseline | `#B8860B` |

### 6.3 Page Header

- **Left:** micro tag in `--rose`, uppercase, Geist 10px (`Clinical Platform`)
- **Left:** Instrument Serif 26px h1: `Good morning, Dr. [Name]`
- **Left:** Geist Mono 11px muted: date and queue status
- **Right:** Primary button `New analysis` with `+` icon

---

## 7. User Panel — Page Specifications

### 7.1 User Panel Layout

```
Topbar (same component — nav: Home / My Results / About)
└── Page content (max-width: 640px; margin: 0 auto; padding: 32px 24px)
    ├── Hero header section
    ├── Upload card
    ├── How it works (3-card row)
    └── Trust indicators (3 stats)
```

**No sidebar on the User Panel.**

### 7.2 User Panel Pages

| Route | Purpose |
|---|---|
| `/` | Home / Upload — primary experience |
| `/result` | Result page — state-driven, same URL |
| `/history` | Past uploads and results |
| `/about` | Static info + clinical disclaimer |

### 7.3 Home Page — Section Breakdown

#### Section 1 — Hero Header
- Micro tag (rose, uppercase, Geist 10px): `AI Skin Lesion Screening`
- Heading (Instrument Serif 32px, `#4A1228`): `Check your skin lesion in seconds`
- Subheading (Geist 14px, `#8A7E75`): descriptive subtitle
- Disclaimer (Geist 11px, italic, `#A89D94`): legal/clinical caveat

#### Section 2 — Upload Card
- Same card component as Doctor Panel
- Upload zone: `padding: 48px 24px` (larger than Doctor Panel)
- Title: `Drop your photo here` (Instrument Serif 18px)
- Subtitle: `JPEG, PNG, TIFF — up to 20 MB`
- Tip pills: `Good lighting` / `Lesion centered` / `No blur`
- Full-width primary button inside card: `Analyse now`

#### Section 3 — How It Works (3-card row)
- Each card: step number (Geist Mono 11px, rose), icon circle (42px), Instrument Serif heading (14px), body (Geist 11px, muted)
- Step 1: Upload photo
- Step 2: AI analyses lesion
- Step 3: Get your result

#### Section 4 — Trust Indicators
- 3 stats: `33K+ images trained on` / `91.7% accuracy` / `<2s inference`
- Same KPI structure without stripe or border

---

### 7.4 Result Page

```
Topbar
└── Page content (max-width: 640px, centered)
    ├── Back link: "← Analyse another image"
    ├── Result header (micro tag + Instrument Serif h1 + timestamp)
    ├── Result card (image + diagnosis + confidence + metrics + recommendation)
    ├── "Understanding your result" card (plain language explanation)
    └── "Recommended next steps" card (numbered list + action buttons)
```

### 7.5 Malignant vs Benign State Differences

| Element | Malignant | Benign |
|---|---|---|
| Result header tag | Rose — `High risk detected` | Sage — `Low risk detected` |
| Diagnosis icon circle | `rgba(201,99,122,0.10)` | `rgba(74,103,65,0.10)` |
| Recommendation box | Rose border/bg | Sage border/bg |
| Next steps step 1 color | Rose | Sage |
| Step 1 text | `Book an urgent dermatologist appointment` | `Continue regular skin checks` |

---

## 8. Interaction States & Animations

### 8.1 Hover States

| Element | State |
|---|---|
| Card | `border-color` → `rgba(107,30,58,0.18)` |
| Sidebar item | `background: #F3EDE3; color: #3D4F5C` |
| Topbar nav pill | `color: rgba(250,247,242,0.9); background: rgba(255,255,255,0.07)` |
| Upload zone | `border-color: #C9637A; background: rgba(201,99,122,0.03)` |
| History table row | All TDs: `background: #FAF7F2; color: #3D4F5C` |
| Bar chart bar | `opacity: 0.75` |
| Primary button | `background: #8B2850` |

### 8.2 Transition Speeds

| Element | Transition |
|---|---|
| Buttons, sidebar items, nav pills | `all: 0.15s ease` |
| Card border | `border-color: 0.2s ease` |
| Upload zone | `all: 0.2s ease` |

### 8.3 Animations

```css
/* Progress bar — active analysis */
@keyframes progress-pulse {
  from { width: 40%; }
  to   { width: 80%; }
}
.progress-fill { animation: progress-pulse 2s ease-in-out infinite alternate; }

/* Topbar status dot */
@keyframes blink {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0.3; }
}
.status-dot { animation: blink 2s ease-in-out infinite; }

/* Loading spinner (upload zone) */
@keyframes spin { to { transform: rotate(360deg); } }
.spinner {
  width: 24px; height: 24px;
  border: 2px solid rgba(107,30,58,0.15);
  border-top-color: #6B1E3A;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
```

> ⚠️ Wrap all animations in `@media (prefers-reduced-motion: no-preference)` to disable by default for users with motion sensitivity.

### 8.4 Empty & Loading States

| State | Treatment |
|---|---|
| No result yet | Faint dashed border rectangle + Instrument Serif italic 14px muted: `Upload an image to see results` |
| Loading (upload) | Replace zone with centered spinner |
| Button loading | Replace text with `Analysing...`, disable pointer-events |
| No history | Centered Instrument Serif italic 14px muted: `No analyses yet` |

---

## 9. Responsive Behaviour

### 9.1 Breakpoints

| Breakpoint | Width | Notes |
|---|---|---|
| Desktop (primary) | ≥ 1280px | All layouts as specified |
| Tablet | 768px–1279px | Apply adaptations below |
| Mobile | < 768px | Not required for v1 — show `Best viewed on desktop` |

### 9.2 Tablet Adaptations

| Element | Adaptation |
|---|---|
| Sidebar | Collapse to 48px icon-only. Hover shows tooltip. |
| KPI row | 4-col → 2×2 grid |
| Main 2-col grid | Stack vertically (analysis first, result second) |
| Bottom 3-col grid | Stack to single column |
| User panel | `max-width: 100%; padding: 24px 16px` |
| How it works row | 3-col → single column |
| Topbar nav | Hide label text, show icons only |

---

## 10. Accessibility Requirements

| Requirement | Implementation |
|---|---|
| Color contrast | All text must meet WCAG AA (4.5:1 normal, 3:1 large text) |
| Focus rings | `box-shadow: 0 0 0 2px #6B1E3A` on all interactive elements on `:focus` |
| Image alt text | Lesion image: `alt="Dermoscopic image with AI segmentation overlay"` |
| Form labels | File input must have visible `<label>` and `aria-label` |
| Screen reader | Diagnosis result must use `aria-live="polite"` when inference completes |
| Keyboard nav | Tab order follows visual reading order. Upload zone activatable via `Enter`. |
| Reduced motion | Wrap all animations in `@media (prefers-reduced-motion: no-preference)` |

---

## 11. Implementation Notes

### 11.1 CSS Architecture

- Define **all** CSS custom properties in `:root` (Section 3.1). Never hardcode hex values in component styles.
- Use CSS Grid for all multi-column page-level layouts.
- Use Flexbox only for row-level alignment within components.

### 11.2 Font Loading

```css
/* In your global CSS, set the base font: */
body {
  font-family: 'Geist', sans-serif;
  /* All text defaults to Geist. Apply Instrument Serif only where specified. */
}
```

Apply `font-family: 'Instrument Serif', Georgia, serif` only to:
- `.logo-name`
- `.page-title` (h1)
- `.card-title`
- `.kpi-value`
- `.diagnosis-value`
- `.upload-title`

### 11.3 Component Build Order

1. CSS variables + base styles (`body`, `*`)
2. Topbar
3. Sidebar
4. Card container + card header
5. Badge variants
6. KPI card
7. Primary button
8. Upload zone
9. Active analysis row
10. Result panel (all sub-components)
11. Data table
12. Bar chart, Performance list, Activity feed
13. User Panel pages (built on shared components above)

### 11.4 Do Not

- ❌ Do not add gradients to UI surfaces
- ❌ Do not add `box-shadow` to cards (borders only)
- ❌ Do not change the font families
- ❌ Do not use `#000` or `#333` for text — use `--slate` or `--muted` values
- ❌ Do not use pure white (`#FFF`) for the page background — use `--bg` (`#FAF7F2`)
- ❌ Do not add hover animations beyond color/opacity transitions
- ❌ Do not invent new components not specified here

> 💡 **The aesthetic lives entirely in the color palette and the Instrument Serif / Geist font pairing. Get those two right and the rest follows.**

---

## 12. Quick Reference Card

### Fonts

| Role | Font |
|---|---|
| Display / headings / KPI numbers | `Instrument Serif` (fallback: Georgia) |
| All UI body, buttons, labels, nav | `Geist` |
| Data, IDs, timestamps, mono values | `Geist Mono` |

### Colors

| Hex | Usage |
|---|---|
| `#4A1228` | Topbar bg, all headings, KPI numbers |
| `#6B1E3A` | Primary button, sidebar active, progress bars |
| `#8B2850` | Button hover only |
| `#C9637A` | Malignant badge, risk alerts, confidence bar |
| `#4A6741` | Benign badge, success states, positive metrics |
| `#B8860B` | Running/in-progress states |
| `#3D4F5C` | Primary body text |
| `#8A7E75` | Muted text, sidebar inactive |
| `#A89D94` | Metadata, timestamps, subtitles |
| `#C4BAB0` | Placeholders, axis labels, group labels |
| `#FAF7F2` | Page background, upload zone fill |
| `#FFFFFF` | All card surfaces, sidebar background |

### Spacing & Shape

| Property | Value |
|---|---|
| Card `border-radius` | `14px` |
| Button `border-radius` | `8px` |
| Badge `border-radius` | `5px` (card tags) / `4px` (table badges) |
| Sidebar item `border-radius` | `7px` |
| Topbar height | `52px` |
| Sidebar width | `192px` |
| Main content padding | `20px 24px` |
| Card header padding | `14px 18px` |
| Card border | `1px solid rgba(107,30,58,0.10)` |
| Transition speed | `0.15s ease` (UI) / `0.2s ease` (zones + card border) |

---

*End of Design System Document — Build exactly what is specified.*
