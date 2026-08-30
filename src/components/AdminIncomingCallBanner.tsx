import React, { useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Phone, Video, PhoneOff, MessageSquare, Check, X, ShieldAlert } from 'lucide-react';
import { WHATSAPP_NUMBERS } from '../data/initialData';

export const AdminIncomingCallBanner: React.FC = () => {
  const { 
    currentUser, 
    incomingCallForAdmin, 
    acceptCall, 
    declineCall, 
    setActivePage 
  } = useApp();

  const isUserAdmin = currentUser?.role === 'super_admin' || currentUser?.role === 'assistant_admin';

  // Ringtone synthesizer sound alert when an incoming call arrives
  useEffect(() => {
    if (!isUserAdmin || !incomingCallForAdmin || incomingCallForAdmin.status !== 'ringing') return;

    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();

      const playRing = () => {
        if (ctx.state === 'suspended') ctx.resume();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.setValueAtTime(440, ctx.currentTime);
        osc.frequency.setValueAtTime(480, ctx.currentTime + 0.15);
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
        osc.start();
        osc.stop(ctx.currentTime + 0.45);
      };

      playRing();
      const ringInterval = setInterval(playRing, 2500);

      return () => {
        clearInterval(ringInterval);
        ctx.close().catch(() => {});
      };
    } catch (e) {
      // AudioContext failure gracefully handled
    }
  }, [isUserAdmin, incomingCallForAdmin]);

  if (!isUserAdmin || !incomingCallForAdmin || incomingCallForAdmin.status !== 'ringing') {
    return null;
  }

  const handleAccept = () => {
    acceptCall(incomingCallForAdmin.id);
    setActivePage('chat');
  };

  const handleDecline = () => {
    declineCall(incomingCallForAdmin.id);
  };

  const handleWhatsAppReply = () => {
    acceptCall(incomingCallForAdmin.id);
    const targetPhone = incomingCallForAdmin.callerPhone?.replace(/[\s\-\+\(\)]/g, '') || '';
    if (targetPhone) {
      window.open(`https://wa.me/${targetPhone}?text=${encodeURIComponent("Bonjour ! Je réponds à votre appel direct sur DONALDSON SHOP.")}`, '_blank', 'noopener,noreferrer');
    } else {
      setActivePage('chat');
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm w-full bg-stone-900 text-white rounded-3xl shadow-2xl border-2 border-emerald-500/80 p-4 animate-bounce shrink-0">
      <div className="flex items-start gap-3">
        {/* Pulsing Icon */}
        <div className="relative shrink-0">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-lg">
            {incomingCallForAdmin.type === 'video' ? (
              <Video className="w-6 h-6 animate-pulse" />
            ) : (
              <Phone className="w-6 h-6 animate-pulse" />
            )}
          </div>
          <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-400 border-2 border-stone-900 rounded-full animate-ping" />
        </div>

        {/* Call Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] uppercase tracking-wider font-extrabold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded-md border border-emerald-500/40">
              {incomingCallForAdmin.type === 'video' ? 'Appel Vidéo Entrant' : 'Appel Vocal Entrant'}
            </span>
          </div>
          <h4 className="font-bold text-sm text-white truncate mt-1">
            {incomingCallForAdmin.callerName}
          </h4>
          <p className="text-xs text-stone-300 font-mono truncate">
            {incomingCallForAdmin.callerPhone || incomingCallForAdmin.callerEmail || 'Client en ligne sur le site'}
          </p>
        </div>

        {/* Dismiss Button */}
        <button
          onClick={handleDecline}
          className="p-1 rounded-full text-stone-400 hover:text-white hover:bg-stone-800 transition-colors cursor-pointer"
          title="Fermer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2 mt-3 pt-3 border-t border-stone-800">
        <button
          onClick={handleDecline}
          className="flex-1 py-2 px-3 rounded-xl bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 text-xs font-bold border border-rose-500/30 flex items-center justify-center gap-1 transition-all cursor-pointer"
        >
          <PhoneOff className="w-3.5 h-3.5" />
          <span>Refuser</span>
        </button>

        <button
          onClick={handleAccept}
          className="flex-1 py-2 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold shadow-md flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95"
        >
          <Check className="w-3.5 h-3.5" />
          <span>Prendre l'appel</span>
        </button>
      </div>
    </div>
  );
};
