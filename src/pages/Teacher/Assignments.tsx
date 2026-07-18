import React, { useState } from 'react';
import { Plus, Search, FileText, Calendar, Users, Clock, Filter, Award, MoreVertical, Edit, Trash2, X } from 'lucide-react';
import { cn } from '@/utils';
import { KPICard } from '@/components/ui/KPICard';
import { useToastStore } from '@/store/useToastStore';

const mockAssignments = [
  { id: 'ASG-001', title: 'Binary Trees Implementation', course: 'Mathematics', class: 'Grade 10-A', dueDate: '2026-07-15', submissions: 25, totalStudents: 32, status: 'Active', priority: 'High' },
  { id: 'ASG-002', title: 'Calculus Principles Quiz', course: 'Further Math', class: 'Grade 12-Science', dueDate: '2026-07-12', submissions: 30, totalStudents: 30, status: 'Grading', priority: 'Medium' },
  { id: 'ASG-003', title: 'Geometry Project', course: 'Basic Math', class: 'Grade 8-B', dueDate: '2026-07-20', submissions: 5, totalStudents: 28, status: 'Active', priority: 'Low' },
  { id: 'ASG-004', title: 'Statistical Analysis Report', course: 'Mathematics', class: 'Grade 11-A', dueDate: '2026-07-05', submissions: 22, totalStudents: 22, status: 'Completed', priority: 'High' },
];

