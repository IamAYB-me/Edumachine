import React, { useState, useMemo } from 'react';
import {
  Plus, Search, Edit, Trash2, X, ClipboardCheck, Clock, BookOpen,
  Award, UserCheck, Save,
  Calendar, MapPin, Printer,
} from 'lucide-react';
import { cn } from '@/utils';
import { useDataStore, Exam, Question } from '@/store/useDataStore';
import { useAuthStore } from '@/store/useAuthStore';
import { useToastStore } from '@/store/useToastStore';
import { getPortalLevelLabels, resolveSchoolProfile } from '@/utils/schoolProfile';
import { useSearchParams } from 'react-router-dom';

export default function TeacherExams() {
  const {
    exams, addExam, updateExam, deleteExam,
    examResults, addExamResult, updateExamResult, deleteExamResult,
    subjects, classes, students, examTimetable, schools,
  } = useDataStore();
  const user = useAuthStore((state) => state.user);
  const showToast = useToastStore((state) => state.showToast);

  const schoolProfile = resolveSchoolProfile(user ?? null, schools);
  const labels = getPortalLevelLabels(schoolProfile.portalLevel);
  const isCollege = schoolProfile.portalLevel === 'College' || schoolProfile.portalLevel === 'University';

  const [searchParams] = useSearchParams();
  const initialTab = (searchParams.get('tab') as 'exams' | 'scores' | 'supervision') || 'exams';
  const [activeTab, setActiveTab] = useState<'exams' | 'scores' | 'supervision'>(initialTab);
  const [searchTerm, setSearchTerm] = useState('');

  // Teacher's subjects from the store
  const teacherSubjectNames = useMemo(() => {
    return subjects
      .filter((s) => s.assignedClasses?.some((cls) =>
        classes.some((c) => c.name === cls && (c.teacherId === user?.id || c.teacherName === user?.name))
      ))
      .map((s) => s.name);
  }, [subjects, classes, user?.id, user?.name]);

  const fallbackSubjects = ['Mathematics', 'Physics', 'Further Mathematics'];
  const teacherSubjects = teacherSubjectNames.length > 0 ? teacherSubjectNames : fallbackSubjects;

  const teacherExams = useMemo(() =>
    exams.filter((e) =>
      teacherSubjects.includes(e.subject) &&
      (e.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.subject.toLowerCase().includes(searchTerm.toLowerCase()))
    ),
    [exams, teacherSubjects, searchTerm]
  );

  const teacherResults = useMemo(() =>
    examResults.filter((r) =>
      teacherSubjects.includes(r.subject) &&
      (r.recordedBy === user?.name || r.studentName.toLowerCase().includes(searchTerm.toLowerCase()))
    ),
    [examResults, teacherSubjects, user?.name, searchTerm]
  );

  const supervisionSchedule = useMemo(() => {
    const assignedClassNames = new Set(
      classes.filter((c) => c.teacherName === user?.name || c.teacherId === user?.id).map((c) => c.name)
    );
    return examTimetable.filter((e) => e.invigilator === user?.name || assignedClassNames.has(e.class));
  }, [classes, examTimetable, user?.id, user?.name]);

  const examStats = {
    total: teacherExams.length,
    published: teacherExams.filter((e) => e.status === 'Published').length,
    drafts: teacherExams.filter((e) => e.status === 'Draft').length,
    totalQuestions: teacherExams.reduce((sum, e) => sum + e.questions.length, 0),
  };

  const scoreStats = {
    total: teacherResults.length,
    avgScore: teacherResults.length > 0
      ? Math.round(teacherResults.reduce((sum, r) => sum + (r.score / r.totalMarks) * 100, 0) / teacherResults.length)
      : 0,
    passed: teacherResults.filter((r) => (r.score / r.totalMarks) >= 0.5).length,
    distinctions: teacherResults.filter((r) => (r.score / r.totalMarks) >= 0.8).length,
  };

  // Exam CRUD modal
  const [examModalOpen, setExamModalOpen] = useState(false);
  const [editingExam, setEditingExam] = useState<Exam | null>(null);
  const [examForm, setExamForm] = useState({
    title: '', subject: teacherSubjects[0] || '', duration: 60, totalMarks: 100,
    status: 'Draft' as 'Draft' | 'Published' | 'Closed', questions: [] as Question[],
  });

  const handleOpenExamModal = (exam?: Exam) => {
    if (exam) {
      setEditingExam(exam);
      setExamForm({ ...exam });
    } else {
      setEditingExam(null);
      setExamForm({ title: '', subject: teacherSubjects[0] || '', duration: 60, totalMarks: 100, status: 'Draft', questions: [] });
    }
    setExamModalOpen(true);
  };

  const handleAddQuestion = () => {
    setExamForm({
      ...examForm,
      questions: [...examForm.questions, { id: Math.random().toString(36).substring(2, 11), text: '', options: ['', '', '', ''], correctOption: 0 }],
    });
  };

  const handleQuestionChange = (index: number, field: keyof Question, value: any) => {
    const newQ = [...examForm.questions];
    newQ[index] = { ...newQ[index], [field]: value };
    setExamForm({ ...examForm, questions: newQ });
  };

  const handleOptionChange = (qIndex: number, oIndex: number, value: string) => {
    const newQ = [...examForm.questions];
    const newOpts = [...newQ[qIndex].options];
    newOpts[oIndex] = value;
    newQ[qIndex].options = newOpts;
    setExamForm({ ...examForm, questions: newQ });
  };

  const handleSaveExam = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingExam) updateExam(editingExam.id, examForm);
    else addExam(examForm);
    showToast({ title: editingExam ? `${labels.assessmentLabel.slice(0, -1)} updated` : `${labels.assessmentLabel.slice(0, -1)} created`, description: examForm.title, variant: 'success' });
    setExamModalOpen(false);
  };

  // Score recording
  const [scoreModalOpen, setScoreModalOpen] = useState(false);
  const [selectedClassId, setSelectedClassId] = useState('');
  const [selectedSubject, setSelectedSubject] = useState(teacherSubjects[0] || '');
  const [assessmentType, setAssessmentType] = useState<'Test' | 'Exam' | 'Assignment' | 'Quiz'>('Test');
  const [assessmentTitle, setAssessmentTitle] = useState('');
  const [totalMarks, setTotalMarks] = useState(20);
  const [scoreEntries, setScoreEntries] = useState<{ studentId: string; studentName: string; score: number }[]>([]);

  const assignedClasses = useMemo(() =>
    classes.filter((c) => c.teacherId === user?.id || c.teacherName === user?.name),
    [classes, user?.id, user?.name]
  );

  const classStudents = useMemo(() => {
    if (!selectedClassId) return [];
    const className = classes.find((c) => c.id === selectedClassId)?.name;
    return students.filter((s) => s.class === className && s.status === 'Active');
  }, [selectedClassId, classes, students]);

  const handleOpenScoreModal = () => {
    setSelectedClassId(assignedClasses[0]?.id || '');
    setSelectedSubject(teacherSubjects[0] || '');
    setAssessmentType('Test');
    setAssessmentTitle('');
    setTotalMarks(isCollege ? 50 : 20);
    setScoreEntries([]);
    setScoreModalOpen(true);
  };

  const handleClassChange = (classId: string) => {
    setSelectedClassId(classId);
    const className = classes.find((c) => c.id === classId)?.name;
    const studs = students.filter((s) => s.class === className && s.status === 'Active');
    setScoreEntries(studs.map((s) => ({ studentId: s.id, studentName: s.name, score: 0 })));
  };

  const handleScoreChange = (studentId: string, score: number) => {
    setScoreEntries((prev) => prev.map((e) => (e.studentId === studentId ? { ...e, score: Math.max(0, Math.min(score, totalMarks)) } : e)));
  };

  const handleSaveScores = () => {
    if (!assessmentTitle.trim()) {
      showToast({ title: 'Title required', description: 'Please enter an assessment title.', variant: 'warning' });
      return;
    }
    if (scoreEntries.every((e) => e.score === 0)) {
      showToast({ title: 'No scores entered', description: 'Please enter at least one score.', variant: 'warning' });
      return;
    }

    const today = new Date().toISOString().split('T')[0];
    const termLabel = isCollege ? 'First Semester' : 'First Term';

    scoreEntries.forEach((entry) => {
      addExamResult({
        examId: '',
        examTitle: assessmentTitle,
        subject: selectedSubject,
        type: assessmentType,
        studentId: entry.studentId,
        studentName: entry.studentName,
        score: entry.score,
        totalMarks,
        term: termLabel,
        date: today,
        recordedBy: user?.name || '',
      });
    });

    showToast({
      title: 'Scores recorded',
      description: `${scoreEntries.length} ${labels.learnerPlural.toLowerCase()} scores saved for "${assessmentTitle}".`,
      variant: 'success',
    });
    setScoreModalOpen(false);
  };

  const [checkedInIds, setCheckedInIds] = useState<string[]>([]);

  const handlePrint = () => window.print();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white uppercase tracking-tight">{labels.assessmentLabel} & Scores</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 font-medium">
            Create {labels.assessmentLabel.toLowerCase()}, record student scores, and manage your invigilation schedule.
          </p>
        </div>
        <div className="flex gap-2">
          {activeTab === 'exams' && (
            <button onClick={() => handleOpenExamModal()} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-bold transition-colors shadow-lg shadow-blue-900/20">
              <Plus className="w-4 h-4" /> Create {labels.assessmentLabel.slice(0, -1)}
            </button>
          )}
          {activeTab === 'scores' && (
            <button onClick={handleOpenScoreModal} className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-sm font-bold transition-colors shadow-lg shadow-emerald-900/20">
              <Plus className="w-4 h-4" /> Record Scores
            </button>
          )}
          {activeTab === 'supervision' && supervisionSchedule.length > 0 && (
            <button onClick={handlePrint} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-sm font-bold transition-colors shadow-lg shadow-indigo-900/20">
              <Printer className="w-4 h-4" /> Print Schedule
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl w-fit">
        {[
          { key: 'exams' as const, label: `Create ${labels.assessmentLabel}`, icon: ClipboardCheck },
          { key: 'scores' as const, label: 'Record Scores', icon: Award },
          { key: 'supervision' as const, label: 'Supervision', icon: UserCheck, badge: supervisionSchedule.length },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              "px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 relative",
              activeTab === tab.key ? "bg-white dark:bg-slate-700 text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            )}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
            {'badge' in tab && tab.badge ? (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white text-[8px] flex items-center justify-center rounded-full">{tab.badge}</span>
            ) : null}
          </button>
        ))}
      </div>

      {/* === EXAMS TAB === */}
      {activeTab === 'exams' && (
        <div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: `Total ${labels.assessmentLabel}`, value: examStats.total, color: 'blue' },
              { label: 'Published', value: examStats.published, color: 'emerald' },
              { label: 'Drafts', value: examStats.drafts, color: 'amber' },
              { label: 'Questions Set', value: examStats.totalQuestions, color: 'indigo' },
            ].map((kpi) => (
              <div key={kpi.label} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm">
                <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">{kpi.label}</p>
                <p className={cn("text-2xl font-bold mt-1",
                  kpi.color === 'blue' && "text-blue-600",
                  kpi.color === 'emerald' && "text-emerald-600",
                  kpi.color === 'amber' && "text-amber-600",
                  kpi.color === 'indigo' && "text-indigo-600",
                )}>{kpi.value}</p>
              </div>
            ))}
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm mt-4 overflow-hidden">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input type="text" placeholder={`Search ${labels.assessmentLabel.toLowerCase()}...`} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:border-blue-500 dark:text-white" />
              </div>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {teacherExams.map((exam) => (
                <div key={exam.id} className="bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 p-5 hover:shadow-md transition-shadow group">
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-2.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 rounded-xl">
                      <ClipboardCheck className="w-5 h-5" />
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handleOpenExamModal(exam)} className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-lg"><Edit className="w-3.5 h-3.5" /></button>
                      <button onClick={() => deleteExam(exam.id)} className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">{exam.title}</h3>
                  <p className="text-[10px] font-mono text-slate-400 uppercase mb-3">{exam.subject}</p>
                  <div className="flex items-center gap-3 text-xs text-slate-500 mb-3">
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {exam.duration}m</span>
                    <span className="flex items-center gap-1"><BookOpen className="w-3 h-3" /> {exam.questions.length} Qs</span>
                    <span className="flex items-center gap-1"><Award className="w-3 h-3 text-amber-500" /> {exam.totalMarks}</span>
                  </div>
                  <span className={cn("px-2 py-0.5 rounded-full text-[10px] font-bold uppercase",
                    exam.status === 'Published' ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" :
                    exam.status === 'Closed' ? "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400" :
                    "bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-400"
                  )}>{exam.status}</span>
                </div>
              ))}
              {teacherExams.length === 0 && (
                <div className="col-span-full py-12 text-center text-slate-400">
                  <ClipboardCheck className="w-10 h-10 mx-auto mb-3 opacity-30" />
                  <p className="text-sm font-medium">No {labels.assessmentLabel.toLowerCase()} found.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* === RECORD SCORES TAB === */}
      {activeTab === 'scores' && (
        <div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Total Scores Recorded', value: scoreStats.total, color: 'blue' },
              { label: 'Avg. Score', value: `${scoreStats.avgScore}%`, color: 'emerald' },
              { label: 'Passed', value: scoreStats.passed, color: 'amber' },
              { label: 'Distinctions', value: scoreStats.distinctions, color: 'purple' },
            ].map((kpi) => (
              <div key={kpi.label} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm">
                <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">{kpi.label}</p>
                <p className={cn("text-2xl font-bold mt-1",
                  kpi.color === 'blue' && "text-blue-600",
                  kpi.color === 'emerald' && "text-emerald-600",
                  kpi.color === 'amber' && "text-amber-600",
                  kpi.color === 'purple' && "text-purple-600",
                )}>{kpi.value}</p>
              </div>
            ))}
          </div>

          {/* Recent scores table */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm mt-4 overflow-hidden">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Recently Recorded Scores</h3>
              <button onClick={handleOpenScoreModal} className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 hover:text-emerald-700">
                <Plus className="w-3.5 h-3.5" /> Record New
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[700px]">
                <thead className="bg-slate-50 dark:bg-slate-800">
                  <tr className="border-b border-slate-200 dark:border-slate-700 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="py-2.5 px-4">{labels.learnerSingular}</th>
                    <th className="py-2.5 px-4">Subject</th>
                    <th className="py-2.5 px-4">Type</th>
                    <th className="py-2.5 px-4">Score</th>
                    <th className="py-2.5 px-4">Grade</th>
                    <th className="py-2.5 px-4">Date</th>
                    <th className="py-2.5 px-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="text-sm divide-y divide-slate-100 dark:divide-slate-800">
                  {teacherResults.slice(0, 20).map((result) => {
                    const pct = Math.round((result.score / result.totalMarks) * 100);
                    const grade = pct >= 80 ? 'A' : pct >= 70 ? 'B' : pct >= 60 ? 'C' : pct >= 50 ? 'D' : 'F';
                    const gradeColor = grade === 'A' ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30' :
                      grade === 'B' ? 'text-blue-600 bg-blue-50 dark:bg-blue-900/30' :
                      grade === 'C' ? 'text-amber-600 bg-amber-50 dark:bg-amber-900/30' :
                      grade === 'D' ? 'text-orange-600 bg-orange-50 dark:bg-orange-900/30' :
                      'text-rose-600 bg-rose-50 dark:bg-rose-900/30';
                    return (
                      <tr key={result.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 group">
                        <td className="py-2.5 px-4 font-medium text-slate-900 dark:text-white">{result.studentName}</td>
                        <td className="py-2.5 px-4 text-slate-600 dark:text-slate-400">{result.subject}</td>
                        <td className="py-2.5 px-4">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400">{result.type}</span>
                        </td>
                        <td className="py-2.5 px-4 font-bold text-slate-900 dark:text-white">{result.score}/{result.totalMarks}</td>
                        <td className="py-2.5 px-4"><span className={cn("px-2 py-0.5 rounded-full text-[10px] font-bold", gradeColor)}>{grade}</span></td>
                        <td className="py-2.5 px-4 text-xs text-slate-500">{result.date}</td>
                        <td className="py-2.5 px-4 text-center">
                          <button onClick={() => { deleteExamResult(result.id); showToast({ title: 'Score deleted', variant: 'info' }); }}
                            className="p-1 text-slate-400 hover:text-rose-600 opacity-0 group-hover:opacity-100 transition-all">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                  {teacherResults.length === 0 && (
                    <tr><td colSpan={7} className="py-12 text-center text-slate-400">
                      <Award className="w-10 h-10 mx-auto mb-3 opacity-30" />
                      <p className="text-sm">No scores recorded yet. Click "Record Scores" to begin.</p>
                    </td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* === SUPERVISION TAB === */}
      {activeTab === 'supervision' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {supervisionSchedule.length > 0 ? supervisionSchedule.map((item) => (
            <div key={item.id} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 rounded-xl">
                  <Calendar className="w-5 h-5" />
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">{item.day}</p>
                  <p className="text-xs font-bold text-slate-900 dark:text-white">{item.session}</p>
                </div>
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3 uppercase">{item.subject}</h3>
              <div className="space-y-2 text-xs text-slate-500">
                <p className="flex items-center gap-2"><UserCheck className="w-3 h-3" /> {item.class}</p>
                <p className="flex items-center gap-2"><MapPin className="w-3 h-3" /> {item.hall}</p>
                <p className="flex items-center gap-2"><Clock className="w-3 h-3" /> {item.duration}</p>
              </div>
              <button
                onClick={() => setCheckedInIds((p) => p.includes(item.id) ? p : [...p, item.id])}
                disabled={checkedInIds.includes(item.id)}
                className={cn("w-full mt-4 py-2.5 rounded-xl text-xs font-bold transition-all",
                  checkedInIds.includes(item.id) ? "bg-emerald-600 text-white" : "bg-slate-900 dark:bg-white dark:text-slate-900 text-white hover:opacity-90"
                )}
              >
                {checkedInIds.includes(item.id) ? 'Checked In' : 'Check-in'}
              </button>
            </div>
          )) : (
            <div className="col-span-full py-16 text-center text-slate-400">
              <UserCheck className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">No supervision tasks assigned.</p>
            </div>
          )}
        </div>
      )}

      {/* === EXAM MODAL === */}
      {examModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm" onClick={() => setExamModalOpen(false)}>
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 w-full max-w-4xl flex flex-col overflow-hidden max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                {editingExam ? 'Edit' : 'Create'} {labels.assessmentLabel.slice(0, -1) || 'Assessment'}
              </h2>
              <button onClick={() => setExamModalOpen(false)} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full"><X className="w-5 h-5 text-slate-500" /></button>
            </div>
            <form onSubmit={handleSaveExam} className="p-6 space-y-5 overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Title</label>
                  <input type="text" required value={examForm.title} onChange={(e) => setExamForm({ ...examForm, title: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:border-blue-500 dark:text-white" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">{labels.subjectSingular}</label>
                  <select value={examForm.subject} onChange={(e) => setExamForm({ ...examForm, subject: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:border-blue-500 dark:text-white">
                    {teacherSubjects.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Duration (minutes)</label>
                  <input type="number" required min={1} value={examForm.duration} onChange={(e) => setExamForm({ ...examForm, duration: parseInt(e.target.value) || 60 })}
                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:border-blue-500 dark:text-white" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Total Marks</label>
                  <input type="number" required min={1} value={examForm.totalMarks} onChange={(e) => setExamForm({ ...examForm, totalMarks: parseInt(e.target.value) || 100 })}
                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:border-blue-500 dark:text-white" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Status</label>
                  <select value={examForm.status} onChange={(e) => setExamForm({ ...examForm, status: e.target.value as any })}
                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:border-blue-500 dark:text-white">
                    <option value="Draft">Draft</option>
                    <option value="Published">Published</option>
                    <option value="Closed">Closed</option>
                  </select>
                </div>
              </div>

              {/* Questions */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Questions ({examForm.questions.length})</h3>
                  <button type="button" onClick={handleAddQuestion} className="text-xs font-bold text-blue-600 hover:underline">+ Add Question</button>
                </div>
                <div className="space-y-3">
                  {examForm.questions.map((q, qi) => (
                    <div key={q.id} className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-slate-400">Q{qi + 1}</span>
                        <button type="button" onClick={() => setExamForm({ ...examForm, questions: examForm.questions.filter((_, i) => i !== qi) })} className="text-rose-500 hover:text-rose-700"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                      <textarea placeholder="Enter question..." value={q.text} onChange={(e) => handleQuestionChange(qi, 'text', e.target.value)}
                        className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm dark:text-white" rows={2} />
                      <div className="grid grid-cols-2 gap-3">
                        {q.options.map((opt, oi) => (
                          <div key={oi} className="flex items-center gap-2">
                            <input type="radio" name={`q-${q.id}`} checked={q.correctOption === oi} onChange={() => handleQuestionChange(qi, 'correctOption', oi)} className="w-3.5 h-3.5 text-blue-600" />
                            <input type="text" placeholder={`Option ${String.fromCharCode(65 + oi)}`} value={opt} onChange={(e) => handleOptionChange(qi, oi, e.target.value)}
                              className="flex-1 px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs dark:text-white" />
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setExamModalOpen(false)} className="flex-1 px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-300">Cancel</button>
                <button type="submit" className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-900/20">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* === RECORD SCORES MODAL === */}
      {scoreModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm" onClick={() => setScoreModalOpen(false)}>
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 w-full max-w-3xl flex flex-col overflow-hidden max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Record {labels.assessmentLabel.slice(0, -1)} Scores</h2>
              <button onClick={() => setScoreModalOpen(false)} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full"><X className="w-5 h-5 text-slate-500" /></button>
            </div>
            <div className="p-6 space-y-5 overflow-y-auto">
              {/* Assessment details */}
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">{labels.assessmentLabel.slice(0, -1)} Title</label>
                  <input type="text" value={assessmentTitle} onChange={(e) => setAssessmentTitle(e.target.value)} placeholder={`e.g. ${isCollege ? 'Mid-Semester Test' : 'First Term Test'} 1`}
                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:border-blue-500 dark:text-white" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">{labels.structureSingular}</label>
                  <select value={selectedClassId} onChange={(e) => handleClassChange(e.target.value)}
                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:border-blue-500 dark:text-white">
                    <option value="">Select {labels.structureSingular.toLowerCase()}</option>
                    {assignedClasses.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">{labels.subjectSingular}</label>
                  <select value={selectedSubject} onChange={(e) => setSelectedSubject(e.target.value)}
                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:border-blue-500 dark:text-white">
                    {teacherSubjects.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Type</label>
                  <select value={assessmentType} onChange={(e) => setAssessmentType(e.target.value as any)}
                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:border-blue-500 dark:text-white">
                    <option value="Test">Test</option>
                    <option value="Exam">Exam</option>
                    <option value="Assignment">Assignment</option>
                    <option value="Quiz">Quiz</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Total Marks</label>
                  <input type="number" min={1} value={totalMarks} onChange={(e) => setTotalMarks(parseInt(e.target.value) || 20)}
                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:border-blue-500 dark:text-white" />
                </div>
              </div>

              {/* Student scores */}
              {scoreEntries.length > 0 && (
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      {labels.learnerPlural} ({scoreEntries.length})
                    </h3>
                    <span className="text-xs text-slate-400">Out of {totalMarks}</span>
                  </div>
                  <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
                    <table className="w-full text-left">
                      <thead className="bg-slate-50 dark:bg-slate-800">
                        <tr className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                          <th className="py-2 px-4">#</th>
                          <th className="py-2 px-4">{labels.learnerSingular} Name</th>
                          <th className="py-2 px-4 text-right">Score</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {scoreEntries.map((entry, i) => (
                          <tr key={entry.studentId} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
                            <td className="py-2 px-4 text-xs text-slate-400">{i + 1}</td>
                            <td className="py-2 px-4 text-sm font-medium text-slate-900 dark:text-white">{entry.studentName}</td>
                            <td className="py-2 px-4 text-right">
                              <input type="number" min={0} max={totalMarks} value={entry.score}
                                onChange={(e) => handleScoreChange(entry.studentId, parseInt(e.target.value) || 0)}
                                className="w-20 px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-right font-bold focus:outline-none focus:border-blue-500 dark:text-white" />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {selectedClassId && scoreEntries.length === 0 && (
                <p className="text-center text-sm text-slate-400 py-8">No active {labels.learnerPlural.toLowerCase()} found in this {labels.structureSingular.toLowerCase()}.</p>
              )}

              <div className="pt-4 flex gap-3">
                <button onClick={() => setScoreModalOpen(false)} className="flex-1 px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-300">Cancel</button>
                <button onClick={handleSaveScores} className="flex-1 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-emerald-900/20 flex items-center justify-center gap-2">
                  <Save className="w-4 h-4" /> Save All Scores
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
