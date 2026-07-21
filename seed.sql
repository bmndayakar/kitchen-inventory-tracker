-- Seed data from your current kitchen stock list.
-- Run this in phpMyAdmin AFTER schema.sql has created the `items` table.
-- Quantities are approximate (as given); low_stock_threshold values are reasonable defaults you can tweak later.

INSERT INTO items (name, category, quantity, unit, low_stock_threshold) VALUES
-- Rice, Flour & Grains
('Basmati Rice', 'grains', 22, 'kg', 3),
('Staff Rice', 'grains', 15, 'kg', 3),
('Wheat Flour', 'grains', 5, 'kg', 1),
('Maida', 'grains', 0, 'kg', 1),

-- Oils & Fats
('Refined Oil', 'oils', 3, 'packets', 1),
('Ghee', 'oils', 0, 'kg', 1),

-- Salt, Sugar & Sweeteners
('Rock Salt', 'salt-sugar', 9, 'kg', 1),
('Tata Salt', 'salt-sugar', 7, 'kg', 1),
('Tasting Salt', 'salt-sugar', 1.5, 'kg', 0.5),
('Sugar', 'salt-sugar', 3, 'kg', 1),
('Honey', 'salt-sugar', 1, 'kg', 0.5),

-- Pulses
('Toor Dal', 'pulses', 2, 'kg', 1),

-- Spices & Masalas
('Chilli Powder', 'spices', 2, 'kg', 0.5),
('Haldi Powder', 'spices', 750, 'g', 200),
('Sambar Powder', 'spices', 1, 'kg', 0.3),
('Whole Methi', 'spices', 1, 'kg', 0.3),
('Kasuri Methi', 'spices', 1, 'kg', 0.3),
('Whole Jeera', 'spices', 500, 'g', 150),
('Shah Jeera', 'spices', 500, 'g', 150),
('Black Pepper', 'spices', 1, 'kg', 0.3),
('White Pepper Powder', 'spices', 0, 'g', 100),
('Dry Red Chilli', 'spices', 1, 'kg', 0.3),
('Star Anise', 'spices', 1, 'kg', 0.3),
('Cloves', 'spices', 0, 'g', 100),
('Cardamom (Elaichi)', 'spices', 0, 'g', 100),
('Chat Masala', 'spices', 1, 'box', 1),
('Chicken Masala', 'spices', 250, 'g', 100),
('Mutton Masala', 'spices', 100, 'g', 50),

-- Sauces & Condiments
('Tomato Sauce (Box)', 'sauces', 1, 'box', 1),
('Tomato Sauce (Loose)', 'sauces', 3, 'L', 1),
('Schezwan Sauce', 'sauces', 2, 'packets', 1),
('Green Chilli Sauce', 'sauces', 5, 'L', 1),
('Red Chilli Sauce', 'sauces', 2.5, 'L', 1),
('Dark Soya Sauce', 'sauces', 3, 'L', 1),
('Vinegar', 'sauces', 1, 'L', 0.5),
('8 to 8 Sauce (200 g)', 'sauces', 2, 'bottles', 1),
('Mango Pickle', 'sauces', 1, 'box', 1),

-- Dry Fruits, Nuts & Seeds
('Peanuts', 'dry-fruits', 6, 'kg', 1),
('Dry Coconut', 'dry-fruits', 1, 'kg', 0.5),
('Sesame Seeds', 'dry-fruits', 1, 'kg', 0.3),
('Broken Cashew', 'dry-fruits', 0, 'kg', 0.5),
('Cashew (2 Splits)', 'dry-fruits', 500, 'g', 150),
('Magaj (Melon Seeds)', 'dry-fruits', 100, 'g', 50),

-- Cooking Ingredients
('Corn Flour', 'cooking', 500, 'g', 150),
('Bread Crumbs', 'cooking', 1, 'kg', 0.3),
('Tamarind (Imli)', 'cooking', 1.5, 'kg', 0.5),
('Fried Onions', 'cooking', 0, 'kg', 0.5),
('Noodles', 'cooking', 4, 'packets', 1),

-- Ready-to-Serve
('Papad (2 Split)', 'ready-to-serve', 12, 'slices', 5),

-- Packaging
('1000 ml Containers', 'packaging', 0, 'pcs', 5),
('650 ml Containers', 'packaging', 0, 'pcs', 5),
('Cling Wrap', 'packaging', 3, 'rolls', 1),
('Silver Foil', 'packaging', 1, 'roll', 1),
('Tissue Pouches', 'packaging', 25, 'pcs', 10);
