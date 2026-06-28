# Sri Sri Parinaya — Backend & Admin Panel

Full Node.js/Express backend with PostgreSQL (Neon-compatible) and a
complete admin panel for managing products, categories, images, and all
site content.

---

## Project Structure

```
parinaya-backend/
├── src/
│   ├── index.js              # Express app entry point
│   ├── db/
│   │   ├── pool.js           # PostgreSQL connection pool
│   │   ├── init.js           # Create all tables  (npm run db:init)
│   │   └── seed.js           # Seed default data  (npm run db:seed)
│   ├── middleware/
│   │   ├── auth.js           # JWT + session auth guards
│   │   └── upload.js         # Multer image upload config
│   └── routes/
│       ├── auth.js           # Login / logout / change-password
│       ├── categories.js     # Category CRUD
│       ├── products.js       # Product CRUD + image management
│       └── config.js         # Site config key-value store
├── admin/                    # Self-contained admin panel (HTML/CSS/JS)
│   ├── login.html
│   ├── dashboard.html
│   ├── products.html
│   ├── product-form.html     # Add & Edit product (same file)
│   ├── categories.html
│   ├── settings.html
│   ├── css/admin.css
│   └── js/
│       ├── admin.js          # API helper, toast, auth guard
│       └── sidebar.js        # Sidebar HTML + icons
├── uploads/                  # Local image storage (auto-created)
├── .env.example              # Copy to .env and fill in
├── FRONTEND_API_SERVICE.js   # Drop this into your Vite frontend
├── FRONTEND_.env.example     # .env.local template for the frontend
└── package.json
```

---

## Quick Start (Development with Neon DB)

### 1. Get a Neon database

Go to https://neon.tech → create a free project → copy the connection string.

### 2. Configure environment

```bash
cp .env.example .env
# Edit .env — paste your Neon DATABASE_URL, set JWT_SECRET, etc.
```

### 3. Install and initialise

```bash
npm install
npm run db:init     # creates all tables
npm run db:seed     # inserts default categories, products, site config
```

### 4. Start the backend

```bash
npm run dev         # development (nodemon)
# or
npm start           # production
```

Backend runs on **http://localhost:4000**

Admin panel: **http://localhost:4000/admin/login**
Default login: `admin@srisriparinaya.com` / `Admin@1234`
(Change this immediately in Settings → Account)

---

## Wiring Up the Frontend (Vite / React)

### 1. Add the API service

Copy `FRONTEND_API_SERVICE.js` into your frontend:

```bash
cp FRONTEND_API_SERVICE.js ../parinaya-tanjore/src/services/api.js
```

### 2. Add the env file

Copy `FRONTEND_.env.example` to `../parinaya-tanjore/.env.local`:

```
VITE_API_URL=http://localhost:4000
```

### 3. Update your components

Replace static imports from `../data/products` and `../data/categories`
with the async API calls. Example for **Home.jsx**:

```jsx
import { getFeaturedProducts, getCategories } from '../services/api';

// In your component:
const [products, setProducts] = useState([]);
const [cats, setCats]         = useState([]);

useEffect(() => {
  getFeaturedProducts().then(setProducts);
  getCategories().then(setCats);
}, []);
```

Example for **Collection.jsx** (slug-based):

```jsx
import { getProductsByCategory, getCategoryBySlug } from '../services/api';

const { slug } = useParams();
useEffect(() => {
  getCategoryBySlug(slug).then(setCat);
  getProductsByCategory(slug).then(setProducts);
}, [slug]);
```

Example for **ProductDetail.jsx**:

```jsx
import { getProductById, getRelatedProducts } from '../services/api';

const { id } = useParams();
useEffect(() => {
  getProductById(id).then(setProduct);
  getRelatedProducts(id).then(setRelated);
}, [id]);
```

For the WhatsApp link (replaces `buildWhatsAppLink` from siteConfig):

```jsx
import { buildWhatsAppLink } from '../services/api';

// async in useEffect or await in an onClick handler
const link = await buildWhatsAppLink(product.name);
```

For the **siteConfig** (logo, announcement, etc.):

```jsx
import { getSiteConfig } from '../services/api';

const [config, setConfig] = useState({});
useEffect(() => { getSiteConfig().then(setConfig); }, []);

// Then use config.logo_text, config.announcement, etc.
```

**Image URLs** — the backend returns full absolute URLs for all product
images (e.g. `http://localhost:4000/uploads/1234567-abc.jpg`).  
In production they will be `https://api.yourdomain.com/uploads/…`.  
No extra path-building needed in the frontend.

---

## API Reference

