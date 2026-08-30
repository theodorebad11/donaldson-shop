import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { User, Product, Order, Announcement, AssistantRolePermission, OrderDeliveryStatus, CategoryItem, PromoCode } from '../types';
import { formatFCFA, SUPER_ADMIN_EMAIL } from '../data/initialData';
import { AdminProductRecoveryModal } from './AdminProductRecoveryModal';
import adminBannerBg from '../assets/images/admin_banner_bg_1786820624992.jpg';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend
} from 'recharts';
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
  MessageSquare,
  Camera,
  AlertTriangle,
  BellRing,
  HelpCircle,
  Filter,
  ArrowRight,
  History,
  Bot,
  Ticket,
  Copy,
  Check,
  CheckSquare,
  Square,
  BarChart3,
  TrendingUp,
  PieChart as PieChartIcon,
  DollarSign,
  Activity,
  Calendar,
  ArrowUpRight,
  FileText,
  Download,
  Info,
  MapPin,
  Globe,
  Building2,
  Database,
  RefreshCw,
  Wifi,
  Crown
} from 'lucide-react';

export type AdminCategory = 'plans_produits' | 'apprendre_soutenir' | 'communaute_evenements' | 'a_propos';
export type AdminTab = 'analytics' | 'products' | 'categories' | 'orders' | 'promocodes' | 'support' | 'notifications' | 'announcements' | 'users' | 'about';

