import { MapPin, Clock } from 'lucide-react';
import { useConfig } from '../../hooks/useConfig';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export default function AboutStrip() {
  const { config } = useConfig();

  const address      = config.address           || 'Hafeezpet, Miyapur, Hyderabad, Telangana 500049';
  const hours        = config.hours_weekday      || 'Open daily, 10:00 AM – 9:00 PM';
  const eyebrow      = config.story_eyebrow      || 'Our Story';
  const heading      = config.story_heading      || 'A Tradition of Gold, Painted by Hand';
  const body1        = config.story_body1        || 'At Sri Sri Parinaya, every Tanjore painting begins with a wooden base, layers of gesso relief, and genuine gold foil — applied by hand, the way it has been done for generations. From idols for daily worship to centerpieces for weddings, each piece carries the craft of South India into modern homes.';
  const body2        = config.story_body2        || 'Visit our studio in Hyderabad to see the artistry up close, or reach out on WhatsApp for a piece made just for you.';
  const storyImage   = config.story_image;

  const imgSrc = storyImage
    ? (storyImage.startsWith('http') ? storyImage : `${API_BASE}/uploads/${storyImage}`)
    : null;

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
      <div className="grid lg:grid-cols-2 gap-12 items-center">
        {/* Image panel */}
        <div className="relative aspect-[5/4] bg-cream border border-line overflow-hidden order-2 lg:order-1">
          {imgSrc ? (
            <img
              src={imgSrc}
              alt="Sri Sri Parinaya studio"
              loading="lazy"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-amber-50 to-stone-200 flex items-center justify-center">
              <span className="text-ink/30 text-sm">Add studio photo from Admin → Settings → Homepage</span>
            </div>
          )}
        </div>

        {/* Text panel */}
        <div className="order-1 lg:order-2">
          <p className="text-xs tracking-widest2 uppercase text-gold-dark mb-3">{eyebrow}</p>
          <h2 className="font-display text-3xl sm:text-4xl text-ink mb-5 leading-tight">{heading}</h2>
          <p className="text-ink/70 leading-relaxed mb-4">{body1}</p>
          <p className="text-ink/70 leading-relaxed mb-8">{body2}</p>
          <div className="space-y-3">
            <div className="flex gap-3 items-start">
              <MapPin size={18} className="text-gold-dark mt-0.5 flex-shrink-0" />
              <span className="text-sm text-ink/75">{address}</span>
            </div>
            <div className="flex gap-3 items-start">
              <Clock size={18} className="text-gold-dark mt-0.5 flex-shrink-0" />
              <span className="text-sm text-ink/75">{hours.split('|').pop()?.trim() || 'Open daily, 10:00 AM – 9:00 PM'}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
