import { Sparkles, Hand, ShieldCheck, Truck } from "lucide-react";

const points = [
  {
    icon: Hand,
    title: "Handcrafted",
    text: "Each piece made by skilled artisans",
  },
  {
    icon: Sparkles,
    title: "Genuine Gold Work",
    text: "Authentic gold foil and gesso detailing",
  },
  {
    icon: ShieldCheck,
    title: "Quality Assured",
    text: "Carefully inspected before dispatch",
  },
  {
    icon: Truck,
    title: "Pan-India Delivery",
    text: "Safely packaged and shipped",
  },
];

export default function TrustStrip() {
  return (
    <section className="border-b border-line bg-paper">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
          {points.map(({ icon: Icon, title, text }) => (
            <div key={title} className="flex flex-col items-center text-center gap-2.5">
              <Icon size={24} strokeWidth={1.5} className="text-gold-dark" />
              <h4 className="text-sm font-medium text-ink">{title}</h4>
              <p className="text-xs text-ink/55 leading-snug">{text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
