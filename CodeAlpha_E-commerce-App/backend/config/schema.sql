-- Run this once against your PostgreSQL database to create the tables
-- e.g. psql -U postgres -d ecommerce -f schema.sql

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  description TEXT,
  price NUMERIC(10, 2) NOT NULL,
  image_url VARCHAR(255),
  stock INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS cart_items (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1,
  UNIQUE (user_id, product_id)
);

CREATE TABLE IF NOT EXISTS orders (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  total NUMERIC(10, 2) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS order_items (
  id SERIAL PRIMARY KEY,
  order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
  product_id INTEGER REFERENCES products(id),
  quantity INTEGER NOT NULL,
  price NUMERIC(10, 2) NOT NULL
);

-- Sample products so the frontend has something to display right away
INSERT INTO products (name, description, price, image_url, stock) VALUES
('Wireless Headphones', 'Noise-cancelling over-ear headphones', 49.99, 'https://placehold.co/300x300?text=Headphones', 25),
('Running Shoes', 'Lightweight breathable running shoes', 39.99, 'https://placehold.co/300x300?text=Shoes', 40),
('Backpack', 'Water-resistant 20L daypack', 29.99, 'https://placehold.co/300x300?text=Backpack', 15),
('Smart Watch', 'Fitness tracking smart watch', 89.99, 'https://placehold.co/300x300?text=Watch', 10)
ON CONFLICT DO NOTHING;