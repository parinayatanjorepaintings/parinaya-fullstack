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

export async function buildWhatsAppLink(productName, productImage, productPrice) {
  const cfg = await getSiteConfig();
  const number = cfg.whatsapp_number || '917075703309';
  const base = `https://wa.me/${number}`;
  if (!productName) return base;

  let message = `Hi! I'm interested in purchasing this item from Sri Sri Parinaya:\n\n`;
  message += `🛕 *${productName}*\n`;
  if (productPrice) message += `💰 Price: ₹${Number(productPrice).toLocaleString('en-IN')}\n`;
  if (productImage) message += `🖼️ Image: ${productImage}\n`;
  message += `\nCould you please share more details and confirm availability?`;

  return `${base}?text=${encodeURIComponent(message)}`;
}

// Builds a WhatsApp link listing every item currently in the cart, e.g.:
//   Hi, I'm interested in the following products:
//   1. Lakshmi Tanjore Painting x2
//   2. Brass Ganesha Idol x1
//   Could you share more details?
export async function buildWhatsAppLinkForCart(items) {
  const cfg = await getSiteConfig();
  const number = cfg.whatsapp_number || '917075703309';
  const base = `https://wa.me/${number}`;
  if (!items || !items.length) return base;

  const lines = items.map((item, i) => `${i + 1}. ${item.name} x${item.qty}`);
  const message = `Hi, I'm interested in the following products:\n${lines.join('\n')}\n\nCould you share more details?`;
  const text = encodeURIComponent(message);
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

// ─── YouTube Videos ────────────────────────────────────────────────────────────
export async function getYoutubeVideos() {
  return get('/api/youtube-videos');
}
