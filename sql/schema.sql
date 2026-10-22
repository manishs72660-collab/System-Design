DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS categories;

CREATE TABLE categories (
  id   SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL
);

CREATE TABLE products (
  id          SERIAL PRIMARY KEY,
  name        VARCHAR(255) NOT NULL,
  description TEXT,
  category_id INT NOT NULL REFERENCES categories(id),
  brand       VARCHAR(100) NOT NULL,
  price       NUMERIC(10,2) NOT NULL,
  rating      NUMERIC(2,1) NOT NULL,
  stock       INT NOT NULL DEFAULT 0,
  created_at  TIMESTAMP NOT NULL DEFAULT NOW()
);