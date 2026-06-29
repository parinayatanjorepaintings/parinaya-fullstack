import { useState, useEffect, useCallback } from 'react';
import { useConfig } from '../../hooks/useConfig';
import { getYoutubeVideos } from '../../services/api';
import { Play, ChevronLeft, ChevronRight } from 'lucide-react';

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
  const [videos, setVideos] = useState([]);
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);

  const title    = config.youtube_section_title || 'See Our Craft in Action';
  const subtitle = config.youtube_section_subtitle || 'Watch how every Tanjore painting comes to life — from wooden board to gold leaf.';

  useEffect(() => {
    getYoutubeVideos().then(setVideos).catch(() => {});
  }, []);

  const goTo = useCallback((i) => {
    setPlaying(false);
    setIndex((prev) => {
      const len = videos.length;
      return ((i % len) + len) % len; // wrap both directions
    });
  }, [videos.length]);

  const handlePlay = useCallback(() => setPlaying(true), []);

  if (!videos.length) return null;

  const current = videos[index];
  const videoId = extractYouTubeId(current.url);
  if (!videoId) return null;

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

        {/* Video slider */}
        <div className="relative">
          <div className="relative aspect-video bg-black rounded-sm overflow-hidden shadow-2xl">
            {!playing ? (
              <>
                <img
                  key={videoId}
                  src={thumbUrl}
                  alt={current.title || title}
                  className="w-full h-full object-cover"
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-ink/10 to-transparent" />
                <button
                  onClick={handlePlay}
                  aria-label="Play video"
                  className="absolute inset-0 flex items-center justify-center group"
                >
                  <span
                    className="rounded-full bg-gold flex items-center justify-center shadow-xl
                      transition-all duration-300 group-hover:scale-110 group-hover:bg-gold-dark"
                    style={{ width: '72px', height: '72px' }}
                  >
                    <Play size={28} className="text-ink ml-1" fill="currentColor" />
                  </span>
                </button>
              </>
            ) : (
              <iframe
                className="w-full h-full"
                src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1&color=white`}
                title={current.title || title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                loading="lazy"
              />
            )}
          </div>

          {/* Prev/next arrows — only when there's more than one video */}
          {videos.length > 1 && (
            <>
              <button
                onClick={() => goTo(index - 1)}
                aria-label="Previous video"
                className="absolute left-2 sm:-left-5 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-paper/90 text-ink flex items-center justify-center shadow-lg hover:bg-gold transition-colors"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={() => goTo(index + 1)}
                aria-label="Next video"
                className="absolute right-2 sm:-right-5 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-paper/90 text-ink flex items-center justify-center shadow-lg hover:bg-gold transition-colors"
              >
                <ChevronRight size={20} />
              </button>
            </>
          )}
        </div>

        {/* Caption + dot indicators */}
        {current.title && (
          <p className="text-center text-paper/70 text-sm mt-5">{current.title}</p>
        )}
        {videos.length > 1 && (
          <div className="flex justify-center gap-2 mt-5">
            {videos.map((v, i) => (
              <button
                key={v.id}
                onClick={() => goTo(i)}
                aria-label={`Go to video ${i + 1}`}
                className={`h-2 rounded-full transition-all duration-300 ${
                  i === index ? 'w-6 bg-gold' : 'w-2 bg-paper/30 hover:bg-paper/50'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
