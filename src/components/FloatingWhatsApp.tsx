import React, { useState } from 'react';
import { MessageCircle, X, ExternalLink, PhoneCall } from 'lucide-react';
import { WHATSAPP_NUMBERS } from '../data/initialData';

export const FloatingWhatsApp: React.FC = () => {
  const [open, setOpen] = useState(false);

  const openWhatsApp = (rawNumber: string) => {
    const defaultMsg = encodeURIComponent("Bonjour DONALDSON SHOP ! Je vous contacte depuis le site web pour des informations sur vos articles de sport et le tarif de ma livraison.");
    window.open(`https://wa.me/${rawNumber}?text=${defaultMsg}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      
      {/* Popover Selection Box */}
      {open && (
        <div className="mb-3 w-80 bg-white rounded-2xl shadow-2xl border border-slate-200 p-4 animate-scaleUp">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold">
                <MessageCircle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-extrabold text-sm text-slate-900">WhatsApp DONALDSON SHOP</h4>
                <p className="text-[10px] text-emerald-600 font-semibold">En ligne • Réponse rapide</p>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="text-xs text-slate-600 mb-3 leading-relaxed">
            Choisissez l'un de nos numéros officiels WhatsApp pour discuter direct avec notre service client & devis de livraison :
          </p>

          <div className="space-y-2">
            {WHATSAPP_NUMBERS.map((num, idx) => (
              <button
                key={num.raw}
                onClick={() => openWhatsApp(num.raw)}
                className="w-full p-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 flex items-center justify-between transition-all group"
              >
                <div className="flex items-center gap-2.5">
                  <PhoneCall className="w-4 h-4 text-emerald-600 group-hover:scale-110 transition-transform" />
                  <div className="text-left">
                    <p className="font-bold text-xs">Ligne WhatsApp {idx + 1}</p>
                    <p className="text-xs font-black tracking-wide text-emerald-700">{num.display}</p>
                  </div>
                </div>
                <ExternalLink className="w-4 h-4 text-emerald-600 group-hover:translate-x-0.5 transition-transform" />
              </button>
            ))}
          </div>

          <div className="mt-3 pt-2 border-t border-slate-100 text-[10px] text-center text-slate-400">
            Support client disponible 7j/7 pour Lomé et tout le Togo.
          </div>
        </div>
      )}

      {/* Floating Button */}
      <button
        onClick={() => setOpen(!open)}
        className="w-14 h-14 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white shadow-xl flex items-center justify-center transition-all hover:scale-110 active:scale-95 group relative"
        title="Discuter sur WhatsApp"
      >
        <span className="absolute -top-1 -right-1 flex h-4 w-4">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-400"></span>
        </span>
        <MessageCircle className="w-7 h-7" />
      </button>

    </div>
  );
};
