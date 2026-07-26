import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { User as UserIcon, Camera, Save, CheckCircle, PackageCheck, Shield, Phone, Mail, LogOut, ArrowRight } from 'lucide-react';

export const AccountPage: React.FC = () => {
  const { currentUser, updateUserProfile, logoutUser, setActivePage, orders } = useApp();

  const [firstName, setFirstName] = useState(currentUser?.firstName || '');
  const [lastName, setLastName] = useState(currentUser?.lastName || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [avatarUrl, setAvatarUrl] = useState(currentUser?.avatarUrl || '');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!currentUser) {
    return (
      <div className="max-w-md mx-auto py-16 px-4 text-center animate-fadeIn">
        <div className="bg-white p-8 rounded-3xl border border-stone-200 shadow-xl space-y-6">
          <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-900 border border-amber-300 mx-auto flex items-center justify-center">
            <UserIcon className="w-8 h-8 text-gold-dark" />
          </div>
          <h2 className="text-2xl font-serif-title font-bold text-ink">Espace Compte Client</h2>
          <p className="text-xs text-stone-600 font-light">
            Veuillez vous connecter ou vous inscrire pour accéder à la gestion de vos informations personnelles et de votre photo de profil.
          </p>
          <div className="flex flex-col gap-3">
            <button
              onClick={() => setActivePage('login')}
              className="w-full py-3 rounded-xl bg-ink text-gold border border-gold/40 font-bold text-xs hover:bg-stone-900 transition-all shadow-md"
            >
              Se Connecter
            </button>
            <button
              onClick={() => setActivePage('register')}
              className="w-full py-3 rounded-xl bg-stone-100 text-stone-800 border border-stone-200 font-bold text-xs hover:bg-stone-200 transition-all"
            >
              Créer un Compte
            </button>
          </div>
        </div>
      </div>
    );
  }

  const userOrders = orders.filter(o => 
    o.userId === currentUser.id || 
    (currentUser.email && o.clientEmail.toLowerCase() === currentUser.email.toLowerCase())
  );

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrorMsg('La taille de la photo ne doit pas dépasser 5 Mo.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setAvatarUrl(reader.result);
          setErrorMsg('');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!firstName.trim() || !lastName.trim()) {
      setErrorMsg('Le prénom et le nom sont obligatoires.');
      return;
    }
    if (!phone.trim()) {
      setErrorMsg('Le numéro de téléphone est obligatoire.');
      return;
    }
    if (!email.trim()) {
      setErrorMsg('L\'adresse email est obligatoire.');
      return;
    }

    updateUserProfile({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      phone: phone.trim(),
      email: email.trim().toLowerCase(),
      avatarUrl
    });

    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3500);
  };

  return (
    <div className="max-w-4xl mx-auto py-10 px-4 sm:px-6 space-y-8 animate-fadeIn">
      {/* Header Banner */}
      <div className="bg-ink text-gold p-6 sm:p-8 rounded-3xl border border-gold/30 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          {/* Avatar / Photo preview */}
          <div className="relative group shrink-0">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden border-2 border-gold/60 bg-stone-800 flex items-center justify-center shadow-lg">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={`${firstName} ${lastName}`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="font-serif-title font-black text-3xl text-gold">
                  {firstName[0] || 'U'}{lastName[0] || ''}
                </span>
              )}
            </div>
            
            {/* Gallery Upload File Input Trigger */}
            <label className="absolute bottom-0 right-0 p-2 rounded-full bg-gold text-ink cursor-pointer hover:bg-amber-300 transition-transform shadow-md hover:scale-110">
              <Camera className="w-4 h-4" />
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </label>
          </div>

          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-gold/80 block">
              {currentUser.role === 'super_admin' ? 'Administrateur Principal' : currentUser.role === 'assistant_admin' ? 'Assistant Admin' : 'Compte Client DONALDSON'}
            </span>
            <h1 className="text-2xl sm:text-3xl font-serif-title font-bold text-white mt-1">
              {firstName} {lastName}
            </h1>
            <p className="text-xs text-stone-300 font-light mt-1 flex items-center gap-2">
              <Mail className="w-3.5 h-3.5 text-gold" /> {email}
            </p>
          </div>
        </div>

        <button
          onClick={logoutUser}
          className="px-4 py-2.5 rounded-xl bg-stone-800 hover:bg-rose-900/80 text-stone-200 hover:text-white border border-stone-700 font-bold text-xs transition-all flex items-center gap-2"
        >
          <LogOut className="w-4 h-4 text-rose-400" />
          Déconnexion
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Form Card */}
        <div className="md:col-span-2 bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-md space-y-6">
          <div className="border-b border-stone-100 pb-4 flex items-center justify-between">
            <h2 className="text-lg font-serif-title font-bold text-ink flex items-center gap-2">
              <UserIcon className="w-5 h-5 text-gold-dark" />
              Informations Personnelles
            </h2>
            <span className="text-xs text-stone-400 font-light">Modifiables à tout moment</span>
          </div>

          {saveSuccess && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-bold flex items-center gap-2 animate-fadeIn">
              <CheckCircle className="w-5 h-5 text-emerald-700 shrink-0" />
              Vos informations personnelles et votre photo de profil ont été mises à jour avec succès !
            </div>
          )}

          {errorMsg && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-300 text-rose-900 text-xs font-bold">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
            
            {/* Gallery Upload Banner */}
            <div className="p-4 rounded-2xl bg-amber-50/70 border border-gold/30 flex items-center justify-between gap-4">
              <div className="space-y-0.5">
                <span className="font-bold text-ink block">Photo de Profil</span>
                <p className="text-[11px] text-stone-600 font-light">
                  Importez une photo depuis la galerie de votre téléphone ou ordinateur.
                </p>
              </div>
              
              <label className="px-3.5 py-2 rounded-xl bg-ink text-gold border border-gold/40 font-bold text-xs cursor-pointer hover:bg-stone-900 transition-all shrink-0 flex items-center gap-1.5 shadow-xs">
                <Camera className="w-4 h-4 text-gold" />
                Choisir une photo
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-stone-700 mb-1">Prénom *</label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 outline-none focus:border-gold font-semibold text-ink bg-stone-50/50"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Nom *</label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 outline-none focus:border-gold font-semibold text-ink bg-stone-50/50"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-stone-700 mb-1">Téléphone *</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 outline-none focus:border-gold font-semibold text-ink bg-stone-50/50"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Adresse Email *</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 outline-none focus:border-gold font-semibold text-ink bg-stone-50/50"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-stone-100 flex justify-end">
              <button
                type="submit"
                className="px-6 py-3 rounded-xl bg-ink text-gold border border-gold/40 font-bold text-xs hover:bg-stone-900 transition-all shadow-md flex items-center gap-2"
              >
                <Save className="w-4 h-4 text-gold" />
                Enregistrer les Modifications
              </button>
            </div>
          </form>
        </div>

        {/* Right Info Box */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-md space-y-4">
            <h3 className="font-serif-title font-bold text-ink text-base flex items-center gap-2 border-b border-stone-100 pb-2">
              <PackageCheck className="w-5 h-5 text-gold-dark" />
              Mes Commandes ({userOrders.length})
            </h3>
            <p className="text-xs text-stone-600 leading-relaxed font-light">
              Suivez l'état de validation et la livraison de vos articles commandés sur le site web.
            </p>

            <button
              onClick={() => setActivePage('orders')}
              className="w-full py-2.5 px-4 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-xs transition-all flex items-center justify-between"
            >
              <span>Voir mes commandes</span>
              <ArrowRight className="w-4 h-4 text-gold-dark" />
            </button>
          </div>

          <div className="p-5 rounded-3xl bg-amber-50/80 border border-gold/40 space-y-2 text-xs">
            <span className="font-bold text-ink block flex items-center gap-2">
              <Shield className="w-4 h-4 text-gold-dark" />
              Espace Client Privilège
            </span>
            <p className="text-stone-700 leading-relaxed font-light">
              Modifiez vos informations personnelles, suivez votre historique de commandes et personnalisez votre photo de profil en toute simplicité.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};
