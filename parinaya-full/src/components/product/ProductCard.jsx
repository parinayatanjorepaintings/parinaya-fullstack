import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle } from 'lucide-react';
import { buildWhatsAppLink } from '../../services/api';

export default function ProductCard({ product }) {
  const [waHref, setWaHref] = useState('#');
  const price = product.price?.toLocaleString('en-IN');

  // Images from API are objects { url, ... }; support both string and object
  const imgSrc = typeof product.images?.[0] === 'string'
    ? product.images[0]
    : product.images?.[0]?.url || '';

  useEffect(() => {
    buildWhatsAppLink(product.name, imgSrc, product.price).then(setWaHref).catch(() => {});
  }, [product.name]);

  return (
    <div className="group flex flex-col">
      <Link
        to={`/products/${product.id}`}
        className="relative block aspect-[4/5] overflow-hidden bg-cream border border-line"
      >
        {imgSrc ? (
          <img
            src={imgSrc}
            alt={product.name}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
          />
        ) : (
          <div className="w-full h-full bg-cream flex items-center justify-center text-ink/20 text-xs">
            No image
          </div>
        )}
        {!product.in_stock && !product.inStock && (
          <span className="absolute top-3 left-3 bg-ink text-paper text-[10px] tracking-widest2 uppercase px-2.5 py-1">
            Sold Out
          </span>
        )}
      </Link>

      <div className="pt-4 flex flex-col flex-1">
        <Link to={`/products/${product.id}`}>
          <h3 className="font-display text-base text-ink leading-snug mb-1.5 group-hover:text-gold-dark transition-colors">
            {product.name}
          </h3>
        </Link>
        <p className="text-sm text-ink/60 mb-3">₹{price}</p>
        <a
          href={waHref}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-auto inline-flex items-center justify-center gap-2 text-xs tracking-wide uppercase border border-ink text-ink py-2.5 hover:bg-ink hover:text-paper transition-colors duration-200"
        >
          <MessageCircle size={14} />
          Enquire
        </a>
      </div>
    </div>
  );
}