### Public (no auth needed — called by the frontend)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/config` | All site config as `{ key: value }` |
| GET | `/api/categories` | Active categories with product counts |
| GET | `/api/categories/:slug` | Single category by slug |
| GET | `/api/products` | Products (query: `category`, `featured`, `page`, `limit`) |
| GET | `/api/products/:idOrSlug` | Single product with images |
| GET | `/api/products/:idOrSlug/related` | Related products (same category) |

### Admin (JWT Bearer token required)

**Auth**

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/auth/login` | `{ email, password }` → `{ token, admin }` |
| POST | `/api/auth/logout` | Clear session |
| GET | `/api/auth/me` | Current admin info |
| POST | `/api/auth/change-password` | `{ currentPassword, newPassword }` |

**Categories**

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/categories/admin/all` | All categories including inactive |
| POST | `/api/categories` | Create category |
| PUT | `/api/categories/:id` | Update category |
| DELETE | `/api/categories/:id` | Delete (blocks if products exist) |

**Products**

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/products/admin/all` | All products including inactive |
| POST | `/api/products` | Create product |
| PUT | `/api/products/:id` | Update product |
| DELETE | `/api/products/:id` | Delete product + images |
| POST | `/api/products/:id/images` | Upload images (multipart, field: `images`) |
| DELETE | `/api/products/:id/images/:imageId` | Delete single image |
| PUT | `/api/products/:id/images/reorder` | Reorder images `{ order: [{ id, sort_order }] }` |

**Config**

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/config/admin` | Full config with labels and groups |
| PUT | `/api/config` | Bulk update `{ key: value, … }` |
| PUT | `/api/config/:key` | Update single key |

---

## Admin Panel Features

| Page | What you can do |
|------|----------------|
| **Dashboard** | Stats overview, recent products at a glance |
| **Products** | List, search, filter by category; quick edit/delete |
| **Add/Edit Product** | Name, category, price, description, dimensions, weight, trust badges, shipping/care/note accordion text per product, in-stock & featured toggles, sort order, multi-image upload with primary selection |
| **Categories** | Add new category → immediately appears in frontend menus; edit name/description/order/visibility; delete (blocked if products exist) |
| **Settings → Brand** | Site name, tagline, logo text/subtext, announcement bar |
| **Settings → Contact** | Phone, WhatsApp number, email, address, business hours |
| **Settings → Social** | Facebook, Instagram, LinkedIn URLs |
| **Settings → Homepage** | Hero heading, subheading, CTA label, about strip text |
| **Settings → Product Defaults** | Default trust badge text, default shipping/care/note accordion content (per-product overrides these) |
| **Settings → Account** | Change admin password |

---

## VPS Deployment

### 1. Server setup (Ubuntu 22 LTS)

```bash
# Install Node 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PostgreSQL
sudo apt install -y postgresql postgresql-contrib
sudo -u postgres psql -c "CREATE USER parinaya_user WITH PASSWORD 'strongpassword';"
sudo -u postgres psql -c "CREATE DATABASE parinaya_db OWNER parinaya_user;"
```

### 2. Clone and configure

```bash
git clone <your-repo> /var/www/parinaya-backend
cd /var/www/parinaya-backend
cp .env.example .env
# Edit .env: set DATABASE_URL to local postgres, set NODE_ENV=production
# DATABASE_URL=postgresql://parinaya_user:strongpassword@localhost:5432/parinaya_db
npm install --omit=dev
npm run db:init
npm run db:seed
```

### 3. PM2 process manager

```bash
npm install -g pm2
pm2 start src/index.js --name parinaya-backend
pm2 save
pm2 startup
```

### 4. Nginx reverse proxy

```nginx
server {
    listen 80;
    server_name api.srisriparinaya.com;

    client_max_body_size 20M;

    location / {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
sudo certbot --nginx -d api.srisriparinaya.com
```

### 5. Uploads persistence

The `uploads/` folder lives on the VPS. When you deploy updates, make
sure this folder is **not** deleted (keep it outside the git repo or
use a persistent volume).

For future CDN migration (Cloudinary / S3), only `src/middleware/upload.js`
and the URL-building logic in `src/routes/products.js` need to change —
the rest of the code stays identical.

---

## Vercel (Frontend)

In Vercel project settings → Environment Variables:

```
VITE_API_URL = https://api.srisriparinaya.com
```

Then redeploy. That's it.

---

## Security Checklist Before Going Live

- [ ] Change `ADMIN_EMAIL` and `ADMIN_PASSWORD` in `.env` (or update via Settings → Account after seeding)
- [ ] Set a long random `JWT_SECRET` (32+ chars)
- [ ] Set `NODE_ENV=production`
- [ ] Set `FRONTEND_URL` to your actual Vercel URL (CORS)
- [ ] Enable HTTPS on the VPS (Certbot/Let's Encrypt)
- [ ] Restrict PostgreSQL to localhost only
- [ ] Set up regular database backups
