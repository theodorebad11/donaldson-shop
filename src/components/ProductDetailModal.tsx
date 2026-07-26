import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { formatFCFA, WHATSAPP_NUMBERS } from '../data/initialData';
import { X, ShoppingBag, PhoneCall, Truck, Check, Globe, AlertCircle, Store } from 'lucide-react';

export const ProductDetailModal: React.FC = () => {
  const { selectedProduct, setSelectedProduct, addToCart, createOrder, currentUser, setActivePage } = useApp();

  const [selectedSize, setSelectedSize] = useState<string>(selectedProduct?.sizes?.[0] || '');
  const [selectedColor, setSelectedColor] = useState<string>(selectedProduct?.colors?.[0] || '');
  const [quantity, setQuantity] = useState(1);
  const [addedAlert, setAddedAlert] = useState(false);

  // Direct Site Checkout Form Modal state
  const [showDirectCheckout, setShowDirectCheckout] = useState(false);
  const [clientName, setClientName] = useState(
    currentUser ? `${currentUser.lastName} ${currentUser.firstName}` : ''
  );
  const [clientPhone, setClientPhone] = useState(currentUser?.phone || '');
  const [clientEmail, setClientEmail] = useState(currentUser?.email || '');
  const [wantsDelivery, setWantsDelivery] = useState(true);
  const [deliveryCity, setDeliveryCity] = useState('Lomé');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [pickupConfirmed, setPickupConfirmed] = useState(false);
  const [deliveryNotes, setDeliveryNotes] = useState('');
  const [orderError, setOrderError] = useState('');
  const [orderSuccess, setOrderSuccess] = useState<any | null>(null);

  if (!selectedProduct) return null;

  const maxStock = selectedProduct.stock;
  const isOutOfStock = maxStock <= 0;

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    if (!currentUser) {
      setSelectedProduct(null);
      setActivePage('login');
      return;
    }
    addToCart(selectedProduct, Math.min(quantity, maxStock), selectedSize, selectedColor);
    setAddedAlert(true);
    setTimeout(() => setAddedAlert(false), 2000);
  };

  const handleWhatsAppOrder = () => {
    if (isOutOfStock) return;
    if (!currentUser) {
      setSelectedProduct(null);
      setActivePage('login');
      return;
    }
    const qty = Math.min(quantity, maxStock);
    const sizeText = selectedSize ? ` (Taille: ${selectedSize})` : '';
    const colorText = selectedColor ? ` (Couleur: ${selectedColor})` : '';
    const message = encodeURIComponent(
      `Bonjour DONALDSON SHOP ! Je souhaite commander en direct l'article :\n- ${selectedProduct.name}${sizeText}${colorText} x${qty} au prix de ${formatFCFA(selectedProduct.priceFCFA * qty)}.\n\nMerci de me communiquer la disponibilité et la livraison !`
    );
    window.open(`https://wa.me/${WHATSAPP_NUMBERS[0].raw}?text=${message}`, '_blank', 'noopener,noreferrer');
  };

  const handleOpenDirectCheckout = () => {
    if (isOutOfStock) return;
    if (!currentUser) {
      setSelectedProduct(null);
      setActivePage('login');
      return;
    }
    setOrderError('');
    setShowDirectCheckout(true);
  };

  const handleSubmitDirectOrder = (e: React.FormEvent) => {
    e.preventDefault();
    setOrderError('');

    if (!clientName.trim()) {
      setOrderError('Veuillez saisir votre Nom et Prénom.');
      return;
    }
    if (!clientPhone.trim()) {
      setOrderError('Veuillez saisir votre numéro de téléphone.');
      return;
    }
    if (!clientEmail.trim()) {
      setOrderError('Veuillez saisir votre adresse email.');
      return;
    }

    if (wantsDelivery) {
      if (!deliveryAddress.trim()) {
        setOrderError('Veuillez indiquer votre zone / quartier de livraison.');
        return;
      }
    } else {
      if (!pickupConfirmed) {
        setOrderError('Veuillez confirmer que vous viendrez récupérer l\'article en magasin.');
        return;
      }
    }

    const qty = Math.min(quantity, maxStock);
    const newOrder = createOrder({
      clientName: clientName.trim(),
      clientPhone: clientPhone.trim(),
      clientEmail: clientEmail.trim(),
      wantsDelivery,
      deliveryAddress: wantsDelivery ? deliveryAddress.trim() : undefined,
      deliveryCity: wantsDelivery ? deliveryCity : undefined,
      pickupConfirmed: !wantsDelivery ? pickupConfirmed : undefined,
      deliveryNotes: deliveryNotes.trim(),
      orderType: 'site_direct',
      items: [
        {
          productId: selectedProduct.id,
          productName: selectedProduct.name,
          priceFCFA: selectedProduct.priceFCFA,
          quantity: qty,
          imageUrl: selectedProduct.imageUrl,
          selectedSize: selectedSize || undefined
        }
      ]
    });

    setOrderSuccess(newOrder);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/70 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-stone-200 p-6 sm:p-8 relative">
        
        {/* Close button */}
        <button
          onClick={() => setSelectedProduct(null)}
          className="absolute top-5 right-5 p-2 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {!showDirectCheckout ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Image */}
            <div className="relative rounded-2xl overflow-hidden bg-stone-100 aspect-square">
              <img
                src={selectedProduct.imageUrl}
                alt={selectedProduct.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
              {selectedProduct.badge && (
                <span className="absolute top-4 left-4 bg-ink text-gold font-black text-xs px-3 py-1 rounded-full uppercase tracking-widest shadow-md border border-gold/40">
                  {selectedProduct.badge}
                </span>
              )}
              {isOutOfStock && (
                <div className="absolute inset-0 bg-ink/75 backdrop-blur-xs flex items-center justify-center">
                  <span className="bg-rose-600 text-white font-black text-xs px-4 py-2 rounded-xl uppercase tracking-widest shadow-lg">
                    Rupture de Stock
                  </span>
                </div>
              )}
            </div>

            {/* Details */}
            <div className="flex flex-col justify-between space-y-5">
              <div>
                <span className="text-xs font-extrabold text-gold-dark uppercase tracking-widest">
                  {selectedProduct.category}
                </span>

                <h2 className="text-2xl font-serif-title font-bold text-ink mt-1">
                  {selectedProduct.name}
                </h2>

                <div className="mt-3 flex items-baseline gap-3 flex-wrap">
                  <span className="text-2xl font-serif-title font-black text-ink">
                    {formatFCFA(selectedProduct.priceFCFA)}
                  </span>
                  {selectedProduct.originalPriceFCFA && selectedProduct.originalPriceFCFA > selectedProduct.priceFCFA && (
                    <span className="text-sm text-stone-400 line-through font-semibold">
                      {formatFCFA(selectedProduct.originalPriceFCFA)}
                    </span>
                  )}
                  <span className={`text-xs font-bold ml-auto ${isOutOfStock ? 'text-rose-600' : 'text-emerald-700'}`}>
                    {isOutOfStock ? 'Rupture de stock' : `Stock disponible : ${maxStock} un.`}
                  </span>
                </div>

                <p className="text-xs text-stone-600 leading-relaxed mt-4 font-light">
                  {selectedProduct.description}
                </p>

                {/* Sizes */}
                {selectedProduct.sizes && selectedProduct.sizes.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <label className="text-xs font-bold text-stone-700 block uppercase tracking-wider">
                      Tailles disponibles :
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {selectedProduct.sizes.map((s) => (
                        <button
                          key={s}
                          onClick={() => setSelectedSize(s)}
                          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                            selectedSize === s
                              ? 'bg-ink text-gold border-gold/40 shadow-xs'
                              : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                          }`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Quantity selector with stock constraint */}
                <div className="mt-4 flex items-center gap-3">
                  <span className="text-xs font-bold text-stone-700 uppercase tracking-wider">Quantité :</span>
                  <div className="flex items-center border border-stone-200 rounded-xl overflow-hidden bg-stone-50">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={isOutOfStock || quantity <= 1}
                      className="px-3 py-1 text-stone-600 font-bold hover:bg-stone-200 disabled:opacity-40"
                    >
                      -
                    </button>
                    <span className="px-4 py-1 text-xs font-extrabold text-ink">
                      {isOutOfStock ? 0 : quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(Math.min(maxStock, quantity + 1))}
                      disabled={isOutOfStock || quantity >= maxStock}
                      className="px-3 py-1 text-stone-600 font-bold hover:bg-stone-200 disabled:opacity-40"
                    >
                      +
                    </button>
                  </div>
                  {maxStock > 0 && quantity >= maxStock && (
                    <span className="text-[10px] font-bold text-amber-700">Max en stock !</span>
                  )}
                </div>
              </div>

              {/* Action buttons */}
              <div className="space-y-2 pt-2 border-t border-stone-100">
                {addedAlert && (
                  <div className="p-2.5 rounded-xl bg-amber-50 border border-gold/40 text-ink text-xs font-bold text-center flex items-center justify-center gap-2 animate-fadeIn">
                    <Check className="w-4 h-4 text-gold-dark" />
                    Article ajouté au panier !
                  </div>
                )}

                {isOutOfStock ? (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl text-center text-xs font-bold text-rose-800">
                    Cet article est actuellement en rupture de stock.
                  </div>
                ) : (
                  <>
                    <button
                      onClick={handleOpenDirectCheckout}
                      className="w-full py-3 px-4 rounded-xl bg-ink hover:bg-stone-900 text-gold border border-gold/40 font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2"
                    >
                      <Globe className="w-4 h-4 text-gold" />
                      Commander sur le Site ({formatFCFA(selectedProduct.priceFCFA * quantity)})
                    </button>

                    <button
                      onClick={handleWhatsAppOrder}
                      className="w-full py-2.5 px-4 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-300 font-bold text-xs transition-all flex items-center justify-center gap-2"
                    >
                      <PhoneCall className="w-4 h-4 text-emerald-700" />
                      Commander via WhatsApp
                    </button>

                    <button
                      onClick={handleAddToCart}
                      className="w-full py-2.5 px-4 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 border border-stone-300 font-bold text-xs transition-all flex items-center justify-center gap-2"
                    >
                      <ShoppingBag className="w-4 h-4 text-stone-700" />
                      Ajouter au Panier
                    </button>
                  </>
                )}
              </div>

            </div>

          </div>
        ) : orderSuccess ? (
          /* Order Success screen */
          <div className="py-6 px-2 text-center space-y-5 animate-fadeIn">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center border border-emerald-300">
              <Check className="w-10 h-10" />
            </div>

            <h3 className="text-2xl font-serif-title font-black text-ink">
              Commande #{orderSuccess.id} Enregistrée !
            </h3>

            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed max-w-md mx-auto">
              Merci <strong>{orderSuccess.clientName}</strong> ! Votre commande a été transmise avec succès à l'administration DONALDSON SHOP.
            </p>

            <div className="p-4 rounded-2xl bg-amber-50 border border-gold/40 text-left text-xs text-stone-900 space-y-2 max-w-md mx-auto">
              <span className="font-bold text-ink block">Résumé de la commande :</span>
              <ul className="list-disc pl-4 space-y-1 font-light text-stone-700">
                <li>Article : <strong>{selectedProduct.name}</strong> (x{quantity})</li>
                <li>Montant total : <strong>{formatFCFA(orderSuccess.totalFCFA)}</strong></li>
                <li>Téléphone : <strong>{orderSuccess.clientPhone}</strong></li>
                <li>Email : <strong>{orderSuccess.clientEmail}</strong></li>
                {orderSuccess.wantsDelivery ? (
                  <li>Mode : <strong>Livraison à {orderSuccess.deliveryAddress}, {orderSuccess.deliveryCity}</strong></li>
                ) : (
                  <li>Mode : <strong>Retrait confirmé sur place / en magasin</strong></li>
                )}
              </ul>
            </div>

            <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs text-emerald-900 font-semibold max-w-md mx-auto">
              🔔 Après confirmation par l'administrateur dans l'espace admin, vous recevrez une notification directe sur ce site.
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={() => { setSelectedProduct(null); setActivePage('orders'); }}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-ink text-gold border border-gold/40 font-bold text-xs hover:bg-stone-900 transition-all shadow-md"
              >
                Suivre dans Mon Compte
              </button>
              <button
                onClick={() => setSelectedProduct(null)}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-stone-100 text-stone-800 font-bold text-xs hover:bg-stone-200 transition-all border border-stone-200"
              >
                Fermer
              </button>
            </div>
          </div>
        ) : (
          /* Direct Order Form step */
          <div className="space-y-5 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <div>
                <h3 className="text-xl font-serif-title font-bold text-ink flex items-center gap-2">
                  <Globe className="w-5 h-5 text-gold-dark" />
                  Commander sur le Site Web
                </h3>
                <p className="text-xs text-stone-500 font-light mt-0.5">
                  Veuillez remplir vos coordonnées pour enregistrer votre commande.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowDirectCheckout(false)}
                className="text-xs font-bold text-stone-500 hover:text-ink underline"
              >
                Retour à l'article
              </button>
            </div>

            {/* Article summary */}
            <div className="p-3 rounded-2xl bg-stone-50 border border-stone-200 flex items-center gap-3">
              <img
                src={selectedProduct.imageUrl}
                alt={selectedProduct.name}
                className="w-12 h-12 rounded-xl object-cover"
              />
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-xs text-ink truncate">{selectedProduct.name}</h4>
                <p className="text-[11px] text-stone-500">
                  Quantité : <strong>{quantity}</strong> {selectedSize ? `| Taille: ${selectedSize}` : ''}
                </p>
              </div>
              <span className="font-black text-ink text-sm">
                {formatFCFA(selectedProduct.priceFCFA * quantity)}
              </span>
            </div>

            {orderError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                {orderError}
              </div>
            )}

            <form onSubmit={handleSubmitDirectOrder} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Nom & Prénom */}
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Nom et Prénom *</label>
                  <input
                    type="text"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    placeholder="Ex: KOFFI Messan"
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 outline-none focus:border-gold font-semibold text-ink"
                  />
                </div>

                {/* Numéro de Téléphone */}
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Numéro de Téléphone *</label>
                  <input
                    type="tel"
                    value={clientPhone}
                    onChange={(e) => setClientPhone(e.target.value)}
                    placeholder="Ex: +228 90 12 34 56"
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 outline-none focus:border-gold font-semibold text-ink"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block font-bold text-stone-700 mb-1">Adresse Email *</label>
                <input
                  type="email"
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                  placeholder="Ex: messan.koffi@gmail.com"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 outline-none focus:border-gold font-semibold text-ink"
                />
              </div>

              {/* Option de livraison Oui/Non */}
              <div className="p-4 rounded-2xl bg-amber-50/60 border border-gold/30 space-y-3">
                <label className="block font-extrabold text-ink text-xs">
                  Voulez-vous être livré ? *
                </label>
                
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setWantsDelivery(true)}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                      wantsDelivery
                        ? 'bg-ink text-gold border-gold/40 shadow-xs'
                        : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-100'
                    }`}
                  >
                    <Truck className="w-4 h-4 text-gold" />
                    OUI, Je veux être livré
                  </button>

                  <button
                    type="button"
                    onClick={() => setWantsDelivery(false)}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                      !wantsDelivery
                        ? 'bg-ink text-gold border-gold/40 shadow-xs'
                        : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-100'
                    }`}
                  >
                    <Store className="w-4 h-4 text-gold" />
                    NON, Retrait en magasin
                  </button>
                </div>

                {/* Conditional Delivery Inputs */}
                {wantsDelivery ? (
                  <div className="space-y-3 pt-2 border-t border-gold/20 animate-fadeIn">
                    <div>
                      <label className="block font-bold text-stone-700 mb-1">Ville de Livraison</label>
                      <select
                        value={deliveryCity}
                        onChange={(e) => setDeliveryCity(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs font-semibold text-stone-800 bg-white"
                      >
                        <option value="Lomé">Lomé (Grand Lomé)</option>
                        <option value="Tsévié">Tsévié</option>
                        <option value="Aného">Aného</option>
                        <option value="Kpalimé">Kpalimé</option>
                        <option value="Atakpamé">Atakpamé</option>
                        <option value="Sokodé">Sokodé</option>
                        <option value="Kara">Kara</option>
                        <option value="Dapaong">Dapaong</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold text-stone-700 mb-1">Zone / Quartier / Adresse de Livraison *</label>
                      <input
                        type="text"
                        value={deliveryAddress}
                        onChange={(e) => setDeliveryAddress(e.target.value)}
                        placeholder="Ex: Agoè Minamadou, près de l'école"
                        required={wantsDelivery}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 outline-none focus:border-gold bg-white"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="pt-2 border-t border-gold/20 animate-fadeIn space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer p-2.5 bg-white rounded-xl border border-stone-200">
                      <input
                        type="checkbox"
                        checked={pickupConfirmed}
                        onChange={(e) => setPickupConfirmed(e.target.checked)}
                        className="w-4 h-4 accent-gold cursor-pointer"
                      />
                      <span className="font-bold text-stone-800 text-[11px]">
                        Je confirme venir récupérer mon colis en magasin DONALDSON (Lomé - Bè)
                      </span>
                    </label>
                  </div>
                )}
              </div>

              {/* Note / Indication */}
              <div>
                <label className="block font-bold text-stone-700 mb-1">Remarques ou précisions (Optionnel)</label>
                <input
                  type="text"
                  value={deliveryNotes}
                  onChange={(e) => setDeliveryNotes(e.target.value)}
                  placeholder="Informations utiles pour votre commande..."
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-200 outline-none"
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center gap-3 pt-3 border-t border-stone-100">
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-xl bg-ink text-gold border border-gold/40 font-bold text-xs hover:bg-stone-900 transition-all shadow-md flex items-center justify-center gap-2"
                >
                  <Check className="w-4 h-4 text-gold" />
                  Valider ma Commande sur le Site
                </button>
                <button
                  type="button"
                  onClick={() => setShowDirectCheckout(false)}
                  className="px-4 py-3 rounded-xl bg-stone-100 text-stone-700 font-bold text-xs hover:bg-stone-200 transition-colors"
                >
                  Annuler
                </button>
              </div>
            </form>
          </div>
        )}

      </div>
    </div>
  );
};
