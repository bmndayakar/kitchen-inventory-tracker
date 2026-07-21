# Kitchen Inventory

A household kitchen inventory tracker. Track items, quantities, categories, expiry dates, low-stock alerts, daily consumption/refill logging, pricing, and stock valuation. Plain HTML/CSS/JS frontend + PHP/MySQL backend — no frameworks, no build step.

## Features

### Dashboard
- Stat cards showing total items, in stock, low stock, out of stock, and total stock value
- Last updated timestamp in IST (GMT+5:30)

### Inventory Tiles
- Items displayed as tiles grouped by category
- Each tile shows: item name, quantity with unit, stock status badges, unit price, stock value, expiry date, and last updated time
- Color-coded badges: red for out of stock, amber for low stock, yellow for expiring soon
- Pencil icon on each tile to edit item name and unit

### Adding Items
- Use the + button in the header to open the add form
- Or use the + icon next to each category header to quick-add an item to that category
- Fields: item name, category, quantity, unit of measurement, low stock threshold, expiry date
- Units available: kg, gms, packets, bottles, ltr, box, pcs

### Stock Movements (Consume / Refill)
- Each tile has - and + buttons
- **Minus (-)**: Record consumption — logs how much was used
- **Plus (+)**: Record refill — logs how much was added
- Both show a modal with quantity, price (optional), and note fields
- Confirmation dialog before submitting
- Price field: labeled "Cost" for consumption, "Price paid" for refills

### Pricing and Stock Valuation
- Enter a price when adding stock to set the per-unit cost
- First priced refill sets the unit price for that item (e.g. 5kg for Rs.500 = Rs.100/kg)
- Subsequent refills at different prices recalculate using weighted average cost (e.g. 10kg at Rs.100/kg + 5kg at Rs.110/kg = Rs.103.33/kg)
- Only refills (not consumption) update the unit price
- Each tile shows unit price and current stock value
- Dashboard shows total stock value across all priced items

### Item History
- Tap/click on any tile to see a bar chart of daily activity
- Red bars = consumed, green bars = added
- Shows last 14 days of transactions

### Activity Log
- Switch to "Activity Log" tab to see all transactions for a date
- Date defaults to today (IST)
- Entries grouped by item name in collapsible sections
- Each entry shows: type (used/added), quantity, price (if entered), note, and timestamp

### Search and Filters
- Search bar to find items by name
- Category filter chips to view one category at a time
- "Low / out of stock only" checkbox to focus on items needing attention

## Categories

grains, oils, salt-sugar, pulses, spices, sauces, dry-fruits, cooking, ready-to-serve, packaging, other

## Deploying to Hostinger

1. **Create a MySQL database**
   In hPanel > Databases > MySQL Databases, create a new database and user. Note the database name, username, password, and host (usually `localhost`).

2. **Create the tables**
   Open phpMyAdmin (linked from the same page) > select your database > SQL tab > paste the contents of `schema.sql` > Go.

3. **(Optional) Load starting inventory**
   Run `seed.sql` the same way (SQL tab > paste > Go) right after `schema.sql` to pre-populate with your current stock.

4. **Fill in credentials**
   Edit `api/config.php` and replace `your_db_name`, `your_db_user`, `your_db_password` with the values from step 1.

5. **Upload the files**
   In hPanel > File Manager (or via FTP), upload the entire folder's contents into `public_html` (or a subfolder like `public_html/kitchen`).

6. **Visit your site**
   Go to `https://yourdomain.com/` (or `/kitchen/` if you used a subfolder).

## Updating the App

When uploading changed files, bump the cache-bust version numbers in `index.html`:
```html
<link rel="stylesheet" href="style.css?v=4">
<script src="app.js?v=4"></script>
```
Then hard refresh the browser (Ctrl+Shift+R / Cmd+Shift+R).

## Notes

- No login/auth — anyone with the link can edit the inventory. Fine for household use.
- All timestamps display in IST (Asia/Kolkata, GMT+5:30).
- To add more categories, update the select options in `index.html` and the `CATEGORY_NAMES` map in `app.js`.
- To add more units, update the select options in the modals in `index.html`.
