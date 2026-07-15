import React, { useState } from 'react';
import { BookOpen, Search, Filter, GraduationCap, Users, Clock, ArrowRight } from 'lucide-react';
import { useDataStore } from '@/store/useDataStore';
import { KPICard } from '@/components/ui/KPICard';
import { useAuthStore } from '@/store/useAuthStore';

export default function TeacherSubjects() {
  const [searchTerm, setSearchTerm] = useState('');
  const { subjects, classes } = useDataStore();
  const user = useAuthStore(state => state.user);

  const isCollege = user?.schoolName.toLowerCase().includes('university') || 
                    user?.schoolName.toLowerCase().includes('college') ||
                    user?.roleLabel.toLowerCase() === 'lecturer';

  const title = isCollege ? 'My Courses' : 'My Subjects';
  const subtitle = isCollege ? 'Manage your academic courses and curriculum.' : 'Manage your assigned subjects and syllabus.';

  const stats = {
    total: subjects.length,
    activeClasses: classes.length,
    totalStudents: classes.reduce((acc, c) => acc + c.studentsCount, 0),
    avgPerformance: '84%'
  };

  const filteredSubjects = subjects.filter(sub => 
    sub.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sub.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{title}</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">{subtitle}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard 
          title={isCollege ? "Total Courses" : "Total Subjects"} 
          value={stats.total.toString()} 
          icon={BookOpen} 
          iconBgClass="bg-blue-50 dark:bg-blue-900/20"
          iconColorClass="text-blue-600 dark:text-blue-400"
        />
        <KPICard 
          title="Active Classes" 
          value={stats.activeClasses.toString()} 
          icon={GraduationCap} 
          iconBgClass="bg-emerald-50 dark:bg-emerald-900/20"
          iconColorClass="text-emerald-600 dark:text-emerald-400"
        />
        <KPICard 
          title="Total Students" 
          value={stats.totalStudents.toString()} 
          icon={Users} 
          iconBgClass="bg-indigo-50 dark:bg-indigo-900/20"
          iconColorClass="text-indigo-600 dark:text-indigo-400"
        />
        <KPICard 
          title="Avg. Performance" 
          value={stats.avgPerformance} 
          icon={Clock} 
          iconBgClass="bg-amber-50 dark:bg-amber-900/20"
          iconColorClass="text-amber-600 dark:text-amber-400"
        />
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row justify-between gap-4 bg-slate-50/50 dark:bg-slate-800/30">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder={`Search ${title.toLowerCase()}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all dark:text-white"
            />
          </div>
          <button className="flex items-center gap-2 px-3 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
            <Filter className="w-4 h-4" />
            Filter
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
          {filteredSubjects.map((subject) => (
            <div key={subject.id} className="group bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-6 border border-slate-100 dark:border-slate-700 hover:border-blue-500/30 hover:shadow-xl hover:shadow-blue-500/5 transition-all">
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-600/20">
                  <BookOpen className="w-6 h-6" />
                </div>
                <span className="px-2 py-1 bg-white dark:bg-slate-700 rounded-lg text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider border border-slate-200 dark:border-slate-600">
                  {subject.code}
                </span>
              </div>
              
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1 group-hover:text-blue-600 transition-colors">
                {subject.name}
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                {subject.type} • {subject.creditHours} Credit Hours
              </p>

              <div className="space-y-3 pt-4 border-t border-slate-200 dark:border-slate-700">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500 dark:text-slate-400">Assigned Classes</span>
                  <span className="font-bold text-slate-900 dark:text-white">4 Classes</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500 dark:text-slate-400">Syllabus Progress</span>
                  <span className="font-bold text-blue-600">65%</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden mt-1">
                  <div className="bg-blue-600 h-full w-[65%]" />
                </div>
              </div>

              <button className="w-full mt-6 flex items-center justify-center gap-2 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all">
                View Syllabus
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>

        {filteredSubjects.length === 0 && (
          <div className="py-20 flex flex-col items-center justify-center text-slate-400 dark:text-slate-600">
            <BookOpen className="w-12 h-12 mb-4 opacity-20" />
            <p className="text-sm font-medium">No {title.toLowerCase()} found matching your search.</p>
          </div>
        )}
      </div>
    </div>
  );
}
