import React, { useState } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { Mail, Phone, MapPin, Shield, Camera, Save, X, Lock, CheckCircle2, Users, CreditCard } from 'lucide-react';
import { cn } from '@/utils';
import { useDataStore } from '@/store/useDataStore';
import { resolveSchoolProfile } from '@/utils/schoolProfile';
import { PrintableIdCardModal } from '@/components/ui/PrintableIdCardModal';

export default function Profile() {
  const { user, updateProfile } = useAuthStore();
  const { schools } = useDataStore();
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showIdCard, setShowIdCard] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || '',
  });

  if (!user) return null;

  const schoolProfile = resolveSchoolProfile(user, schools);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile(formData);
    setIsEditing(false);
  };

  const toggle2FA = () => {
    updateProfile({ isTwoFactorEnabled: !user.isTwoFactorEnabled });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden transition-all duration-300">
        <div className="h-32 bg-gradient-to-r from-blue-600 to-indigo-600 relative overflow-hidden">
          <div className="absolute inset-0 bg-white/10 backdrop-blur-3xl"></div>
          <div className="absolute -bottom-16 -right-16 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl"></div>
        </div>
        <div className="px-8 pb-8">
          <div className="relative -mt-12 flex items-end justify-between mb-6">
            <div className="relative group">
              <img 
                src={user.avatarUrl || `https://ui-avatars.com/api/?name=${user.name.replace(' ', '+')}&size=256&background=2563eb&color=fff&bold=true`} 
                alt={user.name} 
                className="w-28 h-28 rounded-2xl border-4 border-white dark:border-slate-900 shadow-xl object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <button className="absolute inset-0 flex items-center justify-center bg-black/40 text-white rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-300 backdrop-blur-sm">
                <Camera className="w-6 h-6" />
              </button>
            </div>
            
            {isEditing ? (
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setIsEditing(false)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                >
                  <X className="w-4 h-4" />
                  Cancel
                </button>
                <button 
                  onClick={handleSave}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl text-sm font-bold transition-all shadow-lg shadow-blue-900/20"
                >
                  <Save className="w-4 h-4" />
                  Save Changes
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowIdCard(true)}
                  className="flex items-center gap-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 px-4 py-2 rounded-xl text-sm font-bold transition-all hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  <CreditCard className="w-4 h-4" />
                  Print ID Card
                </button>
                <button 
                  onClick={() => setIsEditing(true)}
                  className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-6 py-2 rounded-xl text-sm font-bold transition-all hover:scale-105 active:scale-95 shadow-lg"
                >
                  Edit Profile
                </button>
              </div>
            )}
          </div>
          
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">{user.name}</h1>
              {user.isTwoFactorEnabled && (
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              )}
            </div>
            <p className="text-blue-600 dark:text-blue-400 font-bold uppercase text-xs tracking-widest">{user.roleLabel} • {user.schoolName}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-8 flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600" />
              Personal Information
            </h3>
            
            <form onSubmit={handleSave} className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Full Name</label>
                {isEditing ? (
                  <input 
                    type="text" 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all dark:text-white text-sm"
                  />
                ) : (
                  <div className="flex items-center gap-3 p-3 bg-slate-50/50 dark:bg-slate-800/50 rounded-xl border border-transparent">
                    <Users className="w-4 h-4 text-slate-400" />
                    <span className="font-bold text-slate-700 dark:text-slate-300 text-sm">{user.name}</span>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Email Address</label>
                {isEditing ? (
                  <input 
                    type="email" 
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all dark:text-white text-sm"
                  />
                ) : (
                  <div className="flex items-center gap-3 p-3 bg-slate-50/50 dark:bg-slate-800/50 rounded-xl">
                    <Mail className="w-4 h-4 text-slate-400" />
                    <span className="font-bold text-slate-700 dark:text-slate-300 text-sm">{user.email}</span>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Phone Number</label>
                {isEditing ? (
                  <input 
                    type="text" 
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all dark:text-white text-sm"
                  />
                ) : (
                  <div className="flex items-center gap-3 p-3 bg-slate-50/50 dark:bg-slate-800/50 rounded-xl">
                    <Phone className="w-4 h-4 text-slate-400" />
                    <span className="font-bold text-slate-700 dark:text-slate-300 text-sm">{user.phone}</span>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Residential Address</label>
                {isEditing ? (
                  <input 
                    type="text" 
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all dark:text-white text-sm"
                  />
                ) : (
                  <div className="flex items-center gap-3 p-3 bg-slate-50/50 dark:bg-slate-800/50 rounded-xl">
                    <MapPin className="w-4 h-4 text-slate-400" />
                    <span className="font-bold text-slate-700 dark:text-slate-300 text-sm">{user.address}</span>
                  </div>
                )}
              </div>
            </form>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-8 flex items-center gap-2">
              <Lock className="w-5 h-5 text-indigo-600" />
              Security Settings
            </h3>
            
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "p-2.5 rounded-xl transition-colors",
                    user.isTwoFactorEnabled ? "bg-emerald-500/10 text-emerald-500" : "bg-slate-100 dark:bg-slate-800 text-slate-400"
                  )}>
                    <Shield className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">Two-Factor Auth</p>
                    <p className={cn("text-[10px] font-bold uppercase", user.isTwoFactorEnabled ? "text-emerald-500" : "text-slate-500")}>
                      {user.isTwoFactorEnabled ? 'Active' : 'Disabled'}
                    </p>
                  </div>
                </div>
                <button 
                  onClick={toggle2FA}
                  className={cn(
                    "relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none",
                    user.isTwoFactorEnabled ? "bg-emerald-500" : "bg-slate-300 dark:bg-slate-700"
                  )}
                >
                  <span className={cn(
                    "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                    user.isTwoFactorEnabled ? "translate-x-6" : "translate-x-1"
                  )} />
                </button>
              </div>

              <button 
                onClick={() => setShowPasswordModal(true)}
                className="group w-full py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl text-sm font-bold transition-all hover:bg-slate-800 dark:hover:bg-slate-50 flex items-center justify-center gap-2 shadow-lg"
              >
                <Lock className="w-4 h-4 transition-transform group-hover:-translate-y-0.5" />
                Change Password
              </button>
              
              <p className="text-[10px] text-slate-400 font-medium text-center px-4 leading-relaxed">
                Last password change was 3 months ago. We recommend updating it every 6 months for better security.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Change Password Modal (Mock) */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-md overflow-hidden">
            <div className="px-8 py-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Change Password</h2>
              <button onClick={() => setShowPasswordModal(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>
            <div className="p-8 space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Current Password</label>
                <input type="password" placeholder="••••••••" className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none focus:border-blue-500 dark:text-white" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">New Password</label>
                <input type="password" placeholder="••••••••" className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none focus:border-blue-500 dark:text-white" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Confirm New Password</label>
                <input type="password" placeholder="••••••••" className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none focus:border-blue-500 dark:text-white" />
              </div>
              <div className="pt-4 flex gap-3">
                <button 
                  onClick={() => setShowPasswordModal(false)}
                  className="flex-1 px-6 py-3 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => setShowPasswordModal(false)}
                  className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-sm font-bold shadow-lg shadow-blue-900/20 transition-all"
                >
                  Update
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <PrintableIdCardModal
        open={showIdCard}
        onClose={() => setShowIdCard(false)}
        schoolProfile={schoolProfile}
        fullName={user.name}
        roleLabel={user.roleLabel}
        identifier={user.role === 'STUDENT' ? user.id : `${user.role}-${user.id}`}
        email={user.email}
        phone={user.phone}
        address={user.address}
        secondaryLabel="School"
        secondaryValue={user.schoolName}
        status={user.isTwoFactorEnabled ? 'Verified' : 'Active'}
        avatarUrl={user.avatarUrl}
      />
    </div>
  );
}
