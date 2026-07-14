const BASE = import.meta.env.VITE_API_URL || 'https://api.srisriparinaya.com';

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

// ─── Categories ───────────────────────────────────────────────────────────────
// Returns nested structure: main categories with subcategories[] array
export async function getCategories() {
  return get('/api/categories');
}

// Returns flat list — used in product form dropdowns
export async function getCategoriesFlat() {
  return get('/api/categories/flat');
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
