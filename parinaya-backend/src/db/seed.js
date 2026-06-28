require('dotenv').config();
const pool = require('./pool');
const bcrypt = require('bcryptjs');

// ─── helpers ──────────────────────────────────────────────────────────────────
const slugify = (s) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

// ─── site config defaults ─────────────────────────────────────────────────────
const SITE_CONFIG = [
  // Brand
  { key: 'site_name',       value: 'Sri Sri Parinaya', label: 'Site Name',        group_name: 'brand' },
  { key: 'tagline',         value: 'Tanjore Paintings & Traditional Art', label: 'Tagline', group_name: 'brand' },
  { key: 'logo_text',       value: 'Parinaya',         label: 'Logo Text',         group_name: 'brand' },
  { key: 'logo_subtext',    value: 'TANJORE PAINTINGS',label: 'Logo Subtext',      group_name: 'brand' },
  { key: 'announcement',    value: 'Handcrafted Tanjore Paintings • Made to Order • Hyderabad, Telangana', label: 'Announcement Bar', group_name: 'brand' },

  // Contact
  { key: 'phone',           value: '7075703309',       label: 'Phone',             group_name: 'contact' },
  { key: 'phone_display',   value: '+91 70757 03309',  label: 'Phone Display',     group_name: 'contact' },
  { key: 'email',           value: 'parinayatanjorepaintings@gmail.com', label: 'Email', group_name: 'contact' },
  { key: 'address',         value: '1st floor, Sri Sri Parinaya, Kuna\'s Complex, Main Rd, above iWear Opticals, Friends Colony, Ambedkar Nagar, Hafeezpet, Miyapur, Hyderabad, Telangana 500049', label: 'Address', group_name: 'contact' },
  { key: 'whatsapp_number', value: '917075703309',     label: 'WhatsApp Number (with country code)', group_name: 'contact' },

  // Hours
  { key: 'hours_weekday',   value: 'Monday – Friday | 10:00 AM – 9:00 PM', label: 'Weekday Hours', group_name: 'hours' },
  { key: 'hours_saturday',  value: 'Saturday | 10:00 AM – 9:00 PM',       label: 'Saturday Hours', group_name: 'hours' },
  { key: 'hours_sunday',    value: 'Sunday | 10:00 AM – 9:00 PM',         label: 'Sunday Hours',   group_name: 'hours' },

  // Social
  { key: 'facebook_url',   value: 'https://www.facebook.com/share/161Js8hg64J/', label: 'Facebook URL', group_name: 'social' },
  { key: 'instagram_url',  value: 'https://www.instagram.com/srisriparinaya?igsh=MWNobG01MjBobGRlOQ==', label: 'Instagram URL', group_name: 'social' },
  { key: 'linkedin_url',   value: '',                  label: 'LinkedIn URL',      group_name: 'social' },

  // Product page defaults (accordion content)
  { key: 'shipping_returns_default', value: 'Orders once placed cannot be cancelled. Shipping is free across India, dispatched within 1–3 business days and delivered within 7 days of shipping.\n\nWe offer exchange or returns only on items that are damaged or defective, within 5 days of delivery.', label: 'Default Shipping & Returns Text', group_name: 'product_defaults' },
  { key: 'care_instructions_default', value: 'Clean only with a soft, dry cloth or soft brush. Avoid water, harsh chemicals or detergents to preserve the gold work and finish.', label: 'Default Care Instructions', group_name: 'product_defaults' },
  { key: 'please_note_default', value: 'As all pieces are handmade, slight variation in detailing, dimensions and weight is normal and part of the craft.', label: 'Default Please Note', group_name: 'product_defaults' },
  { key: 'trust_badge_1_default', value: 'Free shipping across India, dispatched in 1–3 business days', label: 'Trust Badge 1 (Shipping)', group_name: 'product_defaults' },
  { key: 'trust_badge_2_default', value: 'Handmade by skilled artisans — quality checked before dispatch', label: 'Trust Badge 2 (Quality)', group_name: 'product_defaults' },


  // Hero section extended
  { key: 'hero_eyebrow',    value: 'Handcrafted in South India', label: 'Hero Eyebrow Text',    group_name: 'homepage' },
  { key: 'hero_body',       value: 'Discover handpainted Tanjore art, brass idols and traditional decor — crafted by skilled artisans and finished with genuine gold foil work, true to centuries of South Indian heritage.', label: 'Hero Body Text', group_name: 'homepage' },
  { key: 'hero_cta1_label', value: 'Shop Paintings',                     label: 'Hero Button 1 Label', group_name: 'homepage' },
  { key: 'hero_cta1_link',  value: '/collections/all-tanjore-paintings', label: 'Hero Button 1 Link',  group_name: 'homepage' },
  { key: 'hero_cta2_label', value: 'Shop Brass Idols',                   label: 'Hero Button 2 Label', group_name: 'homepage' },
  { key: 'hero_cta2_link',  value: '/collections/brass-idols',           label: 'Hero Button 2 Link',  group_name: 'homepage' },
  { key: 'hero_bg_image',   value: '',                                   label: 'Hero Background Image (filename)', group_name: 'homepage' },

  // YouTube section
  { key: 'youtube_url',              value: 'https://youtu.be/XMeQRjdU6GU', label: 'YouTube Video URL',      group_name: 'homepage' },
  { key: 'youtube_section_title',    value: 'See Our Craft in Action',       label: 'YouTube Section Title',   group_name: 'homepage' },
  { key: 'youtube_section_subtitle', value: 'Watch how every Tanjore painting comes to life — from wooden board to gold leaf.', label: 'YouTube Subtitle', group_name: 'homepage' },

  // Our Story / About section
  { key: 'story_eyebrow', value: 'Our Story',                           label: 'Story Eyebrow',  group_name: 'homepage' },
  { key: 'story_heading', value: 'A Tradition of Gold, Painted by Hand',label: 'Story Heading',  group_name: 'homepage' },
  { key: 'story_body1',   value: 'At Sri Sri Parinaya, every Tanjore painting begins with a wooden base, layers of gesso relief, and genuine gold foil — applied by hand, the way it has been done for generations. From idols for daily worship to centerpieces for weddings, each piece carries the craft of South India into modern homes.', label: 'Story Body Paragraph 1', group_name: 'homepage' },
  { key: 'story_body2',   value: 'Visit our studio in Hyderabad to see the artistry up close, or reach out on WhatsApp for a piece made just for you.', label: 'Story Body Paragraph 2', group_name: 'homepage' },
  { key: 'story_image',   value: '', label: 'Story Section Image (filename)', group_name: 'homepage' },
  // Hero (legacy keys kept for compatibility)
  { key: 'hero_heading',    value: 'Handcrafted Tanjore Art', label: 'Hero Heading', group_name: 'homepage' },
  { key: 'hero_subheading', value: 'Gold foil. Precious stones. Timeless devotion.', label: 'Hero Subheading', group_name: 'homepage' },
  { key: 'hero_cta_label',  value: 'Explore Collection',     label: 'Hero CTA Label', group_name: 'homepage' },
  { key: 'about_strip_text',value: 'Each piece in our collection is handcrafted by master artisans in Tanjore, using centuries-old techniques — gold foil work, gesso embossing, and natural pigments — to create heirlooms that outlast generations.', label: 'About Strip Text', group_name: 'homepage' },
];

