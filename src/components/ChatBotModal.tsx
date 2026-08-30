import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Send, X, Bot, User as UserIcon, RefreshCw, Mic, MicOff, 
  Smile, Image as ImageIcon, ThumbsUp, Play, Pause, Trash2, 
  Paperclip, CheckCheck, Volume2, VolumeX, Sparkles, PhoneCall,
  Copy, Check, ShoppingBag, Eye, Search, Share2, Headphones, 
  ExternalLink, MessageSquare, ArrowRight, ShieldCheck, Camera,
  MoreVertical, ArrowLeft, Lock, Info, CheckCircle2,
  AlertTriangle, Reply
} from 'lucide-react';
import { WHATSAPP_NUMBERS, formatFCFA } from '../data/initialData';
import { WhatsAppEmojiPicker } from './WhatsAppEmojiPicker';
import { ChatMessage } from '../types';
import chatbotBgImage from '../assets/images/blue_chatbot_avatar_1786299609810.jpg';
import mangaChatBg from '../assets/images/manga_chat_bg_1786733935014.jpg';

// Quick reaction choices like WhatsApp / Messenger
const MESSENGER_REACTIONS = ['👍', '❤️', '🔥', '😂', '😮', '🙏', '⚽️', '👏'];

// WhatsApp Text Formatter: cleans raw code and renders bold, italic, strike, and bullet points
const renderWhatsAppFormattedMessage = (rawText: string) => {
  if (!rawText) return null;

  // Strict anti-code sanitization: strip any markdown code blocks or backticks
  const cleanText = rawText
    .replace(/^```[a-zA-Z0-9_-]*\n?/gm, '')
    .replace(/```$/gm, '')
    .replace(/`/g, '');

  // Check if text is only 1-3 emojis
  const trimmed = cleanText.trim();
  const emojiOnlyRegex = /^(\p{Extended_Pictographic}|\p{Emoji_Presentation}|\s)+$/u;
  if (emojiOnlyRegex.test(trimmed) && Array.from(trimmed).length <= 4) {
    return <div className="text-3xl sm:text-4xl py-1 select-text leading-none">{trimmed}</div>;
  }

  const lines = cleanText.split('\n');

  const renderInlineStyles = (str: string): React.ReactNode => {
    // Matches *bold*, _italic_, ~strike~
    const regex = /(\*|_|~)(.*?)\1/g;
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(str)) !== null) {
      if (match.index > lastIndex) {
        parts.push(str.substring(lastIndex, match.index));
      }
      const symbol = match[1];
      const content = match[2];

      if (symbol === '*') {
        parts.push(<strong key={match.index} className="font-bold text-stone-950">{content}</strong>);
      } else if (symbol === '_') {
        parts.push(<em key={match.index} className="italic text-stone-800">{content}</em>);
      } else if (symbol === '~') {
        parts.push(<del key={match.index} className="line-through text-stone-500">{content}</del>);
      }
      lastIndex = regex.lastIndex;
    }

    if (lastIndex < str.length) {
      parts.push(str.substring(lastIndex));
    }

    return parts.length > 0 ? parts : str;
  };

  return (
    <div className="space-y-1.5 text-xs sm:text-sm leading-relaxed text-stone-900 break-words font-sans">
      {lines.map((line, idx) => {
        const trimmedLine = line.trim();
        if (!trimmedLine) {
          return <div key={idx} className="h-1" />;
        }

        // Header styles (# or ## or ###)
        if (trimmedLine.startsWith('###') || trimmedLine.startsWith('##') || trimmedLine.startsWith('#')) {
          const headerContent = trimmedLine.replace(/^#+\s*/, '');
          return (
            <p key={idx} className="font-bold text-stone-950 text-sm sm:text-base pt-1 pb-0.5 border-b border-stone-200/50">
              {renderInlineStyles(headerContent)}
            </p>
          );
        }

        // Bullet points (• or - or *)
        if (trimmedLine.startsWith('•') || trimmedLine.startsWith('-') || (trimmedLine.startsWith('*') && !trimmedLine.endsWith('*'))) {
          const bulletContent = trimmedLine.replace(/^[•\-\*]\s*/, '');
          return (
            <div key={idx} className="flex items-start gap-1.5 pl-1 my-0.5">
              <span className="text-[#00a884] font-black shrink-0 mt-0.5">•</span>
              <span className="flex-1">{renderInlineStyles(bulletContent)}</span>
            </div>
          );
        }

        return (
          <p key={idx} className="my-0.5">
            {renderInlineStyles(line)}
          </p>
        );
      })}
    </div>
  );
};

// Audio Sound Effect synthesizer helper (using Web Audio API for lightweight pings)
const playChatSound = (type: 'send' | 'receive') => {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextContextClass) return;
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === 'send') {
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.12); // A5
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.12);
    } else {
      osc.frequency.setValueAtTime(880, ctx.currentTime); // A5
      osc.frequency.exponentialRampToValueAtTime(1174.66, ctx.currentTime + 0.18); // D6
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.18);
    }
  } catch (e) {
    // Silent fail if AudioContext is not permitted
  }
};

const AudioContextContextClass = typeof window !== 'undefined' ? (window.AudioContext || (window as any).webkitAudioContext) : null;

// Audio Voice Note Player Component
const VoiceNotePlayer: React.FC<{ audioUrl: string; duration?: number; isUser: boolean }> = ({ audioUrl, duration, isUser }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [totalDuration, setTotalDuration] = useState(duration || 0);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = new Audio(audioUrl);
    audioRef.current = audio;

    audio.onloadedmetadata = () => {
      if (audio.duration && !isNaN(audio.duration) && audio.duration !== Infinity) {
        setTotalDuration(Math.round(audio.duration));
      }
    };

    audio.ontimeupdate = () => {
      setCurrentTime(Math.round(audio.currentTime));
    };

    audio.onended = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    return () => {
      audio.pause();
      audioRef.current = null;
    };
  }, [audioUrl]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current || !totalDuration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, clickX / rect.width));
    const newTime = percentage * totalDuration;
    audioRef.current.currentTime = newTime;
    setCurrentTime(Math.round(newTime));
  };

  const cycleSpeed = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!audioRef.current) return;
    const nextSpeed = playbackSpeed === 1 ? 1.5 : (playbackSpeed === 1.5 ? 2 : 1);
    audioRef.current.playbackRate = nextSpeed;
    setPlaybackSpeed(nextSpeed);
  };

  const formatSecs = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const progressPercent = totalDuration ? Math.min(100, (currentTime / totalDuration) * 100) : 0;

  return (
    <div className="flex items-center gap-2.5 p-2 rounded-2xl bg-white/80 backdrop-blur-xs text-stone-800 my-1 min-w-[210px] sm:min-w-[240px] border border-stone-200/80 shadow-2xs">
      <button
        type="button"
        onClick={togglePlay}
        className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-transform active:scale-95 shadow-xs cursor-pointer ${
          isUser ? 'bg-[#00a884] text-white' : 'bg-stone-800 text-white'
        }`}
        title={isPlaying ? 'Pause' : 'Écouter la note vocale'}
      >
        {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
      </button>

      <div className="flex-1 space-y-0.5">
        <div 
          onClick={handleSeek} 
          className="flex items-center gap-0.5 h-4 cursor-pointer py-0.5 group"
          title="Cliquer pour naviguer dans l'audio"
        >
          {[35, 70, 25, 85, 50, 95, 40, 75, 30, 65, 45, 80, 40, 60, 25, 90, 45, 70, 35, 80, 50, 65].map((h, idx) => {
            const barProgress = (idx / 22) * 100;
            const isFilled = barProgress <= progressPercent;
            return (
              <div
                key={idx}
                style={{ height: `${h}%` }}
                className={`w-1 rounded-full transition-colors ${
                  isFilled
                    ? (isUser ? 'bg-[#00a884]' : 'bg-emerald-600')
                    : 'bg-stone-300 group-hover:bg-stone-400'
                }`}
              />
            );
          })}
        </div>
        <div className="flex justify-between items-center text-[9px] font-mono text-stone-500 font-medium">
          <span>{formatSecs(currentTime)}</span>
          <span>{totalDuration ? formatSecs(totalDuration) : '0:05'}</span>
        </div>
      </div>

      <button
        type="button"
        onClick={cycleSpeed}
        className="px-1.5 py-0.5 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-700 font-mono font-bold text-[10px] shrink-0 transition-colors cursor-pointer border border-stone-200"
        title="Vitesse de lecture (1x, 1.5x, 2x)"
      >
        {playbackSpeed}x
      </button>
    </div>
  );
};

