import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import logoImg from '../assets/images/donaldson_shop_logo_1786794643658.jpg';
import { User, Lock, Mail, Phone, UserCheck, ShieldCheck, ArrowRight, KeyRound, AlertCircle } from 'lucide-react';
import { SUPER_ADMIN_EMAIL, SUPER_ADMIN_PASS } from '../data/initialData';

interface AuthPagesProps {
  initialMode?: 'login' | 'register';
}

export const AuthPages: React.FC<AuthPagesProps> = ({ initialMode = 'login' }) => {
  const { registerUser, loginUser, setActivePage } = useApp();

  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Form states
  const [lastName, setLastName] = useState('');
  const [firstName, setFirstName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleQuickFillAdmin = () => {
    setEmail(SUPER_ADMIN_EMAIL);
    setPassword(SUPER_ADMIN_PASS);
    setMode('login');
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!lastName || !firstName || !phone || !email || !password) {
      setErrorMsg('Veuillez remplir tous les champs obligatoires.');
      return;
    }

    const result = registerUser({
      lastName,
      firstName,
      phone,
      email,
      password
    });

    if (!result.success) {
      setErrorMsg(result.message);
    } else {
      setSuccessMsg(result.message);
      setTimeout(() => {
        const isAdminUser = result.user?.role === 'super_admin' || result.user?.role === 'assistant_admin' || result.user?.email === SUPER_ADMIN_EMAIL;
        if (isAdminUser) {
          setActivePage('admin');
        } else {
          setActivePage('shop');
        }
      }, 1000);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!email || !password) {
      setErrorMsg('Veuillez remplir votre email et votre mot de passe.');
      return;
    }

    const result = loginUser(email, password);

    if (!result.success) {
      setErrorMsg(result.message);
    } else {
      setSuccessMsg(result.message);
      setTimeout(() => {
        const isAdminUser = result.user?.role === 'super_admin' || result.user?.role === 'assistant_admin' || result.user?.email === SUPER_ADMIN_EMAIL;
        if (isAdminUser) {
          setActivePage('admin');
        } else {
          setActivePage('shop');
        }
      }, 1000);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-paper">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-stone-200 overflow-hidden">
        
        {/* Header banner - Ink & Gold Editorial Theme */}
        <div className="bg-ink p-8 text-white text-center relative overflow-hidden border-b border-gold/30">
          <div className="relative z-10">
            <img
              src={logoImg}
              alt="DONALDSON SHOP Logo"
              referrerPolicy="no-referrer"
              className="h-14 w-auto object-contain mx-auto mb-3 rounded-2xl bg-white p-1 shadow-md border border-gold/40"
            />
            <h2 className="text-2xl font-serif-title font-bold tracking-tight text-white">DONALDSON <span className="text-gold italic font-editorial">SHOP</span></h2>
          </div>
        </div>

        {/* Mode Switcher */}
        <div className="flex border-b border-stone-200 bg-stone-100/60 p-1">
          <button
            onClick={() => { setMode('login'); setErrorMsg(null); setSuccessMsg(null); }}
            className={`flex-1 py-3 text-xs sm:text-sm font-extrabold rounded-full transition-all uppercase tracking-wider cursor-pointer ${
              mode === 'login'
                ? 'bg-stone-900 text-white shadow-md'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
            }`}
          >
            Se Connecter
          </button>
          <button
            onClick={() => { setMode('register'); setErrorMsg(null); setSuccessMsg(null); }}
            className={`flex-1 py-3 text-xs sm:text-sm font-extrabold rounded-full transition-all uppercase tracking-wider cursor-pointer ${
              mode === 'register'
                ? 'bg-stone-900 text-white shadow-md'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
            }`}
          >
            Créer un Compte
          </button>
        </div>

        <div className="p-6 sm:p-8">
          
          {/* Feedback alerts */}
          {errorMsg && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              {errorMsg}
            </div>
          )}

          {successMsg && (
            <div className="mb-4 p-3 rounded-xl bg-amber-50 border border-gold/40 text-stone-900 text-xs font-semibold flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-gold-dark shrink-0" />
              {successMsg}
            </div>
          )}

          {/* LOGIN FORM */}
          {mode === 'login' ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Adresse Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="exemple@domaine.com"
                    required
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-300 focus:border-gold focus:ring-2 focus:ring-amber-100 text-sm outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Mot de Passe
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-300 focus:border-gold focus:ring-2 focus:ring-amber-100 text-sm outline-none transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 px-6 rounded-full bg-stone-900 hover:bg-stone-800 text-white font-extrabold text-sm shadow-md transition-all flex items-center justify-center gap-2 mt-3 cursor-pointer active:scale-95"
              >
                <span>Connexion à mon compte</span>
                <ArrowRight className="w-4 h-4 text-white" />
              </button>
            </form>
          ) : (
            
            /* REGISTER FORM */
            <form onSubmit={handleRegister} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Nom (Nom de famille)
                  </label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Koffi"
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:border-gold focus:ring-2 focus:ring-amber-100 text-sm outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Prénom
                  </label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Emanuel"
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:border-gold focus:ring-2 focus:ring-amber-100 text-sm outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Numéro de Téléphone
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+228 90 00 00 00"
                    required
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-300 focus:border-gold focus:ring-2 focus:ring-amber-100 text-sm outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Adresse Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="votre.email@exemple.com"
                    required
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-300 focus:border-gold focus:ring-2 focus:ring-amber-100 text-sm outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Mot de Passe
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-300 focus:border-gold focus:ring-2 focus:ring-amber-100 text-sm outline-none transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 px-6 rounded-full bg-stone-900 hover:bg-stone-800 text-white font-extrabold text-sm shadow-md transition-all flex items-center justify-center gap-2 mt-3 cursor-pointer active:scale-95"
              >
                <span>Créer mon Compte Client</span>
                <ArrowRight className="w-4 h-4 text-white" />
              </button>
            </form>
          )}

        </div>
      </div>
    </div>
  );
};
