import { User, Product, Announcement, DeliveryZone } from '../types';

export const SUPER_ADMIN_EMAIL = 'tace616@gmail.com';
export const SUPER_ADMIN_PASS = '@MOOVTogo5G@';

export const WHATSAPP_NUMBERS = [
  { display: '+228 90 79 54 16', raw: '22890795416' },
  { display: '+228 97 52 85 47', raw: '22897528547' },
  { display: '+228 98 14 09 53', raw: '22898140953' }
];

export const CONTACT_EMAILS = {
  yahoo: 'donaldsonshop@yahoo.com',
  admin: 'tace616@gmail.com'
};

export const INITIAL_ADMIN_USER: User = {
  id: 'usr_admin_001',
  lastName: 'DONALDSON',
  firstName: 'Admin Direct',
  phone: '+228 90 79 54 16',
  email: SUPER_ADMIN_EMAIL,
  password: SUPER_ADMIN_PASS,
  role: 'super_admin',
  registeredAt: '2026-01-01T08:00:00.000Z',
  lastLoginAt: new Date().toISOString(),
  status: 'active'
};

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod_101',
    name: 'Maillot Pro Match D-Elite Pro',
    priceFCFA: 22500,
    category: 'Maillots Pro',
    description: 'Maillot de sport respirant à technologie anti-transpiration avancée. Conçu pour les athlètes exigeants et les matchs officiels.',
    imageUrl: 'https://images.unsplash.com/photo-1511746315387-c4a76990fdce?auto=format&fit=crop&w=800&q=80',
    stock: 25,
    badge: 'PRO',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: ['Noir Élégan', 'Bleu Roi', 'Blanc Pur'],
    featured: true
  },
  {
    id: 'prod_102',
    name: 'Crampons de Football Hyper-Speed Pro',
    priceFCFA: 48000,
    category: 'Chaussures & Crampons',
    description: 'Chaussures de football professionnelles pour gazon synthétique et naturel. Adhérence maximale et légèreté ultra-précise.',
    imageUrl: 'https://images.unsplash.com/photo-1511556532299-8f662fc26c06?auto=format&fit=crop&w=800&q=80',
    stock: 18,
    badge: 'TOP VENTE',
    sizes: ['39', '40', '41', '42', '43', '44', '45'],
    colors: ['Orange Néon / Noir', 'Jaune Pro'],
    featured: true
  },
  {
    id: 'prod_103',
    name: 'Ballon de Football Match Officiel FIFA Standard',
    priceFCFA: 28000,
    category: 'Accessoires & Ballons',
    description: 'Ballon de compétition thermocollé avec vol stabilisé et rétention de pression supérieure. Homologué pour les grands tournois.',
    imageUrl: 'https://images.unsplash.com/photo-1614632537197-38a17061c2bd?auto=format&fit=crop&w=800&q=80',
    stock: 40,
    badge: 'NOUVEAU',
    sizes: ['Taille 5'],
    featured: true
  },
  {
    id: 'prod_104',
    name: 'Ensemble de Compression Gym & Fitness Premium',
    priceFCFA: 32000,
    category: 'Fitness & Musculation',
    description: 'Tenue complète 3 pièces (T-shirt, Legging de maintien et Short) conçue pour la haute performance physique.',
    imageUrl: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=800&q=80',
    stock: 15,
    badge: 'PROMO',
    sizes: ['M', 'L', 'XL'],
    featured: false
  },
  {
    id: 'prod_105',
    name: 'Gants de Boxe Professionnels Leather Elite 14oz',
    priceFCFA: 35000,
    category: 'Sports de Combat',
    description: 'Gants de boxe en cuir véritable haute densité avec protection des poignets renforcée et absorption de choc.',
    imageUrl: 'https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?auto=format&fit=crop&w=800&q=80',
    stock: 12,
    badge: 'PRO',
    sizes: ['12 oz', '14 oz', '16 oz'],
    featured: false
  },
  {
    id: 'prod_106',
    name: 'Baskets Running Performance Donaldson Zoom Air',
    priceFCFA: 42000,
    category: 'Chaussures & Crampons',
    description: 'Semelle à amorti réactif pour les courses de longue distance, marathon et entraînement quotidien intensif.',
    imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80',
    stock: 20,
    badge: 'TOP VENTE',
    sizes: ['40', '41', '42', '43', '44'],
    featured: true
  }
];

export const INITIAL_ANNOUNCEMENTS: Announcement[] = [
  {
    id: 'ann_01',
    title: '🔥 Arrivée du Nouveau Arrivage Élégan 2026',
    content: 'Découvrez la nouvelle collection de crampons ultra-légers et équipements pro disponibles en boutique. Livraison sur mesure partout au Togo et sous-région !',
    imageUrl: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=1200&q=80',
    badge: 'EXCLUSIVITÉ',
    date: '2026-07-25',
    active: true
  },
  {
    id: 'ann_02',
    title: '🚚 Information Importante sur les Frais de Livraison',
    content: 'Chers clients, les tarifs de livraison dépendent spécifiquement de votre quartier à Lomé ou de votre ville à l\'intérieur du Togo. Contactez-nous direct sur WhatsApp pour recevoir votre estimation exacte avant ou après votre commande.',
    imageUrl: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1200&q=80',
    badge: 'LIVRAISON',
    date: '2026-07-20',
    active: true
  }
];

export const INITIAL_DELIVERY_ZONES: DeliveryZone[] = [
  {
    id: 'zone_01',
    cityOrArea: 'Lomé Centre (Grand Marché, Nyékonakpoé, Kodjoviakopé)',
    estimatedFeeFCFANotice: 'À partir de 1 000 F (à confirmer par WhatsApp)',
    estimatedTime: 'Livraison express en 2h à 4h'
  },
  {
    id: 'zone_02',
    cityOrArea: 'Lomé Périphérie (Agoè, Adidogomé, Bè-Kpota, Tokoin)',
    estimatedFeeFCFANotice: 'À partir de 1 500 F (à confirmer par WhatsApp)',
    estimatedTime: 'Même jour (3h à 6h)'
  },
  {
    id: 'zone_03',
    cityOrArea: 'Villes Maritimes & Plateaux (Tsévié, Aného, Kpalimé, Atakpamé)',
    estimatedFeeFCFANotice: 'Expédition sur devis direct par bus/taxi de livraison',
    estimatedTime: '24h à 48h'
  },
  {
    id: 'zone_04',
    cityOrArea: 'Régions Centrale, Kara & Savanes (Sokodé, Kara, Dapaong)',
    estimatedFeeFCFANotice: 'Expédition par agence de voyage / coursier partenaire',
    estimatedTime: '24h à 72h'
  }
];

export function formatFCFA(amount: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'decimal',
    maximumFractionDigits: 0
  }).format(amount) + ' F';
}
