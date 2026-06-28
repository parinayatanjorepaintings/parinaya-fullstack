import { useState, useEffect } from 'react';
import { MessageCircle } from 'lucide-react';
import { buildWhatsAppLink } from '../../services/api';

export default function FloatingWhatsApp() {
  const [href, setHref] = useState('https://wa.me/917075703309');

  useEffect(() => {
    buildWhatsAppLink().then(setHref).catch(() => {});
  }, []);

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-ink text-paper flex items-center justify-center shadow-lg hover:bg-gold-dark transition-colors duration-200"
    >
      <MessageCircle size={26} strokeWidth={2} />
    </a>
  );
}
