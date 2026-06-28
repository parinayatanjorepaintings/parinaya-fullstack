// Hook — fetches site config once and caches it in React state.
// Usage:  const { config, loading } = useConfig();
//         config.logo_text, config.announcement, config.whatsapp_number …
import { useState, useEffect } from 'react';
import { getSiteConfig } from '../services/api';

const cache = { data: null };

export function useConfig() {
  const [config, setConfig] = useState(cache.data || {});
  const [loading, setLoading] = useState(!cache.data);

  useEffect(() => {
    if (cache.data) { setConfig(cache.data); setLoading(false); return; }
    getSiteConfig().then(cfg => {
      cache.data = cfg;
      setConfig(cfg);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  return { config, loading };
}
