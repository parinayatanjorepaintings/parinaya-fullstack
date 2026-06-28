import { useState, useRef, useCallback } from 'react';
import { useConfig } from '../../hooks/useConfig';
import { Play } from 'lucide-react';

// Extract YouTube video ID from any YT URL format
function extractYouTubeId(url = '') {
  if (!url) return null;
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
  ];
  for (const pat of patterns) {
    const m = url.match(pat);
    if (m) return m[1];
  }
  return null;
}

export default function VideoSection() {
  const { config } = useConfig();
  const [playing, setPlaying] = useState(false);
  const iframeRef = useRef(null);

  const ytUrl    = config.youtube_url || '';
  const title    = config.youtube_section_title || 'See Our Craft in Action';
  const subtitle = config.youtube_section_subtitle || 'Watch how every Tanjore painting comes to life — from wooden board to gold leaf.';

  const videoId = extractYouTubeId(ytUrl);

  const handlePlay = useCallback(() => setPlaying(true), []);

  if (!videoId) return null;

  // Thumbnail — YouTube provides this automatically
  const thumbUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;

  return (
    <section className="bg-ink py-16 sm:py-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section heading */}
        <div className="text-center mb-10">
          <p className="text-xs tracking-widest2 uppercase text-gold mb-3">Watch</p>
          <h2 className="font-display text-3xl sm:text-4xl text-paper mb-3">{title}</h2>
          {subtitle && (
            <p className="text-paper/60 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">{subtitle}</p>
          )}
        </div>

        {/* Video player */}
        <div className="relative aspect-video bg-black rounded-sm overflow-hidden shadow-2xl">
          {!playing ? (
            // Custom thumbnail + play button — prevents autoloading YT scripts until user clicks
            <>
              <img
                src={thumbUrl}
                alt={title}
                className="w-full h-full object-cover"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
              {/* Gold gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-ink/10 to-transparent" />
              {/* Play button */}
              <button
                onClick={handlePlay}
                aria-label="Play video"
                className="absolute inset-0 flex items-center justify-center group"
              >
                <span className="w-18 h-18 rounded-full bg-gold flex items-center justify-center shadow-xl
                  transition-all duration-300 group-hover:scale-110 group-hover:bg-gold-dark"
                  style={{ width: '72px', height: '72px' }}
                >
                  <Play size={28} className="text-ink ml-1" fill="currentColor" />
                </span>
              </button>
            </>
          ) : (
            // Actual YouTube iframe — only loaded when user clicks play
            <iframe
              ref={iframeRef}
              className="w-full h-full"
              src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1&color=white`}
              title={title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              loading="lazy"
            />
          )}
        </div>
      </div>
    </section>
  );
}
