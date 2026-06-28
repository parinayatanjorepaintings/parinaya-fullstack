import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getFeaturedProducts } from '../../services/api';
import ProductCard from '../product/ProductCard';

export default function FeaturedProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getFeaturedProducts()
      .then(setProducts)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <section className="bg-cream border-y border-line">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="aspect-[4/5] bg-cream border border-line animate-pulse" />
          ))}
        </div>
      </div>
    </section>
  );

  if (!products.length) return null;

  return (
    <section className="bg-cream border-y border-line">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <div className="flex items-end justify-between mb-12 flex-wrap gap-4">
          <div>
            <p className="text-xs tracking-widest2 uppercase text-gold-dark mb-3">Curated</p>
            <h2 className="font-display text-3xl sm:text-4xl text-ink">Featured Pieces</h2>
          </div>
          <Link
            to="/collections/all-tanjore-paintings"
            className="text-sm tracking-wide uppercase text-ink border-b border-ink pb-0.5 hover:text-gold-dark hover:border-gold-dark transition-colors"
          >
            View All
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
