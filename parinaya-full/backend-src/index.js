require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const session = require('express-session');

const app = express();
const PORT = process.env.PORT || 4000;

// ─── CORS ──────────────────────────────────────────────────────────────────────
const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:5173',
  'http://localhost:3000',
  // Add your Vercel URL here: 'https://parinaya.vercel.app'
];

app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
    cb(new Error(`CORS blocked: ${origin}`));
  },
  credentials: true,
}));

// ─── Body parsers ──────────────────────────────────────────────────────────────
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));

// ─── Session (for admin panel HTML navigation) ─────────────────────────────────
app.use(session({
  secret: process.env.SESSION_SECRET || 'change_this_secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  },
}));

// ─── Static files ──────────────────────────────────────────────────────────────
// Serve uploaded product images
const UPLOAD_DIR = path.resolve(process.env.UPLOAD_DIR || 'uploads');
app.use('/uploads', express.static(UPLOAD_DIR));

// Serve admin panel static assets
app.use('/admin', express.static(path.join(__dirname, '../admin')));

// ─── API routes ────────────────────────────────────────────────────────────────
app.use('/api/auth',       require('./routes/auth'));
app.use('/api/categories', require('./routes/categories'));
app.use('/api/products',   require('./routes/products'));
app.use('/api/config',     require('./routes/config'));

// ─── Admin panel HTML routes ───────────────────────────────────────────────────
const { requireSession } = require('./middleware/auth');
const adminDir = path.join(__dirname, '../admin');

app.get('/admin',               (_req, res) => res.redirect('/admin/login'));
app.get('/admin/login',         (_req, res) => res.sendFile('login.html', { root: adminDir }));

// All other admin pages require session
app.get('/admin/dashboard',     requireSession, (_req, res) => res.sendFile('dashboard.html',   { root: adminDir }));
app.get('/admin/products',      requireSession, (_req, res) => res.sendFile('products.html',    { root: adminDir }));
app.get('/admin/products/new',  requireSession, (_req, res) => res.sendFile('product-form.html',{ root: adminDir }));
app.get('/admin/products/:id',  requireSession, (_req, res) => res.sendFile('product-form.html',{ root: adminDir }));
app.get('/admin/categories',    requireSession, (_req, res) => res.sendFile('categories.html',  { root: adminDir }));
app.get('/admin/settings',      requireSession, (_req, res) => res.sendFile('settings.html',    { root: adminDir }));

// ─── Health check ──────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => res.json({ status: 'ok', env: process.env.NODE_ENV }));

// ─── 404 ───────────────────────────────────────────────────────────────────────
app.use((_req, res) => res.status(404).json({ error: 'Route not found' }));

// ─── Error handler ─────────────────────────────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: err.message || 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`\n🪔  Sri Sri Parinaya backend running on port ${PORT}`);
  console.log(`   Admin panel → http://localhost:${PORT}/admin/login`);
  console.log(`   API         → http://localhost:${PORT}/api/\n`);
});
