import React, { useState, useMemo } from 'react';
import { 
  Plus, Search, Edit, Trash2, X, ClipboardCheck, Clock, BookOpen, 
  ChevronRight, PlayCircle, Award, CheckCircle, AlertCircle, FileText,
  Calendar, MapPin, UserCheck, Printer, Mail, Phone
} from 'lucide-react';
import { cn } from '@/utils';
import { useDataStore, Exam, Question } from '@/store/useDataStore';
import { useAuthStore } from '@/store/useAuthStore';
import { KPICard } from '@/components/ui/KPICard';
import { getPortalLevelLabels, resolveSchoolProfile } from '@/utils/schoolProfile';

export default function TeacherExams() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'exams' | 'supervision'>('exams');
  const { exams, addExam, updateExam, deleteExam, classes, examTimetable, schools } = useDataStore();
  const { user } = useAuthStore();
  const [checkedInIds, setCheckedInIds] = useState<string[]>([]);
  const schoolProfile = resolveSchoolProfile(user ?? null, schools);
  const labels = getPortalLevelLabels(schoolProfile.portalLevel);
  
  // Supervision Schedule for this teacher
  const supervisionSchedule = useMemo(() => {
    const assignedClassNames = new Set(
      classes.filter((item) => item.teacherName === user?.name || item.teacherId === user?.id).map((item) => item.name)
    );

    return examTimetable.filter(
      (item) => item.invigilator === user?.name || assignedClassNames.has(item.class)
    );
  }, [classes, examTimetable, user?.id, user?.name]);

  // Simulated teacher subjects
  const teacherSubjects = ['Mathematics', 'Physics', 'Further Mathematics'];
  const teacherExams = exams.filter(
    (exam) =>
      teacherSubjects.includes(exam.subject) &&
      (exam.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        exam.subject.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const stats = {
    total: teacherExams.length,
    published: teacherExams.filter(e => e.status === 'Published').length,
    drafts: teacherExams.filter(e => e.status === 'Draft').length,
    totalQuestions: teacherExams.reduce((acc, e) => acc + e.questions.length, 0)
  };

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExam, setEditingExam] = useState<Exam | null>(null);
  
  const handlePrint = () => {
    window.print();
  };
  
  const [formData, setFormData] = useState({
    title: '',
    subject: teacherSubjects[0],
    duration: 60,
    totalMarks: 100,
    status: 'Draft' as 'Draft' | 'Published' | 'Closed',
    questions: [] as Question[]
  });

  const handleOpenModal = (exam?: Exam) => {
    if (exam) {
      setEditingExam(exam);
      setFormData({ ...exam });
    } else {
      setEditingExam(null);
      setFormData({
        title: '',
        subject: teacherSubjects[0],
        duration: 60,
        totalMarks: 100,
        status: 'Draft',
        questions: []
      });
    }
    setIsModalOpen(true);
  };

  const handleAddQuestion = () => {
    setFormData({
      ...formData,
      questions: [...formData.questions, { id: Math.random().toString(36).substr(2, 9), text: '', options: ['', '', '', ''], correctOption: 0 }]
    });
  };

  const handleQuestionChange = (index: number, field: keyof Question, value: any) => {
    const newQuestions = [...formData.questions];
    newQuestions[index] = { ...newQuestions[index], [field]: value };
    setFormData({ ...formData, questions: newQuestions });
  };

  const handleOptionChange = (qIndex: number, oIndex: number, value: string) => {
    const newQuestions = [...formData.questions];
    const newOptions = [...newQuestions[qIndex].options];
    newOptions[oIndex] = value;
    newQuestions[qIndex].options = newOptions;
    setFormData({ ...formData, questions: newQuestions });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingExam) updateExam(editingExam.id, formData);
    else addExam(formData);
    setIsModalOpen(false);
  };

  const handleCheckIn = (id: string) => {
    setCheckedInIds((current) => (current.includes(id) ? current : [...current, id]));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 print:hidden">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white uppercase tracking-tight">{labels.assessmentLabel}</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 font-medium">Create {labels.assessmentLabel.toLowerCase()} and track your invigilation schedule.</p>
        </div>
        <div className="flex gap-3">
          {activeTab === 'supervision' && supervisionSchedule.length > 0 && (
            <button 
              onClick={handlePrint}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-2xl text-sm font-bold transition-all shadow-lg shadow-indigo-900/20 active:scale-95"
            >
              <Printer className="w-4 h-4" />
              Print Schedule
            </button>
          )}
          {activeTab === 'exams' && (
            <button 
              onClick={() => handleOpenModal()}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-2xl text-sm font-bold transition-all shadow-lg shadow-blue-900/20 active:scale-95"
            >
              <Plus className="w-4 h-4" />
              Create Exam
            </button>
          )}
        </div>
      </div>

      {/* Print Header - Only visible during print */}
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
              <h2 className="text-xl font-bold text-slate-700 uppercase tracking-widest mb-3">Official Teacher Supervision Schedule</h2>
              <div className="space-y-1 text-sm text-slate-600">
                {schoolProfile.address ? <p className="flex items-center gap-2"><MapPin className="h-4 w-4" /> {schoolProfile.address}</p> : null}
                {schoolProfile.phone ? <p className="flex items-center gap-2"><Phone className="h-4 w-4" /> {schoolProfile.phone}</p> : null}
                {schoolProfile.email ? <p className="flex items-center gap-2"><Mail className="h-4 w-4" /> {schoolProfile.email}</p> : null}
              </div>
            </div>
          </div>
          <div className="min-w-[240px] rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
            <p><span className="font-bold text-slate-900">Teacher:</span> {user?.name}</p>
            <p><span className="font-bold text-slate-900">Academic Year:</span> 2026/2027</p>
            <p><span className="font-bold text-slate-900">Date:</span> {new Date().toLocaleDateString()}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl w-fit print:hidden">
        <button 
          onClick={() => setActiveTab('exams')}
          className={cn(
            "px-6 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2",
            activeTab === 'exams' ? "bg-white dark:bg-slate-700 text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
          )}
        >
          <ClipboardCheck className="w-4 h-4" />
          My {labels.assessmentLabel}
        </button>
        <button 
          onClick={() => setActiveTab('supervision')}
          className={cn(
            "px-6 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 relative",
            activeTab === 'supervision' ? "bg-white dark:bg-slate-700 text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
          )}
        >
          <UserCheck className="w-4 h-4" />
          Supervision Schedule
          {supervisionSchedule.length > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white text-[8px] flex items-center justify-center rounded-full animate-bounce">
              {supervisionSchedule.length}
            </span>
          )}
        </button>
      </div>

      {activeTab === 'exams' ? (
        <div className="print:hidden">
          {/* Stats Widgets */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <KPICard title={`Total ${labels.assessmentLabel}`} value={stats.total.toString()} icon={FileText} iconBgClass="bg-blue-50 dark:bg-blue-900/20" iconColorClass="text-blue-600 dark:text-blue-400" />
            <KPICard title="Published" value={stats.published.toString()} icon={CheckCircle} iconBgClass="bg-emerald-50 dark:bg-emerald-900/20" iconColorClass="text-emerald-600 dark:text-emerald-400" />
            <KPICard title="Drafts" value={stats.drafts.toString()} icon={AlertCircle} iconBgClass="bg-amber-50 dark:bg-amber-900/20" iconColorClass="text-amber-600 dark:text-amber-400" />
            <KPICard title="Questions Set" value={stats.totalQuestions.toString()} icon={Award} iconBgClass="bg-indigo-50 dark:bg-indigo-900/20" iconColorClass="text-indigo-600 dark:text-indigo-400" />
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between gap-4 bg-slate-50/50 dark:bg-slate-800/30">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <input 
                  type="text" 
                  placeholder={`Search your ${labels.assessmentLabel.toLowerCase()}...`} 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-11 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm focus:outline-none focus:border-blue-500 transition-all dark:text-white"
                />
              </div>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {teacherExams.map((exam) => (
                <div key={exam.id} className="bg-white dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 hover:shadow-xl hover:border-blue-500/30 transition-all group relative">
                  <div className="flex justify-between items-start mb-6">
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-2xl group-hover:scale-110 transition-transform">
                      <ClipboardCheck className="w-6 h-6" />
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handleOpenModal(exam)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-xl transition-colors"><Edit className="w-4 h-4" /></button>
                      <button onClick={() => deleteExam(exam.id)} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-xl transition-colors"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </div>

                  <h3 className="text-lg font-black text-slate-900 dark:text-white mb-1 group-hover:text-blue-600 transition-colors leading-tight">{exam.title}</h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6">{exam.subject}</p>

                  <div className="grid grid-cols-2 gap-3 mb-6">
                    <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl flex flex-col gap-1">
                      <div className="flex items-center gap-1.5 text-slate-400 uppercase tracking-widest text-[9px] font-bold">
                        <Clock className="w-3 h-3" /> Duration
                      </div>
                      <p className="text-xs font-bold text-slate-900 dark:text-white">{exam.duration} Mins</p>
                    </div>
                    <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl flex flex-col gap-1">
                      <div className="flex items-center gap-1.5 text-slate-400 uppercase tracking-widest text-[9px] font-bold">
                        <BookOpen className="w-3 h-3" /> Questions
                      </div>
                      <p className="text-xs font-bold text-slate-900 dark:text-white">{exam.questions.length} Qs</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-700">
                    <span className={cn(
                      "px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider",
                      exam.status === 'Published' ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" : 
                      exam.status === 'Closed' ? "bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400" : 
                      "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                    )}>
                      {exam.status}
                    </span>
                    <div className="flex items-center gap-1.5 text-slate-900 dark:text-white">
                       <Award className="w-4 h-4 text-amber-500" />
                       <span className="text-xs font-black">{exam.totalMarks} Marks</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 print:grid-cols-2 print:gap-4">
          {supervisionSchedule.length > 0 ? supervisionSchedule.map((item) => (
            <div key={item.id} className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-800 p-8 shadow-sm hover:shadow-xl transition-all group relative overflow-hidden">
               <div className="relative z-10">
                 <div className="flex justify-between items-start mb-8">
                   <div className="p-4 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-2xl group-hover:scale-110 transition-transform">
                     <Calendar className="w-8 h-8" />
                   </div>
                   <div className="text-right">
                     <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-1">{item.day}</p>
                     <p className="text-sm font-black text-slate-900 dark:text-white">{item.session} Session</p>
                   </div>
                 </div>

                 <h3 className="text-xl font-black text-slate-900 dark:text-white mb-6 leading-tight uppercase tracking-tight">{item.subject}</h3>

                 <div className="space-y-4">
                   <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-transparent group-hover:border-indigo-500/20 transition-all">
                     <div className="p-2 bg-white dark:bg-slate-700 rounded-lg shadow-sm text-slate-400">
                       <UserCheck className="w-4 h-4" />
                     </div>
                     <div>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Assigned {labels.structureSingular}</p>
                       <p className="text-sm font-bold text-slate-900 dark:text-white">{item.class}</p>
                     </div>
                   </div>
                   <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-transparent group-hover:border-indigo-500/20 transition-all">
                     <div className="p-2 bg-white dark:bg-slate-700 rounded-lg shadow-sm text-slate-400">
                       <MapPin className="w-4 h-4" />
                     </div>
                     <div>
                       <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Venue / Hall</p>
                       <p className="text-sm font-bold text-slate-900 dark:text-white">{item.hall}</p>
                     </div>
                   </div>
                   <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-transparent group-hover:border-indigo-500/20 transition-all">
                     <div className="p-2 bg-white dark:bg-slate-700 rounded-lg shadow-sm text-slate-400">
                       <Clock className="w-4 h-4" />
                     </div>
                     <div>
                       <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Expected Duration</p>
                       <p className="text-sm font-bold text-slate-900 dark:text-white">{item.duration}</p>
                     </div>
                   </div>
                 </div>

                 <button
                   onClick={() => handleCheckIn(item.id)}
                   disabled={checkedInIds.includes(item.id)}
                   className={cn(
                     "w-full mt-8 py-4 rounded-2xl text-xs font-bold uppercase tracking-widest transition-all shadow-lg print:hidden",
                     checkedInIds.includes(item.id)
                       ? "bg-emerald-600 text-white shadow-emerald-900/20 cursor-default"
                       : "bg-slate-900 dark:bg-white dark:text-slate-900 text-white hover:opacity-90"
                   )}
                 >
                   {checkedInIds.includes(item.id) ? 'Checked In' : 'Check-in Supervision'}
                 </button>
               </div>
               {/* Abstract background */}
               <div className="absolute -top-12 -right-12 w-48 h-48 bg-indigo-500/5 rounded-full blur-3xl print:hidden"></div>
            </div>
          )) : (
            <div className="col-span-full py-32 flex flex-col items-center justify-center text-center">
              <div className="w-24 h-24 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6">
                <UserCheck className="w-12 h-12 text-slate-200" />
              </div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-widest">No Supervision Tasks</h3>
              <p className="text-sm text-slate-500 mt-2 max-w-xs mx-auto font-medium">You haven't been assigned to any invigilation duties for the upcoming {labels.assessmentLabel.toLowerCase()} yet.</p>
            </div>
          )}
        </div>
      )}

      <div className="hidden print:block mt-20 pt-8 border-t border-slate-200">
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

      {/* Modal - Simplified version of Admin Exam Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh] transition-all transform scale-100">
            <div className="px-10 py-8 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
              <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{editingExam ? `Edit ${labels.assessmentLabel.slice(0, -1) || 'Assessment'}` : `New ${labels.assessmentLabel.slice(0, -1) || 'Assessment'}`}</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-3 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-2xl transition-all">
                <X className="w-6 h-6 text-slate-500" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-10 space-y-8 overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-2">Exam Title</label>
                  <input type="text" required value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl text-sm font-medium focus:outline-none focus:border-blue-500 transition-all dark:text-white" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-2">Subject Category</label>
                  <select value={formData.subject} onChange={(e) => setFormData({...formData, subject: e.target.value})} className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl text-sm font-medium focus:outline-none focus:border-blue-500 transition-all dark:text-white">
                    {teacherSubjects.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-2">Duration (Minutes)</label>
                  <input type="number" required value={formData.duration} onChange={(e) => setFormData({...formData, duration: parseInt(e.target.value)})} className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl text-sm font-medium focus:outline-none focus:border-blue-500 transition-all dark:text-white" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-2">Assessment Status</label>
                  <select value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value as any})} className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl text-sm font-medium focus:outline-none focus:border-blue-500 transition-all dark:text-white">
                    <option value="Draft">Draft Mode</option>
                    <option value="Published">Published (Live)</option>
                    <option value="Closed">Closed / Completed</option>
                  </select>
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex justify-between items-center px-2">
                  <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">Question Bank ({formData.questions.length})</h3>
                  <button type="button" onClick={handleAddQuestion} className="text-[10px] font-bold text-blue-600 uppercase tracking-widest hover:underline">+ New Question</button>
                </div>
                
                <div className="space-y-4">
                  {formData.questions.map((q, qIndex) => (
                    <div key={q.id} className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-slate-100 dark:border-slate-700 space-y-6">
                      <div className="flex justify-between items-center">
                        <span className="px-3 py-1 bg-white dark:bg-slate-800 text-[10px] font-black text-slate-400 rounded-lg uppercase">Question {qIndex + 1}</span>
                        <button type="button" onClick={() => setFormData({...formData, questions: formData.questions.filter((_, i) => i !== qIndex)})} className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition-all"><Trash2 className="w-4 h-4" /></button>
                      </div>
                      <textarea 
                        placeholder="Enter your question here..." 
                        value={q.text} 
                        onChange={(e) => handleQuestionChange(qIndex, 'text', e.target.value)}
                        className="w-full px-5 py-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-2xl dark:text-white text-sm font-medium focus:outline-none focus:border-blue-500"
                        rows={3}
                      />
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {q.options.map((opt, oIndex) => (
                          <div key={oIndex} className="flex items-center gap-3 group">
                            <input 
                              type="radio" 
                              name={`correct-${q.id}`} 
                              checked={q.correctOption === oIndex}
                              onChange={() => handleQuestionChange(qIndex, 'correctOption', oIndex)}
                              className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                            />
                            <input 
                              type="text" 
                              placeholder={`Option ${String.fromCharCode(65 + oIndex)}`}
                              value={opt}
                              onChange={(e) => handleOptionChange(qIndex, oIndex, e.target.value)}
                              className="flex-1 px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-xl dark:text-white text-xs font-medium focus:border-blue-500"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-8 border-t border-slate-100 dark:border-slate-800 flex gap-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-6 py-4 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 transition-all">Cancel</button>
                <button type="submit" className="flex-1 px-6 py-4 bg-blue-600 text-white rounded-2xl text-sm font-bold shadow-xl shadow-blue-900/20 hover:bg-blue-700 transition-all">Save Assessment</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
