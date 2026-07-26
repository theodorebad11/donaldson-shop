import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  User,
  Product,
  CartItem,
  Order,
  Announcement,
  NotificationItem,
  ChatMessage,
  OrderDeliveryStatus,
  AssistantRolePermission
} from '../types';
import {
  INITIAL_ADMIN_USER,
  INITIAL_PRODUCTS,
  INITIAL_ANNOUNCEMENTS,
  SUPER_ADMIN_EMAIL,
  SUPER_ADMIN_PASS
} from '../data/initialData';

interface AppContextType {
  currentUser: User | null;
  users: User[];
  products: Product[];
  categories: string[];
  cart: CartItem[];
  orders: Order[];
  announcements: Announcement[];
  notifications: NotificationItem[];
  chatMessages: ChatMessage[];
  activePage: string;
  selectedProduct: Product | null;
  
  // Navigation & Page setter
  setActivePage: (page: string) => void;
  setSelectedProduct: (product: Product | null) => void;
  
  // Auth & Profile methods
  registerUser: (data: { lastName: string; firstName: string; phone: string; email: string; password: string }) => { success: boolean; message: string; user?: User };
  loginUser: (email: string, pass: string) => { success: boolean; message: string; user?: User };
  logoutUser: () => void;
  updateUserProfile: (data: { firstName?: string; lastName?: string; phone?: string; email?: string; avatarUrl?: string }) => void;
  
  // Admin User & Role methods
  updateUserRole: (userId: string, role: 'super_admin' | 'assistant_admin' | 'client', assistantRoles?: AssistantRolePermission[]) => void;
  deleteUser: (userId: string) => void;
  
  // Product methods
  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (product: Product) => void;
  deleteProduct: (id: string) => void;
  addCategory: (categoryName: string) => void;
  deleteCategory: (categoryName: string) => void;
  
  // Cart methods
  addToCart: (product: Product, quantity?: number, selectedSize?: string, selectedColor?: string) => void;
  removeFromCart: (productId: string, selectedSize?: string) => void;
  updateCartQuantity: (productId: string, quantity: number, selectedSize?: string) => void;
  clearCart: () => void;
  
  // Order methods
  createOrder: (data: {
    clientName: string;
    clientPhone: string;
    clientEmail: string;
    wantsDelivery: boolean;
    deliveryAddress?: string;
    deliveryCity?: string;
    pickupConfirmed?: boolean;
    deliveryNotes?: string;
    orderType: 'site_direct' | 'whatsapp';
    items?: OrderItem[];
  }) => Order;
  updateOrderStatus: (orderId: string, status: OrderDeliveryStatus) => void;
  deleteOrder: (orderId: string) => void;
  
  // Announcement methods
  addAnnouncement: (announcement: Omit<Announcement, 'id' | 'date'>) => void;
  updateAnnouncement: (announcement: Announcement) => void;
  deleteAnnouncement: (id: string) => void;
  
  // Notification methods
  sendNotification: (notification: Omit<NotificationItem, 'id' | 'createdAt' | 'readBy'>) => void;
  markNotificationAsRead: (notificationId: string) => void;
  
