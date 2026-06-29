const express = require('express');
const pool = require('../db/pool');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

// GET /api/config  — public config for the frontend
router.get('/', async (_req, res) => {
  try {
    const { rows } = await pool.query('SELECT key, value FROM site_config ORDER BY group_name, key');
    const config = {};
    for (const row of rows) config[row.key] = row.value;
    res.json(config);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/config/admin  — full config with metadata for admin UI
router.get('/admin', requireAuth, async (_req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM site_config ORDER BY group_name, key'
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /api/config  — bulk update; body: { key: value, ... }
router.put('/', requireAuth, async (req, res) => {
  try {
    const updates = req.body;
    if (typeof updates !== 'object' || Array.isArray(updates)) {
      return res.status(400).json({ error: 'Body must be a key-value object' });
    }

    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      for (const [key, value] of Object.entries(updates)) {
        await client.query(
          `INSERT INTO site_config (key, value)
           VALUES ($1, $2)
           ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value`,
          [key, String(value)]
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

// PUT /api/config/:key  — update single key
router.put('/:key', requireAuth, async (req, res) => {
  try {
    const { value } = req.body;
    const { rowCount } = await pool.query(
      'UPDATE site_config SET value = $1 WHERE key = $2',
      [String(value ?? ''), req.params.key]
    );
    if (!rowCount) return res.status(404).json({ error: 'Config key not found' });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
