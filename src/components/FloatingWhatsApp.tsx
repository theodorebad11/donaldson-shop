import React, { useState, useEffect, useRef } from 'react';
import { X, ExternalLink } from 'lucide-react';
import { WHATSAPP_NUMBERS } from '../data/initialData';

// Official WhatsApp Brand SVG Icon
export const WhatsAppIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
  <svg 
    viewBox="0 0 24 24" 
    width="24" 
    height="24" 
    fill="currentColor" 
    className={className}
  >
    <path d="M12.012 2c-5.506 0-9.989 4.478-9.99 9.984 0 1.764.459 3.483 1.333 5.001L2 22l5.129-1.332c1.46.797 3.107 1.216 4.883 1.217h.004c5.506 0 9.99-4.478 9.99-9.985 0-2.667-1.039-5.176-2.927-7.062C17.191 3.039 14.68 2 12.012 2zm5.834 14.284c-.244.688-1.201 1.258-1.954 1.419-.518.11-1.196.198-3.484-.75-2.928-1.214-4.814-4.185-4.96-4.381-.146-.195-1.185-1.58-1.185-3.013 0-1.432.748-2.138 1.014-2.428.266-.29.582-.363.776-.363.194 0 .388.002.557.01.18.008.423-.068.662.506.244.584.828 2.02.9 2.167.073.146.121.316.024.509-.097.195-.146.316-.291.486-.146.17-.307.38-.438.511-.146.146-.299.305-.128.597.171.292.76 1.255 1.632 2.032 1.121.999 2.067 1.309 2.359 1.455.292.146.463.122.634-.073.17-.195.729-.85.924-1.142.195-.292.389-.243.657-.146.268.097 1.699.802 1.991.948.292.146.486.219.558.341.073.121.073.705-.171 1.393z"/>
  </svg>
);

