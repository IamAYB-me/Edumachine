import React, { useRef, useState } from 'react';
import { Settings, Globe, Shield, Bell, Database, Mail, ArrowLeft, Save, Upload, CheckCircle2, AlertCircle, RefreshCw, HardDrive, ShieldCheck, Clock, Calendar, Lock } from 'lucide-react';
import { cn } from '@/utils';

import { useSettingsStore } from '@/store/useSettingsStore';
import { useToastStore } from '@/store/useToastStore';

export default function GlobalSettings() {
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const { globalSettings, updateGlobalSettings } = useSettingsStore();
  const showToast = useToastStore((state) => state.showToast);

  const sections = [
    { id: 'general', title: 'General Settings', icon: Globe, desc: 'Platform name, branding, and localization.' },
    { id: 'security', title: 'Security & Auth', icon: Shield, desc: 'Password policies and 2FA requirements.' },
    { id: 'email', title: 'Email & SMTP', icon: Mail, desc: 'Configure system notification emails.' },
    { id: 'database', title: 'Database & Backup', icon: Database, desc: 'Manage automated backups and storage.' },
    { id: 'notifications', title: 'System Notifications', icon: Bell, desc: 'Configure global broadcast messages.' },
  ];

  const handleMaintenanceToggle = () => {
    const nextMode = !maintenanceMode;
    setMaintenanceMode(nextMode);
    showToast({
      title: nextMode ? 'Maintenance mode enabled' : 'Maintenance mode disabled',
      description: nextMode
        ? 'School portals are now restricted to Super Admin access for platform maintenance.'
        : 'All portals are live again for staff, parents, and students.',
      variant: nextMode ? 'warning' : 'success',
    });
  };

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'general': return <GeneralSettingsView settings={globalSettings} onUpdate={updateGlobalSettings} />;
      case 'security': return <SecuritySettingsView settings={globalSettings} onUpdate={updateGlobalSettings} />;
      case 'email': return <EmailSettingsView settings={globalSettings} onUpdate={updateGlobalSettings} />;
      case 'database': return <DatabaseSettingsView />;
      case 'notifications': return <SystemNotificationsView />;
      default: return null;
    }
  };

  if (activeSection) {
    const section = sections.find(s => s.id === activeSection);
    return (
      <div className="space-y-6">
        <button 
          onClick={() => setActiveSection(null)}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors font-bold text-sm mb-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Settings
        </button>
        <div className="flex items-center gap-4 mb-8">
          <div className="p-3 bg-blue-600 rounded-2xl text-white shadow-lg shadow-blue-900/20">
            {section && <section.icon className="w-6 h-6" />}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{section?.title}</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm">{section?.desc}</p>
          </div>
        </div>
        {renderActiveSection()}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Global Settings</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Configure platform-wide parameters and infrastructure.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {sections.map((section) => (
          <button 
            key={section.id}
            onClick={() => setActiveSection(section.id)}
            className="flex items-start gap-4 p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:border-blue-500 dark:hover:border-blue-500 transition-all text-left group active:scale-[0.98]"
          >
            <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20 transition-colors">
              <section.icon className="w-6 h-6 text-slate-400 group-hover:text-blue-600" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white mb-1 tracking-tight">{section.title}</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{section.desc}</p>
            </div>
          </button>
        ))}
      </div>

      <div className="p-8 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl text-white shadow-xl shadow-blue-900/30 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-700">
          <RefreshCw className="w-32 h-32" />
        </div>
        <div className="relative z-10">
          <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            Maintenance Mode
          </h3>
          <p className="text-blue-100 text-sm mb-6 max-w-md">Enabling maintenance mode will restrict access to all school portals for system updates. Only Super Admins will be able to login.</p>
          <button
            onClick={handleMaintenanceToggle}
            className={cn(
              'px-8 py-3 font-bold rounded-xl text-sm transition-all shadow-lg active:scale-95',
              maintenanceMode
                ? 'bg-amber-100 text-amber-700 hover:bg-amber-50'
                : 'bg-white text-blue-600 hover:bg-blue-50'
            )}
          >
            {maintenanceMode ? 'Disable Maintenance Mode' : 'Enable Maintenance Mode'}
          </button>
        </div>
      </div>
    </div>
  );
}

