import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { formatFCFA, WHATSAPP_NUMBERS } from '../data/initialData';
import { Order } from '../types';
import logoImg from '../assets/images/donaldson_shop_logo_1786794643658.jpg';
import {
  Globe,
  X,
  Plus,
  Minus,
  Truck,
  Store,
  Check,
  PhoneCall,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  Package,
  ZoomIn
} from 'lucide-react';

export const DirectOrderModal: React.FC = () => {
  const {
    directCheckoutProduct,
    setDirectCheckoutProduct,
    currentUser,
    createOrder,
    setLightboxImage,
    setActivePage,
    showToast,
    openWhatsAppOrderModal
  } = useApp();

  const [quantity, setQuantity] = useState<number>(1);
  const [selectedSize, setSelectedSize] = useState<string>('');

  // Form Fields
  const [clientName, setClientName] = useState<string>('');
  const [clientPhone, setClientPhone] = useState<string>('');
  const [clientEmail, setClientEmail] = useState<string>('');
  const [wantsDelivery, setWantsDelivery] = useState<boolean>(true);
  const [deliveryCity, setDeliveryCity] = useState<string>('Lomé');
  const [deliveryAddress, setDeliveryAddress] = useState<string>('');
  const [pickupConfirmed, setPickupConfirmed] = useState<boolean>(false);
  const [deliveryNotes, setDeliveryNotes] = useState<string>('');

  // States
  const [orderError, setOrderError] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);

  // Initialize form when a product is opened
  useEffect(() => {
    if (directCheckoutProduct) {
      setQuantity(1);
      if (directCheckoutProduct.sizes && directCheckoutProduct.sizes.length > 0) {
        setSelectedSize(directCheckoutProduct.sizes[0]);
      } else {
        setSelectedSize('');
      }

      if (currentUser) {
        setClientName(`${currentUser.lastName} ${currentUser.firstName}`.trim());
        setClientPhone(currentUser.phone || '');
        setClientEmail(currentUser.email || '');
      } else {
        setClientName('');
        setClientPhone('');
        setClientEmail('');
      }

      setWantsDelivery(true);
      setDeliveryCity('Lomé');
      setDeliveryAddress('');
      setPickupConfirmed(false);
      setDeliveryNotes('');
      setOrderError('');
      setCompletedOrder(null);
    }
  }, [directCheckoutProduct, currentUser]);

  if (!directCheckoutProduct) {
    return null;
  }

  const product = directCheckoutProduct;
  const isOutOfStock = product.stock <= 0;
  const maxStock = Math.max(1, product.stock);
  const totalAmount = product.priceFCFA * quantity;

  const handleClose = () => {
    setDirectCheckoutProduct(null);
    setCompletedOrder(null);
    setOrderError('');
  };

  const handleIncreaseQty = () => {
    if (quantity < maxStock) {
      setQuantity(prev => prev + 1);
    }
  };

  const handleDecreaseQty = () => {
    if (quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };

  const handleSubmitOrder = (e: React.FormEvent) => {
    e.preventDefault();
    setOrderError('');

    if (isOutOfStock) {
      setOrderError("Cet article est actuellement en rupture de stock.");
      return;
    }

    if (!clientName.trim()) {
      setOrderError('Veuillez renseigner votre Nom et Prénom.');
      return;
    }
    if (!clientPhone.trim()) {
      setOrderError('Veuillez renseigner votre numéro de téléphone (WhatsApp / Appel).');
      return;
    }
    if (!clientEmail.trim()) {
      setOrderError('Veuillez renseigner votre adresse email.');
      return;
    }

    if (wantsDelivery) {
      if (!deliveryAddress.trim()) {
        setOrderError('Veuillez préciser votre quartier / zone de livraison.');
        return;
      }
    } else {
      if (!pickupConfirmed) {
        setOrderError('Veuillez cocher la confirmation pour le retrait en magasin.');
        return;
      }
    }

    setIsSubmitting(true);

    try {
      const finalOrder = createOrder({
        clientName: clientName.trim(),
        clientPhone: clientPhone.trim(),
        clientEmail: clientEmail.trim(),
        wantsDelivery,
        deliveryAddress: wantsDelivery ? deliveryAddress.trim() : undefined,
        deliveryCity: wantsDelivery ? deliveryCity : undefined,
        pickupConfirmed: !wantsDelivery ? pickupConfirmed : undefined,
        deliveryNotes: deliveryNotes.trim() || undefined,
        orderType: 'site_direct',
        items: [
          {
            productId: product.id,
            productName: product.name,
            priceFCFA: product.priceFCFA,
            quantity: Math.min(quantity, maxStock),
            imageUrl: product.imageUrl,
            selectedSize: selectedSize || undefined
          }
        ]
      });

      setCompletedOrder(finalOrder);
      showToast('Commande Enregistrée ! 🎉', `Votre commande #${finalOrder.id} a été validée avec succès.`, 'success');
    } catch (err: any) {
      setOrderError(err?.message || "Une erreur est survenue lors de l'enregistrement de la commande.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getFullImgUrl = (img?: string) => {
    if (!img) return '';
    if (img.startsWith('http://') || img.startsWith('https://')) return img;
    return window.location.origin + (img.startsWith('/') ? img : '/' + img);
  };

  const handleSendWhatsAppConfirmation = () => {
    if (!completedOrder) return;
    const photoUrl = getFullImgUrl(product.imageUrl);

    const msg =
      `🛍️ *COMMANDE SITE WEB CONFIRMÉE — #${completedOrder.id}*\n\n` +
      `Bonjour DONALDSON SHOP ! Je viens d'enregistrer ma commande sur votre site :\n\n` +
      `📦 *Article :* ${product.name}\n` +
      `🏷️ *Réf :* #${product.id} (${product.category})\n` +
      (selectedSize ? `📏 *Taille :* ${selectedSize}\n` : '') +
      `🔢 *Quantité :* x${completedOrder.items[0]?.quantity || quantity}\n` +
      `💰 *Total à payer :* ${formatFCFA(completedOrder.totalFCFA)}\n\n` +
      `👤 *Coordonnées Client :*\n` +
      `- Nom : ${completedOrder.clientName}\n` +
      `- Téléphone : ${completedOrder.clientPhone}\n` +
      `- Email : ${completedOrder.clientEmail}\n\n` +
      `🚚 *Mode de réception :*\n` +
      (completedOrder.wantsDelivery 
        ? `- Livraison à domicile : ${completedOrder.deliveryCity} - ${completedOrder.deliveryAddress}\n`
        : `- Retrait en magasin DONALDSON SHOP (Lomé - Bè)\n`
      ) +
      (completedOrder.deliveryNotes ? `📝 *Précisions :* ${completedOrder.deliveryNotes}\n\n` : '\n') +
      `Merci de confirmer la prise en charge et le délai de livraison !`;

    openWhatsAppOrderModal({
      message: msg,
      title: `Commande #${completedOrder.id}`,
      subtitle: 'Sélectionnez votre ligne WhatsApp pour transmettre votre commande :',
      productName: product.name,
      productPrice: completedOrder.totalFCFA,
      productImg: product.imageUrl
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/70 backdrop-blur-sm overflow-y-auto animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-stone-200 overflow-hidden relative">
        
        {/* Modal Top Header */}
        <div className="px-5 py-4 bg-stone-900 text-white flex items-center justify-between border-b border-stone-800 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <img
              src={logoImg}
              alt="DONALDSON SHOP Logo"
              referrerPolicy="no-referrer"
              className="h-9 w-9 object-contain rounded-xl bg-white p-0.5 border border-amber-500/40 shrink-0"
            />
            <div className="min-w-0">
              <h3 className="text-sm sm:text-base font-serif-title font-bold text-white flex items-center gap-2 truncate">
                <Globe className="w-4 h-4 text-emerald-400 shrink-0" />
                Commander sur le Site Web
              </h3>
              <p className="text-[11px] text-stone-300 font-light truncate">
                Remplissez vos coordonnées pour valider votre achat
              </p>
            </div>
          </div>

          <button
            onClick={handleClose}
            className="p-1.5 rounded-full bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white transition-colors cursor-pointer"
            title="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-5">
          
          {completedOrder ? (
            /* Order Success Receipt Screen */
            <div className="space-y-6 py-4 animate-fadeIn text-center">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div className="space-y-1">
                <span className="inline-block px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-black rounded-full uppercase tracking-wider">
                  Commande Enregistrée
                </span>
                <h3 className="text-xl sm:text-2xl font-serif-title font-extrabold text-stone-900">
                  Merci pour votre commande !
                </h3>
                <p className="text-xs text-stone-600 max-w-md mx-auto">
                  Votre commande numéro <strong className="text-emerald-700 font-mono text-sm">#{completedOrder.id}</strong> a été transmise avec succès à l'équipe commerciale DONALDSON SHOP.
                </p>
              </div>

              {/* Order Recap Card */}
              <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 text-left space-y-3 text-xs">
                <div className="flex items-center gap-3 pb-3 border-b border-stone-200">
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-14 h-14 rounded-xl object-cover border border-stone-200"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-stone-900 truncate">{product.name}</h4>
                    <p className="text-stone-500 text-[11px]">
                      Quantité : <strong>x{completedOrder.items[0]?.quantity || quantity}</strong>
                      {selectedSize ? ` • Taille : ${selectedSize}` : ''}
                    </p>
                    <span className="font-extrabold text-stone-900 text-xs">
                      {formatFCFA(completedOrder.totalFCFA)}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-stone-700">
                  <div>
                    <span className="font-bold text-stone-900 block">👤 Client :</span>
                    <p className="truncate">{completedOrder.clientName}</p>
                    <p className="text-stone-500 font-mono">{completedOrder.clientPhone}</p>
                  </div>

                  <div>
                    <span className="font-bold text-stone-900 block">🚚 Mode de réception :</span>
                    <p className="text-stone-700">
                      {completedOrder.wantsDelivery 
                        ? `Livraison à ${completedOrder.deliveryCity} (${completedOrder.deliveryAddress})`
                        : `Retrait gratuit en magasin (Lomé - Bè)`
                      }
                    </p>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-[11px] flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0" />
                  <span><strong>Paiement :</strong> À la livraison ou lors de la réception du colis.</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2.5 pt-2">
                <button
                  type="button"
                  onClick={handleSendWhatsAppConfirmation}
                  className="w-full py-3 px-4 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                >
                  <PhoneCall className="w-4 h-4" />
                  <span>Envoyer aussi le récapitulatif par WhatsApp</span>
                </button>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      handleClose();
                      setActivePage('orders');
                    }}
                    className="w-full py-2.5 px-4 rounded-full bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Package className="w-4 h-4" />
                    <span>Suivre ma commande</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleClose}
                    className="w-full py-2.5 px-4 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-xs border border-stone-300 transition-all cursor-pointer"
                  >
                    <span>Continuer mes achats</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* Order Coordinates Form */
            <form onSubmit={handleSubmitOrder} className="space-y-5">
              
              {/* Product Recap Card */}
              <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    onClick={() => setLightboxImage({ url: product.imageUrl, title: product.name })}
                    className="relative w-16 h-16 rounded-xl overflow-hidden bg-stone-200 shrink-0 cursor-pointer group border border-stone-300"
                    title="Cliquer pour agrandir la photo"
                  >
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                      <ZoomIn className="w-4 h-4" />
                    </div>
                  </div>

                  <div className="min-w-0">
                    <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider block">
                      {product.category}
                    </span>
                    <h4 className="font-serif-title font-bold text-sm text-stone-900 truncate">
                      {product.name}
                    </h4>
                    <div className="flex items-baseline gap-2 mt-0.5">
                      <span className="font-extrabold text-stone-900 text-sm">
                        {formatFCFA(product.priceFCFA)}
                      </span>
                      {product.originalPriceFCFA && product.originalPriceFCFA > product.priceFCFA && (
                        <span className="text-[11px] text-stone-400 line-through">
                          {formatFCFA(product.originalPriceFCFA)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Quantity Controls */}
                <div className="flex items-center gap-3 self-end sm:self-center">
                  <div className="flex items-center border border-stone-300 rounded-full bg-white px-2 py-1 shadow-xs">
                    <button
                      type="button"
                      onClick={handleDecreaseQty}
                      disabled={quantity <= 1}
                      className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-stone-100 text-stone-700 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-8 text-center font-extrabold text-xs text-stone-900">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      onClick={handleIncreaseQty}
                      disabled={quantity >= maxStock}
                      className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-stone-100 text-stone-700 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] text-stone-500 block">Total article :</span>
                    <span className="font-black text-emerald-700 text-sm">
                      {formatFCFA(totalAmount)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Sizes / Options selector if available */}
              {product.sizes && product.sizes.length > 0 && (
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-stone-800">
                    Sélectionnez la Taille / Pointure : <span className="text-emerald-700 font-extrabold">{selectedSize || 'Aucune sélectionnée'}</span>
                  </label>
                  <div className="flex flex-wrap gap-2.5 sm:gap-3 items-center">
                    {product.sizes.map((sz) => (
                      <button
                        key={sz}
                        type="button"
                        onClick={() => setSelectedSize(sz)}
                        className={`min-w-[42px] px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer text-center ${
                          selectedSize === sz
                            ? 'bg-stone-900 text-white shadow-sm ring-2 ring-stone-900 ring-offset-1'
                            : 'bg-stone-100 hover:bg-stone-200 text-stone-700 border border-stone-200 hover:border-stone-300'
                        }`}
                      >
                        {sz}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Section Header: Coordonnées de Commande */}
              <div className="pt-2 border-t border-stone-200">
                <h4 className="text-xs font-extrabold text-stone-900 uppercase tracking-wider flex items-center gap-1.5 mb-1">
                  <span>1. Vos Coordonnées de Commande</span>
                </h4>
                <p className="text-[11px] text-stone-500 font-normal">
                  Ces informations permettront à notre service logistique de vous contacter pour la livraison ou le retrait.
                </p>
              </div>

              {orderError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{orderError}</span>
                </div>
              )}

              {/* Contact inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">
                    Nom et Prénom <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="text"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    placeholder="Ex: KOFFI Messan"
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:border-stone-900 focus:ring-1 focus:ring-stone-900 outline-none font-medium text-stone-900 bg-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">
                    Numéro de Téléphone (Appel / WhatsApp) <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="tel"
                    value={clientPhone}
                    onChange={(e) => setClientPhone(e.target.value)}
                    placeholder="Ex: +228 90 12 34 56"
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:border-stone-900 focus:ring-1 focus:ring-stone-900 outline-none font-medium text-stone-900 bg-white font-mono"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold text-stone-700 mb-1">
                    Adresse Email <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="email"
                    value={clientEmail}
                    onChange={(e) => setClientEmail(e.target.value)}
                    placeholder="Ex: messan.koffi@gmail.com"
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:border-stone-900 focus:ring-1 focus:ring-stone-900 outline-none font-medium text-stone-900 bg-white"
                  />
                </div>
              </div>

              {/* Section Header: Mode de Réception */}
              <div className="pt-2 border-t border-stone-200">
                <h4 className="text-xs font-extrabold text-stone-900 uppercase tracking-wider mb-2">
                  2. Mode de Réception du Colis <span className="text-rose-600">*</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setWantsDelivery(true)}
                    className={`p-3 rounded-2xl border text-left flex items-start gap-3 transition-all cursor-pointer ${
                      wantsDelivery
                        ? 'bg-emerald-50/70 border-emerald-500 shadow-xs'
                        : 'bg-stone-50 border-stone-200 hover:bg-stone-100 text-stone-700'
                    }`}
                  >
                    <div className={`p-2 rounded-xl shrink-0 ${wantsDelivery ? 'bg-emerald-600 text-white' : 'bg-stone-200 text-stone-700'}`}>
                      <Truck className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-extrabold text-xs text-stone-900 block">
                        Livraison à Domicile
                      </span>
                      <p className="text-[11px] text-stone-500 leading-snug mt-0.5">
                        Expédié directement à votre quartier / adresse
                      </p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setWantsDelivery(false)}
                    className={`p-3 rounded-2xl border text-left flex items-start gap-3 transition-all cursor-pointer ${
                      !wantsDelivery
                        ? 'bg-emerald-50/70 border-emerald-500 shadow-xs'
                        : 'bg-stone-50 border-stone-200 hover:bg-stone-100 text-stone-700'
                    }`}
                  >
                    <div className={`p-2 rounded-xl shrink-0 ${!wantsDelivery ? 'bg-emerald-600 text-white' : 'bg-stone-200 text-stone-700'}`}>
                      <Store className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-extrabold text-xs text-stone-900 block">
                        Retrait en Magasin (Gratuit)
                      </span>
                      <p className="text-[11px] text-stone-500 leading-snug mt-0.5">
                        Boutique DONALDSON SHOP à Lomé (Bè)
                      </p>
                    </div>
                  </button>
                </div>

                {/* Conditional Fields for Delivery or Pickup */}
                {wantsDelivery ? (
                  <div className="mt-3 p-3.5 rounded-2xl bg-stone-50 border border-stone-200 space-y-3 animate-fadeIn text-xs">
                    <div>
                      <label className="block font-bold text-stone-800 mb-1">
                        Ville de Livraison
                      </label>
                      <select
                        value={deliveryCity}
                        onChange={(e) => setDeliveryCity(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl border border-stone-300 font-semibold text-stone-900 bg-white"
                      >
                        <option value="Lomé">Lomé (Grand Lomé & Périphérie)</option>
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
                      <label className="block font-bold text-stone-800 mb-1">
                        Quartier / Rue / Repère précis <span className="text-rose-600">*</span>
                      </label>
                      <input
                        type="text"
                        value={deliveryAddress}
                        onChange={(e) => setDeliveryAddress(e.target.value)}
                        placeholder="Ex: Agoè Minamadou, carrefour 2 lions, maison blanche"
                        required={wantsDelivery}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:border-stone-900 outline-none bg-white font-medium text-stone-900"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="mt-3 p-3.5 rounded-2xl bg-amber-50/60 border border-amber-200 animate-fadeIn text-xs space-y-2">
                    <div className="flex items-start gap-2">
                      <Store className="w-4 h-4 text-amber-700 mt-0.5 shrink-0" />
                      <p className="text-stone-700 leading-relaxed">
                        Adresse du magasin : <strong>DONALDSON SHOP, Bè - Lomé (Togo)</strong>. Vos articles seront préparés et mis de côté pour vous.
                      </p>
                    </div>

                    <label className="flex items-center gap-2 cursor-pointer p-2 rounded-xl bg-white border border-amber-300">
                      <input
                        type="checkbox"
                        checked={pickupConfirmed}
                        onChange={(e) => setPickupConfirmed(e.target.checked)}
                        className="w-4 h-4 accent-emerald-600 cursor-pointer"
                        required={!wantsDelivery}
                      />
                      <span className="font-bold text-stone-800 text-[11px]">
                        Je confirme venir récupérer mon colis directement en magasin
                      </span>
                    </label>
                  </div>
                )}
              </div>

              {/* Optional Notes */}
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Remarques ou instructions spéciales (Optionnel)
                </label>
                <input
                  type="text"
                  value={deliveryNotes}
                  onChange={(e) => setDeliveryNotes(e.target.value)}
                  placeholder="Ex: Flocage numéro 10 au dos, créneau horaire préféré..."
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-300 outline-none text-xs bg-white text-stone-800"
                />
              </div>

              {/* Payment Info Banner */}
              <div className="p-3 rounded-2xl bg-stone-100 border border-stone-200 flex items-center justify-between text-xs text-stone-700">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Paiement à la livraison / au retrait (Espèces, TMoney, Flooz)</span>
                </div>
                <span className="font-black text-stone-900 text-sm">
                  Total : {formatFCFA(totalAmount)}
                </span>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting || isOutOfStock}
                  className="flex-1 py-3.5 px-6 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 disabled:opacity-50"
                >
                  <Check className="w-4 h-4" />
                  <span>
                    {isSubmitting 
                      ? 'Enregistrement en cours...' 
                      : `Valider ma Commande sur le Site (${formatFCFA(totalAmount)})`
                    }
                  </span>
                </button>

                <button
                  type="button"
                  onClick={handleClose}
                  className="px-5 py-3.5 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs transition-colors cursor-pointer border border-stone-200"
                >
                  Annuler
                </button>
              </div>

            </form>
          )}

        </div>

      </div>
    </div>
  );
};
