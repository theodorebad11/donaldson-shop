import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { formatFCFA, WHATSAPP_NUMBERS } from '../data/initialData';
import { 
  PackageCheck, 
  Clock, 
  Truck, 
  CheckCircle2, 
  AlertCircle, 
  ShoppingBag, 
  MapPin, 
  Search, 
  RotateCcw, 
  PhoneCall, 
  MessageSquare, 
  ShieldCheck, 
  Box, 
  Sparkles,
  ArrowRight,
  Trash2,
  X,
  AlertTriangle
} from 'lucide-react';

export const OrdersPage: React.FC = () => {
  const { orders, currentUser, setActivePage, deleteOrder, clearUserOrders, openWhatsAppOrderModal } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchedOrder, setSearchedOrder] = useState<any | null>(null);
  const [searchError, setSearchError] = useState(false);

  // Modals for deletion
  const [orderToDelete, setOrderToDelete] = useState<any | null>(null);
  const [showClearAllConfirm, setShowClearAllConfirm] = useState(false);

  // Auto-search if queryParam in localStorage or URL or initial state
  useEffect(() => {
    const savedSearch = localStorage.getItem('donaldson_track_order_id');
    if (savedSearch) {
      setSearchQuery(savedSearch);
      handlePerformSearch(savedSearch);
      localStorage.removeItem('donaldson_track_order_id');
    }
  }, []);

  const handlePerformSearch = (query: string) => {
    const q = query.trim().toLowerCase().replace('#', '');
    if (!q) {
      setSearchedOrder(null);
      setSearchError(false);
      return;
    }

    const found = orders.find(o => 
      o.id.toLowerCase() === q || 
      o.id.toLowerCase().includes(q) ||
      o.clientPhone.replaceAll(' ', '').includes(q) ||
      o.clientEmail.toLowerCase() === q
    );

    if (found) {
      setSearchedOrder(found);
      setSearchError(false);
    } else {
      setSearchedOrder(null);
      setSearchError(true);
    }
  };

  const userOrders = orders.filter(o => {
    if (!currentUser) return false;
    return o.userId === currentUser.id || (currentUser.email && o.clientEmail.toLowerCase() === currentUser.email.toLowerCase());
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'En attente':
        return <span className="bg-amber-100 text-amber-900 border border-amber-300 font-bold text-xs px-3 py-1 rounded-full flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-amber-700 animate-spin" /> En attente de préparation</span>;
      case 'Confirmée':
        return <span className="bg-blue-100 text-blue-900 border border-blue-300 font-bold text-xs px-3 py-1 rounded-full flex items-center gap-1.5"><Box className="w-3.5 h-3.5 text-blue-700" /> Commande Confirmée & Emballée</span>;
      case 'En cours de livraison':
        return <span className="bg-indigo-100 text-indigo-950 border border-indigo-300 font-bold text-xs px-3 py-1 rounded-full flex items-center gap-1.5"><Truck className="w-3.5 h-3.5 text-indigo-800 animate-bounce" /> Expédiée / En cours de livraison</span>;
      case 'Livrée':
        return <span className="bg-emerald-100 text-emerald-900 border border-emerald-300 font-bold text-xs px-3 py-1 rounded-full flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" /> Livrée avec succès</span>;
      default:
        return <span className="bg-rose-100 text-rose-900 border border-rose-300 font-bold text-xs px-3 py-1 rounded-full flex items-center gap-1.5"><AlertCircle className="w-3.5 h-3.5 text-rose-700" /> Annulée</span>;
    }
  };

  const openWhatsAppSupportForOrder = (orderId: string, status: string) => {
    const text = `Bonjour DONALDSON SHOP ! Je vous contacte pour le suivi de ma commande #${orderId} (Statut : ${status}). Pouvez-vous me donner des informations sur l'heure d'arrivée de mon livreur ? Merci !`;
    openWhatsAppOrderModal({
      message: text,
      title: `Suivi Commande #${orderId}`,
      subtitle: 'Sélectionnez une ligne de support WhatsApp pour contacter notre service client :'
    });
  };

  const confirmDeleteSingleOrder = () => {
    if (orderToDelete) {
      deleteOrder(orderToDelete.id);
      if (searchedOrder?.id === orderToDelete.id) {
        setSearchedOrder(null);
        setSearchQuery('');
      }
      setOrderToDelete(null);
    }
  };

  const confirmClearAllHistory = async () => {
    await clearUserOrders();
    setSearchedOrder(null);
    setSearchQuery('');
    setShowClearAllConfirm(false);
  };

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8 pb-16">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-stone-200 pb-6">
        <div>
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-gold-dark block">
            Espace Client DONALDSON SHOP
          </span>
          <h1 className="text-2xl sm:text-3xl font-serif-title font-bold text-ink flex items-center gap-3 mt-0.5">
            <PackageCheck className="w-8 h-8 text-gold-dark" />
            Suivi de Commande & Historique
          </h1>
          <p className="text-xs text-stone-500 mt-1 font-light">
            Entrez votre numéro de commande pour vérifier le statut en temps réel ou gérez votre historique.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {(userOrders.length > 0 || searchedOrder) && (
            <button
              onClick={() => setShowClearAllConfirm(true)}
              className="px-4 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer active:scale-95"
              title="Supprimer définitivement toutes les entrées de commandes et de suivis"
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-600" />
              <span>Effacer tout l'historique</span>
            </button>
          )}

          {!currentUser && (
            <button
              onClick={() => setActivePage('login')}
              className="px-4 py-2 rounded-xl bg-ink text-gold border border-gold/40 text-xs font-bold hover:bg-stone-900 transition-all shadow-xs cursor-pointer"
            >
              Se Connecter à mon Compte
            </button>
          )}
        </div>
      </div>

      {/* SEARCH ORDER MODULE CARD */}
      <div className="bg-gradient-to-br from-ink via-stone-900 to-stone-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-gold/40 relative overflow-hidden space-y-4">
        <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-gold/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex items-center gap-2.5 text-gold text-xs font-extrabold uppercase tracking-wider">
          <Search className="w-4 h-4 text-gold" />
          <span>Module de Recherche & Suivi Direct</span>
        </div>

        <div className="max-w-2xl space-y-2">
          <h2 className="text-xl sm:text-2xl font-serif-title font-bold text-white">
            Suivre l'Avancement d'une Commande
          </h2>
          <p className="text-xs text-stone-300 font-light leading-relaxed">
            Saisissez votre <strong>numéro de commande</strong> (ex: <code className="text-amber-300 font-mono">17854...</code>) ou votre téléphone/email pour afficher l'étape exacte de votre colis.
          </p>
        </div>

        <form 
          onSubmit={(e) => {
            e.preventDefault();
            handlePerformSearch(searchQuery);
          }}
          className="flex flex-col sm:flex-row items-stretch gap-3 max-w-2xl pt-2"
        >
          <div className="relative flex-1">
            <Search className="w-5 h-5 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Ex: 17854091234, #1234 ou 90795416..."
              className="w-full pl-11 pr-10 py-3.5 rounded-2xl bg-white/10 border border-stone-700 text-white placeholder-stone-400 text-sm font-semibold outline-none focus:border-gold focus:ring-2 focus:ring-gold/30 transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => { setSearchQuery(''); setSearchedOrder(null); setSearchError(false); }}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-white/20 text-stone-300 transition-all cursor-pointer"
                title="Effacer la recherche"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <button
            type="submit"
            className="px-6 py-3.5 rounded-2xl bg-gold hover:bg-amber-300 text-ink font-extrabold text-xs transition-all shadow-lg flex items-center justify-center gap-2 shrink-0 cursor-pointer"
          >
            <span>Vérifier le Statut</span>
            <ArrowRight className="w-4 h-4 text-ink" />
          </button>
        </form>

        {searchError && (
          <div className="p-4 rounded-2xl bg-rose-900/60 border border-rose-500/50 text-rose-100 text-xs font-medium flex items-center gap-3 animate-fadeIn max-w-2xl">
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
            <span>
              Aucune commande trouvée correspondant à <strong>"{searchQuery}"</strong>. Vérifiez la référence reçue ou réessayez.
            </span>
          </div>
        )}
      </div>

      {/* SEARCH RESULT DISPLAY IF ACTIVE */}
      {searchedOrder && (
        <div className="bg-amber-50/50 rounded-3xl border-2 border-gold/60 p-6 sm:p-8 shadow-xl space-y-6 animate-scaleUp">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-gold/30 pb-4">
            <div className="flex items-center gap-3">
              <span className="w-10 h-10 rounded-2xl bg-gold text-ink font-black flex items-center justify-center shadow-md">
                <PackageCheck className="w-6 h-6" />
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-serif-title font-extrabold text-ink">
                    Résultat du Suivi : Commande #{searchedOrder.id}
                  </h3>
                </div>
                <p className="text-xs text-stone-500 font-light">
                  Enregistrée le {new Date(searchedOrder.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {getStatusBadge(searchedOrder.deliveryStatus)}
              <button
                onClick={() => setOrderToDelete(searchedOrder)}
                className="p-2 rounded-xl bg-rose-100 hover:bg-rose-200 text-rose-700 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                title="Supprimer cette commande de l'historique"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                <span className="hidden sm:inline">Supprimer</span>
              </button>
              <button
                onClick={() => { setSearchedOrder(null); setSearchQuery(''); }}
                className="p-2 rounded-xl bg-stone-200 hover:bg-stone-300 text-stone-700 text-xs font-bold cursor-pointer"
                title="Fermer ce suivi"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Interactive Stepper */}
          <div className="bg-white p-6 rounded-2xl border border-gold/40 shadow-xs space-y-3">
            <h4 className="text-xs font-extrabold text-stone-800 uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-gold-dark" />
              Étape Actuelle de Livraison :
            </h4>

            <div className="relative flex items-center justify-between max-w-2xl mx-auto px-4 pt-4 pb-2">
              <div className="absolute left-8 right-8 top-1/2 -translate-y-1/2 h-1.5 bg-stone-200 -z-0 rounded-full">
                <div 
                  className="h-full bg-gold transition-all duration-700 rounded-full"
                  style={{
                    width: searchedOrder.deliveryStatus === 'Livrée' ? '100%' :
                           searchedOrder.deliveryStatus === 'En cours de livraison' ? '66%' :
                           searchedOrder.deliveryStatus === 'Confirmée' ? '33%' : '0%'
                  }}
                />
              </div>

              {/* Step 1 */}
              <div className="relative z-10 flex flex-col items-center gap-1.5 bg-white px-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black shadow-xs transition-transform ${
                  searchedOrder.deliveryStatus !== 'Annulée' ? 'bg-gold text-ink scale-110' : 'bg-stone-200 text-stone-500'
                }`}>
                  1
                </div>
                <span className="text-[11px] font-bold text-stone-800">Reçue</span>
                <span className="text-[9px] text-stone-400 font-light">En attente</span>
              </div>

              {/* Step 2 */}
              <div className="relative z-10 flex flex-col items-center gap-1.5 bg-white px-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black shadow-xs transition-transform ${
                  ['Confirmée', 'En cours de livraison', 'Livrée'].includes(searchedOrder.deliveryStatus)
                    ? 'bg-gold text-ink scale-110' : 'bg-stone-200 text-stone-500'
                }`}>
                  2
                </div>
                <span className="text-[11px] font-bold text-stone-800">Préparation</span>
                <span className="text-[9px] text-stone-400 font-light">Emballée</span>
              </div>

              {/* Step 3 */}
              <div className="relative z-10 flex flex-col items-center gap-1.5 bg-white px-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black shadow-xs transition-transform ${
                  ['En cours de livraison', 'Livrée'].includes(searchedOrder.deliveryStatus)
                    ? 'bg-amber-600 text-white scale-110' : 'bg-stone-200 text-stone-500'
                }`}>
                  3
                </div>
                <span className="text-[11px] font-bold text-stone-800">Expédiée</span>
                <span className="text-[9px] text-stone-400 font-light">En cours</span>
              </div>

              {/* Step 4 */}
              <div className="relative z-10 flex flex-col items-center gap-1.5 bg-white px-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black shadow-xs transition-transform ${
                  searchedOrder.deliveryStatus === 'Livrée'
                    ? 'bg-emerald-600 text-white scale-110' : 'bg-stone-200 text-stone-500'
                }`}>
                  4
                </div>
                <span className="text-[11px] font-bold text-stone-800">Livrée</span>
                <span className="text-[9px] text-stone-400 font-light">Terminée</span>
              </div>
            </div>
          </div>

          {/* Details & WhatsApp direct help */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-5 rounded-2xl border border-stone-200 space-y-3">
              <h4 className="text-xs font-extrabold text-stone-800 uppercase tracking-wider">Articles de la commande :</h4>
              <div className="space-y-2">
                {searchedOrder.items.map((item: any, idx: number) => (
                  <div key={idx} className="flex items-center gap-3 bg-stone-50 p-2.5 rounded-xl border border-stone-200">
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

            <div className="bg-white p-5 rounded-2xl border border-stone-200 space-y-3 text-xs">
              <h4 className="font-extrabold text-ink uppercase tracking-wider flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-gold-dark" />
                Informations du destinataire :
              </h4>
              <p className="text-stone-800 font-semibold">{searchedOrder.clientName}</p>
              <p className="text-stone-600">📞 {searchedOrder.clientPhone}</p>
              <p className="text-stone-600">📍 {searchedOrder.deliveryAddress || 'Retrait en boutique'}, {searchedOrder.deliveryCity || 'Lomé'}</p>

              <div className="pt-3 border-t border-stone-200 flex justify-between font-serif-title font-extrabold text-sm text-ink">
                <span>Total de la commande :</span>
                <span className="text-gold-dark text-base">{formatFCFA(searchedOrder.totalFCFA)}</span>
              </div>

              <button
                onClick={() => openWhatsAppSupportForOrder(searchedOrder.id, searchedOrder.deliveryStatus)}
                className="w-full mt-2 py-3 px-4 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white font-extrabold text-xs transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                <MessageSquare className="w-4 h-4 fill-current" />
                Discuter de cette commande sur WhatsApp
              </button>
            </div>
          </div>
        </div>
      )}

      {/* USER ORDERS HISTORY LIST */}
      <div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
          <h2 className="text-lg font-serif-title font-bold text-ink flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-gold-dark" />
            {currentUser ? "Historique de vos Commandes" : "Dernières Commandes"}
          </h2>

          {userOrders.length > 0 && (
            <button
              onClick={() => setShowClearAllConfirm(true)}
              className="text-xs font-bold text-rose-600 hover:text-rose-800 flex items-center gap-1 py-1 px-3 rounded-lg bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-all cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-600" />
              <span>Vider tout mon historique</span>
            </button>
          )}
        </div>

        {userOrders.length === 0 ? (
          <div className="bg-white rounded-3xl p-10 text-center border border-stone-200 max-w-md mx-auto space-y-3 shadow-xs">
            <ShoppingBag className="w-12 h-12 text-stone-300 mx-auto" />
            <h3 className="font-serif-title font-bold text-ink">Aucune commande dans l'historique</h3>
            <p className="text-xs text-stone-500 font-light">
              {currentUser 
                ? "Vous n'avez actuellement aucune commande enregistrée dans votre compte."
                : "Connectez-vous à votre compte ou utilisez la barre de recherche ci-dessus pour vérifier une commande."}
            </p>
            <button
              onClick={() => setActivePage('shop')}
              className="px-6 py-2.5 rounded-xl bg-ink text-gold border border-gold/40 font-bold text-xs hover:bg-stone-900 transition-all shadow-md cursor-pointer"
            >
              Découvrir nos Articles Sportifs
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {userOrders.map((order, index) => (
              <div
                key={`${order.id}_${index}`}
                className="bg-white rounded-3xl border border-stone-200 p-6 shadow-xs space-y-4 hover:border-gold/50 transition-all relative"
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-stone-100 pb-4">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-serif-title font-black text-ink bg-amber-50 border border-gold/30 px-2.5 py-1 rounded-md">
                      #{order.id}
                    </span>
                    <span className="text-xs text-stone-400 font-light">
                      Passée le {new Date(order.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {getStatusBadge(order.deliveryStatus)}
                    <button
                      onClick={() => setOrderToDelete(order)}
                      className="p-1.5 rounded-lg bg-stone-100 hover:bg-rose-100 text-stone-500 hover:text-rose-700 transition-all cursor-pointer"
                      title="Supprimer cette commande de l'historique"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Visual Order Delivery Progress Stepper */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-stone-200 space-y-2">
                  <p className="text-[11px] font-bold text-stone-600 uppercase tracking-wider mb-2">
                    Suivi de votre livraison :
                  </p>
                  <div className="relative flex items-center justify-between max-w-xl mx-auto px-2">
                    {/* Progress Line */}
                    <div className="absolute left-6 right-6 top-1/2 -translate-y-1/2 h-1 bg-stone-200 -z-0">
                      <div 
                        className="h-full bg-gold transition-all duration-500"
                        style={{
                          width: order.deliveryStatus === 'Livrée' ? '100%' :
                                 order.deliveryStatus === 'En cours de livraison' ? '66%' :
                                 order.deliveryStatus === 'Confirmée' ? '33%' : '0%'
                        }}
                      />
                    </div>

                    {/* Step 1 */}
                    <div className="relative z-10 flex flex-col items-center gap-1 bg-slate-50 px-1">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                        order.deliveryStatus !== 'Annulée' ? 'bg-gold text-ink font-black shadow-xs' : 'bg-stone-200 text-stone-500'
                      }`}>
                        1
                      </div>
                      <span className="text-[10px] font-bold text-stone-700">Reçue</span>
                    </div>

                    {/* Step 2 */}
                    <div className="relative z-10 flex flex-col items-center gap-1 bg-slate-50 px-1">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                        ['Confirmée', 'En cours de livraison', 'Livrée'].includes(order.deliveryStatus)
                          ? 'bg-gold text-ink font-black shadow-xs' : 'bg-stone-200 text-stone-500'
                      }`}>
                        2
                      </div>
                      <span className="text-[10px] font-bold text-stone-700">Confirmée</span>
                    </div>

                    {/* Step 3 */}
                    <div className="relative z-10 flex flex-col items-center gap-1 bg-slate-50 px-1">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                        ['En cours de livraison', 'Livrée'].includes(order.deliveryStatus)
                          ? 'bg-amber-600 text-white font-black shadow-xs' : 'bg-stone-200 text-stone-500'
                      }`}>
                        3
                      </div>
                      <span className="text-[10px] font-bold text-stone-700">En cours</span>
                    </div>

                    {/* Step 4 */}
                    <div className="relative z-10 flex flex-col items-center gap-1 bg-slate-50 px-1">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                        order.deliveryStatus === 'Livrée'
                          ? 'bg-emerald-600 text-white font-black shadow-xs' : 'bg-stone-200 text-stone-500'
                      }`}>
                        4
                      </div>
                      <span className="text-[10px] font-bold text-stone-700">Livrée</span>
                    </div>
                  </div>
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
                  <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200 space-y-2 text-xs flex flex-col justify-between">
                    <div>
                      <h4 className="font-bold text-ink flex items-center gap-1.5 uppercase tracking-wider">
                        <MapPin className="w-4 h-4 text-gold-dark" />
                        Adresse de Livraison :
                      </h4>
                      <p className="text-stone-700 font-semibold mt-1">{order.deliveryAddress || 'Retrait en magasin'}, {order.deliveryCity || 'Lomé'}</p>
                    </div>

                    <div className="pt-2 border-t border-stone-200 space-y-2">
                      <div className="flex justify-between font-serif-title font-bold text-sm text-ink">
                        <span>Total Articles :</span>
                        <span className="text-ink font-black">{formatFCFA(order.totalFCFA)}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openWhatsAppSupportForOrder(order.id, order.deliveryStatus)}
                          className="flex-1 py-2 px-3 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-950 font-bold text-xs transition-all flex items-center justify-center gap-1.5 border border-amber-300 cursor-pointer"
                        >
                          <MessageSquare className="w-3.5 h-3.5 text-amber-800" />
                          Suivi WhatsApp Direct
                        </button>
                        <button
                          onClick={() => setOrderToDelete(order)}
                          className="py-2 px-3 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs transition-all border border-rose-200 flex items-center gap-1 cursor-pointer"
                          title="Supprimer"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                          <span>Supprimer</span>
                        </button>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* CONFIRM SINGLE ORDER DELETION MODAL */}
      {orderToDelete && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-5 border border-stone-200 shadow-2xl animate-scaleUp">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="w-10 h-10 rounded-2xl bg-rose-100 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-6 h-6 text-rose-600" />
              </div>
              <div>
                <h3 className="font-serif-title font-bold text-lg text-stone-900">
                  Supprimer la commande #{orderToDelete.id} ?
                </h3>
                <p className="text-xs text-stone-500 font-light">
                  Confirmation de suppression individuelle
                </p>
              </div>
            </div>

            <p className="text-xs text-stone-600 leading-relaxed bg-stone-50 p-3.5 rounded-2xl border border-stone-200">
              Êtes-vous sûr de vouloir retirer la commande <strong className="text-stone-900">#{orderToDelete.id}</strong> ({formatFCFA(orderToDelete.totalFCFA)}) de votre historique ? Cette action retirera cette fiche de votre espace de suivi.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setOrderToDelete(null)}
                className="px-4 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs transition-all cursor-pointer"
              >
                Annuler
              </button>
              <button
                onClick={confirmDeleteSingleOrder}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>Supprimer Définitivement</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRM CLEAR ALL HISTORY MODAL */}
      {showClearAllConfirm && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-5 border border-stone-200 shadow-2xl animate-scaleUp">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="w-12 h-12 rounded-2xl bg-rose-100 flex items-center justify-center shrink-0">
                <Trash2 className="w-7 h-7 text-rose-600" />
              </div>
              <div>
                <h3 className="font-serif-title font-bold text-lg text-stone-900">
                  Vider tout votre historique ?
                </h3>
                <p className="text-xs text-stone-500 font-light">
                  Effacement complet des suivis et commandes
                </p>
              </div>
            </div>

            <p className="text-xs text-stone-600 leading-relaxed bg-rose-50 p-4 rounded-2xl border border-rose-200 text-rose-950 font-medium">
              ⚠️ Attention : Cette action va effacer définitivement tout votre historique de suivi et l'ensemble de vos commandes affichées sur ce compte. Cette opération ne peut pas être annulée.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setShowClearAllConfirm(false)}
                className="px-4 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs transition-all cursor-pointer"
              >
                Annuler
              </button>
              <button
                onClick={confirmClearAllHistory}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>Tout Effacer</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};


