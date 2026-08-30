import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { formatFCFA, WHATSAPP_NUMBERS } from '../data/initialData';
import { ShoppingBag, Trash2, ArrowRight, Truck, PhoneCall, CheckCircle, AlertCircle, ShoppingCart, Store, Globe, Tag, Sparkles } from 'lucide-react';

export const CartPage: React.FC = () => {
  const { 
    cart, 
    updateCartQuantity, 
    removeFromCart, 
    clearCart, 
    createOrder, 
    currentUser, 
    setActivePage, 
    showToast,
    validateAndApplyPromoCode,
    incrementPromoCodeUsage,
    openWhatsAppOrderModal
  } = useApp();

  const [clientName, setClientName] = useState(
    currentUser ? `${currentUser.lastName} ${currentUser.firstName}` : ''
  );
  const [clientPhone, setClientPhone] = useState(currentUser?.phone || '');
  const [clientEmail, setClientEmail] = useState(currentUser?.email || '');
  const [wantsDelivery, setWantsDelivery] = useState(true);
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [deliveryCity, setDeliveryCity] = useState('Lomé');
  const [pickupConfirmed, setPickupConfirmed] = useState(false);
  const [deliveryNotes, setDeliveryNotes] = useState('');
  const [orderCreated, setOrderCreated] = useState<any | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Promo Code State
  const [promoInput, setPromoInput] = useState('');
  const [appliedDiscountPercent, setAppliedDiscountPercent] = useState(0);
  const [appliedPromoCode, setAppliedPromoCode] = useState<string | null>(null);
  const [appliedPromoId, setAppliedPromoId] = useState<string | null>(null);

  const subtotalFCFA = cart.reduce((sum, item) => sum + (item.product.priceFCFA * item.quantity), 0);
  const discountAmountFCFA = Math.round(subtotalFCFA * (appliedDiscountPercent / 100));
  const finalTotalFCFA = Math.max(0, subtotalFCFA - discountAmountFCFA);

  const handleApplyPromoCode = (e: React.FormEvent) => {
    e.preventDefault();
    const code = promoInput.trim().toUpperCase();
    if (!code) return;

    const cartProductIds = cart.map(item => item.product.id);
    const result = validateAndApplyPromoCode(code, cartProductIds);

    if (result.valid) {
      setAppliedDiscountPercent(result.discountPercent);
      setAppliedPromoCode(result.promo?.code || code);
      setAppliedPromoId(result.promo?.id || null);
      showToast('Code Promo Valide ! 🎉', result.message, 'success');
    } else {
      showToast('Erreur Code Promo', result.message, 'error');
    }
  };

  const handleFinalizeOrder = (orderType: 'site_direct' | 'whatsapp') => {
    setErrorMsg(null);

    if (cart.length === 0) {
      setErrorMsg('Votre panier est vide.');
      return;
    }

    if (!clientName.trim()) {
      setErrorMsg('Veuillez saisir votre Nom et Prénom.');
      return;
    }
    if (!clientPhone.trim()) {
      setErrorMsg('Veuillez saisir votre numéro de téléphone.');
      return;
    }
    if (!clientEmail.trim()) {
      setErrorMsg('Veuillez saisir votre adresse email.');
      return;
    }

    if (wantsDelivery) {
      if (!deliveryAddress.trim()) {
        setErrorMsg('Veuillez renseigner votre quartier ou zone de livraison.');
        return;
      }
    } else {
      if (!pickupConfirmed) {
        setErrorMsg('Veuillez confirmer que vous viendrez récupérer vos articles en magasin.');
        return;
      }
    }

    // Check stock for all items
    for (const item of cart) {
      if (item.quantity > item.product.stock) {
        setErrorMsg(`La quantité demandée pour "${item.product.name}" dépasse le stock disponible (${item.product.stock}).`);
        return;
      }
    }

    const newOrder = createOrder({
      clientName: clientName.trim(),
      clientPhone: clientPhone.trim(),
      clientEmail: clientEmail.trim(),
      wantsDelivery,
      deliveryAddress: wantsDelivery ? deliveryAddress.trim() : undefined,
      deliveryCity: wantsDelivery ? deliveryCity : undefined,
      pickupConfirmed: !wantsDelivery ? pickupConfirmed : undefined,
      deliveryNotes: deliveryNotes.trim(),
      orderType
    });

    setOrderCreated(newOrder);

    if (orderType === 'whatsapp') {
      const getFullImgUrl = (img?: string) => {
        if (!img) return '';
        if (img.startsWith('http://') || img.startsWith('https://')) return img;
        return window.location.origin + (img.startsWith('/') ? img : '/' + img);
      };

      const firstItemImg = newOrder.items.find(i => i.imageUrl)?.imageUrl;
      const mainPhotoUrl = getFullImgUrl(firstItemImg);

      const itemsList = newOrder.items.map((i, idx) => {
        const sizeStr = i.selectedSize ? ` (Taille: ${i.selectedSize})` : '';
        return (
          `🛒 *Article ${idx + 1} :* ${i.productName}${sizeStr}\n` +
          `   - Quantité : x${i.quantity}\n` +
          `   - Sous-Total : ${formatFCFA(i.priceFCFA * i.quantity)}`
        );
      }).join('\n\n');

      const deliveryText = wantsDelivery 
        ? `🚚 *Livraison à domicile :* ${newOrder.deliveryCity} - ${newOrder.deliveryAddress}`
        : `🏪 *Retrait en magasin :* Bè - Lomé (Togo)`;

      const msgText = 
        `🛍️ *NOUVELLE COMMANDE WEB #${newOrder.id} — DONALDSON SHOP*\n\n` +
        `👤 *CLIENT :* ${newOrder.clientName}\n` +
        `📞 *TÉLÉPHONE :* ${newOrder.clientPhone}\n` +
        `✉️ *EMAIL :* ${newOrder.clientEmail}\n` +
        `${deliveryText}\n` +
        (newOrder.deliveryNotes ? `📝 *Notes :* ${newOrder.deliveryNotes}\n` : '') +
        `\n📦 *DÉTAIL DES ARTICLES :*\n\n${itemsList}\n\n` +
        `💰 *TOTAL COMMANDE :* ${formatFCFA(newOrder.totalFCFA)}\n\n` +
        `Bonjour DONALDSON SHOP ! Je viens de valider la commande #${newOrder.id} sur votre site web. Merci de m'envoyer la confirmation ainsi que le suivi de livraison !`;

      openWhatsAppOrderModal({
        message: msgText,
        title: `Commande #${newOrder.id} Validée`,
        subtitle: 'Choisissez votre ligne WhatsApp pour transmettre le récapitulatif :',
        productName: `Panier DONALDSON SHOP (${cart.length} articles)`,
        productPrice: newOrder.totalFCFA,
        productImg: cart[0]?.product?.imageUrl
      });
    }
  };

  if (orderCreated) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4 text-center animate-fadeIn">
        <div className="bg-white p-8 sm:p-10 rounded-3xl border border-stone-200 shadow-xl space-y-6">
          <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-300 mx-auto flex items-center justify-center">
            <CheckCircle className="w-12 h-12" />
          </div>

          <h2 className="text-2xl sm:text-3xl font-serif-title font-black text-ink">
            Commande #${orderCreated.id} Enregistrée !
          </h2>

          <p className="text-xs sm:text-sm text-stone-600 leading-relaxed font-light">
            Merci <strong>{orderCreated.clientName}</strong> ! Votre commande a été transmise avec succès à l'administration DONALDSON SHOP.
          </p>

          <div className="p-4 rounded-2xl bg-amber-50/80 border border-gold/40 text-left text-xs text-stone-900 space-y-2">
            <div className="font-bold flex items-center gap-2 text-ink">
              <Truck className="w-4 h-4 text-gold-dark" />
              Récapitulatif de Livraison :
            </div>
            <ul className="list-disc pl-4 space-y-1 font-light text-stone-700">
              <li>Téléphone : <strong>{orderCreated.clientPhone}</strong></li>
              <li>Email : <strong>{orderCreated.clientEmail}</strong></li>
              <li>Total commande : <strong>{formatFCFA(orderCreated.totalFCFA)}</strong></li>
              {orderCreated.wantsDelivery ? (
                <li>Option : <strong>Livraison à {orderCreated.deliveryAddress}, {orderCreated.deliveryCity}</strong></li>
              ) : (
                <li>Option : <strong>Retrait en magasin sur place (Lomé Bè)</strong></li>
              )}
            </ul>
          </div>

          <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs text-emerald-900 font-semibold">
            🔔 Vous recevrez une notification directe sur le site dès que l'administrateur aura confirmé votre commande dans l'espace admin.
          </div>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => setActivePage('orders')}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-ink text-gold border border-gold/40 font-bold text-xs hover:bg-stone-900 transition-all shadow-md"
            >
              Voir mes commandes dans mon compte
            </button>
            <button
              onClick={() => { setOrderCreated(null); setActivePage('shop'); }}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-stone-100 text-stone-800 font-bold text-xs hover:bg-stone-200 transition-all border border-stone-200"
            >
              Continuer mes achats
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8">
      
      <div className="flex items-center justify-between border-b border-stone-200 pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif-title font-bold text-ink flex items-center gap-3">
            <ShoppingCart className="w-7 h-7 text-gold-dark" />
            Mon Panier D-Shop
          </h1>
          <p className="text-xs text-stone-500 mt-1 font-light">
            Gérez vos articles de sport et complétez vos coordonnées de commande.
          </p>
        </div>

        {cart.length > 0 && (
          <button
            onClick={clearCart}
            className="text-xs font-bold text-rose-600 hover:text-rose-800 hover:bg-rose-50 px-3 py-1.5 rounded-xl transition-all flex items-center gap-1"
          >
            <Trash2 className="w-4 h-4" />
            Vider le panier
          </button>
        )}
      </div>

      {cart.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-stone-200 space-y-4 max-w-md mx-auto">
          <ShoppingBag className="w-16 h-16 text-stone-300 mx-auto" />
          <h2 className="text-xl font-serif-title font-bold text-ink">Votre panier est vide</h2>
          <p className="text-xs text-stone-500 font-light">
            Découvrez nos articles sportifs professionnels et ajoutez vos préférés.
          </p>
          <button
            onClick={() => setActivePage('shop')}
            className="px-6 py-3 rounded-xl bg-ink text-gold border border-gold/40 font-bold text-xs shadow-md hover:bg-stone-900 transition-all"
          >
            Découvrir les Articles
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Cart Items List */}
          <div className="lg:col-span-2 space-y-4">
            {cart.map((item, index) => (
              <div
                key={`${item.product.id}_${item.selectedSize}_${index}`}
                className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs flex items-center gap-4 transition-all hover:border-gold/40"
              >
                <img
                  src={item.product.imageUrl}
                  alt={item.product.name}
                  referrerPolicy="no-referrer"
                  className="w-20 h-20 rounded-xl object-cover bg-stone-100 shrink-0"
                />

                <div className="flex-1 min-w-0">
                  <span className="text-[10px] font-bold text-gold-dark uppercase tracking-wider">
                    {item.product.category}
                  </span>
                  <h3 className="font-serif-title font-bold text-sm text-ink truncate">
                    {item.product.name}
                  </h3>

                  {item.selectedSize && (
                    <span className="text-xs text-stone-500 block mt-0.5 font-light">
                      Taille sélectionnée : <strong>{item.selectedSize}</strong>
                    </span>
                  )}

                  <div className="mt-1 flex items-center justify-between">
                    <p className="font-serif-title font-black text-ink text-sm">
                      {formatFCFA(item.product.priceFCFA)}
                    </p>
                    <span className="text-[10px] font-bold text-stone-500">
                      Stock dispo: {item.product.stock} un.
                    </span>
                  </div>
                </div>

                {/* Quantity Controls */}
                <div className="flex items-center gap-2">
                  <div className="flex items-center border border-stone-200 rounded-xl overflow-hidden bg-stone-50 text-xs">
                    <button
                      onClick={() => updateCartQuantity(item.product.id, Math.max(1, item.quantity - 1), item.selectedSize)}
                      className="px-2.5 py-1 text-stone-600 font-bold hover:bg-stone-200"
                    >
                      -
                    </button>
                    <span className="px-3 py-1 font-bold text-ink">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateCartQuantity(item.product.id, Math.min(item.product.stock, item.quantity + 1), item.selectedSize)}
                      disabled={item.quantity >= item.product.stock}
                      className="px-2.5 py-1 text-stone-600 font-bold hover:bg-stone-200 disabled:opacity-40"
                    >
                      +
                    </button>
                  </div>

                  <button
                    onClick={() => removeFromCart(item.product.id, item.selectedSize)}
                    className="p-2 text-stone-400 hover:text-rose-600 transition-colors"
                    title="Supprimer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

              </div>
            ))}
          </div>

          {/* Checkout Box with Required Fields */}
          <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-md h-fit space-y-5">
            <h3 className="text-lg font-serif-title font-bold text-ink border-b border-stone-100 pb-3 flex items-center gap-2">
              <Globe className="w-5 h-5 text-gold-dark" />
              Coordonnées de Commande
            </h3>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                {errorMsg}
              </div>
            )}

            <div className="space-y-3 text-xs">
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

              {/* Delivery Choice */}
              <div className="p-3.5 rounded-2xl bg-amber-50/60 border border-gold/30 space-y-3">
                <label className="block font-extrabold text-ink text-xs">
                  Voulez-vous être livré ? *
                </label>
                
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setWantsDelivery(true)}
                    className={`py-2 px-2.5 rounded-xl border text-[11px] font-bold transition-all flex items-center justify-center gap-1.5 ${
                      wantsDelivery
                        ? 'bg-ink text-gold border-gold/40 shadow-xs'
                        : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-100'
                    }`}
                  >
                    <Truck className="w-3.5 h-3.5 text-gold" />
                    OUI, Livraison
                  </button>

                  <button
                    type="button"
                    onClick={() => setWantsDelivery(false)}
                    className={`py-2 px-2.5 rounded-xl border text-[11px] font-bold transition-all flex items-center justify-center gap-1.5 ${
                      !wantsDelivery
                        ? 'bg-ink text-gold border-gold/40 shadow-xs'
                        : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-100'
                    }`}
                  >
                    <Store className="w-3.5 h-3.5 text-gold" />
                    NON, En magasin
                  </button>
                </div>

                {wantsDelivery ? (
                  <div className="space-y-2.5 pt-2 border-t border-gold/20 animate-fadeIn">
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
                        <option value="Atakpamé">Atakpamé</option>
                        <option value="Kpalimé">Kpalimé</option>
                        <option value="Sokodé">Sokodé</option>
                        <option value="Kara">Kara</option>
                        <option value="Dapaong">Dapaong</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold text-stone-700 mb-1">Quartier / Adresse Précise *</label>
                      <input
                        type="text"
                        value={deliveryAddress}
                        onChange={(e) => setDeliveryAddress(e.target.value)}
                        placeholder="Ex: Agoè Minamadou, près de l'école"
                        required={wantsDelivery}
                        className="w-full px-3 py-2 rounded-xl border border-stone-200 outline-none focus:border-gold bg-white"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="pt-2 border-t border-gold/20 animate-fadeIn">
                    <label className="flex items-center gap-2 cursor-pointer p-2 bg-white rounded-xl border border-stone-200">
                      <input
                        type="checkbox"
                        checked={pickupConfirmed}
                        onChange={(e) => setPickupConfirmed(e.target.checked)}
                        className="w-4 h-4 accent-gold cursor-pointer"
                      />
                      <span className="font-bold text-stone-800 text-[10px]">
                        Je confirme le retrait de mon colis sur place en magasin
                      </span>
                    </label>
                  </div>
                )}
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Indications particulières (Optionnel)</label>
                <textarea
                  value={deliveryNotes}
                  onChange={(e) => setDeliveryNotes(e.target.value)}
                  placeholder="Informations utiles..."
                  rows={2}
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 outline-none focus:border-gold"
                />
              </div>
            </div>

            {/* Code Promo Field */}
            <form onSubmit={handleApplyPromoCode} className="pt-2 border-t border-stone-100">
              <label className="block font-bold text-stone-700 text-xs mb-1 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-gold-dark" />
                Code Promo / Réduction :
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={promoInput}
                  onChange={(e) => setPromoInput(e.target.value)}
                  placeholder="Ex: DONALDSON10"
                  className="flex-1 px-3 py-2 rounded-xl border border-stone-200 text-xs uppercase font-extrabold text-ink outline-none focus:border-gold"
                />
                <button
                  type="submit"
                  className="px-3.5 py-2 rounded-xl bg-stone-900 text-gold hover:bg-black font-bold text-xs border border-gold/30 transition-all"
                >
                  Appliquer
                </button>
              </div>
              {appliedPromoCode && (
                <div className="mt-1.5 p-2 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-bold flex items-center justify-between">
                  <span>Code <strong>{appliedPromoCode}</strong> (-{appliedDiscountPercent}%) actif</span>
                  <button
                    type="button"
                    onClick={() => { setAppliedPromoCode(null); setAppliedDiscountPercent(0); setPromoInput(''); }}
                    className="text-rose-600 hover:underline"
                  >
                    Retirer
                  </button>
                </div>
              )}
            </form>

            {/* Price Summary */}
            <div className="pt-2 border-t border-stone-100 space-y-2">
              <div className="flex justify-between text-xs text-stone-600">
                <span>Sous-total Articles ({cart.length}) :</span>
                <span className="font-bold text-ink">{formatFCFA(subtotalFCFA)}</span>
              </div>

              {discountAmountFCFA > 0 && (
                <div className="flex justify-between text-xs text-emerald-700 font-bold">
                  <span>Réduction Code Promo ({appliedDiscountPercent}%) :</span>
                  <span>-{formatFCFA(discountAmountFCFA)}</span>
                </div>
              )}

              <div className="flex justify-between text-base font-serif-title font-bold text-ink pt-2 border-t border-stone-100">
                <span>Total à régler :</span>
                <span className="text-ink font-black">{formatFCFA(finalTotalFCFA)}</span>
              </div>
            </div>

            {/* Action buttons */}
            <div className="space-y-2 pt-2">
              <button
                onClick={() => handleFinalizeOrder('site_direct')}
                className="w-full py-3 px-4 rounded-xl bg-ink hover:bg-stone-900 text-gold border border-gold/40 font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2"
              >
                <span>Valider et Commander sur le Site</span>
                <ArrowRight className="w-4 h-4 text-gold" />
              </button>

              <button
                onClick={() => handleFinalizeOrder('whatsapp')}
                className="w-full py-2.5 px-4 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-300 font-bold text-xs transition-all flex items-center justify-center gap-2"
              >
                <PhoneCall className="w-4 h-4 text-emerald-700" />
                Commander via WhatsApp
              </button>
            </div>

          </div>

        </div>
      )}

    </div>
  );
};
