
-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL CHECK (role IN ('buyer', 'vendor')),
  phone_number VARCHAR(20),
  address TEXT,
  barangay VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index on email for faster lookups
CREATE INDEX idx_users_email ON users(email);

-- Create index on role for filtering
CREATE INDEX idx_users_role ON users(role);

-- Create index on barangay for location-based queries
CREATE INDEX idx_users_barangay ON users(barangay);

-- Create products table (for future use)
CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  vendor_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  unit VARCHAR(50),
  stock_quantity INTEGER DEFAULT 0,
  category VARCHAR(100),
  image_url TEXT,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_products_vendor ON products(vendor_id);
CREATE INDEX idx_products_category ON products(category);

-- Create orders table (for future use)
CREATE TABLE IF NOT EXISTS orders (
  id SERIAL PRIMARY KEY,
  buyer_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  vendor_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  total_amount DECIMAL(10, 2) NOT NULL,
  status VARCHAR(50) NOT NULL CHECK (status IN ('pending', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled')),
  delivery_address TEXT,
  delivery_type VARCHAR(50) CHECK (delivery_type IN ('pickup', 'delivery')),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_orders_buyer ON orders(buyer_id);
CREATE INDEX idx_orders_vendor ON orders(vendor_id);
CREATE INDEX idx_orders_status ON orders(status);

-- Create order_items table (for future use)
CREATE TABLE IF NOT EXISTS order_items (
  id SERIAL PRIMARY KEY,
  order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
  product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL,
  price_at_purchase DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_order_items_product ON order_items(product_id);

-- Create reviews table (for future use)
CREATE TABLE IF NOT EXISTS reviews (
  id SERIAL PRIMARY KEY,
  order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
  buyer_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  vendor_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_reviews_vendor ON reviews(vendor_id);
CREATE INDEX idx_reviews_buyer ON reviews(buyer_id);