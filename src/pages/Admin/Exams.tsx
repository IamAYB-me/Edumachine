import React, { useState } from 'react';
import { Plus, Search, Edit, Trash2, X, ClipboardCheck, Clock, BookOpen, PlayCircle, Award, CheckCircle, AlertCircle, FileText } from 'lucide-react';
import { cn } from '@/utils';
import { useDataStore, Exam, Question } from '@/store/useDataStore';
import { KPICard } from '@/components/ui/KPICard';
import { useToastStore } from '@/store/useToastStore';
import { useAuthStore } from '@/store/useAuthStore';
import { getPortalLevelLabels, resolveSchoolProfile } from '@/utils/schoolProfile';

export default function ExamManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const { exams, addExam, updateExam, deleteExam, subjects, schools } = useDataStore();
  const showToast = useToastStore((state) => state.showToast);
  const user = useAuthStore((state) => state.user);

  const schoolProfile = resolveSchoolProfile(user ?? null, schools);
  const labels = getPortalLevelLabels(schoolProfile.portalLevel);
  
  const stats = {
    total: exams.length,
    published: exams.filter(e => e.status === 'Published').length,
    drafts: exams.filter(e => e.status === 'Draft').length,
    totalQuestions: exams.reduce((acc, e) => acc + e.questions.length, 0)
  };

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExam, setEditingExam] = useState<Exam | null>(null);
  
  const [formData, setFormData] = useState({
    title: '',
    subject: subjects[0]?.name || '',
    duration: 60,
    totalMarks: 100,
    status: 'Draft' as 'Draft' | 'Published' | 'Closed',
    questions: [] as Question[]
  });

  const filteredExams = exams.filter(exam => 
    exam.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    exam.subject.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenModal = (exam?: Exam) => {
    if (exam) {
      setEditingExam(exam);
      setFormData({ ...exam });
    } else {
      setEditingExam(null);
      setFormData({
        title: '',
        subject: subjects[0]?.name || '',
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
      questions: [...formData.questions, { id: Math.random().toString(36).substring(2, 11), text: '', options: ['', '', '', ''], correctOption: 0 }]
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{labels.assessmentLabel} Management</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Create and manage {labels.assessmentLabel.toLowerCase()} and academic records.</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-lg shadow-blue-900/20"
        >
          <Plus className="w-4 h-4" />
          Create New {labels.assessmentLabel.slice(0, -1) || 'Exam'}
        </button>
      </div>

      {/* Stats Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard 
          title={`Total ${labels.assessmentLabel}`} 
          value={stats.total.toString()} 
          icon={FileText} 
          iconBgClass="bg-blue-50 dark:bg-blue-900/20"
          iconColorClass="text-blue-600 dark:text-blue-400"
        />
        <KPICard 
          title="Published" 
          value={stats.published.toString()} 
          icon={CheckCircle} 
          iconBgClass="bg-emerald-50 dark:bg-emerald-900/20"
          iconColorClass="text-emerald-600 dark:text-emerald-400"
        />
        <KPICard 
          title="Drafts" 
          value={stats.drafts.toString()} 
          icon={AlertCircle} 
          iconBgClass="bg-amber-50 dark:bg-amber-900/20"
          iconColorClass="text-amber-600 dark:text-amber-400"
        />
        <KPICard 
          title="Total Questions" 
          value={stats.totalQuestions.toString()} 
          icon={Award} 
          iconBgClass="bg-indigo-50 dark:bg-indigo-900/20"
          iconColorClass="text-indigo-600 dark:text-indigo-400"
        />
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex-1 flex flex-col overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between gap-4 bg-slate-50/50 dark:bg-slate-800/30">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search exams by title or subject..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:border-blue-500 transition-all dark:text-white"
            />
          </div>
        </div>

        {/* Exams Grid */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 overflow-y-auto">
          {filteredExams.map((exam) => (
            <div key={exam.id} className="bg-white dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 hover:shadow-xl hover:border-blue-200 dark:hover:border-blue-900/50 transition-all group relative">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl group-hover:scale-110 transition-transform">
                  <ClipboardCheck className="w-6 h-6" />
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => handleOpenModal(exam)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"><Edit className="w-4 h-4" /></button>
                  <button onClick={() => deleteExam(exam.id)} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>

              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1 group-hover:text-blue-600 transition-colors">{exam.title}</h3>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">{exam.subject}</p>

              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs font-bold p-2 bg-slate-50 dark:bg-slate-800 rounded-lg">
                  <div className="flex items-center gap-2 text-slate-500"><Clock className="w-3.5 h-3.5" /> {exam.duration} Mins</div>
                  <div className="flex items-center gap-2 text-slate-500"><BookOpen className="w-3.5 h-3.5" /> {exam.questions.length} Questions</div>
                </div>
                
                <div className="flex items-center justify-between pt-2">
                  <span className={cn(
                    "px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider",
                    exam.status === 'Published' ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30" : 
                    exam.status === 'Closed' ? "bg-rose-50 text-rose-700 dark:bg-rose-900/30" : 
                    "bg-slate-100 text-slate-600 dark:bg-slate-800"
                  )}>
                    {exam.status}
                  </span>
                  <div className="flex items-center gap-1.5 text-slate-900 dark:text-white">
                     <Award className="w-3.5 h-3.5 text-amber-500" />
                     <span className="text-xs font-bold">{exam.totalMarks} Marks</span>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-700">
                <button onClick={() => showToast({ title: 'Exam preview', description: 'Generating exam preview for review before publishing.', variant: 'info' })} className="w-full py-2.5 bg-slate-900 dark:bg-slate-700 text-white rounded-xl text-xs font-bold hover:bg-slate-800 dark:hover:bg-slate-600 transition-colors shadow-md flex items-center justify-center gap-2">
                  <PlayCircle className="w-4 h-4" />
                  Preview Exam
                </button>
              </div>
            </div>
          ))}
          {filteredExams.length === 0 && (
            <div className="col-span-full py-20 flex flex-col items-center justify-center text-slate-400 dark:text-slate-600">
              <ClipboardCheck className="w-12 h-12 mb-4 opacity-20" />
              <p className="text-sm font-medium">No exams found matching your search.</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 w-full max-w-4xl my-8 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">{editingExam ? `Edit ${labels.assessmentLabel.slice(0, -1) || 'Exam'}` : `Create New ${labels.assessmentLabel.slice(0, -1) || 'Exam'}`}</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-200 rounded-full transition-colors"><X className="w-5 h-5 text-slate-500" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Exam Title</label>
                  <input type="text" required value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 rounded-xl dark:text-white" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">{labels.subjectSingular}</label>
                  <select value={formData.subject} onChange={(e) => setFormData({...formData, subject: e.target.value})} className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 rounded-xl dark:text-white">
                    {subjects.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Duration (Minutes)</label>
                  <input type="number" required value={formData.duration} onChange={(e) => setFormData({...formData, duration: parseInt(e.target.value)})} className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 rounded-xl dark:text-white" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Status</label>
                  <select value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value as any})} className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 rounded-xl dark:text-white">
                    <option value="Draft">Draft</option>
                    <option value="Published">Published</option>
                    <option value="Closed">Closed</option>
                  </select>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">Questions</h3>
                  <button type="button" onClick={handleAddQuestion} className="text-xs font-bold text-blue-600 hover:underline">+ Add Question</button>
                </div>
                
                {formData.questions.map((q, qIndex) => (
                  <div key={q.id} className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 space-y-4">
                    <div className="flex justify-between items-start">
                      <span className="text-xs font-bold text-slate-400">Q{qIndex + 1}</span>
                      <button type="button" onClick={() => setFormData({...formData, questions: formData.questions.filter((_, i) => i !== qIndex)})} className="text-rose-500 hover:text-rose-700"><Trash2 className="w-4 h-4" /></button>
                    </div>
                    <textarea 
                      placeholder="Enter question text..." 
                      value={q.text} 
                      onChange={(e) => handleQuestionChange(qIndex, 'text', e.target.value)}
                      className="w-full px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 rounded-xl dark:text-white text-sm"
                    />
                    <div className="grid grid-cols-2 gap-4">
                      {q.options.map((opt, oIndex) => (
                        <div key={oIndex} className="flex items-center gap-2">
                          <input 
                            type="radio" 
                            name={`correct-${q.id}`} 
                            checked={q.correctOption === oIndex}
                            onChange={() => handleQuestionChange(qIndex, 'correctOption', oIndex)}
                          />
                          <input 
                            type="text" 
                            placeholder={`Option ${String.fromCharCode(65 + oIndex)}`}
                            value={opt}
                            onChange={(e) => handleOptionChange(qIndex, oIndex, e.target.value)}
                            className="flex-1 px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 rounded-lg dark:text-white text-xs"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-300">Cancel</button>
                <button type="submit" className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold shadow-lg">Save Exam</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
