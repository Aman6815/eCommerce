-- ==================================================
-- HARONI ONLINE MARKET — DATABASE SCHEMA
-- ==================================================

CREATE TYPE user_role AS ENUM ('buyer', 'seller', 'admin');
CREATE TYPE order_status AS ENUM ('pending', 'confirmed', 'cancelled', 'completed');

-- ==================================================
-- USERS
-- One account can be a buyer, a seller, or an admin.
-- Sellers get an extra row in `sellers` for shop info + approval.
-- ==================================================
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role user_role NOT NULL DEFAULT 'buyer',
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ==================================================
-- SELLERS
-- Extends a user with shop details. `approved` gates
-- whether their products are publicly visible.
-- ==================================================
CREATE TABLE sellers (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    shop_name VARCHAR(150) NOT NULL,
    phone VARCHAR(30),
    location VARCHAR(200),
    approved BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ==================================================
-- CATEGORIES
-- ==================================================
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(80) UNIQUE NOT NULL
);

-- ==================================================
-- PRODUCTS
-- Owned by a seller. Only visible publicly when the
-- seller is approved AND the product itself is active.
-- ==================================================
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    seller_id INTEGER NOT NULL REFERENCES sellers(id) ON DELETE CASCADE,
    category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
    name VARCHAR(150) NOT NULL,
    description TEXT,
    price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
    stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
    image_url TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_seller ON products(seller_id);
CREATE INDEX idx_products_name_search ON products USING GIN (to_tsvector('english', name));

-- ==================================================
-- ORDERS
-- One order per checkout, placed by a buyer.
-- Line items are split per seller in order_items.
-- ==================================================
CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    buyer_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status order_status NOT NULL DEFAULT 'pending',
    total NUMERIC(10, 2) NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ==================================================
-- ORDER ITEMS
-- seller_id is duplicated here (denormalized) so a
-- seller can query "my orders" without joining through
-- products first, and so historical orders stay
-- accurate even if a product is later edited/removed.
-- ==================================================
CREATE TABLE order_items (
    id SERIAL PRIMARY KEY,
    order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id INTEGER REFERENCES products(id) ON DELETE SET NULL,
    seller_id INTEGER NOT NULL REFERENCES sellers(id) ON DELETE CASCADE,
    product_name VARCHAR(150) NOT NULL,
    unit_price NUMERIC(10, 2) NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0)
);

CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_order_items_seller ON order_items(seller_id);

-- ==================================================
-- SEED CATEGORIES (matches current frontend)
-- ==================================================
INSERT INTO categories (name) VALUES
    ('Phones'), ('Clothing'), ('Shoes'), ('Cosmetics');