  // Chatbot & Support methods
  sendChatMessage: (text: string) => Promise<void>;
  sendAdminChatMessage: (text: string, targetUserId?: string) => void;
  clearChatHistory: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load state from localStorage with fallbacks
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('donaldson_users');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Ensure super admin exists
        if (!parsed.find((u: User) => u.email === SUPER_ADMIN_EMAIL)) {
          return [INITIAL_ADMIN_USER, ...parsed];
        }
        return parsed;
      } catch (e) {
        console.error("Error parsing users state:", e);
      }
    }
    return [INITIAL_ADMIN_USER];
  });

  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('donaldson_current_user');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { }
    }
    return null;
  });

  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('donaldson_products');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { }
    }
    return INITIAL_PRODUCTS;
  });

  const [categories, setCategories] = useState<string[]>(() => {
    const saved = localStorage.getItem('donaldson_categories');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { }
    }
    return ['Maillots Pro', 'Chaussures & Crampons', 'Accessoires & Ballons', 'Fitness & Musculation', 'Sports de Combat'];
  });

  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('donaldson_cart');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { }
    }
    return [];
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('donaldson_orders');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { }
    }
    return [];
  });

  const [announcements, setAnnouncements] = useState<Announcement[]>(() => {
    const saved = localStorage.getItem('donaldson_announcements');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { }
    }
    return INITIAL_ANNOUNCEMENTS;
  });

  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    const saved = localStorage.getItem('donaldson_notifications');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { }
    }
    return [
      {
        id: 'notif_welcome',
        targetUserId: 'ALL',
        title: 'Bienvenue sur DONALDSON SHOP !',
        message: 'Découvrez nos maillots et équipements de sport pro. Pour tout devis de livraison, contactez notre équipe sur WhatsApp.',
        createdAt: new Date().toISOString(),
        readBy: []
      }
    ];
  });

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(() => {
    const saved = localStorage.getItem('donaldson_chat');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { }
    }
    return [
      {
        id: 'msg_welcome',
        sender: 'assistant',
        text: 'Bonjour ! Bienvenue chez DONALDSON SHOP. Je suis votre assistant sportif IA. Comment puis-je vous aider aujourd\'hui ?',
        timestamp: new Date().toISOString()
      }
    ];
  });

  const [activePage, setActivePage] = useState<string>('shop');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Sync state to localStorage safely across all browsers & private modes
  useEffect(() => { try { localStorage.setItem('donaldson_users', JSON.stringify(users)); } catch (e) {} }, [users]);
  useEffect(() => {
    try {
      if (currentUser) {
        localStorage.setItem('donaldson_current_user', JSON.stringify(currentUser));
      } else {
        localStorage.removeItem('donaldson_current_user');
      }
    } catch (e) {}
  }, [currentUser]);
  useEffect(() => { try { localStorage.setItem('donaldson_products', JSON.stringify(products)); } catch (e) {} }, [products]);
  useEffect(() => { try { localStorage.setItem('donaldson_categories', JSON.stringify(categories)); } catch (e) {} }, [categories]);
  useEffect(() => { try { localStorage.setItem('donaldson_cart', JSON.stringify(cart)); } catch (e) {} }, [cart]);
  useEffect(() => { try { localStorage.setItem('donaldson_orders', JSON.stringify(orders)); } catch (e) {} }, [orders]);
  useEffect(() => { try { localStorage.setItem('donaldson_announcements', JSON.stringify(announcements)); } catch (e) {} }, [announcements]);
  useEffect(() => { try { localStorage.setItem('donaldson_notifications', JSON.stringify(notifications)); } catch (e) {} }, [notifications]);
  useEffect(() => { try { localStorage.setItem('donaldson_chat', JSON.stringify(chatMessages)); } catch (e) {} }, [chatMessages]);

  // Active user online status heartbeat
  useEffect(() => {
    if (!currentUser) return;

    const updateHeartbeat = () => {
      const now = new Date().toISOString();
      setCurrentUser(prev => prev ? { ...prev, lastActiveAt: now } : null);
      setUsers(prev => prev.map(u => u.id === currentUser.id ? { ...u, lastActiveAt: now } : u));
    };

    // Update active timestamp immediately and every 15s
    updateHeartbeat();
    const interval = setInterval(updateHeartbeat, 15000);
    return () => clearInterval(interval);
  }, [currentUser?.id]);

  // Auth Functions
  const registerUser = (data: { lastName: string; firstName: string; phone: string; email: string; password: string }) => {
    const cleanEmail = data.email.trim().toLowerCase();
    const cleanPhone = data.phone.trim().replace(/[\s\-\+\(\)]/g, '');
    
    // Check if user already exists by email
    const existingEmail = users.find(u => u.email.trim().toLowerCase() === cleanEmail);
    if (existingEmail) {
      return { success: false, message: 'Un compte existe déjà avec cette adresse email.' };
    }

    // Check if user already exists by phone number
    const existingPhone = users.find(u => {
      const uPhoneClean = (u.phone || '').trim().replace(/[\s\-\+\(\)]/g, '');
      return uPhoneClean && cleanPhone && uPhoneClean === cleanPhone;
    });
    if (existingPhone) {
      return { success: false, message: 'Un compte existe déjà avec ce numéro de téléphone.' };
    }

    const isSuperAdmin = cleanEmail === SUPER_ADMIN_EMAIL.toLowerCase();

    const nowStr = new Date().toISOString();
    const newUser: User = {
      id: 'usr_' + Date.now(),
      lastName: data.lastName.trim(),
      firstName: data.firstName.trim(),
      phone: data.phone.trim(),
      email: cleanEmail,
      password: data.password,
      role: isSuperAdmin ? 'super_admin' : 'client',
      registeredAt: nowStr,
      lastLoginAt: nowStr,
      lastActiveAt: nowStr,
      status: 'active'
    };

    setUsers(prev => [newUser, ...prev]);
    setCurrentUser(newUser);

    return { success: true, message: `Bienvenue chez DONALDSON SHOP ! Votre compte a été créé avec succès.`, user: newUser };
  };

  const loginUser = (email: string, pass: string) => {
    const cleanEmail = email.trim().toLowerCase();
    const nowStr = new Date().toISOString();
    
    // Check super admin override credentials
    if (cleanEmail === SUPER_ADMIN_EMAIL.toLowerCase() && pass === SUPER_ADMIN_PASS) {
      let adminUser = users.find(u => u.email.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase());
      if (!adminUser) {
        adminUser = { ...INITIAL_ADMIN_USER, lastLoginAt: nowStr, lastActiveAt: nowStr };
        setUsers(prev => [adminUser!, ...prev]);
      } else {
        adminUser = { ...adminUser, lastLoginAt: nowStr, lastActiveAt: nowStr, role: 'super_admin' };
        setUsers(prev => prev.map(u => u.id === adminUser!.id ? adminUser! : u));
      }
      setCurrentUser(adminUser);
      return { success: true, message: `Bienvenue dans votre espace d'administration DONALDSON SHOP !`, user: adminUser };
    }

    const found = users.find(u => u.email.toLowerCase() === cleanEmail);
    if (!found) {
      return { success: false, message: 'Aucun compte trouvé avec cet email.' };
    }

    if (found.password !== pass) {
      return { success: false, message: 'Mot de passe incorrect.' };
    }

    if (found.status === 'suspended') {
      return { success: false, message: 'Ce compte a été suspendu par un administrateur.' };
    }

    const updatedUser = { ...found, lastLoginAt: nowStr, lastActiveAt: nowStr };
    setUsers(prev => prev.map(u => u.id === found.id ? updatedUser : u));
    setCurrentUser(updatedUser);

    return { success: true, message: `Bienvenue chez DONALDSON SHOP ! Connexion réussie.`, user: updatedUser };
  };

  const logoutUser = () => {
    setCurrentUser(null);
    setActivePage('shop');
  };

  const updateUserProfile = (data: { firstName?: string; lastName?: string; phone?: string; email?: string; avatarUrl?: string }) => {
    if (!currentUser) return;
    const updatedUser: User = {
      ...currentUser,
      firstName: data.firstName !== undefined ? data.firstName.trim() : currentUser.firstName,
      lastName: data.lastName !== undefined ? data.lastName.trim() : currentUser.lastName,
      phone: data.phone !== undefined ? data.phone.trim() : currentUser.phone,
      email: data.email !== undefined ? data.email.trim().toLowerCase() : currentUser.email,
      avatarUrl: data.avatarUrl !== undefined ? data.avatarUrl : currentUser.avatarUrl
    };
    setCurrentUser(updatedUser);
    setUsers(prev => prev.map(u => u.id === currentUser.id ? updatedUser : u));
  };

  // User role management by Admin
  const updateUserRole = (userId: string, role: 'super_admin' | 'assistant_admin' | 'client', assistantRoles?: AssistantRolePermission[]) => {
    setUsers(prev => prev.map(u => {
      if (u.id === userId) {
        return {
          ...u,
          role,
          assistantRoles: role === 'assistant_admin' ? (assistantRoles || ['products', 'orders']) : undefined
        };
      }
      return u;
    }));
    // If current logged-in user got updated
    if (currentUser?.id === userId) {
      setCurrentUser(prev => prev ? {
        ...prev,
        role,
        assistantRoles: role === 'assistant_admin' ? (assistantRoles || ['products', 'orders']) : undefined
      } : null);
    }
  };

  const deleteUser = (userId: string) => {
    setUsers(prev => prev.filter(u => u.id !== userId));
  };

  // Products & Categories
  const addProduct = (prodData: Omit<Product, 'id'>) => {
    const newProd: Product = {
      ...prodData,
      id: 'prod_' + Date.now()
    };
    setProducts(prev => [newProd, ...prev]);
  };

  const updateProduct = (updated: Product) => {
    setProducts(prev => prev.map(p => p.id === updated.id ? updated : p));
  };

  const deleteProduct = (id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
    setCart(prev => prev.filter(c => c.product.id !== id));
  };

  const addCategory = (catName: string) => {
    const trimmed = catName.trim();
    if (trimmed && !categories.includes(trimmed)) {
      setCategories(prev => [...prev, trimmed]);
    }
  };

  const deleteCategory = (catName: string) => {
    setCategories(prev => prev.filter(c => c !== catName));
  };

  // Cart
  const addToCart = (product: Product, quantity = 1, selectedSize?: string, selectedColor?: string) => {
    setCart(prev => {
      const existingIndex = prev.findIndex(item => item.product.id === product.id && item.selectedSize === selectedSize);
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].quantity += quantity;
        return updated;
      } else {
        return [...prev, { product, quantity, selectedSize: selectedSize || product.sizes?.[0], selectedColor: selectedColor || product.colors?.[0] }];
      }
    });
  };

  const removeFromCart = (productId: string, selectedSize?: string) => {
    setCart(prev => prev.filter(item => !(item.product.id === productId && item.selectedSize === selectedSize)));
  };

  const updateCartQuantity = (productId: string, quantity: number, selectedSize?: string) => {
    if (quantity <= 0) {
      removeFromCart(productId, selectedSize);
      return;
    }
    setCart(prev => prev.map(item => {
      if (item.product.id === productId && item.selectedSize === selectedSize) {
        return { ...item, quantity };
      }
      return item;
    }));
  };

  const clearCart = () => setCart([]);

  // Orders
  const createOrder = (data: {
    clientName: string;
    clientPhone: string;
    clientEmail: string;
    wantsDelivery: boolean;
    deliveryAddress?: string;
    deliveryCity?: string;
    pickupConfirmed?: boolean;
    deliveryNotes?: string;
    orderType: 'site_direct' | 'whatsapp';
    items?: OrderItem[];
  }) => {
    const itemsToOrder: OrderItem[] = data.items || cart.map(item => ({
      productId: item.product.id,
      productName: item.product.name,
      priceFCFA: item.product.priceFCFA,
      quantity: item.quantity,
      imageUrl: item.product.imageUrl,
      selectedSize: item.selectedSize
    }));

    const orderTotal = itemsToOrder.reduce((sum, item) => sum + (item.priceFCFA * item.quantity), 0);

    const newOrder: Order = {
      id: 'CMD-' + Math.floor(100000 + Math.random() * 900000),
      userId: currentUser?.id || 'guest',
      clientName: data.clientName || (currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : 'Client Anonyme'),
      clientPhone: data.clientPhone || currentUser?.phone || 'Non renseigné',
      clientEmail: data.clientEmail || currentUser?.email || 'Non renseigné',
      items: itemsToOrder,
      totalFCFA: orderTotal,
      wantsDelivery: data.wantsDelivery,
      deliveryAddress: data.deliveryAddress || (data.wantsDelivery ? 'Lomé / Quartier non précisé' : undefined),
      deliveryCity: data.deliveryCity || (data.wantsDelivery ? 'Lomé' : undefined),
      pickupConfirmed: data.pickupConfirmed,
      deliveryNotes: data.deliveryNotes || '',
      deliveryFeeNotice: data.wantsDelivery 
        ? 'Tarif de livraison à déterminer sur mesure par WhatsApp ou auprès du service client' 
        : 'Retrait gratuit en magasin sur place',
      deliveryStatus: 'En attente',
      orderType: data.orderType,
      createdAt: new Date().toISOString()
    };

    // Deduct Stock for each ordered item
    setProducts(prevProducts => prevProducts.map(p => {
      const matched = itemsToOrder.find(it => it.productId === p.id);
      if (matched) {
        return {
          ...p,
          stock: Math.max(0, p.stock - matched.quantity)
        };
      }
      return p;
    }));

    setOrders(prev => [newOrder, ...prev]);

    // Clear cart if ordered from cart (no custom items array)
    if (!data.items) {
      clearCart();
    }

    // Auto-create notification for user on the site
    const orderNotif: NotificationItem = {
      id: 'notif_ord_' + Date.now(),
      targetUserId: currentUser?.id || 'ALL',
      title: `Commande #${newOrder.id} enregistrée`,
      message: `Votre commande de ${orderTotal.toLocaleString()} FCFA est bien enregistrée ("En attente de confirmation"). Vous recevrez une notification ici dès sa confirmation par l'administrateur.`,
      createdAt: new Date().toISOString(),
      readBy: []
    };
    setNotifications(prev => [orderNotif, ...prev]);

    return newOrder;
  };

  const updateOrderStatus = (orderId: string, status: OrderDeliveryStatus) => {
    setOrders(prev => prev.map(o => {
      if (o.id === orderId) {
        return { ...o, deliveryStatus: status };
      }
      return o;
    }));

    const targetOrder = orders.find(o => o.id === orderId);
    if (targetOrder && status === 'Confirmée') {
      const confirmNotif: NotificationItem = {
        id: 'notif_confirm_' + Date.now(),
        targetUserId: targetOrder.userId || 'ALL',
        title: `Commande #${targetOrder.id} CONFIRMÉE ! 🎉`,
        message: `Bonne nouvelle ${targetOrder.clientName} ! Votre commande #${targetOrder.id} (${targetOrder.totalFCFA.toLocaleString()} FCFA) a été CONFIRMÉE avec succès par l'administration DONALDSON SHOP.`,
        createdAt: new Date().toISOString(),
        readBy: []
      };
      setNotifications(prev => [confirmNotif, ...prev]);
    }
  };

  const deleteOrder = (orderId: string) => {
    setOrders(prev => prev.filter(o => o.id !== orderId));
  };

  // Announcements
  const addAnnouncement = (annData: Omit<Announcement, 'id' | 'date'>) => {
    const newAnn: Announcement = {
      ...annData,
      id: 'ann_' + Date.now(),
      date: new Date().toISOString().split('T')[0]
    };
    setAnnouncements(prev => [newAnn, ...prev]);
  };

  const updateAnnouncement = (updated: Announcement) => {
    setAnnouncements(prev => prev.map(a => a.id === updated.id ? updated : a));
  };

  const deleteAnnouncement = (id: string) => {
    setAnnouncements(prev => prev.filter(a => a.id !== id));
  };

  // Notifications
  const sendNotification = (notifData: Omit<NotificationItem, 'id' | 'createdAt' | 'readBy'>) => {
    const newNotif: NotificationItem = {
      ...notifData,
      id: 'notif_' + Date.now(),
      createdAt: new Date().toISOString(),
      readBy: []
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  const markNotificationAsRead = (notificationId: string) => {
    if (!currentUser) return;
    setNotifications(prev => prev.map(n => {
      if (n.id === notificationId && !n.readBy.includes(currentUser.id)) {
        return { ...n, readBy: [...n.readBy, currentUser.id] };
      }
      return n;
    }));
  };

  // Chatbot & Support logic
  const sendChatMessage = async (text: string) => {
    const userMsg: ChatMessage = {
      id: 'msg_' + Date.now(),
      sender: 'user',
      text,
      timestamp: new Date().toISOString(),
      userId: currentUser?.id || 'guest',
      userName: currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : 'Visiteur Anonyme',
      userPhone: currentUser?.phone || '',
      userEmail: currentUser?.email || ''
    };

    setChatMessages(prev => [...prev, userMsg]);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          history: chatMessages.slice(-6),
          userProfile: currentUser ? { firstName: currentUser.firstName, lastName: currentUser.lastName } : null,
          productsCount: products.length
        })
      });

      const data = await response.json();
      const botReply: ChatMessage = {
        id: 'msg_res_' + Date.now(),
        sender: 'assistant',
        text: data.reply || 'Bonjour ! Contactez notre service WhatsApp au +228 90 79 54 16 pour toute assistance rapide.',
        timestamp: new Date().toISOString()
      };
      setChatMessages(prev => [...prev, botReply]);
    } catch (e) {
      const fallbackReply: ChatMessage = {
        id: 'msg_res_err_' + Date.now(),
        sender: 'assistant',
        text: 'Pour toute information sur nos articles de sport et vos frais de livraison à Lomé et au Togo, contactez-nous sur WhatsApp au +228 90 79 54 16 !',
        timestamp: new Date().toISOString()
      };
      setChatMessages(prev => [...prev, fallbackReply]);
    }
  };

  const sendAdminChatMessage = (text: string, targetUserId?: string) => {
    const adminMsg: ChatMessage = {
      id: 'msg_admin_' + Date.now(),
      sender: 'admin',
      text,
      timestamp: new Date().toISOString(),
      userId: targetUserId || 'ALL',
      userName: 'Administration DONALDSON SHOP'
    };
    setChatMessages(prev => [...prev, adminMsg]);
  };

  const clearChatHistory = () => {
    setChatMessages([
      {
        id: 'msg_welcome',
        sender: 'assistant',
        text: 'Bonjour ! Bienvenue chez DONALDSON SHOP. Je suis votre assistant sportif IA. Comment puis-je vous aider aujourd\'hui ?',
        timestamp: new Date().toISOString()
      }
    ]);
  };

  return (
    <AppContext.Provider value={{
      currentUser,
      users,
      products,
      categories,
      cart,
      orders,
      announcements,
      notifications,
      chatMessages,
      activePage,
      selectedProduct,
      setActivePage,
      setSelectedProduct,
      registerUser,
      loginUser,
      logoutUser,
      updateUserProfile,
      updateUserRole,
      deleteUser,
      addProduct,
      updateProduct,
      deleteProduct,
      addCategory,
      deleteCategory,
      addToCart,
      removeFromCart,
      updateCartQuantity,
      clearCart,
      createOrder,
      updateOrderStatus,
      deleteOrder,
      addAnnouncement,
      updateAnnouncement,
      deleteAnnouncement,
      sendNotification,
      markNotificationAsRead,
      sendChatMessage,
      sendAdminChatMessage,
      clearChatHistory
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
