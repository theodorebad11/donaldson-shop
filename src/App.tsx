import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { FloatingWhatsApp } from './components/FloatingWhatsApp';
import { ShopCatalog } from './components/ShopCatalog';
import { ProductDetailModal } from './components/ProductDetailModal';
import { CartPage } from './components/CartPage';
import { AnnoncesPage } from './components/AnnoncesPage';
import { AidePage } from './components/AidePage';
import { OrdersPage } from './components/OrdersPage';
import { AuthPages } from './components/AuthPages';
import { AdminDashboard } from './components/AdminDashboard';
import { ChatBotModal } from './components/ChatBotModal';
import { AccountPage } from './components/AccountPage';

const AppContent: React.FC = () => {
  const { activePage } = useApp();

  const renderCurrentPage = () => {
    switch (activePage) {
      case 'shop':
        return <ShopCatalog />;
      case 'annonces':
        return <AnnoncesPage />;
      case 'aide':
        return <AidePage />;
      case 'cart':
        return <CartPage />;
      case 'orders':
        return <OrdersPage />;
      case 'account':
        return <AccountPage />;
      case 'login':
        return <AuthPages initialMode="login" />;
      case 'register':
        return <AuthPages initialMode="register" />;
      case 'admin':
        return <AdminDashboard />;
      case 'chat':
        return <ChatBotModal />;
      default:
        return <ShopCatalog />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col justify-between selection:bg-emerald-500 selection:text-white">
      <div>
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-20 md:pb-6">
          {renderCurrentPage()}
        </main>
      </div>

      <Footer />
      <FloatingWhatsApp />
      <ProductDetailModal />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
