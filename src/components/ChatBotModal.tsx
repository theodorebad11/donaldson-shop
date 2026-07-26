import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { MessageSquare, Send, X, Bot, User as UserIcon, Sparkles, RefreshCw, PhoneCall } from 'lucide-react';
import { WHATSAPP_NUMBERS } from '../data/initialData';

export const ChatBotModal: React.FC = () => {
  const { chatMessages, sendChatMessage, clearChatHistory, currentUser, setActivePage } = useApp();

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const text = input.trim();
    setInput('');
    setLoading(true);

    await sendChatMessage(text);
    setLoading(false);
  };

  const handleQuickQuestion = async (q: string) => {
    if (loading) return;
    setLoading(true);
    await sendChatMessage(q);
    setLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8 pb-16">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden flex flex-col h-[75vh]">
        
        {/* Chat Header */}
        <div className="bg-ink p-4 sm:p-5 text-white flex items-center justify-between border-b border-gold/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gold text-ink flex items-center justify-center font-bold border border-gold/50 shadow-md">
              <Bot className="w-6 h-6 text-ink" />
            </div>
            <div>
              <h2 className="font-serif-title font-bold text-base flex items-center gap-2 text-white">
                Assistant IA DONALDSON
                <span className="bg-gold/20 text-gold text-[10px] px-2 py-0.5 rounded-full border border-gold/40 font-bold uppercase tracking-wider">
                  Sport Pro
                </span>
              </h2>
              <p className="text-[11px] text-stone-300 font-light">
                Conseils équipements, articles & choix des tailles
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={clearChatHistory}
              className="p-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white transition-colors"
              title="Effacer la conversation"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={() => setActivePage('shop')}
              className="p-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white transition-colors"
              title="Fermer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Quick Suggestion Chips */}
        <div className="bg-stone-50 border-b border-stone-200 p-2.5 flex items-center gap-2 overflow-x-auto text-xs no-scrollbar">
          <span className="font-bold text-stone-400 shrink-0 text-[10px] uppercase tracking-wider pl-2">Questions rapides :</span>
          <button
            onClick={() => handleQuickQuestion("Quels sont les maillots pro disponibles et leurs prix ?")}
            className="px-3 py-1 rounded-full bg-white border border-stone-200 text-stone-700 font-semibold hover:border-gold hover:text-ink whitespace-nowrap transition-all shadow-2xs"
          >
            ⚽ Maillots Pro ?
          </button>
          <button
            onClick={() => handleQuickQuestion("Comment se passe la livraison des articles ?")}
            className="px-3 py-1 rounded-full bg-white border border-stone-200 text-stone-700 font-semibold hover:border-gold hover:text-ink whitespace-nowrap transition-all shadow-2xs"
          >
            🚚 Modalités de livraison ?
          </button>
          <button
            onClick={() => handleQuickQuestion("Puis-je commander directement sur WhatsApp avec le numéro +228 90795416 ?")}
            className="px-3 py-1 rounded-full bg-white border border-stone-200 text-stone-700 font-semibold hover:border-gold hover:text-ink whitespace-nowrap transition-all shadow-2xs"
          >
            📲 Commander sur WhatsApp ?
          </button>
        </div>

        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-paper">
          {chatMessages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 max-w-[85%] ${
                msg.sender === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 font-bold text-xs ${
                  msg.sender === 'user'
                    ? 'bg-ink text-gold border border-gold/40'
                    : 'bg-gold text-ink font-bold'
                }`}
              >
                {msg.sender === 'user' ? (
                  <UserIcon className="w-4 h-4 text-gold" />
                ) : (
                  <Bot className="w-4 h-4 text-ink" />
                )}
              </div>

              <div
                className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-xs ${
                  msg.sender === 'user'
                    ? 'bg-ink text-gold border border-gold/30 rounded-tr-none font-medium'
                    : 'bg-white border border-stone-200 text-stone-800 rounded-tl-none font-light'
                }`}
              >
                <div className="whitespace-pre-line">{msg.text}</div>
                <div
                  className={`text-[9px] mt-2 font-semibold ${
                    msg.sender === 'user' ? 'text-gold/70 text-right' : 'text-stone-400'
                  }`}
                >
                  {new Date(msg.timestamp).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex gap-3 mr-auto max-w-[80%] items-center text-xs text-stone-500">
              <div className="w-8 h-8 rounded-full bg-ink text-gold flex items-center justify-center font-bold">
                <Bot className="w-4 h-4 text-gold animate-bounce" />
              </div>
              <div className="p-3 bg-white rounded-2xl border border-stone-200 italic font-serif-title">
                L'Assistant IA prépare votre réponse sportive...
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Form */}
        <form onSubmit={handleSend} className="p-3 sm:p-4 bg-white border-t border-stone-200 flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Posez votre question à l'assistant sportif (maillots, crampons, livraison...)..."
            className="flex-1 px-4 py-3 rounded-2xl border border-stone-200 focus:border-gold text-xs sm:text-sm outline-none transition-all"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="p-3 rounded-2xl bg-ink hover:bg-stone-900 disabled:opacity-50 text-gold font-bold transition-all shadow-md shrink-0 border border-gold/40"
          >
            <Send className="w-5 h-5 text-gold" />
          </button>
        </form>

      </div>
    </div>
  );
};
