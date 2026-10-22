TRUNCATE products, categories RESTART IDENTITY;

-- Categories (30)
INSERT INTO categories (name)
SELECT (ARRAY['Shoes','Phones','Shirts','Laptops','Watches','Headphones','Bags','Jeans','Jackets','Cameras',
              'Tablets','TVs','Sofas','Books','Toys','Perfumes','Sunglasses','Keyboards','Mice','Speakers',
              'Fridges','Mixers','Fans','Lamps','Mattresses','Bicycles','Helmets','Backpacks','Wallets','Belts'])[g]
FROM generate_series(1, 30) g;

-- Products (10 lakh)
INSERT INTO products (name, description, category_id, brand, price, rating, stock, created_at)
SELECT
  t.brand || ' ' || t.word || ' ' || (ARRAY['Pro','Max','Lite','Plus','Ultra','Classic','Sport','Smart'])[1 + (t.g % 8)] || ' ' || t.g,
  'Premium ' || t.word || ' by ' || t.brand || '. ' ||
    (ARRAY['Best in class quality','Durable and stylish','Great value for money','Latest model with warranty','Customer favourite'])[1 + (t.g % 5)],
  1 + floor(power(random(), 2) * 30)::int,
  t.brand,
  round((100 + power(random(), 3) * 99900)::numeric, 2),
  round((1 + random() * 4)::numeric, 1),
  floor(random() * 500)::int,
  NOW() - (random() * interval '730 days')
FROM (
  SELECT g,
    (ARRAY['Nike','Adidas','Puma','Apple','Samsung','Sony','Dell','HP','Lenovo','Boat',
           'Realme','Xiaomi','OnePlus','Asus','Acer','Fossil','Titan','Levis','Zara','Wildcraft'])
      [1 + floor(power(random() + g * 0, 2) * 20)::int] AS brand,
    (ARRAY['Shoes','Phone','Shirt','Laptop','Watch','Headphones','Bag','Jeans','Jacket','Camera',
           'Tablet','TV','Sofa','Book','Toy','Perfume','Sunglasses','Keyboard','Mouse','Speaker'])
      [1 + floor((random() + g * 0) * 20)::int] AS word
  FROM generate_series(1, 1000000) g
) t;

ANALYZE;