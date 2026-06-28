// Route for uploading site-level images (hero bg, story image)
const express = require('express');
const path = require('path');
const fs = require('fs');
const pool = require('../db/pool');
const { requireAuth } = require('../middleware/auth');
const { upload, UPLOAD_DIR } = require('../middleware/upload');

const router = express.Router();

// POST /api/siteimages/:key  — upload a single image and save its filename to site_config
router.post('/:key', requireAuth, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No image uploaded' });

    const key = req.params.key;
    const allowedKeys = ['hero_bg_image', 'story_image'];
    if (!allowedKeys.includes(key)) {
      return res.status(400).json({ error: 'Invalid image key' });
    }

    const filename = req.file.filename;

    // Delete old file if there was one
    const { rows } = await pool.query('SELECT value FROM site_config WHERE key = $1', [key]);
    if (rows[0]?.value) {
      const oldPath = path.join(UPLOAD_DIR, path.basename(rows[0].value));
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }

    await pool.query(
      `INSERT INTO site_config (key, value, label, group_name)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value`,
      [key, filename, key === 'hero_bg_image' ? 'Hero Background Image' : 'Story Section Image', 'homepage']
    );

    const base = `${req.protocol}://${req.get('host')}`;
    res.json({ url: `${base}/uploads/${filename}`, filename });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /api/siteimages/:key  — remove image
router.delete('/:key', requireAuth, async (req, res) => {
  try {
    const key = req.params.key;
    const { rows } = await pool.query('SELECT value FROM site_config WHERE key = $1', [key]);
    if (rows[0]?.value) {
      const oldPath = path.join(UPLOAD_DIR, path.basename(rows[0].value));
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }
    await pool.query('UPDATE site_config SET value = $1 WHERE key = $2', ['', key]);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