export default function TeacherAssignments() {
  const [searchTerm, setSearchTerm] = useState('');
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const showToast = useToastStore((state) => state.showToast);
  const [assignments, setAssignments] = useState(mockAssignments);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAssignmentId, setEditingAssignmentId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    course: 'Mathematics',
    class: 'Grade 10-A',
    dueDate: new Date().toISOString().split('T')[0],
    totalStudents: 30,
    priority: 'Medium',
    status: 'Active',
  });

  const stats = {
    total: assignments.length,
    active: assignments.filter(a => a.status === 'Active').length,
    pending: assignments.filter(a => a.status === 'Grading').length,
    submissionRate: '82%'
  };

  const filteredAssignments = assignments.filter((assignment) =>
    assignment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    assignment.class.toLowerCase().includes(searchTerm.toLowerCase()) ||
    assignment.course.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenModal = (assignment?: typeof mockAssignments[number]) => {
    if (assignment) {
      setEditingAssignmentId(assignment.id);
      setFormData({
        title: assignment.title,
        course: assignment.course,
        class: assignment.class,
        dueDate: assignment.dueDate,
        totalStudents: assignment.totalStudents,
        priority: assignment.priority,
        status: assignment.status,
      });
    } else {
      setEditingAssignmentId(null);
      setFormData({
        title: '',
        course: 'Mathematics',
        class: 'Grade 10-A',
        dueDate: new Date().toISOString().split('T')[0],
        totalStudents: 30,
        priority: 'Medium',
        status: 'Active',
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingAssignmentId) {
      setAssignments((current) =>
        current.map((assignment) =>
          assignment.id === editingAssignmentId ? { ...assignment, ...formData } : assignment
        )
      );
      showToast({
        title: 'Assignment updated',
        description: `${formData.title} has been updated successfully.`,
        variant: 'success',
      });
    } else {
      setAssignments((current) => [
        {
          id: `ASG-${Math.floor(100 + Math.random() * 900)}`,
          submissions: 0,
          ...formData,
        },
        ...current,
      ]);
      showToast({
        title: 'Assignment created',
        description: `${formData.title} is now live for ${formData.class}.`,
        variant: 'success',
      });
    }

    setIsModalOpen(false);
  };

  const handleDelete = (id: string, title: string) => {
    setAssignments((current) => current.filter((assignment) => assignment.id !== id));
    showToast({
      title: 'Assignment removed',
      description: `${title} has been deleted.`,
      variant: 'warning',
    });
  };

  return (
    <div className="space-y-6">
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900">
            <div className="border-b border-slate-100 bg-slate-50/50 px-8 py-6 dark:border-slate-800 dark:bg-slate-800/50 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  {editingAssignmentId ? 'Edit Assignment' : 'Create Assignment'}
                </h2>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Set the class, subject, deadline, and priority for the assignment.</p>
              </div>
              <button type="button" onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-500">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4 p-8">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Assignment Title</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition-all focus:border-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Course</label>
                  <input
                    type="text"
                    value={formData.course}
                    onChange={(e) => setFormData({ ...formData, course: e.target.value })}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition-all focus:border-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Class</label>
                  <input
                    type="text"
                    value={formData.class}
                    onChange={(e) => setFormData({ ...formData, class: e.target.value })}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition-all focus:border-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Due Date</label>
                  <input
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition-all focus:border-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Total Students</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.totalStudents}
                    onChange={(e) => setFormData({ ...formData, totalStudents: Number(e.target.value) })}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition-all focus:border-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Priority</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition-all focus:border-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  >
                    <option>High</option>
                    <option>Medium</option>
                    <option>Low</option>
                  </select>
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition-all focus:border-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                >
                  <option>Active</option>
                  <option>Grading</option>
                  <option>Completed</option>
                </select>
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 rounded-2xl border border-slate-200 px-6 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800">
                  Cancel
                </button>
                <button type="submit" className="flex-1 rounded-2xl bg-blue-600 px-6 py-3 text-sm font-bold text-white hover:bg-blue-700">
                  {editingAssignmentId ? 'Update Assignment' : 'Create Assignment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Assignments Management</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Create, track, and grade student coursework.</p>
        </div>
        <button onClick={() => handleOpenModal()} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-blue-900/20 transition-all">
          <Plus className="w-4 h-4" />
          Create Assignment
        </button>
      </div>

      {/* Stats Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard 
          title="Total Assignments" 
          value={stats.total.toString()} 
          icon={FileText} 
          iconBgClass="bg-blue-50 dark:bg-blue-900/20"
          iconColorClass="text-blue-600 dark:text-blue-400"
        />
        <KPICard 
          title="Active Tracks" 
          value={stats.active.toString()} 
          icon={Clock} 
          iconBgClass="bg-emerald-50 dark:bg-emerald-900/20"
          iconColorClass="text-emerald-600 dark:text-emerald-400"
        />
        <KPICard 
          title="Pending Grading" 
          value={stats.pending.toString()} 
          icon={Award} 
          iconBgClass="bg-amber-50 dark:bg-amber-900/20"
          iconColorClass="text-amber-600 dark:text-amber-400"
        />
        <KPICard 
          title="Avg. Submission" 
          value={stats.submissionRate} 
          icon={Users} 
          iconBgClass="bg-indigo-50 dark:bg-indigo-900/20"
          iconColorClass="text-indigo-600 dark:text-indigo-400"
        />
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex-1 flex flex-col overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row justify-between gap-4 bg-slate-50/50 dark:bg-slate-800/30">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search assignments by title or class..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:border-blue-500 transition-all dark:text-white"
            />
          </div>
          <button className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
            <Filter className="w-4 h-4" />
            Filter
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest bg-slate-50/50 dark:bg-slate-800/30">
                <th className="py-4 px-6">Assignment Details</th>
                <th className="py-4 px-6">Class & Subject</th>
                <th className="py-4 px-6">Due Date</th>
                <th className="py-4 px-6">Submission Status</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredAssignments.map((asg) => (
                <tr key={asg.id} className="hover:bg-blue-50/30 dark:hover:bg-blue-900/10 transition-colors group">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white text-sm tracking-tight">{asg.title}</p>
                        <p className="text-[10px] text-slate-500 font-mono font-bold uppercase">{asg.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="space-y-1">
                      <p className="font-bold text-slate-700 dark:text-slate-300 text-sm tracking-tight">{asg.class}</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{asg.course}</p>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2 text-slate-500 font-bold text-[11px] uppercase tracking-wider">
                      <Calendar className="w-3.5 h-3.5 opacity-50" />
                      {asg.dueDate}
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="space-y-2 w-32">
                      <div className="flex justify-between text-[10px] font-bold">
                        <span className="text-slate-500">{asg.submissions}/{asg.totalStudents}</span>
                        <span className="text-blue-600 dark:text-blue-400">{Math.round((asg.submissions/asg.totalStudents)*100)}%</span>
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                        <div 
                          className={cn(
                            "h-full rounded-full transition-all",
                            (asg.submissions/asg.totalStudents) >= 0.8 ? "bg-emerald-500" : "bg-blue-500"
                          )} 
                          style={{ width: `${(asg.submissions/asg.totalStudents)*100}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className={cn(
                      "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border",
                      asg.status === 'Active' ? "bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-900/30 dark:border-emerald-800" : 
                      asg.status === 'Grading' ? "bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-900/30 dark:border-amber-800" : 
                      "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-700 dark:border-slate-600"
                    )}>
                      {asg.status}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                       <button onClick={() => handleOpenModal(asg)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg"><Edit className="w-4 h-4" /></button>
                       <button onClick={() => handleDelete(asg.id, asg.title)} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                       <div className="relative">
                         <button onClick={() => setOpenMenuId(openMenuId === asg.id ? null : asg.id)} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"><MoreVertical className="w-4 h-4" /></button>
                         {openMenuId === asg.id && (
                           <div className="absolute right-0 top-full mt-1 z-20 w-40 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl py-1">
                             <button onClick={() => { setOpenMenuId(null); showToast({ title: 'View Details', description: `Opening details for ${asg.title}.`, variant: 'info' }); }} className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700">View Details</button>
                             <button onClick={() => { setOpenMenuId(null); setAssignments(current => current.map(a => a.id === asg.id ? { ...a, status: 'Completed' } : a)); showToast({ title: 'Assignment closed', description: `${asg.title} has been marked as completed.`, variant: 'success' }); }} className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700">Close</button>
                           </div>
                         )}
                       </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
