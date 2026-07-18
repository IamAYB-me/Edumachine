import React, { useState, useMemo, useRef } from 'react';
import {
  Search, BookOpen, Printer, Download, BarChart3,
  Clock, FileText, Video, X,
} from 'lucide-react';
import { cn } from '@/utils';
import { useDataStore } from '@/store/useDataStore';
import { useAuthStore } from '@/store/useAuthStore';
import { useToastStore } from '@/store/useToastStore';
import { resolveSchoolProfile, getPortalLevelLabels } from '@/utils/schoolProfile';

const COLORS = ['blue', 'emerald', 'purple', 'amber', 'rose', 'indigo', 'teal'];
const COLOR_MAP: Record<string, { bg: string; border: string; text: string }> = {
  blue: { bg: 'bg-blue-50 dark:bg-blue-900/20', border: 'border-blue-200 dark:border-blue-800', text: 'text-blue-600 dark:text-blue-400' },
  emerald: { bg: 'bg-emerald-50 dark:bg-emerald-900/20', border: 'border-emerald-200 dark:border-emerald-800', text: 'text-emerald-600 dark:text-emerald-400' },
  purple: { bg: 'bg-purple-50 dark:bg-purple-900/20', border: 'border-purple-200 dark:border-purple-800', text: 'text-purple-600 dark:text-purple-400' },
  amber: { bg: 'bg-amber-50 dark:bg-amber-900/20', border: 'border-amber-200 dark:border-amber-800', text: 'text-amber-600 dark:text-amber-400' },
  rose: { bg: 'bg-rose-50 dark:bg-rose-900/20', border: 'border-rose-200 dark:border-rose-800', text: 'text-rose-600 dark:text-rose-400' },
  indigo: { bg: 'bg-indigo-50 dark:bg-indigo-900/20', border: 'border-indigo-200 dark:border-indigo-800', text: 'text-indigo-600 dark:text-indigo-400' },
  teal: { bg: 'bg-teal-50 dark:bg-teal-900/20', border: 'border-teal-200 dark:border-teal-800', text: 'text-teal-600 dark:text-teal-400' },
};

