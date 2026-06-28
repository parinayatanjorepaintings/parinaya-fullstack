import { useState } from "react";

export default function ProductGallery({ images, productName }) {
  const [active, setActive] = useState(0);

  return (
    <div className="flex flex-col-reverse sm:flex-row gap-4">
      {/* Thumbnails */}
      <div className="flex sm:flex-col gap-3 overflow-x-auto sm:overflow-y-auto sm:w-20 flex-shrink-0">
        {images.map((img, i) => (
          <button
            key={i}
            onClick={() => setActive(i)}
            className={`flex-shrink-0 w-16 h-20 sm:w-20 sm:h-24 border overflow-hidden transition-colors ${
              active === i ? "border-ink" : "border-line"
            }`}
            aria-label={`View image ${i + 1}`}
          >
            <img
              src={img}
              alt={`${productName} thumbnail ${i + 1}`}
              className="w-full h-full object-cover"
            />
          </button>
        ))}
      </div>

      {/* Main image */}
      <div className="flex-1 aspect-[4/5] bg-cream border border-line overflow-hidden">
        <img
          src={images[active]}
          alt={productName}
          className="w-full h-full object-cover"
        />
      </div>
    </div>
  );
}
