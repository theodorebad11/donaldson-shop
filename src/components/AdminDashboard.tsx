import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { User, Product, Order, Announcement, AssistantRolePermission, OrderDeliveryStatus } from '../types';
import { formatFCFA, SUPER_ADMIN_EMAIL } from '../data/initialData';
import {
  ShieldCheck,
  Users,
  Package,
  ShoppingBag,
  Megaphone,
  Bell,
  Plus,
  Trash2,
  Edit,
  Upload,
  Image as ImageIcon,
  CheckCircle,
  Clock,
  Truck,
  AlertCircle,
  Search,
  UserCheck,
  Tag,
  Key,
  Layers,
  Send,
  Phone,
  Mail,
  Star,
  Sparkles,
  X,
  MessageSquare
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const {
    currentUser,
    users,
    products,
    categories,
    orders,
    announcements,
    chatMessages,
    registerUser,
    updateUserRole,
    deleteUser,
    addProduct,
    updateProduct,
    deleteProduct,
    addCategory,
    deleteCategory,
    updateOrderStatus,
    deleteOrder,
    addAnnouncement,
    updateAnnouncement,
    deleteAnnouncement,
    sendNotification,
    sendAdminChatMessage
  } = useApp();

  const [adminTab, setAdminTab] = useState<'users' | 'products' | 'categories' | 'orders' | 'support' | 'announcements' | 'notifications'>('users');
  const [replyTextMap, setReplyTextMap] = useState<{ [key: string]: string }>({});

  // Search/Filter states
  const [userSearch, setUserSearch] = useState('');
  const [productSearch, setProductSearch] = useState('');
  const [orderSearch, setOrderSearch] = useState('');

  // Modals / Form states
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [prodName, setProdName] = useState('');
  const [prodCategory, setProdCategory] = useState('');
  const [prodPriceFCFA, setProdPriceFCFA] = useState<number | ''>(15000);
  const [prodOriginalPriceFCFA, setProdOriginalPriceFCFA] = useState<number | ''>('');
  const [prodDescription, setProdDescription] = useState('');
  const [prodStock, setProdStock] = useState<number | ''>(10);
  const [prodBadge, setProdBadge] = useState<string>('PRO');
  const [prodSizes, setProdSizes] = useState<string>('S, M, L, XL');
  const [prodImageUrl, setProdImageUrl] = useState<string>('');
  const [prodFeatured, setProdFeatured] = useState<boolean>(true);

  // Category addition
  const [newCatName, setNewCatName] = useState('');

  // Announcement modal state
  const [isAnnModalOpen, setIsAnnModalOpen] = useState(false);
  const [annTitle, setAnnTitle] = useState('');
  const [annContent, setAnnContent] = useState('');
  const [annBadge, setAnnBadge] = useState('EXCLUSIVITÉ');
  const [annImageUrl, setAnnImageUrl] = useState('');

  // Notification creation state
  const [notifTargetUserId, setNotifTargetUserId] = useState<string>('ALL');
  const [notifTitle, setNotifTitle] = useState('');
  const [notifMessage, setNotifMessage] = useState('');
  const [notifSentAlert, setNotifSentAlert] = useState(false);

  // Assistant Role Selection & Admin creation state
  const [selectedUserForAssistant, setSelectedUserForAssistant] = useState<User | null>(null);
  const [targetUserRole, setTargetUserRole] = useState<'super_admin' | 'assistant_admin' | 'client'>('assistant_admin');
  const [assistantRolesSelection, setAssistantRolesSelection] = useState<AssistantRolePermission[]>(['products', 'orders']);
  
  // Create New Admin / Assistant state
  const [isCreateUserModalOpen, setIsCreateUserModalOpen] = useState(false);
  const [newLastName, setNewLastName] = useState('');
  const [newFirstName, setNewFirstName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState<'super_admin' | 'assistant_admin' | 'client'>('assistant_admin');
  const [newAssistantRoles, setNewAssistantRoles] = useState<AssistantRolePermission[]>(['products', 'orders']);
  const [userModalError, setUserModalError] = useState('');

  const isSuperAdmin = currentUser?.role === 'super_admin' || currentUser?.email.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase();

  // File Upload Reader for Product Photos (Gallery / Device file picker)
  const handleImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>, target: 'product' | 'announcement') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (reader.result) {
          if (target === 'product') {
            setProdImageUrl(reader.result as string);
          } else {
            setAnnImageUrl(reader.result as string);
          }
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Toggle Featured status directly from list
  const handleToggleFeatured = (prod: Product) => {
    updateProduct({
      ...prod,
      featured: !prod.featured
    });
  };

  // Product Save / Edit Handler
  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prodName || !prodCategory || prodPriceFCFA === '' || Number(prodPriceFCFA) <= 0) return;

    const sizesArr = prodSizes.split(',').map(s => s.trim()).filter(Boolean);
    const finalImage = prodImageUrl || 'https://images.unsplash.com/photo-1511746315387-c4a76990fdce?auto=format&fit=crop&w=800&q=80';
    const origPrice = prodOriginalPriceFCFA !== '' && Number(prodOriginalPriceFCFA) > 0 ? Number(prodOriginalPriceFCFA) : undefined;

    if (editingProduct) {
      updateProduct({
        ...editingProduct,
        name: prodName,
        category: prodCategory,
        priceFCFA: Number(prodPriceFCFA),
        originalPriceFCFA: origPrice,
        description: prodDescription || undefined,
        stock: prodStock === '' ? 0 : Number(prodStock),
        badge: prodBadge === 'AUCUN' ? undefined : prodBadge,
        sizes: sizesArr,
        imageUrl: finalImage,
        featured: prodFeatured
      });
    } else {
      addProduct({
        name: prodName,
        category: prodCategory,
        priceFCFA: Number(prodPriceFCFA),
        originalPriceFCFA: origPrice,
        description: prodDescription || undefined,
        stock: prodStock === '' ? 0 : Number(prodStock),
        badge: prodBadge === 'AUCUN' ? undefined : prodBadge,
        sizes: sizesArr,
        imageUrl: finalImage,
        featured: prodFeatured
      });
    }

    setIsProductModalOpen(false);
    setEditingProduct(null);
    resetProductForm();
  };

  const resetProductForm = () => {
    setProdName('');
    setProdCategory(categories[0] || 'Maillots Pro');
    setProdPriceFCFA(15000);
    setProdOriginalPriceFCFA('');
    setProdDescription('');
    setProdStock(10);
    setProdBadge('PRO');
    setProdSizes('S, M, L, XL');
    setProdImageUrl('');
    setProdFeatured(true);
  };

  const openEditProduct = (prod: Product) => {
    setEditingProduct(prod);
    setProdName(prod.name);
    setProdCategory(prod.category);
    setProdPriceFCFA(prod.priceFCFA);
    setProdOriginalPriceFCFA(prod.originalPriceFCFA || '');
    setProdDescription(prod.description || '');
    setProdStock(prod.stock);
    setProdBadge(prod.badge || 'AUCUN');
    setProdSizes(prod.sizes ? prod.sizes.join(', ') : '');
    setProdImageUrl(prod.imageUrl);
    setProdFeatured(prod.featured !== false);
    setIsProductModalOpen(true);
  };

  // Announcement Save
  const handleSaveAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!annTitle || !annContent) return;

    addAnnouncement({
      title: annTitle,
      content: annContent,
      badge: annBadge,
      imageUrl: annImageUrl || 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=1200&q=80',
      active: true
    });

    setIsAnnModalOpen(false);
    setAnnTitle('');
    setAnnContent('');
    setAnnImageUrl('');
  };

  // Broadcast Notification
  const handleSendNotification = (e: React.FormEvent) => {
    e.preventDefault();
    if (!notifTitle || !notifMessage) return;

    sendNotification({
      targetUserId: notifTargetUserId,
      title: notifTitle,
      message: notifMessage
    });

    setNotifSentAlert(true);
    setNotifTitle('');
    setNotifMessage('');
    setTimeout(() => setNotifSentAlert(false), 3000);
  };

  // Assistant Role Toggle
  const handleAssistantRoleToggle = (userId: string, rolePerm: AssistantRolePermission) => {
    const userToUpdate = users.find(u => u.id === userId);
    if (!userToUpdate) return;

    const currentRoles = userToUpdate.assistantRoles || [];
    const newRoles = currentRoles.includes(rolePerm)
      ? currentRoles.filter(r => r !== rolePerm)
      : [...currentRoles, rolePerm];

    updateUserRole(userId, 'assistant_admin', newRoles);
  };

  // Filtered lists for admin tables
  const filteredUsers = users.filter(u =>
    u.firstName.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.lastName.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.phone.toLowerCase().includes(userSearch.toLowerCase())
  );

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
    p.category.toLowerCase().includes(productSearch.toLowerCase())
  );

  const filteredOrders = orders.filter(o =>
    o.id.toLowerCase().includes(orderSearch.toLowerCase()) ||
    o.clientName.toLowerCase().includes(orderSearch.toLowerCase()) ||
    o.clientPhone.toLowerCase().includes(orderSearch.toLowerCase()) ||
    o.deliveryCity.toLowerCase().includes(orderSearch.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8 pb-16">
      
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-amber-600 via-amber-700 to-amber-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-white font-bold text-xs uppercase mb-2">
            <ShieldCheck className="w-4 h-4" />
            Panneau d'Administration Directe
          </div>
          <h1 className="text-2xl sm:text-3xl font-black">ESPACE ADMINISTRATION DONALDSON SHOP</h1>
          <p className="text-amber-100 text-xs sm:text-sm mt-1">
            Connecté en tant que <strong>{currentUser?.firstName} {currentUser?.lastName}</strong> ({currentUser?.email})
          </p>
        </div>

        <div className="flex items-center gap-2 bg-black/20 p-3 rounded-2xl border border-white/10 text-xs font-semibold">
          <span>Rôle :</span>
          <span className="bg-amber-400 text-amber-950 font-black px-2.5 py-0.5 rounded-lg uppercase">
            {isSuperAdmin ? 'SUPER ADMIN' : 'ADMIN ASSISTANT'}
          </span>
        </div>
      </div>

      {/* Overview Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase">Utilisateurs Inscrits</p>
            <p className="text-2xl font-black text-slate-900">{users.length}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase">Articles en Vente</p>
            <p className="text-2xl font-black text-slate-900">{products.length}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center font-bold">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase">Commandes Passées</p>
            <p className="text-2xl font-black text-slate-900">{orders.length}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center font-bold">
            <Megaphone className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase">Annonces Publiées</p>
            <p className="text-2xl font-black text-slate-900">{announcements.length}</p>
          </div>
        </div>
      </div>

      {/* Admin Tabs */}
      <div className="flex border-b border-slate-200 overflow-x-auto no-scrollbar gap-2">
        <button
          onClick={() => setAdminTab('users')}
          className={`px-5 py-3 font-extrabold text-xs sm:text-sm rounded-t-2xl transition-all whitespace-nowrap flex items-center gap-2 ${
            adminTab === 'users'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <Users className="w-4 h-4 text-emerald-400" />
          Utilisateurs & Assistants ({users.length})
        </button>

        <button
          onClick={() => setAdminTab('products')}
          className={`px-5 py-3 font-extrabold text-xs sm:text-sm rounded-t-2xl transition-all whitespace-nowrap flex items-center gap-2 ${
            adminTab === 'products'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <Package className="w-4 h-4 text-emerald-400" />
          Gestion Articles ({products.length})
        </button>

        <button
          onClick={() => setAdminTab('categories')}
          className={`px-5 py-3 font-extrabold text-xs sm:text-sm rounded-t-2xl transition-all whitespace-nowrap flex items-center gap-2 ${
            adminTab === 'categories'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <Layers className="w-4 h-4 text-emerald-400" />
          Catégories Personnalisées ({categories.length})
        </button>

        <button
          onClick={() => setAdminTab('orders')}
          className={`px-5 py-3 font-extrabold text-xs sm:text-sm rounded-t-2xl transition-all whitespace-nowrap flex items-center gap-2 ${
            adminTab === 'orders'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <ShoppingBag className="w-4 h-4 text-emerald-400" />
          Commandes Clients ({orders.length})
        </button>

        <button
          onClick={() => setAdminTab('support')}
          className={`px-5 py-3 font-extrabold text-xs sm:text-sm rounded-t-2xl transition-all whitespace-nowrap flex items-center gap-2 ${
            adminTab === 'support'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <MessageSquare className="w-4 h-4 text-amber-400" />
          Support & Chatbot ({chatMessages.filter(m => m.sender === 'user').length})
        </button>

        <button
          onClick={() => setAdminTab('announcements')}
          className={`px-5 py-3 font-extrabold text-xs sm:text-sm rounded-t-2xl transition-all whitespace-nowrap flex items-center gap-2 ${
            adminTab === 'announcements'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <Megaphone className="w-4 h-4 text-emerald-400" />
          Gestion Annonces ({announcements.length})
        </button>

        <button
          onClick={() => setAdminTab('notifications')}
          className={`px-5 py-3 font-extrabold text-xs sm:text-sm rounded-t-2xl transition-all whitespace-nowrap flex items-center gap-2 ${
            adminTab === 'notifications'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <Bell className="w-4 h-4 text-emerald-400" />
          Envoyer Notifications
        </button>
      </div>

      {/* TAB 1: USERS & ASSISTANTS */}
      {adminTab === 'users' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black text-slate-900">
                  Liste des Utilisateurs Inscrits ({users.length})
                </h3>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold border border-emerald-300">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  {users.filter(u => u.id === currentUser?.id || (u.lastActiveAt && (Date.now() - new Date(u.lastActiveAt).getTime() < 3 * 60 * 1000))).length} En ligne
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Toutes les personnes inscrites ou connectées apparaissent ici en temps réel avec leur statut de présence.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
              {isSuperAdmin && (
                <button
                  onClick={() => {
                    setIsCreateUserModalOpen(true);
                    setUserModalError('');
                  }}
                  className="px-4 py-2 rounded-xl bg-ink text-gold border border-gold/40 font-bold text-xs hover:bg-stone-900 transition-all flex items-center gap-1.5 shadow-md"
                >
                  <UserCheck className="w-4 h-4 text-gold" />
                  <span>+ Nommer un Admin / Assistant</span>
                </button>
              )}

              <div className="relative flex-1 sm:w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  placeholder="Rechercher nom, email, tél..."
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-100 text-slate-900 font-extrabold uppercase text-[10px]">
                <tr>
                  <th className="p-3.5 rounded-l-xl">Nom & Prénom</th>
                  <th className="p-3.5">Présence</th>
                  <th className="p-3.5">Téléphone</th>
                  <th className="p-3.5">Adresse Email</th>
                  <th className="p-3.5">Mot de Passe</th>
                  <th className="p-3.5">Inscrit & Accès</th>
                  <th className="p-3.5">Rôle & Permissions</th>
                  <th className="p-3.5 rounded-r-xl text-right">Actions Admin</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map((usr) => {
                  const isOnline = usr.id === currentUser?.id || 
                    (usr.lastActiveAt && (Date.now() - new Date(usr.lastActiveAt).getTime() < 3 * 60 * 1000));

                  return (
                    <tr key={usr.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-3.5 font-extrabold text-slate-900 flex items-center gap-2.5">
                        <div className="relative shrink-0">
                          <div className="w-9 h-9 rounded-full bg-amber-100 text-amber-900 font-black flex items-center justify-center overflow-hidden border border-amber-300 shadow-xs">
                            {usr.avatarUrl ? (
                              <img src={usr.avatarUrl} alt={`${usr.firstName}`} className="w-full h-full object-cover" />
                            ) : (
                              <span>{usr.firstName[0]}</span>
                            )}
                          </div>
                          {isOnline && (
                            <span 
                              className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full animate-pulse" 
                              title="Actif en ligne"
                            />
                          )}
                        </div>
                        <div>
                          <p className="flex items-center gap-1.5">
                            <span>{usr.lastName} {usr.firstName}</span>
                            {usr.id === currentUser?.id && (
                              <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-200 text-amber-900 font-extrabold">VOUS</span>
                            )}
                          </p>
                          <p className="text-[10px] text-slate-400 font-normal">ID: {usr.id}</p>
                        </div>
                      </td>

                      <td className="p-3.5">
                        {isOnline ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-900 text-[10px] font-bold border border-emerald-300">
                            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
                            Actif en Ligne
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 text-[10px] font-medium border border-slate-200">
                            <span className="w-2 h-2 rounded-full bg-slate-400"></span>
                            Hors Ligne
                          </span>
                        )}
                      </td>

                      <td className="p-3.5 font-semibold text-slate-800">
                        <div className="flex items-center gap-1">
                          <Phone className="w-3 h-3 text-slate-400" />
                          {usr.phone}
                        </div>
                      </td>

                      <td className="p-3.5 text-slate-800 font-medium">
                        <div className="flex items-center gap-1">
                          <Mail className="w-3 h-3 text-slate-400" />
                          {usr.email}
                        </div>
                      </td>

                      <td className="p-3.5 text-slate-900 font-mono font-bold">
                        <div className="flex items-center gap-1.5 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200 text-amber-950 w-fit">
                          <Key className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                          <span>{usr.password || '●●●●●●'}</span>
                        </div>
                      </td>

                      <td className="p-3.5 text-slate-500 text-[11px] space-y-0.5">
                        <p className="text-slate-600 font-medium">Inscrit : {new Date(usr.registeredAt).toLocaleDateString('fr-FR')}</p>
                        <p className="text-emerald-700 font-semibold">
                          Dernier accès : {usr.lastLoginAt ? new Date(usr.lastLoginAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : 'Récemment'}
                        </p>
                      </td>

                    <td className="p-3.5">
                      {usr.role === 'super_admin' ? (
                        <span className="bg-amber-100 text-amber-900 font-black text-[10px] px-2.5 py-1 rounded-full border border-amber-300">
                          SUPER ADMIN
                        </span>
                      ) : usr.role === 'assistant_admin' ? (
                        <div className="space-y-1">
                          <span className="bg-blue-100 text-blue-900 font-bold text-[10px] px-2.5 py-1 rounded-full">
                            ADMIN ASSISTANT
                          </span>
                          <div className="flex flex-wrap gap-1 pt-1">
                            {usr.assistantRoles?.map(r => (
                              <span key={r} className="bg-slate-100 text-slate-700 text-[9px] px-1.5 py-0.5 rounded font-mono">
                                {r}
                              </span>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <span className="bg-slate-100 text-slate-700 font-semibold text-[10px] px-2.5 py-1 rounded-full">
                          CLIENT
                        </span>
                      )}
                    </td>

                    <td className="p-3.5 text-right space-x-1.5 whitespace-nowrap">
                      {isSuperAdmin && usr.email !== SUPER_ADMIN_EMAIL && (
                        <>
                          <button
                            onClick={() => {
                              setSelectedUserForAssistant(usr);
                              setTargetUserRole(usr.role);
                              setAssistantRolesSelection(usr.assistantRoles || ['products', 'orders']);
                            }}
                            className="px-3 py-1.5 rounded-lg bg-amber-500 text-slate-950 font-bold hover:bg-amber-400 transition-colors text-[10px] inline-flex items-center gap-1 shadow-xs"
                            title="Nommer et attribuer un rôle et des permissions"
                          >
                            <ShieldCheck className="w-3.5 h-3.5" />
                            <span>Gérer Rôle & Permissions</span>
                          </button>

                          <button
                            onClick={() => deleteUser(usr.id)}
                            className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 transition-colors inline-flex items-center"
                            title="Supprimer l'utilisateur"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                );
              })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: PRODUCTS MANAGEMENT */}
      {adminTab === 'products' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-black text-slate-900">
                Gestion des Articles Sportifs ({products.length})
              </h3>
              <p className="text-xs text-slate-500">
                Mettez vous-même les articles sur le marché avec photos depuis la galerie de votre appareil ou prédéfinies.
              </p>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  placeholder="Filtrer produit..."
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs outline-none focus:border-emerald-500"
                />
              </div>

              <button
                onClick={() => {
                  setEditingProduct(null);
                  resetProductForm();
                  setIsProductModalOpen(true);
                }}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5 shrink-0"
              >
                <Plus className="w-4 h-4" />
                Ajouter un Article
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredProducts.map((prod) => (
              <div key={prod.id} className={`p-4 rounded-2xl border flex flex-col justify-between space-y-3 transition-all ${prod.featured ? 'bg-amber-50/50 border-amber-300 shadow-xs' : 'bg-slate-50 border-slate-200'}`}>
                <div className="space-y-2">
                  <div className="relative h-40 rounded-xl overflow-hidden bg-slate-200">
                    <img
                      src={prod.imageUrl}
                      alt={prod.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                    
                    <div className="absolute top-2 left-2 flex flex-col gap-1 items-start">
                      {prod.badge && (
                        <span className="bg-emerald-600 text-white font-bold text-[9px] px-2 py-0.5 rounded-full uppercase shadow-xs">
                          {prod.badge}
                        </span>
                      )}
                      {prod.featured && (
                        <span className="bg-amber-500 text-slate-950 font-black text-[9px] px-2 py-0.5 rounded-full uppercase flex items-center gap-1 shadow-xs">
                          <Star className="w-3 h-3 fill-slate-950" />
                          VEDETTE
                        </span>
                      )}
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-emerald-700 uppercase">{prod.category}</span>
                    <h4 className="font-extrabold text-sm text-slate-900 truncate" title={prod.name}>{prod.name}</h4>
                    
                    <div className="flex items-baseline gap-2 mt-0.5">
                      <span className="font-black text-emerald-800 text-sm">
                        {formatFCFA(prod.priceFCFA)}
                      </span>
                      {prod.originalPriceFCFA && prod.originalPriceFCFA > prod.priceFCFA && (
                        <span className="text-xs text-slate-400 line-through font-semibold">
                          {formatFCFA(prod.originalPriceFCFA)}
                        </span>
                      )}
                    </div>

                    <p className="text-[10px] text-slate-600 mt-1 font-medium">
                      Stock dispo : <strong className={prod.stock > 0 ? "text-emerald-700 font-bold" : "text-rose-600 font-bold"}>{prod.stock} unité(s)</strong>
                    </p>
                    {prod.description && (
                      <p className="text-[11px] text-slate-500 line-clamp-2 mt-1 font-light">
                        {prod.description}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-200">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleToggleFeatured(prod)}
                      className={`w-full py-1.5 px-2 rounded-lg font-bold text-[10px] flex items-center justify-center gap-1 transition-all border ${
                        prod.featured
                          ? 'bg-amber-100 text-amber-900 border-amber-300 hover:bg-amber-200'
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                      title="Changer le statut en vedette"
                    >
                      <Star className={`w-3 h-3 ${prod.featured ? 'fill-amber-600 text-amber-600' : 'text-slate-400'}`} />
                      {prod.featured ? 'En Vedette' : 'Mettre en Vedette'}
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openEditProduct(prod)}
                      className="flex-1 py-1.5 rounded-lg bg-white border border-slate-300 font-bold text-xs text-slate-800 hover:bg-slate-100 flex items-center justify-center gap-1"
                    >
                      <Edit className="w-3.5 h-3.5 text-blue-600" />
                      Modifier
                    </button>

                    <button
                      onClick={() => deleteProduct(prod.id)}
                      className="p-1.5 rounded-lg bg-white border border-slate-300 text-rose-600 hover:bg-rose-50"
                      title="Supprimer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: CATEGORIES MANAGEMENT (Dynamic, replacing Homme/Femme) */}
      {adminTab === 'categories' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-6">
          <div>
            <h3 className="text-lg font-black text-slate-900">
              Gestion des Catégories d'Articles
            </h3>
            <p className="text-xs text-slate-500">
              Vous pouvez vous-même créer toutes vos catégories librement selon vos besoins sportifs.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            <input
              type="text"
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
              placeholder="Ex: Équipements de Musculation / Maillots Rétro"
              className="w-full sm:w-96 px-4 py-2.5 rounded-xl border border-slate-200 text-xs outline-none focus:border-emerald-500"
            />
            <button
              onClick={() => {
                if (newCatName) {
                  addCategory(newCatName);
                  setNewCatName('');
                }
              }}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs shadow-xs hover:bg-emerald-700"
            >
              Créer cette Catégorie
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {categories.map((cat) => (
              <div key={cat} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="font-extrabold text-xs text-slate-900">{cat}</span>
                  <span className="block text-[10px] text-slate-400">
                    {products.filter(p => p.category.toLowerCase() === cat.toLowerCase()).length} produit(s)
                  </span>
                </div>

                <button
                  onClick={() => deleteCategory(cat)}
                  className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg"
                  title="Supprimer la catégorie"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: ORDERS MANAGEMENT */}
      {adminTab === 'orders' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-black text-slate-900">
                Toutes les Commandes Clients ({orders.length})
              </h3>
              <p className="text-xs text-slate-500">
                Visualisez toutes les commandes effectuées sur le site ou via WhatsApp par les utilisateurs.
              </p>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={orderSearch}
                onChange={(e) => setOrderSearch(e.target.value)}
                placeholder="Rechercher #CMD, client..."
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {filteredOrders.length === 0 ? (
            <p className="text-xs text-slate-500 py-8 text-center">Aucune commande enregistrée pour le moment.</p>
          ) : (
            <div className="space-y-4">
              {filteredOrders.map((ord) => (
                <div key={ord.id} className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
                    <div>
                      <span className="font-black text-xs text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-md">
                        #{ord.id}
                      </span>
                      <span className="text-xs font-bold text-slate-900 ml-2">
                        Client : {ord.clientName} ({ord.clientPhone} • {ord.clientEmail})
                      </span>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      {ord.deliveryStatus === 'En attente' && (
                        <button
                          onClick={() => updateOrderStatus(ord.id, 'Confirmée')}
                          className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-xs transition-all flex items-center gap-1.5"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          Confirmer la Commande
                        </button>
                      )}

                      <span className="text-[10px] font-bold text-slate-500 uppercase">Statut :</span>
                      <select
                        value={ord.deliveryStatus}
                        onChange={(e) => updateOrderStatus(ord.id, e.target.value as OrderDeliveryStatus)}
                        className="px-2.5 py-1 rounded-lg border border-slate-300 text-xs font-bold text-slate-800 outline-none"
                      >
                        <option value="En attente">En attente</option>
                        <option value="Confirmée">Confirmée</option>
                        <option value="En cours de livraison">En cours de livraison</option>
                        <option value="Livrée">Livrée</option>
                        <option value="Annulée">Annulée</option>
                      </select>

                      <button
                        onClick={() => deleteOrder(ord.id)}
                        className="p-1 text-rose-500 hover:bg-rose-100 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div>
                      <p className="font-extrabold text-slate-800 mb-1">Articles Commandés :</p>
                      <ul className="space-y-1">
                        {ord.items.map((item, idx) => (
                          <li key={idx} className="flex justify-between text-slate-700 bg-white p-2 rounded-lg border border-slate-200">
                            <span>{item.productName} (Taille: {item.selectedSize || 'Standard'}) x{item.quantity}</span>
                            <strong className="text-emerald-700">{formatFCFA(item.priceFCFA * item.quantity)}</strong>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-1">
                      <p className="font-bold text-slate-900">Mode & Coordonnées Client :</p>
                      <p className="text-slate-700">
                        {ord.wantsDelivery 
                          ? `🚚 Livraison : ${ord.deliveryAddress || 'Adresse non renseignée'}, ${ord.deliveryCity || 'Lomé'}`
                          : `🏪 Retrait Magasin : Sur place à Lomé (Bè)`}
                      </p>
                      {ord.deliveryNotes && <p className="text-[11px] text-slate-500 italic">Notes: {ord.deliveryNotes}</p>}
                      
                      <p className="text-[11px] text-amber-800 font-semibold bg-amber-50 p-2 rounded-lg border border-amber-200 mt-2">
                        {ord.deliveryFeeNotice}
                      </p>

                      <div className="pt-2 flex justify-between font-black text-sm text-slate-900 border-t border-slate-100">
                        <span>Total Articles :</span>
                        <span className="text-emerald-700">{formatFCFA(ord.totalFCFA)}</span>
                      </div>
                    </div>
                  </div>

                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 5: SUPPORT & CHATBOT QUESTIONS */}
      {adminTab === 'support' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-6">
          <div>
            <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-amber-600" />
              Questions & Demandes d'Aide Reçues du Chatbot ({chatMessages.filter(m => m.sender === 'user').length})
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Consultez les messages des utilisateurs posés au chatbot et envoyez vos réponses administratives personnalisées directement.
            </p>
          </div>

          {chatMessages.filter(m => m.sender === 'user').length === 0 ? (
            <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-500">
              Aucune question client enregistrée sur le chatbot pour le moment.
            </div>
          ) : (
            <div className="space-y-4">
              {chatMessages.filter(m => m.sender === 'user').reverse().map((msg) => (
                <div key={msg.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-200 pb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-amber-100 text-amber-900 font-black text-xs flex items-center justify-center">
                        {(msg.userName || 'C')[0]}
                      </div>
                      <div>
                        <span className="font-bold text-xs text-slate-900">
                          {msg.userName || 'Client Anonyme'}
                        </span>
                        {(msg.userPhone || msg.userEmail) && (
                          <span className="text-[11px] text-slate-500 ml-2">
                            ({msg.userPhone} {msg.userEmail ? `• ${msg.userEmail}` : ''})
                          </span>
                        )}
                      </div>
                    </div>

                    <span className="text-[10px] text-slate-400 font-semibold">
                      {new Date(msg.timestamp).toLocaleString('fr-FR')}
                    </span>
                  </div>

                  <p className="text-xs text-slate-800 bg-white p-3 rounded-xl border border-slate-200 font-medium">
                    "{msg.text}"
                  </p>

                  {/* Reply Form */}
                  <div className="pt-2 flex items-center gap-2">
                    <input
                      type="text"
                      value={replyTextMap[msg.id] || ''}
                      onChange={(e) => setReplyTextMap({ ...replyTextMap, [msg.id]: e.target.value })}
                      placeholder="Tapez votre réponse admin ici..."
                      className="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-xs outline-none focus:border-amber-500 bg-white"
                    />
                    <button
                      onClick={() => {
                        const reply = replyTextMap[msg.id];
                        if (reply && reply.trim()) {
                          sendAdminChatMessage(`[Réponse Admin à ${msg.userName || 'votre question'}] : ${reply.trim()}`, msg.userId);
                          setReplyTextMap({ ...replyTextMap, [msg.id]: '' });
                          alert('Réponse envoyée au client !');
                        }
                      }}
                      className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-black text-amber-400 font-bold text-xs transition-all flex items-center gap-1.5 shadow-xs"
                    >
                      <Send className="w-3.5 h-3.5 text-amber-400" />
                      Répondre
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 5: ANNOUNCEMENTS MANAGEMENT */}
      {adminTab === 'announcements' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-black text-slate-900">
                Gestion des Annonces Officielles ({announcements.length})
              </h3>
              <p className="text-xs text-slate-500">
                Publiez des annonces sur la page "Annonces" de votre site.
              </p>
            </div>

            <button
              onClick={() => setIsAnnModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs shadow-md"
            >
              + Nouvelle Annonce
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {announcements.map((ann) => (
              <div key={ann.id} className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="bg-emerald-600 text-white font-black text-[9px] px-2 py-0.5 rounded-full uppercase">
                    {ann.badge || 'ANNONCE'}
                  </span>
                  <button
                    onClick={() => deleteAnnouncement(ann.id)}
                    className="p-1 text-rose-500 hover:bg-rose-100 rounded-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <h4 className="font-extrabold text-sm text-slate-900">{ann.title}</h4>
                <p className="text-xs text-slate-600 line-clamp-2">{ann.content}</p>
                <span className="text-[10px] text-slate-400 block pt-1">Date: {ann.date}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 6: BROADCAST NOTIFICATIONS */}
      {adminTab === 'notifications' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-6 max-w-2xl mx-auto">
          <div>
            <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <Bell className="w-5 h-5 text-emerald-600" />
              Diffusion de Notifications aux Clients
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Les clients recevront ces notifications directement sur leur cloche de notification en haut du site.
            </p>
          </div>

          {notifSentAlert && (
            <div className="p-3 rounded-xl bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              Notification envoyée avec succès !
            </div>
          )}

          <form onSubmit={handleSendNotification} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Destinataire :</label>
              <select
                value={notifTargetUserId}
                onChange={(e) => setNotifTargetUserId(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 font-semibold text-slate-800 outline-none"
              >
                <option value="ALL">Tous les Clients (Diffusion Générale)</option>
                {users.filter(u => u.role === 'client').map(u => (
                  <option key={u.id} value={u.id}>
                    {u.firstName} {u.lastName} ({u.email})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Titre de la notification :</label>
              <input
                type="text"
                value={notifTitle}
                onChange={(e) => setNotifTitle(e.target.value)}
                placeholder="Ex: ⚽ Promotion Spéciale Crampons !"
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-medium outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Message :</label>
              <textarea
                value={notifMessage}
                onChange={(e) => setNotifMessage(e.target.value)}
                placeholder="Rédigez votre message d'information ou de promotion..."
                rows={3}
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 outline-none focus:border-emerald-500"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              Envoyer la Notification
            </button>
          </form>
        </div>
      )}

      {/* MODAL: Add/Edit Product */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 max-h-[92vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-xl font-black text-slate-900">
                {editingProduct ? 'Modifier l\'Article Sportif' : 'Ajouter un Nouvel Article sur le Marché'}
              </h3>
              <button
                type="button"
                onClick={() => setIsProductModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
              {/* Name */}
              <div>
                <label className="block font-bold text-slate-800 mb-1">Nom de l'article *</label>
                <input
                  type="text"
                  value={prodName}
                  onChange={(e) => setProdName(e.target.value)}
                  placeholder="Ex: Maillot Officiel Togo D-Elite Pro 2026"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 outline-none focus:border-emerald-500 font-semibold text-slate-900"
                />
              </div>

              {/* Category & Category Selector */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Catégorie *</label>
                  <select
                    value={prodCategory}
                    onChange={(e) => setProdCategory(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 outline-none focus:border-emerald-500 font-semibold"
                  >
                    {categories.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">Nombre d'articles en stock *</label>
                  <input
                    type="number"
                    value={prodStock}
                    onChange={(e) => setProdStock(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="Ex: 10"
                    required
                    min={0}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 outline-none focus:border-emerald-500 font-bold"
                  />
                </div>
              </div>

              {/* Prices: Sale Price & Strikethrough Price */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <span className="font-bold text-slate-800 block text-xs">Tarification FCFA :</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Prix de Vente (FCFA) *</label>
                    <input
                      type="number"
                      value={prodPriceFCFA}
                      onChange={(e) => setProdPriceFCFA(e.target.value === '' ? '' : Number(e.target.value))}
                      placeholder="Ex: 15000"
                      required
                      min={0}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 outline-none focus:border-emerald-500 font-black text-emerald-800 text-sm bg-white"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Prix Barré / Ancien Prix (Optionnel)</label>
                    <input
                      type="number"
                      value={prodOriginalPriceFCFA}
                      onChange={(e) => setProdOriginalPriceFCFA(e.target.value === '' ? '' : Number(e.target.value))}
                      placeholder="Ex: 20000 (Sera affiché barré)"
                      min={0}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 outline-none focus:border-emerald-500 font-semibold text-slate-500 line-through bg-white"
                    />
                  </div>
                </div>
                <p className="text-[10px] text-slate-500 italic">
                  Si un prix barré est indiqué (ex: 20.000 F), l'article affichera 20.000 F barré à côté du prix de vente (15.000 F).
                </p>
              </div>

              {/* Description (Optional) */}
              <div>
                <label className="block font-bold text-slate-800 mb-1">Description courte (Optionnel)</label>
                <textarea
                  value={prodDescription}
                  onChange={(e) => setProdDescription(e.target.value)}
                  placeholder="Informations sur la matière, coupe, utilisation, avantages..."
                  rows={2}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 outline-none focus:border-emerald-500"
                />
              </div>

              {/* Photo Upload: Galerie / Appareil ou URL */}
              <div className="p-3.5 rounded-2xl bg-emerald-50/50 border border-emerald-200 space-y-2.5">
                <label className="block font-bold text-emerald-950 flex items-center gap-1.5">
                  <ImageIcon className="w-4 h-4 text-emerald-700" />
                  Photo de l'Article (Importer depuis votre Galerie photo) :
                </label>
                
                <div className="space-y-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageFileUpload(e, 'product')}
                    className="w-full text-xs text-slate-600 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-emerald-700 file:text-white hover:file:bg-emerald-800 cursor-pointer"
                  />

                  <div className="pt-1">
                    <label className="block font-semibold text-slate-700 mb-1 text-[11px]">Ou saisir un lien URL photo :</label>
                    <input
                      type="text"
                      value={prodImageUrl}
                      onChange={(e) => setProdImageUrl(e.target.value)}
                      placeholder="https://images.unsplash.com/..."
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none bg-white"
                    />
                  </div>
                </div>

                {prodImageUrl && (
                  <div className="relative mt-2 h-32 rounded-xl overflow-hidden bg-slate-200 border border-slate-300">
                    <img src={prodImageUrl} alt="Aperçu" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setProdImageUrl('')}
                      className="absolute top-2 right-2 p-1.5 rounded-full bg-slate-900/80 text-white hover:bg-slate-900"
                      title="Supprimer la photo"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* Featured / Article en vedette */}
              <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-300 flex items-center justify-between">
                <div className="space-y-0.5">
                  <label htmlFor="prodFeaturedToggle" className="font-bold text-amber-950 flex items-center gap-1.5 cursor-pointer">
                    <Star className="w-4 h-4 fill-amber-500 text-amber-600" />
                    Mettre cet article en Vedette
                  </label>
                  <p className="text-[10px] text-amber-800">
                    L'article sera mis en avant en haut de la boutique et de la page d'accueil.
                  </p>
                </div>
                <input
                  id="prodFeaturedToggle"
                  type="checkbox"
                  checked={prodFeatured}
                  onChange={(e) => setProdFeatured(e.target.checked)}
                  className="w-5 h-5 accent-amber-600 cursor-pointer rounded"
                />
              </div>

              {/* Badges & Sizes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Badge / Tag (Optionnel)</label>
                  <select
                    value={prodBadge}
                    onChange={(e) => setProdBadge(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 outline-none font-semibold"
                  >
                    <option value="AUCUN">AUCUN BADGE</option>
                    <option value="PRO">PRO</option>
                    <option value="NOUVEAU">NOUVEAU</option>
                    <option value="TOP VENTE">TOP VENTE</option>
                    <option value="PROMO">PROMO</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">Tailles disponibles (Optionnel)</label>
                  <input
                    type="text"
                    value={prodSizes}
                    onChange={(e) => setProdSizes(e.target.value)}
                    placeholder="Ex: S, M, L, XL ou 39, 40, 41"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 outline-none"
                  />
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center gap-3 pt-3 border-t border-slate-100">
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 shadow-md transition-all flex items-center justify-center gap-1.5"
                >
                  <Sparkles className="w-4 h-4" />
                  Enregistrer l'Article
                </button>
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="px-5 py-3 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs hover:bg-slate-200 transition-colors"
                >
                  Annuler
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: New Announcement */}
      {isAnnModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <h3 className="text-xl font-black text-slate-900">Publier une Annonce</h3>

            <form onSubmit={handleSaveAnnouncement} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Titre de l'Annonce *</label>
                <input
                  type="text"
                  value={annTitle}
                  onChange={(e) => setAnnTitle(e.target.value)}
                  placeholder="Ex: 🔥 Nouveau Stock Crampons 2026 !"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Contenu de l'Annonce *</label>
                <textarea
                  value={annContent}
                  onChange={(e) => setAnnContent(e.target.value)}
                  placeholder="Détails de l'annonce..."
                  rows={3}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Badge Tag</label>
                <input
                  type="text"
                  value={annBadge}
                  onChange={(e) => setAnnBadge(e.target.value)}
                  placeholder="EXCLUSIVITÉ, LIVRAISON, OFFRE..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Photo d'illustration (Optionnel)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageFileUpload(e, 'announcement')}
                  className="w-full text-xs text-slate-600 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-emerald-600 file:text-white"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-xl bg-emerald-600 text-white font-bold"
                >
                  Publier l'Annonce
                </button>
                <button
                  type="button"
                  onClick={() => setIsAnnModalOpen(false)}
                  className="px-4 py-3 rounded-xl bg-slate-100 text-slate-700 font-bold"
                >
                  Annuler
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Role & Permissions Management */}
      {selectedUserForAssistant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-gold/40 space-y-5 overflow-hidden relative">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-950 font-black flex items-center justify-center border border-amber-300">
                  <ShieldCheck className="w-5 h-5 text-amber-700" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900">
                    Nommer & Attribuer des Rôles
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    {selectedUserForAssistant.firstName} {selectedUserForAssistant.lastName} ({selectedUserForAssistant.email})
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedUserForAssistant(null)}
                className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                updateUserRole(
                  selectedUserForAssistant.id,
                  targetUserRole,
                  targetUserRole === 'assistant_admin' ? assistantRolesSelection : undefined
                );
                setSelectedUserForAssistant(null);
              }}
              className="space-y-5 text-xs"
            >
              {/* Role Selection Buttons */}
              <div className="space-y-2">
                <label className="block font-extrabold text-slate-900 text-xs">
                  1. Sélectionner le Type de Rôle *
                </label>
                <div className="grid grid-cols-3 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setTargetUserRole('super_admin')}
                    className={`p-3 rounded-2xl border text-left transition-all ${
                      targetUserRole === 'super_admin'
                        ? 'bg-amber-500 text-slate-950 border-amber-600 font-black shadow-sm ring-2 ring-amber-400/50'
                        : 'bg-slate-50 text-slate-700 border-slate-200 font-semibold hover:bg-slate-100'
                    }`}
                  >
                    <span className="block font-bold text-xs">👑 Super Admin</span>
                    <span className="text-[10px] opacity-80 font-normal">Accès total sans limite</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTargetUserRole('assistant_admin')}
                    className={`p-3 rounded-2xl border text-left transition-all ${
                      targetUserRole === 'assistant_admin'
                        ? 'bg-blue-600 text-white border-blue-700 font-black shadow-sm ring-2 ring-blue-400/50'
                        : 'bg-slate-50 text-slate-700 border-slate-200 font-semibold hover:bg-slate-100'
                    }`}
                  >
                    <span className="block font-bold text-xs">🛡️ Assistant Admin</span>
                    <span className="text-[10px] opacity-80 font-normal">Accès sur mesure</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTargetUserRole('client')}
                    className={`p-3 rounded-2xl border text-left transition-all ${
                      targetUserRole === 'client'
                        ? 'bg-slate-800 text-white border-slate-900 font-black shadow-sm'
                        : 'bg-slate-50 text-slate-700 border-slate-200 font-semibold hover:bg-slate-100'
                    }`}
                  >
                    <span className="block font-bold text-xs">👤 Client</span>
                    <span className="text-[10px] opacity-80 font-normal">Utilisateur standard</span>
                  </button>
                </div>
              </div>

              {/* Permissions Checklist */}
              {targetUserRole === 'assistant_admin' && (
                <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="block font-extrabold text-blue-950 text-xs">
                      2. Choisir les Permissions de l'Assistant *
                    </label>
                    <div className="space-x-2 text-[10px]">
                      <button
                        type="button"
                        onClick={() => setAssistantRolesSelection(['products', 'orders', 'users', 'announcements', 'chat'])}
                        className="text-blue-700 font-bold hover:underline"
                      >
                        Tout cocher
                      </button>
                      <span>•</span>
                      <button
                        type="button"
                        onClick={() => setAssistantRolesSelection([])}
                        className="text-slate-500 hover:underline"
                      >
                        Tout décocher
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2 pt-1">
                    {[
                      { id: 'products', label: '📦 Gestion des Produits & Stock', desc: 'Créer, modifier et supprimer les articles et catégories' },
                      { id: 'orders', label: '🛍️ Gestion des Commandes & Livraisons', desc: 'Valider les commandes et suivre l\'état des livraisons' },
                      { id: 'users', label: '👥 Consultation des Clients', desc: 'Voir les coordonnées complètes des personnes inscrites' },
                      { id: 'announcements', label: '📢 Gestion des Annonces & Bannières', desc: 'Publier et modifier les offres bannières sur la boutique' },
                      { id: 'chat', label: '💬 Chat Support Client', desc: 'Répondre directement aux questions clients sur le chat' },
                    ].map((perm) => {
                      const isChecked = assistantRolesSelection.includes(perm.id as AssistantRolePermission);
                      return (
                        <label
                          key={perm.id}
                          className={`flex items-start gap-3 p-2.5 rounded-xl border transition-all cursor-pointer ${
                            isChecked ? 'bg-white border-blue-400 shadow-xs' : 'bg-slate-50 border-slate-200/80 opacity-70'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setAssistantRolesSelection(prev => [...prev, perm.id as AssistantRolePermission]);
                              } else {
                                setAssistantRolesSelection(prev => prev.filter(r => r !== perm.id));
                              }
                            }}
                            className="mt-0.5 accent-blue-600 w-4 h-4 rounded"
                          />
                          <div>
                            <span className="font-bold text-slate-900 block text-xs">{perm.label}</span>
                            <span className="text-[11px] text-slate-500 leading-tight block font-light">{perm.desc}</span>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-3 px-4 rounded-xl bg-ink text-gold border border-gold/40 font-bold text-xs hover:bg-stone-900 shadow-md transition-all flex items-center justify-center gap-2"
                >
                  <ShieldCheck className="w-4 h-4 text-gold" />
                  Enregistrer le Rôle & Permissions
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedUserForAssistant(null)}
                  className="px-4 py-3 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs hover:bg-slate-200"
                >
                  Annuler
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Create New Admin or Assistant */}
      {isCreateUserModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-gold/40 space-y-4 overflow-hidden relative">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-ink text-gold font-black flex items-center justify-center border border-gold/40">
                  <UserCheck className="w-5 h-5 text-gold" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">
                    Nommer un Nouvel Administrateur / Assistant
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Créez directement un compte administrateur avec son mot de passe et ses accès.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsCreateUserModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {userModalError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
                {userModalError}
              </div>
            )}

            <form
              onSubmit={(e) => {
                e.preventDefault();
                setUserModalError('');
                if (!newLastName || !newFirstName || !newEmail || !newPassword) {
                  setUserModalError('Veuillez remplir tous les champs obligatoires (*).');
                  return;
                }

                const regResult = registerUser({
                  lastName: newLastName,
                  firstName: newFirstName,
                  phone: newPhone || '00000000',
                  email: newEmail,
                  password: newPassword
                });

                if (!regResult.success) {
                  setUserModalError(regResult.message);
                  return;
                }

                if (regResult.user) {
                  updateUserRole(
                    regResult.user.id,
                    newRole,
                    newRole === 'assistant_admin' ? newAssistantRoles : undefined
                  );
                }

                setIsCreateUserModalOpen(false);
                setNewLastName('');
                setNewFirstName('');
                setNewPhone('');
                setNewEmail('');
                setNewPassword('');
                setNewRole('assistant_admin');
                setNewAssistantRoles(['products', 'orders']);
              }}
              className="space-y-3.5 text-xs"
            >
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Nom *</label>
                  <input
                    type="text"
                    value={newLastName}
                    onChange={(e) => setNewLastName(e.target.value)}
                    placeholder="Ex: KONAN"
                    required
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Prénom *</label>
                  <input
                    type="text"
                    value={newFirstName}
                    onChange={(e) => setNewFirstName(e.target.value)}
                    placeholder="Ex: Jean"
                    required
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Numéro Téléphone</label>
                  <input
                    type="tel"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    placeholder="Ex: 07 00 00 00 00"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Adresse Email *</label>
                  <input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="admin@donaldson.com"
                    required
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Mot de passe de Connexion *</label>
                <input
                  type="text"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Choisissez un mot de passe sécurisé"
                  required
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono outline-none focus:border-amber-500"
                />
              </div>

              {/* Role */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Rôle attribué *</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setNewRole('assistant_admin')}
                    className={`py-2 px-3 rounded-xl border font-bold text-xs text-center transition-all ${
                      newRole === 'assistant_admin'
                        ? 'bg-blue-600 text-white border-blue-700'
                        : 'bg-slate-50 text-slate-700 border-slate-200'
                    }`}
                  >
                    🛡️ Admin Assistant
                  </button>

                  <button
                    type="button"
                    onClick={() => setNewRole('super_admin')}
                    className={`py-2 px-3 rounded-xl border font-bold text-xs text-center transition-all ${
                      newRole === 'super_admin'
                        ? 'bg-amber-500 text-slate-950 border-amber-600'
                        : 'bg-slate-50 text-slate-700 border-slate-200'
                    }`}
                  >
                    👑 Super Admin
                  </button>
                </div>
              </div>

              {/* Assistant roles check if newRole is assistant */}
              {newRole === 'assistant_admin' && (
                <div className="p-3 rounded-2xl bg-blue-50/70 border border-blue-200 space-y-2">
                  <span className="font-extrabold text-blue-950 block">Permissions accordées :</span>
                  <div className="grid grid-cols-2 gap-1.5">
                    {[
                      { id: 'products', label: '📦 Produits & Stock' },
                      { id: 'orders', label: '🛍️ Commandes' },
                      { id: 'users', label: '👥 Clients' },
                      { id: 'announcements', label: '📢 Annonces' },
                      { id: 'chat', label: '💬 Chat Support' },
                    ].map((p) => {
                      const isChecked = newAssistantRoles.includes(p.id as AssistantRolePermission);
                      return (
                        <label key={p.id} className="flex items-center gap-2 cursor-pointer text-[11px] font-semibold text-slate-800">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setNewAssistantRoles(prev => [...prev, p.id as AssistantRolePermission]);
                              } else {
                                setNewAssistantRoles(prev => prev.filter(r => r !== p.id));
                              }
                            }}
                            className="accent-blue-600 rounded w-3.5 h-3.5"
                          />
                          <span>{p.label}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2.5 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-3 px-4 rounded-xl bg-ink text-gold border border-gold/40 font-bold text-xs hover:bg-stone-900 transition-all shadow-md"
                >
                  Créer & Valider le Compte
                </button>

                <button
                  type="button"
                  onClick={() => setIsCreateUserModalOpen(false)}
                  className="px-4 py-3 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs"
                >
                  Annuler
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
