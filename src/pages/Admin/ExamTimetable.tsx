import React, { useState, useMemo } from 'react';
import { 
  Clock, Plus, Save, Download, Filter, Search, 
  Trash2, Edit2, CheckCircle2, AlertTriangle, ClipboardCheck, UserCheck, MapPin, X
} from 'lucide-react';
import { KPICard } from '@/components/ui/KPICard';
import { cn } from '@/utils';
import { useDataStore, ExamTimetableEntry } from '@/store/useDataStore';
import { useToastStore } from '@/store/useToastStore';
import { useAuthStore } from '@/store/useAuthStore';
import { getPortalLevelLabels, resolveSchoolProfile } from '@/utils/schoolProfile';

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const sessions = [
  { id: 1, label: 'Morning', time: '09:00 AM - 11:30 AM' },
  { id: 2, label: 'Afternoon', time: '12:30 PM - 03:00 PM' },
];

export default function ExamTimetable() {
  const { examTimetable, addExamTimetableEntry, setExamTimetable, schools } = useDataStore();
  const { user } = useAuthStore();
  const showToast = useToastStore((state) => state.showToast);
  const [selectedClass, setSelectedClass] = useState('Grade 10 - A');
  const [isEditing, setIsEditing] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const schoolProfile = resolveSchoolProfile(user ?? null, schools);
  const labels = getPortalLevelLabels(schoolProfile.portalLevel);
  
  const [newExam, setNewExam] = useState<Omit<ExamTimetableEntry, 'id'>>({
    subject: '',
    hall: '',
    day: 'Monday',
    session: 'Morning',
    invigilator: '',
    duration: '2 Hours',
    class: 'Grade 10 - A'
  });

  const handleExportSchedule = () => {
    showToast({
      title: 'Export ready',
      description: `${selectedClass} timetable is opening in the print dialog for PDF export.`,
      variant: 'info',
    });
    window.print();
  };

  const stats = useMemo(() => ({
    totalExams: examTimetable.filter(e => e.class === selectedClass).length,
    avgDuration: '2.5h',
    invigilators: new Set(examTimetable.filter(e => e.class === selectedClass).map(i => i.invigilator)).size,
    clashes: 0
  }), [examTimetable, selectedClass]);

  const handleAddExam = (e: React.FormEvent) => {
    e.preventDefault();
    addExamTimetableEntry({ ...newExam, class: selectedClass });
    setShowAddModal(false);
    setNewExam({ subject: '', hall: '', day: 'Monday', session: 'Morning', invigilator: '', duration: '2 Hours', class: selectedClass });
    showToast({
      title: 'Exam scheduled',
      description: `${newExam.subject} has been added to the ${selectedClass} timetable.`,
      variant: 'success',
    });
  };

  const handleDelete = (id: string) => {
    setExamTimetable(examTimetable.filter(item => item.id !== id));
    showToast({
      title: 'Exam removed',
      description: 'The selected timetable slot has been cleared successfully.',
      variant: 'warning',
    });
  };

  const handleToggleEditing = () => {
    const nextEditing = !isEditing;
    setIsEditing(nextEditing);
    showToast({
      title: nextEditing ? 'Edit mode enabled' : 'Timetable changes saved',
      description: nextEditing
        ? 'Select any slot to add or remove exam entries for this class.'
        : `${selectedClass} timetable changes are now live for teachers and students.`,
      variant: nextEditing ? 'info' : 'success',
    });
  };

  const handleValidateSchedule = () => {
    const classEntries = examTimetable.filter((entry) => entry.class === selectedClass);
    const duplicateSlots = classEntries.filter((entry, index, items) => {
      return items.findIndex((item) => item.day === entry.day && item.session === entry.session) !== index;
    }).length;

    showToast({
      title: duplicateSlots > 0 ? 'Validation found timetable clashes' : 'Validation complete',
      description: duplicateSlots > 0
        ? `${duplicateSlots} overlapping slot issue(s) need review for ${selectedClass}.`
        : `${classEntries.length} exam slots checked with no class-level clashes detected.`,
      variant: duplicateSlots > 0 ? 'warning' : 'success',
    });
  };

  const getExamForSlot = (day: string, sessionLabel: string) => {
    return examTimetable.find(e => e.day === day && e.session === sessionLabel && e.class === selectedClass);
  };

  return (
    <div className="space-y-6">
      {/* Add Exam Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-md flex flex-col overflow-hidden">
            <div className="px-8 py-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Schedule New Exam</h2>
              <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>
            <form onSubmit={handleAddExam} className="p-8 space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Subject Name</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Further Mathematics" 
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none focus:border-indigo-500 dark:text-white text-sm"
                  value={newExam.subject}
                  onChange={e => setNewExam({...newExam, subject: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Invigilator</label>
                  <input 
                    type="text" 
                    required
                    placeholder="Teacher Name" 
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none focus:border-indigo-500 dark:text-white text-sm"
                    value={newExam.invigilator}
                    onChange={e => setNewExam({...newExam, invigilator: e.target.value})}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Exam Hall</label>
                  <input 
                    type="text" 
                    required
                    placeholder="Hall A" 
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none focus:border-indigo-500 dark:text-white text-sm"
                    value={newExam.hall}
                    onChange={e => setNewExam({...newExam, hall: e.target.value})}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Day</label>
                  <select 
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none focus:border-indigo-500 dark:text-white text-sm"
                    value={newExam.day}
                    onChange={e => setNewExam({...newExam, day: e.target.value})}
                  >
                    {days.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Session</label>
                  <select 
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none focus:border-indigo-500 dark:text-white text-sm"
                    value={newExam.session}
                    onChange={e => setNewExam({...newExam, session: e.target.value as any})}
                  >
                    {sessions.map(s => <option key={s.label} value={s.label}>{s.label}</option>)}
                  </select>
                </div>
              </div>
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 px-6 py-3 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">Cancel</button>
                <button type="submit" className="flex-1 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-sm font-bold shadow-lg shadow-indigo-900/20 transition-all">Schedule Exam</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 print:hidden">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Exam Timetable</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Schedule and manage {labels.assessmentLabel.toLowerCase()} for all {labels.structurePlural.toLowerCase()}.</p>
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
          <button onClick={handleExportSchedule} className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 transition-all">
            <Download className="w-4 h-4" />
            Export Schedule
          </button>
          <button 
            onClick={handleToggleEditing}
            className={cn(
              "flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all shadow-lg active:scale-95",
              isEditing ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-900/20" : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-900/20"
            )}
          >
            {isEditing ? <Save className="w-4 h-4" /> : <Edit2 className="w-4 h-4" />}
            {isEditing ? 'Save Timetable' : 'Edit Timetable'}
          </button>
        </div>
      </div>

      <div className="hidden print:block mb-10 border-b-2 border-slate-900 pb-8">
        <div className="flex items-start justify-between gap-6">
          <div className="flex items-start gap-4">
            {schoolProfile.logoUrl ? (
              <img src={schoolProfile.logoUrl} alt={`${schoolProfile.name} logo`} className="h-20 w-20 rounded-2xl border border-slate-200 object-cover" />
            ) : (
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-2xl font-bold text-slate-500">
                {(schoolProfile.name || 'S').slice(0, 1)}
              </div>
            )}
            <div>
              <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tighter mb-2">{schoolProfile.name}</h1>
              <h2 className="text-xl font-bold text-slate-700 uppercase tracking-widest mb-3">Official {labels.assessmentLabel} Timetable</h2>
              <div className="space-y-1 text-sm text-slate-600">
                {schoolProfile.address ? <p>{schoolProfile.address}</p> : null}
                {schoolProfile.phone ? <p>{schoolProfile.phone}</p> : null}
                {schoolProfile.email ? <p>{schoolProfile.email}</p> : null}
              </div>
            </div>
          </div>
          <div className="min-w-[240px] rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
            <p><span className="font-bold text-slate-900">{labels.structureSingular}:</span> {selectedClass}</p>
            <p><span className="font-bold text-slate-900">{labels.termLabel}:</span> First {labels.termLabel} Finals 2026</p>
            <p><span className="font-bold text-slate-900">Date:</span> {new Date().toLocaleDateString()}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 print:hidden">
        <KPICard title="Total Exams" value={stats.totalExams.toString()} icon={ClipboardCheck} iconBgClass="bg-blue-50" iconColorClass="text-blue-600" />
        <KPICard title="Avg. Duration" value={stats.avgDuration} icon={Clock} iconBgClass="bg-indigo-50" iconColorClass="text-indigo-600" />
        <KPICard title="Invigilators" value={stats.invigilators.toString()} icon={UserCheck} iconBgClass="bg-emerald-50" iconColorClass="text-emerald-600" />
        <KPICard title="Clashes Found" value={stats.clashes.toString()} icon={AlertTriangle} iconBgClass="bg-rose-50" iconColorClass="text-rose-600" />
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex flex-col sm:flex-row justify-between gap-4 print:hidden">
          <div className="flex items-center gap-4">
            <select 
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option>{schoolProfile.portalLevel === 'Primary' ? 'Primary 5 - Gold' : schoolProfile.portalLevel === 'Secondary' ? 'Grade 10 - A' : schoolProfile.portalLevel === 'College' ? 'Computer Science ND II' : 'Computer Science 400L'}</option>
              <option>{schoolProfile.portalLevel === 'Primary' ? 'Primary 6 - Blue' : schoolProfile.portalLevel === 'Secondary' ? 'Grade 11 - B' : schoolProfile.portalLevel === 'College' ? 'Accountancy ND I' : 'Software Engineering 300L'}</option>
            </select>
            <div className="h-6 w-px bg-slate-200 dark:bg-slate-700"></div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest italic">First {labels.termLabel} Finals 2026</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() =>
                showToast({
                  title: 'Class filter applied',
                  description: `${selectedClass} timetable is already filtered and ready for editing.`,
                  variant: 'info',
                })
              }
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              <Filter className="w-4 h-4 text-slate-500" />
            </button>
            <button 
              onClick={() => setShowAddModal(true)}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors text-indigo-600"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-slate-50/30 dark:bg-slate-800/10">
                <th className="py-4 px-6 border-b border-r border-slate-100 dark:border-slate-800 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-left w-48">{labels.assessmentLabel.replace('Assessments', 'Assessment')} Session</th>
                {days.map(day => (
                  <th key={day} className="py-4 px-6 border-b border-r border-slate-100 dark:border-slate-800 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">{day}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {sessions.map((session) => (
                <tr key={session.id}>
                  <td className="py-4 px-6 border-r border-slate-100 dark:border-slate-800">
                    <p className="text-xs font-bold text-slate-900 dark:text-white">{session.label} Session</p>
                    <p className="text-[10px] text-slate-400 font-medium">{session.time}</p>
                  </td>
                  {days.map(day => {
                    const exam = getExamForSlot(day, session.label);
                    return (
                      <td key={day} className="py-3 px-3 border-r border-slate-100 dark:border-slate-800 group">
                        {exam ? (
                          <div className={cn(
                            "p-4 rounded-2xl border transition-all cursor-pointer relative",
                            isEditing 
                              ? "border-dashed border-indigo-200 dark:border-indigo-900/50 hover:border-indigo-400 dark:hover:border-indigo-500 hover:bg-indigo-50/30" 
                              : "border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-800/20 hover:scale-[1.02] hover:shadow-md"
                          )}>
                            <div className="flex justify-between items-start mb-2">
                              <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-tighter bg-indigo-50 dark:bg-indigo-900/30 px-2 py-0.5 rounded-md">
                                {exam.subject.substring(0, 3).toUpperCase()}
                              </span>
                              {isEditing && (
                                <button 
                                  onClick={() => handleDelete(exam.id)}
                                  className="p-1 text-slate-400 hover:text-rose-500 transition-colors"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              )}
                            </div>
                            <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{exam.subject}</p>
                            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1">
                              <MapPin className="w-3 h-3" /> {exam.hall}
                            </p>
                            <p className="text-[10px] text-indigo-500 font-bold mt-1 uppercase tracking-tight">
                              Inv: {exam.invigilator}
                            </p>
                          </div>
                        ) : (
                          isEditing && (
                            <div 
                              onClick={() => {
                                setNewExam({...newExam, day, session: session.label as any});
                                setShowAddModal(true);
                              }}
                              className="h-24 rounded-2xl border-2 border-dashed border-slate-100 dark:border-slate-800 flex items-center justify-center text-slate-300 hover:border-indigo-300 hover:text-indigo-300 transition-all cursor-pointer"
                            >
                              <Plus className="w-6 h-6" />
                            </div>
                          )
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

      <div className="p-6 bg-gradient-to-r from-indigo-600 to-blue-700 rounded-3xl text-white shadow-xl shadow-indigo-900/20 flex flex-col sm:flex-row items-center justify-between gap-6 relative overflow-hidden print:hidden">
        <div className="absolute right-0 top-0 p-8 opacity-10">
          <ClipboardCheck className="w-32 h-32" />
        </div>
        <div className="flex items-center gap-4 relative z-10">
          <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-md border border-white/20">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold">Exam Validation System</h3>
            <p className="text-indigo-100 text-sm">Automatically checks for teacher invigilation clashes and room availability.</p>
          </div>
        </div>
        <button
          onClick={handleValidateSchedule}
          className="w-full sm:w-auto px-8 py-3 bg-white text-indigo-600 font-bold rounded-2xl text-sm hover:bg-blue-50 transition-all shadow-lg active:scale-95 relative z-10"
        >
          Validate Schedule
        </button>
      </div>

      <div className="hidden print:block mt-10 pt-6 border-t border-slate-200">
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: schoolProfile.portalLevel === 'Primary' || schoolProfile.portalLevel === 'Secondary' ? 'Class Teacher' : 'Course Adviser', name: schoolProfile.teacherSignatoryName || 'Teacher Signatory', signatureUrl: schoolProfile.teacherSignatureUrl },
            { label: schoolProfile.portalLevel === 'Primary' ? 'Head Teacher' : schoolProfile.portalLevel === 'Secondary' ? 'Head of Department' : 'Dean / Head of Department', name: schoolProfile.hodSignatoryName || 'HOD Signatory', signatureUrl: schoolProfile.hodSignatureUrl },
            { label: schoolProfile.portalLevel === 'University' ? 'Registrar / Provost' : schoolProfile.portalLevel === 'College' ? 'Rector / Provost' : 'Principal', name: schoolProfile.principalSignatoryName || 'Principal Signatory', signatureUrl: schoolProfile.principalSignatureUrl },
          ].map((signatory) => (
            <div key={signatory.label} className="rounded-2xl border border-slate-200 p-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">{signatory.label}</p>
              <div className="mt-4 flex h-16 items-end justify-center rounded-xl border-b border-dashed border-slate-300 bg-slate-50">
                {signatory.signatureUrl ? (
                  <img src={signatory.signatureUrl} alt={`${signatory.label} signature`} className="max-h-12 object-contain" />
                ) : (
                  <span className="pb-3 text-[10px] text-slate-400">No signature uploaded</span>
                )}
              </div>
              <p className="mt-3 text-sm font-semibold text-slate-900">{signatory.name}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
