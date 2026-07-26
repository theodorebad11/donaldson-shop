import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Product } from '../types';
import { formatFCFA, WHATSAPP_NUMBERS } from '../data/initialData';
import { Search, Filter, ShoppingBag, Eye, PhoneCall, Sparkles, Tag, CheckCircle2, Lock } from 'lucide-react';
import heroBgImage from '../assets/images/soccer_hero_bg_1785003468850.jpg';
import { AuthPromptModal } from './AuthPromptModal';

export const ShopCatalog: React.FC = () => {
  const { products, categories, addToCart, setSelectedProduct, setActivePage, currentUser } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('TOUS');
  const [sortOrder, setSortOrder] = useState<'default' | 'price_asc' | 'price_desc'>('default');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authModalMessage, setAuthModalMessage] = useState('');

  // Filter products
  const filteredProducts = products.filter(p => {
    const matchesCategory = selectedCategory === 'TOUS' || p.category.toLowerCase() === selectedCategory.toLowerCase();
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  }).sort((a, b) => {
    if (sortOrder === 'price_asc') return a.priceFCFA - b.priceFCFA;
    if (sortOrder === 'price_desc') return b.priceFCFA - a.priceFCFA;
    return 0;
  });

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
      setAuthModalMessage("Pour ajouter cet article à votre panier, vous devez obligatoirement vous connecter ou créer un compte.");
      setShowAuthModal(true);
      return;
    }
    addToCart(product);
  };

  const handleWhatsAppOrderDirect = (product: Product) => {
    if (!currentUser) {
      setAuthModalMessage("Pour commander cet article sur WhatsApp, vous devez obligatoirement vous connecter ou créer un compte.");
      setShowAuthModal(true);
      return;
    }
    const message = encodeURIComponent(`Bonjour DONALDSON SHOP ! Je souhaite commander l'article : ${product.name} (${formatFCFA(product.priceFCFA)}). Merci de me donner le tarif de ma livraison selon ma zone.`);
    window.open(`https://wa.me/${WHATSAPP_NUMBERS[0].raw}?text=${message}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="space-y-10 pb-16">
      
      {/* Hero Section - Editorial Sports Background */}
      <section className="relative rounded-3xl overflow-hidden text-white p-6 sm:p-12 shadow-2xl border border-gold/30 min-h-[400px] sm:min-h-[500px] flex items-end sm:items-center">
        {/* Background Image - Clean & Clearly Visible */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-700 hover:scale-105"
          style={{ backgroundImage: `url(${heroBgImage})` }}
        />
        
        {/* Soft Vignette Overlay so image is clear and text stays readable */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/20 sm:bg-gradient-to-r sm:from-black/80 sm:via-black/35 sm:to-transparent" />
        
        <div className="relative z-10 max-w-2xl space-y-4 p-4 sm:p-6 bg-black/40 sm:bg-black/30 backdrop-blur-md rounded-2xl border border-white/10 shadow-xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-gold/25 text-gold border border-gold/60 text-xs font-bold uppercase tracking-widest backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-gold" />
            Équipements & Articles de Sport Pro
          </div>
          
          <h1 className="text-3xl sm:text-5xl font-serif-title font-black tracking-tight leading-tight text-white drop-shadow-lg">
            DONALDSON <span className="text-gold italic font-editorial">SHOP</span>
          </h1>
          
          <p className="text-stone-100 text-sm sm:text-base leading-relaxed font-normal drop-shadow-md">
            Collection haute performance d'équipements sportifs, maillots officiels, crampons pro et accessoires ultra élégants.
          </p>
        </div>
      </section>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 sm:p-6 rounded-3xl shadow-xs border border-stone-200 space-y-4">
        
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Search Box */}
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher maillot, crampon, ballon..."
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-stone-200 focus:border-gold focus:ring-2 focus:ring-amber-100 text-sm outline-none transition-all"
            />
          </div>

          {/* Sort selector */}
          <div className="flex items-center gap-3 w-full md:w-auto justify-end">
            <span className="text-xs font-bold text-stone-600 flex items-center gap-1 uppercase tracking-wider">
              <Filter className="w-3.5 h-3.5 text-gold-dark" />
              Trier par :
            </span>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as any)}
              className="px-3 py-2 rounded-xl border border-stone-200 text-xs font-semibold text-stone-800 outline-none focus:border-gold"
            >
              <option value="default">Récent / Vedettes</option>
              <option value="price_asc">Prix : Croissant</option>
              <option value="price_desc">Prix : Décroissant</option>
            </select>
          </div>
        </div>

        {/* Dynamic Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pt-2 pb-1 no-scrollbar">
          <button
            onClick={() => setSelectedCategory('TOUS')}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold uppercase tracking-wider whitespace-nowrap transition-all ${
              selectedCategory === 'TOUS'
                ? 'bg-ink text-gold border border-gold/40 shadow-xs'
                : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
            }`}
          >
            Tous les articles ({products.length})
          </button>

          {categories.map((cat) => {
            const count = products.filter(p => p.category.toLowerCase() === cat.toLowerCase()).length;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-extrabold uppercase tracking-wider whitespace-nowrap transition-all ${
                  selectedCategory.toLowerCase() === cat.toLowerCase()
                    ? 'bg-ink text-gold border border-gold/40 shadow-xs'
                    : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                }`}
              >
                {cat} ({count})
              </button>
            );
          })}
        </div>

      </div>

      {/* Catalog Grid */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-serif-title font-bold text-ink tracking-tight flex items-center gap-2">
            <span>Catalogue d'Articles Sportifs</span>
            <span className="text-xs bg-amber-50 text-gold-dark border border-gold/30 font-bold px-3 py-0.5 rounded-full">
              {filteredProducts.length} disponible(s)
            </span>
          </h2>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-stone-200 p-8 space-y-3">
            <Tag className="w-12 h-12 text-stone-300 mx-auto" />
            <h3 className="text-lg font-bold text-ink font-serif-title">Aucun article trouvé</h3>
            <p className="text-xs text-stone-500 max-w-md mx-auto">
              Aucun produit ne correspond à votre recherche "{searchQuery}". Essayez une autre catégorie ou réinitialisez vos filtres.
            </p>
            <button
              onClick={() => { setSearchQuery(''); setSelectedCategory('TOUS'); }}
              className="mt-2 px-5 py-2.5 rounded-xl bg-ink text-gold font-bold text-xs border border-gold/40"
            >
              Voir tous les articles
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-3xl border border-stone-200 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden group hover:border-gold/50"
              >
                
                {/* Image Container */}
                <div className="relative h-64 bg-stone-100 overflow-hidden">
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    referrerPolicy="no-referrer"
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

                  {/* Quick detail hover button */}
                  <button
                    onClick={() => handleProductSelect(product)}
                    className="absolute top-3 right-3 p-2 rounded-full bg-white/90 text-stone-800 hover:text-gold-dark hover:bg-white transition-all shadow-md"
                    title="Aperçu rapide"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
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
                      className="w-full py-2.5 px-3 rounded-xl bg-ink hover:bg-stone-900 text-gold text-xs font-bold transition-all flex items-center justify-center gap-2 border border-gold/30 shadow-xs"
                    >
                      <ShoppingBag className="w-4 h-4" />
                      Ajouter au Panier
                    </button>

                    <button
                      onClick={() => handleWhatsAppOrderDirect(product)}
                      className="w-full py-2 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-900 text-xs font-bold border border-emerald-200 transition-all flex items-center justify-center gap-1.5"
                    >
                      <PhoneCall className="w-3.5 h-3.5 text-emerald-700" />
                      Commander via WhatsApp
                    </button>
                  </div>

                </div>

              </div>
            ))}
          </div>
        )}

      </div>

      {/* Mandatory Auth Prompt Modal for unauthenticated visitors */}
      <AuthPromptModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        message={authModalMessage}
      />

    </div>
  );
};