export const FloatingWhatsApp: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const isMouseDownRef = useRef(false);
  const dragStartRef = useRef<{ startX: number; startY: number; posX: number; posY: number }>({
    startX: 0,
    startY: 0,
    posX: 0,
    posY: 0
  });
  const hasDraggedRef = useRef(false);

  // Set default initial position on screen bottom-right or restore saved position
  useEffect(() => {
    const defaultX = Math.max(16, window.innerWidth - 76);
    const defaultY = Math.max(16, window.innerHeight - 84);

    try {
      const saved = localStorage.getItem('donaldson_whatsapp_pos');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (typeof parsed.x === 'number' && typeof parsed.y === 'number') {
          const maxX = Math.max(10, window.innerWidth - 70);
          const maxY = Math.max(10, window.innerHeight - 70);
          setPos({
            x: Math.min(Math.max(10, parsed.x), maxX),
            y: Math.min(Math.max(10, parsed.y), maxY)
          });
        } else {
          setPos({ x: defaultX, y: defaultY });
        }
      } else {
        setPos({ x: defaultX, y: defaultY });
      }
    } catch (e) {
      setPos({ x: defaultX, y: defaultY });
    }

    const handleResize = () => {
      setPos(prev => {
        if (!prev) return { x: Math.max(16, window.innerWidth - 76), y: Math.max(16, window.innerHeight - 84) };
        const maxX = Math.max(10, window.innerWidth - 70);
        const maxY = Math.max(10, window.innerHeight - 70);
        return {
          x: Math.min(Math.max(10, prev.x), maxX),
          y: Math.min(Math.max(10, prev.y), maxY)
        };
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Close popup automatically when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [open]);

  const handleStartDrag = (clientX: number, clientY: number) => {
    if (!pos) return;
    isMouseDownRef.current = true;
    hasDraggedRef.current = false;
    dragStartRef.current = {
      startX: clientX,
      startY: clientY,
      posX: pos.x,
      posY: pos.y
    };
  };

  const handleMoveDrag = (clientX: number, clientY: number) => {
    if (!isMouseDownRef.current) return;
    const deltaX = clientX - dragStartRef.current.startX;
    const deltaY = clientY - dragStartRef.current.startY;

    if (Math.abs(deltaX) > 4 || Math.abs(deltaY) > 4) {
      hasDraggedRef.current = true;
      setIsDragging(true);
    }

    if (hasDraggedRef.current) {
      const maxX = Math.max(10, window.innerWidth - 64);
      const maxY = Math.max(10, window.innerHeight - 64);
      const newX = Math.min(Math.max(10, dragStartRef.current.posX + deltaX), maxX);
      const newY = Math.min(Math.max(10, dragStartRef.current.posY + deltaY), maxY);
      setPos({ x: newX, y: newY });
    }
  };

  const handleEndDrag = () => {
    if (!isMouseDownRef.current) return;
    isMouseDownRef.current = false;
    setTimeout(() => setIsDragging(false), 50);

    if (hasDraggedRef.current && pos) {
      try {
        localStorage.getItem('donaldson_whatsapp_pos');
        localStorage.setItem('donaldson_whatsapp_pos', JSON.stringify(pos));
      } catch (e) {}
    } else {
      setOpen(prev => !prev);
    }
  };

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => handleMoveDrag(e.clientX, e.clientY);
    const onMouseUp = () => handleEndDrag();
    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        handleMoveDrag(e.touches[0].clientX, e.touches[0].clientY);
      }
    };
    const onTouchEnd = () => handleEndDrag();

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    window.addEventListener('touchmove', onTouchMove, { passive: false });
    window.addEventListener('touchend', onTouchEnd);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
    };
  }, [pos]);

  const openWhatsApp = (rawNumber: string) => {
    const defaultMsg = encodeURIComponent("Bonjour DONALDSON SHOP ! Je vous contacte depuis le site web pour des informations sur vos articles de sport et le tarif de ma livraison.");
    window.open(`https://wa.me/${rawNumber}?text=${defaultMsg}`, '_blank', 'noopener,noreferrer');
  };

  if (!pos) return null;

  // Determine popover anchor orientation based on current position
  const isNearRight = pos.x > window.innerWidth / 2;
  const isNearBottom = pos.y > window.innerHeight / 2;

  return (
    <div
      ref={containerRef}
      style={{
        position: 'fixed',
        left: `${pos.x}px`,
        top: `${pos.y}px`,
        zIndex: 9999,
        touchAction: 'none'
      }}
      className="relative select-none"
    >
      {/* Popover Selection Box */}
      {open && (
        <div 
          style={{
            position: 'absolute',
            ...(isNearBottom ? { bottom: '68px' } : { top: '68px' }),
            ...(isNearRight ? { right: '0px' } : { left: '0px' })
          }}
          className="w-80 bg-white rounded-2xl shadow-2xl border border-slate-200 p-4 animate-scaleUp z-50 select-text"
        >
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-[#25D366] text-white flex items-center justify-center font-bold shadow-md shrink-0">
                <WhatsAppIcon className="w-5 h-5 fill-current" />
              </div>
              <div>
                <h4 className="font-extrabold text-sm text-slate-900">WhatsApp DONALDSON SHOP</h4>
                <p className="text-[10px] text-[#25D366] font-extrabold flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-[#25D366] animate-pulse" />
                  En ligne • Réponse rapide
                </p>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="text-xs text-slate-600 mb-3 leading-relaxed">
            Choisissez l'un de nos numéros officiels WhatsApp pour discuter en direct avec notre service client :
          </p>

          <div className="space-y-2">
            {WHATSAPP_NUMBERS.map((num, idx) => (
              <button
                key={num.raw}
                onClick={() => openWhatsApp(num.raw)}
                className="w-full p-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 flex items-center justify-between transition-all group shadow-2xs"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-[#25D366]/20 text-[#25D366] flex items-center justify-center font-bold shrink-0">
                    <WhatsAppIcon className="w-4 h-4 fill-current" />
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-xs">Ligne WhatsApp {idx + 1}</p>
                    <p className="text-xs font-black tracking-wide text-emerald-800">{num.display}</p>
                  </div>
                </div>
                <ExternalLink className="w-4 h-4 text-emerald-600 group-hover:translate-x-0.5 transition-transform" />
              </button>
            ))}
          </div>

          <div className="mt-3 pt-2 border-t border-slate-100 text-[10px] text-center text-slate-400">
            Support client disponible 7j/7 pour Lomé et tout le Togo
          </div>
        </div>
      )}

      {/* Floating Button */}
      <div className="relative">
        <button
          onMouseDown={(e) => {
            e.preventDefault();
            handleStartDrag(e.clientX, e.clientY);
          }}
          onTouchStart={(e) => {
            if (e.touches.length > 0) {
              handleStartDrag(e.touches[0].clientX, e.touches[0].clientY);
            }
          }}
          className={`w-14 h-14 rounded-full bg-[#25D366] hover:bg-[#20bd5a] text-white shadow-2xl flex items-center justify-center transition-transform ${
            isDragging ? 'scale-110 cursor-grabbing shadow-emerald-500/50' : 'cursor-grab hover:scale-110 active:scale-95'
          } border-2 border-white/20`}
          title="WhatsApp DONALDSON SHOP"
        >
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-400"></span>
          </span>
          <WhatsAppIcon className="w-7 h-7 fill-current" />
        </button>
      </div>
    </div>
  );
};

