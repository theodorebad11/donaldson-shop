import React from 'react';
import { useApp } from '../context/AppContext';
import { formatFCFA } from '../data/initialData';
import { PackageCheck, Clock, Truck, CheckCircle2, AlertCircle, ShoppingBag, MapPin } from 'lucide-react';

export const OrdersPage: React.FC = () => {
  const { orders, currentUser, setActivePage } = useApp();

  const userOrders = orders.filter(o => {
    if (!currentUser) return false;
    return o.userId === currentUser.id || o.clientEmail.toLowerCase() === currentUser.email.toLowerCase();
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'En attente':
        return <span className="bg-amber-100 text-amber-800 font-bold text-xs px-3 py-1 rounded-full flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> En attente de confirmation</span>;
      case 'Confirmée':
        return <span className="bg-blue-100 text-blue-800 font-bold text-xs px-3 py-1 rounded-full flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> Commande Confirmée</span>;
      case 'En cours de livraison':
        return <span className="bg-purple-100 text-purple-800 font-bold text-xs px-3 py-1 rounded-full flex items-center gap-1"><Truck className="w-3.5 h-3.5" /> En cours de livraison</span>;
      case 'Livrée':
        return <span className="bg-emerald-100 text-emerald-800 font-bold text-xs px-3 py-1 rounded-full flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> Livrée avec succès</span>;
      default:
        return <span className="bg-rose-100 text-rose-800 font-bold text-xs px-3 py-1 rounded-full flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" /> Annulée</span>;
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8 pb-16">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-serif-title font-bold text-ink flex items-center gap-3">
          <PackageCheck className="w-7 h-7 text-gold-dark" />
          Mes Commandes d'Articles
        </h1>
        <p className="text-xs text-stone-500 mt-1 font-light">
          Historique et état d'avancement de vos commandes DONALDSON SHOP.
        </p>
      </div>

      {userOrders.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-stone-200 max-w-md mx-auto space-y-3">
          <ShoppingBag className="w-12 h-12 text-stone-300 mx-auto" />
          <h3 className="font-serif-title font-bold text-ink">Aucune commande enregistrée</h3>
          <p className="text-xs text-stone-500 font-light">
            Vous n'avez pas encore passé de commande avec ce compte.
          </p>
          <button
            onClick={() => setActivePage('shop')}
            className="px-6 py-2.5 rounded-xl bg-ink text-gold border border-gold/40 font-bold text-xs hover:bg-stone-900 transition-all shadow-md"
          >
            Découvrir nos Articles Sportifs
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {userOrders.map((order) => (
            <div
              key={order.id}
              className="bg-white rounded-3xl border border-stone-200 p-6 shadow-xs space-y-4"
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-stone-100 pb-4">
                <div>
                  <span className="text-xs font-serif-title font-black text-ink bg-amber-50 border border-gold/30 px-2.5 py-1 rounded-md">
                    #{order.id}
                  </span>
                  <span className="text-xs text-stone-400 ml-3 font-light">
                    Passée le {new Date(order.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </span>
                </div>
                {getStatusBadge(order.deliveryStatus)}
              </div>

              {/* Items List */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-stone-700 uppercase tracking-wider">Articles Commandés :</h4>
                  <div className="space-y-2">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-3 bg-stone-50 p-2.5 rounded-xl border border-stone-100">
                        <img
                          src={item.imageUrl}
                          alt={item.productName}
                          referrerPolicy="no-referrer"
                          className="w-12 h-12 rounded-lg object-cover bg-stone-200 shrink-0"
                        />
                        <div className="flex-1 min-w-0 text-xs">
                          <p className="font-serif-title font-bold text-ink truncate">{item.productName}</p>
                          <p className="text-[11px] text-stone-500 font-light">
                            Taille: {item.selectedSize || 'N/A'} • Quantité: {item.quantity}
                          </p>
                        </div>
                        <span className="font-serif-title font-extrabold text-xs text-ink shrink-0">
                          {formatFCFA(item.priceFCFA * item.quantity)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Delivery details */}
                <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200 space-y-2 text-xs">
                  <h4 className="font-bold text-ink flex items-center gap-1.5 uppercase tracking-wider">
                    <MapPin className="w-4 h-4 text-gold-dark" />
                    Adresse de Livraison :
                  </h4>
                  <p className="text-stone-700 font-semibold">{order.deliveryAddress}, {order.deliveryCity}</p>
                  
                  <div className="pt-2 border-t border-stone-200 space-y-1">
                    <p className="text-[11px] text-stone-800 font-light bg-amber-50/80 p-2 rounded-xl border border-gold/30">
                      🚚 Frais de livraison : À fixer sur mesure avec l'équipe lors de la confirmation d'envoi.
                    </p>
                  </div>

                  <div className="pt-2 flex justify-between font-serif-title font-bold text-sm text-ink">
                    <span>Total Articles :</span>
                    <span className="text-ink font-black">{formatFCFA(order.totalFCFA)}</span>
                  </div>
                </div>

              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};
