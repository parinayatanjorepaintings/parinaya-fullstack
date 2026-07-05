import { useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingBag, MessageCircle } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { getSiteConfig } from '../services/api';
import Breadcrumb from '../components/ui/Breadcrumb';

async function buildCartWhatsApp(items) {
  const cfg = await getSiteConfig();
  const number = cfg.whatsapp_number || '917075703309';

  let message = `Hi! I'm interested in enquiring about the following items from Sri Sri Parinaya:\n\n`;

  items.forEach((item, i) => {
    message += `*${i + 1}. ${item.name}*\n`;
    message += `   💰 Price: ₹${Number(item.price).toLocaleString('en-IN')} × ${item.qty}\n`;
    if (item.image) message += `   🖼️ ${item.image}\n`;
    message += `\n`;
  });

  const total = items.reduce((sum, i) => sum + i.price * i.qty, 0);
  message += `*Total: ₹${total.toLocaleString('en-IN')}*\n\n`;
  message += `Could you please confirm availability and share payment details?`;

  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}

export default function Cart() {
  const { items, removeFromCart, updateQty, clearCart } = useCart();
  const navigate = useNavigate();

  const total = items.reduce((sum, i) => sum + i.price * i.qty, 0);

  const handleEnquire = useCallback(async () => {
    if (!items.length) return;
    const url = await buildCartWhatsApp(items);
    window.open(url, '_blank', 'noopener,noreferrer');
  }, [items]);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <Breadcrumb items={[{ label: 'Enquiry Cart' }]} />

      <div className="mt-6 mb-10 flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-display text-3xl sm:text-4xl text-ink">Enquiry Cart</h1>
          <p className="text-ink/50 text-sm mt-1">
            {items.length === 0
              ? 'Your cart is empty'
              : `${items.length} item${items.length > 1 ? 's' : ''} — send all at once via WhatsApp`}
          </p>
        </div>
        {items.length > 0 && (
          <button
            onClick={clearCart}
            className="text-xs uppercase tracking-wide text-ink/40 hover:text-error transition-colors flex items-center gap-1"
          >
            <Trash2 size={13} /> Clear all
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <div className="border border-dashed border-line py-20 text-center">
          <ShoppingBag size={40} className="mx-auto text-ink/20 mb-4" />
          <p className="text-ink/50 mb-6">No items added yet.</p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 bg-ink text-paper px-6 py-3 text-sm uppercase tracking-wide hover:bg-gold-dark transition-colors"
          >
            Browse Products
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Items */}
          {items.map((item) => (
            <div
              key={item.id}
              className="flex gap-4 border border-line p-4 bg-paper"
            >
              {/* Image */}
              <Link to={`/products/${item.id}`} className="flex-shrink-0">
                {item.image ? (
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-20 h-24 sm:w-24 sm:h-28 object-cover border border-line"
                  />
                ) : (
                  <div className="w-20 h-24 sm:w-24 sm:h-28 bg-cream border border-line flex items-center justify-center">
                    <ShoppingBag size={20} className="text-ink/20" />
                  </div>
                )}
              </Link>

              {/* Info */}
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <Link
                    to={`/products/${item.id}`}
                    className="font-display text-lg text-ink hover:text-gold-dark transition-colors leading-snug"
                  >
                    {item.name}
                  </Link>
                  <p className="text-ink/60 text-sm mt-1">
                    ₹{Number(item.price).toLocaleString('en-IN')} each
                  </p>
                </div>

                <div className="flex items-center justify-between mt-3 flex-wrap gap-3">
                  {/* Qty controls */}
                  <div className="flex items-center border border-line">
                    <button
                      onClick={() => updateQty(item.id, item.qty - 1)}
                      className="px-3 py-1.5 hover:bg-cream transition-colors"
                      aria-label="Decrease quantity"
                    >
                      <Minus size={13} />
                    </button>
                    <span className="px-4 py-1.5 text-sm font-medium border-x border-line min-w-[40px] text-center">
                      {item.qty}
                    </span>
                    <button
                      onClick={() => updateQty(item.id, item.qty + 1)}
                      className="px-3 py-1.5 hover:bg-cream transition-colors"
                      aria-label="Increase quantity"
                    >
                      <Plus size={13} />
                    </button>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="font-medium text-ink">
                      ₹{(item.price * item.qty).toLocaleString('en-IN')}
                    </span>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-ink/30 hover:text-error transition-colors"
                      aria-label="Remove item"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Summary */}
          <div className="border border-line p-5 bg-cream mt-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-ink/60 text-sm">
                {items.reduce((s, i) => s + i.qty, 0)} item(s)
              </span>
              <span className="font-display text-xl text-ink">
                ₹{total.toLocaleString('en-IN')}
              </span>
            </div>
            <p className="text-xs text-ink/40 mb-5">
              Final price may vary. Our team will confirm on WhatsApp.
            </p>

            <button
              onClick={handleEnquire}
              className="w-full flex items-center justify-center gap-2 bg-ink text-paper py-3.5 text-sm uppercase tracking-wide font-medium hover:bg-gold-dark transition-colors"
            >
              <MessageCircle size={18} />
              Send Enquiry via WhatsApp
            </button>

            <Link
              to="/"
              className="block text-center mt-3 text-xs uppercase tracking-wide text-ink/50 hover:text-ink transition-colors"
            >
              Continue Browsing
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
