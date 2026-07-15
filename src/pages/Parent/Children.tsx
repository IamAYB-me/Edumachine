import React, { useEffect, useMemo, useState } from 'react';
import { useDataStore } from '@/store/useDataStore';
import { KPICard } from '@/components/ui/KPICard';
import { GraduationCap, BookOpen, Calendar, Award, User, ChevronRight, X, BadgeCheck, Receipt } from 'lucide-react';
import { cn } from '@/utils';
import { useLocation } from 'react-router-dom';
import { useToastStore } from '@/store/useToastStore';

export default function MyChildren() {
  const { students } = useDataStore();
  const location = useLocation();
  const showToast = useToastStore((state) => state.showToast);
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null);
  const [modalMode, setModalMode] = useState<'profile' | 'records' | null>(null);
  
  // Mock data for children linked to this parent (Sarah Johnson)
  const myChildren = students.slice(0, 2); 
  const selectedChild = useMemo(
    () => myChildren.find((child) => child.id === selectedChildId) ?? null,
    [myChildren, selectedChildId]
  );

  useEffect(() => {
    const state = location.state as { childId?: string } | null;
    if (state?.childId) {
      setSelectedChildId(state.childId);
      setModalMode('profile');
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const handleOpenProfile = (childId: string) => {
    setSelectedChildId(childId);
    setModalMode('profile');
  };

  const handleOpenRecords = (childId: string, childName: string) => {
    setSelectedChildId(childId);
    setModalMode('records');
    showToast({
      title: 'Academic records opened',
      description: `${childName}'s academic performance is ready for review.`,
      variant: 'success',
    });
  };

  const handleCloseModal = () => {
    setSelectedChildId(null);
    setModalMode(null);
  };

  return (
    <div className="space-y-6">
      {selectedChild && modalMode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm" onClick={handleCloseModal}>
          <div
            className="w-full max-w-3xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/50 px-8 py-6 dark:border-slate-800 dark:bg-slate-800/50">
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  {modalMode === 'profile' ? 'Child Profile' : 'Academic Records'}
                </h2>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{selectedChild.name}</p>
              </div>
              <button onClick={handleCloseModal} className="rounded-2xl p-2 hover:bg-slate-100 dark:hover:bg-slate-800">
                <X className="h-5 w-5 text-slate-500" />
              </button>
            </div>

            <div className="space-y-6 p-8">
              {modalMode === 'profile' ? (
                <>
                  <div className="flex flex-col gap-6 md:flex-row md:items-center">
                    <img
                      src={`https://ui-avatars.com/api/?name=${selectedChild.name.replace(' ', '+')}&background=eff6ff&color=2563eb&size=128&bold=true`}
                      alt={selectedChild.name}
                      className="h-24 w-24 rounded-2xl border-4 border-white shadow-sm"
                    />
                    <div className="grid flex-1 grid-cols-1 gap-4 md:grid-cols-2">
                      <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-800/60">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Class</p>
                        <p className="mt-2 text-lg font-bold text-slate-900 dark:text-white">{selectedChild.class}</p>
                      </div>
                      <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-800/60">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Registration No</p>
                        <p className="mt-2 text-lg font-bold text-slate-900 dark:text-white">{selectedChild.regNo}</p>
                      </div>
                      <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-800/60">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Parent</p>
                        <p className="mt-2 text-lg font-bold text-slate-900 dark:text-white">{selectedChild.parentName}</p>
                      </div>
                      <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-800/60">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Status</p>
                        <p className="mt-2 inline-flex items-center gap-2 text-lg font-bold text-emerald-600">
                          <BadgeCheck className="h-4 w-4" />
                          {selectedChild.status}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="rounded-3xl border border-slate-200 p-6 dark:border-slate-800">
                    <h3 className="text-sm font-bold uppercase tracking-widest text-slate-500">Profile Summary</h3>
                    <p className="mt-4 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                      {selectedChild.name} is currently enrolled in {selectedChild.class}. Attendance is stable, academic performance is positive, and the parent can monitor fees, attendance, and progress from this portal.
                    </p>
                  </div>
                </>
              ) : (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <div className="rounded-3xl border border-slate-200 p-5 dark:border-slate-800">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Average Grade</p>
                    <p className="mt-2 text-3xl font-black text-blue-600">A-</p>
                  </div>
                  <div className="rounded-3xl border border-slate-200 p-5 dark:border-slate-800">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Attendance</p>
                    <p className="mt-2 text-3xl font-black text-emerald-600">94%</p>
                  </div>
                  <div className="rounded-3xl border border-slate-200 p-5 dark:border-slate-800">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Fees Balance</p>
                    <p className="mt-2 text-3xl font-black text-rose-600">
                      {selectedChild.id === '4' ? '$120' : '$0'}
                    </p>
                  </div>
                  {[
                    { subject: 'Mathematics', grade: 'A', icon: Award },
                    { subject: 'English', grade: 'A-', icon: BookOpen },
                    { subject: 'Science', grade: 'B+', icon: Receipt },
                  ].map((item) => (
                    <div key={item.subject} className="rounded-3xl bg-slate-50 p-5 dark:bg-slate-800/60">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-bold text-slate-900 dark:text-white">{item.subject}</p>
                        <item.icon className="h-4 w-4 text-slate-400" />
                      </div>
                      <p className="mt-3 text-2xl font-black text-slate-900 dark:text-white">{item.grade}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">My Children</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Manage and track your children's academic progress.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {myChildren.map((child) => (
          <div key={child.id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden group hover:border-blue-200 transition-all">
            <div className="p-6 flex flex-col md:flex-row gap-6">
              <div className="flex flex-col items-center gap-4 text-center">
                <img 
                  src={`https://ui-avatars.com/api/?name=${child.name.replace(' ', '+')}&background=eff6ff&color=2563eb&size=128&bold=true`} 
                  alt={child.name} 
                  className="w-24 h-24 rounded-2xl object-cover border-4 border-white dark:border-slate-800 shadow-sm"
                />
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">{child.name}</h3>
                  <span className="inline-flex items-center px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                    ID: {child.studentId}
                  </span>
                </div>
              </div>

              <div className="flex-1 space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <KPICard 
                    title="Current Class" 
                    value={child.class} 
                    icon={GraduationCap}
                    iconBgClass="bg-indigo-50"
                    iconColorClass="text-indigo-600"
                  />
                  <KPICard 
                    title="Attendance" 
                    value="94%" 
                    icon={Calendar}
                    iconBgClass="bg-emerald-50"
                    iconColorClass="text-emerald-600"
                  />
                  <KPICard 
                    title="Avg. Grade" 
                    value="A-" 
                    icon={Award}
                    iconBgClass="bg-purple-50"
                    iconColorClass="text-purple-600"
                  />
                  <KPICard 
                    title="Subjects" 
                    value="8" 
                    icon={BookOpen}
                    iconBgClass="bg-amber-50"
                    iconColorClass="text-amber-600"
                  />
                </div>

                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => handleOpenProfile(child.id)}
                    className="flex-1 py-2.5 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2"
                  >
                    <User className="w-4 h-4" />
                    View Profile
                  </button>
                  <button
                    onClick={() => handleOpenRecords(child.id, child.name)}
                    className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-blue-900/10 flex items-center justify-center gap-2"
                  >
                    <BookOpen className="w-4 h-4" />
                    Academic Records
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
