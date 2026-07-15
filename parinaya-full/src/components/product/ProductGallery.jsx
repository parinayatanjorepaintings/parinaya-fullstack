import { useState } from "react";

export default function ProductGallery({ images, productName }) {
  const [active, setActive] = useState(0);

  if (!images || images.length === 0) return (
    <div className="w-full bg-cream border border-line flex items-center justify-center" style={{ minHeight: '400px' }}>
      <span className="text-ink/20 text-sm">No image</span>
    </div>
  );

  return (
    <div className="flex flex-col-reverse sm:flex-row gap-4">
      {/* Thumbnails — only show if more than 1 image */}
      {images.length > 1 && (
        <div className="flex sm:flex-col gap-3 overflow-x-auto sm:overflow-y-auto sm:w-20 flex-shrink-0">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={`flex-shrink-0 w-16 h-20 sm:w-20 sm:h-24 border overflow-hidden transition-colors bg-cream ${
                active === i ? "border-ink" : "border-line"
              }`}
              aria-label={`View image ${i + 1}`}
            >
              <img
                src={img}
                alt={`${productName} view ${i + 1}`}
                className="w-full h-full object-contain"
              />
            </button>
          ))}
        </div>
      )}

      {/* Main image — object-contain so full painting is visible, no cropping */}
      <div className="flex-1 bg-cream border border-line flex items-center justify-center overflow-hidden"
        style={{ minHeight: '400px', maxHeight: '600px' }}
      >
        <img
          src={images[active]}
          alt={productName}
          className="w-full h-full object-contain"
          style={{ maxHeight: '600px' }}
        />
      </div>
    </div>
  );
}
