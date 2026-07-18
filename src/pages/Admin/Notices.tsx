import React, { useState } from 'react';
import { Bell, Plus, Search, Calendar, Megaphone, Trash2, Edit, X, User } from 'lucide-react';
import { cn } from '@/utils';
import { KPICard } from '@/components/ui/KPICard';

interface Notice {
  id: string;
  title: string;
  content: string;
  date: string;
  targetAudience: 'All' | 'Students' | 'Teachers' | 'Parents';
  priority: 'High' | 'Medium' | 'Low';
  author: string;
}

const INITIAL_NOTICES: Notice[] = [
  { id: '1', title: 'Summer Vacation Announcement', content: 'School will remain closed from July 15th to August 20th for summer break.', date: '2026-07-05', targetAudience: 'All', priority: 'High', author: 'Admin' },
  { id: '2', title: 'Parent-Teacher Meeting', content: 'PTM for Grade 10 will be held on Saturday morning at 10 AM.', date: '2026-07-06', targetAudience: 'Parents', priority: 'Medium', author: 'Principal' },
  { id: '3', title: 'New Science Lab Equipment', content: 'New lab equipment has arrived. Teachers please check the inventory.', date: '2026-07-07', targetAudience: 'Teachers', priority: 'Low', author: 'Dept Head' },
];

export default function AdminNoticeBoard() {
  const [notices, setNotices] = useState<Notice[]>(INITIAL_NOTICES);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNotice, setEditingNotice] = useState<Notice | null>(null);
  
  const [formData, setFormData] = useState<Partial<Notice>>({
    title: '',
    content: '',
    targetAudience: 'All',
    priority: 'Medium',
    author: 'Admin'
  });

  const filteredNotices = notices.filter(n => 
    n.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    n.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    total: notices.length,
    highPriority: notices.filter(n => n.priority === 'High').length,
    today: notices.filter(n => n.date === new Date().toISOString().split('T')[0]).length,
    audience: new Set(notices.map(n => n.targetAudience)).size
  };

  const handleOpenModal = (notice?: Notice) => {
    if (notice) {
      setEditingNotice(notice);
      setFormData(notice);
    } else {
      setEditingNotice(null);
      setFormData({
        title: '',
        content: '',
        targetAudience: 'All',
        priority: 'Medium',
        author: 'Admin'
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingNotice) {
      setNotices(notices.map(n => n.id === editingNotice.id ? { ...n, ...formData as Notice } : n));
    } else {
      const newNotice: Notice = {
        ...formData as Notice,
        id: Math.random().toString(36).substring(2, 11),
        date: new Date().toISOString().split('T')[0],
      };
      setNotices([newNotice, ...notices]);
    }
    setIsModalOpen(false);
  };

  const deleteNotice = (id: string) => {
    if (confirm('Are you sure you want to delete this notice?')) {
      setNotices(notices.filter(n => n.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Notice Board</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Broadcast announcements to the school community.</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-lg shadow-blue-900/20"
        >
          <Plus className="w-4 h-4" />
          Create Notice
        </button>
      </div>

      {/* Stats Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard 
          title="Total Notices" 
          value={stats.total.toString()} 
          icon={Bell} 
          iconBgClass="bg-blue-50 dark:bg-blue-900/20"
          iconColorClass="text-blue-600 dark:text-blue-400"
        />
        <KPICard 
          title="High Priority" 
          value={stats.highPriority.toString()} 
          icon={Megaphone} 
          iconBgClass="bg-rose-50 dark:bg-rose-900/20"
          iconColorClass="text-rose-600 dark:text-rose-400"
        />
        <KPICard 
          title="Posted Today" 
          value={stats.today.toString()} 
          icon={Calendar} 
          iconBgClass="bg-emerald-50 dark:bg-emerald-900/20"
          iconColorClass="text-emerald-600 dark:text-emerald-400"
        />
        <KPICard 
          title="Target Groups" 
          value={stats.audience.toString()} 
          icon={User} 
          iconBgClass="bg-indigo-50 dark:bg-indigo-900/20"
          iconColorClass="text-indigo-600 dark:text-indigo-400"
        />
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row justify-between gap-4 bg-slate-50/50 dark:bg-slate-800/30">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search notices..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:border-blue-500 transition-all dark:text-white"
            />
          </div>
        </div>

        {/* Notices Grid */}
        <div className="p-6 grid grid-cols-1 gap-4">
          {filteredNotices.map((notice) => (
            <div key={notice.id} className="bg-white dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 hover:border-blue-200 dark:hover:border-blue-900/50 transition-all group">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "p-2 rounded-lg",
                    notice.priority === 'High' ? "bg-rose-50 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400" :
                    notice.priority === 'Medium' ? "bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400" :
                    "bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
                  )}>
                    <Megaphone className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors">{notice.title}</h3>
                    <div className="flex items-center gap-4 mt-1">
                       <span className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                         <Calendar className="w-3 h-3" /> {notice.date}
                       </span>
                       <span className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                         <User className="w-3 h-3" /> {notice.author}
                       </span>
                       <span className={cn(
                         "px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider",
                         "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300"
                       )}>
                         For: {notice.targetAudience}
                       </span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => handleOpenModal(notice)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg"><Edit className="w-4 h-4" /></button>
                  <button onClick={() => deleteNotice(notice.id)} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed pl-12">
                {notice.content}
              </p>
            </div>
          ))}
          {filteredNotices.length === 0 && (
            <div className="py-20 flex flex-col items-center justify-center text-slate-400 dark:text-slate-600">
              <Bell className="w-12 h-12 mb-4 opacity-20" />
              <p className="text-sm font-medium">No notices found.</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 w-full max-w-md flex flex-col overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                {editingNotice ? 'Edit Notice' : 'Create New Notice'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Notice Title</label>
                  <input 
                    type="text" required value={formData.title} 
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-500 dark:text-white" 
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase">Target Audience</label>
                    <select 
                      value={formData.targetAudience} 
                      onChange={(e) => setFormData({...formData, targetAudience: e.target.value as any})}
                      className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-500 dark:text-white"
                    >
                      <option value="All">All</option>
                      <option value="Students">Students</option>
                      <option value="Teachers">Teachers</option>
                      <option value="Parents">Parents</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase">Priority</label>
                    <select 
                      value={formData.priority} 
                      onChange={(e) => setFormData({...formData, priority: e.target.value as any})}
                      className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-500 dark:text-white"
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Content</label>
                  <textarea 
                    rows={4} required value={formData.content} 
                    onChange={(e) => setFormData({...formData, content: e.target.value})}
                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-500 dark:text-white resize-none"
                  />
                </div>
              </div>
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">Cancel</button>
                <button type="submit" className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-900/20 transition-all">{editingNotice ? 'Update Notice' : 'Post Notice'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
