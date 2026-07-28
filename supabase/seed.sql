-- ============================================================================
-- Seed data — your original 10 products.
-- Run AFTER schema.sql, in Supabase → SQL Editor. Safe to re-run (clears first).
-- The `emoji` column holds the icon NAME (string); the app turns it into <Icon/>.
-- ============================================================================
delete from public.products;

insert into public.products
  (name, category, price, image, emoji, badge, stock, description, sustainability_badge, rating, review_count)
values
  ('Heirloom Tomatoes',        'Organic Edibles',  150, '/tomato.png',      'Cherry',  'Best Seller', 'In Stock',  'Freshly harvested, pesticide-free organic tomatoes, perfect for salads and cooking.', 'Eco-Friendly',     4.8, 124),
  ('Basil Grow Kit',           'Herbs',            350, '/basil.png',       'Leaf',    'New',         'Low Stock', 'Everything you need to grow your own aromatic basil at home. Includes seeds, soil, and pot.', 'Sustainable',  4.5,  89),
  ('Sampaguita Starter',       'Floriculture',     200, '/sampaguita.png',  'Flower2', null,          'In Stock',  'Smells wonderful, arrived healthy.', 'Local & Organic', 4.9, 210),
  ('Native Adlai Seeds',       'Native Seeds',     250, '/adlai.png',       'Wheat',   'Organic',     'In Stock',  'High-quality native Adlai seeds, a healthy and sustainable alternative to rice.', 'Local & Organic', 4.7, 56),
  ('Premium Potting Mix',      'Soil Mixes',       280, '/potting_mix.png', 'Sprout',  null,          'Low Stock', 'Nutrient-rich organic potting mix, ideal for all types of plants and urban gardens.', 'Recycled Content', 4.6, 340),
  ('Ergonomic Hand Trowel',    'Gardening Tools',  450, '/trowel.png',      'Shovel',  null,          'In Stock',  'Sturdy and comfortable to hold.', 'Essential', 4.8, 112),
  ('Organic Eggplant',         'Organic Edibles',  120, '/eggplant.png',    'Salad',   null,          'In Stock',  'Fresh, but a bit smaller than expected.', 'Eco-Friendly', 4.3, 45),
  ('Peppermint Seeds',         'Herbs',             90, '/mint.png',        'Sprout',  null,          'In Stock',  'Grows very fast!', 'Sustainable', 4.5, 78),
  ('Compost Booster',          'Soil Mixes',       320, '/compost.png',     'Recycle', 'Eco',         'In Stock',  'Speeds up composting significantly.', 'Eco-Friendly', 4.9, 150),
  ('Urban Farming Starter Kit','Starter Kits',    1200, '/starter_kit.png', 'Package', 'Popular',     'In Stock',  'Everything you need to start your urban farm. Includes varied seeds, tools, and premium soil.', 'Eco-Friendly', 4.9, 88),
  ('Calamansi Seedling',       'Organic Edibles',  180, '/calamansi.png',   'Citrus',  'New',         'In Stock',  'Healthy grafted calamansi seedling, ready to transplant. Bears fruit within 2-3 years.', 'Local & Organic', 4.7, 63),
  ('Organic Carrots',          'Organic Edibles',  140, '/carrot.png',      'Carrot',  null,          'In Stock',  'Sweet, crunchy carrots grown without synthetic pesticides in the Benguet highlands.', 'Eco-Friendly', 4.6, 97),
  ('Lemongrass (Tanglad) Bundle','Herbs',          110, '/lemongrass.png',  'Leaf',    null,          'In Stock',  'Fresh tanglad stalks with roots intact — cook with them or replant in your garden.', 'Local & Organic', 4.8, 132),
  ('Sunflower Seed Pack',      'Floriculture',     130, '/sunflower.png',   'Sun',     'New',         'In Stock',  'Giant sunflower variety, easy to grow and pollinator-friendly. About 20 seeds per pack.', 'Sustainable', 4.6, 71),
  ('Heirloom Black Rice Seeds','Native Seeds',     300, '/black_rice.png',  'Wheat',   'Organic',     'Low Stock', 'Traditional pigmented rice seeds from Cordillera farmers, rich in antioxidants.', 'Local & Organic', 4.9, 41),
  ('Vermicast Organic Fertilizer','Soil Mixes',    260, '/vermicast.png',   'Recycle', 'Eco',         'In Stock',  'Pure worm castings that enrich soil naturally — gentle enough for seedlings.', 'Eco-Friendly', 4.8, 118),
  ('Garden Pruning Shears',    'Gardening Tools',  390, '/pruning_shears.png','Scissors', null,       'In Stock',  'Sharp stainless-steel bypass shears with a comfortable non-slip grip and safety lock.', 'Essential', 4.7, 84),
  ('Okra Seeds',               'Organic Edibles',   95, '/okra.png',        'Sprout',  null,          'In Stock',  'Fast-growing native okra variety that thrives in warm Philippine weather. About 30 seeds per pack.', 'Local & Organic', 4.5, 52),
  ('Malunggay Seedling',       'Organic Edibles',  150, '/malunggay.png',   'Trees',   'Best Seller', 'In Stock',  'Hardy moringa seedling packed with nutrients — a low-maintenance superfood tree for any backyard.', 'Local & Organic', 4.9, 143),
  ('Oregano Plant',            'Herbs',            160, '/oregano.png',     'Leaf',    null,          'In Stock',  'Established Filipino oregano in a nursery pot — aromatic, medicinal, and nearly impossible to kill.', 'Sustainable', 4.7, 66),
  ('Gumamela Cutting',         'Floriculture',     170, '/gumamela.png',    'Flower2', null,          'In Stock',  'Rooted hibiscus cutting in classic red — blooms year-round and attracts butterflies.', 'Local & Organic', 4.6, 58),
  ('Native Mung Bean Seeds',   'Native Seeds',     120, '/mungbean.png',    'Sprout',  'Organic',     'In Stock',  'Locally sourced munggo seeds for sprouting or field planting — a natural soil nitrogen fixer.', 'Local & Organic', 4.6, 74),
  ('Cocopeat Grow Blocks',     'Soil Mixes',       190, '/cocopeat.png',    'Recycle', 'Eco',         'In Stock',  'Compressed coconut coir blocks that expand into a light, water-retaining growing medium.', 'Recycled Content', 4.7, 105),
  ('Drip Irrigation Kit',      'Gardening Tools',  650, '/drip_kit.png',    'Droplet', 'New',         'Low Stock', 'Water-saving drip kit for up to 20 plants — timers, tubing, and drippers included.', 'Eco-Friendly', 4.8, 39),
  ('Herb Garden Starter Kit',  'Starter Kits',     850, '/herb_kit.png',    'Package', 'Popular',     'In Stock',  'Grow basil, mint, and oregano from one box — pots, soil discs, seeds, and a care guide included.', 'Sustainable', 4.8, 92),
  ('Pechay Seeds',             'Organic Edibles',   85, '/pechay.png',      'Salad',   null,          'In Stock',  'Quick-harvest native pechay — ready to eat in just 30 days, perfect for container gardens.', 'Local & Organic', 4.6, 88),
  ('Sili Labuyo Seedling',     'Organic Edibles',  135, '/labuyo.png',      'Flame',   'Hot',         'In Stock',  'Fiery native bird''s eye chili seedling — compact, productive, and thrives in pots.', 'Local & Organic', 4.8, 67),
  ('Pandan Plant',             'Herbs',            145, '/pandan.png',      'Leaf',    null,          'In Stock',  'Fragrant pandan in a nursery pot — fresh leaves on demand for rice, drinks, and desserts.', 'Local & Organic', 4.7, 79),
  ('Waling-Waling Orchid Seedling','Floriculture', 450, '/walingwaling.png','Flower2', 'Rare',        'Low Stock', 'The queen of Philippine orchids — nursery-propagated seedling with care instructions included.', 'Local & Organic', 4.9, 34),
  ('Native Ube Tubers',        'Native Seeds',     220, '/ube.png',         'Sprout',  'Organic',     'In Stock',  'Planting-grade purple yam tubers from local growers — grow your own ube at home.', 'Local & Organic', 4.7, 48),
  ('Carbonized Rice Hull',     'Soil Mixes',       150, '/rice_hull.png',   'Wheat',   'Eco',         'In Stock',  'Upcycled rice hulls that improve drainage and aeration — a Filipino farming classic.', 'Recycled Content', 4.6, 93),
  ('Bamboo Garden Stakes (10 pcs)','Gardening Tools',120,'/bamboo_stakes.png','Trees', null,          'In Stock',  'Sturdy locally sourced bamboo stakes for supporting tomatoes, beans, and climbing vines.', 'Sustainable', 4.5, 61),
  ('Kids Gardening Kit',       'Starter Kits',     950, '/kids_kit.png',    'Gift',    'New',         'In Stock',  'Child-friendly tools, fast-sprouting seeds, and activity cards to get little hands growing.', 'Sustainable', 4.9, 45);
