const express = require('express');
const pool = require('../db/pool');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

// GET /api/youtube-videos  — public, active videos only, for the homepage slider
router.get('/', async (_req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT id, url, title FROM youtube_videos WHERE active = TRUE ORDER BY sort_order, id'
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/youtube-videos/admin  — all videos (incl. inactive), for the admin list
router.get('/admin', requireAuth, async (_req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM youtube_videos ORDER BY sort_order, id'
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/youtube-videos  — add a video
router.post('/', requireAuth, async (req, res) => {
  try {
    const { url, title, sort_order } = req.body;
    if (!url) return res.status(400).json({ error: 'URL is required' });
    const { rows } = await pool.query(
      `INSERT INTO youtube_videos (url, title, sort_order) VALUES ($1, $2, $3) RETURNING *`,
      [url, title || null, sort_order || 0]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /api/youtube-videos/:id  — update a video
router.put('/:id', requireAuth, async (req, res) => {
  try {
    const { url, title, sort_order, active } = req.body;
    const { rows } = await pool.query(
      `UPDATE youtube_videos
       SET url = COALESCE($1, url),
           title = $2,
           sort_order = COALESCE($3, sort_order),
           active = COALESCE($4, active)
       WHERE id = $5
       RETURNING *`,
      [url, title ?? null, sort_order, active, req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Video not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /api/youtube-videos/:id
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const { rowCount } = await pool.query('DELETE FROM youtube_videos WHERE id = $1', [req.params.id]);
    if (!rowCount) return res.status(404).json({ error: 'Video not found' });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
