import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getCategoryBySlug, getCategories, getProductsByCategory } from '../services/api';
import { useConfig } from '../hooks/useConfig';
import ProductCard from '../components/product/ProductCard';
import Breadcrumb from '../components/ui/Breadcrumb';

export default function Collection() {
  const { slug } = useParams();
  const { config } = useConfig();
  const [category, setCategory] = useState(null);
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const waNumber = config.whatsapp_number || '917075703309';

  useEffect(() => {
    setLoading(true);
    setNotFound(false);
    Promise.all([
      getCategoryBySlug(slug),
      getCategories(),
      getProductsByCategory(slug),
    ]).then(([cat, cats, prods]) => {
      if (!cat) { setNotFound(true); return; }
      setCategory(cat);
      setCategories(cats);
      setProducts(prods);
    }).catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center text-ink/50">
      Loading…
    </div>
  );

  if (notFound) return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
      <h1 className="font-display text-3xl mb-4">Collection Not Found</h1>
      <Link to="/" className="text-gold-dark underline">Return home</Link>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
      <Breadcrumb items={[{ label: category.name }]} />

      <div className="mt-6 mb-10 border-b border-line pb-8">
        <h1 className="font-display text-3xl sm:text-4xl text-ink mb-2">{category.name}</h1>
        <p className="text-ink/60 text-sm sm:text-base max-w-2xl">{category.description}</p>
      </div>

      {/* Category switcher */}
      <div className="flex gap-2 overflow-x-auto scrollbar-thin pb-3 mb-8 -mx-1 px-1">
        {categories.map((cat) => (
          <Link
            key={cat.id}
            to={`/collections/${cat.slug}`}
            className={`flex-shrink-0 text-xs tracking-wide uppercase px-4 py-2 border whitespace-nowrap transition-colors ${
              cat.slug === slug
                ? 'bg-ink text-paper border-ink'
                : 'border-line text-ink/70 hover:border-ink'
            }`}
          >
            {cat.name}
          </Link>
        ))}
      </div>

      {products.length === 0 ? (
        <div className="py-20 text-center border border-dashed border-line">
          <p className="text-ink/60 mb-4">New pieces for this collection are on their way.</p>
          <a
            href={`https://wa.me/${waNumber}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm uppercase tracking-wide text-gold-dark underline"
          >
            Ask us on WhatsApp
          </a>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 sm:gap-8">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
