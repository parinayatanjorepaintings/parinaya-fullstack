import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useConfig } from '../../hooks/useConfig';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000';

function resolveImg(value) {
  if (!value) return null;
  return value.startsWith('http') ? value : `${API_BASE}/uploads/${value}`;
}

export default function Hero() {
  const { config } = useConfig();
  const [bgLoaded, setBgLoaded] = useState(false);
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' ? window.innerWidth < 640 : false
  );

  const eyebrow   = config.hero_eyebrow    || 'Handcrafted in South India';
  const heading   = config.hero_heading    || 'Tanjore Paintings,\nGilded in Tradition.';
  const body      = config.hero_body       || 'Discover handpainted Tanjore art, brass idols and traditional decor — crafted by skilled artisans and finished with genuine gold foil work, true to centuries of South Indian heritage.';
  const cta1Label = config.hero_cta1_label || 'Shop Paintings';
  const cta1Link  = config.hero_cta1_link  || '/collections/all-tanjore-paintings';
  const cta2Label = config.hero_cta2_label || 'Shop Brass Idols';
  const cta2Link  = config.hero_cta2_link  || '/collections/brass-idols';

  const desktopBg = resolveImg(config.hero_bg_image);
  // Falls back to the desktop image if no mobile-specific one was uploaded
  const mobileBg  = resolveImg(config.hero_bg_image_mobile) || desktopBg;
  const bgImage   = isMobile ? mobileBg : desktopBg;

  // Track viewport so we swap images on resize/rotate, not just on first load
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // Preload bg image — re-run whenever the resolved image changes (e.g. rotating the phone)
  useEffect(() => {
    if (!bgImage) { setBgLoaded(false); return; }
    setBgLoaded(false);
    const img = new Image();
    img.src = bgImage;
    img.onload = () => setBgLoaded(true);
  }, [bgImage]);

  const hasBg = bgImage && bgLoaded;

  // Split heading on \n for line break support
  const headingLines = heading.split('\\n');

  return (
    <section
      className="relative border-b border-line overflow-hidden"
      style={{ minHeight: '480px' }}
    >
      {/* Background image with overlay */}
      {bgImage && (
        <div
          className="absolute inset-0 bg-cover bg-center transition-opacity duration-700"
          style={{
            backgroundImage: hasBg ? `url(${bgImage})` : 'none',
            opacity: hasBg ? 1 : 0,
          }}
        >
          {/* Dark overlay so text is always readable */}
          <div className="absolute inset-0 bg-ink/55" />
        </div>
      )}

      {/* Fallback cream bg when no image */}
      {!bgImage && <div className="absolute inset-0 bg-cream" />}

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 lg:py-28">
        <div className="max-w-2xl">
          <p className={`text-xs tracking-widest2 uppercase mb-5 ${hasBg ? 'text-gold' : 'text-gold-dark'}`}>
            {eyebrow}
          </p>
          <h1 className={`font-display text-4xl sm:text-5xl lg:text-6xl leading-[1.1] mb-6 ${hasBg ? 'text-paper' : 'text-ink'}`}>
            {headingLines.map((line, i) => (
              <span key={i}>
                {line}
                {i < headingLines.length - 1 && <br />}
              </span>
            ))}
          </h1>
          <p className={`text-base sm:text-lg leading-relaxed mb-9 max-w-xl ${hasBg ? 'text-paper/80' : 'text-ink/70'}`}>
            {body}
          </p>
          <div className="flex flex-wrap gap-4">
            <Link
              to={cta1Link}
              className={`inline-flex items-center justify-center px-7 py-3.5 text-sm tracking-wide uppercase transition-colors duration-200 ${
                hasBg
                  ? 'bg-gold text-ink hover:bg-gold-dark'
                  : 'bg-ink text-paper hover:bg-gold-dark'
              }`}
            >
              {cta1Label}
            </Link>
            <Link
              to={cta2Link}
              className={`inline-flex items-center justify-center px-7 py-3.5 text-sm tracking-wide uppercase transition-colors duration-200 ${
                hasBg
                  ? 'border border-paper text-paper hover:bg-paper hover:text-ink'
                  : 'border border-ink text-ink hover:bg-ink hover:text-paper'
              }`}
            >
              {cta2Label}
            </Link>
          </div>
        </div>
      </div>

      {/* Gold hairline */}
      <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-gradient-to-r from-transparent via-gold to-transparent z-10" />
    </section>
  );
}
