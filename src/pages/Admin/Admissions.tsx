import React, { useState, useMemo } from 'react';
import {
  Search, Eye, CheckCircle, XCircle, Clock, UserCheck, Trash2,
  X, GraduationCap, CreditCard, ChevronDown, Settings, Link2,
  Copy, Check, Globe, DollarSign, Hash, Sparkles,
} from 'lucide-react';
import { cn } from '@/utils';
import { useDataStore, AdmissionApplication } from '@/store/useDataStore';
import { useAuthStore } from '@/store/useAuthStore';
import { useToastStore } from '@/store/useToastStore';
import { useSettingsStore } from '@/store/useSettingsStore';
import { KPICard } from '@/components/ui/KPICard';

export default function AdmissionsManagement() {
  const { admissionApplications, updateAdmissionApplication, deleteAdmissionApplication, addStudent } = useDataStore();
  const user = useAuthStore((state) => state.user);
  const showToast = useToastStore((state) => state.showToast);
  const { globalSettings, updateGlobalSettings } = useSettingsStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedApp, setSelectedApp] = useState<AdmissionApplication | null>(null);
  const [admitting, setAdmitting] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [editingFee, setEditingFee] = useState(String(globalSettings.admissionFee || 5000));
  const [editingPrefix, setEditingPrefix] = useState(globalSettings.admissionFormPrefix || 'EMS');
  const [copiedLink, setCopiedLink] = useState(false);

  const filtered = useMemo(() => {
    let result = admissionApplications;
    if (statusFilter !== 'all') {
      result = result.filter((a) => a.applicationStatus === statusFilter);
    }
    if (searchTerm) {
      const t = searchTerm.toLowerCase();
      result = result.filter((a) =>
        `${a.surname} ${a.firstName}`.toLowerCase().includes(t) ||
        a.email.toLowerCase().includes(t) ||
        a.classApplyingFor.toLowerCase().includes(t) ||
        (a.applicationFormNumber || '').toLowerCase().includes(t)
      );
    }
    return result.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
  }, [admissionApplications, searchTerm, statusFilter]);

  const stats = {
    total: admissionApplications.length,
    pending: admissionApplications.filter((a) => a.applicationStatus === 'Pending').length,
    approved: admissionApplications.filter((a) => a.applicationStatus === 'Approved').length,
    admitted: admissionApplications.filter((a) => a.applicationStatus === 'Admitted').length,
  };

  const statusColors: Record<string, string> = {
    Pending: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    'Under Review': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    Approved: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    Admitted: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    Rejected: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
  };

  const handleStatusChange = (id: string, status: AdmissionApplication['applicationStatus']) => {
    updateAdmissionApplication(id, {
      applicationStatus: status,
      reviewedAt: new Date().toISOString().split('T')[0],
      reviewedBy: user?.name || 'Admin',
    });
    showToast({ title: `Application ${status.toLowerCase()}`, variant: status === 'Rejected' ? 'warning' : 'success' });
  };

  const handleAdmit = (app: AdmissionApplication) => {
    setAdmitting(true);
    addStudent({
      name: `${app.surname} ${app.firstName}`,
      email: app.email,
      regNo: 'REG-' + Date.now().toString(36).toUpperCase(),
      admissionNumber: '',
      class: app.classApplyingFor,
      parentName: app.sponsorFullName || app.parentName || '',
      status: 'Active',
      phone: app.phone,
      surname: app.surname,
      firstName: app.firstName,
      middleName: app.middleName,
      gender: app.gender,
      dateOfBirth: app.dateOfBirth,
      placeOfBirth: app.placeOfBirth,
      nationality: app.nationality,
      stateOfOrigin: app.stateOfOrigin,
      lga: app.lga,
      maritalStatus: app.maritalStatus,
      passportUrl: app.passportUrl,
      residentialAddress: app.residentialAddress,
      sponsorName: app.sponsorFullName,
      sponsorPhone: app.sponsorPhone,
    });
    updateAdmissionApplication(app.id, { applicationStatus: 'Admitted' });
    showToast({ title: 'Student admitted', description: `${app.surname} ${app.firstName} has been added to the student directory.`, variant: 'success' });
    setSelectedApp(null);
    setAdmitting(false);
  };

  const DetailRow = ({ label, value }: { label: string; value?: string | number | null }) => (
    <div>
      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">{label}</p>
      <p className="text-sm font-medium text-slate-900 dark:text-white">{value || '—'}</p>
    </div>
  );

  const publicAdmissionUrl = `${window.location.origin}/admissions/apply`;
  const previewFormNumber = `${editingPrefix.toUpperCase()}/${new Date().getFullYear()}/${String(globalSettings.admissionFormNextSequence || 1).padStart(4, '0')}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(publicAdmissionUrl);
    setCopiedLink(true);
    showToast({ title: 'Link copied to clipboard', variant: 'success' });
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleSaveSettings = () => {
    const fee = parseInt(editingFee, 10);
    if (isNaN(fee) || fee < 0) {
      showToast({ title: 'Please enter a valid fee amount', variant: 'warning' });
      return;
    }
    const prefix = editingPrefix.trim().replace(/[^a-zA-Z0-9]/g, '');
    if (!prefix) {
      showToast({ title: 'Please enter a form prefix', variant: 'warning' });
      return;
    }
    updateGlobalSettings({ admissionFee: fee, admissionFormPrefix: prefix.toUpperCase() });
    showToast({ title: 'Admission form settings saved', variant: 'success' });
  };

  const inputClass = "w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:border-blue-500 dark:text-white transition-colors";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white uppercase tracking-tight">Admissions</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 font-medium">
            Review applications, manage form settings, and process admissions.
          </p>
        </div>
        <button
          onClick={() => setShowSettings(!showSettings)}
          className={cn(
            "flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all border",
            showSettings
              ? "bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-900/20"
              : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700"
          )}
        >
          <Settings className="w-4 h-4" />
          Form Settings
        </button>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="px-6 py-4 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-900/20 dark:via-indigo-900/20 dark:to-purple-900/20 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-900/30">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Admission Form Configuration</h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Set up the public form link, fee, and form number format</p>
              </div>
            </div>
          </div>
          <div className="p-6 space-y-6">
            {/* Row 1: Link + Fee */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Public Link */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide flex items-center gap-2">
                  <Link2 className="w-3.5 h-3.5" />
                  Public Application Link
                </label>
                <div className="flex items-center gap-2">
                  <div className="flex-1 flex items-center gap-2 px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
                    <Globe className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    <span className="text-sm text-slate-700 dark:text-slate-300 font-mono truncate">{publicAdmissionUrl}</span>
                  </div>
                  <button
                    onClick={handleCopyLink}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all flex-shrink-0",
                      copiedLink
                        ? "bg-emerald-600 text-white"
                        : "bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-900/20"
                    )}
                  >
                    {copiedLink ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    {copiedLink ? 'Copied!' : 'Copy'}
                  </button>
                </div>
                <p className="text-[11px] text-slate-400">Share this link — no login required.</p>
              </div>

              {/* Admission Fee */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide flex items-center gap-2">
                  <DollarSign className="w-3.5 h-3.5" />
                  Admission Form Fee
                </label>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">₦</span>
                    <input
                      type="number"
                      value={editingFee}
                      onChange={(e) => setEditingFee(e.target.value)}
                      min="0"
                      className="w-full pl-8 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold focus:outline-none focus:border-blue-500 dark:text-white"
                    />
                  </div>
                </div>
                <p className="text-[11px] text-slate-400">Non-refundable processing fee.</p>
              </div>
            </div>

            {/* Row 2: Form Prefix + Preview */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Form Prefix */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide flex items-center gap-2">
                  <Hash className="w-3.5 h-3.5" />
                  Application Form Prefix
                </label>
                <input
                  type="text"
                  value={editingPrefix}
                  onChange={(e) => setEditingPrefix(e.target.value)}
                  placeholder="e.g. EMS, GPS, LGS"
                  maxLength={6}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold font-mono uppercase focus:outline-none focus:border-blue-500 dark:text-white"
                />
                <p className="text-[11px] text-slate-400">School code/initials used as the start of every application number.</p>
              </div>

              {/* Form Number Preview */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide flex items-center gap-2">
                  <Eye className="w-3.5 h-3.5" />
                  Form Number Preview
                </label>
                <div className="flex items-center gap-3 px-4 py-2.5 bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl">
                  <span className="text-lg font-bold text-blue-600 dark:text-blue-400 font-mono tracking-wider">{previewFormNumber}</span>
                </div>
                <p className="text-[11px] text-slate-400">Format: <strong className="text-slate-500">{`{PREFIX}/{YEAR}/{SEQUENCE}`}</strong> — sequence auto-increments per application.</p>
              </div>
            </div>

            {/* Save + Info */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-2">
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl px-4 py-3 flex-1">
                <p className="text-xs text-blue-700 dark:text-blue-400 leading-relaxed">
                  <strong>How it works:</strong> Copy the link and share it. Applicants fill the form, pay the fee, and you review all submissions here.
                </p>
              </div>
              <button
                onClick={handleSaveSettings}
                className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-emerald-900/20 transition-all flex-shrink-0"
              >
                <Check className="w-4 h-4" />
                Save Settings
              </button>
            </div>
          </div>
        </div>
      )}

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPICard title="Total Applications" value={stats.total} icon={GraduationCap} iconBgClass="bg-blue-50 dark:bg-blue-900/20" iconColorClass="text-blue-600 dark:text-blue-400" />
        <KPICard title="Pending Review" value={stats.pending} icon={Clock} iconBgClass="bg-amber-50 dark:bg-amber-900/20" iconColorClass="text-amber-600 dark:text-amber-400" />
        <KPICard title="Approved" value={stats.approved} icon={CheckCircle} iconBgClass="bg-emerald-50 dark:bg-emerald-900/20" iconColorClass="text-emerald-600 dark:text-emerald-400" />
        <KPICard title="Admitted" value={stats.admitted} icon={UserCheck} iconBgClass="bg-purple-50 dark:bg-purple-900/20" iconColorClass="text-purple-600 dark:text-purple-400" />
      </div>

      {/* Search & Filter */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input type="text" placeholder="Search by name, email, form number..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:border-blue-500 dark:text-white" />
          </div>
          <div className="relative">
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:border-blue-500 dark:text-white appearance-none pr-8">
              <option value="all">All Status</option>
              <option value="Pending">Pending</option>
              <option value="Under Review">Under Review</option>
              <option value="Approved">Approved</option>
              <option value="Admitted">Admitted</option>
              <option value="Rejected">Rejected</option>
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[950px]">
            <thead className="bg-slate-50 dark:bg-slate-800">
              <tr className="border-b border-slate-200 dark:border-slate-700 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">Applicant</th>
                <th className="py-3 px-4">Form Number</th>
                <th className="py-3 px-4">Class</th>
                <th className="py-3 px-4">Sponsor</th>
                <th className="py-3 px-4">Payment</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-slate-100 dark:divide-slate-800">
              {filtered.map((app) => (
                <tr key={app.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 group transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      {app.passportUrl ? (
                        <img src={app.passportUrl} alt="" className="w-8 h-8 rounded-lg object-cover border border-slate-200 dark:border-slate-700" />
                      ) : (
                        <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center border border-slate-200 dark:border-slate-700">
                          <UserCheck className="w-4 h-4 text-slate-400" />
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-slate-900 dark:text-white">{app.surname} {app.firstName}</p>
                        <p className="text-[10px] text-slate-500">{app.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded-md">
                      {app.applicationFormNumber || '—'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-400 font-medium">{app.classApplyingFor}</td>
                  <td className="py-3 px-4 text-xs text-slate-600 dark:text-slate-400">{app.sponsorFullName || '—'}</td>
                  <td className="py-3 px-4">
                    <span className={cn("px-2.5 py-1 rounded-full text-[10px] font-bold",
                      app.paymentStatus === 'Paid' ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" :
                      "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                    )}>{app.paymentStatus}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={cn("px-2.5 py-1 rounded-full text-[10px] font-bold", statusColors[app.applicationStatus] || '')}>
                      {app.applicationStatus}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-xs text-slate-500 font-medium">{app.submittedAt}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => setSelectedApp(app)} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg" title="View Details">
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      {app.applicationStatus === 'Pending' && (
                        <>
                          <button onClick={() => handleStatusChange(app.id, 'Approved')} className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg" title="Approve">
                            <CheckCircle className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => handleStatusChange(app.id, 'Rejected')} className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg" title="Reject">
                            <XCircle className="w-3.5 h-3.5" />
                          </button>
                        </>
                      )}
                      <button onClick={() => { deleteAdmissionApplication(app.id); showToast({ title: 'Application deleted', variant: 'info' }); }}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg" title="Delete">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={8} className="py-16 text-center text-slate-400">
                  <GraduationCap className="w-12 h-12 mx-auto mb-3 opacity-20" />
                  <p className="text-sm font-medium">No admission applications found.</p>
                  <p className="text-xs text-slate-400 mt-1">Applications will appear here once students submit the form.</p>
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm" onClick={() => setSelectedApp(null)}>
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 w-full max-w-2xl flex flex-col overflow-hidden max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-800/50">
              <div className="flex items-center gap-3">
                {selectedApp.passportUrl ? (
                  <img src={selectedApp.passportUrl} alt="" className="w-11 h-11 rounded-xl object-cover border-2 border-white dark:border-slate-700 shadow" />
                ) : (
                  <div className="w-11 h-11 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                    <UserCheck className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                )}
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">{selectedApp.surname} {selectedApp.firstName}</h2>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400">{selectedApp.applicationFormNumber}</span>
                    <span className={cn("px-2 py-0.5 rounded-full text-[9px] font-bold", statusColors[selectedApp.applicationStatus] || '')}>
                      {selectedApp.applicationStatus}
                    </span>
                  </div>
                </div>
              </div>
              <button onClick={() => setSelectedApp(null)} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors"><X className="w-5 h-5 text-slate-500" /></button>
            </div>
            <div className="p-6 overflow-y-auto space-y-5">
              {/* Student Personal Info */}
              <Section title="Student Information">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  <DetailRow label="Surname" value={selectedApp.surname} />
                  <DetailRow label="First Name" value={selectedApp.firstName} />
                  <DetailRow label="Middle Name" value={selectedApp.middleName} />
                  <DetailRow label="Gender" value={selectedApp.gender} />
                  <DetailRow label="Date of Birth" value={selectedApp.dateOfBirth} />
                  <DetailRow label="Place of Birth" value={selectedApp.placeOfBirth} />
                  <DetailRow label="LGA" value={selectedApp.lga} />
                  <DetailRow label="State of Origin" value={selectedApp.stateOfOrigin} />
                  <DetailRow label="Nationality" value={selectedApp.nationality} />
                  <DetailRow label="Phone" value={selectedApp.phone} />
                  <DetailRow label="Email" value={selectedApp.email} />
                  <DetailRow label="Marital Status" value={selectedApp.maritalStatus} />
                  <DetailRow label="Class Applying For" value={selectedApp.classApplyingFor} />
                </div>
              </Section>

              {/* Course Choices */}
              <Section title="Course Choices">
                <div className="grid grid-cols-3 gap-4">
                  <DetailRow label="1st Choice" value={selectedApp.firstChoiceCourse} />
                  <DetailRow label="2nd Choice" value={selectedApp.secondChoiceCourse} />
                  <DetailRow label="3rd Choice" value={selectedApp.thirdChoiceCourse} />
                </div>
              </Section>

              {/* Sponsor */}
              <Section title="Sponsor Information">
                <div className="grid grid-cols-2 gap-4">
                  <DetailRow label="Full Name" value={selectedApp.sponsorFullName} />
                  <DetailRow label="Phone" value={selectedApp.sponsorPhone} />
                  <DetailRow label="Address" value={selectedApp.sponsorAddress} />
                </div>
              </Section>

              {/* Next of Kin */}
              <Section title="Next of Kin">
                <div className="grid grid-cols-2 gap-4">
                  <DetailRow label="Name" value={selectedApp.nextOfKinName} />
                  <DetailRow label="Phone" value={selectedApp.nextOfKinPhone} />
                  <DetailRow label="Relationship" value={selectedApp.nextOfKinRelationship} />
                  <DetailRow label="Address" value={selectedApp.nextOfKinAddress} />
                </div>
              </Section>

              {/* Academic History */}
              <Section title="Academic History — First Sitting">
                <div className="grid grid-cols-3 gap-4 mb-3">
                  <DetailRow label="Reg. Number" value={selectedApp.firstSittingRegNumber} />
                  <DetailRow label="Exam Body" value={selectedApp.firstSittingExamBody} />
                  <DetailRow label="Year" value={selectedApp.firstSittingExamYear} />
                </div>
                {selectedApp.firstSittingSubjects && selectedApp.firstSittingSubjects.length > 0 && (
                  <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-3 space-y-1">
                    {selectedApp.firstSittingSubjects.map((sg, i) => (
                      <div key={i} className="flex justify-between text-xs py-1 px-2 rounded hover:bg-slate-100 dark:hover:bg-slate-700">
                        <span className="text-slate-600 dark:text-slate-400">{sg.subject}</span>
                        <span className="font-bold text-slate-900 dark:text-white">{sg.grade}</span>
                      </div>
                    ))}
                  </div>
                )}
              </Section>

              {selectedApp.secondSittingSubjects && selectedApp.secondSittingSubjects.length > 0 && (
                <Section title="Academic History — Second Sitting">
                  <div className="grid grid-cols-3 gap-4 mb-3">
                    <DetailRow label="Reg. Number" value={selectedApp.secondSittingRegNumber} />
                    <DetailRow label="Exam Body" value={selectedApp.secondSittingExamBody} />
                    <DetailRow label="Year" value={selectedApp.secondSittingExamYear} />
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-3 space-y-1">
                    {selectedApp.secondSittingSubjects.map((sg, i) => (
                      <div key={i} className="flex justify-between text-xs py-1 px-2 rounded hover:bg-slate-100 dark:hover:bg-slate-700">
                        <span className="text-slate-600 dark:text-slate-400">{sg.subject}</span>
                        <span className="font-bold text-slate-900 dark:text-white">{sg.grade}</span>
                      </div>
                    ))}
                  </div>
                </Section>
              )}

              {/* Payment */}
              <Section title="Payment">
                <div className="grid grid-cols-3 gap-4">
                  <DetailRow label="Amount" value={`₦${selectedApp.admissionFee.toLocaleString()}`} />
                  <div>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Status</p>
                    <span className={cn("px-2.5 py-1 rounded-full text-[10px] font-bold",
                      selectedApp.paymentStatus === 'Paid' ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                    )}>{selectedApp.paymentStatus}</span>
                  </div>
                  {selectedApp.paymentReference && (
                    <DetailRow label="Reference" value={selectedApp.paymentReference} />
                  )}
                </div>
              </Section>

              {/* Actions */}
              <div className="border-t border-slate-200 dark:border-slate-800 pt-5 flex gap-3">
                {selectedApp.applicationStatus === 'Pending' && (
                  <>
                    <button onClick={() => { handleStatusChange(selectedApp.id, 'Approved'); setSelectedApp({ ...selectedApp, applicationStatus: 'Approved' }); }}
                      className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2">
                      <CheckCircle className="w-4 h-4" /> Approve
                    </button>
                    <button onClick={() => { handleStatusChange(selectedApp.id, 'Rejected'); setSelectedApp(null); }}
                      className="flex-1 py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2">
                      <XCircle className="w-4 h-4" /> Reject
                    </button>
                  </>
                )}
                {selectedApp.applicationStatus === 'Approved' && selectedApp.paymentStatus === 'Paid' && (
                  <button onClick={() => handleAdmit(selectedApp)} disabled={admitting}
                    className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2">
                    <UserCheck className="w-4 h-4" /> {admitting ? 'Admitting...' : 'Admit as Student'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border-t border-slate-200 dark:border-slate-800 pt-4">
      <p className="text-[10px] font-bold text-slate-500 uppercase mb-3 tracking-wider">{title}</p>
      {children}
    </div>
  );
}
