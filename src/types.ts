export type UserRole = 'super_admin' | 'assistant_admin' | 'client';

export type AssistantRolePermission = 'products' | 'orders' | 'users' | 'announcements' | 'chat';

export interface User {
  id: string;
  lastName: string;
  firstName: string;
  phone: string;
  email: string;
  password: string;
  avatarUrl?: string;
  role: UserRole;
  assistantRoles?: AssistantRolePermission[];
  registeredAt: string;
  lastLoginAt: string;
  lastActiveAt?: string;
  status: 'active' | 'suspended';
}

export interface Product {
  id: string;
  name: string;
  priceFCFA: number;
  originalPriceFCFA?: number;
  category: string;
  description?: string;
  imageUrl: string;
  stock: number;
  badge?: 'NOUVEAU' | 'PRO' | 'TOP VENTE' | 'PROMO' | string;
  sizes?: string[];
  colors?: string[];
  featured?: boolean;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedSize?: string;
  selectedColor?: string;
}

export type OrderDeliveryStatus = 'En attente' | 'Confirmée' | 'En cours de livraison' | 'Livrée' | 'Annulée';

export interface OrderItem {
  productId: string;
  productName: string;
  priceFCFA: number;
  quantity: number;
  imageUrl: string;
  selectedSize?: string;
}

export interface Order {
  id: string;
  userId: string;
  clientName: string;
  clientPhone: string;
  clientEmail: string;
  items: OrderItem[];
  totalFCFA: number;
  wantsDelivery: boolean;
  deliveryAddress?: string;
  deliveryCity?: string;
  pickupConfirmed?: boolean;
  deliveryNotes?: string;
  deliveryFeeNotice: string;
  deliveryStatus: OrderDeliveryStatus;
  orderType: 'site_direct' | 'whatsapp';
  createdAt: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  imageUrl?: string;
  badge?: string;
  date: string;
  active: boolean;
}

export interface NotificationItem {
  id: string;
  targetUserId?: string | 'ALL';
  title: string;
  message: string;
  createdAt: string;
  readBy: string[];
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant' | 'admin';
  text: string;
  timestamp: string;
  userId?: string;
  userName?: string;
  userPhone?: string;
  userEmail?: string;
}

export interface DeliveryZone {
  id: string;
  cityOrArea: string;
  estimatedFeeFCFANotice: string;
  estimatedTime: string;
}
