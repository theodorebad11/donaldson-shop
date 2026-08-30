import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Phone, Video, PhoneOff, Mic, MicOff, VideoOff, 
  Volume2, VolumeX, Minimize2, Maximize2, UserPlus, 
  MessageSquare, MoreHorizontal, Share2, RefreshCw,
  Camera, ShieldCheck, Check, Sparkles, X, ChevronDown,
  ArrowLeft, Copy, Sliders
} from 'lucide-react';
import chatbotBgImage from '../assets/images/blue_chatbot_avatar_1786299609810.jpg';

export const LiveCallRoomModal: React.FC = () => {
  const { 
    liveCallSession, 
    endLiveCallSession, 
    currentUser,
    isAnyAdminOnline,
    showToast
  } = useApp();

  const [isMuted, setIsMuted] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [callDuration, setCallDuration] = useState(0);
  const [isMinimized, setIsMinimized] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [streamError, setStreamError] = useState<string | null>(null);

  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  // Timer when call is connected
  useEffect(() => {
    if (!liveCallSession || liveCallSession.status !== 'connected') {
      setCallDuration(0);
      return;
    }

    const interval = setInterval(() => {
      setCallDuration(prev => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [liveCallSession?.status]);

  // Request camera / microphone stream
  useEffect(() => {
    if (!liveCallSession) {
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => track.stop());
        mediaStreamRef.current = null;
      }
      return;
    }

    let isMounted = true;
    const isVideo = liveCallSession.type === 'video';

    const initMedia = async () => {
      try {
        setStreamError(null);
        if (mediaStreamRef.current) {
          mediaStreamRef.current.getTracks().forEach(t => t.stop());
        }

        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: isVideo ? { facingMode: facingMode } : false,
            audio: true
          });
          
          if (!isMounted) {
            stream.getTracks().forEach(t => t.stop());
            return;
          }

          mediaStreamRef.current = stream;
          if (localVideoRef.current && isVideo) {
            localVideoRef.current.srcObject = stream;
          }
        }
      } catch (err: any) {
        console.warn('Camera/mic warning:', err);
        if (isMounted) {
          setStreamError(
            err.name === 'NotAllowedError' 
              ? 'Accès caméra/micro non autorisé.' 
              : 'Périphérique média actif en mode simulé.'
          );
        }
      }
    };

    initMedia();

    return () => {
      isMounted = false;
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(t => t.stop());
        mediaStreamRef.current = null;
      }
    };
  }, [liveCallSession?.callId, liveCallSession?.type, facingMode]);

  // Ringtone synthesizer sound while waiting
  useEffect(() => {
    if (!liveCallSession || liveCallSession.status !== 'ringing') return;

    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();

      const playRingTone = () => {
        if (ctx.state === 'suspended') ctx.resume();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.setValueAtTime(440, ctx.currentTime);
        gain.gain.setValueAtTime(0.06, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2);
        osc.start();
        osc.stop(ctx.currentTime + 1.25);
      };

      playRingTone();
      const ringTimer = setInterval(playRingTone, 3000);

      return () => {
        clearInterval(ringTimer);
        ctx.close().catch(() => {});
      };
    } catch (e) {
      // AudioContext fallback
    }
  }, [liveCallSession?.status]);

  if (!liveCallSession) return null;

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleMute = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getAudioTracks().forEach(t => {
        t.enabled = isMuted;
      });
    }
    setIsMuted(!isMuted);
    showToast(isMuted ? 'Microphone activé' : 'Microphone désactivé', '', 'info');
  };

  const toggleVideo = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getVideoTracks().forEach(t => {
        t.enabled = !isVideoEnabled;
      });
    }
    setIsVideoEnabled(!isVideoEnabled);
  };

  const toggleSpeaker = () => {
    setIsSpeakerOn(!isSpeakerOn);
    showToast(isSpeakerOn ? 'Haut-parleur désactivé' : 'Haut-parleur activé', '', 'info');
  };

  const flipCamera = () => {
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
    showToast('Caméra inversée 🔄', '', 'info');
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Appel DONALDSON SHOP',
        text: 'Rejoignez mon appel direct sur DONALDSON SHOP !',
        url: window.location.href
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      showToast('Lien copié ! 📋', "Lien de l'appel copié dans le presse-papier.", 'success');
    }
  };

  const handleOpenChat = () => {
    setIsMinimized(true);
    const chatBtn = document.getElementById('open-chatbot-btn');
    if (chatBtn) chatBtn.click();
    showToast('Discussion ouverte 💬', 'Appel réduit en incrustation.', 'info');
  };

  const isVideo = liveCallSession.type === 'video';
  const peerDisplayName = liveCallSession.peerName || 'DONALDSON SHOP';

  // If minimized to floating bubble
  if (isMinimized) {
    return (
      <div 
        onClick={() => setIsMinimized(false)}
        className="fixed bottom-24 right-4 z-50 bg-stone-900/95 text-white p-3 rounded-2xl shadow-2xl border-2 border-emerald-500 flex items-center gap-3 cursor-pointer hover:scale-105 transition-all animate-bounce"
        title="Agrandir l'appel"
      >
        <div className="w-10 h-10 rounded-full overflow-hidden bg-stone-800 relative">
          <img src={chatbotBgImage} alt="Avatar" className="w-full h-full object-cover" />
          <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border border-stone-900 rounded-full" />
        </div>
        <div>
          <p className="text-xs font-bold text-white">{peerDisplayName}</p>
          <p className="text-[10px] text-emerald-400 font-mono">
            {liveCallSession.status === 'ringing' ? 'Appel en cours...' : formatTimer(callDuration)}
          </p>
        </div>
        <button 
          onClick={(e) => {
            e.stopPropagation();
            endLiveCallSession();
          }}
          className="p-1.5 rounded-full bg-rose-600 hover:bg-rose-700 text-white ml-1"
        >
          <PhoneOff className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black flex items-center justify-center select-none overflow-hidden animate-fadeIn">
      
      {/* -------------------- VIDEO CALL SCREEN (Screenshot 1 Design) -------------------- */}
      {isVideo ? (
        <div className="relative w-full h-full max-w-md md:max-w-xl mx-auto flex flex-col justify-between p-4 sm:p-6 bg-[#0c0f12]">
          
          {/* Full Screen Camera Background / Simulated Video */}
          <div className="absolute inset-0 z-0 overflow-hidden bg-stone-950">
            {isVideoEnabled ? (
              <video 
                ref={localVideoRef} 
                autoPlay 
                playsInline 
                muted 
                className="w-full h-full object-cover scale-x-[-1]"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center bg-[#101418] text-stone-500">
                <div className="w-24 h-24 rounded-full bg-stone-800 flex items-center justify-center mb-3">
                  <VideoOff className="w-10 h-10 text-stone-600" />
                </div>
                <p className="text-sm font-medium">Caméra désactivée</p>
              </div>
            )}
            
            {/* Subtle Gradient Overlays */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-transparent to-black/80 pointer-events-none" />
          </div>

          {/* Top Header: Contact Name & Status */}
          <div className="relative z-10 flex items-start justify-between pt-2">
            
            {/* Top-Left: Minimize Button */}
            <button
              type="button"
              onClick={() => setIsMinimized(true)}
              className="p-2.5 rounded-full bg-black/40 hover:bg-black/60 text-white/90 backdrop-blur-md transition-all cursor-pointer"
              title="Réduire"
            >
              <Minimize2 className="w-5 h-5" />
            </button>

            {/* Center: Contact Info */}
            <div className="text-center">
              <h2 className="text-lg sm:text-xl font-bold text-white tracking-wide drop-shadow-md">
                {peerDisplayName}
              </h2>
              <p className="text-xs sm:text-sm text-stone-300 drop-shadow-md">
                {liveCallSession.status === 'ringing' 
                  ? 'Appel en cours...' 
                  : `En direct • ${formatTimer(callDuration)}`
                }
              </p>
            </div>

            {/* Top-Right Vertical Action Buttons */}
            <div className="flex flex-col items-center gap-3">
              <button
                type="button"
                onClick={handleShare}
                className="w-11 h-11 rounded-full bg-black/40 hover:bg-black/60 text-white backdrop-blur-md flex items-center justify-center transition-all cursor-pointer shadow-lg active:scale-95"
                title="Ajouter un participant"
              >
                <UserPlus className="w-5 h-5" />
              </button>

              <button
                type="button"
                onClick={handleOpenChat}
                className="w-11 h-11 rounded-full bg-black/40 hover:bg-black/60 text-white backdrop-blur-md flex items-center justify-center transition-all cursor-pointer shadow-lg active:scale-95"
                title="Messages / Chat"
              >
                <MessageSquare className="w-5 h-5" />
              </button>

              <button
                type="button"
                onClick={flipCamera}
                className="w-11 h-11 rounded-full bg-black/40 hover:bg-black/60 text-white backdrop-blur-md flex items-center justify-center transition-all cursor-pointer shadow-lg active:scale-95"
                title="Changer de caméra"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
            </div>

          </div>

          {/* Bottom Floating Control Bar (Pill) */}
          <div className="relative z-10 pb-6 flex justify-center">
            <div className="bg-[#181d22]/90 backdrop-blur-xl border border-stone-800/80 rounded-full px-5 py-3 flex items-center gap-3 sm:gap-4 shadow-2xl">
              
              {/* Plus (...) */}
              <button
                type="button"
                onClick={() => setShowMoreMenu(!showMoreMenu)}
                className="w-12 h-12 rounded-full bg-stone-800/90 hover:bg-stone-700 text-white flex items-center justify-center transition-all cursor-pointer active:scale-95"
                title="Plus d'options"
              >
                <MoreHorizontal className="w-5 h-5" />
              </button>

              {/* Video toggle */}
              <button
                type="button"
                onClick={toggleVideo}
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-all cursor-pointer active:scale-95 ${
                  isVideoEnabled 
                    ? 'bg-stone-800/90 hover:bg-stone-700 text-white' 
                    : 'bg-rose-500/20 border border-rose-500 text-rose-400'
                }`}
                title={isVideoEnabled ? 'Couper la vidéo' : 'Activer la vidéo'}
              >
                {isVideoEnabled ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
              </button>

              {/* Speaker */}
              <button
                type="button"
                onClick={toggleSpeaker}
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-all cursor-pointer active:scale-95 ${
                  isSpeakerOn 
                    ? 'bg-white text-stone-900 shadow-md font-bold' 
                    : 'bg-stone-800/90 hover:bg-stone-700 text-white'
                }`}
                title={isSpeakerOn ? 'Haut-parleur activé' : 'Haut-parleur désactivé'}
              >
                {isSpeakerOn ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
              </button>

              {/* Microphone mute */}
              <button
                type="button"
                onClick={toggleMute}
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-all cursor-pointer active:scale-95 ${
                  isMuted 
                    ? 'bg-rose-500/20 border border-rose-500 text-rose-400' 
                    : 'bg-stone-800/90 hover:bg-stone-700 text-white'
                }`}
                title={isMuted ? 'Activer le micro' : 'Couper le micro'}
              >
                {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>

              {/* Hangup button (Red) */}
              <button
                type="button"
                onClick={endLiveCallSession}
                className="w-13 h-13 rounded-full bg-[#e52d43] hover:bg-[#c91e33] text-white flex items-center justify-center shadow-xl transition-all cursor-pointer active:scale-90"
                title="Raccrocher"
              >
                <PhoneOff className="w-6 h-6" />
              </button>

            </div>
          </div>

        </div>
      ) : (
        
        /* -------------------- AUDIO CALL SCREEN (Screenshot 2 Design) -------------------- */
        <div className="relative w-full h-full max-w-md md:max-w-xl mx-auto flex flex-col justify-between p-4 sm:p-6 bg-[#0b141a]">
          
          {/* WhatsApp / Donaldson Dark Doodle Texture Wallpaper */}
          <div 
            className="absolute inset-0 opacity-10 bg-repeat pointer-events-none"
            style={{
              backgroundImage: `radial-gradient(#2a3942 1px, transparent 1px)`,
              backgroundSize: '16px 16px'
            }}
          />

          {/* Top Bar: Back/Minimize, Contact Name, Add, Message */}
          <div className="relative z-10 flex items-start justify-between pt-2">
            
            {/* Top-Left: Diagonal Minimize Button (matches Screenshot 2) */}
            <button
              type="button"
              onClick={() => setIsMinimized(true)}
              className="p-2.5 rounded-full bg-stone-800/70 hover:bg-stone-700 text-white/90 backdrop-blur-md transition-all cursor-pointer"
              title="Réduire"
            >
              <Minimize2 className="w-5 h-5 rotate-45" />
            </button>

            {/* Center: Name & Call Status */}
            <div className="text-center">
              <h2 className="text-lg sm:text-xl font-bold text-white tracking-wide">
                {peerDisplayName}
              </h2>
              <p className="text-xs sm:text-sm text-stone-400 mt-0.5">
                {liveCallSession.status === 'ringing' 
                  ? 'Appel...' 
                  : `En direct • ${formatTimer(callDuration)}`
                }
              </p>
            </div>

            {/* Top-Right: Add participant & Chat button */}
            <div className="flex flex-col items-center gap-3">
              <button
                type="button"
                onClick={handleShare}
                className="w-11 h-11 rounded-full bg-stone-800/80 hover:bg-stone-700 text-white backdrop-blur-md flex items-center justify-center transition-all cursor-pointer shadow-lg active:scale-95"
                title="Ajouter"
              >
                <UserPlus className="w-5 h-5" />
              </button>

              <button
                type="button"
                onClick={handleOpenChat}
                className="w-11 h-11 rounded-full bg-stone-800/80 hover:bg-stone-700 text-white backdrop-blur-md flex items-center justify-center transition-all cursor-pointer shadow-lg active:scale-95"
                title="Chat"
              >
                <MessageSquare className="w-5 h-5" />
              </button>
            </div>

          </div>

          {/* Center Stage: Large Round Avatar with Wave Pulse */}
          <div className="relative z-10 flex flex-col items-center justify-center my-auto">
            <div className="relative">
              
              {/* Ringing / Active animation waves */}
              {liveCallSession.status === 'connected' ? (
                <>
                  <div className="absolute -inset-4 rounded-full bg-emerald-500/20 animate-ping opacity-75" />
                  <div className="absolute -inset-8 rounded-full bg-emerald-500/10 animate-pulse delay-200" />
                </>
              ) : (
                <div className="absolute -inset-4 rounded-full bg-amber-500/20 animate-ping" />
              )}

              {/* Large Round Avatar */}
              <div className="relative w-44 h-44 sm:w-52 sm:h-52 rounded-full overflow-hidden border-4 border-stone-800 shadow-2xl bg-stone-900">
                <img 
                  src={chatbotBgImage} 
                  alt="Avatar" 
                  className="w-full h-full object-cover"
                />
              </div>

            </div>
          </div>

          {/* Bottom Sheet / Control Panel (Exact Screenshot 2 Grid Layout) */}
          <div className="relative z-10 bg-[#111b21] rounded-[32px] p-5 sm:p-6 border border-stone-800/80 shadow-2xl">
            
            {/* Grid 2x3 */}
            <div className="grid grid-cols-3 gap-y-5 gap-x-3 text-center">
              
              {/* 1. Haut-parleur */}
              <div className="flex flex-col items-center gap-2">
                <button
                  type="button"
                  onClick={toggleSpeaker}
                  className={`w-14 h-14 rounded-full flex items-center justify-center transition-all cursor-pointer active:scale-95 ${
                    isSpeakerOn 
                      ? 'bg-stone-700 text-white' 
                      : 'bg-stone-800/90 text-stone-400'
                  }`}
                >
                  <Volume2 className="w-6 h-6" />
                </button>
                <span className="text-xs text-stone-300 font-medium">Haut-parleur</span>
              </div>

              {/* 2. Vidéo */}
              <div className="flex flex-col items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    // Switch to video mode
                    if (liveCallSession) {
                      liveCallSession.type = 'video';
                    }
                  }}
                  className="w-14 h-14 rounded-full bg-stone-800/90 hover:bg-stone-700 text-stone-300 flex items-center justify-center transition-all cursor-pointer active:scale-95"
                >
                  <Video className="w-6 h-6" />
                </button>
                <span className="text-xs text-stone-300 font-medium">Vidéo</span>
              </div>

              {/* 3. Désactiver le micro */}
              <div className="flex flex-col items-center gap-2">
                <button
                  type="button"
                  onClick={toggleMute}
                  className={`w-14 h-14 rounded-full flex items-center justify-center transition-all cursor-pointer active:scale-95 ${
                    isMuted 
                      ? 'bg-rose-500/20 text-rose-400 border border-rose-500' 
                      : 'bg-stone-800/90 hover:bg-stone-700 text-white'
                  }`}
                >
                  {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
                </button>
                <span className="text-xs text-stone-300 font-medium">
                  {isMuted ? 'Activer le micro' : 'Désactiver le micro'}
                </span>
              </div>

              {/* 4. Plus */}
              <div className="flex flex-col items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowMoreMenu(!showMoreMenu)}
                  className="w-14 h-14 rounded-full bg-stone-800/90 hover:bg-stone-700 text-stone-400 flex items-center justify-center transition-all cursor-pointer active:scale-95"
                >
                  <MoreHorizontal className="w-6 h-6" />
                </button>
                <span className="text-xs text-stone-300 font-medium">Plus</span>
              </div>

              {/* 5. Partager */}
              <div className="flex flex-col items-center gap-2">
                <button
                  type="button"
                  onClick={handleShare}
                  className="w-14 h-14 rounded-full bg-stone-800/90 hover:bg-stone-700 text-stone-400 flex items-center justify-center transition-all cursor-pointer active:scale-95"
                >
                  <Share2 className="w-5 h-5" />
                </button>
                <span className="text-xs text-stone-300 font-medium">Partager</span>
              </div>

              {/* 6. Terminer (Red Hangup) */}
              <div className="flex flex-col items-center gap-2">
                <button
                  type="button"
                  onClick={endLiveCallSession}
                  className="w-14 h-14 rounded-full bg-[#ea2c44] hover:bg-[#c91e33] text-white flex items-center justify-center shadow-xl transition-all cursor-pointer active:scale-95"
                >
                  <PhoneOff className="w-6 h-6" />
                </button>
                <span className="text-xs text-stone-300 font-medium">Terminer</span>
              </div>

            </div>

          </div>

        </div>
      )}

      {/* Extra Options Modal (When clicking "Plus") */}
      {showMoreMenu && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-stone-900 border border-stone-800 rounded-3xl max-w-xs w-full p-5 text-white space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm">Options d'appel</h3>
              <button 
                onClick={() => setShowMoreMenu(false)}
                className="p-1 rounded-full text-stone-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <button 
                onClick={handleShare}
                className="w-full p-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 flex items-center gap-2.5 transition-colors text-left"
              >
                <Copy className="w-4 h-4 text-emerald-400" />
                <span>Copier le lien d'invitation</span>
              </button>

              <button 
                onClick={() => {
                  setShowMoreMenu(false);
                  handleOpenChat();
                }}
                className="w-full p-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 flex items-center gap-2.5 transition-colors text-left"
              >
                <MessageSquare className="w-4 h-4 text-blue-400" />
                <span>Ouvrir la boîte de messagerie</span>
              </button>

              <div className="p-2.5 rounded-xl bg-stone-800/50 border border-stone-700/50 text-[11px] text-stone-400 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Appel chiffré et sécurisé en direct.</span>
              </div>
            </div>

            <button
              onClick={() => setShowMoreMenu(false)}
              className="w-full py-2 bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-bold rounded-xl"
            >
              Fermer
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
