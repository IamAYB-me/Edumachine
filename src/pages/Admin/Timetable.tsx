import React, { useState, useMemo } from 'react';
import { Clock, Calendar, Plus, Trash2, Edit2, X, CheckCircle2, Save } from 'lucide-react';
import { KPICard } from '@/components/ui/KPICard';
import { cn } from '@/utils';
import { useDataStore, TimetableEntry } from '@/store/useDataStore';
import { useSettingsStore } from '@/store/useSettingsStore';
import { useToastStore } from '@/store/useToastStore';
import { useAuthStore } from '@/store/useAuthStore';
import { resolveSchoolProfile, getPortalLevelLabels } from '@/utils/schoolProfile';

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

function generatePeriods(settings: { periodDuration: number; periodsPerDay: number; breakStart: string; breakDuration: number }) {
  const periods: { id: number | string; time: string; label: string; isBreak?: boolean }[] = [];
  let startMinutes = 8 * 60;
  const breakIdx = Math.floor(settings.periodsPerDay / 2);

  for (let i = 0; i < settings.periodsPerDay; i++) {
    if (i === breakIdx) {
      const bs = settings.breakStart;
      const bd = settings.breakDuration;
      const [bm, ba] = bs.match(/(\d+):(\d+)\s*(AM|PM)/i)?.slice(1, 4) || ['10', '40', 'AM'];
      let breakMin = parseInt(bm) * 60 + parseInt(ba);
      if (ba.toUpperCase() === 'PM' && breakMin < 12 * 60) breakMin += 12 * 60;
      if (ba.toUpperCase() === 'AM' && breakMin >= 12 * 60) breakMin -= 12 * 60;
      const breakEnd = breakMin + bd;
      periods.push({ id: 'break', time: `${fmtTime(breakMin)} - ${fmtTime(breakEnd)}`, label: 'Break', isBreak: true });
      startMinutes = breakEnd;
    }
    const endMin = startMinutes + settings.periodDuration;
    periods.push({ id: i + 1, time: `${fmtTime(startMinutes)} - ${fmtTime(endMin)}`, label: `Period ${i + 1}` });
    startMinutes = endMin;
  }
  return periods;
}

function fmtTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  const ampm = h >= 12 ? 'PM' : 'AM';
  const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${String(h12).padStart(2, '0')}:${String(m).padStart(2, '0')} ${ampm}`;
}

export default function AdminTimetable() {
  const { classes, teachers, subjects, timetable, addTimetableEntry, deleteTimetableEntry, schools } = useDataStore();
  const { globalSettings } = useSettingsStore();
  const { user } = useAuthStore();
  const showToast = useToastStore((state) => state.showToast);
  const schoolProfile = resolveSchoolProfile(user, schools);
  const labels = getPortalLevelLabels(schoolProfile.portalLevel ?? 'Secondary');
  const ts = globalSettings.timetableSettings;

  const [selectedClass, setSelectedClass] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [addForm, setAddForm] = useState({ day: 'Monday', periodIndex: 1, subject: '', teacherId: '', room: '' });

  const classList = useMemo(() => classes.map((c) => ({ id: c.id, name: c.name })), [classes]);
  const effectiveClass = selectedClass || (classList.length > 0 ? classList[0].id : '');
  const periods = useMemo(() => generatePeriods(ts), [ts]);

  const classTimetable = useMemo(() => timetable.filter((e) => e.classId === effectiveClass), [timetable, effectiveClass]);

  const getEntry = (day: string, periodIndex: number) =>
    classTimetable.find((e) => e.day === day && e.periodIndex === periodIndex);

  const breakCount = periods.filter((p) => p.isBreak).length;
  const subjectCount = new Set(classTimetable.map((e) => e.subject)).size;
  const teacherCount = new Set(classTimetable.map((e) => e.teacherId)).size;

  const handleAddEntry = (e: React.FormEvent) => {
    e.preventDefault();
    const teacher = teachers.find((t) => t.id === addForm.teacherId);
    addTimetableEntry({
      classId: effectiveClass,
      className: classList.find((c) => c.id === effectiveClass)?.name || '',
      day: addForm.day,
      periodIndex: addForm.periodIndex,
      subject: addForm.subject,
      teacherId: addForm.teacherId,
      teacherName: teacher?.name || '',
      room: addForm.room,
    });
    showToast({ title: 'Period added', variant: 'success' });
    setShowAddModal(false);
    setAddForm({ day: 'Monday', periodIndex: 1, subject: '', teacherId: '', room: '' });
  };

  const handleDeleteEntry = (id: string) => {
    deleteTimetableEntry(id);
    showToast({ title: 'Period removed', variant: 'info' });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Academic Timetable</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Configure and manage class schedules and subject allocations.</p>
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
          <button
            onClick={() => setIsEditing(!isEditing)}
            className={cn(
              "flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all shadow-lg active:scale-95",
              isEditing ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-900/20" : "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-900/20"
            )}
          >
            {isEditing ? <Save className="w-4 h-4" /> : <Edit2 className="w-4 h-4" />}
            {isEditing ? 'Done Editing' : 'Configure Timetable'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <KPICard title={`Active ${labels.structurePlural}`} value={String(classList.length)} icon={Calendar} iconBgClass="bg-blue-50" iconColorClass="text-blue-600" />
        <KPICard title="Avg. Periods/Day" value={String(ts.periodsPerDay)} icon={Clock} iconBgClass="bg-indigo-50" iconColorClass="text-indigo-600" />
        <KPICard title={`${labels.subjectPlural} Scheduled`} value={String(subjectCount)} icon={CheckCircle2} iconBgClass="bg-emerald-50" iconColorClass="text-emerald-600" />
        <KPICard title="Break Slots" value={String(breakCount)} icon={Clock} iconBgClass="bg-amber-50" iconColorClass="text-amber-600" />
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex flex-col sm:flex-row justify-between gap-4">
          <div className="flex items-center gap-4">
            <select value={effectiveClass} onChange={(e) => setSelectedClass(e.target.value)}
              className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20">
              {classList.length === 0 && <option value="">No classes available</option>}
              {classList.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <div className="h-6 w-px bg-slate-200 dark:bg-slate-700"></div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Academic Year {new Date().getFullYear()}</p>
          </div>
          {isEditing && (
            <button onClick={() => setShowAddModal(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-blue-900/20">
              <Plus className="w-4 h-4" />Add Period
            </button>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-slate-50/30 dark:bg-slate-800/10">
                <th className="py-4 px-6 border-b border-r border-slate-100 dark:border-slate-800 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-left w-48">Time Slot</th>
                {days.map((day) => (
                  <th key={day} className="py-4 px-6 border-b border-r border-slate-100 dark:border-slate-800 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">{day}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {periods.map((period) => (
                <tr key={period.id} className={cn(period.isBreak && "bg-slate-50/50 dark:bg-slate-800/20")}>
                  <td className="py-4 px-6 border-r border-slate-100 dark:border-slate-800">
                    <p className="text-xs font-bold text-slate-900 dark:text-white">{period.label}</p>
                    <p className="text-[10px] text-slate-400 font-medium">{period.time}</p>
                  </td>
                  {days.map((day) => {
                    const entry = !period.isBreak ? getEntry(day, period.id as number) : undefined;
                    return (
                      <td key={day} className="py-3 px-3 border-r border-slate-100 dark:border-slate-800 group">
                        {period.isBreak ? (
                          <div className="text-center"><span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest italic">Break</span></div>
                        ) : entry ? (
                          <div className={cn(
                            "p-3 rounded-2xl border transition-all relative",
                            isEditing
                              ? "border-dashed border-blue-200 dark:border-blue-800 bg-blue-50/30 dark:bg-blue-900/10"
                              : "border-transparent bg-slate-50/50 dark:bg-slate-800/40 hover:scale-[1.02] hover:shadow-md"
                          )}>
                            <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{entry.subject}</p>
                            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">{entry.teacherName}</p>
                            {entry.room && <p className="text-[9px] text-slate-400 mt-0.5">{entry.room}</p>}
                            {isEditing && (
                              <button onClick={() => handleDeleteEntry(entry.id)} className="absolute -top-1 -right-1 p-1 bg-rose-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
                                <Trash2 className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        ) : (
                          <div className={cn(
                            "p-3 rounded-2xl border transition-all min-h-[52px]",
                            isEditing
                              ? "border-dashed border-slate-200 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-50/30 cursor-pointer"
                              : "border-transparent"
                          )} onClick={() => {
                            if (isEditing) {
                              setAddForm({ ...addForm, day, periodIndex: period.id as number });
                              setShowAddModal(true);
                            }
                          }}>
                            {isEditing && <p className="text-[10px] text-slate-400 text-center mt-2">+ Add</p>}
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isEditing && (
        <div className="p-6 bg-blue-600 rounded-3xl text-white shadow-xl shadow-blue-900/20 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-md"><Calendar className="w-6 h-6" /></div>
            <div>
              <h3 className="text-lg font-bold">Conflict Detection</h3>
              <p className="text-blue-100 text-sm">The system prevents double-booking teachers across classes in the same period.</p>
            </div>
          </div>
          <button onClick={() => {
            const conflicts: string[] = [];
            for (const day of days) {
              for (let p = 1; p <= ts.periodsPerDay; p++) {
                const entries = classTimetable.filter((e) => e.day === day && e.periodIndex === p);
                const teacherIds = entries.map((e) => e.teacherId).filter(Boolean);
                const dupes = teacherIds.filter((id, i) => teacherIds.indexOf(id) !== i);
                if (dupes.length > 0) conflicts.push(`${day} Period ${p}`);
              }
            }
            showToast(conflicts.length > 0
              ? { title: `${conflicts.length} conflict(s) found`, description: conflicts.join(', '), variant: 'warning' }
              : { title: 'No conflicts detected', description: 'Timetable is clean.', variant: 'success' }
            );
          }} className="w-full sm:w-auto px-8 py-3 bg-white text-blue-600 font-bold rounded-2xl text-sm hover:bg-blue-50 transition-all shadow-lg active:scale-95">
            Run Conflict Check
          </button>
        </div>
      )}

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm" onClick={() => setShowAddModal(false)}>
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 w-full max-w-lg flex flex-col overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Add Period</h2>
              <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors"><X className="w-5 h-5 text-slate-500" /></button>
            </div>
            <form onSubmit={handleAddEntry} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Day</label>
                  <select value={addForm.day} onChange={(e) => setAddForm({ ...addForm, day: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:border-blue-500 dark:text-white">
                    {days.map((d) => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Period</label>
                  <select value={addForm.periodIndex} onChange={(e) => setAddForm({ ...addForm, periodIndex: Number(e.target.value) })}
                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:border-blue-500 dark:text-white">
                    {periods.filter((p) => !p.isBreak).map((p) => <option key={p.id} value={p.id}>{p.label} ({p.time})</option>)}
                  </select>
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">{labels.subjectSingular}</label>
                <select value={addForm.subject} onChange={(e) => setAddForm({ ...addForm, subject: e.target.value })} required
                  className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:border-blue-500 dark:text-white">
                  <option value="">Select {labels.subjectSingular}</option>
                  {subjects.map((s) => <option key={s.id} value={s.name}>{s.name} ({s.code})</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">{labels.teacherSingular}</label>
                <select value={addForm.teacherId} onChange={(e) => setAddForm({ ...addForm, teacherId: e.target.value })} required
                  className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:border-blue-500 dark:text-white">
                  <option value="">Select {labels.teacherSingular}</option>
                  {teachers.map((t) => <option key={t.id} value={t.id}>{t.name} ({t.subject})</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Room (Optional)</label>
                <input type="text" value={addForm.room} onChange={(e) => setAddForm({ ...addForm, room: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:border-blue-500 dark:text-white" />
              </div>
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 px-4 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">Cancel</button>
                <button type="submit" className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-900/20 transition-all">Add Period</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
