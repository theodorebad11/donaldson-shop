import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import logoImg from '../assets/images/donaldson_shop_logo_1786794643658.jpg';
import {
  ShoppingBag,
  User as UserIcon,
  Bell,
  LogOut,
  ShieldCheck,
  Menu,
  X,
  Megaphone,
  HelpCircle,
  PackageCheck,
  MessageSquare,
  Sparkles,
  LogIn,
  UserPlus,
  Home,
  Store,
  Heart,
  Trash2,
  CheckSquare,
  Square,
  CheckCheck
} from 'lucide-react';
import { SUPER_ADMIN_EMAIL } from '../data/initialData';

export const Navbar: React.FC = () => {
  const {
    currentUser,
    cart,
    wishlistIds,
    notifications,
    activePage,
    setActivePage,
    logoutUser,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    deleteNotification,
    deleteMultipleNotifications,
    clearAllNotifications,
    getGuestDeviceId,
    isAdmin
  } = useApp();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [selectedNotifIds, setSelectedNotifIds] = useState<string[]>([]);

  const notifContainerRef = useRef<HTMLDivElement>(null);
  const notifMobileRef = useRef<HTMLDivElement>(null);

  const activeUserId = currentUser?.id || getGuestDeviceId();

  const userNotifs = notifications.filter(n => {
    return n.targetUserId === 'ALL' || n.targetUserId === activeUserId;
  });

  const unreadNotifs = userNotifs.filter(n => !n.readBy.includes(activeUserId));
  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  // Gentle bounce effect on cart icon when items are added
  const [isCartBouncing, setIsCartBouncing] = useState(false);
  const prevCartCountRef = useRef(cartCount);

  useEffect(() => {
    if (cartCount > prevCartCountRef.current) {
      setIsCartBouncing(true);
      const timer = setTimeout(() => {
        setIsCartBouncing(false);
      }, 1000);
      return () => clearTimeout(timer);
    }
    prevCartCountRef.current = cartCount;
  }, [cartCount]);

  // Automatically mark all notifications as read when opening or closing notification panel
  useEffect(() => {
    if (notifDropdownOpen) {
      markAllNotificationsAsRead();
    }
  }, [notifDropdownOpen]);

  useEffect(() => {
    if (!notifDropdownOpen) return;

    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node;
      const isDesktopInside = notifContainerRef.current && notifContainerRef.current.contains(target);
      const isMobileInside = notifMobileRef.current && notifMobileRef.current.contains(target);

      if (!isDesktopInside && !isMobileInside) {
        setNotifDropdownOpen(false);
        markAllNotificationsAsRead();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [notifDropdownOpen]);

  const toggleNotifDropdown = () => {
    const nextState = !notifDropdownOpen;
    setNotifDropdownOpen(nextState);
    markAllNotificationsAsRead();
  };

  const toggleSelectNotif = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedNotifIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAllNotifs = () => {
    if (selectedNotifIds.length === userNotifs.length) {
      setSelectedNotifIds([]);
    } else {
      setSelectedNotifIds(userNotifs.map(n => n.id));
    }
  };

  const handleDeleteSelectedNotifs = () => {
    if (selectedNotifIds.length === 0) return;
    deleteMultipleNotifications(selectedNotifIds);
    setSelectedNotifIds([]);
  };

  const handleClearAllNotifs = () => {
    clearAllNotifications();
    setSelectedNotifIds([]);
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-[#FDFCFB]/90 backdrop-blur-md border-b border-stone-200/80 shadow-xs max-w-full overflow-x-clip">
        <div className="max-w-7xl mx-auto px-2.5 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20 gap-1 sm:gap-4">
            
            {/* Logo Brand */}
            <div
              onClick={() => setActivePage('accueil')}
              className="flex items-center gap-1.5 sm:gap-3 cursor-pointer group min-w-0 shrink flex-1 xs:flex-initial"
            >
              <img
                src={logoImg}
                alt="DONALDSON SHOP Logo"
                referrerPolicy="no-referrer"
                className="h-8 xs:h-9 sm:h-11 w-auto object-contain rounded-xl shadow-xs border border-stone-200/80 group-hover:scale-105 transition-transform bg-white p-0.5 shrink-0"
              />
              <div className="flex flex-col justify-center min-w-0 overflow-hidden">
                <span className="text-xs xs:text-sm sm:text-xl lg:text-2xl font-serif-title font-extrabold tracking-tight text-ink group-hover:text-gold-dark transition-colors whitespace-nowrap leading-tight block truncate">
                  DONALDSON <span className="text-gold italic font-editorial">SHOP</span>
                </span>
                <p className="hidden lg:block text-[10px] font-medium tracking-wider text-stone-500 uppercase mt-0.5 whitespace-nowrap overflow-hidden text-ellipsis">
                  Équipements Sportifs Pro & Articles Haut de Gamme
                </p>
              </div>
            </div>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-2 font-medium text-stone-700 text-xs tracking-wider uppercase">
              <button
                onClick={() => setActivePage('accueil')}
                className={`px-4 py-2.5 rounded-full flex items-center gap-1.5 transition-all ${
                  activePage === 'accueil'
                    ? 'bg-stone-900 text-white font-extrabold shadow-md'
                    : 'hover:bg-stone-100 text-stone-800'
                }`}
              >
                <Home className="w-3.5 h-3.5" />
                Accueil
              </button>

              <button
                onClick={() => setActivePage('boutique')}
                className={`px-4 py-2.5 rounded-full flex items-center gap-1.5 transition-all ${
                  activePage === 'boutique' || activePage === 'shop'
                    ? 'bg-stone-900 text-white font-extrabold shadow-md'
                    : 'hover:bg-stone-100 text-stone-800'
                }`}
              >
                <Store className="w-3.5 h-3.5" />
                Boutique
              </button>

              <button
                onClick={() => setActivePage('annonces')}
                className={`px-4 py-2.5 rounded-full flex items-center gap-1.5 transition-all ${
                  activePage === 'annonces'
                    ? 'bg-stone-900 text-white font-extrabold shadow-md'
                    : 'hover:bg-stone-100 text-stone-800'
                }`}
              >
                <Megaphone className="w-3.5 h-3.5" />
                Annonces
              </button>

              <button
                onClick={() => setActivePage('aide')}
                className={`px-4 py-2.5 rounded-full flex items-center gap-1.5 transition-all ${
                  activePage === 'aide'
                    ? 'bg-stone-900 text-white font-extrabold shadow-md'
                    : 'hover:bg-stone-100 text-stone-800'
                }`}
              >
                <HelpCircle className="w-3.5 h-3.5" />
                Aide & Contact
              </button>

              <button
                onClick={() => setActivePage('orders')}
                className={`px-4 py-2.5 rounded-full flex items-center gap-1.5 transition-all ${
                  activePage === 'orders'
                    ? 'bg-stone-900 text-white font-extrabold shadow-md'
                    : 'hover:bg-stone-100 text-stone-800'
                }`}
              >
                <PackageCheck className="w-3.5 h-3.5" />
                Suivi & Commandes
              </button>
            </nav>

            {/* Desktop Right Controls */}
            <div className="hidden md:flex items-center gap-2 sm:gap-3">
              
              {/* Prominent Espace Admin Button for Super Admin & Assistant Admin */}
              {isAdmin && (
                <button
                  onClick={() => setActivePage('admin')}
                  className={`px-4 py-2 rounded-full border transition-all flex items-center gap-2 cursor-pointer ${
                    activePage === 'admin'
                      ? 'bg-stone-900 text-white border-stone-900 font-black shadow-md scale-102'
                      : 'bg-stone-100 text-stone-900 border-stone-300 hover:bg-stone-200 font-extrabold shadow-xs hover:shadow-md'
                  }`}
                  title="Accéder à l'Espace Administration"
                >
                  <ShieldCheck className={`w-4 h-4 shrink-0 ${activePage === 'admin' ? 'text-white' : 'text-stone-800'}`} />
                  <div className="text-left leading-tight">
                    <span className={`text-xs font-black block tracking-tight ${activePage === 'admin' ? 'text-white' : 'text-stone-900'}`}>
                      Espace Admin
                    </span>
                  </div>
                </button>
              )}

              {/* AI Assistant Chat Button */}
              <button
                onClick={() => setActivePage('chat')}
                className={`p-2.5 rounded-full relative transition-all ${
                  activePage === 'chat'
                    ? 'bg-ink text-gold border border-gold/50 shadow-md'
                    : 'bg-stone-100 text-stone-800 hover:bg-stone-200'
                }`}
                title="Chat & Support Client"
              >
                <MessageSquare className="w-4 h-4" />
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-gold"></span>
                </span>
              </button>

              {/* Favoris / Wishlist Icon */}
              <button
                onClick={() => setActivePage('boutique')}
                className="p-2.5 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-800 relative transition-all border border-stone-200/60"
                title="Mes Favoris"
              >
                <Heart className={`w-4 h-4 ${wishlistIds.length > 0 ? 'text-rose-500 fill-rose-500' : ''}`} />
                {wishlistIds.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-rose-600 text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                    {wishlistIds.length}
                  </span>
                )}
              </button>

              {/* Cart Icon */}
              <button
                onClick={() => setActivePage('cart')}
                className={`p-2.5 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-800 relative transition-all border border-stone-200/60 cursor-pointer ${
                  isCartBouncing ? 'animate-bounce ring-2 ring-amber-400 bg-amber-50' : ''
                }`}
                title="Mon Panier"
              >
                <ShoppingBag className={`w-4 h-4 transition-transform ${isCartBouncing ? 'scale-125 text-amber-600' : ''}`} />
                {cartCount > 0 && (
                  <span className={`absolute -top-1 -right-1 bg-gold text-ink text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center shadow-xs transition-transform ${
                    isCartBouncing ? 'scale-125 bg-amber-500 text-stone-950 font-black' : ''
                  }`}>
                    {cartCount}
                  </span>
                )}
              </button>

              {/* Notifications Bell */}
              <div ref={notifContainerRef} className="relative">
                <button
                  onClick={toggleNotifDropdown}
                  className="p-2.5 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-800 relative transition-all border border-stone-200/60 cursor-pointer"
                  title="Notifications"
                >
                  <Bell className="w-4 h-4" />
                  {unreadNotifs.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-rose-600 text-white text-[10px] font-extrabold px-1.5 min-w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                      {unreadNotifs.length}
                    </span>
                  )}
                </button>

                {/* Notifications Dropdown */}
                {notifDropdownOpen && (
                  <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white rounded-3xl shadow-2xl border border-stone-200 p-4 z-50 animate-fadeIn space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-stone-100">
                      <h4 className="font-serif-title font-bold text-ink flex items-center gap-2 text-sm">
                        <Bell className="w-4 h-4 text-gold" />
                        <span>Notifications ({userNotifs.length})</span>
                      </h4>
                      <button
                        onClick={toggleNotifDropdown}
                        className="p-1 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Selection Toolbar */}
                    {userNotifs.length > 0 && (
                      <div className="flex items-center justify-between gap-2 p-2 rounded-xl bg-stone-50 border border-stone-200/80 text-[11px]">
                        <button
                          type="button"
                          onClick={toggleSelectAllNotifs}
                          className="flex items-center gap-1.5 font-bold text-stone-700 hover:text-ink cursor-pointer"
                        >
                          {selectedNotifIds.length === userNotifs.length && userNotifs.length > 0 ? (
                            <CheckSquare className="w-3.5 h-3.5 text-gold-dark" />
                          ) : (
                            <Square className="w-3.5 h-3.5 text-stone-400" />
                          )}
                          <span>{selectedNotifIds.length === userNotifs.length ? 'Désélectionner' : 'Tout sélectionner'}</span>
                        </button>

                        <div className="flex items-center gap-1.5">
                          {selectedNotifIds.length > 0 && (
                            <button
                              type="button"
                              onClick={handleDeleteSelectedNotifs}
                              className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-black text-[10px] flex items-center gap-1 transition-all cursor-pointer shadow-2xs"
                              title="Supprimer la sélection"
                            >
                              <Trash2 className="w-3 h-3" />
                              <span>Supprimer ({selectedNotifIds.length})</span>
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={handleClearAllNotifs}
                            className="px-2 py-1 rounded-lg bg-stone-200 hover:bg-rose-100 hover:text-rose-700 text-stone-700 font-bold text-[10px] flex items-center gap-1 transition-all cursor-pointer"
                            title="Tout effacer"
                          >
                            <Trash2 className="w-3 h-3" />
                            <span>Tout vider</span>
                          </button>
                        </div>
                      </div>
                    )}

                    <div className="max-h-64 overflow-y-auto space-y-2 pr-1">
                      {userNotifs.length === 0 ? (
                        <p className="text-xs text-stone-500 py-6 text-center">
                          Aucune notification pour le moment.
                        </p>
                      ) : (
                        userNotifs.map(notif => {
                          const isRead = notif.readBy.includes(activeUserId);
                          const isSelected = selectedNotifIds.includes(notif.id);

                          return (
                            <div
                              key={notif.id}
                              onClick={() => markNotificationAsRead(notif.id)}
                              className={`p-3 rounded-2xl border text-xs transition-all relative group flex gap-2.5 items-start ${
                                isSelected
                                  ? 'bg-amber-100/90 border-amber-400 font-medium shadow-xs'
                                  : isRead
                                    ? 'bg-stone-50 border-stone-200 text-stone-600'
                                    : 'bg-amber-50/90 border-gold/40 text-ink font-semibold shadow-2xs'
                              }`}
                            >
                              <button
                                type="button"
                                onClick={(e) => toggleSelectNotif(notif.id, e)}
                                className="mt-0.5 text-stone-400 hover:text-gold-dark cursor-pointer shrink-0"
                              >
                                {isSelected ? (
                                  <CheckSquare className="w-4 h-4 text-gold-dark" />
                                ) : (
                                  <Square className="w-4 h-4 text-stone-300" />
                                )}
                              </button>

                              <div className="flex-1 space-y-1">
                                <div className="flex items-center justify-between gap-1">
                                  <span className="font-bold text-ink">{notif.title}</span>
                                  <span className="text-[10px] text-stone-400 font-mono shrink-0">
                                    {new Date(notif.createdAt).toLocaleDateString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                                  </span>
                                </div>
                                <p className="leading-relaxed text-[11px] text-stone-700">{notif.message}</p>
                              </div>

                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteNotification(notif.id);
                                }}
                                className="p-1 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition-colors opacity-70 group-hover:opacity-100 shrink-0 cursor-pointer"
                                title="Supprimer cette notification"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* User Profile / Auth */}
              {currentUser ? (
                <div className="flex items-center border-l border-stone-200 pl-2 sm:pl-3">
                  <button
                    onClick={() => setActivePage('account')}
                    className="p-1 rounded-full hover:ring-2 hover:ring-gold/60 transition-all flex items-center justify-center bg-ink text-gold border border-gold/40 shadow-xs group"
                    title={`Mon Compte (${currentUser.firstName})`}
                  >
                    <div className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center font-serif-title font-bold text-xs shrink-0">
                      {currentUser.avatarUrl ? (
                        <img src={currentUser.avatarUrl} alt={currentUser.firstName} className="w-full h-full object-cover" />
                      ) : (
                        <UserIcon className="w-4 h-4 text-gold group-hover:scale-110 transition-transform" />
                      )}
                    </div>
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2 border-l border-stone-200 pl-2 sm:pl-3">
                  <button
                    onClick={() => setActivePage('login')}
                    className="px-5 py-2.5 rounded-full text-xs sm:text-sm font-extrabold bg-stone-900 hover:bg-stone-800 text-white shadow-md transition-all cursor-pointer flex items-center gap-2 active:scale-95"
                  >
                    <UserIcon className="w-4 h-4 text-white" />
                    <span>Connexion</span>
                  </button>
                  <button
                    onClick={() => setActivePage('register')}
                    className="px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold border-2 border-stone-800 text-stone-900 hover:bg-stone-100 transition-all cursor-pointer flex items-center gap-2 active:scale-95"
                  >
                    <UserPlus className="w-4 h-4 text-stone-900" />
                    <span>S'inscrire</span>
                  </button>
                </div>
              )}

            </div>

            {/* Mobile Header Quick Controls & 3 Traits Menu Toggle */}
            <div className="md:hidden flex items-center gap-1 xs:gap-1.5 shrink-0 max-w-full">
              {/* Espace Admin Button for Mobile Header */}
              {isAdmin && (
                <button
                  onClick={() => setActivePage('admin')}
                  className={`px-1.5 py-1.5 rounded-xl border border-stone-900 transition-all flex items-center gap-1 shrink-0 ${
                    activePage === 'admin'
                      ? 'bg-gold text-ink font-black shadow-md'
                      : 'bg-[#FAF6ED] text-stone-900 font-extrabold hover:bg-amber-100 shadow-xs'
                  }`}
                  title="Espace Administration"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-stone-900 shrink-0" />
                  <span className="text-[10px] font-black text-stone-900 leading-tight hidden xs:inline">
                    Admin
                  </span>
                </button>
              )}

              {/* Chat */}
              <button
                onClick={() => setActivePage('chat')}
                className={`p-1.5 xs:p-2 rounded-xl relative transition-all shrink-0 ${
                  activePage === 'chat'
                    ? 'bg-ink text-gold border border-gold/50 shadow-md'
                    : 'bg-stone-100 text-stone-800'
                }`}
                title="Chat DONALDSON"
              >
                <MessageSquare className="w-4 h-4 xs:w-5 xs:h-5 text-ink" />
                <span className="absolute -top-1 -right-1 flex h-2 w-2 xs:h-2.5 xs:w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 xs:h-2.5 xs:w-2.5 bg-gold"></span>
                </span>
              </button>

              {/* Cart */}
              <button
                onClick={() => setActivePage('cart')}
                className={`p-1.5 xs:p-2 rounded-xl bg-stone-100 text-stone-800 relative cursor-pointer transition-all shrink-0 ${
                  isCartBouncing ? 'animate-bounce ring-2 ring-amber-400 bg-amber-50' : ''
                }`}
                title="Panier"
              >
                <ShoppingBag className={`w-4 h-4 xs:w-5 xs:h-5 text-ink transition-transform ${isCartBouncing ? 'scale-125 text-amber-600' : ''}`} />
                {cartCount > 0 && (
                  <span className={`absolute -top-1 -right-1 bg-gold text-ink text-[9px] xs:text-[10px] font-black w-3.5 h-3.5 xs:w-4 xs:h-4 rounded-full flex items-center justify-center transition-transform ${
                    isCartBouncing ? 'scale-125 bg-amber-500 text-stone-950 font-black' : ''
                  }`}>
                    {cartCount}
                  </span>
                )}
              </button>

              {/* Notifications */}
              <button
                onClick={toggleNotifDropdown}
                className="p-1.5 xs:p-2 rounded-xl bg-stone-100 text-stone-800 relative cursor-pointer shrink-0"
                title="Notifications"
              >
                <Bell className="w-4 h-4 xs:w-5 xs:h-5 text-ink" />
                {unreadNotifs.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-rose-600 text-white text-[9px] xs:text-[10px] font-bold w-3.5 h-3.5 xs:w-4 xs:h-4 rounded-full flex items-center justify-center">
                    {unreadNotifs.length}
                  </span>
                )}
              </button>

              {/* 3 Traits Hamburger Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 xs:p-2.5 rounded-xl bg-ink text-gold border border-gold/40 shadow-sm flex items-center justify-center shrink-0 cursor-pointer"
                title="Menu Navigation"
              >
                {mobileMenuOpen ? <X className="w-4 h-4 xs:w-5 xs:h-5" /> : <Menu className="w-4 h-4 xs:w-5 xs:h-5" />}
              </button>
            </div>

          </div>
        </div>

        {/* Mobile Drawer Menu (3 traits expanded) */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-stone-200 bg-[#FDFCFB] px-4 py-4 space-y-2 max-h-[70vh] overflow-y-auto shadow-2xl animate-fadeIn">
            <button
              onClick={() => { setActivePage('accueil'); setMobileMenuOpen(false); }}
              className={`w-full text-left px-4 py-3 rounded-xl font-bold text-xs tracking-wider uppercase flex items-center gap-2 ${
                activePage === 'accueil' ? 'bg-ink text-gold font-bold' : 'text-stone-800 bg-stone-100'
              }`}
            >
              <Home className="w-4 h-4 text-gold" />
              <span>🏠 Accueil Shop</span>
            </button>

            <button
              onClick={() => { setActivePage('boutique'); setMobileMenuOpen(false); }}
              className={`w-full text-left px-4 py-3 rounded-xl font-bold text-xs tracking-wider uppercase flex items-center gap-2 ${
                activePage === 'boutique' || activePage === 'shop' ? 'bg-ink text-gold font-bold' : 'text-stone-800 bg-stone-100'
              }`}
            >
              <Store className="w-4 h-4 text-gold" />
              <span>🛍️ Boutique Articles</span>
            </button>

            <button
              onClick={() => { setActivePage('account'); setMobileMenuOpen(false); }}
              className={`w-full text-left px-4 py-3 rounded-xl font-bold text-xs tracking-wider uppercase flex items-center justify-between ${
                activePage === 'account' ? 'bg-ink text-gold' : 'bg-stone-100 text-stone-900'
              }`}
            >
              <div className="flex items-center gap-2">
                <UserIcon className="w-4 h-4 text-gold" />
                <span>Mon Compte & Profil</span>
              </div>
              {currentUser?.avatarUrl && (
                <img src={currentUser.avatarUrl} alt="Avatar" className="w-6 h-6 rounded-full object-cover border border-gold/50" />
              )}
            </button>
            
            <button
              onClick={() => { setActivePage('annonces'); setMobileMenuOpen(false); }}
              className={`w-full text-left px-4 py-3 rounded-xl font-bold text-xs tracking-wider uppercase flex items-center gap-2 ${
                activePage === 'annonces' ? 'bg-ink text-gold font-bold' : 'text-stone-800 bg-stone-100'
              }`}
            >
              <Megaphone className="w-4 h-4 text-gold" />
              📢 Annonces Officielles
            </button>

            <button
              onClick={() => { setActivePage('aide'); setMobileMenuOpen(false); }}
              className={`w-full text-left px-4 py-3 rounded-xl font-bold text-xs tracking-wider uppercase flex items-center gap-2 ${
                activePage === 'aide' ? 'bg-ink text-gold' : 'text-stone-800 bg-stone-100'
              }`}
            >
              <HelpCircle className="w-4 h-4 text-gold" />
              ❓ Aide & Contacts
            </button>

            <button
              onClick={() => { setActivePage('orders'); setMobileMenuOpen(false); }}
              className={`w-full text-left px-4 py-3 rounded-xl font-bold text-xs tracking-wider uppercase flex items-center gap-2 ${
                activePage === 'orders' ? 'bg-ink text-gold' : 'text-stone-800 bg-stone-100'
              }`}
            >
              <PackageCheck className="w-4 h-4 text-gold" />
              🔍 Suivi & Commandes
            </button>

            {isAdmin && (
              <button
                onClick={() => { setActivePage('admin'); setMobileMenuOpen(false); }}
                className="w-full text-left px-4 py-3 rounded-xl font-black text-xs tracking-wider uppercase bg-gold text-ink flex items-center gap-2 border border-ink/20 shadow-md"
              >
                <ShieldCheck className="w-4 h-4" />
                👑 Espace Administration
              </button>
            )}

            {/* Auth / Connexion / Inscription / Déconnexion in 3 Traits Menu */}
            {currentUser ? (
              <div className="pt-2 border-t border-stone-200/80">
                <button
                  onClick={() => {
                    logoutUser();
                    setMobileMenuOpen(false);
                    setActivePage('shop');
                  }}
                  className="w-full text-left px-4 py-3 rounded-xl font-extrabold text-xs tracking-wider uppercase text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 flex items-center gap-2 transition-all shadow-xs"
                >
                  <LogOut className="w-4 h-4 text-rose-600" />
                  <span>Déconnexion ({currentUser.firstName})</span>
                </button>
              </div>
            ) : (
              <div className="pt-2 border-t border-stone-200/80 grid grid-cols-2 gap-2">
                <button
                  onClick={() => { setActivePage('login'); setMobileMenuOpen(false); }}
                  className="py-3 px-3 rounded-xl font-bold text-xs uppercase bg-stone-800 text-white hover:bg-stone-900 text-center transition-all flex items-center justify-center gap-1.5"
                >
                  <LogIn className="w-4 h-4 text-gold" />
                  <span>Connexion</span>
                </button>
                <button
                  onClick={() => { setActivePage('register'); setMobileMenuOpen(false); }}
                  className="py-3 px-3 rounded-xl font-bold text-xs uppercase bg-ink text-gold border border-gold/40 hover:bg-stone-900 text-center transition-all flex items-center justify-center gap-1.5 shadow-md"
                >
                  <UserPlus className="w-4 h-4 text-gold" />
                  <span>S'inscrire</span>
                </button>
              </div>
            )}
          </div>
        )}
      </header>

      {/* Notifications Popover Modal for Mobile when triggered from bottom bar */}
      {notifDropdownOpen && (
        <div 
          onClick={() => {
            setNotifDropdownOpen(false);
            markAllNotificationsAsRead();
          }}
          className="fixed inset-0 z-50 md:hidden flex items-end sm:items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs"
        >
          <div 
            ref={notifMobileRef}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl w-full max-w-md p-5 shadow-2xl border border-stone-200 space-y-3 mb-16 sm:mb-0"
          >
            <div className="flex items-center justify-between pb-2 border-b border-stone-100">
              <h4 className="font-serif-title font-bold text-ink flex items-center gap-2 text-sm">
                <Bell className="w-4 h-4 text-gold" />
                <span>Notifications ({userNotifs.length})</span>
              </h4>
              <button
                onClick={() => {
                  setNotifDropdownOpen(false);
                  markAllNotificationsAsRead();
                }}
                className="p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Selection Toolbar */}
            {userNotifs.length > 0 && (
              <div className="flex items-center justify-between gap-2 p-2 rounded-xl bg-stone-50 border border-stone-200/80 text-[11px]">
                <button
                  type="button"
                  onClick={toggleSelectAllNotifs}
                  className="flex items-center gap-1.5 font-bold text-stone-700 hover:text-ink cursor-pointer"
                >
                  {selectedNotifIds.length === userNotifs.length && userNotifs.length > 0 ? (
                    <CheckSquare className="w-3.5 h-3.5 text-gold-dark" />
                  ) : (
                    <Square className="w-3.5 h-3.5 text-stone-400" />
                  )}
                  <span>{selectedNotifIds.length === userNotifs.length ? 'Désélectionner' : 'Tout sélectionner'}</span>
                </button>

                <div className="flex items-center gap-1.5">
                  {selectedNotifIds.length > 0 && (
                    <button
                      type="button"
                      onClick={handleDeleteSelectedNotifs}
                      className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-black text-[10px] flex items-center gap-1 transition-all cursor-pointer shadow-2xs"
                      title="Supprimer la sélection"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Supprimer ({selectedNotifIds.length})</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={handleClearAllNotifs}
                    className="px-2 py-1 rounded-lg bg-stone-200 hover:bg-rose-100 hover:text-rose-700 text-stone-700 font-bold text-[10px] flex items-center gap-1 transition-all cursor-pointer"
                    title="Tout effacer"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Tout vider</span>
                  </button>
                </div>
              </div>
            )}

            <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
              {userNotifs.length === 0 ? (
                <p className="text-xs text-stone-500 py-6 text-center">Aucune notification pour le moment.</p>
              ) : (
                userNotifs.map(notif => {
                  const isRead = notif.readBy.includes(activeUserId);
                  const isSelected = selectedNotifIds.includes(notif.id);

                  return (
                    <div
                      key={notif.id}
                      onClick={() => markNotificationAsRead(notif.id)}
                      className={`p-3 rounded-2xl border text-xs transition-all relative group flex gap-2.5 items-start ${
                        isSelected
                          ? 'bg-amber-100/90 border-amber-400 font-medium shadow-xs'
                          : isRead
                            ? 'bg-stone-50 border-stone-200 text-stone-600'
                            : 'bg-amber-50/90 border-gold/40 text-ink font-semibold shadow-2xs'
                      }`}
                    >
                      <button
                        type="button"
                        onClick={(e) => toggleSelectNotif(notif.id, e)}
                        className="mt-0.5 text-stone-400 hover:text-gold-dark cursor-pointer shrink-0"
                      >
                        {isSelected ? (
                          <CheckSquare className="w-4 h-4 text-gold-dark" />
                        ) : (
                          <Square className="w-4 h-4 text-stone-300" />
                        )}
                      </button>

                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between gap-1">
                          <span className="font-bold text-ink text-xs">{notif.title}</span>
                          <span className="text-[10px] text-stone-400 font-mono shrink-0">
                            {new Date(notif.createdAt).toLocaleDateString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="leading-relaxed text-[11px] text-stone-700">{notif.message}</p>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteNotification(notif.id);
                        }}
                        className="p-1 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition-colors shrink-0 cursor-pointer"
                        title="Supprimer cette notification"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* FIXED MOBILE STICKY BOTTOM NAVIGATION BAR */}
      {/* Contains: Accueil, Boutique, Panier, Notifs, Compte, Aide */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#121212]/95 backdrop-blur-lg border-t border-gold/30 text-white shadow-2xl md:hidden px-1 py-1.5 flex items-center justify-around text-[9px] font-bold">
        
        {/* 1. Accueil */}
        <button
          onClick={() => {
            setActivePage('accueil');
            setNotifDropdownOpen(false);
          }}
          className={`flex flex-col items-center gap-0.5 p-1 rounded-xl transition-all ${
            activePage === 'accueil' ? 'text-gold font-extrabold bg-white/10' : 'text-stone-300 hover:text-white'
          }`}
        >
          <Home className="w-5 h-5 text-gold" />
          <span>Accueil</span>
        </button>

        {/* 2. Boutique */}
        <button
          onClick={() => {
            setActivePage('boutique');
            setNotifDropdownOpen(false);
          }}
          className={`flex flex-col items-center gap-0.5 p-1 rounded-xl transition-all ${
            activePage === 'boutique' || activePage === 'shop' ? 'text-gold font-extrabold bg-white/10' : 'text-stone-300 hover:text-white'
          }`}
        >
          <Store className="w-5 h-5 text-gold" />
          <span>Boutique</span>
        </button>

        {/* 3. Annonces */}
        <button
          onClick={() => {
            setActivePage('annonces');
            setNotifDropdownOpen(false);
          }}
          className={`flex flex-col items-center gap-0.5 p-1 rounded-xl transition-all ${
            activePage === 'annonces' ? 'text-gold font-extrabold bg-white/10' : 'text-stone-300 hover:text-white'
          }`}
        >
          <Megaphone className="w-5 h-5 text-gold" />
          <span>Annonces</span>
        </button>

        {/* 4. Notifs */}
        <button
          onClick={toggleNotifDropdown}
          className={`flex flex-col items-center gap-0.5 p-1 rounded-xl transition-all ${
            notifDropdownOpen ? 'text-gold font-extrabold bg-white/10' : 'text-stone-300 hover:text-white'
          }`}
        >
          <div className="relative">
            <Bell className="w-5 h-5 text-gold" />
            {unreadNotifs.length > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-rose-600 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center animate-pulse">
                {unreadNotifs.length}
              </span>
            )}
          </div>
          <span>Notifs</span>
        </button>

        {/* 5. Compte */}
        <button
          onClick={() => {
            setActivePage(currentUser ? 'account' : 'login');
            setNotifDropdownOpen(false);
          }}
          className={`flex flex-col items-center gap-0.5 p-1 rounded-xl transition-all ${
            activePage === 'account' || activePage === 'login' || activePage === 'register' ? 'text-gold font-extrabold bg-white/10' : 'text-stone-300 hover:text-white'
          }`}
        >
          <UserIcon className="w-5 h-5 text-gold" />
          <span>Compte</span>
        </button>

        {/* 6. Aide */}
        <button
          onClick={() => {
            setActivePage('aide');
            setNotifDropdownOpen(false);
          }}
          className={`flex flex-col items-center gap-0.5 p-1 rounded-xl transition-all ${
            activePage === 'aide' ? 'text-gold font-extrabold bg-white/10' : 'text-stone-300 hover:text-white'
          }`}
        >
          <HelpCircle className="w-5 h-5 text-gold" />
          <span>Aide</span>
        </button>

      </div>
    </>
  );
};

