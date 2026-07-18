import { useMemo, useState } from 'react';
import { Search, Filter, Plus, Users, UserCheck, ShieldAlert, ChevronRight, Mail, Download, Book, TrendingUp, X } from 'lucide-react';
import { cn } from '@/utils';
import { KPICard } from '@/components/ui/KPICard';
import { useDataStore } from '@/store/useDataStore';
import { useToastStore } from '@/store/useToastStore';
import { downloadTextFile } from '@/utils/fileHelpers';

export default function LibraryMembers() {
  const { students } = useDataStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [memberTypeFilter, setMemberTypeFilter] = useState<'All Members' | 'Student' | 'Staff'>('All Members');
  const [showModal, setShowModal] = useState(false);
  const [manualMembers, setManualMembers] = useState<
    Array<{
      name: string;
      regNo: string;
      memberType: 'Student' | 'Staff';
      booksIssued: number;
      joinDate: string;
      status: 'Active' | 'Blocked';
    }>
  >([]);
  const [formData, setFormData] = useState({
    name: '',
    regNo: '',
    memberType: 'Student' as 'Student' | 'Staff',
    booksIssued: 0,
    joinDate: new Date().toISOString().split('T')[0],
    status: 'Active' as 'Active' | 'Blocked',
  });
  const showToast = useToastStore((state) => state.showToast);

  const baseMembers = useMemo(
    () =>
      students.slice(0, 15).map((student, index) => ({
        ...student,
        memberType: 'Student' as const,
        booksIssued: index % 5,
        joinDate: '2026-01-15',
        status: index % 8 === 0 ? ('Blocked' as const) : ('Active' as const),
      })),
    [students]
  );

  const members = [...manualMembers, ...baseMembers];

  const filteredMembers = members.filter((member) => {
    const matchesSearch =
      member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.regNo.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = memberTypeFilter === 'All Members' || member.memberType === memberTypeFilter;

    return matchesSearch && matchesType;
  });

  const cycleMemberType = () => {
    setMemberTypeFilter((current) => {
      const order: Array<'All Members' | 'Student' | 'Staff'> = ['All Members', 'Student', 'Staff'];
      const nextValue = order[(order.indexOf(current) + 1) % order.length];

      showToast({
        title: 'Member filter updated',
        description: `Showing ${nextValue.toLowerCase()}.`,
        variant: 'info',
      });

      return nextValue;
    });
  };

  const handleExportList = () => {
    if (filteredMembers.length === 0) {
      showToast({
        title: 'No members to export',
        description: 'Adjust the current search or member filter and try again.',
        variant: 'warning',
      });
      return;
    }

    const content = [
      'EduPlatform Library Members Export',
      `Generated: ${new Date().toLocaleString()}`,
      `Filter: ${memberTypeFilter}`,
      '',
      ...filteredMembers.map((member) =>
        [
          `Name: ${member.name}`,
          `Reg No: ${member.regNo}`,
          `Type: ${member.memberType}`,
          `Books Issued: ${member.booksIssued}`,
          `Join Date: ${member.joinDate}`,
          `Status: ${member.status}`,
        ].join('\n')
      ),
    ].join('\n\n');

    downloadTextFile('library-members.txt', content);
    showToast({
      title: 'Member list exported',
      description: `${filteredMembers.length} library members were exported successfully.`,
      variant: 'success',
    });
  };

  const handleAddMember = () => {
    if (!formData.name.trim() || !formData.regNo.trim()) {
      showToast({
        title: 'Member details required',
        description: 'Enter both member name and member ID before saving.',
        variant: 'warning',
      });
      return;
    }

    setManualMembers((current) => [formData, ...current]);
    setShowModal(false);
    setFormData({
      name: '',
      regNo: '',
      memberType: 'Student',
      booksIssued: 0,
      joinDate: new Date().toISOString().split('T')[0],
      status: 'Active',
    });
    showToast({
      title: 'Member added',
      description: `${formData.name} has been added to the library membership list.`,
      variant: 'success',
    });
  };

  const handleMemberAction = (memberName: string, action: 'mail' | 'details') => {
    showToast({
      title: action === 'mail' ? 'Member message ready' : `${memberName} selected`,
      description:
        action === 'mail'
          ? `A membership notice is ready to send to ${memberName}.`
          : `${memberName}'s membership record is ready for review.`,
      variant: 'info',
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Library Members</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Manage library memberships for students and staff.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleExportList}
            className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 transition-all"
          >
            <Download className="w-4 h-4" />
            Export List
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-blue-900/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            Add Member
          </button>
        </div>
      </div>

      {/* Stats Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard 
          title="Total Members" 
          value={String(members.length)} 
          icon={Users} 
          iconBgClass="bg-blue-50 dark:bg-blue-900/20"
          iconColorClass="text-blue-600 dark:text-blue-400"
        />
        <KPICard 
          title="Active Users" 
          value={String(members.filter(m => m.status === 'Active').length)} 
          icon={UserCheck} 
          iconBgClass="bg-emerald-50 dark:bg-emerald-900/20"
          iconColorClass="text-emerald-600 dark:text-emerald-400"
        />
        <KPICard 
          title="Blocked" 
          value={String(members.filter(m => m.status === 'Blocked').length)} 
          icon={ShieldAlert} 
          iconBgClass="bg-rose-50 dark:bg-rose-900/20"
          iconColorClass="text-rose-600 dark:text-rose-400"
        />
        <KPICard 
          title="New This Month" 
          value={String(members.filter(m => m.joinDate.startsWith(new Date().toISOString().slice(0, 7))).length)} 
          icon={TrendingUp} 
          iconBgClass="bg-indigo-50 dark:bg-indigo-900/20"
          iconColorClass="text-indigo-600 dark:text-indigo-400"
        />
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
        {/* Toolbar */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row justify-between gap-4 bg-slate-50/50 dark:bg-slate-800/50">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search member or ID..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:border-blue-500 transition-all dark:text-white"
            />
          </div>
          <button
            onClick={cycleMemberType}
            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 transition-all"
          >
            <Filter className="w-4 h-4" />
            {memberTypeFilter}
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                <th className="py-4 px-6">Member Name</th>
                <th className="py-4 px-6">Type</th>
                <th className="py-4 px-6">Books Issued</th>
                <th className="py-4 px-6">Join Date</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-slate-100 dark:divide-slate-800">
              {filteredMembers.map((member, i) => (
                <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <img 
                        src={`https://ui-avatars.com/api/?name=${member.name.replace(' ', '+')}&background=eff6ff&color=2563eb&bold=true`} 
                        className="w-8 h-8 rounded-lg"
                        alt={member.name}
                      />
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white">{member.name}</p>
                        <p className="text-[10px] font-mono font-bold text-slate-400">{member.regNo || '—'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6 font-medium text-slate-600 dark:text-slate-400">{member.memberType}</td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2">
                      <Book className="w-3.5 h-3.5 text-slate-400" />
                      <span className="font-bold text-slate-900 dark:text-white">{member.booksIssued}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-xs text-slate-500 font-medium">{member.joinDate}</td>
                  <td className="py-4 px-6">
                    <span className={cn(
                      "inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider",
                      member.status === 'Active' ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" : "bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400"
                    )}>
                      {member.status}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => handleMemberAction(member.name, 'mail')}
                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-all"
                      >
                        <Mail className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleMemberAction(member.name, 'details')}
                        className="p-2 text-slate-300 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-all"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredMembers.length === 0 ? (
          <div className="px-6 py-10 text-center text-sm text-slate-500 dark:text-slate-400">
            No members match the current search and member type filter.
          </div>
        ) : null}
      </div>

      {showModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4" onClick={() => setShowModal(false)}>
          <div
            className="w-full max-w-2xl overflow-hidden rounded-3xl bg-white shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Add Member</h2>
                <p className="text-sm text-slate-500">Register a new student or staff member for library access.</p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="rounded-full p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="max-h-[70vh] space-y-5 overflow-y-auto px-6 py-6">
              <div className="grid gap-5 md:grid-cols-2">
                <label className="space-y-2 text-sm font-medium text-slate-700">
                  <span>Member Name</span>
                  <input
                    value={formData.name}
                    onChange={(event) => setFormData((current) => ({ ...current, name: event.target.value }))}
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-blue-500"
                    placeholder="Full name"
                  />
                </label>
                <label className="space-y-2 text-sm font-medium text-slate-700">
                  <span>Reg No</span>
                  <input
                    value={formData.regNo}
                    onChange={(event) => setFormData((current) => ({ ...current, regNo: event.target.value }))}
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-blue-500"
                    placeholder="e.g. STU-101"
                  />
                </label>
                <label className="space-y-2 text-sm font-medium text-slate-700">
                  <span>Member Type</span>
                  <select
                    value={formData.memberType}
                    onChange={(event) =>
                      setFormData((current) => ({ ...current, memberType: event.target.value as 'Student' | 'Staff' }))
                    }
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-blue-500"
                  >
                    <option>Student</option>
                    <option>Staff</option>
                  </select>
                </label>
                <label className="space-y-2 text-sm font-medium text-slate-700">
                  <span>Status</span>
                  <select
                    value={formData.status}
                    onChange={(event) =>
                      setFormData((current) => ({ ...current, status: event.target.value as 'Active' | 'Blocked' }))
                    }
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-blue-500"
                  >
                    <option>Active</option>
                    <option>Blocked</option>
                  </select>
                </label>
                <label className="space-y-2 text-sm font-medium text-slate-700">
                  <span>Books Issued</span>
                  <input
                    type="number"
                    min={0}
                    value={formData.booksIssued}
                    onChange={(event) => setFormData((current) => ({ ...current, booksIssued: Number(event.target.value) || 0 }))}
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-blue-500"
                  />
                </label>
                <label className="space-y-2 text-sm font-medium text-slate-700">
                  <span>Join Date</span>
                  <input
                    type="date"
                    value={formData.joinDate}
                    onChange={(event) => setFormData((current) => ({ ...current, joinDate: event.target.value }))}
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-blue-500"
                  />
                </label>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 border-t border-slate-200 px-6 py-4">
              <button
                onClick={() => setShowModal(false)}
                className="rounded-2xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleAddMember}
                className="rounded-2xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                Save Member
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
