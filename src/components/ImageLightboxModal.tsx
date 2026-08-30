import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { X, ZoomIn, ZoomOut, Download } from 'lucide-react';

export const ImageLightboxModal: React.FC = () => {
  const { lightboxImage, setLightboxImage } = useApp();
  const [isZoomed, setIsZoomed] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setLightboxImage(null);
      }
    };
    if (lightboxImage) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [lightboxImage, setLightboxImage]);

  if (!lightboxImage) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/92 backdrop-blur-md p-4 animate-fadeIn select-none"
      onClick={() => setLightboxImage(null)}
    >
      {/* Container to prevent backdrop click close when clicking image controls */}
      <div
        className="relative max-w-5xl w-full h-full flex flex-col items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Control Bar */}
        <div className="absolute top-2 right-2 sm:top-4 sm:right-4 z-20 flex items-center gap-2 bg-black/50 backdrop-blur-md p-2 rounded-2xl border border-white/20 shadow-xl">
          <button
            onClick={() => setIsZoomed(!isZoomed)}
            className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors flex items-center gap-1.5 text-xs font-bold"
            title={isZoomed ? "Réduire l'image" : "Agrandir l'image"}
          >
            {isZoomed ? (
              <>
                <ZoomOut className="w-4 h-4 text-amber-400" />
                <span className="hidden sm:inline">Zoom normal</span>
              </>
            ) : (
              <>
                <ZoomIn className="w-4 h-4 text-amber-400" />
                <span className="hidden sm:inline">Agrandir</span>
              </>
            )}
          </button>

          <a
            href={lightboxImage.url}
            target="_blank"
            rel="noopener noreferrer"
            download
            className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
            title="Ouvrir l'image en pleine résolution"
          >
            <Download className="w-4 h-4 text-gold" />
          </a>

          <button
            onClick={() => setLightboxImage(null)}
            className="p-2.5 rounded-xl bg-rose-600/80 hover:bg-rose-600 text-white transition-colors shadow-md"
            title="Fermer la vue grand écran"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Title if available */}
        {lightboxImage.title && (
          <div className="absolute top-4 left-4 z-20 max-w-xs sm:max-w-md bg-black/60 backdrop-blur-md px-4 py-2 rounded-2xl border border-gold/40 shadow-lg">
            <p className="text-xs sm:text-sm font-serif-title font-bold text-gold truncate">
              {lightboxImage.title}
            </p>
          </div>
        )}

        {/* Image Display */}
        <div className="w-full h-full flex items-center justify-center overflow-auto p-2 sm:p-6">
          <img
            src={lightboxImage.url}
            alt={lightboxImage.title || "Photo produit"}
            referrerPolicy="no-referrer"
            onClick={() => setIsZoomed(!isZoomed)}
            className={`transition-all duration-300 rounded-2xl shadow-2xl object-contain cursor-zoom-in border border-white/10 ${
              isZoomed
                ? 'max-w-none max-h-none scale-125 my-auto'
                : 'max-w-full max-h-[85vh]'
            }`}
          />
        </div>

        {/* Hint footer */}
        <div className="absolute bottom-4 z-20 bg-black/60 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/10 text-[11px] text-stone-300 font-medium tracking-wide">
          Cliquez sur l'image pour basculer le zoom • Appuyez sur Échap pour fermer
        </div>
      </div>
    </div>
  );
};
