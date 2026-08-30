import React, { useState, useEffect, useRef } from 'react';
import { Bot, Sparkles, X, Move, MessageSquare, Minimize2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ChatBotModal } from './ChatBotModal';
import chatbotBgImage from '../assets/images/blue_chatbot_avatar_1786299609810.jpg';

export const FloatingChatBot: React.FC = () => {
  const { activePage, setActivePage } = useApp();
  const [isOpen, setIsOpen] = useState(false);
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

  // Initialize position (bottom-right area, stacked above WhatsApp) and persist position
  useEffect(() => {
    const defaultX = Math.max(16, window.innerWidth - 76);
    const defaultY = Math.max(16, window.innerHeight - 156);

    try {
      const saved = localStorage.getItem('donaldson_chatbot_pos');
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
        if (!prev) {
          return { x: Math.max(16, window.innerWidth - 76), y: Math.max(16, window.innerHeight - 156) };
        }
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

  // Sync open state if user navigates to 'chat' page via Navbar
  useEffect(() => {
    if (activePage === 'chat') {
      setIsOpen(true);
    }
  }, [activePage]);

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
        localStorage.setItem('donaldson_chatbot_pos', JSON.stringify(pos));
      } catch (e) {}
    } else {
      setIsOpen(prev => !prev);
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

  const handleCloseOverlay = () => {
    setIsOpen(false);
    if (activePage === 'chat') {
      setActivePage('shop');
    }
  };

  if (!pos) return null;

  return (
    <>
      {/* Floating Chat Overlay Window */}
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-end sm:items-end justify-start p-2 sm:p-4 bg-black/40 backdrop-blur-xs transition-opacity animate-fadeIn">
          {/* Backdrop Click to close */}
          <div 
            className="absolute inset-0 -z-10 cursor-pointer"
            onClick={handleCloseOverlay}
          />

          {/* Floating Responsive Chat Window Box */}
          <div className="w-full sm:w-[460px] max-w-full h-[88vh] sm:h-[680px] max-h-[92vh] bg-white rounded-3xl shadow-2xl border border-gold/40 overflow-hidden flex flex-col relative animate-scaleUp">
            <ChatBotModal onClose={handleCloseOverlay} isFloating={true} />
          </div>
        </div>
      )}

      {/* Floating Draggable Icon Button */}
      <div
        ref={containerRef}
        style={{
          position: 'fixed',
          left: `${pos.x}px`,
          top: `${pos.y}px`,
          zIndex: 9998,
          touchAction: 'none'
        }}
        className="relative select-none group"
      >
        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            handleStartDrag(e.clientX, e.clientY);
          }}
          onTouchStart={(e) => {
            if (e.touches.length > 0) {
              handleStartDrag(e.touches[0].clientX, e.touches[0].clientY);
            }
          }}
          className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-stone-950 border-2 border-gold text-gold shadow-2xl overflow-hidden flex items-center justify-center relative transition-transform cursor-grab active:cursor-grabbing ${
            isDragging ? 'scale-110 shadow-gold/40 ring-4 ring-amber-400/30' : 'hover:scale-110 active:scale-95'
          }`}
          title="Chatbot DONALDSON SHOP - Déplacez-moi n'importe où !"
        >
          {/* Avatar / Icon filling entire button frame */}
          <img 
            src={chatbotBgImage} 
            alt="Chatbot"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover" 
          />

          {/* Pulsing online status aura */}
          <span className="absolute top-1 right-1 flex h-3.5 w-3.5 z-10">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-gold border border-stone-900"></span>
          </span>

          {/* Move handle indicator icon on hover */}
          <Move className="w-3.5 h-3.5 text-gold drop-shadow-md absolute top-1 left-1 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10" />
        </button>
      </div>
    </>
  );
};
