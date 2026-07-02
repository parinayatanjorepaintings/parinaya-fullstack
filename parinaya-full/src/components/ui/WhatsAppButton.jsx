import { useState, useEffect } from 'react';
import { MessageCircle } from 'lucide-react';
import { buildWhatsAppLink } from '../../services/api';

export default function WhatsAppButton({
  productName,
  productImage,
  productPrice,
  label = 'Enquire on WhatsApp',
  variant = 'solid',
  className = '',
}) {
  const [href, setHref] = useState('#');

  useEffect(() => {
    buildWhatsAppLink(productName, productImage, productPrice)
      .then(setHref)
      .catch(() => {});
  }, [productName, productImage, productPrice]);

  const base = 'inline-flex items-center justify-center gap-2 text-sm font-medium tracking-wide uppercase transition-colors duration-200 px-6 py-3';
  const styles = variant === 'solid'
    ? 'bg-ink text-paper hover:bg-gold-dark'
    : 'bg-transparent text-ink border border-ink hover:bg-ink hover:text-paper';

  return (
    <a href={href} target="_blank" rel="noopener noreferrer"
      className={`${base} ${styles} ${className}`}>
      <MessageCircle size={16} strokeWidth={2} />
      {label}
    </a>
  );
}