// ─── categories ───────────────────────────────────────────────────────────────
const CATEGORIES = [
  { name: 'Pooja Items',                    description: 'Traditional items for daily worship and rituals' },
  { name: 'Marriage Items',                 description: 'Curated pieces for weddings and ceremonies' },
  { name: 'All Tanjore Paintings',          description: 'Our complete collection of handcrafted Tanjore art' },
  { name: 'Fully 3D Embossed Paintings',    description: 'Richly embossed paintings with raised gesso work' },
  { name: 'Semi Embossed Tanjore Paintings',description: 'Subtle relief work paired with fine gold leafing' },
  { name: 'Brass Idols',                    description: 'Handcast brass deities for home and temple' },
  { name: 'Marriage',                        description: 'Wedding essentials and ceremonial decor' },
  { name: 'Return Gifts',                   description: 'Thoughtful keepsakes for guests and ceremonies' },
  { name: 'Marriage Dolls and Backdrops',   description: 'Traditional dolls and decorative backdrops' },
  { name: 'Varamahalaxmi Items',            description: 'Festive essentials for Varamahalakshmi puja' },
];

// ─── products (seed data mirroring the frontend mock) ─────────────────────────
const PRODUCTS = [
  { name: 'Goddess Lakshmi Tanjore Painting',  category: 'All Tanjore Paintings',          price: 18500, featured: true,  description: 'An exquisite Tanjore painting of Goddess Lakshmi, finished with genuine gold foil work and embellished with semi-precious stones. A symbol of prosperity and abundance for any home or temple.', dimensions: 'Height - 24 Inches  Width - 18 Inches  Weight - 2.5 Kg' },
  { name: 'Lord Ganesha 3D Embossed Painting', category: 'Fully 3D Embossed Paintings',    price: 22000, featured: true,  description: 'A fully 3D embossed Tanjore painting of Lord Ganesha with deep relief gesso work, hand-gilded in 24K gold foil, and finished with vibrant natural dyes.', dimensions: 'Height - 22 Inches  Width - 16 Inches  Weight - 3 Kg' },
  { name: 'Krishna with Cow Semi Embossed',    category: 'Semi Embossed Tanjore Paintings', price: 15500, featured: true,  description: 'A graceful semi-embossed depiction of Lord Krishna with a cow, rendered in fine detail with subtle relief work and traditional gold leafing.', dimensions: 'Height - 20 Inches  Width - 15 Inches  Weight - 2 Kg' },
  { name: 'Brass Ganesha Idol',                category: 'Brass Idols',                     price: 6500,  featured: true,  description: 'A handcast brass idol of Lord Ganesha with intricate detailing, ideal for home altars and gifting. Finished with a traditional antique polish.', dimensions: 'Height - 9 Inches  Width - 6 Inches  Weight - 1.8 Kg' },
  { name: 'Brass Lakshmi Idol',                category: 'Brass Idols',                     price: 7200,  featured: false, description: 'A finely detailed brass idol of Goddess Lakshmi, handcrafted by skilled artisans, perfect for daily worship or as an auspicious gift.', dimensions: 'Height - 10 Inches  Width - 6 Inches  Weight - 2 Kg' },
  { name: 'Brass Pooja Thali Set',             category: 'Pooja Items',                     price: 3200,  featured: false, description: 'A complete brass pooja thali set including diya, kumkum holder, bell, and incense stand — everything needed for daily rituals.', dimensions: 'Diameter - 12 Inches' },
  { name: 'Brass Diya Pair',                   category: 'Pooja Items',                     price: 1450,  featured: false, description: 'A pair of traditional brass diyas with engraved detailing, perfect for daily pooja and festive decoration.', dimensions: 'Height - 4 Inches each' },
  { name: 'Wedding Mandap Backdrop Panel',     category: 'Marriage Dolls and Backdrops',    price: 28000, featured: false, description: 'A grand hand-painted backdrop panel designed for wedding mandaps, featuring traditional motifs and gold detailing.', dimensions: 'Height - 6 Feet  Width - 4 Feet' },
  { name: 'Traditional Marriage Dolls (Pair)', category: 'Marriage Dolls and Backdrops',    price: 4500,  featured: false, description: 'A handcrafted pair of traditional marriage dolls dressed in silk and gold-toned ornaments, a customary gifting tradition.', dimensions: 'Height - 14 Inches each' },
  { name: 'Return Gift Brass Diya Set (Pack of 10)', category: 'Return Gifts',              price: 5000,  featured: false, description: 'A set of 10 small brass diyas, individually packaged, ideal as elegant return gifts for weddings and ceremonies.', dimensions: 'Height - 2.5 Inches each' },
  { name: 'Varamahalakshmi Kalash Set',        category: 'Varamahalaxmi Items',             price: 8900,  featured: false, description: 'A traditional brass kalash set with coconut topper and decorative cloth, essential for Varamahalakshmi puja celebrations.', dimensions: 'Height - 11 Inches' },
  { name: 'Varamahalakshmi Saree Drape Idol Set', category: 'Varamahalaxmi Items',          price: 12500, featured: false, description: 'An elegant idol and saree drape set for Varamahalakshmi puja, complete with ornaments and traditional accessories.', dimensions: 'Height - 16 Inches' },
  { name: 'Wedding Garland Tray Set',          category: 'Marriage Items',                  price: 3800,  featured: false, description: 'A decorative brass tray set used for presenting garlands during wedding ceremonies, finished with traditional engravings.', dimensions: 'Diameter - 14 Inches' },
  { name: 'Engagement Ring Platter',           category: 'Marriage',                        price: 2600,  featured: false, description: 'A beautifully designed platter for ring exchange ceremonies, crafted in brass with intricate floral detailing.', dimensions: 'Diameter - 10 Inches' },
  { name: 'Radha Krishna Tanjore Painting',    category: 'All Tanjore Paintings',           price: 19500, featured: true,  description: 'A beautifully composed Tanjore painting of Radha Krishna, finished with gold foil and embedded stones, capturing divine love and devotion.', dimensions: 'Height - 22 Inches  Width - 17 Inches  Weight - 2.3 Kg' },
  { name: 'Saraswati 3D Embossed Painting',   category: 'Fully 3D Embossed Paintings',     price: 24500, featured: false, description: 'A fully embossed Tanjore painting of Goddess Saraswati, with deep gesso relief and hand-applied gold foil, ideal for those who seek knowledge and wisdom.', dimensions: 'Height - 24 Inches  Width - 18 Inches  Weight - 3.2 Kg' },
  { name: 'Venkateswara Semi Embossed Painting', category: 'Semi Embossed Tanjore Paintings', price: 16800, featured: false, description: 'A semi-embossed Tanjore painting of Lord Venkateswara, finished with traditional gold leafing and fine detailing.', dimensions: 'Height - 20 Inches  Width - 16 Inches  Weight - 2.1 Kg' },
  { name: 'Brass Nandi Idol',                 category: 'Brass Idols',                      price: 5400,  featured: false, description: 'A graceful brass idol of Nandi, handcast with fine musculature detail, perfect for Shiva temple altars.', dimensions: 'Height - 7 Inches  Width - 10 Inches  Weight - 1.6 Kg' },
];

