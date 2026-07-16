import React, { useState } from 'react';
import { Search, Filter, Plus, Building2, Edit, Trash2, X, Shield, Calendar, Settings2, CheckCircle2, RefreshCw } from 'lucide-react';
import { cn } from '@/utils';
import { SchoolIntegrations, useDataStore, School, AdmissionFieldKey, buildDefaultAdmissionFormConfig } from '@/store/useDataStore';
import { useToastStore } from '@/store/useToastStore';
import { readFileAsDataUrl } from '@/utils/fileHelpers';
import { getAdmissionBuilderSections } from '@/utils/admissionBuilder';

const createDefaultIntegrations = (): SchoolIntegrations => ({
  paymentGateway: {
    enabled: false,
    provider: '',
    publicKey: '',
    secretKey: '',
    merchantId: '',
    callbackUrl: '',
  },
  smsApi: {
    enabled: false,
    provider: '',
    senderId: '',
    apiKey: '',
    apiUrl: '',
  },
  emailApi: {
    enabled: false,
    provider: '',
    fromEmail: '',
    apiKey: '',
    domain: '',
  },
  otherApi: {
    enabled: false,
    label: '',
    apiKey: '',
    apiUrl: '',
    notes: '',
  },
});

export default function SchoolsManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const { schools, addSchool, updateSchool, deleteSchool } = useDataStore();
  const showToast = useToastStore((state) => state.showToast);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSchool, setEditingSchool] = useState<School | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    adminName: '',
    email: '',
    phone: '',
    address: '',
    portalLevel: 'Secondary' as School['portalLevel'],
    logoUrl: '',
    teacherSignatoryName: '',
    hodSignatoryName: '',
    principalSignatoryName: '',
    teacherSignatureUrl: '',
    hodSignatureUrl: '',
    principalSignatureUrl: '',
    integrations: createDefaultIntegrations(),
    admissionFormConfig: buildDefaultAdmissionFormConfig('Secondary'),
    status: 'Active' as 'Active' | 'Suspended',
    subscriptionPlan: 'Standard' as 'Basic' | 'Standard' | 'Professional' | 'Enterprise',
    expiryDate: new Date().toISOString().split('T')[0]
  });

  const filteredSchools = schools.filter(school => 
    school.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    school.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    school.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenModal = (school?: School) => {
    if (school) {
      setEditingSchool(school);
      setFormData({
        name: school.name,
        code: school.code,
        adminName: school.adminName,
        email: school.email,
        phone: school.phone,
        address: school.address,
        portalLevel: school.portalLevel,
        logoUrl: school.logoUrl ?? '',
        teacherSignatoryName: school.teacherSignatoryName ?? '',
        hodSignatoryName: school.hodSignatoryName ?? '',
        principalSignatoryName: school.principalSignatoryName ?? '',
        teacherSignatureUrl: school.teacherSignatureUrl ?? '',
        hodSignatureUrl: school.hodSignatureUrl ?? '',
        principalSignatureUrl: school.principalSignatureUrl ?? '',
        integrations: school.integrations ?? createDefaultIntegrations(),
        admissionFormConfig: school.admissionFormConfig ?? buildDefaultAdmissionFormConfig(school.portalLevel),
        status: school.status,
        subscriptionPlan: school.subscriptionPlan,
        expiryDate: school.expiryDate
      });
    } else {
      setEditingSchool(null);
      setFormData({
        name: '',
        code: '',
        adminName: '',
        email: '',
        phone: '',
        address: '',
        portalLevel: 'Secondary',
        logoUrl: '',
        teacherSignatoryName: '',
        hodSignatoryName: '',
        principalSignatoryName: '',
        teacherSignatureUrl: '',
        hodSignatureUrl: '',
        principalSignatureUrl: '',
        integrations: createDefaultIntegrations(),
        admissionFormConfig: buildDefaultAdmissionFormConfig('Secondary'),
        status: 'Active',
        subscriptionPlan: 'Standard',
        expiryDate: new Date().toISOString().split('T')[0]
      });
    }
    setIsModalOpen(true);
  };

  const updateIntegrationField = <
    TSection extends keyof SchoolIntegrations,
    TField extends keyof SchoolIntegrations[TSection]
  >(
    section: TSection,
    field: TField,
    value: SchoolIntegrations[TSection][TField]
  ) => {
    setFormData((current) => ({
      ...current,
      integrations: {
        ...current.integrations,
        [section]: {
          ...current.integrations[section],
          [field]: value,
        },
      },
    }));
  };



const admissionBuilderSections = getAdmissionBuilderSections(formData.portalLevel);
const enabledAdmissionFields = formData.admissionFormConfig?.enabledFields ?? [];

const handlePortalLevelChange = (portalLevel: School['portalLevel']) => {
  setFormData((current) => ({
    ...current,
    portalLevel,
    admissionFormConfig: buildDefaultAdmissionFormConfig(portalLevel),
  }));

  showToast({
    title: 'Admission builder reset',
    description: `Recommended ${portalLevel.toLowerCase()} admission fields have been loaded.`,
    variant: 'info',
  });
};

const toggleAdmissionField = (fieldKey: AdmissionFieldKey) => {
  setFormData((current) => {
    const enabledFields = current.admissionFormConfig?.enabledFields ?? [];
    const nextEnabledFields = enabledFields.includes(fieldKey)
      ? enabledFields.filter((field) => field !== fieldKey)
      : [...enabledFields, fieldKey];

    return {
      ...current,
      admissionFormConfig: {
        enabledFields: nextEnabledFields,
      },
    };
  });
};

const resetAdmissionBuilder = () => {
  setFormData((current) => ({
    ...current,
    admissionFormConfig: buildDefaultAdmissionFormConfig(current.portalLevel),
  }));

  showToast({
    title: 'Admission builder restored',
    description: 'Recommended fields for this school level have been restored.',
    variant: 'success',
  });
};
  const handleAssetSelected = async (
    field: 'logoUrl' | 'teacherSignatureUrl' | 'hodSignatureUrl' | 'principalSignatureUrl',
    file?: File
  ) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      showToast({
        title: 'Image required',
        description: 'Please upload an image file for school branding or signatures.',
        variant: 'warning',
      });
      return;
    }

    const dataUrl = await readFileAsDataUrl(file).catch(() => null);
    if (!dataUrl) {
      showToast({
        title: 'Upload failed',
        description: 'The selected image could not be processed.',
        variant: 'error',
      });
      return;
    }

    setFormData((current) => ({ ...current, [field]: dataUrl }));
    showToast({
      title: 'Asset uploaded',
      description: `${file.name} is ready to be saved for this school.`,
      variant: 'success',
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingSchool) {
      updateSchool(editingSchool.id, formData);
    } else {
      addSchool(formData);
    }
    showToast({
      title: editingSchool ? 'School updated' : 'School registered',
      description: `${formData.name} branding and contact details have been saved.`,
      variant: 'success',
    });
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6 h-full flex flex-col relative">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Schools Management</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Manage registered schools and their subscriptions.</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Register New School
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex-1 flex flex-col overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search schools..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:border-blue-500 transition-all dark:text-white"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead className="bg-slate-50 dark:bg-slate-800 sticky top-0 z-10">
              <tr className="border-b border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-6">School Info</th>
                <th className="py-3 px-6">Admin Info</th>
                <th className="py-3 px-6">Level</th>
                <th className="py-3 px-6">Services</th>
                <th className="py-3 px-6">Plan</th>
                <th className="py-3 px-6">Expiry</th>
                <th className="py-3 px-6">Status</th>
                <th className="py-3 px-6 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-slate-100 dark:divide-slate-800">
              {filteredSchools.map((school) => (
                <tr key={school.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors group">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-lg">
                        <Building2 className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white">{school.name}</p>
                        <p className="text-xs text-slate-500 font-mono uppercase">{school.code}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <p className="font-medium text-slate-700 dark:text-slate-300">{school.adminName}</p>
                    <p className="text-xs text-slate-500">{school.email}</p>
                  </td>
                  <td className="py-4 px-6">
                    <span className="inline-flex px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                      {school.portalLevel}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex flex-wrap gap-2">
                      {school.integrations?.paymentGateway?.enabled ? (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">Payment</span>
                      ) : null}
                      {school.integrations?.smsApi?.enabled ? (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">SMS</span>
                      ) : null}
                      {school.integrations?.emailApi?.enabled ? (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400">Email</span>
                      ) : null}
                      {school.integrations?.otherApi?.enabled ? (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">Other</span>
                      ) : null}
                      {!school.integrations?.paymentGateway?.enabled && !school.integrations?.smsApi?.enabled && !school.integrations?.emailApi?.enabled && !school.integrations?.otherApi?.enabled ? (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">Not Set</span>
                      ) : null}
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className={cn(
                      "px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                      school.subscriptionPlan === 'Enterprise' ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400" :
                      school.subscriptionPlan === 'Professional' ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" :
                      school.subscriptionPlan === 'Standard' ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" :
                      "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                    )}>
                      {school.subscriptionPlan}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      {school.expiryDate}
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className={cn(
                      "inline-block px-2.5 py-1 rounded-full text-[10px] font-semibold",
                      school.status === 'Active' ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" : "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400"
                    )}>
                      {school.status}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => handleOpenModal(school)}
                        className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded" title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => deleteSchool(school.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded" title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Register Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 w-full max-w-4xl overflow-hidden animate-in fade-in zoom-in duration-200"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                {editingSchool ? 'Edit School Details' : 'Register New School'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="max-h-[80vh] overflow-y-auto p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">School Name</label>
                  <input 
                    type="text" 
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-500 dark:text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">School Code</label>
                  <input 
                    type="text" 
                    required
                    value={formData.code}
                    onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase()})}
                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-500 dark:text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Admin Name</label>
                  <input 
                    type="text" 
                    required
                    value={formData.adminName}
                    onChange={(e) => setFormData({...formData, adminName: e.target.value})}
                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-500 dark:text-white"
                  />
                </div>
                <div className="col-span-2 space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Contact Email</label>
                  <input 
                    type="email" 
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-500 dark:text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Phone Number</label>
                  <input
                    type="text"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-500 dark:text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Address</label>
                  <input
                    type="text"
                    required
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-500 dark:text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Portal Level</label>
                  <select
                    value={formData.portalLevel}
                    onChange={(e) => handlePortalLevelChange(e.target.value as School['portalLevel'])}
                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-500 dark:text-white"
                  >
                    <option value="Primary">Primary</option>
                    <option value="Secondary">Secondary</option>
                    <option value="College">College / Polytechnic</option>
                    <option value="University">University</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Subscription Plan</label>
                  <select 
                    value={formData.subscriptionPlan}
                    onChange={(e) => setFormData({...formData, subscriptionPlan: e.target.value as any})}
                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-500 dark:text-white"
                  >
                    <option value="Basic">Basic</option>
                    <option value="Standard">Standard</option>
                    <option value="Professional">Professional</option>
                    <option value="Enterprise">Enterprise</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Expiry Date</label>
                  <input 
                    type="date" 
                    required
                    value={formData.expiryDate}
                    onChange={(e) => setFormData({...formData, expiryDate: e.target.value})}
                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-500 dark:text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Status</label>
                  <select 
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value as any})}
                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-500 dark:text-white"
                  >
                    <option value="Active">Active</option>
                    <option value="Suspended">Suspended</option>
                  </select>
                </div>
                
