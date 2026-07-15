import React, { useMemo, useState } from 'react';
import { Search, Filter, Plus, Mail, Briefcase, Calendar, Edit, Trash2, X, Users, UserCheck, UserMinus, Star, CreditCard } from 'lucide-react';
import { cn } from '@/utils';
import { useDataStore, Staff } from '@/store/useDataStore';
import ExcelImport from '@/components/ui/ExcelImport';
import { KPICard } from '@/components/ui/KPICard';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { useToastStore } from '@/store/useToastStore';
import { useAuthStore } from '@/store/useAuthStore';
import { resolveSchoolProfile } from '@/utils/schoolProfile';
import { PrintableIdCardModal } from '@/components/ui/PrintableIdCardModal';

export default function HREmployees() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMode, setFilterMode] = useState<'All' | 'Academic' | 'Non-Academic' | 'Active' | 'Inactive'>('All');
  const { staff, addStaff, updateStaff, deleteStaff, schools } = useDataStore();
  const { user } = useAuthStore();
  const showToast = useToastStore((state) => state.showToast);
  
  const stats = {
    total: staff.length,
    active: staff.filter(s => s.status === 'Active').length,
    academic: staff.filter(s => s.category === 'Academic').length,
    nonAcademic: staff.filter(s => s.category === 'Non-Academic').length,
    roles: new Set(staff.map(s => s.role)).size
  };

  // Group by category for chart
  const categoryData = [
    { name: 'Academic', value: stats.academic },
    { name: 'Non-Academic', value: stats.nonAcademic },
  ];

  // Group by role for chart
  const roleData = Object.entries(
    staff.reduce((acc, s) => {
      acc[s.role] = (acc[s.role] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  ).map(([name, value]) => ({ name, value }));

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
  const CATEGORY_COLORS = ['#6366f1', '#f59e0b'];

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
  const [idCardStaff, setIdCardStaff] = useState<Staff | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    category: 'Academic' as 'Academic' | 'Non-Academic',
    email: '',
    phone: '',
    status: 'Active' as 'Active' | 'Inactive',
    joinDate: new Date().toISOString().split('T')[0]
  });

  const handleImport = (data: any[]) => {
    data.forEach(item => {
      addStaff({
        name: item.name || item.Name || '',
        role: item.role || item.Role || 'Staff',
        category: (item.category || item.Category || 'Academic') as 'Academic' | 'Non-Academic',
        email: item.email || item.Email || '',
        phone: item.phone || item.Phone || '',
        status: (item.status || item.Status || 'Active') as 'Active' | 'Inactive',
        joinDate: item.joinDate || item['Join Date'] || new Date().toISOString().split('T')[0]
      });
    });
    showToast({
      title: 'Staff import completed',
      description: `${data.length} employee record(s) imported into HR.`,
      variant: 'success',
    });
  };

  const filteredStaff = useMemo(() => {
    return staff.filter((member) => {
      const matchesSearch =
        member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.email.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesFilter =
        filterMode === 'All' ||
        member.category === filterMode ||
        member.status === filterMode;

      return matchesSearch && matchesFilter;
    });
  }, [filterMode, searchTerm, staff]);

  const handleOpenModal = (member?: Staff) => {
    if (member) {
      setEditingStaff(member);
      setFormData({
        name: member.name,
        role: member.role,
        category: member.category,
        email: member.email,
        phone: member.phone,
        status: member.status,
        joinDate: member.joinDate
      });
    } else {
      setEditingStaff(null);
      setFormData({
        name: '',
        role: '',
        category: 'Academic',
        email: '',
        phone: '',
        status: 'Active',
        joinDate: new Date().toISOString().split('T')[0]
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingStaff) {
      updateStaff(editingStaff.id, formData);
      showToast({
        title: 'Employee updated',
        description: `${formData.name} has been updated successfully.`,
        variant: 'success',
      });
    } else {
      addStaff(formData);
      showToast({
        title: 'Employee added',
        description: `${formData.name} has been added to the staff directory.`,
        variant: 'success',
      });
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string, name: string) => {
    deleteStaff(id);
    showToast({
      title: 'Employee removed',
      description: `${name} has been removed from the HR directory.`,
      variant: 'warning',
    });
  };

  const handleCycleFilter = () => {
    const options: Array<typeof filterMode> = ['All', 'Academic', 'Non-Academic', 'Active', 'Inactive'];
    const nextFilter = options[(options.indexOf(filterMode) + 1) % options.length];
    setFilterMode(nextFilter);
    showToast({
      title: 'Staff filter updated',
      description: `Showing ${nextFilter.toLowerCase()} employees.`,
      variant: 'info',
    });
  };

  const schoolProfile = resolveSchoolProfile(user, schools);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Staff Directory</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Manage staff, teachers, and administrative personnel.</p>
        </div>
        <div className="flex items-center gap-3">
          <ExcelImport 
            onImport={handleImport} 
            templateName="Staff" 
            expectedKeys={['name', 'role', 'email', 'phone', 'status', 'joinDate']} 
          />
          <button 
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-blue-900/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            Add Employee
          </button>
        </div>
      </div>

      {/* Stats Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard 
          title="Total Staff" 
          value={stats.total.toString()} 
          icon={Users} 
          iconBgClass="bg-blue-50 dark:bg-blue-900/20"
          iconColorClass="text-blue-600 dark:text-blue-400"
        />
        <KPICard 
          title="Academic Staff" 
          value={stats.academic.toString()} 
          icon={UserCheck} 
          iconBgClass="bg-indigo-50 dark:bg-indigo-900/20"
          iconColorClass="text-indigo-600 dark:text-indigo-400"
        />
        <KPICard 
          title="Non-Academic" 
          value={stats.nonAcademic.toString()} 
          icon={UserMinus} 
          iconBgClass="bg-amber-50 dark:bg-amber-900/20"
          iconColorClass="text-amber-600 dark:text-amber-400"
        />
        <KPICard 
          title="Active Personnel" 
          value={stats.active.toString()} 
          icon={Star} 
          iconBgClass="bg-emerald-50 dark:bg-emerald-900/20"
          iconColorClass="text-emerald-600 dark:text-emerald-400"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
          {/* Toolbar */}
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row justify-between gap-4 bg-slate-50/50 dark:bg-slate-800/30">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input 
                type="text" 
                placeholder="Search by name, ID, or role..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all dark:text-white"
              />
            </div>
            <div className="flex items-center gap-2">
              <button onClick={handleCycleFilter} className="flex items-center gap-2 px-3 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                <Filter className="w-4 h-4" />
                {filterMode}
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest bg-slate-50/30 dark:bg-slate-800/10">
                  <th className="py-4 px-6">Employee Details</th>
                  <th className="py-4 px-6">Category</th>
                  <th className="py-4 px-6">Designation</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredStaff.map((emp) => (
                  <tr key={emp.id} className="hover:bg-blue-50/30 dark:hover:bg-blue-900/10 transition-colors group">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <img 
                            src={`https://ui-avatars.com/api/?name=${emp.name.replace(' ', '+')}&background=eff6ff&color=2563eb&bold=true`} 
                            alt={emp.name} 
                            className="w-10 h-10 rounded-xl object-cover border border-slate-100 dark:border-slate-800 shadow-sm"
                          />
                          <div className={cn(
                            "absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white dark:border-slate-900",
                            emp.status === 'Active' ? "bg-emerald-500" : "bg-slate-400"
                          )} />
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white text-sm tracking-tight">{emp.name}</p>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono font-bold uppercase tracking-tighter">{emp.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className={cn(
                        "inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider",
                        emp.category === 'Academic' 
                          ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-800" 
                          : "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border border-amber-100 dark:border-amber-800"
                      )}>
                        {emp.category}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 group-hover:text-blue-600 transition-colors">
                          <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                          <span className="font-bold text-xs">{emp.role}</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                           <Mail className="w-3 h-3" />
                           <span className="text-[10px] font-medium">{emp.email}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className={cn(
                        "inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider",
                        emp.status === 'Active' 
                          ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800" 
                          : "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border border-amber-100 dark:border-amber-800"
                      )}>
                        {emp.status}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => setIdCardStaff(emp)} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-colors"><CreditCard className="w-4 h-4" /></button>
                        <button onClick={() => handleOpenModal(emp)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"><Edit className="w-4 h-4" /></button>
                        <button onClick={() => handleDelete(emp.id, emp.name)} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
             <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-6 flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-indigo-600" />
                Staff Category Mix
             </h3>
             <div className="h-[180px] relative">
               <ResponsiveContainer width="100%" height="100%">
                 <PieChart>
                   <Pie
                     data={categoryData}
                     cx="50%"
                     cy="50%"
                     innerRadius={50}
                     outerRadius={70}
                     paddingAngle={8}
                     dataKey="value"
                   >
                     {categoryData.map((entry, index) => (
                       <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
                     ))}
                   </Pie>
                   <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#0f172a', 
                      border: 'none', 
                      borderRadius: '8px', 
                      color: '#fff',
                      fontSize: '12px'
                    }}
                   />
                 </PieChart>
               </ResponsiveContainer>
             </div>
             <div className="mt-4 grid grid-cols-2 gap-2">
               {categoryData.map((item, i) => (
                 <div key={i} className="p-2 bg-slate-50 dark:bg-slate-800/50 rounded-lg text-center">
                   <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">{item.name}</p>
                   <p className="text-lg font-bold text-slate-900 dark:text-white">{item.value}</p>
                 </div>
               ))}
             </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
             <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-6 flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-blue-600" />
                Staff Role Distribution
             </h3>
             <div className="h-[200px] relative">
               <ResponsiveContainer width="100%" height="100%">
                 <PieChart>
                   <Pie
                     data={roleData}
                     cx="50%"
                     cy="50%"
                     innerRadius={60}
                     outerRadius={80}
                     paddingAngle={5}
                     dataKey="value"
                   >
                     {roleData.map((entry, index) => (
                       <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                     ))}
                   </Pie>
                   <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#0f172a', 
                      border: 'none', 
                      borderRadius: '8px', 
                      color: '#fff',
                      fontSize: '12px'
                    }}
                   />
                 </PieChart>
               </ResponsiveContainer>
             </div>
             <div className="mt-6 space-y-2">
               {roleData.slice(0, 4).map((item, i) => (
                 <div key={i} className="flex justify-between items-center p-2 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                   <div className="flex items-center gap-2">
                     <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                     <span className="text-xs font-medium text-slate-600 dark:text-slate-400">{item.name}</span>
                   </div>
                   <span className="text-xs font-bold text-slate-900 dark:text-white">{item.value}</span>
                 </div>
               ))}
             </div>
          </div>

          <div className="bg-gradient-to-br from-emerald-600 to-teal-700 p-6 rounded-2xl text-white shadow-lg shadow-emerald-900/20">
            <h4 className="font-bold text-sm mb-2 flex items-center gap-2">
              <Star className="w-4 h-4 text-emerald-200" />
              Employee Wellness
            </h4>
            <p className="text-xs text-emerald-100 mb-4 opacity-80">Check current staff satisfaction and wellness program status.</p>
            <button
              onClick={() =>
                showToast({
                  title: 'Wellness dashboard ready',
                  description: `${stats.active} active staff members are included in the current wellness snapshot.`,
                  variant: 'info',
                })
              }
              className="w-full py-2.5 bg-white text-emerald-600 rounded-xl text-xs font-bold hover:bg-emerald-50 transition-colors shadow-md"
            >
              View Dashboard
            </button>
          </div>
        </div>
      </div>

      {/* CRUD Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                {editingStaff ? 'Edit Employee' : 'Add New Employee'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Full Name</label>
                  <input 
                    type="text" 
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-500 dark:text-white"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase">Role</label>
                    <input 
                      type="text" 
                      required
                      value={formData.role}
                      onChange={(e) => setFormData({...formData, role: e.target.value})}
                      className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-500 dark:text-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase">Category</label>
                    <select 
                      value={formData.category}
                      onChange={(e) => setFormData({...formData, category: e.target.value as any})}
                      className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-500 dark:text-white"
                    >
                      <option value="Academic">Academic</option>
                      <option value="Non-Academic">Non-Academic</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Email Address</label>
                  <input 
                    type="email" 
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-500 dark:text-white"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
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
                    <label className="text-xs font-bold text-slate-500 uppercase">Join Date</label>
                    <input 
                      type="date" 
                      required
                      value={formData.joinDate}
                      onChange={(e) => setFormData({...formData, joinDate: e.target.value})}
                      className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-500 dark:text-white"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Status</label>
                  <select 
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value as 'Active' | 'Inactive'})}
                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-500 dark:text-white"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
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
                  {editingStaff ? 'Save Changes' : 'Add Employee'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <PrintableIdCardModal
        open={Boolean(idCardStaff)}
        onClose={() => setIdCardStaff(null)}
        schoolProfile={schoolProfile}
        fullName={idCardStaff?.name || ''}
        roleLabel="Staff"
        identifier={idCardStaff?.id || ''}
        email={idCardStaff?.email}
        phone={idCardStaff?.phone}
        secondaryLabel="Role"
        secondaryValue={idCardStaff?.role}
        status={idCardStaff?.status}
        accentClassName="from-emerald-600 to-teal-600"
      />
    </div>
  );
}
