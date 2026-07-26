import React from 'react';
import { useApp } from '../context/AppContext';
import { ShieldCheck, Mail, Phone, MapPin, Truck, HeartHandshake } from 'lucide-react';
import { CONTACT_EMAILS, WHATSAPP_NUMBERS } from '../data/initialData';

export const Footer: React.FC = () => {
  const { setActivePage } = useApp();

  return (
    <footer className="bg-ink text-stone-300 border-t border-gold/30 pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          
          {/* Brand Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gold text-ink font-serif-title flex items-center justify-center font-bold text-xl border border-gold/40">
                D
              </div>
              <span className="text-xl font-serif-title font-bold text-white tracking-wider">
                DONALDSON <span className="text-gold italic font-editorial">SHOP</span>
              </span>
            </div>
            <p className="text-xs text-stone-400 leading-relaxed font-light">
              Votre référence de vente d'articles de sport professionnels et ultra élégants. Maillots, chaussures, crampons, ballons et équipements pro.
            </p>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-stone-900 text-xs text-gold font-semibold border border-gold/30">
              <Truck className="w-4 h-4 text-gold" />
              Service & Vente Directe
            </div>
          </div>

          {/* Navigation Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-gold uppercase tracking-widest font-serif-title">Navigation</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => setActivePage('shop')} className="hover:text-gold transition-colors">
                  Tous les Articles Sportifs
                </button>
              </li>
              <li>
                <button onClick={() => setActivePage('annonces')} className="hover:text-gold transition-colors">
                  Annonces & Nouveautés
                </button>
              </li>
              <li>
                <button onClick={() => setActivePage('aide')} className="hover:text-gold transition-colors">
                  Aide, FAQ & Contact
                </button>
              </li>
              <li>
                <button onClick={() => setActivePage('cart')} className="hover:text-gold transition-colors">
                  Mon Panier
                </button>
              </li>
            </ul>
          </div>

          {/* Delivery Policy Note */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-gold uppercase tracking-widest font-serif-title flex items-center gap-2">
              <HeartHandshake className="w-4 h-4 text-gold" />
              Service Client
            </h4>
            <p className="text-xs text-stone-300 leading-relaxed bg-stone-900 p-3.5 rounded-2xl border border-stone-800">
              <strong className="text-white block mb-1 font-serif-title">Contact Direct :</strong>
              Toutes les informations sur les commandes et les livraisons sont directement fournies par le vendeur par téléphone ou sur WhatsApp.
            </p>
          </div>

          {/* Direct Contacts */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-gold uppercase tracking-widest font-serif-title">Contacts Officiels</h4>
            <ul className="space-y-2.5 text-xs text-stone-300">
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-gold shrink-0 mt-0.5" />
                <span>Boutique Lomé, Togo (Afrique de l'Ouest)</span>
              </li>
              <li className="flex items-start gap-2">
                <Phone className="w-4 h-4 text-gold shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <span className="block font-semibold text-white">{WHATSAPP_NUMBERS[0].display}</span>
                  <span className="block">{WHATSAPP_NUMBERS[1].display}</span>
                  <span className="block">{WHATSAPP_NUMBERS[2].display}</span>
                </div>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-gold shrink-0" />
                <span className="text-gold">{CONTACT_EMAILS.yahoo}</span>
              </li>
              <li className="flex items-center gap-2 text-stone-400">
                <Mail className="w-4 h-4 text-stone-500 shrink-0" />
                <span>Admin : {CONTACT_EMAILS.admin}</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom bar */}
        <div className="pt-6 border-t border-stone-800 flex flex-col sm:flex-row items-center justify-between text-xs text-stone-500 gap-4">
          <p>© 2026 DONALDSON SHOP. Tous droits réservés.</p>
          <div className="flex items-center gap-4 text-stone-400">
            <span>Devise : <strong className="text-gold">FCFA (XOF)</strong></span>
            <span>•</span>
            <span className="flex items-center gap-1 text-gold">
              <ShieldCheck className="w-3.5 h-3.5" />
              100% Opérationnel & Sécurisé
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
