# Kitchen Inventory App — Project Context

## Overview
Household kitchen inventory tracker. Tracks items with quantities, categories, expiry dates, low-stock alerts, daily consumption/refill logging, and an activity log.

## Tech Stack
- **Backend**: PHP 8 + MySQL on Hostinger shared hosting
- **Frontend**: Plain HTML, CSS, JavaScript (no frameworks, no build tools)
- **Font**: Plus Jakarta Sans via Google Fonts (loaded in CSS)
- **Hosting**: Hostinger shared hosting — upload via File Manager or FTP

## File Structure
```
kitchen-inventory-app/
├── index.html          — Single-page app (dashboard, tiles, modals, log)
├── style.css           — Full design system (createmycard.in style)
├── app.js              — All frontend logic (CRUD, modals, tabs, rendering)
├── schema.sql          — Database DDL (items + transactions tables)
├── seed.sql            — 53 baseline inventory rows as of 2026-07-21
├── README.md           — Hostinger deployment steps
├── CLAUDE.md           — This file
└── api/
    ├── config.php      — DB connection (credentials — DO NOT expose)
    ├── items.php       — CRUD API for items (GET/POST/PUT/DELETE)
    └── transactions.php — Stock movement API (POST create + GET by date/item)
```

## Database Schema

### `items`
| Column | Type | Notes |
|--------|------|-------|
| id | INT AUTO_INCREMENT PK | |
| name | VARCHAR(120) | |
| category | VARCHAR(50) | Default 'other' |
| quantity | DECIMAL(10,2) | Default 1 |
| unit | VARCHAR(30) | Default 'pcs' |
| low_stock_threshold | DECIMAL(10,2) | Default 1 |
| expiry_date | DATE NULL | |
| updated_at | TIMESTAMP | Auto-updates |

### `transactions`
| Column | Type | Notes |
|--------|------|-------|
| id | INT AUTO_INCREMENT PK | |
| item_id | INT FK→items.id | CASCADE on delete |
| type | ENUM('consumed','added') | |
| quantity | DECIMAL(10,2) | |
| note | VARCHAR(200) NULL | |
| created_at | TIMESTAMP | |

## API Endpoints

### `api/items.php`
- **GET** — Returns all items ordered by category, name
- **POST** — Create item. Body: `{name, category, quantity, unit, low_stock_threshold, expiry_date}`. bind_param types: `ssdsds`
- **PUT** — Update item. Body includes `id`. bind_param types: `ssdsdsi`
- **DELETE** `?id=N` — Delete item by id

### `api/transactions.php`
- **POST** — Create transaction + atomically update item quantity. Uses MySQL BEGIN/COMMIT. Consumed uses `GREATEST(0, quantity - ?)` to prevent negatives.
- **GET** `?date=YYYY-MM-DD` — Transactions for a date
- **GET** `?item_id=N` — Transactions for an item (limit 50)
- **GET** (no params) — Latest 100 transactions

## Categories
`grains`, `oils`, `salt-sugar`, `pulses`, `spices`, `sauces`, `dry-fruits`, `cooking`, `ready-to-serve`, `packaging`, `other`

## Unit Options
`kg`, `g` (displayed as "gms"), `packets`, `bottles`, `L` (displayed as "ltr"), `box`, `pcs`

## Design System (createmycard.in)

### CSS Custom Properties
```
--primary: #2563eb     --primary-dark: #1d4ed8    --primary-light: #eff6ff
--accent: #f97316      --accent-glow: rgba(249,115,22,0.35)
--bg: #f1f5f9          --text: #0f172a            --muted: #64748b
--border: #e2e8f0      --green: #22c55e           --red: #ef4444
--amber: #f59e0b
--radius: 8px          --radius-md: 12px          --radius-lg: 16px
--radius-xl: 24px      --radius-full: 999px
--shadow-sm/default/lg/blue — defined in :root
--ease-out: cubic-bezier(0.16, 1, 0.3, 1)
--ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1)
```

### Key Patterns
- **Font**: Plus Jakarta Sans, weights 400-800, `font-feature-settings: 'cv11','ss01','ss03'`
- **Header**: Animated gradient (#1e1b4b → #1e40af → #0369a1), sticky, orange radial glow
- **Cards/Tiles**: White bg, 1px border, 12px radius, shadow-sm, gradient top-line on hover, translateY(-4px) lift
- **Buttons**: Primary = blue gradient + shadow-blue + btnSweep animation. Danger = red gradient. Success = green gradient.
- **Modals**: 24px radius, frosted backdrop blur(8px), spring scale animation
- **Inputs/Selects**: 48px height, 1rem padding, 12px radius, 1.5px border, blue focus ring (0 0 0 4px)
- **Labels**: 0.7rem, weight 700, uppercase, 0.8px letter-spacing
- **Chips**: border-radius 999px, 1.5px border, gradient fill when active
- **Badges**: 0.58rem, weight 700, uppercase, pill-shaped, color-coded
- **Grain overlay**: SVG noise at 3% opacity, mix-blend-mode: multiply
- **Animations**: fadeUp on tiles with staggered delays (idx * 0.04s)

### Consistency Rules
- All form elements in modals must match: 48px height, same border, same radius, same focus ring
- Always use `font-family: inherit` on form elements
- Never use generic greens — use the token colors
- Always cache-bust asset URLs (`?v=N`) when deploying changed files

## Conventions
- **Timezone**: All timestamps display in Asia/Kolkata (IST, GMT+5:30). MySQL timestamps are appended with ' UTC' before parsing.
- **Event delegation**: Tile action buttons use `event.stopPropagation()` to avoid triggering tile click-to-edit.
- **Cache busting**: Bump `?v=N` on `style.css` and `app.js` references in index.html when deploying updates.
- **All fetch calls**: Must include `headers: {'Content-Type': 'application/json'}` for POST/PUT.
- **XSS prevention**: All user-visible text goes through `escapeHtml()`.

## Deployment (Hostinger)
1. Create MySQL database in Hostinger hPanel
2. Run `schema.sql` in phpMyAdmin
3. Optionally run `seed.sql` for baseline stock
4. Update `api/config.php` with real credentials
5. Upload all files via File Manager to `public_html/` (or a subdirectory)
6. Bump cache-bust versions if updating existing deployment

## Known State
- Baseline stock seeded: 53 items as of 2026-07-21
- Debug `console.log` statements in app.js (lines ~298, 313) should be removed before production
- Current cache-bust version: `?v=2`
