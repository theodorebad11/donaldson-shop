import React from 'react';
import { useApp } from '../context/AppContext';
import { X, Lock, LogIn, UserPlus, ShieldAlert, Sparkles } from 'lucide-react';

interface AuthPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message?: string;
}

export const AuthPromptModal: React.FC<AuthPromptModalProps> = ({
  isOpen,
  onClose,
  title = "Connexion ou Inscription Obligatoire",
  message = "Pour consulter les détails d'un article, l'ajouter au panier ou passer une commande sur DONALDSON SHOP, vous devez obligatoirement être connecté ou vous inscrire."
}) => {
  const { setActivePage } = useApp();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div 
        className="bg-white max-w-md w-full rounded-3xl border border-gold/40 shadow-2xl overflow-hidden relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-ink text-white p-6 relative border-b border-gold/30">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-stone-800 text-stone-300 hover:text-white hover:bg-stone-700 transition-all"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gold text-ink font-bold flex items-center justify-center shadow-md">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-gold block">DONALDSON SHOP</span>
              <h3 className="text-lg font-serif-title font-bold text-white leading-tight">{title}</h3>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6">
          <div className="p-4 rounded-2xl bg-amber-50/80 border border-gold/30 flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-gold-dark shrink-0 mt-0.5" />
            <p className="text-xs text-stone-800 leading-relaxed font-medium">
              {message}
            </p>
          </div>

          <p className="text-xs text-stone-600 text-center font-light">
            L'inscription est rapide et vous permet de gérer votre profil, suivre vos livraisons et accéder aux articles exclusifs.
          </p>

          {/* Action Buttons */}
          <div className="space-y-3 pt-2">
            <button
              onClick={() => {
                onClose();
                setActivePage('login');
              }}
              className="w-full py-3 px-4 rounded-xl bg-ink hover:bg-stone-900 text-gold font-bold text-xs border border-gold/40 transition-all flex items-center justify-center gap-2 shadow-md"
            >
              <LogIn className="w-4 h-4 text-gold" />
              Se Connecter à mon Compte
            </button>

            <button
              onClick={() => {
                onClose();
                setActivePage('register');
              }}
              className="w-full py-3 px-4 rounded-xl bg-gold hover:bg-amber-400 text-ink font-bold text-xs transition-all flex items-center justify-center gap-2 shadow-md"
            >
              <UserPlus className="w-4 h-4 text-ink" />
              Créer un Nouveau Compte (S'inscrire)
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-stone-50 px-6 py-3 border-t border-stone-100 text-center">
          <span className="text-[10px] text-stone-400 font-medium">
            DONALDSON SHOP — Équipements & Vêtements de Sport Pro
          </span>
        </div>
      </div>
    </div>
  );
};
