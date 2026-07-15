import React, { useState } from 'react';
import { useDataStore, ExamResult, Student } from '@/store/useDataStore';
import { useAuthStore } from '@/store/useAuthStore';
import { Search, Download, Printer, Filter, Award, TrendingUp, User, CheckCircle, BarChart2, Clock, Mail, Phone, MapPin } from 'lucide-react';
import { cn } from '@/utils';
import { KPICard } from '@/components/ui/KPICard';
import { useToastStore } from '@/store/useToastStore';
import { downloadTextFile } from '@/utils/fileHelpers';
import { getPortalLevelLabels, resolveSchoolProfile } from '@/utils/schoolProfile';

export default function ResultSheet() {
  const { examResults, students, classes, schools } = useDataStore();
  const { user } = useAuthStore();
  const showToast = useToastStore((state) => state.showToast);
  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const isStudent = user?.role === 'STUDENT';
  const schoolProfile = resolveSchoolProfile(user ?? null, schools);
  const labels = getPortalLevelLabels(schoolProfile.portalLevel);
  
  // If student, only show their own results
  const studentResults = isStudent 
    ? examResults.filter(r => r.studentId === user?.id || r.studentName === user?.name)
    : examResults;

  const stats = {
    totalResults: studentResults.length,
    avgPercentage: Math.round(studentResults.reduce((acc, r) => acc + (r.score / r.totalMarks * 100), 0) / (studentResults.length || 1)),
    passed: studentResults.filter(r => (r.score / r.totalMarks) >= 0.5).length,
    distinctions: studentResults.filter(r => (r.score / r.totalMarks) >= 0.8).length
  };

  const filteredResults = studentResults.filter(result => {
    const student = students.find(s => s.id === result.studentId);
    const matchesSearch = result.studentName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         result.examTitle.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesClass = selectedClass === 'all' || student?.class === classes.find(c => c.id === selectedClass)?.name;
    return matchesSearch && matchesClass;
  });

  const getGrade = (score: number, total: number) => {
    const percentage = (score / total) * 100;
    if (percentage >= 80) return { label: 'A', color: 'text-emerald-600', bg: 'bg-emerald-50' };
    if (percentage >= 70) return { label: 'B', color: 'text-blue-600', bg: 'bg-blue-50' };
    if (percentage >= 60) return { label: 'C', color: 'text-amber-600', bg: 'bg-amber-50' };
    if (percentage >= 50) return { label: 'D', color: 'text-orange-600', bg: 'bg-orange-50' };
    return { label: 'F', color: 'text-rose-600', bg: 'bg-rose-50' };
  };

  const getPosition = (score: number, examTitle: string) => {
    const examResultsForType = examResults.filter(r => r.examTitle === examTitle);
    const sorted = [...examResultsForType].sort((a, b) => b.score - a.score);
    const index = sorted.findIndex(r => r.score === score);
    const pos = index + 1;
    
    if (pos === 1) return '1st';
    if (pos === 2) return '2nd';
    if (pos === 3) return '3rd';
    return `${pos}th`;
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportCsv = () => {
    const csvRows = [
      ['Student Name', 'Student ID', 'Exam', 'Score', 'Total Marks', 'Percentage', 'Grade', 'Date'],
      ...filteredResults.map((result) => {
        const percentage = Math.round((result.score / result.totalMarks) * 100);
        const grade = getGrade(result.score, result.totalMarks).label;
        return [
          result.studentName,
          result.studentId,
          result.examTitle,
          String(result.score),
          String(result.totalMarks),
          `${percentage}%`,
          grade,
          result.date,
        ];
      }),
    ]
      .map((row) => row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(','))
      .join('\n');

    downloadTextFile('exam-results.csv', csvRows, 'text/csv;charset=utf-8;');
    showToast({
      title: 'CSV exported',
      description: `${filteredResults.length} result record(s) downloaded successfully.`,
      variant: 'success',
    });
  };

  return (
    <div className="space-y-6 print:p-0">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 print:hidden">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white uppercase tracking-tight">
            {isStudent ? 'My Academic Performance' : labels.resultsLabel}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 font-medium">
            {isStudent ? `Track your ${labels.assessmentLabel.toLowerCase()} scores and academic progress.` : `Review ${labels.learnerPlural.toLowerCase()} performance and academic standings.`}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={handlePrint}
            className="flex items-center gap-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 py-2 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 transition-all shadow-sm"
          >
            <Printer className="w-4 h-4" />
            Print {labels.resultsLabel}
          </button>
          {!isStudent && (
            <button onClick={handleExportCsv} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg shadow-blue-900/20 transition-all">
              <Download className="w-4 h-4" />
              Export CSV
            </button>
          )}
        </div>
      </div>

      {/* Stats Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 print:hidden">
        <KPICard 
          title={isStudent ? `${labels.assessmentLabel} Taken` : "Total Submissions"} 
          value={stats.totalResults.toString()} 
          icon={TrendingUp} 
          iconBgClass="bg-blue-50 dark:bg-blue-900/20"
          iconColorClass="text-blue-600 dark:text-blue-400"
        />
        <KPICard 
          title={isStudent ? "Average Grade" : "Avg Percentage"} 
          value={`${stats.avgPercentage}%`} 
          icon={BarChart2} 
          iconBgClass="bg-indigo-50 dark:bg-indigo-900/20"
          iconColorClass="text-indigo-600 dark:text-indigo-400"
        />
        <KPICard 
          title={isStudent ? "Passed Exams" : "Passed"} 
          value={stats.passed.toString()} 
          icon={CheckCircle} 
          iconBgClass="bg-emerald-50 dark:bg-emerald-900/20"
          iconColorClass="text-emerald-600 dark:text-emerald-400"
        />
        <KPICard 
          title={isStudent ? "Academic Honors" : "Distinctions"} 
          value={stats.distinctions.toString()} 
          icon={Award} 
          iconBgClass="bg-amber-50 dark:bg-amber-900/20"
          iconColorClass="text-amber-600 dark:text-amber-400"
        />
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col overflow-hidden">
        <div className="border-b border-slate-200 bg-white px-6 py-6 print:px-0">
          <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
            <div className="flex items-start gap-4">
              {schoolProfile.logoUrl ? (
                <img
                  src={schoolProfile.logoUrl}
                  alt={`${schoolProfile.name} logo`}
                  className="h-20 w-20 rounded-2xl border border-slate-200 object-cover"
                />
              ) : (
                <div className="flex h-20 w-20 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-2xl font-bold text-slate-500">
                  {(schoolProfile.name || 'S').slice(0, 1)}
                </div>
              )}
              <div>
                <h2 className="text-2xl font-bold uppercase tracking-tight text-slate-900">{schoolProfile.name}</h2>
                <p className="mt-1 text-sm font-semibold text-blue-600">Official {labels.resultsLabel}</p>
                <div className="mt-3 space-y-1 text-sm text-slate-600">
                  {schoolProfile.address ? (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-slate-400" />
                      <span>{schoolProfile.address}</span>
                    </div>
                  ) : null}
                  {schoolProfile.phone ? (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-slate-400" />
                      <span>{schoolProfile.phone}</span>
                    </div>
                  ) : null}
                  {schoolProfile.email ? (
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-slate-400" />
                      <span>{schoolProfile.email}</span>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
            <div className="grid gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600 md:min-w-[260px]">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">School Code</p>
                <p className="mt-1 font-semibold text-slate-900">{schoolProfile.code || 'Not set'}</p>
              </div>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Report Scope</p>
                <p className="mt-1 font-semibold text-slate-900">{isStudent ? `${labels.learnerSingular} ${labels.resultsLabel}` : `Administrative ${labels.resultsLabel}`}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Toolbar */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row justify-between gap-4 bg-slate-50/50 dark:bg-slate-800/50 print:hidden">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder={isStudent ? "Search my results..." : "Search by student or exam..."} 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:text-white font-medium"
            />
          </div>
          {!isStudent && (
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-400" />
              <select 
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-600 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All {labels.structurePlural}</option>
                {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          )}
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest bg-slate-50/50 dark:bg-slate-800/30">
                <th className="py-4 px-6">{labels.learnerSingular} Information</th>
                <th className="py-4 px-6">{labels.assessmentLabel.replace('Assessments', 'Assessment')}</th>
                <th className="py-4 px-6 text-center">Score</th>
                <th className="py-4 px-6 text-center">Rank</th>
                <th className="py-4 px-6 text-center">Performance</th>
                <th className="py-4 px-6 text-center">Grade</th>
                <th className="py-4 px-6">Exam Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredResults.map((result) => {
                const grade = getGrade(result.score, result.totalMarks);
                const percentage = Math.round((result.score / result.totalMarks) * 100);
                const position = getPosition(result.score, result.examTitle);
                
                return (
                  <tr key={result.id} className="hover:bg-blue-50/30 dark:hover:bg-blue-900/10 transition-colors group">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-slate-500 group-hover:bg-blue-50 transition-colors">
                          <User className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white text-sm tracking-tight">{result.studentName}</p>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono font-bold uppercase">{result.studentId}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <p className="font-bold text-slate-700 dark:text-slate-300 text-sm tracking-tight">{result.examTitle}</p>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <span className="font-bold text-slate-900 dark:text-white">{result.score}</span>
                      <span className="text-slate-400 text-xs ml-1">/ {result.totalMarks}</span>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <span className={cn(
                        "font-bold px-2 py-1 rounded text-xs",
                        position === '1st' ? "bg-amber-100 text-amber-700 border border-amber-200" : 
                        position === '2nd' ? "bg-slate-100 text-slate-700 border border-slate-200" :
                        position === '3rd' ? "bg-orange-50 text-orange-700 border border-orange-100" :
                        "text-slate-600 dark:text-slate-400"
                      )}>
                        {position}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-center gap-3">
                        <div className="w-20 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div 
                            className={cn("h-full transition-all rounded-full", percentage >= 50 ? 'bg-blue-500' : 'bg-rose-500')}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400">{percentage}%</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex justify-center">
                        <span className={cn("w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm shadow-sm", grade.bg, grade.color)}>
                          {grade.label}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                       <div className="flex items-center gap-1.5 text-slate-500 text-[11px] font-medium">
                          <Clock className="w-3.5 h-3.5 opacity-50" />
                          {result.date}
                       </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filteredResults.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400 dark:text-slate-600">
              <Award className="w-12 h-12 mb-4 opacity-20" />
              <p className="text-sm font-medium">No results found matching your search.</p>
            </div>
          )}
        </div>

        <div className="grid gap-4 border-t border-slate-200 px-6 py-6 md:grid-cols-3 print:px-0">
          {[
            {
              label: schoolProfile.portalLevel === 'Primary' || schoolProfile.portalLevel === 'Secondary' ? 'Class Teacher' : 'Course Adviser',
              name: schoolProfile.teacherSignatoryName || 'Teacher Signatory',
              signatureUrl: schoolProfile.teacherSignatureUrl,
            },
            {
              label: schoolProfile.portalLevel === 'Primary' ? 'Head Teacher' : schoolProfile.portalLevel === 'Secondary' ? 'Head of Department' : 'Dean / Head of Department',
              name: schoolProfile.hodSignatoryName || 'HOD Signatory',
              signatureUrl: schoolProfile.hodSignatureUrl,
            },
            {
              label: schoolProfile.portalLevel === 'University' ? 'Registrar / Provost' : schoolProfile.portalLevel === 'College' ? 'Rector / Provost' : 'Principal',
              name: schoolProfile.principalSignatoryName || 'Principal Signatory',
              signatureUrl: schoolProfile.principalSignatureUrl,
            },
          ].map((signatory) => (
            <div key={signatory.label} className="rounded-2xl border border-slate-200 p-4">
              <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">{signatory.label}</p>
              <div className="mt-4 flex h-16 items-end justify-center rounded-xl border-b border-dashed border-slate-300 bg-slate-50">
                {signatory.signatureUrl ? (
                  <img src={signatory.signatureUrl} alt={`${signatory.label} signature`} className="max-h-12 object-contain" />
                ) : (
                  <span className="pb-3 text-xs text-slate-400">No signature uploaded</span>
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
