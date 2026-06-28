import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getCategories } from '../../services/api';

export default function CategoryGrid() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCategories()
      .then(setCategories)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="aspect-[4/5] bg-cream border border-line animate-pulse" />
        ))}
      </div>
    </section>
  );

  if (!categories.length) return null;

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
      <div className="text-center mb-12">
        <p className="text-xs tracking-widest2 uppercase text-gold-dark mb-3">Browse</p>
        <h2 className="font-display text-3xl sm:text-4xl text-ink">Shop by Category</h2>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6">
        {categories.map((cat) => (
          <Link
            key={cat.id}
            to={`/collections/${cat.slug}`}
            className="group flex flex-col"
          >
            <div className="relative aspect-[4/5] overflow-hidden bg-cream border border-line mb-3 flex items-center justify-center">
              {/* Category image placeholder — add real category images from admin later */}
              <div className="w-full h-full bg-gradient-to-b from-cream to-stone-200 flex items-end justify-center pb-4">
                <span className="text-xs text-ink/40 tracking-wide uppercase">{cat.name}</span>
              </div>
              <div className="absolute inset-0 bg-ink/0 group-hover:bg-ink/10 transition-colors duration-300" />
            </div>
            <h3 className="text-sm text-center text-ink leading-snug group-hover:text-gold-dark transition-colors">
              {cat.name}
            </h3>
          </Link>
        ))}
      </div>
    </section>
  );
}
