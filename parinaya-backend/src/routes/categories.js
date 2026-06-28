const express = require('express');
const pool = require('../db/pool');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

const slugify = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

// ── Public ────────────────────────────────────────────────────────────────────

// GET /api/categories  — all active categories
router.get('/', async (_req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT c.*, COUNT(p.id)::int AS product_count
      FROM categories c
      LEFT JOIN products p ON p.category_id = c.id AND p.active = TRUE
      WHERE c.active = TRUE
      GROUP BY c.id
      ORDER BY c.sort_order, c.name
    `);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/categories/:slug
router.get('/:slug', async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM categories WHERE slug = $1 AND active = TRUE',
      [req.params.slug]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Category not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// ── Admin ─────────────────────────────────────────────────────────────────────

// GET /api/categories/admin/all  — all categories including inactive
router.get('/admin/all', requireAuth, async (_req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT c.*, COUNT(p.id)::int AS product_count
      FROM categories c
      LEFT JOIN products p ON p.category_id = c.id
      GROUP BY c.id
      ORDER BY c.sort_order, c.name
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/categories
router.post('/', requireAuth, async (req, res) => {
  try {
    const { name, description, sort_order = 0 } = req.body;
    if (!name) return res.status(400).json({ error: 'Name is required' });

    const slug = slugify(name);

    // Check slug uniqueness
    const existing = await pool.query('SELECT id FROM categories WHERE slug = $1', [slug]);
    if (existing.rows.length) return res.status(409).json({ error: 'A category with this name already exists' });

    const { rows } = await pool.query(`
      INSERT INTO categories (name, slug, description, sort_order)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `, [name, slug, description || '', sort_order]);
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /api/categories/:id
router.put('/:id', requireAuth, async (req, res) => {
  try {
    const { name, description, sort_order, active } = req.body;
    const { rows: current } = await pool.query('SELECT * FROM categories WHERE id = $1', [req.params.id]);
    if (!current[0]) return res.status(404).json({ error: 'Not found' });

    const newName = name ?? current[0].name;
    const newSlug = slugify(newName);

    // Check slug conflict
    const conflict = await pool.query('SELECT id FROM categories WHERE slug = $1 AND id != $2', [newSlug, req.params.id]);
    if (conflict.rows.length) return res.status(409).json({ error: 'Another category already has this name' });

    const { rows } = await pool.query(`
      UPDATE categories SET
        name        = $1,
        slug        = $2,
        description = $3,
        sort_order  = $4,
        active      = $5
      WHERE id = $6
      RETURNING *
    `, [
      newName,
      newSlug,
      description ?? current[0].description,
      sort_order  ?? current[0].sort_order,
      active      ?? current[0].active,
      req.params.id,
    ]);
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /api/categories/:id
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    // Check if any products use this category
    const { rows: products } = await pool.query(
      'SELECT COUNT(*)::int AS cnt FROM products WHERE category_id = $1',
      [req.params.id]
    );
    if (products[0].cnt > 0) {
      return res.status(400).json({
        error: `Cannot delete: ${products[0].cnt} product(s) are in this category. Re-assign them first.`,
      });
    }
    await pool.query('DELETE FROM categories WHERE id = $1', [req.params.id]);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
