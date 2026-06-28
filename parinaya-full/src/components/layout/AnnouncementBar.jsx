import { useConfig } from '../../hooks/useConfig';

export default function AnnouncementBar() {
  const { config } = useConfig();
  const text = config.announcement || 'Handcrafted Tanjore Paintings • Made to Order • Hyderabad, Telangana';

  return (
    <div className="bg-ink text-paper text-center text-[11px] sm:text-xs tracking-widest2 uppercase py-2 px-4">
      <span>{text}</span>
    </div>
  );
}
