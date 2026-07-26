import React from 'react';
import { useApp } from '../context/AppContext';
import { Megaphone, Calendar, Sparkles, ArrowRight, ShieldAlert } from 'lucide-react';

export const AnnoncesPage: React.FC = () => {
  const { announcements, setActivePage } = useApp();

  const activeAnnouncements = announcements.filter(a => a.active);

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8 pb-16">
      
      {/* Page Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-50 text-ink border border-gold/40 font-extrabold text-xs uppercase tracking-widest">
          <Megaphone className="w-4 h-4 text-gold-dark" />
          Annonces Officielles
        </div>
        <h1 className="text-3xl sm:text-4xl font-serif-title font-bold text-ink tracking-tight">
          Nouveautés & Événements DONALDSON <span className="text-gold italic font-editorial">SHOP</span>
        </h1>
        <p className="text-xs sm:text-sm text-stone-600 leading-relaxed font-light">
          Restez informé des nouveaux arrivages d'articles sportifs, des promotions exceptionnelles et des mises à jour de nos services de livraison.
        </p>
      </div>

      {/* Announcements List */}
      {activeAnnouncements.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-stone-200 max-w-md mx-auto space-y-3">
          <Megaphone className="w-12 h-12 text-stone-300 mx-auto" />
          <h3 className="font-serif-title font-bold text-ink">Aucune annonce publiée pour le moment</h3>
          <p className="text-xs text-stone-500 font-light">
            Revenez régulièrement pour découvrir nos dernières offres et arrivages d'articles de sport pro.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {activeAnnouncements.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
            >
              {item.imageUrl && (
                <div className="relative h-56 bg-stone-100 overflow-hidden">
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                  {item.badge && (
                    <span className="absolute top-4 left-4 bg-ink text-gold border border-gold/40 font-bold text-[10px] uppercase tracking-widest px-3 py-1 rounded-full shadow-md">
                      {item.badge}
                    </span>
                  )}
                </div>
              )}

              <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs text-stone-400 font-semibold">
                    <Calendar className="w-3.5 h-3.5 text-gold-dark" />
                    <span>Publié le {new Date(item.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                  </div>

                  <h3 className="text-xl font-serif-title font-bold text-ink leading-snug">
                    {item.title}
                  </h3>

                  <p className="text-xs text-stone-600 leading-relaxed pt-1 whitespace-pre-line font-light">
                    {item.content}
                  </p>
                </div>

                <div className="pt-4 border-t border-stone-100 flex items-center justify-between">
                  <button
                    onClick={() => setActivePage('shop')}
                    className="text-xs font-bold text-ink hover:text-stone-700 uppercase tracking-wider flex items-center gap-1.5 transition-colors"
                  >
                    <span>Voir le catalogue d'articles</span>
                    <ArrowRight className="w-4 h-4 text-gold-dark" />
                  </button>
                </div>

              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};
