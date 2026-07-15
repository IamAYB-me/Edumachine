import React, { useState, useEffect, useMemo } from 'react';
import { useDataStore, Exam, ExamResult } from '@/store/useDataStore';
import { useAuthStore } from '@/store/useAuthStore';
import { Clock, CheckCircle, ChevronLeft, ChevronRight, Send, Calendar, MapPin, UserCheck, LayoutGrid, Printer, Mail, Phone } from 'lucide-react';
import { cn } from '@/utils';
import { useLocation, useNavigate } from 'react-router-dom';
import { getPortalLevelLabels, resolveSchoolProfile } from '@/utils/schoolProfile';

export default function ExamSession() {
  const { exams, addExamResult, examTimetable, students, schools } = useDataStore();
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [activeTab, setActiveTab] = useState<'cbt' | 'timetable'>('cbt');
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null);
  const [isStarted, setIsStarted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [isFinished, setIsClosed] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  const currentStudent = useMemo(
    () => students.find((student) => student.id === user?.id || student.email === user?.email || student.name === user?.name),
    [students, user?.email, user?.id, user?.name]
  );
  const studentClass = currentStudent?.class ?? 'Grade 10 - A';
  const schoolProfile = resolveSchoolProfile(user ?? null, schools);
  const labels = getPortalLevelLabels(schoolProfile.portalLevel);

  // Filter timetable for the logged-in student's class
  const studentTimetable = useMemo(() => {
    return examTimetable.filter(item => item.class === studentClass);
  }, [examTimetable, studentClass]);

  useEffect(() => {
    const state = location.state as { tab?: 'cbt' | 'timetable' } | null;
    if (state?.tab) {
      setActiveTab(state.tab);
    }
  }, [location.state]);

  useEffect(() => {
    if (isStarted && timeLeft > 0) {
      const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
      return () => clearInterval(timer);
    } else if (isStarted && timeLeft === 0) {
      handleSubmit();
    }
  }, [isStarted, timeLeft]);

  const startExam = (exam: Exam) => {
    setSelectedExam(exam);
    setIsStarted(true);
    setTimeLeft(exam.duration * 60);
    setAnswers({});
    setCurrentQuestion(0);
  };

  const handleAnswer = (optionIndex: number) => {
    if (!selectedExam) return;
    setAnswers({ ...answers, [selectedExam.questions[currentQuestion].id]: optionIndex });
  };

  const handleSubmit = () => {
    if (!selectedExam || !user) return;
    
    let score = 0;
    selectedExam.questions.forEach(q => {
      if (answers[q.id] === q.correctOption) score += 1;
    });

    const result: Omit<ExamResult, 'id'> = {
      examId: selectedExam.id,
      examTitle: selectedExam.title,
      studentId: user.id,
      studentName: user.name,
      score: score,
      totalMarks: selectedExam.questions.length,
      date: new Date().toISOString().split('T')[0]
    };

    addExamResult(result);
    setIsClosed(true);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (isFinished) {
    return (
      <div className="flex flex-col items-center justify-center h-[80vh] space-y-6">
        <div className="p-6 bg-emerald-100 text-emerald-700 rounded-full">
          <CheckCircle className="w-16 h-16" />
        </div>
        <div className="text-center">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white">{labels.assessmentLabel.replace('Assessments', 'Assessment')} Submitted Successfully!</h2>
          <p className="text-slate-500 mt-2">Your responses have been recorded. You can view your {labels.resultsLabel.toLowerCase()} in the performance tab.</p>
        </div>
        <button 
          onClick={() => navigate('/student')}
          className="px-8 py-3 bg-blue-600 text-white rounded-xl font-bold shadow-lg hover:bg-blue-700 transition-all"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  if (!isStarted) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 print:hidden">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white uppercase tracking-tight">{labels.assessmentLabel} Portal</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 font-medium">Access your {labels.assessmentLabel.toLowerCase()} timetable and CBT assessments.</p>
          </div>
          {activeTab === 'timetable' && studentTimetable.length > 0 && (
            <button 
              onClick={handlePrint}
              className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-indigo-900/20 active:scale-95"
            >
              <Printer className="w-4 h-4" />
              Print {labels.assessmentLabel} Timetable
            </button>
          )}
        </div>

        {/* Tabs - Hidden during print */}
        <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl w-fit print:hidden">
          <button 
            onClick={() => setActiveTab('cbt')}
            className={cn(
              "px-6 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2",
              activeTab === 'cbt' ? "bg-white dark:bg-slate-700 text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            )}
          >
            <LayoutGrid className="w-4 h-4" />
            CBT Assessments
          </button>
          <button 
            onClick={() => setActiveTab('timetable')}
            className={cn(
              "px-6 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2",
              activeTab === 'timetable' ? "bg-white dark:bg-slate-700 text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            )}
          >
            <Calendar className="w-4 h-4" />
            {labels.assessmentLabel} Timetable
          </button>
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
                <h2 className="text-xl font-bold text-slate-700 uppercase tracking-widest mb-3">Official {labels.assessmentLabel} Timetable</h2>
                <div className="space-y-1 text-sm text-slate-600">
                  {schoolProfile.address ? <p className="flex items-center gap-2"><MapPin className="h-4 w-4" /> {schoolProfile.address}</p> : null}
                  {schoolProfile.phone ? <p className="flex items-center gap-2"><Phone className="h-4 w-4" /> {schoolProfile.phone}</p> : null}
                  {schoolProfile.email ? <p className="flex items-center gap-2"><Mail className="h-4 w-4" /> {schoolProfile.email}</p> : null}
                </div>
              </div>
            </div>
            <div className="min-w-[240px] rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
              <p><span className="font-bold text-slate-900">{labels.learnerSingular}:</span> {user?.name}</p>
              <p><span className="font-bold text-slate-900">{labels.structureSingular}:</span> {studentClass}</p>
              <p><span className="font-bold text-slate-900">Date:</span> {new Date().toLocaleDateString()}</p>
            </div>
          </div>
        </div>

        {activeTab === 'cbt' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 print:hidden">
            {exams.filter(e => e.status === 'Published').map(exam => (
              <div key={exam.id} className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 space-y-6 shadow-sm hover:shadow-xl transition-all group">
                <div className="flex justify-between items-start">
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-2xl group-hover:scale-110 transition-transform">
                    <Clock className="w-8 h-8" />
                  </div>
                  <span className="px-3 py-1 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 rounded-lg text-[10px] font-black uppercase tracking-widest">Available Now</span>
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white leading-tight">{exam.title}</h3>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] mt-2">{exam.subject}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl flex flex-col gap-1">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Duration</span>
                    <span className="text-xs font-black text-slate-900 dark:text-white">{exam.duration} Mins</span>
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl flex flex-col gap-1">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Questions</span>
                    <span className="text-xs font-black text-slate-900 dark:text-white">{exam.questions.length} Items</span>
                  </div>
                </div>
                <button 
                  onClick={() => startExam(exam)}
                  className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-blue-900/20 active:scale-95"
                >
                  Start {labels.assessmentLabel.replace('Assessments', 'Assessment')}
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 print:grid-cols-2 print:gap-4">
            {studentTimetable.length > 0 ? studentTimetable.map((item) => (
              <div key={item.id} className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 p-8 shadow-sm hover:shadow-xl transition-all group relative overflow-hidden print:border-2 print:border-slate-200 print:rounded-3xl print:p-6 print:shadow-none">
                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-8 print:mb-4">
                    <div className="p-4 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-2xl group-hover:scale-110 transition-transform print:p-2">
                      <Calendar className="w-8 h-8 print:w-6 print:h-6" />
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-1">{item.day}</p>
                      <p className="text-sm font-black text-slate-900 dark:text-white">{item.session} Session</p>
                    </div>
                  </div>

                  <h3 className="text-xl font-black text-slate-900 dark:text-white mb-6 leading-tight uppercase tracking-tight print:text-lg print:mb-4">{item.subject}</h3>

                  <div className="space-y-4 print:space-y-2">
                    <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-transparent group-hover:border-indigo-500/20 transition-all print:p-2 print:bg-transparent">
                      <div className="p-2 bg-white dark:bg-slate-700 rounded-lg shadow-sm text-slate-400 print:hidden">
                        <MapPin className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{labels.assessmentLabel.replace('Assessments', 'Assessment')} Hall</p>
                        <p className="text-sm font-bold text-slate-900 dark:text-white print:text-xs">{item.hall}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-transparent group-hover:border-indigo-500/20 transition-all print:p-2 print:bg-transparent">
                      <div className="p-2 bg-white dark:bg-slate-700 rounded-lg shadow-sm text-slate-400 print:hidden">
                        <Clock className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Paper Duration</p>
                        <p className="text-sm font-bold text-slate-900 dark:text-white print:text-xs">{item.duration}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-transparent group-hover:border-indigo-500/20 transition-all print:p-2 print:bg-transparent">
                      <div className="p-2 bg-white dark:bg-slate-700 rounded-lg shadow-sm text-slate-400 print:hidden">
                        <UserCheck className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Invigilator</p>
                        <p className="text-sm font-bold text-slate-900 dark:text-white print:text-xs">{item.invigilator}</p>
                      </div>
                    </div>
                  </div>
                </div>
                {/* Abstract background */}
                <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-indigo-500/5 rounded-full blur-3xl print:hidden"></div>
              </div>
            )) : (
              <div className="col-span-full py-32 flex flex-col items-center justify-center text-center">
                <div className="w-24 h-24 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6">
                  <Calendar className="w-12 h-12 text-slate-200" />
                </div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-widest">No {labels.assessmentLabel} Scheduled</h3>
                <p className="text-sm text-slate-500 mt-2 max-w-xs mx-auto font-medium">Your {labels.assessmentLabel.toLowerCase()} timetable hasn't been published by the admin yet.</p>
              </div>
            )}
          </div>
        )}

        {/* Print Footer - Only visible during print */}
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
      </div>
    );
  }

  const currentQ = selectedExam?.questions[currentQuestion];

  return (
    <div className="max-w-4xl mx-auto h-full flex flex-col space-y-6">
      {/* Exam Header */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex justify-between items-center shadow-sm">
        <div>
          <h2 className="font-bold text-slate-900 dark:text-white">{selectedExam?.title}</h2>
          <p className="text-xs text-slate-500">{selectedExam?.subject}</p>
        </div>
        <div className={cn(
          "px-4 py-2 rounded-xl font-mono font-bold flex items-center gap-2",
          timeLeft < 300 ? "bg-rose-100 text-rose-700 animate-pulse" : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
        )}>
          <Clock className="w-4 h-4" />
          {formatTime(timeLeft)}
        </div>
      </div>

      <div className="flex-1 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col overflow-hidden">
        {/* Progress Bar */}
        <div className="h-1.5 bg-slate-100 dark:bg-slate-800">
          <div 
            className="h-full bg-blue-600 transition-all duration-300" 
            style={{ width: `${((currentQuestion + 1) / (selectedExam?.questions.length || 1)) * 100}%` }}
          />
        </div>

        <div className="p-8 flex-1 flex flex-col">
          <div className="mb-8">
            <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">Question {currentQuestion + 1} of {selectedExam?.questions.length}</span>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-2 leading-relaxed">
              {currentQ?.text}
            </h3>
          </div>

          <div className="grid grid-cols-1 gap-4 flex-1">
            {currentQ?.options.map((opt, i) => (
              <button
                key={i}
                onClick={() => handleAnswer(i)}
                className={cn(
                  "p-4 rounded-2xl border-2 text-left transition-all flex items-center gap-4 group",
                  answers[currentQ.id] === i 
                    ? "border-blue-600 bg-blue-50 dark:bg-blue-900/20" 
                    : "border-slate-100 dark:border-slate-800 hover:border-blue-200 dark:hover:border-blue-800"
                )}
              >
                <div className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm",
                  answers[currentQ.id] === i 
                    ? "bg-blue-600 text-white" 
                    : "bg-slate-100 dark:bg-slate-800 text-slate-500 group-hover:bg-blue-100"
                )}>
                  {String.fromCharCode(65 + i)}
                </div>
                <span className={cn(
                  "font-medium",
                  answers[currentQ.id] === i ? "text-blue-900 dark:text-white" : "text-slate-700 dark:text-slate-300"
                )}>
                  {opt}
                </span>
              </button>
            ))}
          </div>

          <div className="mt-8 pt-8 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
            <button 
              disabled={currentQuestion === 0}
              onClick={() => setCurrentQuestion(prev => prev - 1)}
              className="flex items-center gap-2 px-6 py-2.5 text-slate-600 font-bold hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-all disabled:opacity-30"
            >
              <ChevronLeft className="w-5 h-5" /> Previous
            </button>
            
            {currentQuestion === (selectedExam?.questions.length || 0) - 1 ? (
              <button 
                onClick={handleSubmit}
                className="flex items-center gap-2 px-8 py-2.5 bg-emerald-600 text-white font-bold rounded-xl shadow-lg shadow-emerald-900/20 hover:bg-emerald-700 transition-all"
              >
                Submit {labels.assessmentLabel.replace('Assessments', 'Assessment')} <Send className="w-4 h-4" />
              </button>
            ) : (
              <button 
                onClick={() => setCurrentQuestion(prev => prev + 1)}
                className="flex items-center gap-2 px-8 py-2.5 bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-900/20 hover:bg-blue-700 transition-all"
              >
                Next Question <ChevronRight className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Question Navigation */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-wrap gap-2">
        {selectedExam?.questions.map((q, i) => (
          <button
            key={i}
            onClick={() => setCurrentQuestion(i)}
            className={cn(
              "w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm transition-all",
              currentQuestion === i ? "bg-blue-600 text-white shadow-md ring-4 ring-blue-500/20" :
              answers[q.id] !== undefined ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30" :
              "bg-slate-100 dark:bg-slate-800 text-slate-500"
            )}
          >
            {i + 1}
          </button>
        ))}
      </div>
    </div>
  );
}
