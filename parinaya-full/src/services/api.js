// Central API service — all data comes from the backend, no static files needed.
// Set VITE_API_URL in .env.local (dev) or Vercel env vars (prod).

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000';

async function get(path) {
  const res = await fetch(`${BASE}${path}`);
  if (!res.ok) throw new Error(`API ${res.status}: ${path}`);
  return res.json();
}

// ─── Site Config ─────────────────────────────────────────────────────────────
let _cfg = null;
export async function getSiteConfig() {
  if (_cfg) return _cfg;
  _cfg = await get('/api/config');
  return _cfg;
}

export async function buildWhatsAppLink(productName) {
  const cfg = await getSiteConfig();
  const number = cfg.whatsapp_number || '917075703309';
  const base = `https://wa.me/${number}`;
  if (!productName) return base;
  const text = encodeURIComponent(`Hi, I'm interested in "${productName}". Could you share more details?`);
  return `${base}?text=${text}`;
}

// ─── Categories ───────────────────────────────────────────────────────────────
export async function getCategories() {
  return get('/api/categories');
}

export async function getCategoryBySlug(slug) {
  return get(`/api/categories/${slug}`).catch(() => null);
}

// ─── Products ─────────────────────────────────────────────────────────────────
export async function getFeaturedProducts() {
  return get('/api/products?featured=true');
}

export async function getProductsByCategory(slug) {
  return get(`/api/products?category=${encodeURIComponent(slug)}`);
}

export async function getProductById(id) {
  return get(`/api/products/${id}`);
}

export async function getRelatedProducts(id) {
  return get(`/api/products/${id}/related`);
}
