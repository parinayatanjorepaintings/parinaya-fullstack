const express = require('express');
const path = require('path');
const fs = require('fs');
const pool = require('../db/pool');
const { requireAuth } = require('../middleware/auth');
const { upload, UPLOAD_DIR } = require('../middleware/upload');

const router = express.Router();

const slugify = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

// ── helpers ───────────────────────────────────────────────────────────────────

async function attachImages(products, client = pool) {
  if (!products.length) return products;
  const ids = products.map((p) => p.id);
  const { rows: images } = await client.query(
    `SELECT * FROM product_images WHERE product_id = ANY($1) ORDER BY sort_order, id`,
    [ids]
  );
  const imgMap = {};
  for (const img of images) {
    (imgMap[img.product_id] ??= []).push(img);
  }
  return products.map((p) => ({ ...p, images: imgMap[p.id] || [] }));
}

// Build image URL — local path to a URL the frontend can hit
function imgUrl(req, relPath) {
  if (!relPath) return null;
  if (relPath.startsWith('http')) return relPath;
  const base = `${req.protocol}://${req.get('host')}`;
  return `${base}/uploads/${path.basename(relPath)}`;
}

// ── Public ────────────────────────────────────────────────────────────────────

// GET /api/products?category=slug&featured=true&page=1&limit=20
router.get('/', async (req, res) => {
  try {
    const { category, featured, page = 1, limit = 60 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const conditions = ['p.active = TRUE'];
    const params = [];

    if (category) {
      params.push(category);
      conditions.push(`c.slug = $${params.length}`);
    }
    if (featured === 'true') conditions.push('p.featured = TRUE');

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const { rows: products } = await pool.query(`
      SELECT p.*, c.name AS category_name, c.slug AS category_slug
      FROM products p
      LEFT JOIN categories c ON c.id = p.category_id
      ${where}
      ORDER BY p.sort_order, p.created_at DESC
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}
    `, [...params, parseInt(limit), offset]);

    const withImages = await attachImages(products);

    // Resolve image URLs
    const result = withImages.map((p) => ({
      ...p,
      images: p.images.map((img) => ({ ...img, url: imgUrl(req, img.url) })),
    }));

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/products/:idOrSlug
router.get('/:idOrSlug', async (req, res) => {
  try {
    const { idOrSlug } = req.params;
    const isNumeric = /^\d+$/.test(idOrSlug);

    const { rows } = await pool.query(`
      SELECT p.*, c.name AS category_name, c.slug AS category_slug
      FROM products p
      LEFT JOIN categories c ON c.id = p.category_id
      WHERE ${isNumeric ? 'p.id = $1' : 'p.slug = $1'} AND p.active = TRUE
    `, [idOrSlug]);

    if (!rows[0]) return res.status(404).json({ error: 'Product not found' });

    const [withImg] = await attachImages([rows[0]]);
    withImg.images = withImg.images.map((img) => ({ ...img, url: imgUrl(req, img.url) }));

    res.json(withImg);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/products/:idOrSlug/related
router.get('/:idOrSlug/related', async (req, res) => {
  try {
    const { idOrSlug } = req.params;
    const isNumeric = /^\d+$/.test(idOrSlug);
    const { rows: [product] } = await pool.query(
      `SELECT * FROM products WHERE ${isNumeric ? 'id' : 'slug'} = $1 AND active = TRUE`,
      [idOrSlug]
    );
    if (!product) return res.json([]);

    const { rows } = await pool.query(`
      SELECT p.*, c.name AS category_name, c.slug AS category_slug
      FROM products p
      LEFT JOIN categories c ON c.id = p.category_id
      WHERE p.category_id = $1 AND p.id != $2 AND p.active = TRUE
      ORDER BY RANDOM()
      LIMIT 4
    `, [product.category_id, product.id]);

    const withImages = await attachImages(rows);
    res.json(withImages.map((p) => ({
      ...p,
      images: p.images.map((img) => ({ ...img, url: imgUrl(req, img.url) })),
    })));
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// ── Admin ─────────────────────────────────────────────────────────────────────

// GET /api/products/admin/all
router.get('/admin/all', requireAuth, async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT p.*, c.name AS category_name, c.slug AS category_slug
      FROM products p
      LEFT JOIN categories c ON c.id = p.category_id
      ORDER BY p.sort_order, p.created_at DESC
    `);
    const withImages = await attachImages(rows);
    res.json(withImages.map((p) => ({
      ...p,
      images: p.images.map((img) => ({ ...img, url: imgUrl(req, img.url) })),
    })));
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/products  — create product
router.post('/', requireAuth, async (req, res) => {
  try {
    const {
      name, category_id, price, in_stock = true, featured = false,
      description, dimensions, weight,
      shipping_info, care_instructions, please_note,
      trust_badge_1, trust_badge_2,
      sort_order = 0, active = true,
    } = req.body;

    if (!name) return res.status(400).json({ error: 'Product name is required' });

    let slug = slugify(name);
    // Ensure uniqueness
    const { rows: existing } = await pool.query('SELECT id FROM products WHERE slug = $1', [slug]);
    if (existing.length) slug = `${slug}-${Date.now()}`;

    const { rows } = await pool.query(`
      INSERT INTO products (
        name, slug, category_id, price, in_stock, featured,
        description, dimensions, weight,
        shipping_info, care_instructions, please_note,
        trust_badge_1, trust_badge_2,
        sort_order, active
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)
      RETURNING *
    `, [
      name, slug, category_id || null, parseFloat(price) || 0,
      in_stock, featured,
      description || '', dimensions || '', weight || '',
      shipping_info || '', care_instructions || '', please_note || '',
      trust_badge_1 || '', trust_badge_2 || '',
      sort_order, active,
    ]);
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /api/products/:id  — update product
router.put('/:id', requireAuth, async (req, res) => {
  try {
    const { rows: [cur] } = await pool.query('SELECT * FROM products WHERE id = $1', [req.params.id]);
    if (!cur) return res.status(404).json({ error: 'Product not found' });

    const f = (key, fallback) => req.body[key] !== undefined ? req.body[key] : (cur[key] ?? fallback);

    const { rows } = await pool.query(`
      UPDATE products SET
        name              = $1,
        category_id       = $2,
        price             = $3,
        in_stock          = $4,
        featured          = $5,
        description       = $6,
        dimensions        = $7,
        weight            = $8,
        shipping_info     = $9,
        care_instructions = $10,
        please_note       = $11,
        trust_badge_1     = $12,
        trust_badge_2     = $13,
        sort_order        = $14,
        active            = $15
      WHERE id = $16
      RETURNING *
    `, [
      f('name', cur.name),
      f('category_id', cur.category_id),
      parseFloat(f('price', cur.price)),
      f('in_stock', cur.in_stock),
      f('featured', cur.featured),
      f('description', cur.description),
      f('dimensions', cur.dimensions),
      f('weight', cur.weight),
      f('shipping_info', cur.shipping_info),
      f('care_instructions', cur.care_instructions),
      f('please_note', cur.please_note),
      f('trust_badge_1', cur.trust_badge_1),
      f('trust_badge_2', cur.trust_badge_2),
      f('sort_order', cur.sort_order),
      f('active', cur.active),
      req.params.id,
    ]);
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /api/products/:id
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    // Get images to delete files
    const { rows: images } = await pool.query(
      'SELECT url FROM product_images WHERE product_id = $1', [req.params.id]
    );
    for (const img of images) {
      const filePath = path.join(UPLOAD_DIR, path.basename(img.url));
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }
    await pool.query('DELETE FROM products WHERE id = $1', [req.params.id]);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// ── Image management ──────────────────────────────────────────────────────────

// POST /api/products/:id/images  — upload one or more images
router.post('/:id/images', requireAuth, upload.array('images', 20), async (req, res) => {
  try {
    const productId = parseInt(req.params.id);
    const { rows: [product] } = await pool.query('SELECT id FROM products WHERE id = $1', [productId]);
    if (!product) return res.status(404).json({ error: 'Product not found' });

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No images uploaded' });
    }

    // Find current max sort order
    const { rows: [maxRow] } = await pool.query(
      'SELECT COALESCE(MAX(sort_order), -1) AS max FROM product_images WHERE product_id = $1',
      [productId]
    );
    let sortOrder = (maxRow?.max ?? -1) + 1;

    const inserted = [];
    for (const file of req.files) {
      const relPath = file.filename;
      const isPrimary = sortOrder === 0;
      const { rows: [img] } = await pool.query(`
        INSERT INTO product_images (product_id, url, sort_order, is_primary)
        VALUES ($1, $2, $3, $4)
        RETURNING *
      `, [productId, relPath, sortOrder, isPrimary]);
      inserted.push({ ...img, url: imgUrl(req, img.url) });
      sortOrder++;
    }

    res.status(201).json(inserted);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /api/products/:id/images/:imageId
router.delete('/:id/images/:imageId', requireAuth, async (req, res) => {
  try {
    const { rows: [img] } = await pool.query(
      'SELECT * FROM product_images WHERE id = $1 AND product_id = $2',
      [req.params.imageId, req.params.id]
    );
    if (!img) return res.status(404).json({ error: 'Image not found' });

    // Delete file from disk
    const filePath = path.join(UPLOAD_DIR, path.basename(img.url));
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    await pool.query('DELETE FROM product_images WHERE id = $1', [img.id]);

    // If deleted image was primary, promote next image
    if (img.is_primary) {
      await pool.query(`
        UPDATE product_images SET is_primary = TRUE
        WHERE id = (
          SELECT id FROM product_images WHERE product_id = $1
          ORDER BY sort_order, id LIMIT 1
        )
      `, [req.params.id]);
    }

    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /api/products/:id/images/reorder  — update sort order
// Body: [{ id: 1, sort_order: 0 }, ...]
router.put('/:id/images/reorder', requireAuth, async (req, res) => {
  try {
    const { order } = req.body; // [{ id, sort_order }]
    if (!Array.isArray(order)) return res.status(400).json({ error: 'order must be an array' });

    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      for (const item of order) {
        await client.query(
          'UPDATE product_images SET sort_order = $1, is_primary = $2 WHERE id = $3 AND product_id = $4',
          [item.sort_order, item.sort_order === 0, item.id, req.params.id]
        );
      }
      await client.query('COMMIT');
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }

    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
