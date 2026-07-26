import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
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
  UserPlus
} from 'lucide-react';
import { SUPER_ADMIN_EMAIL } from '../data/initialData';

export const Navbar: React.FC = () => {
  const {
    currentUser,
    cart,
    notifications,
    activePage,
    setActivePage,
    logoutUser,
    markNotificationAsRead
  } = useApp();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Unread notifications count
  const unreadNotifs = notifications.filter(n => {
    if (!currentUser) return false;
    return n.targetUserId === 'ALL' || n.targetUserId === currentUser.id;
  }).filter(n => currentUser && !n.readBy.includes(currentUser.id));

  const userNotifs = notifications.filter(n => {
    if (!currentUser) return n.targetUserId === 'ALL';
    return n.targetUserId === 'ALL' || n.targetUserId === currentUser.id;
  });

  const isAdmin = currentUser?.role === 'super_admin' || currentUser?.role === 'assistant_admin' || currentUser?.email.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase();

  return (
    <>
      <header className="sticky top-0 z-40 bg-[#FDFCFB]/90 backdrop-blur-md border-b border-stone-200/80 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            
            {/* Logo Brand */}
            <div
              onClick={() => setActivePage('shop')}
              className="flex items-center gap-2.5 sm:gap-3.5 cursor-pointer group"
            >
              <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-ink text-gold border border-gold/40 flex items-center justify-center font-serif-title font-bold text-xl sm:text-2xl shadow-sm group-hover:scale-105 transition-transform">
                D
              </div>
              <div>
                <span className="text-lg sm:text-2xl font-serif-title font-extrabold tracking-tight text-ink group-hover:text-gold-dark transition-colors">
                  DONALDSON <span className="text-gold italic font-editorial">SHOP</span>
                </span>
                <p className="text-[9px] sm:text-[10px] font-medium tracking-widest text-stone-500 uppercase -mt-0.5">
                  Vente Articles Sportifs Pro & Élégants
                </p>
              </div>
            </div>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-1.5 font-medium text-stone-700 text-xs tracking-wider uppercase">
              <button
                onClick={() => setActivePage('shop')}
                className={`px-4 py-2 rounded-xl transition-all ${
                  activePage === 'shop'
                    ? 'bg-ink text-gold font-bold shadow-xs'
                    : 'hover:bg-stone-100 text-stone-800'
                }`}
              >
                Boutique
              </button>

              <button
                onClick={() => setActivePage('annonces')}
                className={`px-4 py-2 rounded-xl flex items-center gap-1.5 transition-all ${
                  activePage === 'annonces'
                    ? 'bg-ink text-gold font-bold shadow-xs'
                    : 'hover:bg-stone-100 text-stone-800'
                }`}
              >
                <Megaphone className="w-3.5 h-3.5 text-gold" />
                Annonces
              </button>

              <button
                onClick={() => setActivePage('aide')}
                className={`px-4 py-2 rounded-xl flex items-center gap-1.5 transition-all ${
                  activePage === 'aide'
                    ? 'bg-ink text-gold font-bold shadow-xs'
                    : 'hover:bg-stone-100 text-stone-800'
                }`}
              >
                <HelpCircle className="w-3.5 h-3.5 text-gold" />
                Aide & Contact
              </button>

              {currentUser && (
                <button
                  onClick={() => setActivePage('orders')}
                  className={`px-4 py-2 rounded-xl flex items-center gap-1.5 transition-all ${
                    activePage === 'orders'
                      ? 'bg-ink text-gold font-bold shadow-xs'
                      : 'hover:bg-stone-100 text-stone-800'
                  }`}
                >
                  <PackageCheck className="w-3.5 h-3.5 text-gold" />
                  Commandes
                </button>
              )}

              {isAdmin && (
                <button
                  onClick={() => setActivePage('admin')}
                  className={`px-4 py-2 rounded-xl flex items-center gap-1.5 transition-all ${
                    activePage === 'admin'
                      ? 'bg-gold text-ink font-bold shadow-xs'
                      : 'bg-gold-light text-ink border border-gold/40 hover:bg-gold/20 font-bold'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4 text-ink" />
                  Espace Admin
                </button>
              )}
            </nav>

            {/* Desktop Right Controls */}
            <div className="hidden md:flex items-center gap-2 sm:gap-3">
              
              {/* AI Assistant Chat Button */}
              <button
                onClick={() => setActivePage('chat')}
                className={`p-2.5 rounded-full relative transition-all ${
                  activePage === 'chat'
                    ? 'bg-ink text-gold border border-gold/50 shadow-md'
                    : 'bg-stone-100 text-stone-800 hover:bg-stone-200'
                }`}
                title="Assistant IA & Support Client"
              >
                <MessageSquare className="w-4 h-4" />
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-gold"></span>
                </span>
              </button>

              {/* Cart Icon */}
              <button
                onClick={() => setActivePage('cart')}
                className="p-2.5 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-800 relative transition-all border border-stone-200/60"
                title="Mon Panier"
              >
                <ShoppingBag className="w-4 h-4" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-gold text-ink text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center shadow-xs">
                    {cartCount}
                  </span>
                )}
              </button>

              {/* Notifications Bell */}
              <div className="relative">
                <button
                  onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
                  className="p-2.5 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-800 relative transition-all border border-stone-200/60"
                  title="Notifications"
                >
                  <Bell className="w-4 h-4" />
                  {unreadNotifs.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-rose-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                      {unreadNotifs.length}
                    </span>
                  )}
                </button>

                {/* Notifications Dropdown */}
                {notifDropdownOpen && (
                  <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-stone-200 p-4 z-50">
                    <div className="flex items-center justify-between pb-3 border-b border-stone-100 mb-2">
                      <h4 className="font-serif-title font-bold text-ink flex items-center gap-2">
                        <Bell className="w-4 h-4 text-gold" />
                        Notifications Client
                      </h4>
                      <span className="text-xs text-stone-500">{userNotifs.length} reçue(s)</span>
                    </div>

                    <div className="max-h-64 overflow-y-auto space-y-2 pr-1">
                      {userNotifs.length === 0 ? (
                        <p className="text-xs text-stone-500 py-4 text-center">Aucune notification pour le moment.</p>
                      ) : (
                        userNotifs.map(notif => {
                          const isRead = currentUser && notif.readBy.includes(currentUser.id);
                          return (
                            <div
                              key={notif.id}
                              onClick={() => markNotificationAsRead(notif.id)}
                              className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                                isRead ? 'bg-stone-50 border-stone-200 text-stone-600' : 'bg-amber-50/80 border-gold/40 text-ink font-medium'
                              }`}
                            >
                              <div className="flex items-center justify-between mb-1">
                                <span className="font-bold text-ink">{notif.title}</span>
                                <span className="text-[10px] text-stone-400">
                                  {new Date(notif.createdAt).toLocaleDateString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                              <p className="leading-relaxed">{notif.message}</p>
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
                    className="px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold text-ink hover:bg-stone-100 transition-all"
                  >
                    Connexion
                  </button>
                  <button
                    onClick={() => setActivePage('register')}
                    className="px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-ink text-gold border border-gold/40 shadow-xs hover:bg-stone-900 transition-all"
                  >
                    S'inscrire
                  </button>
                </div>
              )}

            </div>

            {/* Mobile Header Quick Controls & 3 Traits Menu Toggle */}
            <div className="md:hidden flex items-center gap-2">
              {/* Chat IA */}
              <button
                onClick={() => setActivePage('chat')}
                className={`p-2 rounded-xl relative transition-all ${
                  activePage === 'chat'
                    ? 'bg-ink text-gold border border-gold/50 shadow-md'
                    : 'bg-stone-100 text-stone-800'
                }`}
                title="Chatbot IA"
              >
                <MessageSquare className="w-5 h-5 text-ink" />
                <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-gold"></span>
                </span>
              </button>

              {/* Cart */}
              <button
                onClick={() => setActivePage('cart')}
                className="p-2 rounded-xl bg-stone-100 text-stone-800 relative"
                title="Panier"
              >
                <ShoppingBag className="w-5 h-5 text-ink" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-gold text-ink text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </button>

              {/* Notifications */}
              <button
                onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
                className="p-2 rounded-xl bg-stone-100 text-stone-800 relative"
                title="Notifications"
              >
                <Bell className="w-5 h-5 text-ink" />
                {unreadNotifs.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-rose-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                    {unreadNotifs.length}
                  </span>
                )}
              </button>

              {/* 3 Traits Hamburger Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2.5 rounded-xl bg-ink text-gold border border-gold/40 shadow-sm flex items-center justify-center"
                title="Menu Navigation"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>

          </div>
        </div>

        {/* Mobile Drawer Menu (3 traits expanded) */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-stone-200 bg-[#FDFCFB] px-4 py-4 space-y-2 max-h-[70vh] overflow-y-auto shadow-2xl animate-fadeIn">
            <button
              onClick={() => { setActivePage('shop'); setMobileMenuOpen(false); }}
              className={`w-full text-left px-4 py-3 rounded-xl font-bold text-xs tracking-wider uppercase ${
                activePage === 'shop' ? 'bg-ink text-gold font-bold' : 'text-stone-800 bg-stone-100'
              }`}
            >
              🛍️ Boutique Articles
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

            {currentUser && (
              <button
                onClick={() => { setActivePage('orders'); setMobileMenuOpen(false); }}
                className={`w-full text-left px-4 py-3 rounded-xl font-bold text-xs tracking-wider uppercase flex items-center gap-2 ${
                  activePage === 'orders' ? 'bg-ink text-gold' : 'text-stone-800 bg-stone-100'
                }`}
              >
                <PackageCheck className="w-4 h-4 text-gold" />
                📦 Mes Commandes
              </button>
            )}

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
        <div className="fixed inset-0 z-50 md:hidden flex items-end sm:items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl w-full max-w-md p-5 shadow-2xl border border-stone-200 space-y-3 mb-16 sm:mb-0">
            <div className="flex items-center justify-between pb-2 border-b border-stone-100">
              <h4 className="font-serif-title font-bold text-ink flex items-center gap-2 text-sm">
                <Bell className="w-4 h-4 text-gold" />
                Notifications ({userNotifs.length})
              </h4>
              <button
                onClick={() => setNotifDropdownOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="max-h-60 overflow-y-auto space-y-2">
              {userNotifs.length === 0 ? (
                <p className="text-xs text-stone-500 py-4 text-center">Aucune notification pour le moment.</p>
              ) : (
                userNotifs.map(notif => {
                  const isRead = currentUser && notif.readBy.includes(currentUser.id);
                  return (
                    <div
                      key={notif.id}
                      onClick={() => {
                        markNotificationAsRead(notif.id);
                      }}
                      className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                        isRead ? 'bg-stone-50 border-stone-200 text-stone-600' : 'bg-amber-50/80 border-gold/40 text-ink font-medium'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-ink">{notif.title}</span>
                        <span className="text-[10px] text-stone-400">
                          {new Date(notif.createdAt).toLocaleDateString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="leading-relaxed text-[11px]">{notif.message}</p>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* FIXED MOBILE STICKY BOTTOM NAVIGATION BAR */}
      {/* Contains: Chatbot, Panier, Notifications, Connexion, Inscription (or Compte/Déconnexion), and 3 Traits (Menu) */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#121212]/95 backdrop-blur-lg border-t border-gold/30 text-white shadow-2xl md:hidden px-2 py-2 flex items-center justify-around text-[10px] font-bold">
        
        {/* 1. Chatbot */}
        <button
          onClick={() => {
            setActivePage('chat');
            setNotifDropdownOpen(false);
          }}
          className={`flex flex-col items-center gap-1 p-1.5 rounded-xl transition-all ${
            activePage === 'chat' ? 'text-gold font-extrabold bg-white/10' : 'text-stone-300 hover:text-white'
          }`}
        >
          <div className="relative">
            <MessageSquare className="w-5 h-5 text-gold" />
            <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-gold"></span>
            </span>
          </div>
          <span>Chat IA</span>
        </button>

        {/* 2. Panier */}
        <button
          onClick={() => {
            setActivePage('cart');
            setNotifDropdownOpen(false);
          }}
          className={`flex flex-col items-center gap-1 p-1.5 rounded-xl transition-all ${
            activePage === 'cart' ? 'text-gold font-extrabold bg-white/10' : 'text-stone-300 hover:text-white'
          }`}
        >
          <div className="relative">
            <ShoppingBag className="w-5 h-5 text-gold" />
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-gold text-ink text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </div>
          <span>Panier</span>
        </button>

        {/* 3. Notifications */}
        <button
          onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
          className={`flex flex-col items-center gap-1 p-1.5 rounded-xl transition-all ${
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

        {/* 4. Connexion / Inscription OR Compte / Déco */}
        {currentUser ? (
          <>
            <button
              onClick={() => {
                setActivePage('account');
                setNotifDropdownOpen(false);
              }}
              className={`flex flex-col items-center gap-1 p-1.5 rounded-xl transition-all ${
                activePage === 'account' ? 'text-gold font-extrabold bg-white/10' : 'text-amber-300 hover:text-white'
              }`}
            >
              <UserIcon className="w-5 h-5 text-amber-300" />
              <span>Compte</span>
            </button>

            <button
              onClick={() => {
                logoutUser();
                setActivePage('shop');
                setNotifDropdownOpen(false);
              }}
              className="flex flex-col items-center gap-1 p-1.5 rounded-xl text-rose-400 hover:text-rose-300 transition-all"
            >
              <LogOut className="w-5 h-5 text-rose-400" />
              <span>Déco</span>
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => {
                setActivePage('login');
                setNotifDropdownOpen(false);
              }}
              className={`flex flex-col items-center gap-1 p-1.5 rounded-xl transition-all ${
                activePage === 'login' ? 'text-gold font-extrabold bg-white/10' : 'text-amber-300 hover:text-white'
              }`}
            >
              <LogIn className="w-5 h-5 text-amber-300" />
              <span>Connexion</span>
            </button>

            <button
              onClick={() => {
                setActivePage('register');
                setNotifDropdownOpen(false);
              }}
              className={`flex flex-col items-center gap-1 p-1.5 rounded-xl transition-all ${
                activePage === 'register' ? 'text-gold font-extrabold bg-white/10' : 'text-amber-300 hover:text-white'
              }`}
            >
              <UserPlus className="w-5 h-5 text-amber-300" />
              <span>Inscription</span>
            </button>
          </>
        )}

        {/* 5. 3 Traits Menu Toggle */}
        <button
          onClick={() => {
            setMobileMenuOpen(!mobileMenuOpen);
            setNotifDropdownOpen(false);
          }}
          className={`flex flex-col items-center gap-1 p-1.5 rounded-xl transition-all ${
            mobileMenuOpen ? 'text-gold bg-gold/20 font-extrabold' : 'text-stone-300 hover:text-white'
          }`}
        >
          {mobileMenuOpen ? <X className="w-5 h-5 text-gold" /> : <Menu className="w-5 h-5 text-gold" />}
          <span className="text-[9px]">3 Traits</span>
        </button>

      </div>
    </>
  );
};

