# Kitchen Inventory

A simple kitchen inventory tracker: add items, track quantity, category (pantry/fridge/freezer/spices), expiry dates, and low-stock alerts. Plain HTML/CSS/JS frontend + PHP/MySQL backend — no frameworks, no build step.

## Files

- `index.html`, `style.css`, `app.js` — the app itself
- `api/items.php` — backend API (GET/POST/PUT/DELETE)
- `api/config.php` — database credentials (fill in before deploying)
- `schema.sql` — run once to create the `items` table

## Deploying to Hostinger

1. **Create a MySQL database**
   In hPanel → Databases → MySQL Databases, create a new database and user. Note the database name, username, password, and host (usually `localhost`).

2. **Create the table**
   Open phpMyAdmin (linked from the same page) → select your database → SQL tab → paste the contents of `schema.sql` → Go.

2b. **(Optional) Load starting inventory**
   If you want to pre-populate the app with your current stock, run `seed.sql` the same way (SQL tab → paste → Go) right after `schema.sql`.

3. **Fill in credentials**
   Edit `api/config.php` and replace `your_db_name`, `your_db_user`, `your_db_password` with the values from step 1.

4. **Upload the files**
   In hPanel → File Manager (or via FTP), upload the entire `kitchen-inventory-app` folder's contents into `public_html` (or a subfolder if you want it at a sub-path, e.g. `public_html/kitchen`).

5. **Visit your site**
   Go to `https://yourdomain.com/` (or `/kitchen/` if you used a subfolder). You should see the app and be able to add items.

## Notes

- No login/auth is built in — anyone with the link can edit the inventory. Fine for a household use case; ask if you want a simple shared password added later.
- To add more categories, edit the `<select id="category">` options in `index.html`.
# kitchen-inventory-tracker
