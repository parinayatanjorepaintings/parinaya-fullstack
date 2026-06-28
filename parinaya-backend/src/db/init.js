require('dotenv').config();
const pool = require('./pool');

async function init() {
  console.log('🔧  Initialising database schema…');

  await pool.query(`
    -- ─── Admins ──────────────────────────────────────────────────
    CREATE TABLE IF NOT EXISTS admins (
      id          SERIAL PRIMARY KEY,
      email       TEXT UNIQUE NOT NULL,
      password    TEXT NOT NULL,          -- bcrypt hash
      name        TEXT NOT NULL DEFAULT 'Admin',
      created_at  TIMESTAMPTZ DEFAULT NOW()
    );

    -- ─── Categories ──────────────────────────────────────────────
    CREATE TABLE IF NOT EXISTS categories (
      id          SERIAL PRIMARY KEY,
      name        TEXT NOT NULL,
      slug        TEXT UNIQUE NOT NULL,
      description TEXT,
      sort_order  INT DEFAULT 0,
      active      BOOLEAN DEFAULT TRUE,
      created_at  TIMESTAMPTZ DEFAULT NOW()
    );

    -- ─── Products ────────────────────────────────────────────────
    CREATE TABLE IF NOT EXISTS products (
      id                SERIAL PRIMARY KEY,
      name              TEXT NOT NULL,
      slug              TEXT UNIQUE NOT NULL,
      category_id       INT REFERENCES categories(id) ON DELETE SET NULL,
      price             NUMERIC(12, 2) NOT NULL DEFAULT 0,
      in_stock          BOOLEAN DEFAULT TRUE,
      featured          BOOLEAN DEFAULT FALSE,
      description       TEXT,
      dimensions        TEXT,
      weight            TEXT,
      shipping_info     TEXT,
      care_instructions TEXT,
      please_note       TEXT,
      trust_badge_1     TEXT DEFAULT 'Free shipping across India, dispatched in 1–3 business days',
      trust_badge_2     TEXT DEFAULT 'Handmade by skilled artisans — quality checked before dispatch',
      sort_order        INT DEFAULT 0,
      active            BOOLEAN DEFAULT TRUE,
      created_at        TIMESTAMPTZ DEFAULT NOW(),
      updated_at        TIMESTAMPTZ DEFAULT NOW()
    );

    -- ─── Product Images ──────────────────────────────────────────
    CREATE TABLE IF NOT EXISTS product_images (
      id          SERIAL PRIMARY KEY,
      product_id  INT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
      url         TEXT NOT NULL,          -- relative path or CDN URL
      sort_order  INT DEFAULT 0,
      is_primary  BOOLEAN DEFAULT FALSE,
      created_at  TIMESTAMPTZ DEFAULT NOW()
    );

    -- ─── Site Config ─────────────────────────────────────────────
    -- Key-value store so the admin can change any site text
    CREATE TABLE IF NOT EXISTS site_config (
      key         TEXT PRIMARY KEY,
      value       TEXT,
      label       TEXT,          -- human-readable label shown in admin
      group_name  TEXT,          -- grouping in admin UI (e.g. "contact", "social")
      updated_at  TIMESTAMPTZ DEFAULT NOW()
    );

    -- Trigger: auto-update updated_at on products
    CREATE OR REPLACE FUNCTION update_updated_at()
    RETURNS TRIGGER AS $$
    BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
    $$ LANGUAGE plpgsql;

    DROP TRIGGER IF EXISTS trg_products_updated_at ON products;
    CREATE TRIGGER trg_products_updated_at
      BEFORE UPDATE ON products
      FOR EACH ROW EXECUTE FUNCTION update_updated_at();

    DROP TRIGGER IF EXISTS trg_site_config_updated_at ON site_config;
    CREATE OR REPLACE FUNCTION update_site_config_ts()
    RETURNS TRIGGER AS $$
    BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
    $$ LANGUAGE plpgsql;
    CREATE TRIGGER trg_site_config_updated_at
      BEFORE UPDATE ON site_config
      FOR EACH ROW EXECUTE FUNCTION update_site_config_ts();
  `);

  console.log('✅  Schema ready.');
  await pool.end();
}

init().catch((err) => {
  console.error('❌  Schema init failed:', err);
  process.exit(1);
});