// ─── main ─────────────────────────────────────────────────────────────────────
async function seed() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Admin user
    const adminEmail    = process.env.ADMIN_EMAIL    || 'admin@srisriparinaya.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@1234';
    const hash = await bcrypt.hash(adminPassword, 12);
    await client.query(`
      INSERT INTO admins (email, password, name)
      VALUES ($1, $2, 'Admin')
      ON CONFLICT (email) DO NOTHING
    `, [adminEmail, hash]);
    console.log(`👤  Admin: ${adminEmail}`);

    // 2. Site config
    for (const row of SITE_CONFIG) {
      await client.query(`
        INSERT INTO site_config (key, value, label, group_name)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (key) DO NOTHING
      `, [row.key, row.value, row.label, row.group_name]);
    }
    console.log(`⚙️   Site config: ${SITE_CONFIG.length} keys`);

    // 3. Categories
    const catIdMap = {};
    for (let i = 0; i < CATEGORIES.length; i++) {
      const cat = CATEGORIES[i];
      const slug = slugify(cat.name);
      const res = await client.query(`
        INSERT INTO categories (name, slug, description, sort_order)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
        RETURNING id
      `, [cat.name, slug, cat.description, i]);
      catIdMap[cat.name] = res.rows[0].id;
    }
    console.log(`📂  Categories: ${CATEGORIES.length}`);

    // 4. Products
    let added = 0;
    for (let i = 0; i < PRODUCTS.length; i++) {
      const p = PRODUCTS[i];
      const slug = slugify(p.name);
      const catId = catIdMap[p.category] || null;
      const res = await client.query(`
        INSERT INTO products (name, slug, category_id, price, featured, description, dimensions, sort_order)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        ON CONFLICT (slug) DO NOTHING
        RETURNING id
      `, [p.name, slug, catId, p.price, p.featured, p.description, p.dimensions || '', i]);
      if (res.rows.length > 0) added++;
    }
    console.log(`🛍️   Products seeded: ${added}`);

    await client.query('COMMIT');
    console.log('✅  Seed complete.');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

seed().catch((err) => {
  console.error('❌  Seed failed:', err.message);
  process.exit(1);
});