<div className="col-span-2 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 space-y-4 bg-slate-50/60 dark:bg-slate-800/40">
  <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
    <div>
      <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
        <Settings2 className="w-4 h-4 text-blue-600" />
        Admission Form Builder
      </h3>
      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
        Choose which student registration fields should appear for this school during deployment.
      </p>
    </div>
    <div className="flex items-center gap-2">
      <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 text-[10px] font-bold uppercase tracking-wider">
        {enabledAdmissionFields.length} fields enabled
      </span>
      <button
        type="button"
        onClick={resetAdmissionBuilder}
        className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
      >
        <RefreshCw className="w-3.5 h-3.5" />
        Reset Recommended
      </button>
    </div>
  </div>

  <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
    {admissionBuilderSections.map((section) => (
      <div key={section.title} className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 space-y-3">
        <div>
          <h4 className="text-sm font-bold text-slate-900 dark:text-white">{section.title}</h4>
          {section.description ? (
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{section.description}</p>
          ) : null}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {section.fields.map((field) => {
            const checked = enabledAdmissionFields.includes(field.key);
            return (
              <label
                key={field.key}
                className={cn(
                  'flex items-start gap-3 rounded-xl border px-3 py-2 cursor-pointer transition-colors',
                  checked
                    ? 'border-blue-200 bg-blue-50/70 dark:border-blue-800 dark:bg-blue-900/20'
                    : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                )}
              >
                <input
                  type="checkbox"
                  className="mt-1 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  checked={checked}
                  onChange={() => toggleAdmissionField(field.key)}
                />
                <div>
                  <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{field.label}</p>
                  {field.description ? (
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{field.description}</p>
                  ) : null}
                </div>
              </label>
            );
          })}
        </div>
      </div>
    ))}
  </div>
