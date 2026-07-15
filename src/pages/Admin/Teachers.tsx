import React, { useState } from 'react';
import { Search, Filter, Plus, UserCheck, Edit, Trash2, X, Mail, Phone, Users, CheckCircle, GraduationCap, Award, CreditCard } from 'lucide-react';
import { cn } from '@/utils';
import { useDataStore, Teacher } from '@/store/useDataStore';
import { KPICard } from '@/components/ui/KPICard';
import ExcelImport from '@/components/ui/ExcelImport';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { useAuthStore } from '@/store/useAuthStore';
import { resolveSchoolProfile } from '@/utils/schoolProfile';
import { PrintableIdCardModal } from '@/components/ui/PrintableIdCardModal';

export default function TeachersDirectory() {
  const [searchTerm, setSearchTerm] = useState('');
  const { teachers, addTeacher, updateTeacher, deleteTeacher, schools } = useDataStore();
  const { user } = useAuthStore();

  const stats = {
    total: teachers.length,
    active: teachers.filter(t => t.status === 'Active').length,
    subjects: new Set(teachers.map(t => t.subject)).size,
    avgExp: '8.5 Yrs' // Placeholder for experience
  };

  // Group by subject for chart
  const subjectData = Object.entries(
    teachers.reduce((acc, t) => {
      acc[t.subject] = (acc[t.subject] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  ).map(([name, value]) => ({ name, value }));

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [idCardTeacher, setIdCardTeacher] = useState<Teacher | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    employeeId: '',
    subject: '',
    email: '',
    phone: '',
    status: 'Active' as 'Active' | 'Inactive'
  });

  const filteredTeachers = teachers.filter(teacher => 
    teacher.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    teacher.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    teacher.subject.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenModal = (teacher?: Teacher) => {
    if (teacher) {
      setEditingTeacher(teacher);
      setFormData({
        name: teacher.name,
        employeeId: teacher.employeeId,
        subject: teacher.subject,
        email: teacher.email,
        phone: teacher.phone,
        status: teacher.status
      });
    } else {
      setEditingTeacher(null);
      setFormData({
        name: '',
        employeeId: '',
        subject: '',
        email: '',
        phone: '',
        status: 'Active'
      });
    }
    setIsModalOpen(true);
  };

  const handleBulkImport = (data: any[]) => {
    data.forEach(row => {
      addTeacher({
        name: row.Name || row.name,
        employeeId: (row['Employee ID'] || row.employeeId || '').toString(),
        subject: row.Subject || row.subject,
        email: row.Email || row.email,
        phone: (row.Phone || row.phone || '').toString(),
        status: (row.Status || row.status || 'Active') as 'Active' | 'Inactive'
      });
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingTeacher) {
      updateTeacher(editingTeacher.id, formData);
    } else {
      addTeacher(formData);
    }
    setIsModalOpen(false);
  };

  const schoolProfile = resolveSchoolProfile(user, schools);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Teachers Directory</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Manage academic staff and their profiles.</p>
        </div>
        <div className="flex items-center gap-3">
          <ExcelImport 
            onImport={handleBulkImport} 
            templateName="Teachers"
            expectedKeys={['Name', 'Employee ID', 'Subject', 'Email', 'Phone', 'Status']}
          />
          <button 
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-lg shadow-blue-900/20"
          >
            <Plus className="w-4 h-4" />
            Add Teacher
          </button>
        </div>
      </div>

      {/* Stats Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard 
          title="Total Faculty" 
          value={stats.total.toString()} 
          icon={Users} 
          iconBgClass="bg-blue-50 dark:bg-blue-900/20"
          iconColorClass="text-blue-600 dark:text-blue-400"
        />
        <KPICard 
          title="Active Staff" 
          value={stats.active.toString()} 
          icon={CheckCircle} 
          iconBgClass="bg-emerald-50 dark:bg-emerald-900/20"
          iconColorClass="text-emerald-600 dark:text-emerald-400"
        />
        <KPICard 
          title="Departments" 
          value={stats.subjects.toString()} 
          icon={GraduationCap} 
          iconBgClass="bg-indigo-50 dark:bg-indigo-900/20"
          iconColorClass="text-indigo-600 dark:text-indigo-400"
        />
        <KPICard 
          title="Avg Experience" 
          value={stats.avgExp} 
          icon={Award} 
          iconBgClass="bg-amber-50 dark:bg-amber-900/20"
          iconColorClass="text-amber-600 dark:text-amber-400"
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
                placeholder="Search by name, subject, or ID..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all dark:text-white"
              />
            </div>
            <div className="flex items-center gap-2">
              <button className="flex items-center gap-2 px-3 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                <Filter className="w-4 h-4" />
                Filter
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest bg-slate-50/30 dark:bg-slate-800/10">
                  <th className="py-4 px-6">Teacher Details</th>
                  <th className="py-4 px-6">ID</th>
                  <th className="py-4 px-6">Main Subject</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-slate-100 dark:divide-slate-800">
                {filteredTeachers.map((teacher) => (
                  <tr key={teacher.id} className="hover:bg-blue-50/30 dark:hover:bg-blue-900/10 transition-colors group">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <img 
                            src={`https://ui-avatars.com/api/?name=${teacher.name.replace(' ', '+')}&background=eff6ff&color=2563eb&bold=true`} 
                            alt={teacher.name} 
                            className="w-10 h-10 rounded-xl object-cover border border-slate-100 dark:border-slate-800"
                          />
                          <div className={cn(
                            "absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white dark:border-slate-900",
                            teacher.status === 'Active' ? "bg-emerald-500" : "bg-slate-400"
                          )} />
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white text-sm tracking-tight">{teacher.name}</p>
                          <p className="text-[10px] text-slate-500 font-medium">{teacher.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="font-mono text-[10px] font-bold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
                        {teacher.employeeId}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                        <span className="font-bold text-xs text-slate-700 dark:text-slate-300">{teacher.subject}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className={cn(
                        "inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider",
                        teacher.status === 'Active' 
                          ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800" 
                          : "bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400 border border-rose-100 dark:border-rose-800"
                      )}>
                        {teacher.status}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => setIdCardTeacher(teacher)} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-colors" title="Generate ID Card"><CreditCard className="w-4 h-4" /></button>
                        <button onClick={() => handleOpenModal(teacher)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"><Edit className="w-4 h-4" /></button>
                        <button onClick={() => deleteTeacher(teacher.id)} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
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
                <GraduationCap className="w-4 h-4 text-blue-600" />
                Department Mix
             </h3>
             <div className="h-[200px] relative">
               <ResponsiveContainer width="100%" height="100%">
                 <PieChart>
                   <Pie
                     data={subjectData}
                     cx="50%"
                     cy="50%"
                     innerRadius={60}
                     outerRadius={80}
                     paddingAngle={5}
                     dataKey="value"
                   >
                     {subjectData.map((entry, index) => (
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
               {subjectData.slice(0, 4).map((item, i) => (
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

          <div className="bg-gradient-to-br from-indigo-600 to-violet-700 p-6 rounded-2xl text-white shadow-lg shadow-indigo-900/20">
            <h4 className="font-bold text-sm mb-2 flex items-center gap-2">
              <Award className="w-4 h-4 text-indigo-200" />
              Staff Recognition
            </h4>
            <p className="text-xs text-indigo-100 mb-4 opacity-80">Nominate staff members for the monthly excellence award.</p>
            <button className="w-full py-2.5 bg-white text-indigo-600 rounded-xl text-xs font-bold hover:bg-indigo-50 transition-colors shadow-md">
              View Nominations
            </button>
          </div>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                {editingTeacher ? 'Edit Teacher' : 'Add New Teacher'}
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
                    <label className="text-xs font-bold text-slate-500 uppercase">Employee ID</label>
                    <input 
                      type="text" 
                      required
                      value={formData.employeeId}
                      onChange={(e) => setFormData({...formData, employeeId: e.target.value.toUpperCase()})}
                      className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-500 dark:text-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase">Subject</label>
                    <input 
                      type="text" 
                      required
                      value={formData.subject}
                      onChange={(e) => setFormData({...formData, subject: e.target.value})}
                      className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-500 dark:text-white"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Email</label>
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
                    <label className="text-xs font-bold text-slate-500 uppercase">Phone</label>
                    <input 
                      type="text" 
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
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
                      <option value="Inactive">Inactive</option>
                    </select>
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
                  {editingTeacher ? 'Save Changes' : 'Add Teacher'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <PrintableIdCardModal
        open={Boolean(idCardTeacher)}
        onClose={() => setIdCardTeacher(null)}
        schoolProfile={schoolProfile}
        fullName={idCardTeacher?.name || ''}
        roleLabel="Teacher"
        identifier={idCardTeacher?.employeeId || ''}
        email={idCardTeacher?.email}
        phone={idCardTeacher?.phone}
        secondaryLabel="Subject"
        secondaryValue={idCardTeacher?.subject}
        status={idCardTeacher?.status}
        accentClassName="from-indigo-600 to-violet-600"
      />
    </div>
  );
}