export default function StudentCourses() {
  const { subjects, schools } = useDataStore();
  const user = useAuthStore((state) => state.user);
  const showToast = useToastStore((state) => state.showToast);

  const schoolProfile = resolveSchoolProfile(user, schools);
  const labels = getPortalLevelLabels(schoolProfile.portalLevel);
  const isCollege = schoolProfile.portalLevel === 'College' || schoolProfile.portalLevel === 'University';

  const [searchTerm, setSearchTerm] = useState('');
  const [filterTerm, setFilterTerm] = useState('all');
  const [materialsOpen, setMaterialsOpen] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const printRef = useRef<HTMLDivElement>(null);

  const allTerms = useMemo(() => {
    const set = new Set(subjects.map((s) => isCollege ? s.session : s.term).filter(Boolean) as string[]);
    return ['all', ...Array.from(set)];
  }, [subjects, isCollege]);

  const filteredSubjects = useMemo(() => {
    let result = subjects;
    if (searchTerm) {
      const t = searchTerm.toLowerCase();
      result = result.filter((s) => s.name.toLowerCase().includes(t) || s.code.toLowerCase().includes(t));
    }
    if (filterTerm !== 'all') {
      result = result.filter((s) => isCollege ? s.session === filterTerm : s.term === filterTerm);
    }
    return result;
  }, [subjects, searchTerm, filterTerm, isCollege]);

  const progressMap = useMemo(() => {
    const map: Record<string, number> = {};
    filteredSubjects.forEach((s) => {
      let hash = 0;
      for (let i = 0; i < s.id.length; i++) {
        hash = ((hash << 5) - hash + s.id.charCodeAt(i)) | 0;
      }
      map[s.id] = (Math.abs(hash) % 80) + 20;
    });
    return map;
  }, [filteredSubjects]);

  const totalCredits = filteredSubjects.reduce((sum, s) => sum + s.creditHours, 0);
  const coreCount = filteredSubjects.filter((s) => s.type === 'Core').length;
  const electiveCount = filteredSubjects.filter((s) => s.type === 'Elective').length;

  const handlePrint = () => {
    const printContent = printRef.current;
    if (!printContent) return;

    const schoolName = schoolProfile.name;
    const studentName = user?.name || 'Student';
    const termLabel = filterTerm !== 'all' ? filterTerm : `All ${labels.termLabel}s`;
    const currentDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

    const totalCreditsVal = filteredSubjects.reduce((sum, s) => sum + s.creditHours, 0);

    const tableRows = filteredSubjects.map((s, i) => `
      <tr style="border-bottom: 1px solid #e2e8f0;">
        <td style="padding: 8px 12px; text-align: center; color: #64748b; font-size: 13px;">${i + 1}</td>
        <td style="padding: 8px 12px; font-weight: 600;">${s.name}</td>
        <td style="padding: 8px 12px; font-family: monospace; font-size: 13px; color: #64748b;">${s.code}</td>
        <td style="padding: 8px 12px; text-align: center;">
          <span style="background: ${s.type === 'Core' ? '#d1fae5' : '#fef3c7'}; color: ${s.type === 'Core' ? '#065f46' : '#92400e'}; padding: 2px 8px; border-radius: 999px; font-size: 11px; font-weight: 700;">${s.type}</span>
        </td>
        ${isCollege ? `<td style="padding: 8px 12px; text-align: center;">${s.creditHours}</td>` : ''}
        <td style="padding: 8px 12px; font-size: 13px; color: #64748b;">${isCollege ? (s.session || '—') : (s.term || '—')}</td>
      </tr>
    `).join('');

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${labels.studyLabel} - ${schoolName}</title>
        <style>
          body { font-family: 'Segoe UI', system-ui, sans-serif; padding: 40px; color: #1e293b; ${schoolProfile.logoUrl ? `--receipt-logo: url(${schoolProfile.logoUrl});` : ''} }
          @media print { body { padding: 20px; } body::before { content: ''; position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 260px; height: 260px; background-image: var(--receipt-logo); background-repeat: no-repeat; background-position: center; background-size: contain; opacity: 0.06; z-index: -1; pointer-events: none; } }
          .header { text-align: center; margin-bottom: 32px; border-bottom: 2px solid #2563eb; padding-bottom: 24px; }
          .school-name { font-size: 24px; font-weight: 800; color: #1e293b; margin-bottom: 4px; }
          .subtitle { font-size: 14px; color: #64748b; }
          .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 24px; font-size: 14px; }
          .info-grid span { color: #64748b; }
          .info-grid strong { color: #1e293b; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
          th { background: #f1f5f9; padding: 10px 12px; text-align: left; font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 2px solid #e2e8f0; }
          th:last-child, td:last-child { text-align: center; }
          .footer { margin-top: 32px; font-size: 12px; color: #94a3b8; text-align: center; border-top: 1px solid #e2e8f0; padding-top: 12px; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="school-name">${schoolName}</div>
          <div class="subtitle">${labels.studyLabel} — ${termLabel}</div>
        </div>
        <div class="info-grid">
          <div><span>Student Name:</span> <strong>${studentName}</strong></div>
          <div><span>${labels.termLabel}:</span> <strong>${termLabel}</strong></div>
          <div><span>Total ${labels.subjectPlural}:</span> <strong>${filteredSubjects.length}</strong></div>
          ${isCollege ? `<div><span>Total ${labels.creditLabel}:</span> <strong>${totalCreditsVal}</strong></div>` : ''}
          <div><span>Date Printed:</span> <strong>${currentDate}</strong></div>
        </div>
        <table>
          <thead>
            <tr>
              <th style="text-align: center; width: 40px;">#</th>
              <th>${labels.subjectSingular} Name</th>
              <th>Code</th>
              <th style="text-align: center;">Type</th>
              ${isCollege ? `<th style="text-align: center;">${labels.creditLabel}</th>` : ''}
              <th style="text-align: center;">${labels.termLabel}</th>
            </tr>
          </thead>
          <tbody>
            ${tableRows}
          </tbody>
        </table>
        <div class="footer">
          Generated by ${schoolName} — EduPlatform | ${currentDate}
        </div>
      </body>
      </html>
    `;

    const printWindow = window.open('', '_blank', 'width=800,height=600');
    if (printWindow) {
      printWindow.document.write(html);
      printWindow.document.close();
      setTimeout(() => printWindow.print(), 500);
    }

    showToast({
      title: 'Print ready',
      description: `Opening print preview for ${filteredSubjects.length} ${labels.subjectPlural.toLowerCase()}.`,
      variant: 'success',
    });
  };

  const handleViewMaterials = (subjectId: string) => {
    setSelectedSubject(subjectId);
    setMaterialsOpen(true);
  };

  const selectedSubjectData = selectedSubject ? subjects.find((s) => s.id === selectedSubject) : null;

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{labels.studyLabel}</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            View and manage your {labels.subjectPlural.toLowerCase()} for the current {labels.termLabel.toLowerCase()}.
          </p>
        </div>
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
        >
          <Printer className="w-4 h-4" />
          Print {isCollege ? 'Courses' : 'Subjects'}
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm">
          <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Active {labels.subjectPlural}</p>
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">{filteredSubjects.length}</p>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm">
          <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">
            {isCollege ? 'Total Credits' : 'Core Subjects'}
          </p>
          <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
            {isCollege ? totalCredits : coreCount}
          </p>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm">
          <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">
            {isCollege ? 'Elective Courses' : 'Electives'}
          </p>
          <p className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1">{electiveCount}</p>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm">
          <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Avg. Progress</p>
          <p className="text-2xl font-bold text-purple-600 dark:text-purple-400 mt-1">68%</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          {allTerms.map((t) => (
            <button
              key={t}
              onClick={() => setFilterTerm(t)}
              className={cn(
                "px-3 py-1 rounded-full text-xs font-bold transition-all border",
                filterTerm === t
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-blue-400"
              )}
            >
              {t === 'all' ? `All ${labels.termLabel}s` : t}
            </button>
          ))}
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={`Search ${labels.subjectPlural.toLowerCase()}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-sm focus:outline-none focus:border-blue-500 dark:text-white shadow-sm"
          />
        </div>
      </div>

      {/* Course Cards - Print hidden area */}
      <div ref={printRef} className="flex-1 overflow-y-auto">
        {filteredSubjects.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <BookOpen className="w-12 h-12 text-slate-300 dark:text-slate-600 mb-4" />
            <p className="text-lg font-bold text-slate-700 dark:text-slate-300">No {labels.subjectPlural.toLowerCase()} found</p>
            <p className="text-sm text-slate-400 mt-1">You have no {labels.subjectPlural.toLowerCase()} for this {labels.termLabel.toLowerCase()}.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredSubjects.map((subject, i) => {
              const colorKey = COLORS[i % COLORS.length];
              const color = COLOR_MAP[colorKey];
              const progress = progressMap[subject.id] || 50;

              return (
                <div key={subject.id} className={cn("bg-white dark:bg-slate-900 rounded-xl border shadow-sm hover:shadow-md transition-shadow overflow-hidden", color.border)}>
                  <div className={cn("h-1.5", color.bg)} />
                  <div className="p-5 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className={cn("p-2.5 rounded-xl", color.bg)}>
                          <BookOpen className={cn("w-5 h-5", color.text)} />
                        </div>
                        <div>
                          <p className="text-[10px] font-mono text-slate-400 mb-0.5">{subject.code}</p>
                          <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">{subject.name}</h3>
                        </div>
                      </div>
                      <span className={cn(
                        "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider",
                        subject.type === 'Core' ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                      )}>{subject.type}</span>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                      {isCollege && (
                        <span className="flex items-center gap-1">
                          <BarChart3 className="w-3 h-3" />
                          {subject.creditHours} {labels.creditLabel}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {isCollege ? subject.session || 'N/A' : subject.term || 'N/A'}
                      </span>
                    </div>

                    {/* Progress bar */}
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Progress</span>
                        <span className="text-xs font-bold text-slate-600 dark:text-slate-300">{progress}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div className={cn("h-full rounded-full transition-all", color.bg.replace('/20', '').replace('dark:', ''))} style={{ width: `${progress}%` }} />
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-1">
                      <button
                        onClick={() => handleViewMaterials(subject.id)}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-bold transition-colors"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        Materials
                      </button>
                      <button
                        onClick={() => showToast({ title: 'Video lectures coming soon', description: 'Video lectures are coming soon. Video content will be available for streaming directly from this page.', variant: 'info' })}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-bold transition-colors"
                      >
                        <Video className="w-3.5 h-3.5" />
                        Video
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Materials Modal */}
      {materialsOpen && selectedSubjectData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm" onClick={() => setMaterialsOpen(false)}>
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 w-full max-w-lg flex flex-col overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">{labels.subjectSingular} Materials</h2>
                <p className="text-xs text-slate-500 mt-0.5">{selectedSubjectData.name} ({selectedSubjectData.code})</p>
              </div>
              <button onClick={() => setMaterialsOpen(false)} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>
            <div className="p-6 space-y-3 max-h-[60vh] overflow-y-auto">
              {[
                { name: 'Lecture Slides', type: 'PDF', size: '2.4 MB' },
                { name: 'Lab Manual', type: 'PDF', size: '1.8 MB' },
                { name: 'Video Lecture - Week 1', type: 'MP4', size: '45 MB' },
                { name: 'Assignment Brief', type: 'DOCX', size: '256 KB' },
              ].map((material, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <FileText className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900 dark:text-white">{material.name}</p>
                      <p className="text-xs text-slate-400">{material.type} — {material.size}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => showToast({ title: 'Download started', description: `${material.name} is downloading.`, variant: 'success' })}
                    className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