</div>

<div className="col-span-2 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 space-y-4 bg-slate-50/60 dark:bg-slate-800/40">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">School Service Integrations</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/50 p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-bold text-slate-900 dark:text-white">Payment Gateway</p>
                        <label className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase">
                          <input
                            type="checkbox"
                            checked={formData.integrations.paymentGateway.enabled}
                            onChange={(e) => updateIntegrationField('paymentGateway', 'enabled', e.target.checked)}
                          />
                          Enabled
                        </label>
                      </div>
                      <input value={formData.integrations.paymentGateway.provider} onChange={(e) => updateIntegrationField('paymentGateway', 'provider', e.target.value)} placeholder="Provider e.g. Paystack" className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-500 dark:text-white" />
                      <input value={formData.integrations.paymentGateway.publicKey} onChange={(e) => updateIntegrationField('paymentGateway', 'publicKey', e.target.value)} placeholder="Public key" className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-500 dark:text-white" />
                      <input value={formData.integrations.paymentGateway.secretKey} onChange={(e) => updateIntegrationField('paymentGateway', 'secretKey', e.target.value)} placeholder="Secret key" className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-500 dark:text-white" />
                      <input value={formData.integrations.paymentGateway.merchantId} onChange={(e) => updateIntegrationField('paymentGateway', 'merchantId', e.target.value)} placeholder="Merchant ID" className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-500 dark:text-white" />
                      <input value={formData.integrations.paymentGateway.callbackUrl} onChange={(e) => updateIntegrationField('paymentGateway', 'callbackUrl', e.target.value)} placeholder="Callback URL" className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-500 dark:text-white" />
                    </div>
                    <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/50 p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-bold text-slate-900 dark:text-white">SMS API</p>
                        <label className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase">
                          <input
                            type="checkbox"
                            checked={formData.integrations.smsApi.enabled}
                            onChange={(e) => updateIntegrationField('smsApi', 'enabled', e.target.checked)}
                          />
                          Enabled
                        </label>
                      </div>
                      <input value={formData.integrations.smsApi.provider} onChange={(e) => updateIntegrationField('smsApi', 'provider', e.target.value)} placeholder="Provider e.g. Termii" className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-500 dark:text-white" />
                      <input value={formData.integrations.smsApi.senderId} onChange={(e) => updateIntegrationField('smsApi', 'senderId', e.target.value)} placeholder="Sender ID" className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-500 dark:text-white" />
                      <input value={formData.integrations.smsApi.apiKey} onChange={(e) => updateIntegrationField('smsApi', 'apiKey', e.target.value)} placeholder="SMS API key" className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-500 dark:text-white" />
                      <input value={formData.integrations.smsApi.apiUrl} onChange={(e) => updateIntegrationField('smsApi', 'apiUrl', e.target.value)} placeholder="SMS API URL" className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-500 dark:text-white" />
                    </div>
                    <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/50 p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-bold text-slate-900 dark:text-white">Email API</p>
                        <label className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase">
                          <input
                            type="checkbox"
                            checked={formData.integrations.emailApi.enabled}
                            onChange={(e) => updateIntegrationField('emailApi', 'enabled', e.target.checked)}
                          />
                          Enabled
                        </label>
                      </div>
                      <input value={formData.integrations.emailApi.provider} onChange={(e) => updateIntegrationField('emailApi', 'provider', e.target.value)} placeholder="Provider e.g. SendGrid" className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-500 dark:text-white" />
                      <input value={formData.integrations.emailApi.fromEmail} onChange={(e) => updateIntegrationField('emailApi', 'fromEmail', e.target.value)} placeholder="From email" className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-500 dark:text-white" />
                      <input value={formData.integrations.emailApi.apiKey} onChange={(e) => updateIntegrationField('emailApi', 'apiKey', e.target.value)} placeholder="Email API key" className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-500 dark:text-white" />
                      <input value={formData.integrations.emailApi.domain} onChange={(e) => updateIntegrationField('emailApi', 'domain', e.target.value)} placeholder="Sending domain" className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-500 dark:text-white" />
                    </div>
                    <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/50 p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-bold text-slate-900 dark:text-white">Other Integration</p>
                        <label className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase">
                          <input
                            type="checkbox"
                            checked={formData.integrations.otherApi.enabled}
                            onChange={(e) => updateIntegrationField('otherApi', 'enabled', e.target.checked)}
                          />
                          Enabled
                        </label>
                      </div>
                      <input value={formData.integrations.otherApi.label} onChange={(e) => updateIntegrationField('otherApi', 'label', e.target.value)} placeholder="Integration name" className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-500 dark:text-white" />
                      <input value={formData.integrations.otherApi.apiKey} onChange={(e) => updateIntegrationField('otherApi', 'apiKey', e.target.value)} placeholder="API key" className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-500 dark:text-white" />
                      <input value={formData.integrations.otherApi.apiUrl} onChange={(e) => updateIntegrationField('otherApi', 'apiUrl', e.target.value)} placeholder="API URL" className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-500 dark:text-white" />
                      <textarea value={formData.integrations.otherApi.notes} onChange={(e) => updateIntegrationField('otherApi', 'notes', e.target.value)} placeholder="Notes or webhook instructions" rows={3} className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-500 dark:text-white" />
                    </div>
                  </div>
                </div>
                <div className="col-span-2 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 space-y-4 bg-slate-50/60 dark:bg-slate-800/40">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Result Sheet Branding</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <label className="space-y-2">
                      <span className="text-xs font-bold text-slate-500 uppercase">School Logo</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => void handleAssetSelected('logoUrl', e.target.files?.[0])}
                        className="block w-full text-sm text-slate-600 file:mr-3 file:rounded-xl file:border-0 file:bg-blue-600 file:px-4 file:py-2 file:font-semibold file:text-white"
                      />
                      {formData.logoUrl ? (
                        <img src={formData.logoUrl} alt="School logo preview" className="h-20 w-20 rounded-2xl border border-slate-200 object-cover" />
                      ) : null}
                    </label>
                  </div>
                </div>
                <div className="col-span-2 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 space-y-4 bg-slate-50/60 dark:bg-slate-800/40">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Result Sheet Signatories</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <label className="space-y-1">
                      <span className="text-xs font-bold text-slate-500 uppercase">Teacher Signatory Name</span>
                      <input
                        type="text"
                        value={formData.teacherSignatoryName}
                        onChange={(e) => setFormData({...formData, teacherSignatoryName: e.target.value})}
                        className="w-full px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-500 dark:text-white"
                      />
                    </label>
                    <label className="space-y-2">
                      <span className="text-xs font-bold text-slate-500 uppercase">Teacher Signature</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => void handleAssetSelected('teacherSignatureUrl', e.target.files?.[0])}
                        className="block w-full text-sm text-slate-600 file:mr-3 file:rounded-xl file:border-0 file:bg-blue-600 file:px-4 file:py-2 file:font-semibold file:text-white"
                      />
                      {formData.teacherSignatureUrl ? (
                        <img src={formData.teacherSignatureUrl} alt="Teacher signature preview" className="h-16 w-32 rounded-xl border border-slate-200 object-contain bg-white" />
                      ) : null}
                    </label>
                    <label className="space-y-1">
                      <span className="text-xs font-bold text-slate-500 uppercase">HOD Signatory Name</span>
                      <input
                        type="text"
                        value={formData.hodSignatoryName}
                        onChange={(e) => setFormData({...formData, hodSignatoryName: e.target.value})}
                        className="w-full px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-500 dark:text-white"
                      />
                    </label>
                    <label className="space-y-2">
                      <span className="text-xs font-bold text-slate-500 uppercase">HOD Signature</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => void handleAssetSelected('hodSignatureUrl', e.target.files?.[0])}
                        className="block w-full text-sm text-slate-600 file:mr-3 file:rounded-xl file:border-0 file:bg-blue-600 file:px-4 file:py-2 file:font-semibold file:text-white"
                      />
                      {formData.hodSignatureUrl ? (
                        <img src={formData.hodSignatureUrl} alt="HOD signature preview" className="h-16 w-32 rounded-xl border border-slate-200 object-contain bg-white" />
                      ) : null}
                    </label>
                    <label className="space-y-1">
                      <span className="text-xs font-bold text-slate-500 uppercase">Principal Signatory Name</span>
                      <input
                        type="text"
                        value={formData.principalSignatoryName}
                        onChange={(e) => setFormData({...formData, principalSignatoryName: e.target.value})}
                        className="w-full px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-500 dark:text-white"
                      />
                    </label>
                    <label className="space-y-2">
                      <span className="text-xs font-bold text-slate-500 uppercase">Principal Signature</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => void handleAssetSelected('principalSignatureUrl', e.target.files?.[0])}
                        className="block w-full text-sm text-slate-600 file:mr-3 file:rounded-xl file:border-0 file:bg-blue-600 file:px-4 file:py-2 file:font-semibold file:text-white"
                      />
                      {formData.principalSignatureUrl ? (
                        <img src={formData.principalSignatureUrl} alt="Principal signature preview" className="h-16 w-32 rounded-xl border border-slate-200 object-contain bg-white" />
                      ) : null}
                    </label>
                  </div>
                </div>
              </div>
              <div className="pt-4 flex gap-3">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-900/20 transition-all"
                >
                  {editingSchool ? 'Update School' : 'Register School'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
