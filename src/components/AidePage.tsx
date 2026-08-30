import React, { useState } from 'react';
import { HelpCircle, PhoneCall, Mail, Truck, MessageCircle, Send, CheckCircle2, MapPin, ShieldCheck, HelpCircle as QuestionIcon } from 'lucide-react';
import { CONTACT_EMAILS, WHATSAPP_NUMBERS, INITIAL_DELIVERY_ZONES } from '../data/initialData';

export const AidePage: React.FC = () => {
  const [formSent, setFormSent] = useState(false);
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [message, setMessage] = useState('');

  const handleSendHelpForm = (e: React.FormEvent) => {
    e.preventDefault();
    setFormSent(true);
  };

  const openWhatsApp = (rawNum: string) => {
    const text = encodeURIComponent("Bonjour DONALDSON SHOP ! J'ai une question concernant un article ou les frais de livraison.");
    window.open(`https://wa.me/${rawNum}?text=${text}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-12 pb-16">
      
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-50 text-ink border border-gold/40 font-extrabold text-xs uppercase tracking-widest">
          <HelpCircle className="w-4 h-4 text-gold-dark" />
          Centre d'Aide & Support Client
        </div>
        <h1 className="text-3xl sm:text-4xl font-serif-title font-bold text-ink tracking-tight">
          Comment pouvons-nous vous aider ?
        </h1>
        <p className="text-xs sm:text-sm text-stone-600 leading-relaxed font-light">
          Retrouvez nos contacts officiels, nos numéros WhatsApp direct et notre formulaire de support client.
        </p>
      </div>

      {/* Official Contacts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* WhatsApp Direct */}
        <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs hover:shadow-lg transition-all space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-gold-dark border border-gold/30 flex items-center justify-center">
            <MessageCircle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-serif-title font-bold text-ink text-base">WhatsApp Officiel</h3>
            <p className="text-xs text-stone-500 mt-0.5 font-light">Discutez en direct avec nos conseillers sportifs pour tout devis ou commande.</p>
          </div>

          <div className="space-y-2 pt-2">
            {WHATSAPP_NUMBERS.map((num, i) => (
              <button
                key={num.raw}
                onClick={() => openWhatsApp(num.raw)}
                className="w-full p-2.5 rounded-xl bg-stone-50 hover:bg-stone-100 text-stone-900 font-bold text-xs flex items-center justify-between border border-stone-200 transition-all"
              >
                <span>Ligne {i + 1} : {num.display}</span>
                <PhoneCall className="w-3.5 h-3.5 text-gold-dark" />
              </button>
            ))}
          </div>
        </div>

        {/* Official Email Contacts */}
        <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs hover:shadow-lg transition-all space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-gold-dark border border-gold/30 flex items-center justify-center">
            <Mail className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-serif-title font-bold text-ink text-base">Emails du Support</h3>
            <p className="text-xs text-stone-500 mt-0.5 font-light">Écrivez-nous à nos adresses de contact et administration.</p>
          </div>

          <div className="space-y-3 pt-2 text-xs">
            <div className="p-3 rounded-xl bg-stone-50 border border-stone-200">
              <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">Email Administrateur 1 (Yahoo) :</span>
              <a href={`mailto:${CONTACT_EMAILS.yahoo}`} className="font-bold text-ink hover:underline text-sm">
                {CONTACT_EMAILS.yahoo}
              </a>
            </div>

            <div className="p-3 rounded-xl bg-stone-50 border border-stone-200">
              <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">Email Administrateur 2 (Gmail) :</span>
              <a href={`mailto:${CONTACT_EMAILS.admin}`} className="font-bold text-ink hover:underline text-sm">
                {CONTACT_EMAILS.admin}
              </a>
            </div>
          </div>
        </div>

        {/* Contact direct vendeur */}
        <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs hover:shadow-lg transition-all space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-gold-dark border border-gold/30 flex items-center justify-center">
            <Truck className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-serif-title font-bold text-ink text-base">Modalités de Livraison</h3>
            <p className="text-xs text-stone-500 mt-0.5 font-light">Les informations et conditions de livraison sont communiquées directement par le vendeur.</p>
          </div>

          <div className="p-3.5 rounded-xl bg-amber-50/80 border border-gold/40 text-xs text-stone-900 leading-relaxed font-light">
            <strong className="block mb-1 font-bold text-ink">Information importante :</strong>
            Les détails et frais de livraison sont convenus directement entre vous et le vendeur lors du traitement de votre commande.
          </div>
        </div>

      </div>

      {/* Help Contact Form */}
      <div className="bg-ink text-white rounded-3xl p-8 sm:p-10 shadow-xl border border-gold/30">
        <div className="max-w-xl mx-auto space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-serif-title font-bold text-white">Envoyer un Message au Support</h2>
            <p className="text-xs text-stone-300 font-light">
              Posez une question directement à l'équipe d'administration DONALDSON SHOP.
            </p>
          </div>

          {formSent ? (
            <div className="bg-stone-900 border border-gold/40 p-6 rounded-2xl text-center space-y-2">
              <CheckCircle2 className="w-10 h-10 text-gold mx-auto" />
              <h3 className="font-serif-title font-bold text-base text-gold">Message envoyé avec succès !</h3>
              <p className="text-xs text-stone-200 font-light">
                Merci <strong>{clientName}</strong>. Notre équipe va vous répondre sur <strong>{clientEmail}</strong> ou par téléphone au <strong>{clientPhone}</strong>.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSendHelpForm} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-300 font-bold mb-1">Votre Nom complet</label>
                  <input
                    type="text"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    placeholder="Emanuel Koffi"
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl bg-stone-900 border border-stone-800 text-white focus:border-gold outline-none"
                  />
                </div>
                <div>
                  <label className="block text-stone-300 font-bold mb-1">Numéro Téléphone</label>
                  <input
                    type="tel"
                    value={clientPhone}
                    onChange={(e) => setClientPhone(e.target.value)}
                    placeholder="+228 90 00 00 00"
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl bg-stone-900 border border-stone-800 text-white focus:border-gold outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-stone-300 font-bold mb-1">Adresse Email</label>
                <input
                  type="email"
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                  placeholder="votre.email@exemple.com"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-stone-900 border border-stone-800 text-white focus:border-gold outline-none"
                />
              </div>

              <div>
                <label className="block text-stone-300 font-bold mb-1">Votre Message / Question</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Expliquez la question ou l'article qui vous intéresse..."
                  rows={3}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-stone-900 border border-stone-800 text-white focus:border-gold outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-gold hover:bg-amber-400 text-ink font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 border border-gold/50"
              >
                <Send className="w-4 h-4 text-ink" />
                Envoyer le Message au Support
              </button>
            </form>
          )}

        </div>
      </div>

    </div>
  );
};