function GeneralSettingsView({ settings, onUpdate }: { settings: any, onUpdate: any }) {
  const [formData, setFormData] = useState(settings);
  const [isSaving, setIsSaving] = useState(false);
  const showToast = useToastStore((state) => state.showToast);
  const logoInputRef = useRef<HTMLInputElement | null>(null);
  const faviconInputRef = useRef<HTMLInputElement | null>(null);

  const handlePickFile = (type: 'logo' | 'favicon') => {
    if (type === 'logo') {
      logoInputRef.current?.click();
      return;
    }
    faviconInputRef.current?.click();
  };

  const handleFileSelected = async (type: 'logo' | 'favicon', file?: File) => {
    if (!file) return;

    const isImage = file.type.startsWith('image/');
    if (!isImage) {
      showToast({
        title: 'Invalid file type',
        description: 'Please upload an image file.',
        variant: 'warning',
      });
      return;
    }

    if (file.size > 2_000_000) {
      showToast({
        title: 'File too large',
        description: 'Please upload an image smaller than 2MB.',
        variant: 'warning',
      });
      return;
    }

    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => reject(new Error('read_failed'));
      reader.readAsDataURL(file);
    }).catch(() => null);

    if (!dataUrl) {
      showToast({
        title: 'Upload failed',
        description: 'Please try selecting the file again.',
        variant: 'error',
      });
      return;
    }

    const updates = type === 'logo' ? { logoUrl: dataUrl } : { faviconUrl: dataUrl };
    setFormData((current: any) => ({ ...current, ...updates }));
    onUpdate(updates);

    showToast({
      title: type === 'logo' ? 'Logo uploaded' : 'Favicon uploaded',
      description: 'Saved to platform branding settings.',
      variant: 'success',
    });
  };

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      onUpdate(formData);
      setIsSaving(false);
      showToast({
        title: 'General settings updated',
        description: `${formData.appName} branding and localization preferences have been saved.`,
        variant: 'success',
      });
    }, 800);
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
      <div className="p-8 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Platform Branding</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase px-1">Application Name</label>
                <input 
                  type="text" 
                  value={formData.appName} 
                  onChange={(e) => setFormData({...formData, appName: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:text-white" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase px-1">Platform Tagline</label>
                <input 
                  type="text" 
                  value={formData.appTagline} 
                  onChange={(e) => setFormData({...formData, appTagline: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:text-white" 
                />
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Logo & Favicon</h3>
            <div className="flex gap-4">
              <input
                ref={logoInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleFileSelected('logo', e.target.files?.[0])}
              />
              <input
                ref={faviconInputRef}
                type="file"
                accept="image/png,image/x-icon,image/svg+xml,image/jpeg,image/webp"
                className="hidden"
                onChange={(e) => handleFileSelected('favicon', e.target.files?.[0])}
              />

              <button
                type="button"
                onClick={() => handlePickFile('logo')}
                className="flex-1 p-6 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl flex flex-col items-center justify-center gap-3 group hover:border-blue-500/50 transition-all"
              >
                {formData.logoUrl ? (
                  <div className="w-14 h-14 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-sm bg-white">
                    <img src={formData.logoUrl} alt="" className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20">
                    <Upload className="w-6 h-6 text-slate-400 group-hover:text-blue-600" />
                  </div>
                )}
                <span className="text-xs font-bold text-slate-500">
                  {formData.logoUrl ? 'Replace Main Logo' : 'Upload Main Logo'}
                </span>
              </button>

              <button
                type="button"
                onClick={() => handlePickFile('favicon')}
                className="flex-1 p-6 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl flex flex-col items-center justify-center gap-3 group hover:border-blue-500/50 transition-all"
              >
                {formData.faviconUrl ? (
                  <div className="w-14 h-14 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-sm bg-white flex items-center justify-center">
                    <img src={formData.faviconUrl} alt="" className="w-10 h-10 object-contain" />
                  </div>
                ) : (
                  <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20">
                    <Upload className="w-6 h-6 text-slate-400 group-hover:text-blue-600" />
                  </div>
                )}
                <span className="text-xs font-bold text-slate-500">
                  {formData.faviconUrl ? 'Replace Favicon' : 'Upload Favicon'}
                </span>
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Localization</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase px-1">Default Language</label>
                <select 
                  value={formData.language}
                  onChange={(e) => setFormData({...formData, language: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:text-white"
                >
                  <option>English (US)</option>
                  <option>English (UK)</option>
                  <option>French</option>
                  <option>Spanish</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase px-1">Default Timezone</label>
                <select 
                  value={formData.timezone}
                  onChange={(e) => setFormData({...formData, timezone: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:text-white"
                >
                  <option>(GMT+01:00) Lagos</option>
                  <option>(GMT+00:00) London</option>
                  <option>(GMT-05:00) New York</option>
                </select>
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Contact Information</h3>
            <div className="space-y-4">
              <input 
                type="email" 
                placeholder="Support Email" 
                value={formData.supportEmail}
                onChange={(e) => setFormData({...formData, supportEmail: e.target.value})}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:text-white" 
              />
              <input 
                type="text" 
                placeholder="Contact Phone" 
                value={formData.contactPhone}
                onChange={(e) => setFormData({...formData, contactPhone: e.target.value})}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:text-white" 
              />
            </div>
          </div>
        </div>
      </div>
      <div className="p-6 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-800 flex justify-end">
        <button 
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-2xl font-bold shadow-lg shadow-blue-900/20 active:scale-95 transition-all disabled:opacity-50"
        >
          {isSaving ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
          {isSaving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
}

function SecuritySettingsView({ settings, onUpdate }: { settings: any, onUpdate: any }) {
  const [formData, setFormData] = useState(settings);
  const [isSaving, setIsSaving] = useState(false);
  const showToast = useToastStore((state) => state.showToast);

  const handleToggle = (path: string) => {
    const keys = path.split('.');
    const newFormData = { ...formData };
    let current = newFormData;
    for (let i = 0; i < keys.length - 1; i++) {
      current = current[keys[i]];
    }
    current[keys[keys.length - 1]] = !current[keys[keys.length - 1]];
    setFormData(newFormData);
  };

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      onUpdate(formData);
      setIsSaving(false);
      showToast({
        title: 'Security settings updated',
        description: 'Authentication policies and protection controls are now applied platform-wide.',
        variant: 'success',
      });
    }, 800);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-blue-600" />
            Password Policy
          </h3>
          <div className="space-y-4">
            {[
              { label: 'Minimum Password Length', value: '8 Characters', key: 'passwordPolicy.minLength' },
              { label: 'Requires Capital Letter', enabled: formData.passwordPolicy.requireCapital, key: 'passwordPolicy.requireCapital' },
              { label: 'Requires Numbers', enabled: formData.passwordPolicy.requireNumbers, key: 'passwordPolicy.requireNumbers' },
              { label: 'Requires Special Characters', enabled: formData.passwordPolicy.requireSymbols, key: 'passwordPolicy.requireSymbols' },
              { label: 'Password Expiry (Days)', value: '90', key: 'passwordPolicy.expiryDays' },
            ].map((policy, i) => (
              <div key={i} className="flex justify-between items-center p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{policy.label}</span>
                {policy.value ? (
                  <span className="text-xs font-bold text-blue-600 px-3 py-1 bg-blue-50 dark:bg-blue-900/30 rounded-lg">{policy.value}</span>
                ) : (
                  <button 
                    onClick={() => handleToggle(policy.key)}
                    className={cn("w-10 h-5 rounded-full transition-colors relative", policy.enabled ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-700')}
                  >
                    <div className={cn("absolute top-1 w-3 h-3 bg-white rounded-full transition-all", policy.enabled ? 'right-1' : 'left-1')} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <Lock className="w-4 h-4 text-indigo-600" />
            Authentication Methods
          </h3>
          <div className="space-y-4">
            {[
              { label: 'Two-Factor Authentication', desc: 'Enforce 2FA for all Super Admins', enabled: formData.authMethods.enforce2FA, key: 'authMethods.enforce2FA' },
              { label: 'Google OAuth', desc: 'Allow login with Google Workspace', enabled: formData.authMethods.googleOAuth, key: 'authMethods.googleOAuth' },
              { label: 'Session Timeout', desc: 'Auto-logout after 30 mins inactivity', enabled: formData.authMethods.sessionTimeout, key: 'authMethods.sessionTimeout' },
              { label: 'IP Whitelisting', desc: 'Restrict access to specific IP ranges', enabled: formData.authMethods.ipWhitelisting, key: 'authMethods.ipWhitelisting' },
            ].map((method, i) => (
              <div key={i} className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 flex justify-between items-center">
                <div>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">{method.label}</p>
                  <p className="text-[10px] text-slate-500 font-medium">{method.desc}</p>
                </div>
                <button 
                  onClick={() => handleToggle(method.key)}
                  className={cn("w-10 h-5 rounded-full transition-colors relative", method.enabled ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-700')}
                >
                  <div className={cn("absolute top-1 w-3 h-3 bg-white rounded-full transition-all", method.enabled ? 'right-1' : 'left-1')} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="flex justify-end">
        <button 
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-2xl font-bold shadow-lg shadow-blue-900/20 active:scale-95 transition-all disabled:opacity-50"
        >
          {isSaving ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
          {isSaving ? 'Saving...' : 'Save Security Settings'}
        </button>
      </div>
    </div>
  );
}

function EmailSettingsView({ settings, onUpdate }: { settings: any, onUpdate: any }) {
  const [formData, setFormData] = useState(settings);
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const showToast = useToastStore((state) => state.showToast);

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      onUpdate(formData);
      setIsSaving(false);
      showToast({
        title: 'Email settings updated',
        description: `SMTP configuration for ${formData.smtpSettings.host} has been saved.`,
        variant: 'success',
      });
    }, 800);
  };

  const handleTestConnection = () => {
    setIsTesting(true);
    setTimeout(() => {
      setIsTesting(false);
      showToast({
        title: 'SMTP connection verified',
        description: `The server at ${formData.smtpSettings.host}:${formData.smtpSettings.port} responded successfully.`,
        variant: 'success',
      });
    }, 900);
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
      <div className="p-8 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">SMTP Server Configuration</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase px-1">SMTP Host</label>
                <input 
                  type="text" 
                  value={formData.smtpSettings.host}
                  onChange={(e) => setFormData({...formData, smtpSettings: {...formData.smtpSettings, host: e.target.value}})}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:text-white" 
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase px-1">SMTP Port</label>
                  <input 
                    type="text" 
                    value={formData.smtpSettings.port}
                    onChange={(e) => setFormData({...formData, smtpSettings: {...formData.smtpSettings, port: e.target.value}})}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:text-white" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase px-1">Encryption</label>
                  <select 
                    value={formData.smtpSettings.encryption}
                    onChange={(e) => setFormData({...formData, smtpSettings: {...formData.smtpSettings, encryption: e.target.value}})}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:text-white"
                  >
                    <option>STARTTLS</option>
                    <option>SSL/TLS</option>
                    <option>None</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Authentication</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase px-1">Username</label>
                <input 
                  type="text" 
                  value={formData.smtpSettings.username}
                  onChange={(e) => setFormData({...formData, smtpSettings: {...formData.smtpSettings, username: e.target.value}})}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:text-white" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase px-1">Password</label>
                <input type="password" placeholder="••••••••••••••••" className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:text-white" />
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="p-6 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-800 flex justify-between">
        <button
          onClick={handleTestConnection}
          disabled={isTesting}
          className="flex items-center gap-2 px-6 py-3 text-slate-600 dark:text-slate-400 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl transition-all disabled:opacity-50"
        >
          <RefreshCw className="w-4 h-4" />
          {isTesting ? 'Testing...' : 'Test Connection'}
        </button>
        <button 
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-2xl font-bold shadow-lg shadow-blue-900/20 active:scale-95 transition-all disabled:opacity-50"
        >
          {isSaving ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
          {isSaving ? 'Saving...' : 'Save Email Settings'}
        </button>
      </div>
    </div>
  );
}

function DatabaseSettingsView() {
  const [autoBackupEnabled, setAutoBackupEnabled] = useState(true);
  const [isBackingUp, setIsBackingUp] = useState(false);
  const showToast = useToastStore((state) => state.showToast);

  const handleBackupToggle = () => {
    const nextState = !autoBackupEnabled;
    setAutoBackupEnabled(nextState);
    showToast({
      title: nextState ? 'Automated backup enabled' : 'Automated backup paused',
      description: nextState
        ? 'Daily database snapshots will continue on the configured schedule.'
        : 'Automatic snapshots are paused until you re-enable them.',
      variant: nextState ? 'success' : 'warning',
    });
  };

  const handleManualBackup = () => {
    setIsBackingUp(true);
    setTimeout(() => {
      setIsBackingUp(false);
      showToast({
        title: 'Manual backup completed',
        description: 'A fresh platform snapshot has been stored successfully.',
        variant: 'success',
      });
    }, 1200);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm col-span-2">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-8 flex items-center gap-2">
            <HardDrive className="w-4 h-4 text-blue-600" />
            Automated Backups
          </h3>
          <div className="space-y-6">
            <div className="flex items-center justify-between p-6 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-2xl">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">Daily Database Snapshot</p>
                  <p className="text-xs text-slate-500">Last successful backup: 2 hours ago</p>
                </div>
              </div>
              <button
                onClick={handleBackupToggle}
                className="text-xs font-bold text-blue-600 hover:underline"
              >
                {autoBackupEnabled ? 'Pause' : 'Configure'}
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-slate-100 dark:border-slate-800 space-y-2 text-center">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Backup Retention</p>
                <p className="text-2xl font-black text-slate-900 dark:text-white">30 Days</p>
              </div>
              <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-slate-100 dark:border-slate-800 space-y-2 text-center">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Cloud Storage Use</p>
                <p className="text-2xl font-black text-slate-900 dark:text-white">12.4 GB</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-slate-900 dark:bg-white p-8 rounded-3xl text-white dark:text-slate-900 shadow-xl space-y-6">
          <h3 className="text-sm font-bold opacity-60 uppercase tracking-widest">Manual Backup</h3>
          <p className="text-sm leading-relaxed opacity-80">Trigger an immediate snapshot of all platform data. This may take several minutes depending on database size.</p>
          <button
            onClick={handleManualBackup}
            disabled={isBackingUp}
            className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold transition-all shadow-lg shadow-blue-900/40 active:scale-95 flex items-center justify-center gap-2 disabled:opacity-60"
          >
            <Database className="w-5 h-5" />
            {isBackingUp ? 'Backing Up...' : 'Backup Now'}
          </button>
        </div>
      </div>
    </div>
  );
}

function SystemNotificationsView() {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [pushToMobile, setPushToMobile] = useState(true);
  const [stickyBanner, setStickyBanner] = useState(false);
  const [recentBroadcasts, setRecentBroadcasts] = useState([
    { title: 'Update v2.4 Live', date: '2 days ago', icon: CheckCircle2, color: 'text-emerald-500' },
    { title: 'Server Upgrade', date: '1 week ago', icon: AlertCircle, color: 'text-amber-500' },
  ]);
  const showToast = useToastStore((state) => state.showToast);

  const handleSendBroadcast = () => {
    if (!subject.trim() || !message.trim()) {
      showToast({
        title: 'Broadcast incomplete',
        description: 'Add both a message subject and content before sending.',
        variant: 'warning',
      });
      return;
    }

    setRecentBroadcasts((current) => [
      { title: subject.trim(), date: 'Just now', icon: CheckCircle2, color: 'text-blue-500' },
      ...current,
    ]);
    setSubject('');
    setMessage('');
    showToast({
      title: 'Broadcast sent',
      description: `Announcement delivered${pushToMobile ? ' to mobile devices' : ''}${stickyBanner ? ' with sticky banner enabled' : ''}.`,
      variant: 'success',
    });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm col-span-2 space-y-6">
        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-8">Platform Broadcast</h3>
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase px-1">Message Subject</label>
            <input
              type="text"
              placeholder="e.g. Scheduled Maintenance"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:text-white"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase px-1">Notification Content</label>
            <textarea
              rows={4}
              placeholder="Type your global announcement here..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:text-white resize-none"
            ></textarea>
          </div>
          <div className="flex gap-4">
            <div className="flex-1 flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Push to Mobile</span>
              <button
                onClick={() => setPushToMobile((current) => !current)}
                className={cn('w-10 h-5 rounded-full relative transition-colors', pushToMobile ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-700')}
              >
                <div className={cn('absolute top-1 w-3 h-3 bg-white rounded-full transition-all', pushToMobile ? 'right-1' : 'left-1')} />
              </button>
            </div>
            <div className="flex-1 flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Sticky Banner</span>
              <button
                onClick={() => setStickyBanner((current) => !current)}
                className={cn('w-10 h-5 rounded-full relative transition-colors', stickyBanner ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-700')}
              >
                <div className={cn('absolute top-1 w-3 h-3 bg-white rounded-full transition-all', stickyBanner ? 'right-1' : 'left-1')} />
              </button>
            </div>
          </div>
          <button
            onClick={handleSendBroadcast}
            className="w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-bold transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2"
          >
            <Bell className="w-5 h-5" />
            Send Broadcast
          </button>
        </div>
      </div>

      <div className="space-y-6">
        <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6">Recent Broadcasts</h3>
          <div className="space-y-4">
            {recentBroadcasts.map((bc, i) => (
              <div key={i} className="flex items-start gap-3 p-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-xl transition-colors">
                <bc.icon className={cn("w-4 h-4 mt-0.5", bc.color)} />
                <div>
                  <p className="text-xs font-bold text-slate-900 dark:text-white">{bc.title}</p>
                  <p className="text-[10px] text-slate-500">{bc.date}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
