import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useApp } from '../context/AppContext';
import { formatFCFA, WHATSAPP_NUMBERS } from '../data/initialData';
import { Product } from '../types';
import { AuthPromptModal } from './AuthPromptModal';
import heroBgImage from '../assets/images/soccer_hero_bg_1785003468850.jpg';
import logoImg from '../assets/images/donaldson_shop_logo_1786794643658.jpg';
import {
  Store,
  ShieldCheck,
  Truck,
  Award,
  Sparkles,
  PhoneCall,
  CheckCircle2,
  ArrowRight,
  HelpCircle,
  Megaphone,
  ShoppingBag,
  Users,
  Clock,
  MapPin,
  Star,
  Eye,
  Heart,
  ZoomIn,
  Flame,
  Tag,
  Quote,
  ThumbsUp,
  Plus,
  MessageSquare,
  Globe
} from 'lucide-react';

export const HomePage: React.FC = () => {
  const {
    setActivePage,
    categories,
    categoryItems,
    setLightboxImage,
    products,
    addToCart,
    setSelectedProduct,
    setDirectCheckoutProduct,
    currentUser,
    wishlistIds,
    toggleWishlist,
    isInWishlist,
    setCatalogCategoryFilter,
    setGlobalSearchQuery,
    showToast,
    reviews,
    addReview,
    openWhatsAppOrderModal
  } = useApp();

  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authModalMessage, setAuthModalMessage] = useState('');
  const [showAddReviewModal, setShowAddReviewModal] = useState(false);

  // New review form fields
  const [newAuthor, setNewAuthor] = useState('');
  const [newLocation, setNewLocation] = useState('');
  const [newRating, setNewRating] = useState(5);
  const [newProduct, setNewProduct] = useState('');
  const [newComment, setNewComment] = useState('');
  const [newRole, setNewRole] = useState('');

  const handleAddReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAuthor.trim() || !newComment.trim()) {
      showToast('Formulaire incomplet', 'Veuillez renseigner votre nom et votre avis.', 'warning');
      return;
    }

    addReview({
      author: newAuthor.trim(),
      location: newLocation.trim() || 'Lomé, Togo',
      role: newRole.trim() || (currentUser ? 'Client DONALDSON' : 'Passionné de sport'),
      rating: newRating,
      product: newProduct.trim() || 'Équipement Sportif',
      comment: newComment.trim(),
      verified: !!currentUser
    });

    setNewAuthor('');
    setNewLocation('');
    setNewProduct('');
    setNewComment('');
    setNewRole('');
    setNewRating(5);
    setShowAddReviewModal(false);
  };

  const categoryImages: Record<string, string> = {
    'Maillots Pro': 'https://images.unsplash.com/photo-1511746315387-c4a76990fdce?auto=format&fit=crop&w=800&q=80',
    'Chaussures & Crampons': 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80',
    'Accessoires & Ballons': 'https://images.unsplash.com/photo-1614632537190-23e4146777db?auto=format&fit=crop&w=800&q=80',
    'Fitness & Musculation': 'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?auto=format&fit=crop&w=800&q=80',
    'Sports de Combat': 'https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?auto=format&fit=crop&w=800&q=80'
  };

  // Get top featured or available products for homepage display (max 8)
  const featuredProducts = products.filter(p => p.featured || p.badge === 'TOP VENTE' || p.badge === 'NOUVEAU').slice(0, 8);
  const displayProducts = featuredProducts.length >= 4 ? featuredProducts : products.slice(0, 8);

  const handleProductSelect = (product: Product) => {
    if (!currentUser) {
      setAuthModalMessage("Pour consulter la fiche détaillée de cet article, vous devez obligatoirement vous connecter ou créer un compte.");
      setShowAuthModal(true);
      return;
    }
    setSelectedProduct(product);
  };

  const handleAddToCartSecure = (product: Product) => {
    if (!currentUser) {
      setAuthModalMessage("Pour ajouter cet article au panier, vous devez obligatoirement vous connecter ou créer un compte.");
      setShowAuthModal(true);
      return;
    }
    addToCart(product);
  };

  const handleSiteOrderDirect = (product: Product) => {
    if (product.stock <= 0) return;
    setDirectCheckoutProduct(product);
  };

  const getFullImgUrl = (img?: string) => {
    if (!img) return '';
    if (img.startsWith('http://') || img.startsWith('https://')) return img;
    return window.location.origin + (img.startsWith('/') ? img : '/' + img);
  };

  const handleWhatsAppOrderDirect = (product: Product) => {
    openWhatsAppOrderModal({
      title: `Commander ${product.name}`,
      subtitle: 'Sélectionnez une ligne WhatsApp pour envoyer votre commande :',
      productName: product.name,
      productPrice: product.priceFCFA,
      productImg: product.imageUrl,
      productId: product.id,
      category: product.category,
      availableSizes: product.sizes,
      availableColors: product.colors,
      selectedSize: product.sizes?.[0] || '',
      selectedColor: product.colors?.[0] || '',
      quantity: 1,
      clientName: currentUser ? `${currentUser.lastName} ${currentUser.firstName}`.trim() : '',
      clientPhone: currentUser?.phone || '',
      clientCity: 'Lomé'
    });
  };

  return (
    <div className="space-y-12 sm:space-y-16 pb-16">
      
      {/* Hero Presentation Section */}
      <section className="relative rounded-3xl overflow-hidden text-white p-6 sm:p-14 shadow-2xl border border-gold/30 min-h-[460px] sm:min-h-[520px] flex items-center">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-1000 hover:scale-105"
          style={{ backgroundImage: `url(${heroBgImage})` }}
        />
        
        {/* Soft Vignette Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-black/30" />
        
        <div className="relative z-10 max-w-2xl space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gold/20 text-gold border border-gold/50 text-xs font-bold uppercase tracking-widest backdrop-blur-md">
            <Sparkles className="w-4 h-4 text-gold" />
            L'Enseigne N°1 des Équipements de Sport
          </div>
          
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-serif-title font-black tracking-tight leading-tight text-white drop-shadow-xl">
            DONALDSON <span className="text-gold italic font-editorial">SHOP</span>
          </h1>
          
          <p className="text-stone-200 text-sm sm:text-base lg:text-lg leading-relaxed font-light drop-shadow-md">
            Bienvenue dans votre boutique spécialisée d'articles de sport pro, maillots officiels certifiés, crampons de compétition et équipements de musculation haut de gamme.
          </p>

          <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5">
            <button
              onClick={() => setActivePage('boutique')}
              className="px-8 py-3.5 rounded-2xl bg-gold hover:bg-gold-dark text-ink font-bold text-xs sm:text-sm uppercase tracking-wider shadow-xl transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
            >
              <Store className="w-4 h-4 text-ink" />
              <span>Accéder à la Boutique</span>
              <ArrowRight className="w-4 h-4 text-ink" />
            </button>

            <button
              onClick={() => setActivePage('aide')}
              className="px-6 py-3.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm border border-white/20 backdrop-blur-md transition-all flex items-center justify-center gap-2"
            >
              <HelpCircle className="w-4 h-4 text-gold" />
              <span>Aide & Contact</span>
            </button>
          </div>
        </div>
      </section>

      {/* Brand Description & Mission Section */}
      <section className="bg-white rounded-3xl p-6 sm:p-12 border border-stone-200 shadow-xs space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          <div className="lg:col-span-7 space-y-5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 text-gold-dark border border-gold/30 text-xs font-extrabold uppercase tracking-widest">
              <Award className="w-3.5 h-3.5" />
              À Propos de DONALDSON SHOP
            </div>

            <h2 className="text-2xl sm:text-4xl font-serif-title font-bold text-ink leading-snug">
              Des Équipements Sportifs Conçus Pour la Performance et l'Élégance
            </h2>

            <p className="text-stone-600 text-xs sm:text-sm leading-relaxed font-light">
              Implanté à <strong>Sanguéra, non loin de l'UCAO et de l'Hôtel O2 à Lomé (Togo)</strong>, <strong>DONALDSON SHOP</strong> est une enseigne passionnée par l'univers du sport. Notre mission est d'offrir aux passionnés de football, pratiquants de fitness, clubs et athlètes des équipements de sport pro et du matériel haut de gamme.
            </p>

            <p className="text-stone-600 text-xs sm:text-sm leading-relaxed font-light">
              Que vous cherchiez les nouveaux <strong>maillots officiels des grands clubs</strong>, des <strong>crampons professionnels</strong> pour le terrain, du matériel d'entraînement ou des accessoires de combat, nous garantissons l'authenticité de nos produits ainsi qu'une livraison rapide à votre domicile.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-3">
              <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200">
                <span className="block text-2xl font-serif-title font-black text-ink">100%</span>
                <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">Authentique & Certifié</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200">
                <span className="block text-2xl font-serif-title font-black text-ink">Lomé & Togo</span>
                <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">Livraison Rapide</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 col-span-2 sm:col-span-1">
                <span className="block text-2xl font-serif-title font-black text-ink">7j/7</span>
                <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">Assistance WhatsApp</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 flex justify-center">
            <div className="relative p-6 bg-white rounded-3xl text-stone-900 border border-stone-200 shadow-md space-y-6 max-w-md w-full">
              <div className="flex items-center gap-3 border-b border-stone-200 pb-4">
                <img
                  src={logoImg}
                  alt="DONALDSON SHOP"
                  referrerPolicy="no-referrer"
                  onClick={() => setLightboxImage({ url: logoImg, title: "DONALDSON SHOP Official Logo" })}
                  className="w-14 h-14 object-contain rounded-2xl bg-white p-1 border border-stone-200 shadow-xs cursor-pointer hover:scale-105 transition-transform"
                />
                <div>
                  <h3 className="text-xl font-serif-title font-bold text-stone-900">DONALDSON SHOP</h3>
                  <p className="text-xs text-amber-700 font-bold">Boutique Officielle d'Équipements Sportifs</p>
                </div>
              </div>

              <div className="space-y-3 text-xs text-stone-700 font-normal">
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <span>Maillots de football originaux, maillots rétros et tenues de sélection.</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <span>Chaussures à crampons montants et chaussures de futsal haute adherence.</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <span>Ballons officiels certifiés, protège-tibias et gants de gardien pro.</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <span>Bandes de résistance, haltères et tenues de musculation de qualité.</span>
                </div>
              </div>

              <button
                onClick={() => setActivePage('boutique')}
                className="w-full py-3.5 px-6 rounded-full bg-stone-900 hover:bg-stone-800 text-white font-black text-xs uppercase tracking-wider shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
              >
                <span>Découvrir nos articles en boutique</span>
                <ArrowRight className="w-4 h-4 text-white" />
              </button>
            </div>
          </div>

        </div>
      </section>

      {/* Featured Product Cards Section with Smooth Fade-in Animations */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 text-gold-dark border border-gold/30 text-xs font-bold uppercase tracking-wider mb-2">
              <Flame className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
              Sélection Incontournable
            </div>
            <h2 className="text-2xl sm:text-3xl font-serif-title font-bold text-ink">
              Articles Phares & Coups de Cœur
            </h2>
          </div>

          <button
            onClick={() => setActivePage('boutique')}
            className="text-xs font-extrabold text-gold-dark hover:text-ink flex items-center gap-1 uppercase tracking-wider self-start sm:self-auto"
          >
            <span>Voir le catalogue complet ({products.length})</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {displayProducts.map((product, index) => (
            <motion.div
              key={`${product.id}_${index}`}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.45, delay: (index % 4) * 0.1, ease: 'easeOut' }}
              className="bg-white rounded-3xl border border-stone-200 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden group hover:border-gold/50"
            >
              {/* Image Container */}
              <div className="relative h-64 bg-stone-100 overflow-hidden cursor-pointer group">
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  referrerPolicy="no-referrer"
                  onClick={() => setLightboxImage({ url: product.imageUrl, title: product.name })}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />

                {/* Badge */}
                {product.badge && (
                  <span className="absolute top-3 left-3 bg-ink/90 backdrop-blur-md text-gold font-black text-[10px] uppercase tracking-widest px-3 py-1 rounded-full shadow-md border border-gold/40">
                    {product.badge}
                  </span>
                )}

                {/* Category Pill */}
                <span className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-md text-stone-800 text-[10px] font-bold px-2.5 py-1 rounded-lg border border-stone-200">
                  {product.category}
                </span>

                {/* Top Right Buttons */}
                <div className="absolute top-3 right-3 flex items-center gap-1.5 z-10">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleWishlist(product.id);
                    }}
                    className={`p-2 rounded-full transition-all shadow-md ${
                      isInWishlist(product.id)
                        ? 'bg-rose-600 text-white shadow-rose-600/30'
                        : 'bg-white/90 text-stone-700 hover:text-rose-600 hover:bg-white'
                    }`}
                    title={isInWishlist(product.id) ? "Retirer des favoris" : "Ajouter aux favoris"}
                  >
                    <Heart className={`w-4 h-4 ${isInWishlist(product.id) ? 'fill-white' : ''}`} />
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setLightboxImage({ url: product.imageUrl, title: product.name });
                    }}
                    className="p-2 rounded-full bg-white/90 text-stone-800 hover:text-gold-dark hover:bg-white transition-all shadow-md"
                    title="Agrandir la photo"
                  >
                    <ZoomIn className="w-4 h-4 text-ink" />
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleProductSelect(product);
                    }}
                    className="p-2 rounded-full bg-white/90 text-stone-800 hover:text-gold-dark hover:bg-white transition-all shadow-md"
                    title="Aperçu rapide"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Info Container */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <h3
                    onClick={() => handleProductSelect(product)}
                    className="font-serif-title font-bold text-ink text-base leading-snug hover:text-gold-dark cursor-pointer transition-colors line-clamp-1"
                  >
                    {product.name}
                  </h3>
                  
                  <p className="text-xs text-stone-500 line-clamp-2 mt-1 leading-relaxed font-light">
                    {product.description}
                  </p>

                  <div className="mt-3 flex items-baseline justify-between gap-2">
                    <div className="flex items-baseline gap-2">
                      <span className="text-xl font-serif-title font-black text-ink">
                        {formatFCFA(product.priceFCFA)}
                      </span>
                      {product.originalPriceFCFA && product.originalPriceFCFA > product.priceFCFA && (
                        <span className="text-xs text-stone-400 line-through font-semibold">
                          {formatFCFA(product.originalPriceFCFA)}
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] font-medium text-stone-400 shrink-0">
                      Stock : {product.stock} un.
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-2 pt-2 border-t border-stone-100">
                  <button
                    onClick={() => handleAddToCartSecure(product)}
                    className="w-full py-2.5 px-4 rounded-full bg-stone-900 hover:bg-stone-800 text-white text-xs font-black transition-all flex items-center justify-center gap-2 shadow-md active:scale-95 cursor-pointer"
                  >
                    <ShoppingBag className="w-4 h-4 text-white" />
                    <span>Ajouter au Panier</span>
                  </button>

                  <button
                    onClick={() => handleSiteOrderDirect(product)}
                    className="w-full py-2 px-4 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold transition-all flex items-center justify-center gap-1.5 shadow-xs active:scale-95 cursor-pointer"
                  >
                    <Globe className="w-3.5 h-3.5 text-white" />
                    <span>Commander sur le site</span>
                  </button>

                  <button
                    onClick={() => handleWhatsAppOrderDirect(product)}
                    className="w-full py-2 px-4 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold transition-all flex items-center justify-center gap-1.5 shadow-xs active:scale-95 cursor-pointer"
                  >
                    <PhoneCall className="w-3.5 h-3.5 text-white" />
                    <span>Commander via WhatsApp</span>
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Featured Categories Presentation with Fade-in Animations */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-stone-100 text-stone-800 text-xs font-bold uppercase tracking-wider mb-2">
              <Store className="w-3.5 h-3.5 text-gold-dark" />
              Nos Rayons Spécialisés
            </div>
            <h2 className="text-2xl sm:text-3xl font-serif-title font-bold text-ink">
              Explorez Nos Différentes Catégories
            </h2>
          </div>

          <button
            onClick={() => setActivePage('boutique')}
            className="text-xs font-extrabold text-gold-dark hover:text-ink flex items-center gap-1 uppercase tracking-wider self-start sm:self-auto"
          >
            <span>Voir toute la boutique</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categoryItems.map((catItem, index) => {
            const img = catItem.imageUrl || categoryImages[catItem.name] || 'https://images.unsplash.com/photo-1511746315387-c4a76990fdce?auto=format&fit=crop&w=800&q=80';
            const desc = catItem.description || `Sélection d'équipements sportifs haut de gamme dans le rayon ${catItem.name}.`;
            return (
              <motion.div
                key={catItem.id || catItem.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-30px' }}
                transition={{ duration: 0.45, delay: (index % 3) * 0.1, ease: 'easeOut' }}
                className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 group flex flex-col justify-between"
              >
                <div className="relative h-48 bg-stone-100 overflow-hidden">
                  <img
                    src={img}
                    alt={catItem.name}
                    referrerPolicy="no-referrer"
                    onClick={() => setLightboxImage({ url: img, title: `Rayon : ${catItem.name}` })}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 cursor-pointer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <span className="text-xs font-bold text-gold uppercase tracking-widest block mb-0.5">
                      Rayon Sportif
                    </span>
                    <h3 className="text-xl font-serif-title font-bold text-white">{catItem.name}</h3>
                  </div>
                </div>

                <div className="p-5 space-y-4">
                  <p className="text-xs text-stone-500 leading-relaxed font-light">
                    {desc}
                  </p>

                  <button
                    onClick={() => setActivePage('boutique')}
                    className="w-full py-2.5 px-4 rounded-xl bg-stone-100 hover:bg-ink hover:text-gold text-stone-800 font-bold text-xs transition-all border border-stone-200 flex items-center justify-center gap-2 group-hover:border-gold/40 cursor-pointer"
                  >
                    <span>Consulter les articles</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Why Choose Us / Guarantees Grid */}
      <section className="bg-white text-ink rounded-3xl p-6 sm:p-12 border border-stone-200 shadow-xs space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-amber-700 font-extrabold text-xs uppercase tracking-widest block">
            L'Engagement Donaldson
          </span>
          <h2 className="text-2xl sm:text-4xl font-serif-title font-bold text-ink">
            Pourquoi Faire Confiance à DONALDSON SHOP ?
          </h2>
          <p className="text-xs sm:text-sm text-stone-600 font-normal">
            Nous plaçons la qualité de nos équipements et la satisfaction de nos clients au centre de nos priorités.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
          
          <div className="p-6 rounded-2xl bg-white border border-stone-200 space-y-3 hover:border-amber-400 transition-all shadow-xs">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center border border-amber-200">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-serif-title font-bold text-ink">Qualité & Authenticité</h3>
            <p className="text-xs text-stone-600 leading-relaxed font-light">
              Chaque maillot et équipement est rigoureusement sélectionné pour répondre aux normes de qualité professionnelle et assurer un confort maximal.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-stone-200 space-y-3 hover:border-amber-400 transition-all shadow-xs">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center border border-amber-200">
              <Truck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-serif-title font-bold text-ink">Livraison Express Togo</h3>
            <p className="text-xs text-stone-600 leading-relaxed font-light">
              Service de livraison rapide à Lomé et expédition sécurisée dans les principales villes du Togo avec suivi personnalisé de votre colis.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-stone-200 space-y-3 hover:border-amber-400 transition-all shadow-xs">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center border border-amber-200">
              <PhoneCall className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-serif-title font-bold text-ink">Support Web & WhatsApp</h3>
            <p className="text-xs text-stone-600 leading-relaxed font-light">
              Passez vos commandes facilement en ligne ou échangez directement avec nos conseillers via WhatsApp pour toute question sur la taille ou la livraison.
            </p>
          </div>

        </div>
      </section>

      {/* SECTION AVIS CLIENTS / TEMOIGNAGES */}
      <section className="space-y-8 py-4">
        <div className="bg-white text-stone-900 rounded-3xl p-6 sm:p-10 border border-stone-200 shadow-sm relative overflow-hidden">
          {/* Subtle background glow */}
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-amber-600/5 rounded-full blur-3xl pointer-events-none" />

          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 relative z-10 border-b border-stone-200 pb-8">
            <div className="space-y-3 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-extrabold uppercase tracking-widest">
                <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                <span>Avis & Témoignages Clients</span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-serif-title font-bold text-stone-900 leading-tight">
                La Satisfaction de nos Athlètes & Clients
              </h2>
              <p className="text-xs sm:text-sm text-stone-600 font-light leading-relaxed">
                Partagez et consultez les retours d'expérience de nos footballeurs, passionnés de sport et clients qui font confiance à DONALDSON SHOP.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <button
                onClick={() => setShowAddReviewModal(true)}
                className="px-5 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-95 shrink-0"
              >
                <Plus className="w-4 h-4 text-slate-950" />
                <span>Donner mon Avis</span>
              </button>
            </div>
          </div>

          {/* Reviews Cards Grid OR Empty State */}
          <div className="pt-6 relative z-10">
            {reviews.length === 0 ? (
              <div className="text-center py-12 px-4 bg-stone-50 rounded-2xl border border-dashed border-stone-300 space-y-4 max-w-xl mx-auto">
                <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center mx-auto border border-amber-200">
                  <MessageSquare className="w-7 h-7 text-amber-700" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-stone-900 font-serif-title">
                    Soyez le premier à donner votre avis !
                  </h3>
                  <p className="text-xs text-stone-500 font-light leading-relaxed">
                    Avez-vous déjà commandé un maillot ou un équipement chez DONALDSON SHOP ? Partagez votre expérience avec la communauté.
                  </p>
                </div>
                <button
                  onClick={() => setShowAddReviewModal(true)}
                  className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-sm transition-all cursor-pointer inline-flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Rédiger le premier avis</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {reviews.map((rev) => (
                  <div
                    key={rev.id}
                    className="bg-stone-50/80 hover:bg-white rounded-2xl p-6 border border-stone-200 hover:border-amber-400 space-y-4 transition-all shadow-xs hover:shadow-md flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${i < rev.rating ? 'fill-amber-500 text-amber-500' : 'text-stone-300'}`}
                            />
                          ))}
                        </div>
                        {rev.verified && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Achat Vérifié</span>
                          </span>
                        )}
                      </div>

                      <div className="relative">
                        <Quote className="w-6 h-6 text-stone-200 absolute -top-2 -left-2 rotate-180 -z-10" />
                        <p className="text-xs text-stone-700 leading-relaxed italic font-medium pt-1">
                          "{rev.comment}"
                        </p>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-stone-200 space-y-2">
                      <div className="flex items-center justify-between text-stone-500 text-[10px]">
                        <span className="bg-amber-50 text-amber-900 font-bold px-2 py-0.5 rounded-md border border-amber-200 truncate max-w-[180px]">
                          📦 {rev.product}
                        </span>
                        <span className="font-medium text-stone-400">{rev.date}</span>
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <div>
                          <p className="text-xs font-serif-title font-bold text-stone-900">{rev.author}</p>
                          <p className="text-[10px] text-stone-500 font-normal flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-amber-600 shrink-0" />
                            <span>{rev.location}</span>
                            {rev.role && <span className="text-stone-400"> • {rev.role}</span>}
                          </p>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-amber-100 border border-amber-200 text-amber-900 flex items-center justify-center font-bold text-xs uppercase shrink-0">
                          {rev.author.substring(0, 2)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Call To Action Banner */}
      <section className="bg-white rounded-3xl p-8 sm:p-12 border border-stone-200 shadow-xs text-center space-y-5">
        <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 mx-auto flex items-center justify-center font-bold shadow-xs border border-amber-200">
          <ShoppingBag className="w-6 h-6" />
        </div>

        <h2 className="text-2xl sm:text-4xl font-serif-title font-bold text-ink">
          Prêt à Équiper Votre Passion ?
        </h2>

        <p className="text-xs sm:text-sm text-stone-700 max-w-xl mx-auto font-light leading-relaxed">
          Accédez directement à notre catalogue complet, filtrez par catégorie, consultez les détails de chaque article et commandez en toute sécurité.
        </p>

        <div className="pt-2">
          <button
            onClick={() => setActivePage('boutique')}
            className="px-8 py-3.5 rounded-full bg-stone-900 hover:bg-stone-800 text-white font-black text-xs sm:text-sm uppercase tracking-wider shadow-lg transition-all transform hover:-translate-y-0.5 inline-flex items-center gap-2 cursor-pointer active:scale-95"
          >
            <Store className="w-4 h-4 text-white" />
            <span>Voir Tous Les Produits En Boutique</span>
            <ArrowRight className="w-4 h-4 text-white" />
          </button>
        </div>
      </section>

      {/* Auth Check Modal */}
      <AuthPromptModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        message={authModalMessage}
      />

      {/* ADD REVIEW MODAL */}
      {showAddReviewModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-5 border border-stone-200 shadow-2xl relative animate-scaleUp">
            <button
              onClick={() => setShowAddReviewModal(false)}
              className="absolute right-5 top-5 p-2 rounded-full hover:bg-stone-100 text-stone-500 transition-all cursor-pointer font-bold text-sm"
            >
              ✕
            </button>

            <div className="space-y-1 pr-8">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-700 block">
                DONALDSON SHOP Témoignage
              </span>
              <h3 className="font-serif-title font-bold text-xl text-stone-900 flex items-center gap-2">
                <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
                Donner votre Avis Client
              </h3>
              <p className="text-xs text-stone-500 font-light">
                Partagez votre expérience d'achat et la qualité de vos équipements sportifs.
              </p>
            </div>

            <form onSubmit={handleAddReviewSubmit} className="space-y-4 pt-2">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Note Globale (sur 5 étoiles)
                </label>
                <div className="flex items-center gap-2 bg-stone-50 p-3 rounded-xl border border-stone-200">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setNewRating(star)}
                      className="p-1 cursor-pointer transition-transform hover:scale-110 active:scale-95"
                    >
                      <Star
                        className={`w-6 h-6 ${star <= newRating ? 'fill-amber-400 text-amber-400' : 'text-stone-300'}`}
                      />
                    </button>
                  ))}
                  <span className="text-xs font-bold text-amber-700 ml-2">
                    {newRating}/5
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Votre Nom & Prénom *
                  </label>
                  <input
                    type="text"
                    required
                    value={newAuthor}
                    onChange={(e) => setNewAuthor(e.target.value)}
                    placeholder="Ex: Paul Mensah"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs font-medium focus:border-amber-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Votre Ville / Quartier
                  </label>
                  <input
                    type="text"
                    value={newLocation}
                    onChange={(e) => setNewLocation(e.target.value)}
                    placeholder="Ex: Lomé (Agoè)"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs font-medium focus:border-amber-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Article Acheté (optionnel)
                </label>
                <input
                  type="text"
                  value={newProduct}
                  onChange={(e) => setNewProduct(e.target.value)}
                  placeholder="Ex: Crampons Nike Mercurial, Maillot Togo..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs font-medium focus:border-amber-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Votre Avis / Commentaire *
                </label>
                <textarea
                  required
                  rows={3}
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Racontez votre expérience : vitesse de livraison, qualité du produit, accueil..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs font-medium focus:border-amber-500 outline-none resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setShowAddReviewModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold transition-all cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-stone-900 text-amber-400 border border-amber-400/40 text-xs font-extrabold hover:bg-stone-800 transition-all shadow-md flex items-center gap-2 cursor-pointer"
                >
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span>Publier mon Avis</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

