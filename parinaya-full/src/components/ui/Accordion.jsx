import { useState } from "react";
import { Plus, Minus } from "lucide-react";

export function AccordionItem({ title, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-line">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-4 text-left"
        aria-expanded={open}
      >
        <span className="text-sm font-medium tracking-wide uppercase text-ink">
          {title}
        </span>
        {open ? <Minus size={16} /> : <Plus size={16} />}
      </button>
      {open && (
        <div className="pb-5 text-sm text-ink/65 leading-relaxed">
          {children}
        </div>
      )}
    </div>
  );
}