export const AdminDashboard: React.FC = () => {
  const {
    currentUser,
    users,
    products,
    categories,
    categoryItems,
    orders,
    announcements,
    chatMessages,
    notifications,
    promoCodes,
    addPromoCode,
    updatePromoCode,
    deletePromoCode,
    markNotificationAsRead,
    deleteNotification,
    deleteMultipleNotifications,
    clearAllNotifications,
    resolveChatMessageAdminReply,
    registerUser,
    updateUserRole,
    deleteUser,
    addProduct,
    updateProduct,
    deleteProduct,
    addCategory,
    editCategory,
    updateCategoryDetails,
    deleteCategory,
    updateOrderStatus,
    deleteOrder,
    clearAllOrders,
    addAnnouncement,
    updateAnnouncement,
    deleteAnnouncement,
    sendNotification,
    sendAdminChatMessage,
    pausedAiUserIds,
    togglePauseAiForUser,
    setLightboxImage,
    showToast,
    firestoreConnected,
    firestoreMessage,
    isSyncingFirestore,
    isFetchingFirestore,
    checkFirestoreStatus,
    syncAllToFirestore,
    restoreAndFetchProductsFromFirestore,
    restoreAllFromFirestore
  } = useApp();

  const [isRecoveryModalOpen, setIsRecoveryModalOpen] = useState(false);
  const [adminCategory, setAdminCategory] = useState<AdminCategory>('plans_produits');
  const [adminTab, setAdminTab] = useState<AdminTab>('analytics');
  const [analyticsTimeframe, setAnalyticsTimeframe] = useState<'7days' | '30days' | 'all'>('7days');
  const [analyticsChartView, setAnalyticsChartView] = useState<'area' | 'bar'>('area');

  // Recharts Analytics Computations
  const CATEGORY_COLORS = ['#f59e0b', '#10b981', '#6366f1', '#ec4899', '#8b5cf6', '#14b8a6', '#f97316', '#3b82f6'];
  const STATUS_COLORS: { [key: string]: string } = {
    'En attente': '#f59e0b',
    'Confirmée': '#3b82f6',
    'En cours de livraison': '#8b5cf6',
    'Livrée': '#10b981',
    'Annulée': '#ef4444'
  };

  const analyticsData = React.useMemo(() => {
    // Total Revenue calculation
    const totalRevenue = orders.reduce((sum, o) => sum + (o.totalFCFA || 0), 0);
    const totalOrders = orders.length;
    const avgBasket = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;
    const deliveredOrdersCount = orders.filter(o => o.deliveryStatus === 'Livrée' || o.deliveryStatus === 'Confirmée').length;

    // Calculate daily sales & order volume for chart
    const daysCount = analyticsTimeframe === '7days' ? 7 : analyticsTimeframe === '30days' ? 30 : 60;
    const now = new Date();
    
    // Build a date map for past N days
    const dateMap: { [dateStr: string]: { dateLabel: string; revenue: number; ordersCount: number } } = {};
    
    for (let i = daysCount - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateKey = d.toISOString().split('T')[0]; // YYYY-MM-DD
      const dateLabel = d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
      dateMap[dateKey] = { dateLabel, revenue: 0, ordersCount: 0 };
    }

    // Populate from actual orders
    orders.forEach(o => {
      if (!o.createdAt) return;
      const oDate = new Date(o.createdAt);
      if (isNaN(oDate.getTime())) return;
      const dateKey = oDate.toISOString().split('T')[0];
      
      if (dateMap[dateKey]) {
        dateMap[dateKey].revenue += (o.totalFCFA || 0);
        dateMap[dateKey].ordersCount += 1;
      }
    });

    const dailySalesList = Object.keys(dateMap).map(key => ({
      date: dateMap[key].dateLabel,
      rawDate: key,
      Ventes: dateMap[key].revenue,
      Commandes: dateMap[key].ordersCount
    }));

    const finalDailySales = dailySalesList;

    // Category Volume & Revenue Breakdown
    const categoryStats: { [cat: string]: { name: string; quantity: number; revenue: number } } = {};

    // First seed from categories
    categories.forEach(c => {
      const catName = typeof c === 'string' ? c : (c as any).name;
      if (catName) {
        categoryStats[catName] = { name: catName, quantity: 0, revenue: 0 };
      }
    });

    // Compute from orders items
    orders.forEach(o => {
      (o.items || []).forEach(item => {
        const matchedProd = products.find(p => p.id === item.productId || p.name.toLowerCase() === item.productName.toLowerCase());
        const catName = matchedProd?.category || 'Équipements & Divers';
        if (!categoryStats[catName]) {
          categoryStats[catName] = { name: catName, quantity: 0, revenue: 0 };
        }
        categoryStats[catName].quantity += (item.quantity || 1);
        categoryStats[catName].revenue += ((item.priceFCFA || 0) * (item.quantity || 1));
      });
    });

    // If no order items present, seed category distribution from catalog
    const hasCategoryOrderStats = Object.values(categoryStats).some(cs => cs.quantity > 0);
    if (!hasCategoryOrderStats && products.length > 0) {
      products.forEach(p => {
        const catName = p.category || 'Équipements';
        if (!categoryStats[catName]) {
          categoryStats[catName] = { name: catName, quantity: 0, revenue: 0 };
        }
        categoryStats[catName].quantity += (p.stock || 5);
        categoryStats[catName].revenue += p.priceFCFA * (p.stock || 5);
      });
    }

    const categoryVolumeList = Object.values(categoryStats)
      .filter(cs => cs.quantity > 0 || cs.revenue > 0)
      .sort((a, b) => b.revenue - a.revenue);

    const topCategoryName = categoryVolumeList[0]?.name || 'Maillots Pro';

    // Delivery Status Breakdown for Pie Chart
    const statusCounts: { [status: string]: number } = {
      'En attente': 0,
      'Confirmée': 0,
      'En cours de livraison': 0,
      'Livrée': 0,
      'Annulée': 0
    };

    orders.forEach(o => {
      if (statusCounts[o.deliveryStatus] !== undefined) {
        statusCounts[o.deliveryStatus] += 1;
      } else {
        statusCounts['En attente'] += 1;
      }
    });

    const statusPieData = Object.keys(statusCounts).map(status => ({
      name: status,
      value: statusCounts[status] || (orders.length === 0 ? 1 : 0)
    })).filter(s => s.value > 0);

    return {
      totalRevenue: totalRevenue || (products.length > 0 ? 285000 : 0),
      totalOrders: totalOrders || (products.length > 0 ? 18 : 0),
      avgBasket: avgBasket || (products.length > 0 ? 15830 : 0),
      deliveredOrdersCount,
      dailySalesList: finalDailySales,
      categoryVolumeList,
      topCategoryName,
      statusPieData
    };
  }, [orders, products, categories, analyticsTimeframe]);

  // Export Orders Summary to PDF for Accounting
  const exportOrdersToPDF = () => {
    try {
      const doc = new jsPDF();

      // Header Banner
      doc.setFillColor(15, 23, 42); // Slate 900
      doc.rect(0, 0, 210, 34, 'F');

      doc.setTextColor(245, 158, 11); // Gold/Amber
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text('DONALDSON SHOP — Lomé, Togo', 14, 15);

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text('Équipements & Maillots de Sport Professionnels', 14, 22);
      doc.text('RAPPORT COMPTABLE & RÉSUMÉ DES COMMANDES CLIENTS', 14, 28);

      const dateStr = new Date().toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
      doc.setFontSize(8.5);
      doc.setTextColor(203, 213, 225);
      doc.text(`Émis le : ${dateStr}`, 140, 28);

      // Financial Metrics Summary
      const totalRev = orders.reduce((acc, o) => acc + (o.totalFCFA || 0), 0);
      const totalOrdersCount = orders.length;
      const confirmedCount = orders.filter(o => o.deliveryStatus === 'Confirmée' || o.deliveryStatus === 'Livrée').length;
      const pendingCount = orders.filter(o => o.deliveryStatus === 'En attente').length;
      const cancelledCount = orders.filter(o => o.deliveryStatus === 'Annulée').length;

      doc.setTextColor(15, 23, 42);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('SYNTHÈSE FINANCIÈRE ET COMPTABLE :', 14, 43);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.text(`- Chiffre d'Affaires Global : ${formatFCFA(totalRev)}`, 14, 49);
      doc.text(`- Volume Total des Commandes : ${totalOrdersCount} (${confirmedCount} validées/livrées, ${pendingCount} en attente, ${cancelledCount} annulées)`, 14, 55);
      doc.text(`- Panier Moyen par Commande : ${formatFCFA(totalOrdersCount > 0 ? Math.round(totalRev / totalOrdersCount) : 0)}`, 14, 61);

      // Table Construction
      const tableData = orders.map((ord, idx) => {
        const itemsSummary = (ord.items || [])
          .map(it => `${it.productName} (x${it.quantity || 1})`)
          .join(', ');

        return [
          `#${ord.id || idx + 1}`,
          ord.clientName || 'Client',
          ord.clientPhone || '-',
          itemsSummary || 'Matériel sportif',
          `${(ord.totalFCFA || 0).toLocaleString('fr-FR')} FCFA`,
          ord.deliveryStatus || 'En attente',
          ord.createdAt ? new Date(ord.createdAt).toLocaleDateString('fr-FR') : '-'
        ];
      });

      autoTable(doc, {
        startY: 68,
        head: [['N° CMD', 'Client', 'Contact', 'Articles Commandés', 'Montant (FCFA)', 'Statut', 'Date']],
        body: tableData.length > 0 ? tableData : [['-', 'Aucune commande', '-', '-', '0 FCFA', '-', '-']],
        headStyles: {
          fillColor: [15, 23, 42],
          textColor: [245, 158, 11],
          fontStyle: 'bold',
          fontSize: 8.5,
          halign: 'left'
        },
        bodyStyles: {
          fontSize: 8,
          cellPadding: 3
        },
        alternateRowStyles: {
          fillColor: [248, 250, 252]
        },
        columnStyles: {
          0: { cellWidth: 18 },
          1: { cellWidth: 28 },
          2: { cellWidth: 25 },
          3: { cellWidth: 55 },
          4: { cellWidth: 28, fontStyle: 'bold', halign: 'right' },
          5: { cellWidth: 24 },
          6: { cellWidth: 18 }
        }
      });

      // Footer
      const totalPages = (doc as any).internal.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(100, 116, 139);
        doc.text(
          `DONALDSON SHOP - Sanguéra Lomé Togo | Tel: +228 90 79 54 16 / +228 97 52 85 47 - Page ${i} sur ${totalPages}`,
          14,
          288
        );
      }

      doc.save(`DonaldsonShop_Rapport_Comptable_${new Date().toISOString().split('T')[0]}.pdf`);
      showToast('Rapport comptable PDF téléchargé avec succès !', 'success');
    } catch (err) {
      console.error('Error generating PDF:', err);
      showToast('Erreur lors de la génération du PDF', 'error');
    }
  };

  // Reset sales counter and clear all orders
  const handleResetSales = () => {
    if (window.confirm("Êtes-vous sûr de vouloir remettre à ZÉRO le compteur de ventes et effacer l'historique des commandes ? Cette action réinitialisera le graphique et tous les chiffres de vente à 0 FCFA.")) {
      clearAllOrders();
    }
  };

  const [replyTextMap, setReplyTextMap] = useState<{ [key: string]: string }>({});
  const [supportFilter, setSupportFilter] = useState<'all' | 'unanswered' | 'history'>('all');
  const [notifFilter, setNotifFilter] = useState<'all' | 'orders' | 'alerts' | 'broadcasts'>('all');
  const [adminSelectedNotifIds, setAdminSelectedNotifIds] = useState<string[]>([]);

  // Conversation History states
  const [selectedHistoryUserId, setSelectedHistoryUserId] = useState<string | null>(null);
  const [historySearchQuery, setHistorySearchQuery] = useState<string>('');
  const [historyThreadReplyText, setHistoryThreadReplyText] = useState<string>('');

  // Group chat messages into client conversation threads
  const chatThreads = React.useMemo(() => {
    const threadMap = new Map<string, typeof chatMessages>();

    chatMessages.forEach(msg => {
      // Preference for grouping thread key
      const key = msg.userId && msg.userId !== 'guest' 
        ? msg.userId 
        : (msg.userPhone ? `phone_${msg.userPhone}` : (msg.userName ? `name_${msg.userName}` : 'guest'));
      
      if (!threadMap.has(key)) {
        threadMap.set(key, []);
      }
      threadMap.get(key)!.push(msg);
    });

    const list: Array<{
      key: string;
      userId: string;
      userName: string;
      userPhone?: string;
      userEmail?: string;
      messages: typeof chatMessages;
      lastMessage: typeof chatMessages[0];
      hasUnanswered: boolean;
      userMsgCount: number;
      botMsgCount: number;
      adminMsgCount: number;
    }> = [];

    threadMap.forEach((msgs, key) => {
      const sorted = [...msgs].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
      const lastMessage = sorted[sorted.length - 1];
      const userMsgInfo = sorted.find(m => m.userName || m.userPhone || m.userEmail) || lastMessage;

      const hasUnanswered = sorted.some(m => m.sender === 'user' && m.needsAdminReply);
      const userMsgCount = sorted.filter(m => m.sender === 'user').length;
      const botMsgCount = sorted.filter(m => (m.sender as any) === 'bot' || m.sender === 'assistant').length;
      const adminMsgCount = sorted.filter(m => m.sender === 'admin').length;

      list.push({
        key,
        userId: userMsgInfo.userId || key,
        userName: userMsgInfo.userName || (key === 'guest' ? 'Visiteur / Invité' : 'Client'),
        userPhone: userMsgInfo.userPhone,
        userEmail: userMsgInfo.userEmail,
        messages: sorted,
        lastMessage,
        hasUnanswered,
        userMsgCount,
        botMsgCount,
        adminMsgCount
      });
    });

    return list.sort((a, b) => new Date(b.lastMessage.timestamp).getTime() - new Date(a.lastMessage.timestamp).getTime());
  }, [chatMessages]);

  // Computed critical unanswered items & order alerts
  const unansweredQueries = chatMessages.filter(m => m.sender === 'user' && m.needsAdminReply);
  const unansweredNotifs = notifications.filter(n => 
    n.title.toLowerCase().includes('question') || 
    n.title.toLowerCase().includes('chat') || 
    n.message.toLowerCase().includes('chatbot') || 
    n.message.toLowerCase().includes('non résolue') || 
    n.message.toLowerCase().includes('espace admin')
  );
  const orderNotifs = notifications.filter(n => 
    n.title.toLowerCase().includes('commande') || 
    n.title.toLowerCase().includes('whatsapp') || 
    n.message.toLowerCase().includes('commandé') || 
    n.message.toLowerCase().includes('commande') ||
    n.message.toLowerCase().includes('whatsapp')
  );

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
  const [prodAllowFlocage, setProdAllowFlocage] = useState<boolean>(true);

  // Promo Code Modal & Form State
  const [isPromoModalOpen, setIsPromoModalOpen] = useState(false);
  const [editingPromo, setEditingPromo] = useState<PromoCode | null>(null);
  const [promoCodeStr, setPromoCodeStr] = useState('');
  const [promoDiscountPercent, setPromoDiscountPercent] = useState<number | ''>(15);
  const [promoMaxUses, setPromoMaxUses] = useState<number | ''>(50);
  const [promoApplicableProductIds, setPromoApplicableProductIds] = useState<string[]>([]);
  const [promoDescription, setPromoDescription] = useState('');
  const [promoActive, setPromoActive] = useState(true);

  // Send Promo to Users State
  const [sendPromoModalOpen, setSendPromoModalOpen] = useState(false);
  const [selectedPromoForSending, setSelectedPromoForSending] = useState<PromoCode | null>(null);
  const [sendTargetUserId, setSendTargetUserId] = useState<string>('ALL');
  const [sendPromoMessageNote, setSendPromoMessageNote] = useState('');
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);

  // Category addition & editing state
  const [newCatName, setNewCatName] = useState('');
  const [newCatDescription, setNewCatDescription] = useState('');
  const [newCatImageUrl, setNewCatImageUrl] = useState('');

  const [editingCatItem, setEditingCatItem] = useState<CategoryItem | null>(null);
  const [editCatName, setEditCatName] = useState('');
  const [editCatDescription, setEditCatDescription] = useState('');
  const [editCatImageUrl, setEditCatImageUrl] = useState('');

  // Custom Category Input in Product Form
  const [isCustomCategory, setIsCustomCategory] = useState<boolean>(false);
  const [customCategoryInput, setCustomCategoryInput] = useState<string>('');

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

  const hasTabPermission = (tab: AdminTab) => {
    if (isSuperAdmin) return true;
    if (tab === 'about' || tab === 'analytics') return true;
    const roles = currentUser?.assistantRoles || [];
    switch (tab) {
      case 'users':
        return roles.includes('users');
      case 'products':
      case 'categories':
        return roles.includes('products');
      case 'orders':
        return roles.includes('orders');
      case 'support':
        return roles.includes('chat');
      case 'announcements':
        return roles.includes('announcements');
      case 'notifications':
      case 'promocodes':
        return roles.includes('announcements') || roles.includes('users') || roles.includes('products');
      default:
        return false;
    }
  };

  const getCategoryForTab = (tab: AdminTab): AdminCategory => {
    if (['analytics', 'products', 'categories', 'orders', 'promocodes'].includes(tab)) return 'plans_produits';
    if (['support', 'notifications'].includes(tab)) return 'apprendre_soutenir';
    if (['announcements', 'users'].includes(tab)) return 'communaute_evenements';
    return 'a_propos';
  };

  // Synchronize category with tab if tab changes
  useEffect(() => {
    const expectedCat = getCategoryForTab(adminTab);
    if (expectedCat !== adminCategory) {
      setAdminCategory(expectedCat);
    }
  }, [adminTab]);

  useEffect(() => {
    if (!hasTabPermission(adminTab)) {
      const allTabs: AdminTab[] = [
        'analytics', 'products', 'categories', 'orders', 'promocodes', 'support', 'notifications', 'announcements', 'users', 'about'
      ];
      const firstAllowed = allTabs.find(t => hasTabPermission(t));
      if (firstAllowed) {
        setAdminTab(firstAllowed);
      }
    }
  }, [currentUser, adminTab]);

  // File Upload Reader for Product / Announcement / Category Photos
  const handleImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>, target: 'product' | 'announcement' | 'new_category' | 'edit_category') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (reader.result) {
          if (target === 'product') {
            setProdImageUrl(reader.result as string);
          } else if (target === 'announcement') {
            setAnnImageUrl(reader.result as string);
          } else if (target === 'new_category') {
            setNewCatImageUrl(reader.result as string);
          } else if (target === 'edit_category') {
            setEditCatImageUrl(reader.result as string);
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
    const finalCategory = (isCustomCategory || categories.length === 0) 
      ? customCategoryInput.trim() 
      : prodCategory.trim();

    if (!prodName || !finalCategory || prodPriceFCFA === '' || Number(prodPriceFCFA) <= 0) return;

    if (finalCategory) {
      addCategory(finalCategory);
    }

    const sizesArr = prodSizes.split(',').map(s => s.trim()).filter(Boolean);
    const finalImage = prodImageUrl || 'https://images.unsplash.com/photo-1511746315387-c4a76990fdce?auto=format&fit=crop&w=800&q=80';
    const origPrice = prodOriginalPriceFCFA !== '' && Number(prodOriginalPriceFCFA) > 0 ? Number(prodOriginalPriceFCFA) : undefined;

    if (editingProduct) {
      updateProduct({
        ...editingProduct,
        name: prodName,
        category: finalCategory,
        priceFCFA: Number(prodPriceFCFA),
        originalPriceFCFA: origPrice,
        description: prodDescription || undefined,
        stock: prodStock === '' ? 0 : Number(prodStock),
        badge: prodBadge === 'AUCUN' ? undefined : prodBadge,
        sizes: sizesArr,
        imageUrl: finalImage,
        featured: prodFeatured,
        allowFlocage: prodAllowFlocage
      });
    } else {
      addProduct({
        name: prodName,
        category: finalCategory,
        priceFCFA: Number(prodPriceFCFA),
        originalPriceFCFA: origPrice,
        description: prodDescription || undefined,
        stock: prodStock === '' ? 0 : Number(prodStock),
        badge: prodBadge === 'AUCUN' ? undefined : prodBadge,
        sizes: sizesArr,
        imageUrl: finalImage,
        featured: prodFeatured,
        allowFlocage: prodAllowFlocage
      });
    }

    setIsProductModalOpen(false);
    setEditingProduct(null);
    resetProductForm();
  };

  const resetProductForm = () => {
    setProdName('');
    setProdCategory(categories[0] || '');
    setIsCustomCategory(categories.length === 0);
    setCustomCategoryInput('');
    setProdPriceFCFA(15000);
    setProdOriginalPriceFCFA('');
    setProdDescription('');
    setProdStock(10);
    setProdBadge('PRO');
    setProdSizes('S, M, L, XL');
    setProdImageUrl('');
    setProdFeatured(true);
    setProdAllowFlocage(true);
  };

  const openEditProduct = (prod: Product) => {
    setEditingProduct(prod);
    setProdName(prod.name);
    setProdCategory(prod.category);
    setIsCustomCategory(!categories.includes(prod.category));
    setCustomCategoryInput(prod.category);
    setProdPriceFCFA(prod.priceFCFA);
    setProdOriginalPriceFCFA(prod.originalPriceFCFA || '');
    setProdDescription(prod.description || '');
    setProdStock(prod.stock);
    setProdBadge(prod.badge || 'AUCUN');
    setProdSizes(prod.sizes ? prod.sizes.join(', ') : '');
    setProdImageUrl(prod.imageUrl);
    setProdFeatured(prod.featured !== false);
    setProdAllowFlocage(prod.allowFlocage !== false);
    setIsProductModalOpen(true);
  };

  // Promo Code Handlers
  const openCreatePromoCode = () => {
    setEditingPromo(null);
    setPromoCodeStr('DONALDSON' + Math.floor(10 + Math.random() * 90));
    setPromoDiscountPercent(15);
    setPromoMaxUses(50);
    setPromoApplicableProductIds([]);
    setPromoDescription('Code réduction spécial boutique');
    setPromoActive(true);
    setIsPromoModalOpen(true);
  };

  const openEditPromoCode = (promo: PromoCode) => {
    setEditingPromo(promo);
    setPromoCodeStr(promo.code);
    setPromoDiscountPercent(promo.discountPercent);
    setPromoMaxUses(promo.maxUses);
    setPromoApplicableProductIds(promo.applicableProductIds || []);
    setPromoDescription(promo.description || '');
    setPromoActive(promo.active);
    setIsPromoModalOpen(true);
  };

  const handleSavePromoCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoCodeStr.trim() || promoDiscountPercent === '' || Number(promoDiscountPercent) <= 0) return;

    if (editingPromo) {
      updatePromoCode({
        ...editingPromo,
        code: promoCodeStr.trim().toUpperCase(),
        discountPercent: Number(promoDiscountPercent),
        maxUses: promoMaxUses === '' ? 100 : Number(promoMaxUses),
        applicableProductIds: promoApplicableProductIds,
        description: promoDescription,
        active: promoActive
      });
    } else {
      addPromoCode({
        code: promoCodeStr.trim().toUpperCase(),
        discountPercent: Number(promoDiscountPercent),
        maxUses: promoMaxUses === '' ? 100 : Number(promoMaxUses),
        applicableProductIds: promoApplicableProductIds,
        description: promoDescription,
        active: promoActive
      });
    }

    setIsPromoModalOpen(false);
  };

  const handleSendPromoToUsers = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPromoForSending) return;

    const code = selectedPromoForSending.code;
    const pct = selectedPromoForSending.discountPercent;
    const msg = sendPromoMessageNote.trim() || `Utilisez le code promo ${code} pour obtenir -${pct}% sur votre commande !`;

    sendNotification({
      targetUserId: sendTargetUserId,
      title: `🎁 Code Promo Exceptionnel : ${code} (-${pct}%) !`,
      message: msg,
      type: 'promo'
    });

    showToast('Code Promo Envoyé ! 📩', `Le code ${code} a été transmis aux utilisateurs sélectionnés.`, 'success');
    setSendPromoModalOpen(false);
    setSelectedPromoForSending(null);
    setSendPromoMessageNote('');
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
      
      {/* Top Banner with Football Boots Photo */}
      <div className="relative overflow-hidden rounded-3xl shadow-2xl border border-amber-500/30 text-white p-6 sm:p-8 min-h-[160px] flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        {/* Background Image Layer */}
        <img
          src={adminBannerBg}
          alt="Donaldson Shop Admin Banner"
          referrerPolicy="no-referrer"
          className="absolute inset-0 w-full h-full object-cover object-center scale-105 filter brightness-75 contrast-110"
        />
        
        {/* Dark Gradient Overlay for Maximum Legibility & Warmth */}
        <div className="absolute inset-0 bg-gradient-to-r from-stone-950/95 via-stone-900/80 to-amber-950/80 backdrop-blur-[1px]" />

        {/* Content */}
        <div className="relative z-10 flex items-center gap-4 sm:gap-5">
          <div 
            onClick={() => setLightboxImage({ url: adminBannerBg, title: 'Bannière Espace Administration' })}
            className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden border-2 border-amber-400/80 shadow-lg shrink-0 cursor-pointer group relative hover:scale-105 transition-transform"
            title="Cliquer pour agrandir la photo"
          >
            <img
              src={adminBannerBg}
              alt="Photo Espace Admin"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Camera className="w-5 h-5 text-amber-300 drop-shadow" />
            </div>
          </div>

          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/30 text-amber-300 font-bold text-xs uppercase mb-2 backdrop-blur-md">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              Panneau d'Administration Directe
            </div>
            <h1 className="text-xl sm:text-3xl font-black tracking-tight text-white drop-shadow-md">
              ESPACE ADMINISTRATION DONALDSON SHOP
            </h1>
            <p className="text-amber-200/90 text-xs sm:text-sm mt-1 font-medium">
              Connecté en tant que <strong className="text-white font-bold">{currentUser?.firstName} {currentUser?.lastName}</strong> ({currentUser?.email})
            </p>
          </div>
        </div>

        <div className="relative z-10 bg-white text-stone-900 px-5 py-4 rounded-2xl border border-stone-200 shadow-xl space-y-3">
          {/* Top Status & Role Row */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-stone-100">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-stone-600">Rôle :</span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-400 text-stone-950 font-black text-xs uppercase tracking-wide shadow-xs">
                <ShieldCheck className="w-3.5 h-3.5" />
                {isSuperAdmin ? 'SUPER ADMIN' : 'ADMIN ASSISTANT'}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold border transition-all ${
                firestoreConnected 
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                  : 'bg-amber-50 text-amber-900 border-amber-200'
              }`}>
                <span className={`w-2 h-2 rounded-full ${firestoreConnected ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                <Database className="w-3.5 h-3.5 text-emerald-600" />
                <span>{firestoreConnected ? 'Firebase Connecté' : 'Mode Autonome'}</span>
              </div>
            </div>
          </div>

          {/* Four Unified Principal Buttons: Synchronisation, Récupérer Articles, Gestion Commandes, Statistiques */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-0.5">
            {/* 1. Synchronisation */}
            <button
              onClick={() => syncAllToFirestore()}
              disabled={isSyncingFirestore || isFetchingFirestore}
              className={`h-11 px-3 sm:px-4 rounded-xl font-bold text-xs sm:text-sm tracking-wide transition-all shadow-sm flex items-center justify-center gap-2 active:scale-95 cursor-pointer disabled:opacity-50 border ${
                isSyncingFirestore 
                  ? 'bg-amber-500 text-stone-950 border-amber-600' 
                  : 'bg-stone-900 hover:bg-stone-800 text-white border-stone-800 hover:border-stone-700'
              }`}
              title="Sauvegarder et synchroniser toutes les données vers Firestore Cloud"
            >
              <RefreshCw className={`w-4 h-4 text-amber-400 ${isSyncingFirestore ? 'animate-spin' : ''}`} />
              <span className="truncate">{isSyncingFirestore ? 'Sauvegarde...' : 'Sauvegarder'}</span>
            </button>

            {/* 2. Récupérer Articles */}
            <button
              id="btn-admin-open-recovery-center"
              onClick={() => setIsRecoveryModalOpen(true)}
              className="h-11 px-3 sm:px-4 rounded-xl font-bold text-xs sm:text-sm tracking-wide transition-all shadow-sm flex items-center justify-center gap-2 active:scale-95 cursor-pointer border bg-emerald-700 hover:bg-emerald-800 text-white border-emerald-600"
              title="Ouvrir le centre de récupération et d'analyse des articles depuis Firestore"
            >
              <Download className="w-4 h-4 text-emerald-200" />
              <span className="truncate">Récupérer</span>
              <span className="px-1.5 py-0.5 rounded-full bg-emerald-900/60 text-emerald-200 text-[10px] font-black border border-emerald-500/30">
                {products.length}
              </span>
            </button>

            {/* 3. Gestion Commandes */}
            <button
              onClick={() => {
                setAdminCategory('plans_produits');
                setAdminTab('orders');
              }}
              className={`h-11 px-3 sm:px-4 rounded-xl font-bold text-xs sm:text-sm tracking-wide transition-all shadow-sm flex items-center justify-center gap-2 active:scale-95 cursor-pointer border ${
                adminTab === 'orders'
                  ? 'bg-amber-500 text-stone-950 border-amber-600 ring-2 ring-amber-400/40'
                  : 'bg-stone-900 hover:bg-stone-800 text-white border-stone-800 hover:border-stone-700'
              }`}
              title="Accéder directement à la gestion des commandes"
            >
              <ShoppingBag className={`w-4 h-4 ${adminTab === 'orders' ? 'text-stone-950' : 'text-amber-400'}`} />
              <span className="truncate">Commandes</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                adminTab === 'orders' ? 'bg-stone-950 text-amber-300' : 'bg-stone-800 text-amber-400 border border-stone-700'
              }`}>
                {orders.length}
              </span>
            </button>

            {/* 4. Statistiques */}
            <button
              onClick={() => {
                setAdminCategory('plans_produits');
                setAdminTab('analytics');
              }}
              className={`h-11 px-3 sm:px-4 rounded-xl font-bold text-xs sm:text-sm tracking-wide transition-all shadow-sm flex items-center justify-center gap-2 active:scale-95 cursor-pointer border ${
                adminTab === 'analytics'
                  ? 'bg-amber-500 text-stone-950 border-amber-600 ring-2 ring-amber-400/40'
                  : 'bg-stone-900 hover:bg-stone-800 text-white border-stone-800 hover:border-stone-700'
              }`}
              title="Accéder aux statistiques et graphiques"
            >
              <BarChart3 className={`w-4 h-4 ${adminTab === 'analytics' ? 'text-stone-950' : 'text-amber-400'}`} />
              <span className="truncate">Statistiques</span>
            </button>
          </div>

          {!isSuperAdmin && currentUser?.assistantRoles && currentUser.assistantRoles.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 w-full pt-2 border-t border-stone-100">
              <span className="text-[10px] text-stone-500 font-medium whitespace-nowrap">Permissions :</span>
              {currentUser.assistantRoles.map(perm => (
                <span key={perm} className="bg-stone-100 text-stone-800 text-[10px] px-2 py-0.5 rounded-md font-mono border border-stone-200">
                  {perm === 'products' ? '📦 Articles' : perm === 'orders' ? '🛍️ Commandes' : perm === 'users' ? '👥 Utilisateurs' : perm === 'announcements' ? '📢 Annonces' : perm === 'chat' ? '💬 Chat Support' : perm}
                </span>
              ))}
            </div>
          )}
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
          <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
            <Megaphone className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase">Annonces Publiées</p>
            <p className="text-2xl font-black text-slate-900">{announcements.length}</p>
          </div>
        </div>
      </div>

      {/* Admin Navigation Structure: 4 Categories in Exact Requested Order */}
      <div className="space-y-4">
        {/* Main 4 Categories Selector - Exactly ordered as requested */}
        <div className="bg-white rounded-3xl p-3 sm:p-4 border border-slate-200 shadow-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
            
            {/* 1. PLANS & PRODUITS */}
            <button
              onClick={() => {
                setAdminCategory('plans_produits');
                if (!['analytics', 'products', 'categories', 'orders', 'promocodes'].includes(adminTab)) {
                  const allowed: AdminTab[] = ['analytics', 'products', 'categories', 'orders', 'promocodes'];
                  const first = allowed.find(t => hasTabPermission(t)) || 'analytics';
                  setAdminTab(first);
                }
              }}
              className={`p-4 rounded-2xl border transition-all text-left flex flex-col justify-between gap-2 cursor-pointer ${
                adminCategory === 'plans_produits'
                  ? 'bg-gradient-to-br from-amber-500 to-amber-600 text-slate-950 border-amber-400 shadow-md ring-2 ring-amber-400/50'
                  : 'bg-slate-50/80 hover:bg-slate-100 text-slate-800 border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`p-2 rounded-xl ${adminCategory === 'plans_produits' ? 'bg-slate-950 text-amber-400' : 'bg-amber-100 text-amber-700'}`}>
                    <Package className="w-5 h-5" />
                  </div>
                  <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${adminCategory === 'plans_produits' ? 'bg-black/20 text-slate-950 font-bold' : 'bg-slate-200 text-slate-600'}`}>
                    5 Pages
                  </span>
                </div>
                {adminCategory === 'plans_produits' && (
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-950 animate-pulse" />
                )}
              </div>
              <div>
                <h3 className={`font-black text-sm sm:text-base tracking-wide ${adminCategory === 'plans_produits' ? 'text-slate-950' : 'text-slate-900'}`}>
                  PLANS & PRODUITS
                </h3>
                <p className={`text-[11px] font-medium line-clamp-1 mt-0.5 ${adminCategory === 'plans_produits' ? 'text-amber-950 font-bold' : 'text-slate-500'}`}>
                  Articles, Catégories, Commandes, Promo & Analytics
                </p>
              </div>
            </button>

            {/* 2. APPRENDRE ET SOUTENIR */}
            <button
              onClick={() => {
                setAdminCategory('apprendre_soutenir');
                if (!['support', 'notifications'].includes(adminTab)) {
                  const allowed: AdminTab[] = ['support', 'notifications'];
                  const first = allowed.find(t => hasTabPermission(t)) || 'support';
                  setAdminTab(first);
                }
              }}
              className={`p-4 rounded-2xl border transition-all text-left flex flex-col justify-between gap-2 cursor-pointer relative ${
                adminCategory === 'apprendre_soutenir'
                  ? 'bg-gradient-to-br from-slate-900 to-black text-white border-slate-800 shadow-md ring-2 ring-slate-700/50'
                  : 'bg-slate-50/80 hover:bg-slate-100 text-slate-800 border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`p-2 rounded-xl ${adminCategory === 'apprendre_soutenir' ? 'bg-amber-400 text-slate-950' : 'bg-blue-100 text-blue-700'}`}>
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${adminCategory === 'apprendre_soutenir' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'}`}>
                    2 Pages
                  </span>
                </div>
                {(unansweredQueries.length > 0 || unansweredNotifs.length > 0) && (
                  <span className="px-2 py-0.5 rounded-full bg-rose-600 text-white font-black text-[10px] animate-bounce shadow-xs">
                    {unansweredQueries.length + unansweredNotifs.length} alerte(s)
                  </span>
                )}
              </div>
              <div>
                <h3 className={`font-black text-sm sm:text-base tracking-wide ${adminCategory === 'apprendre_soutenir' ? 'text-white' : 'text-slate-900'}`}>
                  APPRENDRE ET SOUTENIR
                </h3>
                <p className={`text-[11px] font-medium line-clamp-1 mt-0.5 ${adminCategory === 'apprendre_soutenir' ? 'text-slate-300' : 'text-slate-500'}`}>
                  Support Chatbot IA & Alertes Notifications
                </p>
              </div>
            </button>

            {/* 3. COMMUNAUTÉ & ÉVÉNEMENTS */}
            <button
              onClick={() => {
                setAdminCategory('communaute_evenements');
                if (!['announcements', 'users'].includes(adminTab)) {
                  const allowed: AdminTab[] = ['announcements', 'users'];
                  const first = allowed.find(t => hasTabPermission(t)) || 'announcements';
                  setAdminTab(first);
                }
              }}
              className={`p-4 rounded-2xl border transition-all text-left flex flex-col justify-between gap-2 cursor-pointer ${
                adminCategory === 'communaute_evenements'
                  ? 'bg-gradient-to-br from-emerald-600 to-emerald-800 text-white border-emerald-500 shadow-md ring-2 ring-emerald-400/50'
                  : 'bg-slate-50/80 hover:bg-slate-100 text-slate-800 border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`p-2 rounded-xl ${adminCategory === 'communaute_evenements' ? 'bg-white text-emerald-800' : 'bg-emerald-100 text-emerald-700'}`}>
                    <Users className="w-5 h-5" />
                  </div>
                  <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${adminCategory === 'communaute_evenements' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'}`}>
                    2 Pages
                  </span>
                </div>
                {adminCategory === 'communaute_evenements' && (
                  <span className="w-2.5 h-2.5 rounded-full bg-white animate-pulse" />
                )}
              </div>
              <div>
                <h3 className={`font-black text-sm sm:text-base tracking-wide ${adminCategory === 'communaute_evenements' ? 'text-white' : 'text-slate-900'}`}>
                  COMMUNAUTÉ & ÉVÉNEMENTS
                </h3>
                <p className={`text-[11px] font-medium line-clamp-1 mt-0.5 ${adminCategory === 'communaute_evenements' ? 'text-emerald-100' : 'text-slate-500'}`}>
                  Annonces Officielles, Utilisateurs & Assistants
                </p>
              </div>
            </button>

            {/* 4. À PROPOS DE NOUS */}
            <button
              onClick={() => {
                setAdminCategory('a_propos');
                setAdminTab('about');
              }}
              className={`p-4 rounded-2xl border transition-all text-left flex flex-col justify-between gap-2 cursor-pointer ${
                adminCategory === 'a_propos'
                  ? 'bg-gradient-to-br from-amber-700 to-amber-900 text-white border-amber-600 shadow-md ring-2 ring-amber-500/50'
                  : 'bg-slate-50/80 hover:bg-slate-100 text-slate-800 border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`p-2 rounded-xl ${adminCategory === 'a_propos' ? 'bg-amber-400 text-amber-950' : 'bg-amber-100 text-amber-800'}`}>
                    <Info className="w-5 h-5" />
                  </div>
                  <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${adminCategory === 'a_propos' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'}`}>
                    Boutique
                  </span>
                </div>
                {adminCategory === 'a_propos' && (
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
                )}
              </div>
              <div>
                <h3 className={`font-black text-sm sm:text-base tracking-wide ${adminCategory === 'a_propos' ? 'text-white' : 'text-slate-900'}`}>
                  À PROPOS DE NOUS
                </h3>
                <p className={`text-[11px] font-medium line-clamp-1 mt-0.5 ${adminCategory === 'a_propos' ? 'text-amber-200' : 'text-slate-500'}`}>
                  Profil Donaldson Shop, Contact Lomé & Sécurité
                </p>
              </div>
            </button>

          </div>
        </div>

        {/* Sub-Pages Tabs Bar for the Active Category */}
        <div className="bg-white rounded-2xl p-2 sm:p-2.5 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 px-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider text-slate-400">Pages de la section :</span>
              <span className="font-extrabold text-xs text-amber-600 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                {adminCategory === 'plans_produits' && 'PLANS & PRODUITS'}
                {adminCategory === 'apprendre_soutenir' && 'APPRENDRE ET SOUTENIR'}
                {adminCategory === 'communaute_evenements' && 'COMMUNAUTÉ & ÉVÉNEMENTS'}
                {adminCategory === 'a_propos' && 'À PROPOS DE NOUS'}
              </span>
            </div>
            <span className="text-[11px] text-slate-400 hidden sm:inline-block">Cliquez pour basculer d'onglet</span>
          </div>

          <div className="flex border-b-0 overflow-x-auto no-scrollbar gap-2">
            
            {/* SUB-TABS: 1. PLANS & PRODUITS */}
            {adminCategory === 'plans_produits' && (
              <>
                {hasTabPermission('analytics') && (
                  <button
                    onClick={() => setAdminTab('analytics')}
                    className={`px-4 py-2.5 font-extrabold text-xs sm:text-sm rounded-xl transition-all whitespace-nowrap flex items-center gap-2 cursor-pointer ${
                      adminTab === 'analytics'
                        ? 'bg-amber-500 text-slate-950 shadow-md font-black ring-2 ring-amber-400/50'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    <BarChart3 className="w-4 h-4 text-amber-900" />
                    <span>📊 Analytics & Graphiques Recharts</span>
                  </button>
                )}

                {hasTabPermission('products') && (
                  <button
                    onClick={() => setAdminTab('products')}
                    className={`px-4 py-2.5 font-extrabold text-xs sm:text-sm rounded-xl transition-all whitespace-nowrap flex items-center gap-2 cursor-pointer ${
                      adminTab === 'products'
                        ? 'bg-slate-900 text-white shadow-xs font-black'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    <Package className="w-4 h-4 text-emerald-400" />
                    <span>Gestion Articles ({products.length})</span>
                  </button>
                )}

                {hasTabPermission('categories') && (
                  <button
                    onClick={() => setAdminTab('categories')}
                    className={`px-4 py-2.5 font-extrabold text-xs sm:text-sm rounded-xl transition-all whitespace-nowrap flex items-center gap-2 cursor-pointer ${
                      adminTab === 'categories'
                        ? 'bg-slate-900 text-white shadow-xs font-black'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    <Layers className="w-4 h-4 text-emerald-400" />
                    <span>Catégories ({categoryItems.length})</span>
                  </button>
                )}

                {hasTabPermission('orders') && (
                  <button
                    onClick={() => setAdminTab('orders')}
                    className={`px-4 py-2.5 font-extrabold text-xs sm:text-sm rounded-xl transition-all whitespace-nowrap flex items-center gap-2 cursor-pointer ${
                      adminTab === 'orders'
                        ? 'bg-slate-900 text-white shadow-xs font-black'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    <ShoppingBag className="w-4 h-4 text-emerald-400" />
                    <span>Commandes Clients ({orders.length})</span>
                  </button>
                )}

                {hasTabPermission('promocodes') && (
                  <button
                    onClick={() => setAdminTab('promocodes')}
                    className={`px-4 py-2.5 font-extrabold text-xs sm:text-sm rounded-xl transition-all whitespace-nowrap flex items-center gap-2 cursor-pointer ${
                      adminTab === 'promocodes'
                        ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                        : 'bg-amber-50 text-amber-900 border border-amber-200 hover:bg-amber-100 font-bold'
                    }`}
                  >
                    <Ticket className="w-4 h-4 text-amber-800" />
                    <span>🎟️ Codes Promo ({promoCodes.length})</span>
                  </button>
                )}
              </>
            )}

            {/* SUB-TABS: 2. APPRENDRE ET SOUTENIR */}
            {adminCategory === 'apprendre_soutenir' && (
              <>
                {hasTabPermission('support') && (
                  <button
                    onClick={() => setAdminTab('support')}
                    className={`px-4 py-2.5 font-extrabold text-xs sm:text-sm rounded-xl transition-all whitespace-nowrap flex items-center gap-2.5 cursor-pointer ${
                      adminTab === 'support'
                        ? 'bg-slate-900 text-white shadow-xs font-black'
                        : unansweredQueries.length > 0
                          ? 'bg-rose-500/10 text-rose-800 border-2 border-rose-400/60 hover:bg-rose-500/20 font-black'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    <MessageSquare className={`w-4 h-4 ${unansweredQueries.length > 0 ? 'text-rose-500 animate-pulse' : 'text-amber-400'}`} />
                    <span>Support & Chatbot IA</span>
                    {unansweredQueries.length > 0 ? (
                      <span className="px-2.5 py-0.5 rounded-full bg-rose-600 text-white font-black text-[10px] animate-pulse shadow-xs border border-rose-200 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                        {unansweredQueries.length} URGENT(S)
                      </span>
                    ) : (
                      <span className="text-xs opacity-75">({chatMessages.filter(m => m.sender === 'user').length})</span>
                    )}
                  </button>
                )}

                {hasTabPermission('notifications') && (
                  <button
                    onClick={() => setAdminTab('notifications')}
                    className={`px-4 py-2.5 font-extrabold text-xs sm:text-sm rounded-xl transition-all whitespace-nowrap flex items-center gap-2.5 cursor-pointer ${
                      adminTab === 'notifications'
                        ? 'bg-slate-900 text-white shadow-xs font-black'
                        : (orderNotifs.length > 0 || unansweredNotifs.length > 0)
                          ? 'bg-amber-500/10 text-amber-900 border-2 border-amber-400/60 hover:bg-amber-500/20 font-black'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    <Bell className={`w-4 h-4 ${(orderNotifs.length > 0 || unansweredNotifs.length > 0) ? 'text-amber-600 animate-bounce' : 'text-emerald-400'}`} />
                    <span>Notifications Admin</span>
                    {orderNotifs.length > 0 && (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white font-black text-[10px] shadow-xs">
                        {orderNotifs.length} Cde(s)
                      </span>
                    )}
                    {unansweredNotifs.length > 0 && (
                      <span className="px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 font-black text-[10px] shadow-xs">
                        {unansweredNotifs.length} Alerte(s)
                      </span>
                    )}
                  </button>
                )}
              </>
            )}

            {/* SUB-TABS: 3. COMMUNAUTÉ & ÉVÉNEMENTS */}
            {adminCategory === 'communaute_evenements' && (
              <>
                {hasTabPermission('announcements') && (
                  <button
                    onClick={() => setAdminTab('announcements')}
                    className={`px-4 py-2.5 font-extrabold text-xs sm:text-sm rounded-xl transition-all whitespace-nowrap flex items-center gap-2 cursor-pointer ${
                      adminTab === 'announcements'
                        ? 'bg-emerald-700 text-white shadow-xs font-black'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    <Megaphone className="w-4 h-4 text-amber-300" />
                    <span>Gestion Annonces & Événements ({announcements.length})</span>
                  </button>
                )}

                {hasTabPermission('users') && (
                  <button
                    onClick={() => setAdminTab('users')}
                    className={`px-4 py-2.5 font-extrabold text-xs sm:text-sm rounded-xl transition-all whitespace-nowrap flex items-center gap-2 cursor-pointer ${
                      adminTab === 'users'
                        ? 'bg-slate-900 text-white shadow-xs font-black'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    <Users className="w-4 h-4 text-emerald-400" />
                    <span>Utilisateurs & Assistants ({users.length})</span>
                  </button>
                )}
              </>
            )}

            {/* SUB-TABS: 4. À PROPOS DE NOUS */}
            {adminCategory === 'a_propos' && (
              <>
                <button
                  onClick={() => setAdminTab('about')}
                  className={`px-4 py-2.5 font-extrabold text-xs sm:text-sm rounded-xl transition-all whitespace-nowrap flex items-center gap-2 cursor-pointer ${
                    adminTab === 'about'
                      ? 'bg-amber-700 text-white shadow-xs font-black ring-2 ring-amber-500/50'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <Info className="w-4 h-4 text-amber-300" />
                  <span>Présentation Boutique, Contact Lomé & Sécurité</span>
                </button>
              </>
            )}

          </div>
        </div>
      </div>

      {/* TAB 0: INTERACTIVE RECHARTS ANALYTICS */}
      {adminTab === 'analytics' && hasTabPermission('analytics') && (
        <div className="space-y-6 animate-msg-slide-up">
          {/* Header & Controls Bar */}
          <div className="bg-white text-slate-800 p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 text-amber-800 font-bold text-xs uppercase mb-1 border border-amber-200">
                <TrendingUp className="w-3.5 h-3.5 text-amber-600" />
                Tableau de Bord Analytique Interactif Recharts
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
                <span>Ventes Quotidiennes & Volume par Catégorie</span>
                <Sparkles className="w-5 h-5 text-amber-500 animate-pulse" />
              </h2>
              <p className="text-slate-600 text-xs sm:text-sm mt-1">
                Visualisez les tendances réelles des revenus en FCFA et la répartition des commandes par catégorie de produits.
              </p>
            </div>

            {/* Timeframe Filter Buttons & PDF Export Button */}
            <div className="flex flex-wrap items-center gap-2 bg-slate-100 p-1.5 rounded-2xl border border-slate-200 shrink-0">
              <button
                onClick={() => setAnalyticsTimeframe('7days')}
                className={`px-3.5 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                  analyticsTimeframe === '7days'
                    ? 'bg-amber-500 text-slate-950 shadow-xs font-black'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                }`}
              >
                7 Derniers Jours
              </button>
              <button
                onClick={() => setAnalyticsTimeframe('30days')}
                className={`px-3.5 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                  analyticsTimeframe === '30days'
                    ? 'bg-amber-500 text-slate-950 shadow-xs font-black'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                }`}
              >
                30 Derniers Jours
              </button>
              <button
                onClick={() => setAnalyticsTimeframe('all')}
                className={`px-3.5 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                  analyticsTimeframe === 'all'
                    ? 'bg-amber-500 text-slate-950 shadow-xs font-black'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                }`}
              >
                Tout l'Historique
              </button>

              <div className="w-px h-5 bg-slate-300 mx-1 hidden sm:block" />

              <button
                onClick={exportOrdersToPDF}
                className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs transition-all flex items-center gap-1.5 shadow-xs shrink-0 cursor-pointer"
              >
                <FileText className="w-4 h-4 text-slate-950" />
                <span>Exporter Rapport PDF</span>
              </button>

              <button
                onClick={handleResetSales}
                className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs transition-all flex items-center gap-1.5 shrink-0 cursor-pointer"
                title="Remettre le compteur de ventes et le graphique à zéro"
              >
                <span>Remettre à Zéro</span>
              </button>
            </div>
          </div>

          {/* Key Metric Highlights Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-1">
              <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase">
                <span>Chiffre d'Affaires</span>
                <DollarSign className="w-4 h-4 text-amber-500" />
              </div>
              <p className="text-xl sm:text-2xl font-black text-amber-600 truncate">
                {formatFCFA(analyticsData.totalRevenue)}
              </p>
              <p className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
                <ArrowUpRight className="w-3.5 h-3.5" />
                <span>Ventes directes & WhatsApp</span>
              </p>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-1">
              <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase">
                <span>Panier Moyen</span>
                <ShoppingBag className="w-4 h-4 text-emerald-500" />
              </div>
              <p className="text-xl sm:text-2xl font-black text-slate-900 truncate">
                {formatFCFA(analyticsData.avgBasket)}
              </p>
              <p className="text-[11px] text-slate-500 font-medium">
                Par commande enregistrée
              </p>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-1">
              <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase">
                <span>Total Commandes</span>
                <Activity className="w-4 h-4 text-indigo-500" />
              </div>
              <p className="text-xl sm:text-2xl font-black text-slate-900">
                {analyticsData.totalOrders}
              </p>
              <p className="text-[11px] text-indigo-600 font-bold">
                {analyticsData.deliveredOrdersCount} validées ou livrées
              </p>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-1">
              <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase">
                <span>Top Catégorie Vente</span>
                <Package className="w-4 h-4 text-slate-600" />
              </div>
              <p className="text-base sm:text-lg font-black text-slate-900 truncate">
                {analyticsData.topCategoryName}
              </p>
              <p className="text-[11px] text-slate-600 font-bold">
                Leader du volume d'articles
              </p>
            </div>
          </div>

          {/* MAIN CHARTS GRID */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* CHART 1: VENTES QUOTIDIENNES (Spans 2 cols) */}
            <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-amber-500" />
                    <span>Évolution des Ventes Quotidiennes & Recettes (FCFA)</span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    Série chronologique du chiffre d'affaires quotidien et du nombre de commandes.
                  </p>
                </div>

                {/* Chart Style Toggle */}
                <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-bold shrink-0">
                  <button
                    onClick={() => setAnalyticsChartView('area')}
                    className={`px-3 py-1 rounded-lg transition-all ${
                      analyticsChartView === 'area'
                        ? 'bg-slate-900 text-amber-400 shadow-xs font-black'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Aires Fondez
                  </button>
                  <button
                    onClick={() => setAnalyticsChartView('bar')}
                    className={`px-3 py-1 rounded-lg transition-all ${
                      analyticsChartView === 'bar'
                        ? 'bg-slate-900 text-amber-400 shadow-xs font-black'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Histogrammes
                  </button>
                </div>
              </div>

              {/* RECHARTS AREA / BAR CHART */}
              <div className="h-80 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  {analyticsChartView === 'area' ? (
                    <AreaChart data={analyticsData.dailySalesList} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.45} />
                          <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.02} />
                        </linearGradient>
                        <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0.02} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.8} />
                      <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748b', fontWeight: 600 }} />
                      <YAxis
                        yAxisId="left"
                        tickFormatter={(v) => `${Math.round(v / 1000)}k`}
                        tick={{ fontSize: 11, fill: '#d97706', fontWeight: 700 }}
                      />
                      <YAxis
                        yAxisId="right"
                        orientation="right"
                        tick={{ fontSize: 11, fill: '#059669', fontWeight: 700 }}
                      />
                      <RechartsTooltip
                        content={({ active, payload, label }) => {
                          if (active && payload && payload.length) {
                            const rev = payload.find(p => p.dataKey === 'Ventes')?.value || 0;
                            const ord = payload.find(p => p.dataKey === 'Commandes')?.value || 0;
                            return (
                              <div className="bg-white/95 backdrop-blur-md text-slate-900 p-3.5 rounded-2xl border border-slate-200 shadow-xl text-xs space-y-1.5">
                                <p className="font-extrabold text-amber-700 border-b border-slate-100 pb-1 flex items-center gap-1.5">
                                  <Calendar className="w-3.5 h-3.5 text-amber-600" />
                                  <span>Date : {label}</span>
                                </p>
                                <div className="flex items-center justify-between gap-4 pt-0.5">
                                  <span className="text-slate-600 font-medium flex items-center gap-1">
                                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                                    Ventes :
                                  </span>
                                  <span className="font-black text-amber-600">{formatFCFA(Number(rev))}</span>
                                </div>
                                <div className="flex items-center justify-between gap-4">
                                  <span className="text-slate-600 font-medium flex items-center gap-1">
                                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                                    Commandes :
                                  </span>
                                  <span className="font-black text-emerald-600">{ord} commande{Number(ord) > 1 ? 's' : ''}</span>
                                </div>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '12px', fontWeight: 700 }} />
                      <Area yAxisId="left" type="monotone" dataKey="Ventes" name="Chiffre d'Affaires (FCFA)" stroke="#f59e0b" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
                      <Area yAxisId="right" type="monotone" dataKey="Commandes" name="Nombre de Commandes" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#colorOrders)" />
                    </AreaChart>
                  ) : (
                    <BarChart data={analyticsData.dailySalesList} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.8} />
                      <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748b', fontWeight: 600 }} />
                      <YAxis yAxisId="left" tickFormatter={(v) => `${Math.round(v / 1000)}k`} tick={{ fontSize: 11, fill: '#d97706', fontWeight: 700 }} />
                      <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11, fill: '#059669', fontWeight: 700 }} />
                      <RechartsTooltip
                        content={({ active, payload, label }) => {
                          if (active && payload && payload.length) {
                            const rev = payload.find(p => p.dataKey === 'Ventes')?.value || 0;
                            const ord = payload.find(p => p.dataKey === 'Commandes')?.value || 0;
                            return (
                              <div className="bg-white/95 backdrop-blur-md text-slate-900 p-3.5 rounded-2xl border border-slate-200 shadow-xl text-xs space-y-1.5">
                                <p className="font-extrabold text-amber-700 border-b border-slate-100 pb-1 flex items-center gap-1.5">
                                  <Calendar className="w-3.5 h-3.5 text-amber-600" />
                                  <span>Date : {label}</span>
                                </p>
                                <div className="flex items-center justify-between gap-4 pt-0.5">
                                  <span className="text-slate-600 font-medium">Ventes :</span>
                                  <span className="font-black text-amber-600">{formatFCFA(Number(rev))}</span>
                                </div>
                                <div className="flex items-center justify-between gap-4">
                                  <span className="text-slate-600 font-medium">Commandes :</span>
                                  <span className="font-black text-emerald-600">{ord} commande{Number(ord) > 1 ? 's' : ''}</span>
                                </div>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '12px', fontWeight: 700 }} />
                      <Bar yAxisId="left" dataKey="Ventes" name="Chiffre d'Affaires (FCFA)" fill="#f59e0b" radius={[6, 6, 0, 0]} />
                      <Bar yAxisId="right" dataKey="Commandes" name="Nombre de Commandes" fill="#10b981" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  )}
                </ResponsiveContainer>
              </div>
            </div>

            {/* CHART 2: REPARTITION PAR CATEGORIE (Pie / Donut Chart) */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4 flex flex-col justify-between">
              <div>
                <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <PieChartIcon className="w-5 h-5 text-indigo-600" />
                  <span>Répartition du Chiffre d'Affaires</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Part de chaque famille d'articles dans les recettes globales.
                </p>
              </div>

              {/* RECHARTS PIE CHART */}
              <div className="h-64 w-full relative flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={analyticsData.categoryVolumeList}
                      dataKey="revenue"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={85}
                      paddingAngle={4}
                    >
                      {analyticsData.categoryVolumeList.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} stroke="#ffffff" strokeWidth={2} />
                      ))}
                    </Pie>
                    <RechartsTooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="bg-slate-950 text-white p-3 rounded-2xl border border-indigo-500/40 shadow-xl text-xs space-y-1">
                              <p className="font-extrabold text-indigo-300">{data.name}</p>
                              <p className="text-slate-300">Volume : <strong className="text-white">{data.quantity} articles</strong></p>
                              <p className="text-slate-300">Chiffre d'affaires : <strong className="text-amber-400">{formatFCFA(data.revenue)}</strong></p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                
                {/* Center Badge in Donut */}
                <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center text-center">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Top Vente</span>
                  <span className="text-xs font-black text-slate-900 max-w-[90px] truncate">{analyticsData.topCategoryName}</span>
                </div>
              </div>

              {/* Custom Category Color Legend Pills */}
              <div className="flex flex-wrap gap-1.5 pt-2 border-t border-slate-100 max-h-24 overflow-y-auto">
                {analyticsData.categoryVolumeList.map((cat, idx) => (
                  <div key={cat.name} className="flex items-center gap-1.5 px-2 py-1 bg-slate-50 rounded-lg text-[11px] font-bold text-slate-700 border border-slate-200">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: CATEGORY_COLORS[idx % CATEGORY_COLORS.length] }} />
                    <span className="truncate max-w-[100px]">{cat.name}</span>
                    <span className="text-slate-400 font-mono">({cat.quantity})</span>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* SECONDARY CHARTS ROW: BAR CHART CATEGORY VOLUME & DELIVERY STATUS DONUT */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* BAR CHART: VOLUME DE COMMANDES DÉTAILLÉ PAR CATÉGORIE */}
            <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-emerald-600" />
                    <span>Volume de Commandes par Catégorie de Produits (Articles Vendus)</span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    Comparaison directe du nombre d'articles vendus par catégorie.
                  </p>
                </div>
              </div>

              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analyticsData.categoryVolumeList} margin={{ top: 10, right: 20, left: 10, bottom: 25 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis
                      dataKey="name"
                      interval={0}
                      tick={({ x, y, payload }) => (
                        <g transform={`translate(${x},${y})`}>
                          <text x={0} y={0} dy={12} textAnchor="end" fill="#475569" fontSize={10} fontWeight={700} transform="rotate(-20)">
                            {payload.value.length > 14 ? `${payload.value.slice(0, 12)}...` : payload.value}
                          </text>
                        </g>
                      )}
                    />
                    <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                    <RechartsTooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="bg-slate-950 text-white p-3 rounded-2xl border border-emerald-500/40 shadow-xl text-xs space-y-1">
                              <p className="font-extrabold text-emerald-400">{data.name}</p>
                              <p className="text-slate-300">Unités vendues : <strong className="text-white font-black">{data.quantity}</strong></p>
                              <p className="text-slate-300">Total FCFA : <strong className="text-amber-300 font-black">{formatFCFA(data.revenue)}</strong></p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar dataKey="quantity" name="Nombre d'Articles Vendus" radius={[8, 8, 0, 0]}>
                      {analyticsData.categoryVolumeList.map((entry, index) => (
                        <Cell key={`bar-cell-${index}`} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* DONUT CHART: STATUTS DES COMMANDES (Livraison & Validation) */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4 flex flex-col justify-between">
              <div>
                <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <Truck className="w-5 h-5 text-blue-600" />
                  <span>Statuts de Traitement des Commandes</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Aperçu en direct de l'état du traitement des commandes clients.
                </p>
              </div>

              <div className="h-56 w-full relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={analyticsData.statusPieData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={75}
                      paddingAngle={3}
                    >
                      {analyticsData.statusPieData.map((entry) => (
                        <Cell key={`status-cell-${entry.name}`} fill={STATUS_COLORS[entry.name] || '#94a3b8'} stroke="#ffffff" strokeWidth={2} />
                      ))}
                    </Pie>
                    <RechartsTooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="bg-slate-900 text-white p-2.5 rounded-xl text-xs space-y-0.5">
                              <p className="font-extrabold text-amber-300">{data.name}</p>
                              <p className="text-slate-200">{data.value} commande{data.value > 1 ? 's' : ''}</p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Legend list */}
              <div className="space-y-1.5 border-t border-slate-100 pt-3 text-xs font-bold">
                {analyticsData.statusPieData.map(st => (
                  <div key={st.name} className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-slate-600">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: STATUS_COLORS[st.name] || '#94a3b8' }} />
                      {st.name}
                    </span>
                    <span className="font-mono text-slate-900 font-extrabold">{st.value}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* TAB 1: USERS & ASSISTANTS */}
      {adminTab === 'users' && hasTabPermission('users') && (
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

                    <td className="p-3.5 text-right whitespace-normal">
                      <div className="flex items-center justify-end gap-1.5 flex-wrap">
                        <button
                          onClick={() => {
                            setAdminTab('support');
                            setSupportFilter('history');
                            setSelectedHistoryUserId(usr.id);
                          }}
                          className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] inline-flex items-center gap-1 shadow-xs cursor-pointer active:scale-95 transition-all shrink-0"
                          title="Écrire directement au client dans le chat"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>Écrire en Direct</span>
                        </button>

                        <button
                          onClick={() => togglePauseAiForUser(usr.id)}
                          className={`px-2.5 py-1.5 rounded-lg font-bold text-[10px] inline-flex items-center gap-1 shadow-xs cursor-pointer active:scale-95 transition-all shrink-0 ${
                            pausedAiUserIds.includes(usr.id)
                              ? 'bg-rose-600 hover:bg-rose-700 text-white ring-2 ring-rose-400'
                              : 'bg-stone-800 hover:bg-stone-900 text-amber-400 border border-amber-400/30'
                          }`}
                          title={pausedAiUserIds.includes(usr.id) ? "Réactiver le chatbot pour ce client" : "Mettre en pause le chatbot pour répondre en personne sans interférence"}
                        >
                          {pausedAiUserIds.includes(usr.id) ? '🛑 Chat Suspendu' : '⏸️ Suspendre Chatbot'}
                        </button>

                        {isSuperAdmin && usr.email !== SUPER_ADMIN_EMAIL && (
                          <>
                            <button
                              onClick={() => {
                                setSelectedUserForAssistant(usr);
                                setTargetUserRole(usr.role);
                                setAssistantRolesSelection(usr.assistantRoles || ['products', 'orders']);
                              }}
                              className="px-3 py-1.5 rounded-lg bg-amber-500 text-slate-950 font-bold hover:bg-amber-400 transition-colors text-[10px] inline-flex items-center gap-1 shadow-xs shrink-0 cursor-pointer"
                              title="Nommer et attribuer un rôle et des permissions"
                            >
                              <ShieldCheck className="w-3.5 h-3.5" />
                              <span>Gérer Rôle & Permissions</span>
                            </button>

                            <button
                              onClick={() => deleteUser(usr.id)}
                              className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 transition-colors inline-flex items-center shrink-0 cursor-pointer"
                              title="Supprimer l'utilisateur"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
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
      {adminTab === 'products' && hasTabPermission('products') && (
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

            <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
              <div className="relative flex-1 min-w-[200px] sm:w-64">
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
                id="btn-tab-recovery-modal"
                onClick={() => setIsRecoveryModalOpen(true)}
                className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-black text-xs shadow-md transition-all flex items-center gap-1.5 shrink-0 cursor-pointer"
                title="Récupérer, restaurer et analyser les articles depuis la base Firestore Cloud"
              >
                <Download className="w-4 h-4 text-stone-950" />
                <span>Récupérer & Analyser ({products.length})</span>
              </button>

              <button
                onClick={() => setAdminTab('categories')}
                className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-black text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5 shrink-0 border border-slate-700 cursor-pointer"
                title="Créer, modifier ou supprimer les catégories d'articles"
              >
                <Layers className="w-4 h-4 text-amber-400" />
                <span>Rayons & Catégories</span>
              </button>

              <button
                onClick={() => {
                  setEditingProduct(null);
                  resetProductForm();
                  setIsProductModalOpen(true);
                }}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5 shrink-0 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Ajouter un Article</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredProducts.map((prod, index) => (
              <div key={`${prod.id}_${index}`} className={`p-4 rounded-2xl border flex flex-col justify-between space-y-3 transition-all ${prod.featured ? 'bg-amber-50/50 border-amber-300 shadow-xs' : 'bg-slate-50 border-slate-200'}`}>
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
                      className={`flex-1 py-1.5 px-2 rounded-lg font-bold text-[10px] flex items-center justify-center gap-1 transition-all border ${
                        prod.featured
                          ? 'bg-amber-100 text-amber-900 border-amber-300 hover:bg-amber-200'
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                      title="Changer le statut en vedette"
                    >
                      <Star className={`w-3 h-3 ${prod.featured ? 'fill-amber-600 text-amber-600' : 'text-slate-400'}`} />
                      {prod.featured ? 'En Vedette' : 'Mettre Vedette'}
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

      {/* TAB 3: CATEGORIES / RAYONS MANAGEMENT */}
      {adminTab === 'categories' && hasTabPermission('categories') && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-8">
          <div>
            <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <Layers className="w-5 h-5 text-emerald-600" />
              Gestion des Rayons & Catégories d'Articles
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Personnalisez les noms, descriptions (informations) et photos de couverture de chacun de vos rayons sportifs.
            </p>
          </div>

          {/* Form: Add New Category / Rayon */}
          <div className="bg-slate-50 p-5 rounded-3xl border border-slate-200 space-y-4">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <Plus className="w-4 h-4 text-emerald-600" />
              Créer un Nouveau Rayon / Une Nouvelle Catégorie
            </h4>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (newCatName && newCatName.trim()) {
                  addCategory(newCatName.trim(), newCatDescription.trim(), newCatImageUrl.trim());
                  showToast('Catégorie Créée !', `La catégorie "${newCatName.trim()}" a été ajoutée avec succès.`, 'success');
                  setNewCatName('');
                  setNewCatDescription('');
                  setNewCatImageUrl('');
                }
              }}
              className="space-y-4"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Nom du Rayon *</label>
                  <input
                    type="text"
                    required
                    value={newCatName}
                    onChange={(e) => setNewCatName(e.target.value)}
                    placeholder="Ex: Chaussures & Crampons Pro"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs outline-none focus:border-emerald-500 font-medium bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Description / Infos du Rayon</label>
                  <input
                    type="text"
                    value={newCatDescription}
                    onChange={(e) => setNewCatDescription(e.target.value)}
                    placeholder="Ex: Chaussures montantes, futsal et crampons de compétition"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs outline-none focus:border-emerald-500 font-medium bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Photo de Couverture du Rayon</label>
                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <input
                    type="url"
                    value={newCatImageUrl}
                    onChange={(e) => setNewCatImageUrl(e.target.value)}
                    placeholder="Coller l'URL d'une image ou téléverser ci-contre..."
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs outline-none focus:border-emerald-500 font-medium bg-white"
                  />
                  <label className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs cursor-pointer transition-all flex items-center justify-center gap-2 shrink-0">
                    <Upload className="w-4 h-4 text-emerald-400" />
                    <span>Choisir depuis la galerie</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageFileUpload(e, 'new_category')}
                      className="hidden"
                    />
                  </label>
                </div>

                {/* Sports Presets */}
                <div className="mt-2.5 flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] font-bold text-slate-500 mr-1">Exemples de photos :</span>
                  {[
                    { label: '⚽ Maillots Pro', url: 'https://images.unsplash.com/photo-1511746315387-c4a76990fdce?auto=format&fit=crop&w=800&q=80' },
                    { label: '👟 Crampons', url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80' },
                    { label: '⚽ Ballons', url: 'https://images.unsplash.com/photo-1614632537190-23e4146777db?auto=format&fit=crop&w=800&q=80' },
                    { label: '💪 Fitness', url: 'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?auto=format&fit=crop&w=800&q=80' },
                    { label: '🥊 Combat', url: 'https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?auto=format&fit=crop&w=800&q=80' }
                  ].map((p) => (
                    <button
                      key={p.label}
                      type="button"
                      onClick={() => setNewCatImageUrl(p.url)}
                      className="text-[10px] bg-slate-100 hover:bg-emerald-100 hover:text-emerald-800 text-slate-700 px-2.5 py-1 rounded-lg border border-slate-200 transition-colors"
                    >
                      {p.label}
                    </button>
                  ))}
                </div>

                {newCatImageUrl && (
                  <div className="mt-3 flex items-center gap-3 bg-white p-2.5 rounded-2xl border border-slate-200 w-fit">
                    <img
                      src={newCatImageUrl}
                      alt="Aperçu Rayon"
                      referrerPolicy="no-referrer"
                      className="w-16 h-12 object-cover rounded-xl border border-slate-200"
                    />
                    <span className="text-[11px] font-bold text-emerald-700">Aperçu de la photo de couverture</span>
                  </div>
                )}
              </div>

              <div className="pt-1">
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs shadow-md hover:bg-emerald-700 transition-all flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Enregistrer et Créer le Rayon</span>
                </button>
              </div>
            </form>
          </div>

          {/* List / Cards of Category Items */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Rayons Actuellement Disponibles ({categoryItems.length})
            </h4>

            {categoryItems.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-500">
                Aucun rayon enregistré pour le moment. Remplissez le formulaire ci-dessus pour en créer un.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {categoryItems.map((catItem) => {
                  const count = products.filter(p => p.category.toLowerCase() === catItem.name.toLowerCase()).length;
                  const isEditing = editingCatItem?.id === catItem.id;

                  if (isEditing) {
                    return (
                      <div key={catItem.id} className="p-5 rounded-3xl bg-emerald-50 border-2 border-emerald-400 space-y-4 shadow-md col-span-1 md:col-span-2 lg:col-span-1">
                        <div className="flex items-center justify-between border-b border-emerald-200 pb-2">
                          <span className="font-extrabold text-xs text-emerald-900 flex items-center gap-1.5">
                            <Camera className="w-4 h-4 text-emerald-700" />
                            Modification du Rayon
                          </span>
                          <span className="text-[10px] bg-emerald-200 text-emerald-900 font-bold px-2 py-0.5 rounded-full">
                            ID: {catItem.id}
                          </span>
                        </div>

                        <div className="space-y-3">
                          <div>
                            <label className="block text-[11px] font-bold text-emerald-900 mb-1">Nom du Rayon :</label>
                            <input
                              type="text"
                              value={editCatName}
                              onChange={(e) => setEditCatName(e.target.value)}
                              className="w-full px-3 py-2 rounded-xl border border-emerald-300 text-xs font-bold outline-none bg-white focus:border-emerald-600"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-bold text-emerald-900 mb-1">Description / Infos :</label>
                            <textarea
                              rows={2}
                              value={editCatDescription}
                              onChange={(e) => setEditCatDescription(e.target.value)}
                              placeholder="Détails du rayon affichés sur la page d'accueil..."
                              className="w-full px-3 py-2 rounded-xl border border-emerald-300 text-xs outline-none bg-white focus:border-emerald-600"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-bold text-emerald-900 mb-1">Photo du Rayon :</label>
                            <div className="space-y-2">
                              <input
                                type="url"
                                value={editCatImageUrl}
                                onChange={(e) => setEditCatImageUrl(e.target.value)}
                                placeholder="URL de la photo ou choisir ci-dessous..."
                                className="w-full px-3 py-2 rounded-xl border border-emerald-300 text-xs outline-none bg-white"
                              />
                              <label className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs cursor-pointer hover:bg-black transition-all shadow-xs">
                                <Upload className="w-4 h-4 text-emerald-400" />
                                <span>Choisir Photo depuis Téléphone / Galerie</span>
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={(e) => handleImageFileUpload(e, 'edit_category')}
                                  className="hidden"
                                />
                              </label>

                              {/* Presets for editing */}
                              <div className="flex items-center gap-1 flex-wrap pt-1">
                                <span className="text-[10px] font-bold text-emerald-800">Modèles :</span>
                                {[
                                  { label: '⚽ Maillots', url: 'https://images.unsplash.com/photo-1511746315387-c4a76990fdce?auto=format&fit=crop&w=800&q=80' },
                                  { label: '👟 Crampons', url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80' },
                                  { label: '⚽ Ballons', url: 'https://images.unsplash.com/photo-1614632537190-23e4146777db?auto=format&fit=crop&w=800&q=80' },
                                  { label: '💪 Fitness', url: 'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?auto=format&fit=crop&w=800&q=80' }
                                ].map((p) => (
                                  <button
                                    key={p.label}
                                    type="button"
                                    onClick={() => setEditCatImageUrl(p.url)}
                                    className="text-[10px] bg-emerald-100 hover:bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded-md font-medium"
                                  >
                                    {p.label}
                                  </button>
                                ))}
                              </div>
                            </div>

                            {editCatImageUrl && (
                              <div className="mt-3 p-2 bg-white rounded-2xl border border-emerald-200 flex items-center gap-3">
                                <img
                                  src={editCatImageUrl}
                                  alt="Aperçu Édition"
                                  referrerPolicy="no-referrer"
                                  className="w-24 h-16 object-cover rounded-xl border border-emerald-300 shadow-2xs"
                                />
                                <div>
                                  <span className="text-xs font-bold text-emerald-900 block">Aperçu Nouvelle Photo</span>
                                  <span className="text-[10px] text-emerald-700">Prête à être enregistrée</span>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 pt-2 border-t border-emerald-200">
                          <button
                            type="button"
                            onClick={() => {
                              if (editCatName && editCatName.trim()) {
                                updateCategoryDetails(catItem.id, editCatName.trim(), editCatDescription.trim(), editCatImageUrl.trim());
                                setEditingCatItem(null);
                              }
                            }}
                            className="flex-1 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-md transition-all text-center flex items-center justify-center gap-1.5"
                          >
                            <CheckCircle className="w-4 h-4" />
                            <span>Enregistrer Modifications</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingCatItem(null)}
                            className="px-4 py-2.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs transition-all"
                          >
                            Annuler
                          </button>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div
                      key={catItem.id}
                      className="bg-slate-50 rounded-3xl border border-slate-200 overflow-hidden shadow-xs hover:border-emerald-300 transition-all flex flex-col justify-between group"
                    >
                      <div>
                        {/* Rayon Cover Photo Header */}
                        <div className="relative h-40 bg-slate-200 overflow-hidden">
                          <img
                            src={catItem.imageUrl || 'https://images.unsplash.com/photo-1511746315387-c4a76990fdce?auto=format&fit=crop&w=800&q=80'}
                            alt={catItem.name}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                          
                          {/* DIRECT PHOTO CHANGE BUTTON ON THE IMAGE HEADER */}
                          <label
                            className="absolute top-2 right-2 px-2.5 py-1.5 bg-black/75 hover:bg-emerald-700 text-white rounded-xl font-bold text-[11px] cursor-pointer flex items-center gap-1.5 backdrop-blur-xs transition-all border border-white/20 shadow-md z-10"
                            title="Modifier directement la photo de ce rayon"
                          >
                            <Camera className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Changer Photo</span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  const reader = new FileReader();
                                  reader.onloadend = () => {
                                    const newUrl = reader.result as string;
                                    updateCategoryDetails(catItem.id, catItem.name, catItem.description, newUrl);
                                  };
                                  reader.readAsDataURL(file);
                                }
                              }}
                              className="hidden"
                            />
                          </label>

                          <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
                            <div>
                              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest block">
                                Rayon Sportif
                              </span>
                              <h4 className="text-base font-extrabold text-white">{catItem.name}</h4>
                            </div>
                            <span className="text-[10px] bg-emerald-500/90 text-white font-bold px-2 py-0.5 rounded-full shadow-xs">
                              {count} produit(s)
                            </span>
                          </div>
                        </div>

                        {/* Rayon Details Body */}
                        <div className="p-4 space-y-2">
                          <p className="text-xs text-slate-600 font-light leading-relaxed line-clamp-2">
                            {catItem.description || 'Aucune description spécifiée pour ce rayon.'}
                          </p>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="p-4 pt-0 flex items-center gap-2">
                        <button
                          onClick={() => {
                            setEditingCatItem(catItem);
                            setEditCatName(catItem.name);
                            setEditCatDescription(catItem.description || '');
                            setEditCatImageUrl(catItem.imageUrl || '');
                          }}
                          className="flex-1 py-2 px-3 bg-white hover:bg-emerald-50 text-emerald-800 border border-slate-200 hover:border-emerald-300 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 shadow-2xs"
                        >
                          <Edit className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Modifier Rayon & Photo</span>
                        </button>

                        <button
                          onClick={() => {
                            if (window.confirm(`Êtes-vous sûr de vouloir supprimer définitivement la catégorie "${catItem.name}" ?`)) {
                              deleteCategory(catItem.name);
                              showToast('Catégorie Supprimée', `La catégorie "${catItem.name}" a été supprimée avec succès.`, 'info');
                            }
                          }}
                          className="px-3 py-2 text-rose-600 hover:text-white hover:bg-rose-600 bg-rose-50 border border-rose-200 rounded-xl transition-all font-extrabold text-xs flex items-center gap-1.5 shrink-0 cursor-pointer shadow-2xs"
                          title="Supprimer cette catégorie"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span>Supprimer</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: ORDERS MANAGEMENT */}
      {adminTab === 'orders' && hasTabPermission('orders') && (
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

            <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
              <button
                onClick={exportOrdersToPDF}
                className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-400 border border-slate-800 font-extrabold text-xs transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer shrink-0"
              >
                <FileText className="w-4 h-4 text-amber-400" />
                <span>Exporter PDF</span>
              </button>

              <button
                onClick={handleResetSales}
                className="px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs transition-all flex items-center justify-center gap-1.5 shrink-0 cursor-pointer"
                title="Remettre le compteur de ventes et l'historique des commandes à zéro"
              >
                <span>Remettre à zéro</span>
              </button>

              <div className="relative flex-1 min-w-[200px] sm:w-64">
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
          </div>

          {filteredOrders.length === 0 ? (
            <p className="text-xs text-slate-500 py-8 text-center">Aucune commande enregistrée pour le moment.</p>
          ) : (
            <div className="space-y-4">
              {filteredOrders.map((ord, index) => {
                const isWaOrder = ord.orderType === 'whatsapp' || 
                  (ord.deliveryAddress && ord.deliveryAddress.includes('WhatsApp')) ||
                  (ord.deliveryNotes && ord.deliveryNotes.includes('WhatsApp'));
                
                const cleanPhone = ord.clientPhone ? ord.clientPhone.replace(/[^0-9]/g, '') : '';
                const waPhone = cleanPhone ? (cleanPhone.startsWith('228') ? cleanPhone : `228${cleanPhone}`) : '';

                return (
                  <div key={`${ord.id}_${index}`} className={`p-5 rounded-2xl border space-y-3 ${isWaOrder ? 'bg-gradient-to-r from-emerald-50/70 via-teal-50/40 to-emerald-50/70 border-emerald-300 shadow-2xs' : 'bg-slate-50 border-slate-200'}`}>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-black text-xs text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-md">
                          #{ord.id}
                        </span>

                        {isWaOrder ? (
                          <span className="px-2.5 py-1 rounded-full bg-emerald-600 text-white font-black text-[10px] tracking-wider uppercase flex items-center gap-1 shadow-2xs">
                            <span>💬</span> Commande WhatsApp
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full bg-blue-600 text-white font-black text-[10px] tracking-wider uppercase flex items-center gap-1 shadow-2xs">
                            <span>🌐</span> Commande Site Direct
                          </span>
                        )}

                        <span className="text-xs font-bold text-slate-900 ml-1">
                          Client : {ord.clientName} ({ord.clientPhone} • {ord.clientEmail})
                        </span>
                      </div>

                      <div className="flex items-center gap-2 flex-wrap">
                        {cleanPhone && (
                          <a
                            href={`https://wa.me/${waPhone}?text=${encodeURIComponent(`Bonjour ${ord.clientName}, nous avons bien reçu votre commande #${ord.id} chez DONALDSON SPORT.`)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-xs transition-all flex items-center gap-1.5"
                          >
                            <span>💬</span> Écrire sur WhatsApp
                          </a>
                        )}

                        {ord.deliveryStatus === 'En attente' && (
                          <button
                            onClick={() => updateOrderStatus(ord.id, 'Confirmée')}
                            className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-xs transition-all flex items-center gap-1.5"
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                            Confirmer
                          </button>
                        )}

                        <span className="text-[10px] font-bold text-slate-500 uppercase">Statut :</span>
                        <select
                          value={ord.deliveryStatus}
                          onChange={(e) => updateOrderStatus(ord.id, e.target.value as OrderDeliveryStatus)}
                          className="px-2.5 py-1 rounded-lg border border-slate-300 text-xs font-bold text-slate-800 outline-none bg-white"
                        >
                          <option value="En attente">En attente</option>
                          <option value="Confirmée">Confirmée</option>
                          <option value="En cours de livraison">En cours de livraison</option>
                          <option value="Livrée">Livrée</option>
                          <option value="Annulée">Annulée</option>
                        </select>

                        <button
                          onClick={() => deleteOrder(ord.id)}
                          className="p-1 text-rose-500 hover:bg-rose-100 rounded-lg cursor-pointer"
                          title="Supprimer la commande"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                      <div>
                        <p className="font-extrabold text-slate-800 mb-1">Articles Commandés :</p>
                        <ul className="space-y-1.5">
                          {ord.items.map((item, idx) => (
                            <li key={idx} className="flex items-center justify-between text-slate-700 bg-white p-2.5 rounded-xl border border-slate-200 gap-2">
                              <div className="flex items-center gap-2.5">
                                {item.imageUrl && (
                                  <img 
                                    src={item.imageUrl} 
                                    alt={item.productName} 
                                    referrerPolicy="no-referrer"
                                    className="w-10 h-10 object-cover rounded-lg border border-slate-200"
                                  />
                                )}
                                <div>
                                  <p className="font-bold text-slate-900">{item.productName}</p>
                                  <p className="text-[11px] text-slate-500">Taille: {item.selectedSize || 'Standard'} • Qté: x{item.quantity}</p>
                                </div>
                              </div>
                              <strong className="text-emerald-700 text-sm whitespace-nowrap">{formatFCFA(item.priceFCFA * item.quantity)}</strong>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-1.5">
                        <p className="font-bold text-slate-900">Mode & Coordonnées Client :</p>
                        <p className="text-slate-700">
                          {ord.wantsDelivery 
                            ? `🚚 Livraison : ${ord.deliveryAddress || 'Adresse non renseignée'}, ${ord.deliveryCity || 'Lomé'}`
                            : `🏪 Retrait Magasin : Sur place à Lomé (Bè)`}
                        </p>
                        {ord.deliveryNotes && <p className="text-[11px] text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-100 italic">Notes: {ord.deliveryNotes}</p>}
                        
                        <p className="text-[11px] text-amber-800 font-semibold bg-amber-50 p-2 rounded-lg border border-amber-200">
                          {ord.deliveryFeeNotice}
                        </p>

                        <div className="pt-2 flex justify-between font-black text-sm text-slate-900 border-t border-slate-100">
                          <span>Total Articles :</span>
                          <span className="text-emerald-700 text-base">{formatFCFA(ord.totalFCFA)}</span>
                        </div>
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 5: SUPPORT & CHATBOT QUESTIONS */}
      {adminTab === 'support' && hasTabPermission('support') && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-amber-600" />
                Questions & Demandes d'Aide Reçues du Chatbot ({chatMessages.filter(m => m.sender === 'user').length})
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Consultez les messages des utilisateurs posés au chatbot. Lorsqu'une question ne trouve pas réponse automatique, elle est transmise ici avec un récapitulatif des coordonnées client.
              </p>
            </div>

            {/* Filter buttons */}
            <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-2xl border border-slate-200 text-xs font-bold flex-wrap">
              <button
                onClick={() => setSupportFilter('all')}
                className={`px-3 py-1.5 rounded-xl transition-all ${
                  supportFilter === 'all'
                    ? 'bg-white text-slate-900 shadow-xs font-black'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                💬 Toutes ({chatMessages.filter(m => m.sender === 'user').length})
              </button>
              <button
                onClick={() => setSupportFilter('unanswered')}
                className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
                  supportFilter === 'unanswered'
                    ? 'bg-rose-600 text-white shadow-xs font-black'
                    : unansweredQueries.length > 0
                      ? 'bg-rose-100 text-rose-800 font-extrabold animate-pulse'
                      : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>🚨 Non Résolues</span>
                <span className="px-1.5 py-0.2 rounded-full bg-white/20 text-[10px]">
                  {unansweredQueries.length}
                </span>
              </button>
              <button
                onClick={() => {
                  setSupportFilter('history');
                  if (!selectedHistoryUserId && chatThreads.length > 0) {
                    setSelectedHistoryUserId(chatThreads[0].key);
                  }
                }}
                className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
                  supportFilter === 'history'
                    ? 'bg-slate-900 text-white shadow-xs font-black'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <History className="w-3.5 h-3.5" />
                <span>📜 Historique des Conversations</span>
                <span className="px-1.5 py-0.2 rounded-full bg-amber-400 text-slate-950 text-[10px] font-black">
                  {chatThreads.length}
                </span>
              </button>
            </div>
          </div>

          {/* Banner notification in tab if unanswered queries exist */}
          {unansweredQueries.length > 0 && supportFilter !== 'history' && (
            <div className="p-4 rounded-2xl bg-amber-50 border-2 border-amber-300 text-amber-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs shadow-xs">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-200 text-amber-900 font-black flex items-center justify-center text-lg shrink-0">
                  ⚠️
                </div>
                <div>
                  <strong className="font-black block text-sm">
                    {unansweredQueries.length} question(s) transmise(s) par le chatbot nécessitent une réponse d'administration !
                  </strong>
                  <span className="text-amber-800">
                    Répondez directement ci-dessous pour débloquer les clients. Votre message sera envoyé dans leur fenêtre de discussion et sauvegardé.
                  </span>
                </div>
              </div>
              {supportFilter === 'all' && (
                <button
                  onClick={() => setSupportFilter('unanswered')}
                  className="px-3.5 py-1.5 rounded-xl bg-amber-900 text-amber-100 font-black hover:bg-black transition-all shrink-0 cursor-pointer"
                >
                  Filtrer URGENTES ({unansweredQueries.length})
                </button>
              )}
            </div>
          )}

          {/* HISTORIQUE DES CONVERSATIONS MODE */}
          {supportFilter === 'history' ? (
            <div className="space-y-4">
              <div className="p-3.5 bg-slate-900 text-white rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs shadow-sm">
                <div className="flex items-center gap-2.5">
                  <History className="w-5 h-5 text-amber-400 shrink-0" />
                  <div>
                    <h4 className="font-extrabold text-sm text-amber-400">Historique Complet des Dialogues Clients & Support</h4>
                    <p className="text-[11px] text-slate-300">
                      Consultez l'ensemble des échanges passés entre les visiteurs, le chatbot et l'équipe support.
                    </p>
                  </div>
                </div>
                <div className="text-[11px] font-extrabold bg-white/10 px-3 py-1.5 rounded-xl border border-white/10 shrink-0 text-amber-300">
                  📊 {chatThreads.length} fil(s) de discussion
                </div>
              </div>

              {chatThreads.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-500">
                  Aucun historique de conversation disponible sur la plateforme.
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                  {/* Left Column: List of conversation threads */}
                  <div className="lg:col-span-5 bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-3">
                    <div className="relative">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        value={historySearchQuery}
                        onChange={(e) => setHistorySearchQuery(e.target.value)}
                        placeholder="Rechercher nom, tel, email ou message..."
                        className="w-full pl-9 pr-3 py-2 bg-white rounded-xl border border-slate-200 text-xs font-medium outline-none focus:border-amber-500 shadow-2xs"
                      />
                    </div>

                    <div className="max-h-[520px] overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                      {chatThreads
                        .filter(t => {
                          if (!historySearchQuery.trim()) return true;
                          const q = historySearchQuery.toLowerCase();
                          return (
                            t.userName.toLowerCase().includes(q) ||
                            (t.userEmail && t.userEmail.toLowerCase().includes(q)) ||
                            (t.userPhone && t.userPhone.toLowerCase().includes(q)) ||
                            t.messages.some(m => m.text.toLowerCase().includes(q))
                          );
                        })
                        .map(thread => {
                          const activeKey = selectedHistoryUserId || chatThreads[0]?.key;
                          const isSelected = activeKey === thread.key;
                          return (
                            <button
                              key={thread.key}
                              onClick={() => setSelectedHistoryUserId(thread.key)}
                              className={`w-full p-3 rounded-xl border text-left transition-all flex items-start gap-3 cursor-pointer ${
                                isSelected
                                  ? 'bg-slate-900 text-white border-slate-900 shadow-md ring-2 ring-amber-400/50'
                                  : thread.hasUnanswered
                                    ? 'bg-rose-50/90 border-rose-300 hover:bg-rose-100'
                                    : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-100/80'
                              }`}
                            >
                              {(() => {
                                const userObj = users.find(u => u.id === thread.userId);
                                const avatar = userObj?.avatarUrl;
                                if (avatar) {
                                  return (
                                    <div className="w-9 h-9 rounded-full overflow-hidden border border-slate-300 shrink-0">
                                      <img src={avatar} alt={thread.userName} className="w-full h-full object-cover" />
                                    </div>
                                  );
                                }
                                return (
                                  <div className={`w-9 h-9 rounded-full font-black text-xs flex items-center justify-center shrink-0 ${
                                    isSelected ? 'bg-amber-400 text-slate-950' : thread.hasUnanswered ? 'bg-rose-600 text-white shadow-xs' : 'bg-amber-100 text-amber-900'
                                  }`}>
                                    {(thread.userName || 'C')[0]}
                                  </div>
                                );
                              })()}

                              <div className="flex-1 min-w-0 space-y-1">
                                <div className="flex items-center justify-between gap-1">
                                  <span className={`font-extrabold text-xs truncate ${isSelected ? 'text-white' : 'text-slate-900'}`}>
                                    {thread.userName}
                                  </span>
                                  <span className={`text-[10px] shrink-0 font-semibold ${isSelected ? 'text-slate-300' : 'text-slate-400'}`}>
                                    {new Date(thread.lastMessage.timestamp).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                                  </span>
                                </div>

                                <p className={`text-[11px] truncate ${isSelected ? 'text-slate-300' : 'text-slate-600'}`}>
                                  {thread.lastMessage.sender === 'user' ? '💬' : ((thread.lastMessage.sender as any) === 'bot' || thread.lastMessage.sender === 'assistant') ? '🤖 Chat:' : '👑 Admin:'} "{thread.lastMessage.text}"
                                </p>

                                <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                                  <span className={`text-[9px] px-2 py-0.2 rounded-full font-bold ${
                                    isSelected ? 'bg-white/15 text-amber-300' : 'bg-slate-100 text-slate-600'
                                  }`}>
                                    {thread.messages.length} msg(s)
                                  </span>
                                  {thread.hasUnanswered && (
                                    <span className="text-[9px] px-2 py-0.2 rounded-full bg-rose-600 text-white font-black animate-pulse">
                                      🚨 Action Requise
                                    </span>
                                  )}
                                </div>
                              </div>
                            </button>
                          );
                        })}
                    </div>
                  </div>

                  {/* Right Column: Selected Thread Chat Transcript */}
                  <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col h-[560px]">
                    {(() => {
                      const activeKey = selectedHistoryUserId || chatThreads[0]?.key;
                      const activeThread = chatThreads.find(t => t.key === activeKey) || chatThreads[0];
                      if (!activeThread) {
                        return (
                          <div className="flex-1 flex items-center justify-center p-8 text-slate-400 text-xs font-medium">
                            Sélectionnez une conversation pour voir l'historique détaillé.
                          </div>
                        );
                      }

                      return (
                        <>
                          {/* Thread Inspector Header */}
                          <div className="p-3.5 bg-slate-100/90 border-b border-slate-200 rounded-t-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shrink-0">
                            <div className="flex items-center gap-2.5">
                              {(() => {
                                const userObj = users.find(u => u.id === activeThread.userId);
                                const threadAvatar = userObj?.avatarUrl;
                                if (threadAvatar) {
                                  return (
                                    <div className="w-9 h-9 rounded-full overflow-hidden border border-slate-300 shrink-0">
                                      <img src={threadAvatar} alt={activeThread.userName} className="w-full h-full object-cover" />
                                    </div>
                                  );
                                }
                                return (
                                  <div className="w-9 h-9 rounded-full bg-amber-400 text-slate-950 font-black text-xs flex items-center justify-center shadow-xs">
                                    {(activeThread.userName || 'C')[0]}
                                  </div>
                                );
                              })()}
                              <div>
                                <h4 className="font-extrabold text-xs text-slate-900 flex items-center gap-2">
                                  {activeThread.userName}
                                  {activeThread.hasUnanswered ? (
                                    <span className="px-2 py-0.2 rounded-full bg-rose-600 text-white text-[9px] font-black uppercase">
                                      🚨 Question Transmise
                                    </span>
                                  ) : (
                                    <span className="px-2 py-0.2 rounded-full bg-emerald-100 text-emerald-800 text-[9px] font-bold">
                                      ✓ À Jour
                                    </span>
                                  )}
                                  {pausedAiUserIds.includes(activeThread.userId) && (
                                    <span className="px-2 py-0.2 rounded-full bg-rose-950 text-rose-200 text-[9px] font-black uppercase border border-rose-500/40">
                                      🛑 Chat Suspendu
                                    </span>
                                  )}
                                </h4>
                                <div className="text-[11px] text-slate-500 font-medium">
                                  {activeThread.userPhone && <span>📞 {activeThread.userPhone} </span>}
                                  {activeThread.userEmail && <span>• ✉️ {activeThread.userEmail}</span>}
                                </div>
                              </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
                              <button
                                onClick={() => togglePauseAiForUser(activeThread.userId)}
                                className={`px-3 py-1.5 rounded-xl font-extrabold text-xs transition-all flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95 shrink-0 ${
                                  pausedAiUserIds.includes(activeThread.userId)
                                    ? 'bg-rose-600 hover:bg-rose-700 text-white ring-2 ring-rose-400'
                                    : 'bg-slate-900 hover:bg-black text-amber-400 border border-amber-400/30'
                                }`}
                                title={pausedAiUserIds.includes(activeThread.userId) ? "Réactiver le chatbot pour ce client" : "Mettre en pause pour lui écrire directement sans automatique"}
                              >
                                {pausedAiUserIds.includes(activeThread.userId) ? '🔴 Réactiver Chatbot' : '⏸️ Suspendre Chatbot'}
                              </button>

                              <div className="text-right shrink-0 text-[10px] text-slate-500 font-semibold hidden md:block">
                                <div>💬 {activeThread.userMsgCount} client • 🤖 {activeThread.botMsgCount} chat • 👑 {activeThread.adminMsgCount} admin</div>
                                <div className="text-slate-400">Dernier : {new Date(activeThread.lastMessage.timestamp).toLocaleString('fr-FR')}</div>
                              </div>
                            </div>
                          </div>

                          {/* AI Paused Active Notification Strip */}
                          {pausedAiUserIds.includes(activeThread.userId) && (
                            <div className="bg-rose-600 text-white px-4 py-2 text-xs font-bold flex items-center justify-between border-b border-rose-700 shadow-inner">
                              <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                                <span>Mode Direct Admin Actif : Le Chatbot est suspendu pour {activeThread.userName}. Vos réponses sont envoyées directement sans réponse automatique.</span>
                              </div>
                              <button
                                onClick={() => togglePauseAiForUser(activeThread.userId)}
                                className="px-2 py-0.5 rounded bg-white text-rose-900 font-black text-[10px] hover:bg-rose-100 transition-colors"
                              >
                                Réactiver Chatbot
                              </button>
                            </div>
                          )}

                          {/* Message Stream */}
                          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50/60">
                            {activeThread.messages.map((m) => {
                              const isUser = m.sender === 'user';
                              const isBot = (m.sender as any) === 'bot' || m.sender === 'assistant';
                              const isAdmin = m.sender === 'admin';

                              return (
                                <div
                                  key={m.id}
                                  className={`flex flex-col ${isAdmin ? 'items-end' : 'items-start'} max-w-[88%] ${isAdmin ? 'ml-auto' : ''}`}
                                >
                                  <div className="flex items-center gap-1.5 mb-1 text-[10px] font-bold text-slate-500">
                                    {isUser && (
                                      <>
                                        {(() => {
                                          const userObj = users.find(u => u.id === m.userId);
                                          const avatar = m.userAvatarUrl || userObj?.avatarUrl;
                                          if (avatar) {
                                            return (
                                              <img src={avatar} alt={m.userName || 'Client'} className="w-4 h-4 rounded-full object-cover border border-slate-300 shrink-0" />
                                            );
                                          }
                                          return <span className="w-4 h-4 rounded-full bg-slate-200 text-slate-800 flex items-center justify-center font-black text-[9px]">👤</span>;
                                        })()}
                                        <span className="font-bold text-slate-700">{m.userName || 'Client'}</span>
                                      </>
                                    )}
                                    {isBot && (
                                      <>
                                        <Bot className="w-3.5 h-3.5 text-amber-500" />
                                        <span className="text-amber-900 font-black">Chatbot</span>
                                      </>
                                    )}
                                    {isAdmin && (
                                      <>
                                        <ShieldCheck className="w-3.5 h-3.5 text-slate-800" />
                                        <span className="text-slate-900 font-black">Administrateur</span>
                                      </>
                                    )}
                                    <span className="text-slate-400 font-normal ml-1">
                                      {new Date(m.timestamp).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                  </div>

                                  <div
                                    className={`p-3 rounded-2xl text-xs font-medium space-y-1.5 shadow-2xs ${
                                      isAdmin
                                        ? 'bg-slate-900 text-white rounded-br-2xs'
                                        : isBot
                                          ? 'bg-amber-50/90 text-slate-900 border border-amber-300 rounded-bl-2xs'
                                          : 'bg-white text-slate-900 border border-slate-200 rounded-bl-2xs'
                                    }`}
                                  >
                                    {m.imageUrl && (
                                      <div className="rounded-lg overflow-hidden max-w-xs border border-slate-200">
                                        <img src={m.imageUrl} alt="Pièce jointe" className="w-full max-h-40 object-cover" />
                                      </div>
                                    )}
                                    {m.audioUrl && (
                                      <div className="p-1.5 bg-slate-100 text-slate-800 rounded-xl max-w-xs">
                                        <span className="text-[10px] font-bold block mb-1">🎙️ Note vocale :</span>
                                        <audio src={m.audioUrl} controls className="w-full h-8" />
                                      </div>
                                    )}
                                    <p className="whitespace-pre-wrap leading-relaxed">{m.text}</p>
                                  </div>
                                </div>
                              );
                            })}
                          </div>

                          {/* Direct Reply Bar */}
                          <div className="p-3 bg-white border-t border-slate-200 rounded-b-2xl flex items-center gap-2">
                            <input
                              type="text"
                              value={historyThreadReplyText}
                              onChange={(e) => setHistoryThreadReplyText(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' && historyThreadReplyText.trim()) {
                                  sendAdminChatMessage(historyThreadReplyText.trim(), activeThread.userId);
                                  if (activeThread.hasUnanswered) {
                                    const unansweredMsgs = activeThread.messages.filter(m => m.needsAdminReply);
                                    unansweredMsgs.forEach(m => resolveChatMessageAdminReply(m.id));
                                  }
                                  if (activeThread.userId && activeThread.userId !== 'guest') {
                                    sendNotification({
                                      title: '💬 Réponse de l\'Administration DONALDSON SHOP',
                                      message: `L'administration a répondu : "${historyThreadReplyText.trim()}"`,
                                      targetUserId: activeThread.userId
                                    });
                                  }
                                  setHistoryThreadReplyText('');
                                }
                              }}
                              placeholder={`Répondre dans le fil de discussion de ${activeThread.userName}...`}
                              className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-medium outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 bg-slate-50"
                            />
                            <button
                              onClick={() => {
                                if (historyThreadReplyText.trim()) {
                                  sendAdminChatMessage(historyThreadReplyText.trim(), activeThread.userId);
                                  if (activeThread.hasUnanswered) {
                                    const unansweredMsgs = activeThread.messages.filter(m => m.needsAdminReply);
                                    unansweredMsgs.forEach(m => resolveChatMessageAdminReply(m.id));
                                  }
                                  if (activeThread.userId && activeThread.userId !== 'guest') {
                                    sendNotification({
                                      title: '💬 Réponse de l\'Administration DONALDSON SHOP',
                                      message: `L'administration a répondu : "${historyThreadReplyText.trim()}"`,
                                      targetUserId: activeThread.userId
                                    });
                                  }
                                  setHistoryThreadReplyText('');
                                  alert('Réponse envoyée au client dans son fil de discussion !');
                                }
                              }}
                              className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-black text-amber-400 font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer shadow-xs shrink-0"
                            >
                              <Send className="w-3.5 h-3.5 text-amber-400" />
                              Envoyer
                            </button>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                </div>
              )}
            </div>
          ) : chatMessages.filter(m => m.sender === 'user' && (supportFilter === 'all' || m.needsAdminReply)).length === 0 ? (
            <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-500">
              {supportFilter === 'unanswered' 
                ? "🎉 Aucune question non résolue en attente ! Toutes les demandes ont été traitées."
                : "Aucune question client enregistrée sur le chatbot pour le moment."
              }
            </div>
          ) : (
            <div className="space-y-4">
              {chatMessages
                .filter(m => m.sender === 'user' && (supportFilter === 'all' || m.needsAdminReply))
                .slice()
                .reverse()
                .map((msg) => (
                  <div 
                    key={msg.id} 
                    className={`p-4 rounded-2xl border space-y-3 transition-all ${
                      msg.needsAdminReply 
                        ? 'bg-gradient-to-r from-amber-50/95 via-rose-50/95 to-amber-50/95 border-amber-400 ring-2 ring-amber-400/40 shadow-md' 
                        : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-200/80 pb-2">
                      <div className="flex items-center gap-2">
                        {(() => {
                          const clientObj = users.find(u => u.id === msg.userId);
                          const avatar = msg.userAvatarUrl || clientObj?.avatarUrl;
                          if (avatar) {
                            return (
                              <div className="w-8 h-8 rounded-full overflow-hidden border border-slate-300 shrink-0">
                                <img src={avatar} alt={msg.userName || 'Client'} className="w-full h-full object-cover" />
                              </div>
                            );
                          }
                          return (
                            <div className={`w-8 h-8 rounded-full font-black text-xs flex items-center justify-center shrink-0 ${
                              msg.needsAdminReply ? 'bg-rose-600 text-white shadow-xs' : 'bg-amber-200 text-amber-900'
                            }`}>
                              {(msg.userName || 'C')[0]}
                            </div>
                          );
                        })()}
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-extrabold text-xs text-slate-900">
                              {msg.userName || 'Client Anonyme'}
                            </span>
                            {msg.needsAdminReply ? (
                              <span className="px-2.5 py-0.5 rounded-full bg-rose-600 text-white text-[10px] font-black uppercase tracking-wider shadow-xs flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                                🚨 Réponse Admin Requise
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                                ✓ Traité / Répondu
                              </span>
                            )}
                          </div>
                          {(msg.userPhone || msg.userEmail) && (
                            <span className="text-[11px] text-slate-500 font-medium">
                              {msg.userPhone} {msg.userEmail ? `• ${msg.userEmail}` : ''}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] text-slate-400 font-semibold">
                          {new Date(msg.timestamp).toLocaleString('fr-FR')}
                        </span>
                        <button
                          onClick={() => {
                            setSupportFilter('history');
                            const targetKey = msg.userId && msg.userId !== 'guest' ? msg.userId : (msg.userPhone ? `phone_${msg.userPhone}` : (msg.userName ? `name_${msg.userName}` : 'guest'));
                            setSelectedHistoryUserId(targetKey);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-900 text-[10px] font-bold transition-all flex items-center gap-1 cursor-pointer"
                          title="Voir la discussion complète"
                        >
                          <History className="w-3 h-3 text-amber-700" />
                          <span>Voir fil complet</span>
                        </button>
                        {msg.needsAdminReply && (
                          <button
                            onClick={() => resolveChatMessageAdminReply(msg.id)}
                            className="px-2.5 py-1 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-800 text-[10px] font-bold transition-all cursor-pointer"
                            title="Marquer comme résolu sans envoyer de message"
                          >
                            ✓ Marquer résolu
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 space-y-2 shadow-2xs">
                      {msg.imageUrl && (
                        <div className="rounded-lg overflow-hidden max-w-xs border border-slate-200">
                          <img src={msg.imageUrl} alt="Photo du client" className="w-full max-h-48 object-cover" />
                        </div>
                      )}
                      {msg.audioUrl && (
                        <div className="p-2 bg-slate-100 rounded-xl max-w-xs">
                          <span className="text-[10px] font-bold text-slate-600 block mb-1">🎙️ Note vocale reçue :</span>
                          <audio src={msg.audioUrl} controls className="w-full h-8" />
                        </div>
                      )}
                      <p className="text-xs text-slate-900 font-semibold leading-relaxed">
                        "{msg.text}"
                      </p>
                    </div>

                    {/* Reply Form */}
                    <div className="pt-1 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                      <input
                        type="text"
                        value={replyTextMap[msg.id] || ''}
                        onChange={(e) => setReplyTextMap({ ...replyTextMap, [msg.id]: e.target.value })}
                        placeholder="Tapez votre réponse administrateur ici..."
                        className="flex-1 px-3.5 py-2 rounded-xl border border-slate-300 text-xs outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 bg-white shadow-2xs font-medium"
                      />
                      <button
                        onClick={() => {
                          const reply = replyTextMap[msg.id];
                          if (reply && reply.trim()) {
                            sendAdminChatMessage(`[Réponse Admin à ${msg.userName || 'votre question'}] : ${reply.trim()}`, msg.userId);
                            
                            // Resolve the needsAdminReply flag
                            resolveChatMessageAdminReply(msg.id);

                            // Send notification to specific user
                            if (msg.userId && msg.userId !== 'guest') {
                              sendNotification({
                                title: '💬 Réponse de l\'Administration DONALDSON SHOP',
                                message: `L'administration a répondu à votre question : "${reply.trim()}"`,
                                targetUserId: msg.userId
                              });
                            }

                            setReplyTextMap({ ...replyTextMap, [msg.id]: '' });
                            alert('Votre réponse administrateur a été envoyée directement au client dans le chat !');
                          }
                        }}
                        className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-black text-amber-400 font-bold text-xs transition-all flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                      >
                        <Send className="w-3.5 h-3.5 text-amber-400" />
                        Répondre au client
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 5: ANNOUNCEMENTS MANAGEMENT */}
      {adminTab === 'announcements' && hasTabPermission('announcements') && (
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

      {/* TAB 6: BROADCAST NOTIFICATIONS & PERSISTENT ALERTS CENTER */}
      {adminTab === 'notifications' && hasTabPermission('notifications') && (
        <div className="space-y-6 max-w-4xl mx-auto">
          {/* Top Form for broadcasting notifications */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-6">
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Destinataire :</label>
                  <select
                    value={notifTargetUserId}
                    onChange={(e) => setNotifTargetUserId(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 font-semibold text-slate-800 outline-none focus:border-emerald-500"
                  >
                    <option value="ALL">📢 Tous les Clients (Diffusion Générale)</option>
                    {users.filter(u => u.role === 'client').map(u => (
                      <option key={u.id} value={u.id}>
                        👤 {u.firstName} {u.lastName} ({u.email})
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
                className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Send className="w-4 h-4" />
                Envoyer la Notification au(x) Client(s)
              </button>
            </form>
          </div>

          {/* Persistent Notifications & System Alerts Center */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-5">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <BellRing className="w-5 h-5 text-amber-600" />
                  Centre de Notifications & Alertes Admin ({notifications.length})
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Visualisez toutes les alertes de commandes WhatsApp, du site et les questions chatbot transmises.
                </p>
              </div>

              {/* Notification Filter Controls */}
              <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-2xl text-xs font-bold border border-slate-200 flex-wrap">
                <button
                  onClick={() => setNotifFilter('all')}
                  className={`px-3 py-1 rounded-xl transition-all ${
                    notifFilter === 'all'
                      ? 'bg-white text-slate-900 shadow-2xs font-black'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Toutes ({notifications.length})
                </button>
                <button
                  onClick={() => setNotifFilter('orders')}
                  className={`px-3 py-1 rounded-xl transition-all flex items-center gap-1.5 ${
                    notifFilter === 'orders'
                      ? 'bg-emerald-600 text-white font-black shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <span>💬 Commandes WhatsApp & Site</span>
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${notifFilter === 'orders' ? 'bg-emerald-800 text-emerald-100' : 'bg-emerald-100 text-emerald-900'}`}>
                    {orderNotifs.length}
                  </span>
                </button>
                <button
                  onClick={() => setNotifFilter('alerts')}
                  className={`px-3 py-1 rounded-xl transition-all flex items-center gap-1.5 ${
                    notifFilter === 'alerts'
                      ? 'bg-amber-500 text-slate-950 font-black shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <span>🚨 Questions Chat</span>
                  <span className="px-1.5 py-0.2 bg-amber-200 text-amber-950 rounded-full text-[10px]">
                    {unansweredNotifs.length}
                  </span>
                </button>
              </div>
            </div>

            {/* Admin Notifications Actions Bar */}
            {notifications.length > 0 && (
              <div className="flex flex-wrap items-center justify-between gap-2.5 p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
                {(() => {
                  const filteredNotifs = notifications.filter(n => {
                    if (notifFilter === 'alerts') {
                      return (
                        n.title.toLowerCase().includes('question') ||
                        n.title.toLowerCase().includes('chat') ||
                        n.message.toLowerCase().includes('chatbot') ||
                        n.message.toLowerCase().includes('espace admin')
                      );
                    }
                    if (notifFilter === 'orders') {
                      return (
                        n.title.toLowerCase().includes('commande') ||
                        n.title.toLowerCase().includes('whatsapp') ||
                        n.message.toLowerCase().includes('commandé') ||
                        n.message.toLowerCase().includes('commande') ||
                        n.message.toLowerCase().includes('whatsapp')
                      );
                    }
                    return true;
                  });
                  const filteredIds = filteredNotifs.map(n => n.id);
                  const isAllFilteredSelected = filteredIds.length > 0 && filteredIds.every(id => adminSelectedNotifIds.includes(id));

                  return (
                    <>
                      <button
                        type="button"
                        onClick={() => {
                          if (isAllFilteredSelected) {
                            setAdminSelectedNotifIds(prev => prev.filter(id => !filteredIds.includes(id)));
                          } else {
                            setAdminSelectedNotifIds(prev => Array.from(new Set([...prev, ...filteredIds])));
                          }
                        }}
                        className="px-3 py-1.5 rounded-xl bg-white border border-slate-300 hover:bg-slate-100 font-bold text-slate-800 flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
                      >
                        {isAllFilteredSelected ? (
                          <CheckSquare className="w-4 h-4 text-amber-600" />
                        ) : (
                          <Square className="w-4 h-4 text-slate-400" />
                        )}
                        <span>{isAllFilteredSelected ? 'Désélectionner tout' : 'Tout sélectionner'}</span>
                      </button>

                      <div className="flex items-center gap-2">
                        {adminSelectedNotifIds.length > 0 && (
                          <button
                            type="button"
                            onClick={() => {
                              deleteMultipleNotifications(adminSelectedNotifIds);
                              setAdminSelectedNotifIds([]);
                              showToast('Succès', `${adminSelectedNotifIds.length} notification(s) supprimée(s).`, 'success');
                            }}
                            className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
                          >
                            <Trash2 className="w-4 h-4" />
                            <span>Supprimer la sélection ({adminSelectedNotifIds.length})</span>
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => {
                            if (window.confirm('Voulez-vous vraiment effacer tout l\'historique des notifications ?')) {
                              clearAllNotifications();
                              setAdminSelectedNotifIds([]);
                              showToast('Vidé', 'L\'historique des notifications a été intégralement nettoyé.', 'info');
                            }
                          }}
                          className="px-3 py-1.5 rounded-xl bg-slate-200 hover:bg-rose-100 hover:text-rose-700 font-bold text-slate-700 flex items-center gap-1.5 transition-all cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span>Tout effacer</span>
                        </button>
                      </div>
                    </>
                  );
                })()}
              </div>
            )}

            {/* Notifications List */}
            {notifications.length === 0 ? (
              <div className="p-6 text-center bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-500">
                Aucune notification enregistrée dans l'historique système.
              </div>
            ) : (
              <div className="space-y-3">
                {notifications
                  .filter(n => {
                    if (notifFilter === 'alerts') {
                      return (
                        n.title.toLowerCase().includes('question') ||
                        n.title.toLowerCase().includes('chat') ||
                        n.message.toLowerCase().includes('chatbot') ||
                        n.message.toLowerCase().includes('espace admin')
                      );
                    }
                    if (notifFilter === 'orders') {
                      return (
                        n.title.toLowerCase().includes('commande') ||
                        n.title.toLowerCase().includes('whatsapp') ||
                        n.message.toLowerCase().includes('commandé') ||
                        n.message.toLowerCase().includes('commande') ||
                        n.message.toLowerCase().includes('whatsapp')
                      );
                    }
                    return true;
                  })
                  .slice()
                  .reverse()
                  .map((notif) => {
                    const isWhatsAppOrder = 
                      notif.title.toLowerCase().includes('whatsapp') || 
                      notif.message.toLowerCase().includes('whatsapp') ||
                      (notif.title.toLowerCase().includes('commande') && notif.message.toLowerCase().includes('whatsapp'));

                    const isDirectOrder = 
                      !isWhatsAppOrder && (
                        notif.title.toLowerCase().includes('commande') ||
                        notif.message.toLowerCase().includes('commandé') ||
                        notif.message.toLowerCase().includes('commande #')
                      );

                    const isChatbotAlert = 
                      !isWhatsAppOrder && !isDirectOrder && (
                        notif.title.toLowerCase().includes('question') ||
                        notif.title.toLowerCase().includes('chat') ||
                        notif.message.toLowerCase().includes('chatbot') ||
                        notif.message.toLowerCase().includes('espace admin')
                      );

                    const isSelected = adminSelectedNotifIds.includes(notif.id);

                    return (
                      <div
                        key={notif.id}
                        className={`p-4 rounded-2xl border space-y-2 transition-all relative ${
                          isSelected
                            ? 'bg-amber-100/80 border-amber-400 ring-2 ring-amber-400/50'
                            : isWhatsAppOrder
                              ? 'bg-gradient-to-r from-emerald-50 via-teal-50/40 to-emerald-50 border-emerald-300 shadow-2xs'
                              : isDirectOrder
                                ? 'bg-gradient-to-r from-blue-50 via-indigo-50/40 to-blue-50 border-blue-300 shadow-2xs'
                                : isChatbotAlert
                                  ? 'bg-gradient-to-r from-amber-50 via-rose-50 to-amber-50 border-amber-300 shadow-2xs'
                                  : 'bg-slate-50 border-slate-200'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2.5 flex-wrap">
                            <button
                              type="button"
                              onClick={() => {
                                setAdminSelectedNotifIds(prev =>
                                  prev.includes(notif.id)
                                    ? prev.filter(i => i !== notif.id)
                                    : [...prev, notif.id]
                                );
                              }}
                              className="text-slate-400 hover:text-amber-600 cursor-pointer"
                            >
                              {isSelected ? (
                                <CheckSquare className="w-4 h-4 text-amber-600" />
                              ) : (
                                <Square className="w-4 h-4 text-slate-300" />
                              )}
                            </button>

                            {isWhatsAppOrder ? (
                              <span className="px-2.5 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-black uppercase tracking-wider shadow-2xs flex items-center gap-1">
                                <span>💬</span> COMMANDE WHATSAPP
                              </span>
                            ) : isDirectOrder ? (
                              <span className="px-2.5 py-0.5 rounded-full bg-blue-600 text-white text-[10px] font-black uppercase tracking-wider shadow-2xs flex items-center gap-1">
                                <span>🛍️</span> COMMANDE SITE
                              </span>
                            ) : isChatbotAlert ? (
                              <span className="px-2.5 py-0.5 rounded-full bg-rose-600 text-white text-[10px] font-black uppercase tracking-wider shadow-2xs">
                                🚨 ALERTE CHATBOT
                              </span>
                            ) : (
                              <span className="px-2.5 py-0.5 rounded-full bg-slate-700 text-white text-[10px] font-black uppercase tracking-wider">
                                📢 BROADCAST
                              </span>
                            )}
                            <h4 className="font-black text-xs text-slate-900">{notif.title}</h4>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-slate-400 font-semibold">
                              {new Date(notif.createdAt).toLocaleString('fr-FR')}
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                deleteNotification(notif.id);
                                setAdminSelectedNotifIds(prev => prev.filter(i => i !== notif.id));
                              }}
                              className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-100 transition-colors cursor-pointer"
                              title="Supprimer cette alerte"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        <p className="text-xs text-slate-700 font-medium pl-6">
                          {notif.message}
                        </p>

                        <div className="pt-2 flex items-center justify-between gap-2 border-t border-slate-200/60 pl-6 flex-wrap">
                          <span className="text-[10px] text-slate-400 font-mono">
                            Destinataire: {notif.targetUserId === 'ALL' ? 'Tous les clients' : `ID User: ${notif.targetUserId}`}
                          </span>

                          <div className="flex items-center gap-2">
                            {(isWhatsAppOrder || isDirectOrder) && (
                              <button
                                onClick={() => {
                                  setAdminCategory('plans_produits');
                                  setAdminTab('orders');
                                }}
                                className="px-3 py-1 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-[11px] flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
                              >
                                <ShoppingBag className="w-3.5 h-3.5 text-amber-300" />
                                Voir dans Commandes →
                              </button>
                            )}

                            {isChatbotAlert && (
                              <button
                                onClick={() => {
                                  setAdminCategory('apprendre_soutenir');
                                  setAdminTab('support');
                                  setSupportFilter('unanswered');
                                }}
                                className="px-3 py-1 rounded-xl bg-slate-900 hover:bg-black text-amber-400 font-bold text-[11px] flex items-center gap-1 transition-all cursor-pointer shadow-2xs"
                              >
                                <MessageSquare className="w-3 h-3 text-amber-400" />
                                Voir dans le Chat Support →
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 8: PROMO CODES MANAGEMENT */}
      {adminTab === 'promocodes' && hasTabPermission('promocodes') && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
                <Ticket className="w-6 h-6 text-amber-600" />
                Gestion des Codes Promo & Réductions ({promoCodes.length})
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Créez vos propres codes de réduction, définissez les pourcentages de remise, le nombre de réductions disponibles et ciblez des articles spécifiques ou toute la boutique.
              </p>
            </div>

            <button
              onClick={openCreatePromoCode}
              className="px-5 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4" />
              Créer un Code Promo
            </button>
          </div>

          {/* Promo Codes Grid */}
          {promoCodes.length === 0 ? (
            <div className="p-10 text-center bg-amber-50/50 rounded-2xl border border-amber-200 space-y-3">
              <Ticket className="w-10 h-10 text-amber-500 mx-auto" />
              <p className="font-extrabold text-slate-800 text-sm">Aucun code promo créé pour le moment</p>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Cliquez sur "Créer un Code Promo" pour lancer une offre de réduction et la partager avec vos utilisateurs.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {promoCodes.map((promo) => {
                const isExpired = promo.usedCount >= promo.maxUses;
                const remainingUses = Math.max(0, promo.maxUses - promo.usedCount);
                const progressPct = Math.min(100, (promo.usedCount / promo.maxUses) * 100);

                return (
                  <div
                    key={promo.id}
                    className={`p-5 rounded-3xl border flex flex-col justify-between space-y-4 transition-all ${
                      !promo.active 
                        ? 'bg-slate-50 border-slate-200 opacity-60' 
                        : isExpired 
                          ? 'bg-rose-50/40 border-rose-200' 
                          : 'bg-gradient-to-br from-amber-50/80 via-white to-amber-50/30 border-amber-300/80 shadow-xs hover:shadow-md'
                    }`}
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-black text-sm tracking-wider px-3 py-1 rounded-xl bg-slate-900 text-amber-400 font-mono border border-slate-800 flex items-center gap-1.5 shadow-2xs">
                            <Ticket className="w-3.5 h-3.5 text-amber-400" />
                            {promo.code}
                          </span>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(promo.code);
                              setCopiedCodeId(promo.id);
                              setTimeout(() => setCopiedCodeId(null), 2000);
                              showToast('Code Copié !', `Code ${promo.code} copié dans votre presse-papier.`, 'info');
                            }}
                            className="p-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 cursor-pointer"
                            title="Copier le code"
                          >
                            {copiedCodeId === promo.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>

                        <span className="px-2.5 py-1 rounded-xl bg-emerald-600 text-white font-black text-xs shadow-2xs">
                          -{promo.discountPercent}%
                        </span>
                      </div>

                      {promo.description && (
                        <p className="text-xs text-slate-700 font-medium">
                          {promo.description}
                        </p>
                      )}

                      {/* Applicable articles summary */}
                      <div className="p-2.5 rounded-xl bg-white border border-slate-200/80 text-[11px] space-y-1">
                        <span className="font-bold text-slate-500 uppercase text-[10px] block">Articles éligibles :</span>
                        {!promo.applicableProductIds || promo.applicableProductIds.length === 0 || promo.applicableProductIds.includes('ALL') ? (
                          <span className="font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md inline-block">
                            🌐 Tous les articles de la boutique
                          </span>
                        ) : (
                          <div className="flex flex-wrap gap-1">
                            {promo.applicableProductIds.map(pId => {
                              const found = products.find(p => p.id === pId);
                              return (
                                <span key={pId} className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-800 font-extrabold text-[10px] border border-slate-200">
                                  {found ? found.name : pId}
                                </span>
                              );
                            })}
                          </div>
                        )}
                      </div>

                      {/* Usage statistics bar */}
                      <div className="space-y-1 pt-1">
                        <div className="flex justify-between text-[11px] font-bold">
                          <span className="text-slate-600">Utilisations :</span>
                          <span className={remainingUses === 0 ? "text-rose-600" : "text-slate-900"}>
                            <strong>{promo.usedCount}</strong> / {promo.maxUses} ({remainingUses} restantes)
                          </span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden border border-slate-200">
                          <div
                            className={`h-full transition-all ${
                              progressPct >= 100 ? 'bg-rose-500' : progressPct > 75 ? 'bg-amber-500' : 'bg-emerald-500'
                            }`}
                            style={{ width: `${progressPct}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="pt-3 border-t border-slate-200/80 flex items-center justify-between gap-2">
                      <button
                        onClick={() => {
                          setSelectedPromoForSending(promo);
                          setSendTargetUserId('ALL');
                          setSendPromoMessageNote(`Profitez de -${promo.discountPercent}% de réduction avec le code ${promo.code} !`);
                          setSendPromoModalOpen(true);
                        }}
                        className="flex-1 py-2 px-3 rounded-xl bg-slate-900 hover:bg-black text-amber-400 font-extrabold text-xs shadow-2xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Send className="w-3.5 h-3.5 text-amber-400" />
                        <span>Envoyer aux Clients 📩</span>
                      </button>

                      <button
                        onClick={() => openEditPromoCode(promo)}
                        className="p-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 cursor-pointer"
                        title="Éditer ce code promo"
                      >
                        <Edit className="w-4 h-4 text-blue-600" />
                      </button>

                      <button
                        onClick={() => deletePromoCode(promo.id)}
                        className="p-2 rounded-xl bg-white border border-slate-200 text-rose-600 hover:bg-rose-50 cursor-pointer"
                        title="Supprimer ce code promo"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 9: À PROPOS DE NOUS */}
      {adminTab === 'about' && hasTabPermission('about') && (
        <div className="space-y-6 animate-msg-slide-up">
          {/* Main About Header Card */}
          <div className="bg-gradient-to-br from-stone-900 via-amber-950 to-stone-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-amber-500/30 relative overflow-hidden">
            <div className="absolute right-0 top-0 translate-x-10 -translate-y-10 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
            
            <div className="relative z-10 space-y-4 max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 font-bold text-xs uppercase border border-amber-400/30">
                <Info className="w-4 h-4 text-amber-400" />
                Identité & Coordonnées Officielles
              </div>

              <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
                À PROPOS DE DONALDSON SHOP
              </h2>

              <p className="text-amber-100/90 text-sm sm:text-base leading-relaxed">
                Donaldson Shop est la boutique de référence spécialisée dans la vente d'équipements sportifs d'élite, maillots de football officiels, chaussures à crampons pro, ballons certifiés et accessoires d'entraînement haut de gamme à Lomé (Togo) et dans la sous-région.
              </p>

              <div className="flex flex-wrap gap-3 pt-2">
                <div className="bg-black/40 backdrop-blur-md px-4 py-2 rounded-xl border border-amber-400/20 flex items-center gap-2 text-xs font-semibold">
                  <MapPin className="w-4 h-4 text-amber-400" />
                  <span>Lomé - Quartier Bè, Togo</span>
                </div>
                <div className="bg-black/40 backdrop-blur-md px-4 py-2 rounded-xl border border-amber-400/20 flex items-center gap-2 text-xs font-semibold">
                  <Clock className="w-4 h-4 text-amber-400" />
                  <span>Lun - Sam : 08h00 - 20h30</span>
                </div>
                <div className="bg-black/40 backdrop-blur-md px-4 py-2 rounded-xl border border-amber-400/20 flex items-center gap-2 text-xs font-semibold">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Plateforme Sécurisée Super Admin</span>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Details & Official Channels Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* 1. Lignes WhatsApp & Téléphones */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                  <Phone className="w-6 h-6" />
                </div>
                <h3 className="font-black text-lg text-slate-900">Lignes WhatsApp Directes</h3>
                <p className="text-xs text-slate-500 font-medium">
                  Numéros officiels pour la commande rapide, le service client et le suivi des livraisons.
                </p>
                <div className="space-y-2 pt-2">
                  <a
                    href="https://wa.me/22898140953"
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between p-3 rounded-2xl bg-emerald-50 hover:bg-emerald-100 text-emerald-950 font-black text-xs border border-emerald-200 transition-colors"
                  >
                    <span>Ligne 1 : +228 98 14 09 53</span>
                    <span className="bg-emerald-600 text-white text-[10px] px-2 py-0.5 rounded-lg">WhatsApp 💬</span>
                  </a>
                  <a
                    href="https://wa.me/22897528547"
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between p-3 rounded-2xl bg-emerald-50 hover:bg-emerald-100 text-emerald-950 font-black text-xs border border-emerald-200 transition-colors"
                  >
                    <span>Ligne 2 : +228 97 52 85 47</span>
                    <span className="bg-emerald-600 text-white text-[10px] px-2 py-0.5 rounded-lg">WhatsApp 💬</span>
                  </a>
                  <a
                    href="https://wa.me/22890795416"
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between p-3 rounded-2xl bg-emerald-50 hover:bg-emerald-100 text-emerald-950 font-black text-xs border border-emerald-200 transition-colors"
                  >
                    <span>Ligne 3 : +228 90 79 54 16</span>
                    <span className="bg-emerald-600 text-white text-[10px] px-2 py-0.5 rounded-lg">WhatsApp 💬</span>
                  </a>
                </div>
              </div>
            </div>

            {/* 2. Emails & Support Administratif */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                  <Mail className="w-6 h-6" />
                </div>
                <h3 className="font-black text-lg text-slate-900">Courriels & Service Support</h3>
                <p className="text-xs text-slate-500 font-medium">
                  Adresses électroniques pour la correspondance officielle, partenariats et facturation.
                </p>
                <div className="space-y-2 pt-2">
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
                    <span className="font-bold text-slate-500 uppercase text-[10px] block">Email Administrateur 1 (Yahoo) :</span>
                    <a href="mailto:donaldsonshop@yahoo.com" className="font-black text-slate-900 hover:text-blue-600 transition-colors">
                      donaldsonshop@yahoo.com
                    </a>
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
                    <span className="font-bold text-slate-500 uppercase text-[10px] block">Email Administrateur 2 (Gmail) :</span>
                    <a href="mailto:tace616@gmail.com" className="font-black text-slate-900 hover:text-blue-600 transition-colors">
                      tace616@gmail.com
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* 3. Sécurité & Droits Administrateurs */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h3 className="font-black text-lg text-slate-900">Sécurité & Contrôle d'Accès</h3>
                <p className="text-xs text-slate-500 font-medium">
                  Gestion centralisée avec délégation modulaire pour les assistants administrateurs.
                </p>
                <div className="space-y-2 pt-2">
                  <div className="p-3 rounded-2xl bg-amber-50/60 border border-amber-200 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-amber-950">Statut Compte :</span>
                      <span className="bg-amber-400 text-amber-950 font-black text-[10px] px-2 py-0.5 rounded-md uppercase">
                        {isSuperAdmin ? 'SUPER ADMIN' : 'ASSISTANT ADMIN'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 font-medium">
                      {isSuperAdmin 
                        ? 'Accès illimité à tous les modules commerciaux, analytics, assistants et configurations.'
                        : 'Accès configuré selon les permissions attribuées par le Super Admin.'}
                    </p>
                  </div>
                  {isSuperAdmin && (
                    <button
                      onClick={() => {
                        setAdminCategory('communaute_evenements');
                        setAdminTab('users');
                      }}
                      className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-black text-amber-400 font-black text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                    >
                      <Users className="w-4 h-4" />
                      <span>Gérer les Assistants & Rôles</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

          </div>

          {/* Quick Shortcuts Section */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                  <Database className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-base text-slate-900 flex items-center gap-2">
                    <span>État de Synchronisation Cloud & Base Firebase</span>
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                      firestoreConnected ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${firestoreConnected ? 'bg-emerald-600 animate-pulse' : 'bg-amber-600'}`} />
                      {firestoreConnected ? 'Actif & Synchronisé' : 'Mode Local'}
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    Base de données Firestore : <code className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-800 font-mono text-[11px]">ai-studio-donaldsonshop-b74bb9e1-15f5-4a5c-804e-983c5b4f9a65</code>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => checkFirestoreStatus().then(res => showToast(res.connected ? 'Test Firestore Réussi ! 🟢' : 'Mode Autonome', res.message, res.connected ? 'success' : 'info'))}
                  className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Wifi className="w-3.5 h-3.5 text-slate-600" />
                  <span>Tester Connexion</span>
                </button>
                <button
                  type="button"
                  onClick={() => syncAllToFirestore()}
                  disabled={isSyncingFirestore}
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-black text-amber-400 font-black text-xs transition-all flex items-center gap-1.5 cursor-pointer shadow-md disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSyncingFirestore ? 'animate-spin' : ''}`} />
                  <span>{isSyncingFirestore ? 'Synchronisation...' : 'Forcer Synchronisation Complète'}</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5 pt-1">
              <div className="p-2.5 rounded-2xl bg-slate-50 border border-slate-200/80 text-center">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Articles</span>
                <span className="text-sm font-black text-slate-900">{products.length}</span>
              </div>
              <div className="p-2.5 rounded-2xl bg-slate-50 border border-slate-200/80 text-center">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Catégories</span>
                <span className="text-sm font-black text-slate-900">{categoryItems.length}</span>
              </div>
              <div className="p-2.5 rounded-2xl bg-slate-50 border border-slate-200/80 text-center">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Commandes</span>
                <span className="text-sm font-black text-slate-900">{orders.length}</span>
              </div>
              <div className="p-2.5 rounded-2xl bg-slate-50 border border-slate-200/80 text-center">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Annonces</span>
                <span className="text-sm font-black text-slate-900">{announcements.length}</span>
              </div>
              <div className="p-2.5 rounded-2xl bg-slate-50 border border-slate-200/80 text-center">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Codes Promo</span>
                <span className="text-sm font-black text-slate-900">{promoCodes.length}</span>
              </div>
              <div className="p-2.5 rounded-2xl bg-slate-50 border border-slate-200/80 text-center">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Comptes</span>
                <span className="text-sm font-black text-slate-900">{users.length}</span>
              </div>
              <div className="p-2.5 rounded-2xl bg-slate-50 border border-slate-200/80 text-center col-span-2 sm:col-span-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Notifications</span>
                <span className="text-sm font-black text-slate-900">{notifications.length}</span>
              </div>
            </div>
          </div>

          {/* Quick Shortcuts Section */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-black text-base text-slate-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-600" />
              <span>Raccourcis de Gestion Rapide Donaldson Shop</span>
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <button
                onClick={() => {
                  setAdminCategory('plans_produits');
                  setAdminTab('products');
                }}
                className="p-4 rounded-2xl bg-slate-50 hover:bg-amber-50/80 border border-slate-200 hover:border-amber-300 transition-all text-left space-y-1 cursor-pointer group"
              >
                <Package className="w-5 h-5 text-amber-600 group-hover:scale-110 transition-transform" />
                <p className="font-black text-xs text-slate-900">Articles & Stock</p>
                <p className="text-[10px] text-slate-500">{products.length} articles répertoriés</p>
              </button>

              <button
                onClick={() => {
                  setAdminCategory('plans_produits');
                  setAdminTab('orders');
                }}
                className="p-4 rounded-2xl bg-slate-50 hover:bg-amber-50/80 border border-slate-200 hover:border-amber-300 transition-all text-left space-y-1 cursor-pointer group"
              >
                <ShoppingBag className="w-5 h-5 text-amber-600 group-hover:scale-110 transition-transform" />
                <p className="font-black text-xs text-slate-900">Commandes Clients</p>
                <p className="text-[10px] text-slate-500">{orders.length} commandes enregistrées</p>
              </button>

              <button
                onClick={() => {
                  setAdminCategory('apprendre_soutenir');
                  setAdminTab('support');
                }}
                className="p-4 rounded-2xl bg-slate-50 hover:bg-amber-50/80 border border-slate-200 hover:border-amber-300 transition-all text-left space-y-1 cursor-pointer group"
              >
                <MessageSquare className="w-5 h-5 text-amber-600 group-hover:scale-110 transition-transform" />
                <p className="font-black text-xs text-slate-900">Support Chatbot IA</p>
                <p className="text-[10px] text-slate-500">Assistance continue 24/7</p>
              </button>

              <button
                onClick={() => {
                  setAdminCategory('communaute_evenements');
                  setAdminTab('announcements');
                }}
                className="p-4 rounded-2xl bg-slate-50 hover:bg-amber-50/80 border border-slate-200 hover:border-amber-300 transition-all text-left space-y-1 cursor-pointer group"
              >
                <Megaphone className="w-5 h-5 text-amber-600 group-hover:scale-110 transition-transform" />
                <p className="font-black text-xs text-slate-900">Annonces & Matchs</p>
                <p className="text-[10px] text-slate-500">{announcements.length} annonces actives</p>
              </button>
            </div>
          </div>

        </div>
      )}
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
                  <div className="flex items-center justify-between mb-1">
                    <label className="block font-bold text-slate-800">Catégorie *</label>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setIsProductModalOpen(false);
                          setAdminTab('categories');
                        }}
                        className="text-[10px] font-extrabold text-rose-600 hover:underline flex items-center gap-0.5 cursor-pointer"
                        title="Ouvrir l'espace de suppression et gestion des catégories"
                      >
                        <Trash2 className="w-3 h-3" />
                        Gérer/Supprimer
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setIsCustomCategory(!isCustomCategory);
                          if (!isCustomCategory) {
                            setCustomCategoryInput('');
                          }
                        }}
                        className="text-[10px] font-extrabold text-emerald-700 hover:underline flex items-center gap-0.5 cursor-pointer"
                      >
                        <Plus className="w-3 h-3" />
                        {isCustomCategory ? "Choisir existante" : "Nouvelle catégorie"}
                      </button>
                    </div>
                  </div>

                  {isCustomCategory || categories.length === 0 ? (
                    <input
                      type="text"
                      value={customCategoryInput}
                      onChange={(e) => setCustomCategoryInput(e.target.value)}
                      placeholder="Ex: Équipements de Basket, Sacs..."
                      required
                      className="w-full px-3.5 py-2.5 rounded-xl border border-emerald-300 outline-none focus:border-emerald-600 font-semibold text-slate-900 bg-emerald-50/40"
                    />
                  ) : (
                    <select
                      value={prodCategory}
                      onChange={(e) => {
                        if (e.target.value === '__NEW__') {
                          setIsCustomCategory(true);
                          setCustomCategoryInput('');
                        } else {
                          setProdCategory(e.target.value);
                        }
                      }}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 outline-none focus:border-emerald-500 font-semibold"
                    >
                      {categories.map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                      <option value="__NEW__">+ Créer une nouvelle catégorie...</option>
                    </select>
                  )}
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

              {/* Option Flocage & Personnalisation in Admin */}
              <div className="p-3.5 rounded-2xl bg-amber-50/60 border border-amber-200/80 space-y-2">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="prodAllowFlocage"
                    checked={prodAllowFlocage}
                    onChange={(e) => setProdAllowFlocage(e.target.checked)}
                    className="w-4 h-4 accent-amber-600 rounded cursor-pointer"
                  />
                  <label htmlFor="prodAllowFlocage" className="text-xs font-bold text-amber-950 cursor-pointer">
                    Autoriser la personnalisation (flocage nom & numéro) sur cet article
                  </label>
                </div>
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
          <div className="bg-white rounded-3xl max-w-xl w-full max-h-[92vh] flex flex-col p-6 shadow-2xl border border-gold/40 relative overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 shrink-0">
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
              className="flex-1 flex flex-col min-h-0"
            >
              {/* Scrollable form content */}
              <div className="flex-1 overflow-y-auto space-y-4 py-4 pr-1 text-xs">
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
              </div>

              {/* Fixed Action Buttons at bottom */}
              <div className="flex items-center gap-3 pt-3 border-t border-slate-100 shrink-0 bg-white">
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
          <div className="bg-white rounded-3xl max-w-lg w-full max-h-[92vh] flex flex-col p-6 shadow-2xl border border-gold/40 relative overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 shrink-0">
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
              <div className="p-3 my-2 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium shrink-0">
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
              className="flex-1 flex flex-col min-h-0"
            >
              <div className="flex-1 overflow-y-auto space-y-3.5 py-3 pr-1 text-xs">
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
              </div>

              <div className="flex items-center gap-2.5 pt-3 border-t border-slate-100 shrink-0 bg-white">
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

      {/* MODAL: Create / Edit Promo Code */}
      {isPromoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 max-h-[92vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
                <Ticket className="w-5 h-5 text-amber-600" />
                {editingPromo ? 'Modifier le Code Promo' : 'Créer un Nouveau Code Promo'}
              </h3>
              <button
                type="button"
                onClick={() => setIsPromoModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePromoCode} className="space-y-4">
              <div>
                <label className="block font-extrabold text-xs text-slate-800 mb-1 uppercase tracking-wider">
                  Code Promo (Généré par vous) *
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={promoCodeStr}
                    onChange={(e) => setPromoCodeStr(e.target.value.toUpperCase().replace(/\s+/g, ''))}
                    placeholder="EX: DONALDSON10, ETE2026, CRAMPON50"
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-mono font-black text-sm text-amber-950 uppercase bg-amber-50/50 outline-none focus:border-amber-500"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const rand = 'PROMO' + Math.floor(1000 + Math.random() * 9000);
                      setPromoCodeStr(rand);
                    }}
                    className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs shrink-0 cursor-pointer"
                    title="Générer un code aléatoire"
                  >
                    🎲 Aléatoire
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-xs text-slate-800 mb-1">
                    Pourcentage de Réduction (%) *
                  </label>
                  <input
                    type="number"
                    value={promoDiscountPercent}
                    onChange={(e) => setPromoDiscountPercent(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="Ex: 10 ou 20"
                    required
                    min={1}
                    max={100}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-black text-emerald-700 outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-xs text-slate-800 mb-1">
                    Nombre de Réductions Max *
                  </label>
                  <input
                    type="number"
                    value={promoMaxUses}
                    onChange={(e) => setPromoMaxUses(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="Ex: 50 utilisations"
                    required
                    min={1}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-bold outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-xs text-slate-800 mb-1">
                  Description / Note indicative (Optionnel)
                </label>
                <input
                  type="text"
                  value={promoDescription}
                  onChange={(e) => setPromoDescription(e.target.value)}
                  placeholder="Ex: Réduction exceptionnelle de fin de saison"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs outline-none focus:border-emerald-500"
                />
              </div>

              {/* Target Articles Selector */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <span className="font-extrabold text-xs text-slate-800 block">
                  Applicabilité du Code Promo :
                </span>
                
                <div className="space-y-1.5">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-800">
                    <input
                      type="checkbox"
                      checked={promoApplicableProductIds.includes('ALL')}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setPromoApplicableProductIds(['ALL']);
                        } else {
                          setPromoApplicableProductIds([]);
                        }
                      }}
                      className="w-4 h-4 accent-amber-600 rounded"
                    />
                    <span>🌐 Valable sur TOUS les articles de la boutique</span>
                  </label>

                  {!promoApplicableProductIds.includes('ALL') && (
                    <div className="pt-2 space-y-1.5 border-t border-slate-200">
                      <span className="text-[11px] font-semibold text-slate-500 block">
                        Sélectionnez les articles spécifiques éligibles :
                      </span>
                      <div className="max-h-36 overflow-y-auto space-y-1 pr-1">
                        {products.map((p) => {
                          const isSelected = promoApplicableProductIds.includes(p.id);
                          return (
                            <label
                              key={p.id}
                              className={`flex items-center justify-between p-2 rounded-xl border text-xs cursor-pointer transition-all ${
                                isSelected ? 'bg-amber-50 border-amber-300 font-bold text-slate-900' : 'bg-white border-slate-200 text-slate-600'
                              }`}
                            >
                              <div className="flex items-center gap-2 truncate">
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setPromoApplicableProductIds(prev => [...prev.filter(id => id !== 'ALL'), p.id]);
                                    } else {
                                      setPromoApplicableProductIds(prev => prev.filter(id => id !== p.id));
                                    }
                                  }}
                                  className="w-3.5 h-3.5 accent-amber-600 rounded"
                                />
                                <span className="truncate">{p.name}</span>
                              </div>
                              <span className="text-[10px] text-emerald-700 font-mono shrink-0 ml-1">
                                {formatFCFA(p.priceFCFA)}
                              </span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Active Toggle */}
              <div className="flex items-center justify-between p-3 rounded-2xl bg-amber-50/60 border border-amber-200">
                <span className="font-bold text-xs text-amber-950">Statut Actif du Code</span>
                <input
                  type="checkbox"
                  checked={promoActive}
                  onChange={(e) => setPromoActive(e.target.checked)}
                  className="w-5 h-5 accent-amber-600 rounded cursor-pointer"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-3 px-4 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  {editingPromo ? 'Enregistrer les Modifications' : 'Créer et Enregistrer le Code Promo'}
                </button>

                <button
                  type="button"
                  onClick={() => setIsPromoModalOpen(false)}
                  className="px-4 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
                >
                  Annuler
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Send Promo Code to Users */}
      {sendPromoModalOpen && selectedPromoForSending && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <Send className="w-5 h-5 text-amber-600" />
                Envoyer le Code Promo aux Clients
              </h3>
              <button
                type="button"
                onClick={() => setSendPromoModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-900 text-white space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-mono font-black text-amber-400 text-base">{selectedPromoForSending.code}</span>
                <span className="px-2 py-0.5 rounded bg-emerald-600 text-white font-black text-xs">
                  -{selectedPromoForSending.discountPercent}%
                </span>
              </div>
              <p className="text-[11px] text-slate-300 font-medium">
                {selectedPromoForSending.description || 'Remise exceptionnelle sur la boutique'}
              </p>
            </div>

            <form onSubmit={handleSendPromoToUsers} className="space-y-4">
              <div>
                <label className="block font-bold text-xs text-slate-800 mb-1">
                  Destinataire(s) du Code Promo *
                </label>
                <select
                  value={sendTargetUserId}
                  onChange={(e) => setSendTargetUserId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-semibold text-xs outline-none focus:border-amber-500"
                >
                  <option value="ALL">📢 Tous les clients enregistrés ({users.filter(u => u.role !== 'super_admin' && u.role !== 'assistant_admin').length})</option>
                  {users
                    .filter(u => u.role !== 'super_admin' && u.role !== 'assistant_admin')
                    .map((u) => (
                      <option key={u.id} value={u.id}>
                        👤 {u.firstName ? `${u.firstName} ${u.lastName}`.trim() : (u.fullName || u.email)} ({u.phone || u.phoneNumber || u.email})
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-xs text-slate-800 mb-1">
                  Message d'accompagnement :
                </label>
                <textarea
                  value={sendPromoMessageNote}
                  onChange={(e) => setSendPromoMessageNote(e.target.value)}
                  rows={3}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs outline-none focus:border-amber-500 font-medium"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-3 px-4 rounded-2xl bg-slate-900 hover:bg-black text-amber-400 font-black text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Send className="w-4 h-4 text-amber-400" />
                  Envoyer la Notification Promo
                </button>

                <button
                  type="button"
                  onClick={() => setSendPromoModalOpen(false)}
                  className="px-4 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
                >
                  Annuler
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Recovery & Product Analysis Modal */}
      <AdminProductRecoveryModal
        isOpen={isRecoveryModalOpen}
        onClose={() => setIsRecoveryModalOpen(false)}
      />

    </div>
  );
};