interface ChatBotModalProps {
  onClose?: () => void;
  isFloating?: boolean;
}

export const ChatBotModal: React.FC<ChatBotModalProps> = ({ onClose, isFloating = false }) => {
  const { 
    chatMessages, 
    sendChatMessage, 
    clearChatHistory, 
    currentUser, 
    setActivePage,
    setLightboxImage,
    toggleMessageReaction,
    getGuestDeviceId,
    products,
    setSelectedProduct,
    addToCart,
    showToast,
    pausedAiUserIds,
    users,
    isAnyAdminOnline,
    openWhatsAppOrderModal
  } = useApp();

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [activeReactionMsgId, setActiveReactionMsgId] = useState<string | null>(null);
  const [replyingTo, setReplyingTo] = useState<ChatMessage['replyTo'] | null>(null);

  // Text-To-Speech (TTS) Voice Synthesis state
  const [speakingMsgId, setSpeakingMsgId] = useState<string | null>(null);

  // Copy Message feedback state
  const [copiedMsgId, setCopiedMsgId] = useState<string | null>(null);

  // Chat sound effects toggle
  const [soundEnabled, setSoundEnabled] = useState(true);

  // In-Chat Product Search & Recommendations Shelf state
  const [productSearchQuery, setProductSearchQuery] = useState('');
  const [showProductShelf, setShowProductShelf] = useState(false);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string | null>(null);

  // Audio Recording States
  const [isRecording, setIsRecording] = useState(false);
  const [isRecordingPaused, setIsRecordingPaused] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<any>(null);
  const imageInputRef = useRef<HTMLInputElement | null>(null);

  // WhatsApp-style UI interactive states
  const [showMenuDropdown, setShowMenuDropdown] = useState(false);
  const [showEncryptionInfo, setShowEncryptionInfo] = useState(false);
  const [selectedWhatsAppNumIndex, setSelectedWhatsAppNumIndex] = useState(0);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatDialogRef = useRef<HTMLDivElement | null>(null);

  const activeClientId = currentUser?.id || getGuestDeviceId();
  const isDirectAdminMode = pausedAiUserIds.includes(activeClientId);

  // Intelligent detection to auto-close Chat IA dialog when user clicks or touches outside the dialog container
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node;
      if (chatDialogRef.current && !chatDialogRef.current.contains(target)) {
        setActivePage('shop');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [setActivePage]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, loading, showProductShelf]);

  // Clean up speech synthesis on unmount
  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Text-To-Speech (TTS) Handler
  const handleToggleSpeak = (msgId: string, textToSpeak: string) => {
    if (!('speechSynthesis' in window)) {
      showToast('Synthèse Vocale Non Supportée', 'Votre navigateur ne supporte pas la lecture audio.', 'error');
      return;
    }

    if (speakingMsgId === msgId) {
      window.speechSynthesis.cancel();
      setSpeakingMsgId(null);
      return;
    }

    window.speechSynthesis.cancel();
    
    // Clean markdown/emojis for smooth speech
    const cleanText = textToSpeak
      .replace(/[*_~#]/g, '')
      .replace(/\[.*?\]/g, '')
      .replace(/(http|https):\/\/\S+/g, '');

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'fr-FR';
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    // Try finding French voice
    const voices = window.speechSynthesis.getVoices();
    const frVoice = voices.find(v => v.lang.startsWith('fr'));
    if (frVoice) {
      utterance.voice = frVoice;
    }

    utterance.onstart = () => setSpeakingMsgId(msgId);
    utterance.onend = () => setSpeakingMsgId(null);
    utterance.onerror = () => setSpeakingMsgId(null);

    window.speechSynthesis.speak(utterance);
  };

  // Copy Message Handler
  const handleCopyText = (msgId: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedMsgId(msgId);
    showToast('Texte Copié !', 'Le message a été copié dans votre presse-papier.', 'success');
    setTimeout(() => setCopiedMsgId(null), 2000);
  };

  // Audio recording handlers (WhatsApp style)
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      recorder.start(100);
      setIsRecording(true);
      setIsRecordingPaused(false);
      setRecordingSeconds(0);

      recordingTimerRef.current = setInterval(() => {
        setRecordingSeconds(prev => prev + 1);
      }, 1000);
    } catch (err) {
      alert("Impossible d'accéder au micro. Veuillez vérifier les autorisations de votre navigateur.");
    }
  };

  const togglePauseRecording = () => {
    if (!mediaRecorderRef.current || !isRecording) return;
    if (isRecordingPaused) {
      mediaRecorderRef.current.resume();
      setIsRecordingPaused(false);
      recordingTimerRef.current = setInterval(() => {
        setRecordingSeconds(prev => prev + 1);
      }, 1000);
    } else {
      mediaRecorderRef.current.pause();
      setIsRecordingPaused(true);
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
    }
  };

  const stopAndSendRecording = () => {
    if (!mediaRecorderRef.current || !isRecording) return;

    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
    }
    const duration = recordingSeconds;

    mediaRecorderRef.current.onstop = async () => {
      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
      const reader = new FileReader();
      reader.readAsDataURL(audioBlob);
      reader.onloadend = async () => {
        const base64Audio = reader.result as string;
        const currentReply = replyingTo;
        setIsRecording(false);
        setIsRecordingPaused(false);
        setRecordingSeconds(0);
        setReplyingTo(null);
        setLoading(true);

        if (soundEnabled) playChatSound('send');

        await sendChatMessage("🎙️ [Note vocale]", {
          audioUrl: base64Audio,
          audioDuration: duration || 3,
          replyTo: currentReply || undefined
        });

        setLoading(false);
        if (soundEnabled) playChatSound('receive');
      };

      mediaRecorderRef.current?.stream.getTracks().forEach(track => track.stop());
    };

    try {
      mediaRecorderRef.current.stop();
    } catch (e) {}
  };

  const cancelRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
      try {
        mediaRecorderRef.current.stop();
        mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      } catch (e) {}
      setIsRecording(false);
      setIsRecordingPaused(false);
      setRecordingSeconds(0);
    }
  };

  // Image Upload handler
  const handleImageFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if ((!input.trim() && !selectedImage) || loading) return;

    const textToSend = input.trim();
    const imageToSend = selectedImage;
    const currentReply = replyingTo;

    setInput('');
    setSelectedImage(null);
    setReplyingTo(null);
    setShowEmojiPicker(false);
    setLoading(true);

    if (soundEnabled) playChatSound('send');

    await sendChatMessage(textToSend || (imageToSend ? "📸 [Photo attachée]" : ""), {
      imageUrl: imageToSend || undefined,
      replyTo: currentReply || undefined
    });

    setLoading(false);
    if (soundEnabled) playChatSound('receive');
  };

  const sendQuickThumbsUp = async () => {
    if (loading) return;
    setLoading(true);
    if (soundEnabled) playChatSound('send');
    await sendChatMessage("👍");
    setLoading(false);
    if (soundEnabled) playChatSound('receive');
  };

  const handleQuickQuestion = async (q: string, filterCategory?: string) => {
    if (loading) return;
    if (filterCategory) {
      setSelectedCategoryFilter(filterCategory);
      setShowProductShelf(true);
    }
    setLoading(true);
    if (soundEnabled) playChatSound('send');
    await sendChatMessage(q);
    setLoading(false);
    if (soundEnabled) playChatSound('receive');
  };

  // WhatsApp Quote / History Summary Generator
  const handleSendWhatsAppQuote = () => {
    const activeMsgs = visibleMessages.slice(-6);
    const summaryText = activeMsgs.map(m => `${m.sender === 'user' ? 'Client' : 'Assistant'}: ${m.text}`).join('\n');
    const message = `Bonjour DONALDSON SHOP ! Je souhaite poursuivre notre discussion du site et obtenir un devis de livraison :\n\n-- RÉCAPITULATIF CHAT --\n${summaryText}\n\nMerci de me recontacter !`;
    openWhatsAppOrderModal({
      message,
      title: 'Transférer sur WhatsApp',
      subtitle: 'Choisissez votre ligne WhatsApp préférée pour poursuivre la conversation :'
    });
  };

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const visibleMessages = chatMessages.filter(msg => {
    if (msg.id === 'msg_welcome') return true;
    if (msg.userId === activeClientId || msg.targetUserId === activeClientId) return true;
    if (msg.sender === 'admin' && (msg.userId === 'ALL' || msg.userId === activeClientId)) return true;
    return false;
  });

  // Filter products for the in-chat product shelf
  const displayedProducts = products.filter(p => {
    const matchesSearch = !productSearchQuery || 
      p.name.toLowerCase().includes(productSearchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(productSearchQuery.toLowerCase());
    const matchesCat = !selectedCategoryFilter || p.category.toLowerCase().includes(selectedCategoryFilter.toLowerCase());
    return matchesSearch && matchesCat;
  }).slice(0, 8);

  const handleCloseChat = () => {
    if (onClose) {
      onClose();
    } else {
      setActivePage('shop');
    }
  };

  return (
    <div className={isFloating ? "w-full h-full flex flex-col overflow-hidden relative" : "max-w-4xl mx-auto py-4 sm:py-6 px-3 sm:px-6 lg:px-8 pb-16"}>
      <div ref={chatDialogRef} className={`bg-[#efeae2] rounded-3xl border border-stone-300 shadow-2xl overflow-hidden flex flex-col relative ${isFloating ? 'h-full w-full' : 'h-[86vh]'}`}>
        
        {/* WhatsApp Top Header Bar */}
        <div className="bg-[#1f2c34] text-white p-2.5 sm:p-3.5 flex items-center justify-between gap-2 border-b border-stone-800 shrink-0 shadow-md w-full relative z-20">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            {/* Back Button */}
            <button
              type="button"
              onClick={handleCloseChat}
              className="p-1.5 rounded-full hover:bg-white/10 text-stone-300 hover:text-white transition-colors cursor-pointer shrink-0"
              title="Retour"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>

            {/* Profile Avatar */}
            <div className="relative shrink-0 cursor-pointer" onClick={() => setShowProductShelf(!showProductShelf)}>
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full overflow-hidden bg-stone-800 border border-stone-600 shadow-xs flex items-center justify-center shrink-0">
                <img 
                  src={chatbotBgImage} 
                  alt="DONALDSON SHOP" 
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover" 
                />
              </div>
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-[#1f2c34] rounded-full" title="En ligne" />
            </div>

            {/* Contact Name & Status */}
            <div className="min-w-0 cursor-pointer" onClick={() => setShowProductShelf(!showProductShelf)}>
              <div className="flex items-center gap-1.5">
                <h2 className="font-sans font-bold text-sm sm:text-base text-white truncate">
                  DONALDSON SHOP
                </h2>
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              </div>
              <p className="text-[11px] text-emerald-400 flex items-center gap-1 font-medium truncate">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                <span className="truncate">{isDirectAdminMode ? 'Support Direct Administration' : 'en ligne'}</span>
              </p>
            </div>
          </div>

          {/* Right Header Actions (Product Shelf, Sound Toggle, Menu, Close) */}
          <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
            {/* Product Shelf Toggle */}
            <button
              type="button"
              onClick={() => setShowProductShelf(!showProductShelf)}
              className={`p-2 rounded-full transition-colors cursor-pointer shrink-0 ${
                showProductShelf ? 'bg-amber-400 text-stone-950 font-bold' : 'hover:bg-white/10 text-stone-200 hover:text-white'
              }`}
              title="Catalogue rapide"
            >
              <ShoppingBag className="w-5 h-5" />
            </button>

            {/* 3 Dots Menu Button */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowMenuDropdown(!showMenuDropdown)}
                className="p-2 rounded-full hover:bg-white/10 text-stone-200 hover:text-white transition-colors cursor-pointer shrink-0"
                title="Options"
              >
                <MoreVertical className="w-5 h-5" />
              </button>

              {/* 3 Dots Dropdown Menu (WhatsApp Clean White Styling) */}
              {showMenuDropdown && (
                <div className="absolute right-0 top-11 z-50 w-60 bg-white text-stone-800 rounded-2xl shadow-2xl border border-stone-200 py-1.5 animate-scaleUp">
                  <button
                    type="button"
                    onClick={() => {
                      setShowProductShelf(!showProductShelf);
                      setShowMenuDropdown(false);
                    }}
                    className="w-full px-4 py-2.5 text-left text-xs font-semibold hover:bg-stone-50 flex items-center gap-3 transition-colors cursor-pointer text-stone-700 hover:text-stone-900"
                  >
                    <ShoppingBag className="w-4 h-4 text-amber-500 shrink-0" />
                    <span>Catalogue d'articles</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      handleSendWhatsAppQuote();
                      setShowMenuDropdown(false);
                    }}
                    className="w-full px-4 py-2.5 text-left text-xs font-semibold hover:bg-stone-50 flex items-center gap-3 transition-colors cursor-pointer text-stone-700 hover:text-stone-900"
                  >
                    <PhoneCall className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Devis & Contact WhatsApp</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setSoundEnabled(!soundEnabled);
                      showToast(soundEnabled ? 'Sons Désactivés' : 'Sons Activés 🔊', 'Feedback sonore de discussion.', 'info');
                      setShowMenuDropdown(false);
                    }}
                    className="w-full px-4 py-2.5 text-left text-xs font-semibold hover:bg-stone-50 flex items-center gap-3 transition-colors cursor-pointer text-stone-700 hover:text-stone-900"
                  >
                    {soundEnabled ? <Volume2 className="w-4 h-4 text-amber-500 shrink-0" /> : <VolumeX className="w-4 h-4 text-stone-400 shrink-0" />}
                    <span>{soundEnabled ? 'Désactiver les sons' : 'Activer les sons'}</span>
                  </button>

                  <div className="h-px bg-stone-100 my-1" />

                  <button
                    type="button"
                    onClick={() => {
                      clearChatHistory();
                      setShowMenuDropdown(false);
                    }}
                    className="w-full px-4 py-2.5 text-left text-xs font-semibold hover:bg-rose-50 text-rose-600 flex items-center gap-3 transition-colors cursor-pointer"
                  >
                    <RefreshCw className="w-4 h-4 text-rose-500 shrink-0" />
                    <span>Vider l'historique</span>
                  </button>
                </div>
              )}
            </div>

            {/* Close Button */}
            <button
              onClick={handleCloseChat}
              className="p-1.5 sm:p-2 rounded-full hover:bg-white/10 text-stone-300 hover:text-white transition-colors cursor-pointer shrink-0 ml-1"
              title="Fermer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Direct Admin Mode Banner */}
        {isDirectAdminMode && (
          <div className="bg-[#005c4b] text-white px-4 py-2 flex items-center justify-between text-xs animate-fadeIn shrink-0 shadow-inner">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-300 animate-ping" />
              <span className="font-bold text-emerald-100">
                Prise en main directe par l'Administration DONALDSON SHOP en cours.
              </span>
            </div>
            <span className="text-[10px] bg-emerald-900/80 px-2 py-0.5 rounded-md text-emerald-100 font-mono">
              Support VIP
            </span>
          </div>
        )}

        {/* Quick Suggestion Chips (WhatsApp Quick Answers) */}
        <div className="bg-[#f0f2f5] border-b border-stone-300/80 p-2 flex items-center gap-2 overflow-x-auto text-xs no-scrollbar shrink-0">
          <div className="flex items-center gap-1 font-bold text-stone-500 shrink-0 text-[10px] uppercase tracking-wider pl-1 pr-0.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>Sujets :</span>
          </div>

          <button
            onClick={() => handleQuickQuestion("Quels sont les tarifs et prix des produits disponibles ?")}
            className="px-3 py-1 rounded-full bg-white border border-stone-300 text-stone-800 font-medium hover:border-emerald-500 hover:bg-emerald-50 whitespace-nowrap transition-all text-[11px] flex items-center gap-1 shadow-2xs active:scale-95 cursor-pointer"
          >
            💰 Tarifs & Prix
          </button>

          <button
            onClick={() => handleQuickQuestion("Comment vérifier le statut de ma commande ?")}
            className="px-3 py-1 rounded-full bg-white border border-stone-300 text-stone-800 font-medium hover:border-emerald-500 hover:bg-emerald-50 whitespace-nowrap transition-all text-[11px] flex items-center gap-1 shadow-2xs active:scale-95 cursor-pointer"
          >
            📦 Statut Commande
          </button>

          <button
            onClick={() => handleQuickQuestion("Quels sont les maillots pro disponibles et les options de flocage ?", "Maillots")}
            className="px-3 py-1 rounded-full bg-white border border-stone-300 text-stone-800 font-medium hover:border-emerald-500 hover:bg-emerald-50 whitespace-nowrap transition-all text-[11px] flex items-center gap-1 shadow-2xs active:scale-95 cursor-pointer"
          >
            ⚽ Maillots & Flocages
          </button>

          <button
            onClick={() => handleQuickQuestion("Quels sont les modèles de crampons et chaussures de foot disponibles ?", "Chaussures")}
            className="px-3 py-1 rounded-full bg-white border border-stone-300 text-stone-800 font-medium hover:border-emerald-500 hover:bg-emerald-50 whitespace-nowrap transition-all text-[11px] flex items-center gap-1 shadow-2xs active:scale-95 cursor-pointer"
          >
            👟 Crampons & Tailles
          </button>

          <button
            onClick={() => handleQuickQuestion("Où se trouve la boutique physique DONALDSON à Lomé et quels sont ses horaires ?")}
            className="px-3 py-1 rounded-full bg-white border border-stone-300 text-stone-800 font-medium hover:border-emerald-500 hover:bg-emerald-50 whitespace-nowrap transition-all text-[11px] flex items-center gap-1 shadow-2xs active:scale-95 cursor-pointer"
          >
            📍 Boutique à Lomé
          </button>

          <button
            onClick={handleSendWhatsAppQuote}
            className="px-3 py-1 rounded-full bg-[#25d366] text-white font-bold hover:bg-[#1ebd5b] whitespace-nowrap transition-all text-[11px] flex items-center gap-1 shadow-2xs active:scale-95 cursor-pointer"
          >
            💬 WhatsApp Direct
          </button>
        </div>

        {/* Product Recommendations Shelf */}
        {showProductShelf && (
          <div className="bg-white border-b border-stone-200 p-3 text-stone-900 space-y-2 animate-fadeIn shrink-0 shadow-xs">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-emerald-600" />
                <span className="font-bold text-emerald-800">Articles Recommandés DONALDSON :</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-2" />
                  <input
                    type="text"
                    value={productSearchQuery}
                    onChange={(e) => setProductSearchQuery(e.target.value)}
                    placeholder="Filtrer un article..."
                    className="pl-8 pr-3 py-1 rounded-xl bg-stone-50 text-stone-800 text-[11px] outline-none border border-stone-200 focus:border-emerald-500 focus:bg-white w-36 sm:w-48 transition-all"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setShowProductShelf(false)}
                  className="p-1 text-stone-400 hover:text-stone-700 cursor-pointer rounded-lg hover:bg-stone-100 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex items-center gap-3 overflow-x-auto pb-1 pt-1 no-scrollbar">
              {displayedProducts.length === 0 ? (
                <p className="text-xs text-stone-400 py-2 italic">Aucun article ne correspond à votre recherche.</p>
              ) : (
                displayedProducts.map((prod, idx) => (
                  <div 
                    key={`${prod.id}_${idx}`} 
                    className="shrink-0 w-44 bg-white border border-stone-200 hover:border-emerald-500 hover:shadow-md rounded-2xl p-2.5 space-y-2 shadow-xs transition-all group"
                  >
                    <div className="relative h-24 rounded-xl overflow-hidden bg-stone-100 border border-stone-100">
                      <img 
                        src={prod.image || prod.imageUrl} 
                        alt={prod.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                      <span className="absolute top-1 left-1 bg-stone-900/80 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md shadow-xs">
                        {prod.category}
                      </span>
                    </div>

                    <div>
                      <h4 className="text-xs font-bold text-stone-800 line-clamp-1 group-hover:text-emerald-700 transition-colors">
                        {prod.name}
                      </h4>
                      <p className="text-xs font-black text-emerald-700 mt-0.5">
                        {formatFCFA(prod.priceFCFA)}
                      </p>
                    </div>

                    <div className="flex items-center gap-1 pt-0.5">
                      <button
                        type="button"
                        onClick={() => setSelectedProduct(prod)}
                        className="py-1 px-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-[10px] flex items-center justify-center gap-1 transition-all cursor-pointer border border-stone-200/60"
                        title="Aperçu du produit"
                      >
                        <Eye className="w-3 h-3 text-stone-600" />
                        <span>Aperçu</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const imgUrl = prod.image || prod.imageUrl;
                          sendChatMessage(`Pouvez-vous me donner tous les détails et la disponibilité sur cet article : ${prod.name} ?`, {
                            imageUrl: imgUrl
                          });
                        }}
                        className="py-1 px-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-[10px] flex items-center justify-center gap-1 border border-emerald-200 transition-all cursor-pointer"
                        title="Discuter dans le chat"
                      >
                        <Camera className="w-3 h-3 text-emerald-600" />
                        <span>Chat</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          addToCart(prod, 1);
                          showToast('Ajouté au Panier !', `${prod.name} a été ajouté à votre commande.`, 'success');
                        }}
                        className="p-1 rounded-xl bg-[#00a884] hover:bg-[#008f72] text-white font-bold transition-all cursor-pointer shadow-xs ml-auto"
                        title="Ajouter au Panier"
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Messages Body Area (WhatsApp Clean Crisp Layout) */}
        <div 
          className="flex-1 overflow-y-auto p-3.5 sm:p-5 space-y-3 relative bg-[#efeae2]"
          style={{
            backgroundImage: `radial-gradient(#d1d7db 0.75px, transparent 0.75px)`,
            backgroundSize: '24px 24px'
          }}
        >
          {/* WhatsApp Centered Date Pill (Matching the Screenshot: "26 décembre 2025") */}
          <div className="flex justify-center my-1 relative z-10">
            <span className="bg-white/90 backdrop-blur-xs text-stone-700 text-[11px] font-semibold px-3 py-1 rounded-lg shadow-2xs border border-stone-200">
              26 décembre 2025
            </span>
          </div>

          {/* WhatsApp End-to-End Encryption Warning Box (Exact Text & Styling from the Screenshot) */}
          <div className="flex justify-center my-2 relative z-10">
            <div className="bg-[#ffeecd] border border-[#f5dfaa] text-[#544321] text-[11px] leading-relaxed rounded-xl p-3 max-w-sm shadow-xs text-center">
              <div className="flex items-start justify-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-[#544321] shrink-0 mt-0.5" />
                <p>
                  Les messages et les appels sont chiffrés de bout en bout. Seules les personnes prenant part à cette discussion peuvent les lire, les écouter ou les partager.{' '}
                  <button
                    type="button"
                    onClick={() => setShowEncryptionInfo(true)}
                    className="font-bold text-[#544321] hover:underline cursor-pointer inline"
                  >
                    En savoir plus
                  </button>
                </p>
              </div>
            </div>
          </div>

          {/* Guest Account Info Notice */}
          {!currentUser && (
            <div className="bg-white/95 backdrop-blur-md border border-stone-200 rounded-2xl p-3 mb-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 shadow-sm relative z-10">
              <div className="flex items-center gap-2">
                <span className="text-lg">👋</span>
                <p className="text-xs text-stone-800 font-medium">
                  Visiteur invité • Connectez-vous pour synchroniser votre historique et vos commandes.
                </p>
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
                <button
                  onClick={() => setActivePage('login')}
                  className="flex-1 sm:flex-initial px-3 py-1.5 rounded-xl bg-stone-900 text-amber-300 text-xs font-bold hover:bg-black transition-all cursor-pointer"
                >
                  Connexion
                </button>
                <button
                  onClick={() => setActivePage('register')}
                  className="flex-1 sm:flex-initial px-3 py-1.5 rounded-xl bg-[#00a884] text-white text-xs font-bold hover:bg-[#008f72] transition-all cursor-pointer"
                >
                  S'inscrire
                </button>
              </div>
            </div>
          )}

          {/* Message List */}
          {visibleMessages.map((msg) => {
            const isUser = msg.sender === 'user';
            const isAdmin = msg.sender === 'admin';
            const isSpeakingThis = speakingMsgId === msg.id;

            return (
              <div
                key={msg.id}
                className={`relative group flex gap-2 max-w-[88%] sm:max-w-[78%] animate-msg-slide-up z-10 ${
                  isUser ? 'ml-auto justify-end' : 'mr-auto justify-start'
                }`}
              >
                <div className="space-y-0.5 max-w-full">
                  {/* WhatsApp Message Bubble */}
                  <div
                    className={`relative p-3 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-sm transition-all ${
                      isUser
                        ? 'bg-[#d9fdd3] text-stone-900 border border-[#c2ebb7] rounded-tr-xs'
                        : 'bg-white text-stone-900 border border-stone-200/80 rounded-tl-xs'
                    }`}
                  >
                    {/* Quoted / Replied Message preview inside bubble */}
                    {msg.replyTo && (
                      <div className="mb-2 p-2 rounded-xl bg-black/[0.04] border-l-4 border-[#00a884] text-xs text-stone-700 select-none">
                        <p className="font-bold text-[#00a884] text-[11px] flex items-center gap-1">
                          <Reply className="w-3 h-3 rotate-180" />
                          <span>{msg.replyTo.senderName}</span>
                        </p>
                        <p className="text-[11px] text-stone-600 line-clamp-2 mt-0.5">
                          {msg.replyTo.text || (msg.replyTo.imageUrl ? '📷 Photo attachée' : (msg.replyTo.audioUrl ? '🎙️ Note vocale' : 'Message'))}
                        </p>
                      </div>
                    )}

                    {/* Attached Image */}
                    {msg.imageUrl && (
                      <div className="mb-2 rounded-xl overflow-hidden border border-black/10 max-w-xs cursor-pointer">
                        <img
                          src={msg.imageUrl}
                          alt="Photo attachée"
                          referrerPolicy="no-referrer"
                          onClick={() => setLightboxImage({ url: msg.imageUrl!, title: "Photo partagée dans le chat" })}
                          className="w-full max-h-56 object-cover hover:scale-105 transition-transform"
                        />
                      </div>
                    )}

                    {/* Audio Voice Note Player */}
                    {msg.audioUrl && (
                      <VoiceNotePlayer audioUrl={msg.audioUrl} duration={msg.audioDuration} isUser={isUser} />
                    )}

                    {/* Message Text formatted like WhatsApp */}
                    {msg.text && msg.text !== "🎙️ [Note vocale]" && msg.text !== "📸 [Photo attachée]" && (
                      <div className="font-normal text-stone-900 text-xs sm:text-sm">
                        {renderWhatsAppFormattedMessage(msg.text)}
                      </div>
                    )}

                    {/* Bubble Bottom Bar: Timestamp & Double Blue Ticks */}
                    <div className="flex items-center justify-end gap-1 pt-1 mt-0.5 text-[10px] text-stone-500 select-none">
                      <span>
                        {new Date(msg.timestamp).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      {isUser && (
                        <CheckCheck className="w-3.5 h-3.5 text-[#53bdeb]" />
                      )}
                    </div>

                    {/* Reactions Display */}
                    {msg.reactions && Object.keys(msg.reactions).length > 0 && (
                      <div className={`absolute -bottom-3 ${isUser ? 'right-2' : 'left-2'} flex items-center gap-1 bg-white border border-stone-200 shadow-md px-2 py-0.5 rounded-full text-xs z-10`}>
                        {Object.entries(msg.reactions).map(([emoji, userList]) => {
                          const users = userList as string[];
                          return users.length > 0 ? (
                            <span
                              key={emoji}
                              onClick={() => toggleMessageReaction(msg.id, emoji)}
                              className="cursor-pointer hover:scale-125 transition-transform text-[11px]"
                              title={`${users.length} réaction(s)`}
                            >
                              {emoji} <span className="text-[9px] text-stone-600 font-bold">{users.length}</span>
                            </span>
                          ) : null;
                        })}
                      </div>
                    )}
                  </div>

                  {/* Quick Action Button Row: Répondre + Réagir + Copier */}
                  <div className={`flex items-center gap-2.5 text-[11px] ${isUser ? 'justify-end pr-1' : 'pl-1'}`}>
                    <button
                      type="button"
                      onClick={() => setReplyingTo({
                        id: msg.id,
                        senderName: isUser ? 'Vous' : (msg.userName || 'DONALDSON SHOP'),
                        text: msg.text || (msg.imageUrl ? '📷 Photo attachée' : (msg.audioUrl ? '🎙️ Note vocale' : 'Message')),
                        imageUrl: msg.imageUrl,
                        audioUrl: msg.audioUrl
                      })}
                      className="text-stone-500 hover:text-[#00a884] font-medium opacity-70 hover:opacity-100 transition-opacity cursor-pointer flex items-center gap-1"
                      title="Répondre"
                    >
                      <Reply className="w-3 h-3 rotate-180" />
                      <span>Répondre</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveReactionMsgId(activeReactionMsgId === msg.id ? null : msg.id)}
                      className="text-stone-500 hover:text-stone-800 font-medium opacity-70 hover:opacity-100 transition-opacity cursor-pointer"
                    >
                      Réagir
                    </button>

                    {/* Copier button */}
                    {msg.text && msg.text !== "🎙️ [Note vocale]" && (
                      <button
                        type="button"
                        onClick={() => handleCopyText(msg.id, msg.text)}
                        className="text-stone-500 hover:text-stone-800 font-medium opacity-70 hover:opacity-100 transition-opacity cursor-pointer flex items-center gap-1"
                        title="Copier le message"
                      >
                        {copiedMsgId === msg.id ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-600" />
                            <span className="text-emerald-600 font-bold">Copié</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copier</span>
                          </>
                        )}
                      </button>
                    )}

                    {activeReactionMsgId === msg.id && (
                      <div className="flex items-center gap-1.5 bg-white border border-stone-300 shadow-xl p-1.5 rounded-full z-20 animate-fadeIn">
                        {MESSENGER_REACTIONS.map(emoji => (
                          <button
                            key={emoji}
                            type="button"
                            onClick={() => {
                              toggleMessageReaction(msg.id, emoji);
                              setActiveReactionMsgId(null);
                            }}
                            className="p-1 hover:scale-130 transition-transform text-base cursor-pointer"
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Typing Indicator */}
          {loading && (
            <div className="flex gap-2 mr-auto max-w-[85%] items-end text-xs text-stone-500 animate-msg-slide-up my-1 z-10">
              <div className="p-3 bg-white rounded-2xl border border-stone-200 shadow-xs flex items-center gap-2 rounded-tl-none">
                <span className="text-xs text-stone-600 font-medium">DONALDSON SHOP est en train d'écrire</span>
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00a884] animate-bounce [animation-delay:-0.3s]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00a884] animate-bounce [animation-delay:-0.15s]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00a884] animate-bounce" />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Replying To Quote Banner (WhatsApp Style) */}
        {replyingTo && !isRecording && (
          <div className="mx-3 mb-1.5 p-2 rounded-2xl bg-white border border-stone-200 shadow-md flex items-center justify-between gap-2 border-l-4 border-l-[#00a884] animate-fadeIn shrink-0 z-20">
            <div className="min-w-0 flex-1 pl-1">
              <p className="text-[11px] font-bold text-[#00a884] flex items-center gap-1">
                <Reply className="w-3 h-3 rotate-180" />
                <span>Répondre à {replyingTo.senderName}</span>
              </p>
              <p className="text-xs text-stone-600 truncate mt-0.5">
                {replyingTo.text || (replyingTo.imageUrl ? '📷 Photo' : (replyingTo.audioUrl ? '🎙️ Note vocale' : 'Message'))}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setReplyingTo(null)}
              className="p-1 text-stone-400 hover:text-stone-700 rounded-full hover:bg-stone-100 cursor-pointer shrink-0 transition-colors"
              title="Annuler la réponse"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Selected Image Banner */}
        {selectedImage && !isRecording && (
          <div className="px-3.5 py-2 bg-white text-stone-900 border-t border-stone-200 shadow-sm flex items-center justify-between animate-fadeIn shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl overflow-hidden border border-emerald-500 shadow-xs relative shrink-0">
                <img src={selectedImage} alt="Photo attachée" className="w-full h-full object-cover" />
              </div>
              <div className="text-xs">
                <p className="font-bold text-emerald-700 flex items-center gap-1">
                  <Camera className="w-3.5 h-3.5" />
                  <span>Photo prête à l'envoi</span>
                </p>
                <p className="text-[10px] text-stone-500">Le chat va analyser cet équipement sportif</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setSelectedImage(null)}
              className="p-1.5 rounded-full hover:bg-stone-100 text-stone-400 hover:text-stone-700 transition-colors cursor-pointer"
              title="Supprimer la photo"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* WhatsApp Voice Note Recording Live Bar */}
        {isRecording ? (
          <div className="p-2 sm:p-3 bg-transparent flex items-center gap-2 shrink-0 w-full relative z-20 animate-fadeIn">
            {/* Main WhatsApp Recording Capsule */}
            <div className="flex-1 bg-white rounded-full flex items-center px-4 py-2 sm:py-2.5 shadow-md border border-stone-200/80 gap-3">
              {/* Trash/Cancel Button */}
              <button
                type="button"
                onClick={cancelRecording}
                className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-full transition-colors cursor-pointer shrink-0"
                title="Supprimer l'enregistrement"
              >
                <Trash2 className="w-5 h-5" />
              </button>

              {/* Red Blinking Recording Dot + Timer */}
              <div className="flex items-center gap-2 shrink-0">
                <span className={`w-3 h-3 rounded-full bg-red-500 shrink-0 ${isRecordingPaused ? 'opacity-50' : 'animate-ping'}`} />
                <span className="text-sm font-mono font-bold text-stone-800 tracking-wider">
                  {formatTimer(recordingSeconds)}
                </span>
              </div>

              {/* Animated Live Waveform */}
              <div className="flex-1 flex items-center justify-center gap-0.5 sm:gap-1 h-5 overflow-hidden">
                {[40, 70, 25, 90, 60, 100, 45, 80, 30, 95, 50, 75, 40, 85, 30, 90, 60, 80, 45, 70].map((h, i) => (
                  <div
                    key={i}
                    style={{ 
                      height: isRecordingPaused ? '25%' : `${Math.max(20, (h * ((recordingSeconds % 3) + 1) / 3))}%`,
                      transition: 'height 0.15s ease'
                    }}
                    className={`w-1 rounded-full ${isRecordingPaused ? 'bg-stone-300' : 'bg-[#00a884]'}`}
                  />
                ))}
              </div>

              {/* Pause / Resume Button */}
              <button
                type="button"
                onClick={togglePauseRecording}
                className="p-1.5 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-full transition-colors cursor-pointer shrink-0"
                title={isRecordingPaused ? 'Reprendre' : 'Mettre en pause'}
              >
                {isRecordingPaused ? <Play className="w-5 h-5 fill-current" /> : <Pause className="w-5 h-5 fill-current" />}
              </button>
            </div>

            {/* Green WhatsApp Send Button */}
            <button
              type="button"
              onClick={stopAndSendRecording}
              className="w-11 h-11 rounded-full bg-[#00a884] hover:bg-[#008f72] active:scale-95 text-white flex items-center justify-center shadow-md shrink-0 cursor-pointer transition-transform"
              title="Envoyer la note vocale"
            >
              <Send className="w-5 h-5 ml-0.5 text-white" />
            </button>
          </div>
        ) : (
          /* WhatsApp Bottom Input Bar (Pixel-Matched to WhatsApp) */
          <form 
            onSubmit={handleSend} 
            className="p-2 sm:p-3 bg-transparent flex items-center gap-2 shrink-0 w-full relative z-20"
          >
            {/* Hidden File Input */}
            <input
              type="file"
              ref={imageInputRef}
              accept="image/*"
              onChange={handleImageFile}
              className="hidden"
            />

            {/* Left Pill Container with Emoji, Input, Paperclip and Camera */}
            <div className="flex-1 bg-white rounded-full flex items-center px-3.5 py-1.5 sm:py-2 shadow-md border border-stone-200/80 gap-1.5 sm:gap-2">
              {/* Emoji Button */}
              <button
                type="button"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className={`p-1 cursor-pointer shrink-0 transition-transform active:scale-95 ${
                  showEmojiPicker ? 'text-[#00a884]' : 'text-stone-500 hover:text-stone-700'
                }`}
                title="Émojis WhatsApp"
              >
                <Smile className="w-6 h-6" />
              </button>

              {/* Text Input with placeholder "Message" */}
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Message"
                className="flex-1 min-w-0 px-1 py-1 text-sm text-stone-900 placeholder:text-stone-400 bg-transparent outline-none font-sans"
              />

              {/* Paperclip Button */}
              <button
                type="button"
                onClick={() => imageInputRef.current?.click()}
                className="p-1 text-stone-500 hover:text-stone-700 cursor-pointer shrink-0 transition-transform active:scale-95 -rotate-45"
                title="Joindre un fichier / photo"
              >
                <Paperclip className="w-5 h-5 text-stone-500" />
              </button>

              {/* Camera Button */}
              <button
                type="button"
                onClick={() => imageInputRef.current?.click()}
                className="p-1 text-stone-500 hover:text-stone-700 cursor-pointer shrink-0 transition-transform active:scale-95"
                title="Appareil photo / Analyse photo"
              >
                <Camera className="w-5 h-5 text-stone-500" />
              </button>
            </div>

            {/* Right Circular Voice/Send Button */}
            {input.trim() || selectedImage ? (
              <button
                type="submit"
                disabled={loading}
                className="w-11 h-11 rounded-full bg-[#00a884] hover:bg-[#008f72] active:scale-95 disabled:opacity-50 text-white flex items-center justify-center shadow-md shrink-0 cursor-pointer transition-transform"
                title="Envoyer le message"
              >
                <Send className="w-5 h-5 ml-0.5 text-white" />
              </button>
            ) : (
              <button
                type="button"
                onClick={startRecording}
                className="w-11 h-11 rounded-full bg-[#00a884] hover:bg-[#008f72] active:scale-95 text-white flex items-center justify-center shadow-md shrink-0 cursor-pointer transition-transform"
                title="Enregistrer une note vocale"
              >
                <Mic className="w-5 h-5 text-white" />
              </button>
            )}
          </form>
        )}

        {/* Complete WhatsApp Emoji Keyboard Drawer */}
        {showEmojiPicker && (
          <div className="border-t border-stone-200 bg-white relative z-30 animate-fadeIn shrink-0 shadow-lg">
            <WhatsAppEmojiPicker
              onSelectEmoji={(emoji) => setInput(prev => prev + emoji)}
              onClose={() => setShowEmojiPicker(false)}
            />
          </div>
        )}

      </div>

      {/* Encryption Details Modal */}
      {showEncryptionInfo && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-stone-200 relative animate-scaleUp">
            <button
              onClick={() => setShowEncryptionInfo(false)}
              className="absolute right-5 top-5 p-2 rounded-full hover:bg-stone-100 text-stone-500 transition-colors cursor-pointer"
            >
              ✕
            </button>

            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center">
              <Lock className="w-6 h-6 text-amber-700" />
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-bold text-stone-900">
                Chiffrement & Sécurité des Échanges
              </h3>
              <p className="text-xs text-stone-600 leading-relaxed font-light">
                Vos échanges avec <strong>DONALDSON SHOP</strong> et notre Assistant Chat sont protégés. Vos données de commande, adresses et messages sont strictement confidentiels et ne sont jamais partagés avec des tiers non autorisés.
              </p>
            </div>

            <div className="space-y-2 pt-2 border-t border-stone-100 text-xs">
              <div className="flex items-center gap-2 text-emerald-700 font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Protection des données personnelles</span>
              </div>
              <div className="flex items-center gap-2 text-emerald-700 font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Transactions & Devis sécurisés</span>
              </div>
            </div>

            <button
              onClick={() => setShowEncryptionInfo(false)}
              className="w-full py-2.5 rounded-xl bg-stone-900 text-white text-xs font-bold hover:bg-black transition-colors cursor-pointer"
            >
              J'ai compris
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

