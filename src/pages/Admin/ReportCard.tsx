import React, { useState, useMemo } from 'react';
import { Printer, Download, Search, Filter, Award, Users, BookOpen, CheckCircle, Clock, Mail, Phone, MapPin, ChevronDown, Eye, AlertCircle, Lock } from 'lucide-react';
import { useDataStore } from '@/store/useDataStore';
import { useAuthStore } from '@/store/useAuthStore';
import { useCurrency } from '@/hooks/useCurrency';
import { useSettingsStore } from '@/store/useSettingsStore';
import { resolveSchoolProfile, getPortalLevelLabels } from '@/utils/schoolProfile';
import { cn } from '@/utils';

const getGrade = (score: number, total: number) => {
  if (!total || total <= 0) return { label: 'N/A', remark: 'No Data', color: 'text-slate-400', bg: 'bg-slate-50 dark:bg-slate-800/60' };
  const percentage = (score / total) * 100;
  if (percentage >= 80) return { label: 'A', remark: 'Excellent', color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20' };
  if (percentage >= 70) return { label: 'B', remark: 'Very Good', color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20' };
  if (percentage >= 60) return { label: 'C', remark: 'Good', color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/20' };
  if (percentage >= 50) return { label: 'D', remark: 'Pass', color: 'text-orange-600', bg: 'bg-orange-50 dark:bg-orange-900/20' };
  return { label: 'F', remark: 'Fail', color: 'text-rose-600', bg: 'bg-rose-50 dark:bg-rose-900/20' };
};

const getPositionOrdinal = (pos: number) => {
  if (pos % 100 >= 11 && pos % 100 <= 13) return `${pos}th`;
  if (pos % 10 === 1) return `${pos}st`;
  if (pos % 10 === 2) return `${pos}nd`;
  if (pos % 10 === 3) return `${pos}rd`;
  return `${pos}th`;
};

export default function ReportCard() {
  const { examResults, students, classes, attendance, feeRecords, subjects, schools } = useDataStore();
  const { user } = useAuthStore();
  const { format } = useCurrency();
  const { globalSettings } = useSettingsStore();
  const schoolProfile = resolveSchoolProfile(user ?? null, schools);
  const labels = getPortalLevelLabels(schoolProfile.portalLevel);

  const isStudent = user?.role === 'STUDENT';
  const isParent = user?.role === 'PARENT';
  const isAdmin = user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN';

  const [selectedClass, setSelectedClass] = useState<string>('');
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [selectedTerm, setSelectedTerm] = useState<string>(labels.termOptions[0]);
  const [selectedSession, setSelectedSession] = useState<string>(new Date().getFullYear().toString());

  const filteredStudents = useMemo(() => {
    if (isStudent) return students.filter(s => s.id === user?.id || s.name === user?.name);
    if (isParent) return students.filter(s => s.parentName === user?.name || s.fatherName === user?.name || s.motherName === user?.name);
    if (selectedClass) return students.filter(s => s.class === classes.find(c => c.id === selectedClass)?.name && s.status === 'Active');
    return students.filter(s => s.status === 'Active');
  }, [students, classes, selectedClass, isStudent, isParent, user]);

  const selectedStudent = useMemo(() => {
    if (isStudent) return students.find(s => s.id === user?.id || s.name === user?.name);
    if (isParent && !selectedStudentId) return filteredStudents[0];
    return students.find(s => s.id === selectedStudentId);
  }, [students, selectedStudentId, isStudent, isParent, user, filteredStudents]);

  const studentResults = useMemo(() => {
    if (!selectedStudent) return [];
    return examResults.filter(r =>
      r.studentId === selectedStudent.id &&
      (!r.term || r.term === selectedTerm)
    );
  }, [examResults, selectedStudent, selectedTerm]);

  const subjectResults = useMemo(() => {
    const map = new Map<string, { scores: { type: string; score: number; total: number }[] }>();
    studentResults.forEach(r => {
      if (!r.subject) return;
      if (!map.has(r.subject)) map.set(r.subject, { scores: [] });
      map.get(r.subject)!.scores.push({ type: r.type, score: r.score, total: r.totalMarks });
    });

    return Array.from(map.entries()).map(([subject, data]) => {
      const totalScore = data.scores.reduce((sum, s) => sum + s.score, 0);
      const totalMax = data.scores.reduce((sum, s) => sum + s.total, 0);
      const avgScore = data.scores.length > 0 ? Math.round(totalScore / data.scores.length) : 0;
      const avgTotal = data.scores.length > 0 ? Math.round(totalMax / data.scores.length) : 0;
      const ca = data.scores.filter(s => s.type === 'Test' || s.type === 'Assignment' || s.type === 'Quiz');
      const exam = data.scores.filter(s => s.type === 'Exam');
      const caScore = ca.reduce((sum, s) => sum + s.score, 0);
      const caTotal = ca.reduce((sum, s) => sum + s.total, 0);
      const examScore = exam.reduce((sum, s) => sum + s.score, 0);
      const examTotal = exam.reduce((sum, s) => sum + s.total, 0);

      return {
        subject,
        caScore,
        caTotal: caTotal || 40,
        examScore,
        examTotal: examTotal || 60,
        totalScore,
        totalMax: totalMax || 100,
        grade: getGrade(totalScore, totalMax || 100),
        assessments: data.scores,
      };
    }).sort((a, b) => a.subject.localeCompare(b.subject));
  }, [studentResults]);

  const overallStats = useMemo(() => {
    const totalObtained = subjectResults.reduce((sum, s) => sum + s.totalScore, 0);
    const totalMax = subjectResults.reduce((sum, s) => sum + s.totalMax, 0);
    const avg = totalMax > 0 ? Math.round((totalObtained / totalMax) * 100) : 0;
    const overallGrade = getGrade(totalObtained, totalMax || 1);

    const classStudents = students.filter(s => s.class === selectedStudent?.class && s.status === 'Active');
    const classAverages = classStudents.map(cs => {
      const csResults = examResults.filter(r => r.studentId === cs.id && (!r.term || r.term === selectedTerm));
      const csTotal = csResults.reduce((sum, r) => sum + r.score, 0);
      const csMax = csResults.reduce((sum, r) => sum + r.totalMarks, 0);
      return { studentId: cs.id, avg: csMax > 0 ? (csTotal / csMax) * 100 : 0 };
    }).sort((a, b) => b.avg - a.avg);

    const position = classAverages.findIndex(c => c.studentId === selectedStudent?.id) + 1;

    const studentAttendance = attendance.filter(a => a.targetId === selectedStudent?.id && a.type === 'Student');
    const termAttendance = studentAttendance.filter(a => {
      if (!selectedStudent?.class) return true;
      const classObj = classes.find(c => c.name === selectedStudent.class);
      return !classObj || a.classId === classObj.id || !a.classId;
    });
    const present = termAttendance.filter(a => a.status === 'Present').length;
    const absent = termAttendance.filter(a => a.status === 'Absent').length;
    const late = termAttendance.filter(a => a.status === 'Late').length;
    const excused = termAttendance.filter(a => a.status === 'Excused').length;
    const totalDays = termAttendance.length || 1;
    const attendanceRate = Math.round((present / totalDays) * 100);

    const studentFees = feeRecords.filter(f => f.studentId === selectedStudent?.id);
    const totalFees = studentFees.reduce((sum, f) => sum + f.amount, 0);
    const paidFees = studentFees.filter(f => f.status === 'Paid').reduce((sum, f) => sum + f.amount, 0);
    const pendingFees = totalFees - paidFees;

    return {
      totalObtained,
      totalMax,
      avg,
      overallGrade,
      position: position || '-',
      totalStudents: classStudents.length,
      present,
      absent,
      late,
      excused,
      totalDays,
      attendanceRate,
      totalFees,
      paidFees,
      pendingFees,
      feeStatus: pendingFees <= 0 ? 'Fully Paid' : paidFees > 0 ? 'Partially Paid' : 'Unpaid',
    };
  }, [subjectResults, selectedStudent, students, examResults, selectedTerm, attendance, classes, feeRecords]);

  const signatories = [
    { label: labels.teacherSignatoryLabel, name: schoolProfile.teacherSignatoryName || `${labels.teacherSingular} Signatory`, signatureUrl: schoolProfile.teacherSignatureUrl },
    { label: labels.hodSignatoryLabel, name: schoolProfile.hodSignatoryName || 'HOD Signatory', signatureUrl: schoolProfile.hodSignatureUrl },
    { label: labels.headSignatoryLabel, name: schoolProfile.principalSignatoryName || `${labels.headSignatoryLabel} Signatory`, signatureUrl: schoolProfile.principalSignatureUrl },
  ];

  const isDebtor = overallStats.pendingFees > 0;
  const canPrint = isAdmin || !isDebtor;

  const handlePrint = () => window.print();

  const handleDownloadPDF = () => {
    const printContent = document.getElementById('report-card-printable');
    if (!printContent) return;
    const w = window.open('', '_blank');
    if (!w) return;
    w.document.write(`
      <html><head><title>Report Card - ${selectedStudent?.name || 'Student'}</title>
      <style>
        @page { size: A4 portrait; margin: 15mm; }
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #1e293b; margin: 0; padding: 0; font-size: 12px; }
        table { width: 100%; border-collapse: collapse; }
        th, td { border: 1px solid #e2e8f0; padding: 6px 8px; text-align: left; font-size: 11px; }
        th { background: #f1f5f9; font-weight: 700; text-transform: uppercase; font-size: 9px; letter-spacing: 0.05em; }
        .header { text-align: center; border-bottom: 3px solid #2563eb; padding-bottom: 12px; margin-bottom: 16px; }
        .header h1 { font-size: 18px; margin: 0; color: #1e293b; }
        .header p { font-size: 10px; color: #64748b; margin: 2px 0; }
        .section-title { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: #2563eb; border-bottom: 2px solid #2563eb; padding-bottom: 4px; margin: 16px 0 8px; }
        .grade-a { color: #059669; font-weight: 700; }
        .grade-b { color: #2563eb; font-weight: 700; }
        .grade-c { color: #d97706; font-weight: 700; }
        .grade-d { color: #ea580c; font-weight: 700; }
        .grade-f { color: #dc2626; font-weight: 700; }
        .sig-block { display: inline-block; width: 30%; text-align: center; vertical-align: top; margin-top: 30px; }
        .sig-line { border-top: 1px dashed #94a3b8; margin-top: 40px; padding-top: 4px; }
        .print-hide { display: none; }
        @media print { .print-hide { display: none !important; } }
      </style></head><body>${printContent.innerHTML}</body></html>
    `);
    w.document.close();
    setTimeout(() => { w.print(); w.close(); }, 500);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{labels.resultsLabel}</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Generate and print student report cards.</p>
        </div>
        {canPrint && (
          <div className="flex gap-2">
            <button onClick={handlePrint} className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-900/20 transition-all">
              <Printer className="w-4 h-4" /> Print
            </button>
            <button onClick={handleDownloadPDF} className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-sm font-bold transition-all">
              <Download className="w-4 h-4" /> Download PDF
            </button>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 flex flex-col sm:flex-row gap-3">
        {!isStudent && !isParent && (
          <div className="flex-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 block">{labels.structureSingular}</label>
            <select value={selectedClass} onChange={(e) => { setSelectedClass(e.target.value); setSelectedStudentId(''); }}
              className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium focus:outline-none focus:border-blue-500 dark:text-white">
              <option value="">All {labels.structurePlural}</option>
              {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
        )}
        <div className="flex-1">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 block">{labels.learnerSingular}</label>
          <select value={selectedStudentId || (isStudent ? user?.id : isParent && filteredStudents[0]?.id || '')}
            onChange={(e) => setSelectedStudentId(e.target.value)}
            className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium focus:outline-none focus:border-blue-500 dark:text-white">
            {filteredStudents.map(s => <option key={s.id} value={s.id}>{s.name} ({s.regNo || s.admissionNumber || s.id})</option>)}
          </select>
        </div>
        <div className="flex-1">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 block">{labels.termLabel}</label>
          <select value={selectedTerm} onChange={(e) => setSelectedTerm(e.target.value)}
            className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium focus:outline-none focus:border-blue-500 dark:text-white">
            {labels.termOptions.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div className="flex-1">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 block">Session</label>
          <select value={selectedSession} onChange={(e) => setSelectedSession(e.target.value)}
            className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium focus:outline-none focus:border-blue-500 dark:text-white">
            {[0, 1, 2].map(y => { const yr = new Date().getFullYear() - y; return <option key={yr} value={yr.toString()}>{yr}/{yr + 1}</option>; })}
          </select>
        </div>
      </div>

      {/* Report Card */}
      {selectedStudent ? (
        <div id="report-card-printable" className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
          {/* School Header */}
          <div className="text-center py-6 px-8 border-b-4 border-blue-600">
            {schoolProfile.logoUrl && (
              <img src={schoolProfile.logoUrl} alt="School Logo" className="w-16 h-16 mx-auto mb-3 rounded-full object-contain" />
            )}
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight uppercase">{schoolProfile.name || globalSettings.appName}</h1>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium mt-1">{schoolProfile.address || 'School Address'}</p>
            <div className="flex items-center justify-center gap-4 mt-1">
              {schoolProfile.phone && <span className="text-[10px] text-slate-400 flex items-center gap-1"><Phone className="w-3 h-3" />{schoolProfile.phone}</span>}
              {schoolProfile.email && <span className="text-[10px] text-slate-400 flex items-center gap-1"><Mail className="w-3 h-3" />{schoolProfile.email}</span>}
            </div>
            <div className="mt-3 inline-block bg-blue-600 text-white px-6 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest">
              Student {labels.resultsLabel}
            </div>
          </div>

          <div className="p-8 space-y-6">
            {/* Student Info */}
            <div className="flex flex-col sm:flex-row gap-6 items-start">
              {selectedStudent.passportUrl && (
                <img src={selectedStudent.passportUrl} alt={selectedStudent.name}
                  className="w-24 h-28 object-cover rounded-xl border-2 border-slate-200 dark:border-slate-700 shadow-lg" />
              )}
              <div className="flex-1 grid grid-cols-2 gap-x-8 gap-y-2 text-sm">
                <div><span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Name</span><p className="font-bold text-slate-900 dark:text-white">{selectedStudent.name}</p></div>
                <div><span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{labels.structureSingular}</span><p className="font-bold text-slate-900 dark:text-white">{selectedStudent.class}</p></div>
                <div><span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Reg No.</span><p className="font-bold text-slate-900 dark:text-white font-mono">{selectedStudent.regNo || selectedStudent.admissionNumber || 'N/A'}</p></div>
                <div><span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Gender</span><p className="font-bold text-slate-900 dark:text-white">{selectedStudent.gender || 'N/A'}</p></div>
                <div><span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{labels.termLabel}</span><p className="font-bold text-slate-900 dark:text-white">{selectedTerm}</p></div>
                <div><span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Session</span><p className="font-bold text-slate-900 dark:text-white">{selectedSession}/{parseInt(selectedSession) + 1}</p></div>
                {selectedStudent.dateOfBirth && (
                  <div><span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Date of Birth</span><p className="font-bold text-slate-900 dark:text-white">{selectedStudent.dateOfBirth}</p></div>
                )}
                {selectedStudent.house && (
                  <div><span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">House</span><p className="font-bold text-slate-900 dark:text-white">{selectedStudent.house}</p></div>
                )}
              </div>
            </div>

            {/* Debtor Lock Banner */}
            {isDebtor && !isAdmin && (
              <div className="bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 rounded-xl p-4 flex items-start gap-3">
                <div className="p-2 bg-rose-100 dark:bg-rose-900/40 rounded-lg">
                  <Lock className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                </div>
                <div>
                  <p className="text-sm font-bold text-rose-800 dark:text-rose-300">Report Card Locked</p>
                  <p className="text-xs text-rose-600 dark:text-rose-400 mt-0.5">
                    Printing and downloading are restricted because there is an outstanding balance of <strong>{format(overallStats.pendingFees)}</strong>. 
                    Please clear all fees to unlock report card printing.
                  </p>
                </div>
              </div>
            )}

            {/* Academic Summary */}
            <div>
              <h3 className="text-xs font-bold text-blue-600 uppercase tracking-[0.15em] border-b-2 border-blue-600 pb-1 mb-3">Academic Summary</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-3 text-center">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Total Score</p>
                  <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">{overallStats.totalObtained}/{overallStats.totalMax}</p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-3 text-center">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Average</p>
                  <p className={cn("text-2xl font-black mt-1", overallStats.overallGrade.color)}>{overallStats.avg}%</p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-3 text-center">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Overall Grade</p>
                  <p className={cn("text-2xl font-black mt-1", overallStats.overallGrade.color)}>{overallStats.overallGrade.label}</p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-3 text-center">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Position</p>
                  <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                    {typeof overallStats.position === 'number' ? getPositionOrdinal(overallStats.position) : overallStats.position}
                    <span className="text-xs font-medium text-slate-500"> / {overallStats.totalStudents}</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Subject Results */}
            <div>
              <h3 className="text-xs font-bold text-blue-600 uppercase tracking-[0.15em] border-b-2 border-blue-600 pb-1 mb-3">Subject Results</h3>
              {subjectResults.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-800">
                        <th className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-4 py-2.5 text-left">S/N</th>
                        <th className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-4 py-2.5 text-left">{labels.subjectSingular}</th>
                        <th className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-4 py-2.5 text-center">CA (40)</th>
                        <th className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-4 py-2.5 text-center">Exam (60)</th>
                        <th className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-4 py-2.5 text-center">Total (100)</th>
                        <th className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-4 py-2.5 text-center">Grade</th>
                        <th className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-4 py-2.5 text-center">Remark</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {subjectResults.map((sr, i) => (
                        <tr key={sr.subject} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                          <td className="px-4 py-2.5 text-slate-500 font-medium">{i + 1}</td>
                          <td className="px-4 py-2.5 font-bold text-slate-900 dark:text-white">{sr.subject}</td>
                          <td className="px-4 py-2.5 text-center text-slate-700 dark:text-slate-300">{sr.caScore}/{sr.caTotal}</td>
                          <td className="px-4 py-2.5 text-center text-slate-700 dark:text-slate-300">{sr.examScore}/{sr.examTotal}</td>
                          <td className="px-4 py-2.5 text-center font-bold text-slate-900 dark:text-white">{sr.totalScore}/{sr.totalMax}</td>
                          <td className="px-4 py-2.5 text-center">
                            <span className={cn("inline-block px-2.5 py-0.5 rounded-full text-xs font-bold", sr.grade.bg, sr.grade.color)}>{sr.grade.label}</span>
                          </td>
                          <td className="px-4 py-2.5 text-center text-xs font-medium text-slate-600 dark:text-slate-400">{sr.grade.remark}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="bg-slate-50 dark:bg-slate-800 font-bold">
                        <td colSpan={2} className="px-4 py-2.5 text-xs uppercase tracking-widest text-slate-500">Total / Average</td>
                        <td className="px-4 py-2.5 text-center text-sm">{subjectResults.reduce((s, r) => s + r.caScore, 0)}/{subjectResults.reduce((s, r) => s + r.caTotal, 0)}</td>
                        <td className="px-4 py-2.5 text-center text-sm">{subjectResults.reduce((s, r) => s + r.examScore, 0)}/{subjectResults.reduce((s, r) => s + r.examTotal, 0)}</td>
                        <td className="px-4 py-2.5 text-center text-sm">{overallStats.totalObtained}/{overallStats.totalMax}</td>
                        <td className={cn("px-4 py-2.5 text-center text-sm", overallStats.overallGrade.color)}>{overallStats.overallGrade.label}</td>
                        <td className="px-4 py-2.5 text-center text-xs">{overallStats.overallGrade.remark}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              ) : (
                <div className="text-center py-10 text-slate-400">
                  <BookOpen className="w-10 h-10 mx-auto mb-3 opacity-30" />
                  <p className="text-sm font-medium">No results recorded for this {labels.termLabel.toLowerCase()}.</p>
                </div>
              )}
            </div>

            {/* Grading Key */}
            <div>
              <h3 className="text-xs font-bold text-blue-600 uppercase tracking-[0.15em] border-b-2 border-blue-600 pb-1 mb-3">Grading Key</h3>
              <div className="grid grid-cols-5 gap-2 text-center text-xs">
                {[{ g: 'A', r: 'Excellent', range: '80-100%', c: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400' },
                  { g: 'B', r: 'Very Good', range: '70-79%', c: 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400' },
                  { g: 'C', r: 'Good', range: '60-69%', c: 'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400' },
                  { g: 'D', r: 'Pass', range: '50-59%', c: 'bg-orange-50 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400' },
                  { g: 'F', r: 'Fail', range: '0-49%', c: 'bg-rose-50 text-rose-700 dark:bg-rose-900/20 dark:text-rose-400' },
                ].map(item => (
                  <div key={item.g} className={cn("rounded-xl py-2 px-1", item.c)}>
                    <p className="font-black text-lg">{item.g}</p>
                    <p className="font-bold">{item.r}</p>
                    <p className="text-[10px] opacity-70">{item.range}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Attendance */}
            <div>
              <h3 className="text-xs font-bold text-blue-600 uppercase tracking-[0.15em] border-b-2 border-blue-600 pb-1 mb-3">Attendance Summary</h3>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-3 text-center">
                  <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Present</p>
                  <p className="text-2xl font-black text-emerald-700 dark:text-emerald-400 mt-1">{overallStats.present}</p>
                </div>
                <div className="bg-rose-50 dark:bg-rose-900/20 rounded-xl p-3 text-center">
                  <p className="text-[10px] font-bold text-rose-600 uppercase tracking-widest">Absent</p>
                  <p className="text-2xl font-black text-rose-700 dark:text-rose-400 mt-1">{overallStats.absent}</p>
                </div>
                <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-3 text-center">
                  <p className="text-[10px] font-bold text-amber-600 uppercase tracking-widest">Late</p>
                  <p className="text-2xl font-black text-amber-700 dark:text-amber-400 mt-1">{overallStats.late}</p>
                </div>
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-3 text-center">
                  <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">Excused</p>
                  <p className="text-2xl font-black text-blue-700 dark:text-blue-400 mt-1">{overallStats.excused}</p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-3 text-center">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Rate</p>
                  <p className={cn("text-2xl font-black mt-1", overallStats.attendanceRate >= 75 ? 'text-emerald-600' : 'text-rose-600')}>
                    {overallStats.attendanceRate}%
                  </p>
                </div>
              </div>
            </div>

            {/* Fee Status */}
            <div>
              <h3 className="text-xs font-bold text-blue-600 uppercase tracking-[0.15em] border-b-2 border-blue-600 pb-1 mb-3">Fee Status</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-3 text-center">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Total Billed</p>
                  <p className="text-xl font-black text-slate-900 dark:text-white mt-1">{format(overallStats.totalFees)}</p>
                </div>
                <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-3 text-center">
                  <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Paid</p>
                  <p className="text-xl font-black text-emerald-700 dark:text-emerald-400 mt-1">{format(overallStats.paidFees)}</p>
                </div>
                <div className={cn("rounded-xl p-3 text-center", overallStats.pendingFees > 0 ? "bg-rose-50 dark:bg-rose-900/20" : "bg-slate-50 dark:bg-slate-800/60")}>
                  <p className={cn("text-[10px] font-bold uppercase tracking-widest", overallStats.pendingFees > 0 ? "text-rose-600" : "text-slate-500")}>Outstanding</p>
                  <p className={cn("text-xl font-black mt-1", overallStats.pendingFees > 0 ? "text-rose-700 dark:text-rose-400" : "text-slate-900 dark:text-white")}>{format(overallStats.pendingFees)}</p>
                </div>
              </div>
            </div>

            {/* Teacher Remarks */}
            <div>
              <h3 className="text-xs font-bold text-blue-600 uppercase tracking-[0.15em] border-b-2 border-blue-600 pb-1 mb-3">Teacher&apos;s Remark</h3>
              <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
                <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                  {overallStats.avg >= 80 && "An outstanding performance! Keep up the excellent work."}
                  {overallStats.avg >= 70 && overallStats.avg < 80 && "Very good performance. Continued effort will yield even better results."}
                  {overallStats.avg >= 60 && overallStats.avg < 70 && "Good performance. There is room for improvement in some areas."}
                  {overallStats.avg >= 50 && overallStats.avg < 60 && "Average performance. More dedication and hard work is needed."}
                  {overallStats.avg < 50 && "Below expectations. Significant improvement is needed. A parent-teacher meeting is recommended."}
                </p>
              </div>
            </div>

            {/* Signatures */}
            <div className="flex flex-col sm:flex-row justify-between gap-8 pt-6 border-t border-slate-200 dark:border-slate-800">
              {signatories.map((sig) => (
                <div key={sig.label} className="flex-1 text-center">
                  <div className="h-14 flex items-end justify-center mb-1">
                    {sig.signatureUrl ? (
                      <img src={sig.signatureUrl} alt={`${sig.label} signature`} className="max-h-12 object-contain" />
                    ) : (
                      <div className="w-32 border-b border-dashed border-slate-300" />
                    )}
                  </div>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{sig.label}</p>
                  <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 mt-0.5">{sig.name}</p>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="text-center pt-4 border-t border-slate-100 dark:border-slate-800">
              <p className="text-[10px] text-slate-400 font-medium">
                Generated on {new Date().toLocaleDateString('en-NG', { year: 'numeric', month: 'long', day: 'numeric' })} &middot; {globalSettings.appName || 'School Portal'}
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 py-20 text-center text-slate-400">
          <Eye className="w-12 h-12 mx-auto mb-4 opacity-20" />
          <p className="text-sm font-medium">Select a {labels.learnerSingular.toLowerCase()} to view their report card.</p>
        </div>
      )}
    </div>
  );
}
