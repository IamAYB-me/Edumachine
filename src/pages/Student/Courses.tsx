import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  Search, BookOpen, Printer, Download, BarChart3,
  Clock, FileText, Video, X, Lock, CheckCircle2, GraduationCap,
} from 'lucide-react';
import { cn } from '@/utils';
import { useDataStore } from '@/store/useDataStore';
import { useAuthStore } from '@/store/useAuthStore';
import { useToastStore } from '@/store/useToastStore';
import { resolveSchoolProfile, getPortalLevelLabels, isTertiaryLevel } from '@/utils/schoolProfile';
import { checkFeeGate, gatingBlockerMessage, filterFeeRecordsForStudent } from '@/utils/feeGating';
import { useNavigate } from 'react-router-dom';
import { useCurrency } from '@/hooks/useCurrency';
import { useSettingsStore } from '@/store/useSettingsStore';

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

type PrintableCourse = { name: string; code: string; type: string; creditHours: number; session?: string };

export default function StudentCourses() {
  const { subjects, schools, students, departments, feeStructures, feeRecords, courseRegistrations, academicSessions, saveCourseRegistration } = useDataStore();
  const user = useAuthStore((state) => state.user);
  const showToast = useToastStore((state) => state.showToast);
  const navigate = useNavigate();
  const { format } = useCurrency();

  const schoolProfile = resolveSchoolProfile(user, schools);
  const labels = getPortalLevelLabels(schoolProfile.portalLevel);
  const isCollege = isTertiaryLevel(schoolProfile.portalLevel);

  const myStudent = useMemo(() => students.find((s) => s.id === user?.id), [students, user?.id]);

  const myFeeRecords = useMemo(
    () => filterFeeRecordsForStudent(feeRecords, [user?.id, myStudent?.id, myStudent?.regNo, myStudent?.email]),
    [feeRecords, user?.id, myStudent?.id, myStudent?.regNo, myStudent?.email],
  );

  const gating = useMemo(
    () => checkFeeGate(feeStructures, myFeeRecords, myStudent?.class, 'course_registration', myStudent),
    [feeStructures, myFeeRecords, myStudent?.class, myStudent],
  );
  const registrationBlocked = !gating.isAllowed;
  const registrationClosed = useSettingsStore((s) => s.globalSettings.courseRegistrationEnabled) === false;
  const cannotRegister = registrationBlocked || registrationClosed;
  const myDepartmentId = useMemo(() => {
    const name = myStudent?.classDepartment || myStudent?.department || '';
    return departments.find((d) => d.name === name || d.code === name || d.id === name)?.id || '';
  }, [myStudent, departments]);

  const activeSession = useMemo(() => academicSessions.find((s) => s.active), [academicSessions]);
  const academicSessionName = activeSession?.name || 'Current Session';

  const [searchTerm, setSearchTerm] = useState('');
  const [filterTerm, setFilterTerm] = useState('all');
  const [materialsOpen, setMaterialsOpen] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [selectedBySession, setSelectedBySession] = useState<Record<string, string[]>>({});
  const printRef = useRef<HTMLDivElement>(null);

  // Auto-select the active semester (e.g. "First Semester") once data loads
  useEffect(() => {
    if (activeSession?.semester && subjects.some((s) => s.session === activeSession.semester)) {
      setFilterTerm((prev) => (prev === 'all' ? activeSession.semester! : prev));
    }
  }, [activeSession?.semester, subjects.length]);

  const allTerms = useMemo(() => {
    const set = new Set(subjects.map((s) => isCollege ? s.session : s.term).filter(Boolean) as string[]);
    return ['all', ...Array.from(set)];
  }, [subjects, isCollege]);

  const filteredSubjects = useMemo(() => {
    let result = isCollege
      ? subjects.filter((s) => s.session && (myDepartmentId ? s.departmentId === myDepartmentId : true))
      : subjects;
    if (searchTerm) {
      const t = searchTerm.toLowerCase();
      result = result.filter((s) => s.name.toLowerCase().includes(t) || s.code.toLowerCase().includes(t));
    }
    if (filterTerm !== 'all') {
      result = result.filter((s) => isCollege ? s.session === filterTerm : s.term === filterTerm);
    }
    return result;
  }, [subjects, searchTerm, filterTerm, isCollege, myDepartmentId, myStudent?.classDepartment, myStudent?.department]);

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

  // Registration context (tied to the selected semester/session)
  const contextSession = filterTerm !== 'all' ? filterTerm : null;
  const selectedIds = contextSession ? (selectedBySession[contextSession] || []) : [];
  const selectedSubjects = useMemo(
    () => (contextSession ? subjects.filter((s) => (selectedBySession[contextSession] || []).includes(s.id)) : []),
    [subjects, selectedBySession, contextSession],
  );
  const selectedCredits = selectedSubjects.reduce((sum, s) => sum + s.creditHours, 0);

  const myRegistrations = useMemo(
    () => courseRegistrations.filter((r) => r.studentId === user?.id),
    [courseRegistrations, user?.id],
  );
  const savedReg = useMemo(
    () => (contextSession ? myRegistrations.find((r) => r.session === contextSession) || null : null),
    [myRegistrations, contextSession],
  );
  const registeredBySession = useMemo(() => {
    const map: Record<string, string[]> = {};
    myRegistrations.forEach((r) => { map[r.session] = r.courses.map((c) => c.subjectId); });
    return map;
  }, [myRegistrations]);

  const selectionMatchesSaved = savedReg
    ? savedReg.courses.length === selectedIds.length && savedReg.courses.every((c) => selectedIds.includes(c.subjectId))
    : false;

  const sessionKey = (session: string) => session.toLowerCase().replace(/\s+/g, '_');

  const toggleSubject = (session: string, id: string) => {
    setSelectedBySession((prev) => {
      const cur = prev[session] || [];
      const next = cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id];
      return { ...prev, [session]: next };
    });
  };

  const handleRegister = () => {
    if (!contextSession || !user) return;
    if (registrationClosed) {
      showToast({ title: 'Registration closed', description: 'Course registration is currently closed by the school. Please try again later.', variant: 'info' });
      return;
    }
    if (selectedIds.length === 0) {
      showToast({ title: 'No courses selected', description: `Select at least one course to register for ${contextSession}.`, variant: 'error' });
      return;
    }
    const courses = selectedSubjects.map((s) => ({
      subjectId: s.id,
      code: s.code,
      name: s.name,
      creditHours: s.creditHours,
      type: s.type,
    }));
    saveCourseRegistration({
      id: `${user.id}_${sessionKey(contextSession)}`,
      studentId: user.id,
      studentName: user.name || myStudent?.name || 'Student',
      studentEmail: user.email || myStudent?.email,
      department: myStudent?.classDepartment || myStudent?.department,
      portalLevel: schoolProfile.portalLevel,
      session: contextSession,
      academicSessionName,
      courses,
      courseCount: courses.length,
      totalCredits: selectedCredits,
      coreCount: courses.filter((c) => c.type === 'Core').length,
      electiveCount: courses.filter((c) => c.type === 'Elective').length,
      status: 'REGISTERED',
      registeredAt: new Date().toISOString(),
    });
    showToast({
      title: 'Registration Complete',
      description: `You have registered ${courses.length} ${labels.subjectPlural.toLowerCase()} for ${contextSession}.`,
      variant: 'success',
    });
  };

  const handlePrint = (courses: PrintableCourse[], sessionLabel?: string) => {
    const printContent = printRef.current;
    if (!printContent) return;

    const schoolName = schoolProfile.name;
    const studentName = user?.name || 'Student';
    const termLabel = sessionLabel || (filterTerm !== 'all' ? filterTerm : `All ${labels.termLabel}s`);
    const currentDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    const schoolAddress = schoolProfile.address || '';
    const schoolCode = schoolProfile.code || '';
    const signatoryName = schoolProfile.principalSignatoryName || schoolProfile.hodSignatoryName || schoolProfile.teacherSignatoryName || '';

    const totalCreditsVal = courses.reduce((sum, s) => sum + s.creditHours, 0);

    const tableRows = courses.map((s, i) => `
      <tr>
        <td style="text-align: center; color: #64748b;">${i + 1}</td>
        <td style="font-weight: 600;">${s.name}</td>
        <td style="font-family: monospace; color: #64748b;">${s.code}</td>
        <td>
          <span style="background: ${s.type === 'Core' ? '#d1fae5' : '#fef3c7'}; color: ${s.type === 'Core' ? '#065f46' : '#92400e'}; padding: 1px 6px; border-radius: 999px; font-size: 8px; font-weight: 700;">${s.type}</span>
        </td>
        ${isCollege ? `<td style="text-align: center;">${s.creditHours}</td>` : ''}
        <td style="color: #64748b;">${isCollege ? (s.session || termLabel) : '—'}</td>
      </tr>
    `).join('');

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${labels.studyLabel} - ${schoolName}</title>
        <style>
          @page { size: A4; margin: 10mm 12mm; }
          * { margin: 0; padding: 0; box-sizing: border-box; }
          html, body { font-family: 'Segoe UI', system-ui, Arial, sans-serif; font-size: 10px; color: #0f172a; }
          ${schoolProfile.logoUrl ? `body::before { content: ''; position: fixed; top: 45%; left: 45%; width: 180mm; height: 180mm; background-image: url(${schoolProfile.logoUrl}); background-repeat: no-repeat; background-position: center; background-size: contain; opacity: 0.04; z-index: 0; pointer-events: none; }` : ''}
          .wrap { width: 100%; }
          .head { display: flex; align-items: flex-start; gap: 8px; border-bottom: 1.5px solid #1d4ed8; padding-bottom: 6px; margin-bottom: 6px; }
          .head img { width: 34px; height: 34px; object-fit: contain; }
          .head .t1 { font-size: 13px; font-weight: 800; letter-spacing: .02em; line-height: 1.15; }
          .head .t2 { font-size: 8.5px; color: #475569; }
          .head .badge { margin-left: 2px; margin-top: 1px; border: 1.5px solid #1d4ed8; color: #1d4ed8; font-size: 7.5px; font-weight: 800; letter-spacing: .1em; text-transform: uppercase; padding: 2px 8px; border-radius: 999px; white-space: nowrap; background: #eff6ff; }
          .title { text-align: center; font-size: 10.5px; font-weight: 800; text-transform: uppercase; letter-spacing: .12em; color: #1e293b; border-bottom: 1px dotted #cbd5e1; padding-bottom: 4px; margin-bottom: 6px; }
          .title .sub { font-size: 8.5px; font-weight: 400; letter-spacing: .04em; color: #475569; text-transform: none; }
          .info { display: grid; grid-template-columns: repeat(3, 1fr); gap: 2px 14px; margin-bottom: 6px; }
          .info div { display: flex; justify-content: space-between; gap: 6px; font-size: 8.5px; padding: 1.5px 0; border-bottom: 1px dotted #e2e8f0; }
          .info span { color: #64748b; white-space: nowrap; }
          .info strong { font-weight: 700; }
          .section { display: flex; align-items: center; gap: 6px; font-size: 8px; font-weight: 800; text-transform: uppercase; letter-spacing: .1em; color: #1d4ed8; margin: 2px 0 3px; }
          .section::after { content: ''; flex: 1; height: 1px; background: #dbeafe; }
          table { width: 100%; border-collapse: collapse; }
          thead { display: table-header-group; }
          th { background: #1d4ed8; color: #fff; padding: 3px 6px; text-align: left; font-size: 7.5px; text-transform: uppercase; letter-spacing: .05em; }
          th:last-child, td:last-child { text-align: center; }
          td { padding: 3px 6px; font-size: 9.5px; border-bottom: 0.5px solid #e2e8f0; }
          tbody tr { page-break-inside: avoid; }
          tbody tr:nth-child(even) td { background: #f8fafc; }
          .total-row td { background: #eff6ff; font-weight: 800; font-size: 10px; color: #1d4ed8; border-top: 1.5px solid #bfdbfe; }
          .sig { display: flex; justify-content: space-between; gap: 24px; margin-top: 8px; }
          .sig .box { text-align: center; width: 48%; }
          .sig .box .line { border-top: 1px solid #475569; padding-top: 2px; font-size: 9px; font-weight: 700; }
          .sig .box .role { font-size: 7.5px; color: #64748b; text-transform: uppercase; letter-spacing: .08em; }
          .foot { margin-top: 6px; padding-top: 3px; border-top: 1px solid #e2e8f0; font-size: 7.5px; color: #94a3b8; text-align: center; }
        </style>
      </head>
      <body>
        <div class="wrap">
          <div class="head">
            ${schoolProfile.logoUrl ? `<img src="${schoolProfile.logoUrl}" alt="" />` : ''}
            <div>
              <div class="t1">${schoolName}</div>
              <div class="t2">${[schoolCode, schoolAddress].filter(Boolean).join(' &middot; ')}</div>
            </div>
            <div class="badge">${savedReg ? 'Registered' : 'Draft'}</div>
          </div>
          <div class="title">
            ${labels.studyLabel} Registration Slip
            <div class="sub">${termLabel} · Academic Session: ${savedReg?.academicSessionName || academicSessionName || '—'}</div>
          </div>
          <div class="info">
            <div><span>${labels.learnerSingular} Name</span><strong>${studentName}</strong></div>
            <div><span>${labels.termLabel}</span><strong>${termLabel}</strong></div>
            <div><span>Total ${labels.subjectPlural}</span><strong>${courses.length}</strong></div>
            <div><span>Total ${labels.creditLabel}</span><strong>${totalCreditsVal}</strong></div>
            <div><span>Academic Session</span><strong>${savedReg?.academicSessionName || academicSessionName || '—'}</strong></div>
            <div><span>Date Printed</span><strong>${currentDate}</strong></div>
          </div>
          <div class="section">${labels.subjectPlural} Enrolled</div>
          <table>
            <thead>
              <tr>
                <th style="width:20px">#</th>
                <th>${labels.subjectSingular} Name</th>
                <th>Code</th>
                <th>Type</th>
                ${isCollege ? `<th>${labels.creditLabel}</th>` : ''}
                <th>${labels.termLabel}</th>
              </tr>
            </thead>
            <tbody>
              ${tableRows}
              <tr class="total-row">
                <td colspan="4">Total ${labels.subjectPlural}</td>
                ${isCollege ? `<td>${totalCreditsVal}</td>` : ''}
                <td>${courses.length}</td>
              </tr>
            </tbody>
          </table>
          <div class="sig">
            <div class="box">
              <div class="line">${signatoryName || '&nbsp;'}</div>
              <div class="role">Authorised Signatory</div>
            </div>
            <div class="box">
              <div class="line">${studentName}</div>
              <div class="role">${labels.learnerSingular} Signature</div>
            </div>
          </div>
          <div class="foot">Generated by ${schoolName} — BROCHEST Portal · ${currentDate}</div>
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
      title: savedReg ? 'Print ready' : 'Registration preview',
      description: `Opening print preview for ${courses.length} ${labels.subjectPlural.toLowerCase()}.`,
      variant: 'success',
    });
  };

  const handleViewMaterials = (subjectId: string) => {
    setSelectedSubject(subjectId);
    setMaterialsOpen(true);
  };

  const selectedSubjectData = selectedSubject ? subjects.find((s) => s.id === selectedSubject) : null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{labels.studyLabel}</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Select and register your {labels.subjectPlural.toLowerCase()} for the current {labels.termLabel.toLowerCase()}.
          </p>
        </div>
        {!cannotRegister && (
          <button
            onClick={contextSession ? handleRegister : () => showToast({ title: 'Select a semester', description: `Choose ${allTerms.filter((t) => t !== 'all').join(' or ')} above to register your ${labels.subjectPlural.toLowerCase()}.`, variant: 'info' })}
            disabled={contextSession ? selectedIds.length === 0 : false}
            title={
              contextSession
                ? savedReg && selectionMatchesSaved
                  ? `Registered for ${contextSession}`
                  : 'Register your selected courses'
                : 'Select a semester above to register your courses'
            }
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm",
              contextSession && selectedIds.length === 0
                ? "bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed"
                : "bg-emerald-600 hover:bg-emerald-700 text-white"
            )}
          >
            {savedReg && selectionMatchesSaved ? (
              <>
                <CheckCircle2 className="w-4 h-4" />
                Registered — {savedReg.session}
              </>
            ) : (
              <>
                <GraduationCap className="w-4 h-4" />
                {savedReg && selectedIds.length > 0 ? 'Update Registration' : 'Register Your Courses'}
              </>
            )}
          </button>
        )}
      </div>

      {registrationClosed && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 dark:border-amber-900/40 dark:bg-amber-950/30 p-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="shrink-0 w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center">
              <Lock className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-bold text-amber-900 dark:text-amber-300 uppercase tracking-wide">
                Course Registration Closed
              </h3>
              <p className="text-xs sm:text-sm text-amber-800 dark:text-amber-400 mt-0.5">
                Registration has been temporarily closed by the school. Your previously registered {labels.subjectPlural.toLowerCase()} (if any) remain intact and can still be printed below.
              </p>
            </div>
          </div>
        </div>
      )}

      {registrationBlocked && !registrationClosed && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 dark:border-rose-900/40 dark:bg-rose-950/30 p-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="shrink-0 w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-900/40 flex items-center justify-center">
              <Lock className="w-5 h-5 text-rose-600 dark:text-rose-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-bold text-rose-900 dark:text-rose-300 uppercase tracking-wide">
                Registration Locked — Fees Required
              </h3>
              <p className="text-xs sm:text-sm text-rose-700 dark:text-rose-400 mt-0.5">
                {gatingBlockerMessage('course_registration', myStudent?.class)}
              </p>
              <div className="mt-2.5 space-y-1.5">
                {gating.blockers.map((b) => (
                  <div key={b.structure.id} className="flex items-center justify-between gap-2.5 rounded-lg bg-white/60 dark:bg-white/5 px-3 py-2 border border-rose-100 dark:border-rose-900/30">
                    <div>
                      <p className="text-[13px] font-bold text-slate-900 dark:text-white">{b.structure.category}</p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        Paid {format(b.studentsPaid)} / Required {format(b.required)} ({b.structure.requiredPercentage ?? 100}%)
                      </p>
                    </div>
                    <span className="text-xs font-bold text-rose-600 dark:text-rose-400">{Math.round(b.percentagePaid)}%</span>
                  </div>
                ))}
              </div>
            </div>
            <button
              onClick={() => navigate('/student/fees')}
              className="shrink-0 self-start sm:self-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs sm:text-sm font-bold shadow-lg shadow-rose-900/20 transition-all"
            >
              Pay Fees Now
            </button>
          </div>
        </div>
      )}

      {savedReg && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-emerald-200 dark:border-emerald-900/40 bg-emerald-50 dark:bg-emerald-950/30 px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="shrink-0 w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="text-sm font-bold text-emerald-900 dark:text-emerald-300">
                Registered for {savedReg.session} {savedReg.academicSessionName ? `(${savedReg.academicSessionName})` : ''}
              </p>
              <p className="text-xs text-emerald-700 dark:text-emerald-400">
                {savedReg.courseCount} {labels.subjectPlural.toLowerCase()} · {savedReg.totalCredits} {labels.creditLabel.toLowerCase()} · {savedReg.coreCount} Core · {savedReg.electiveCount} Elective
              </p>
            </div>
          </div>
          <button
            onClick={() => handlePrint(savedReg.courses, savedReg.session)}
            className="shrink-0 inline-flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-bold shadow-sm transition-colors"
          >
            <Printer className="w-4 h-4" />
            Print Registered {isCollege ? 'Courses' : 'Subjects'}
          </button>
        </div>
      )}

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
          <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Selected</p>
          <p className="text-2xl font-bold text-purple-600 dark:text-purple-400 mt-1">
            {contextSession ? selectedIds.length : 0}
          </p>
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
      <div ref={printRef}>
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
              const selKey = isCollege ? (subject.session || '') : (subject.term || '');
              const isSelected = selKey ? (selectedBySession[selKey] || []).includes(subject.id) : false;
              const isRegistered = registeredBySession[selKey]?.includes(subject.id) ?? false;

              return (
                <div key={subject.id} className={cn("bg-white dark:bg-slate-900 rounded-xl border shadow-sm hover:shadow-md transition-shadow overflow-hidden", color.border, isSelected && "ring-2 ring-emerald-500 ring-offset-1")}>
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
                      <div className="flex flex-col items-end gap-1.5">
                        <span className={cn(
                          "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider",
                          subject.type === 'Core' ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                        )}>{subject.type}</span>
                        {!registrationBlocked && selKey && (
                          <button
                            onClick={() => toggleSubject(selKey, subject.id)}
                            className={cn(
                              "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border transition-colors",
                              isSelected
                                ? "bg-emerald-600 text-white border-emerald-600"
                                : "bg-white text-slate-600 border-slate-300 hover:border-emerald-500 hover:text-emerald-600 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-600"
                            )}
                          >
                            {isSelected ? '✓ Selected' : '+ Select'}
                          </button>
                        )}
                        {isRegistered && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                            Registered
                          </span>
                        )}
                      </div>
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

      {/* Sticky registration bar */}
      {!registrationBlocked && (
        <div className="sticky bottom-0 z-10 -mx-4 sm:-mx-6 px-4 sm:px-6 py-3 bg-white/95 dark:bg-slate-900/95 backdrop-blur border-t border-slate-200 dark:border-slate-800">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", contextSession && (selectedIds.length > 0 || savedReg) ? "bg-emerald-100 dark:bg-emerald-900/30" : "bg-slate-100 dark:bg-slate-800")}>
                <GraduationCap className={cn("w-5 h-5", contextSession && (selectedIds.length > 0 || savedReg) ? "text-emerald-600 dark:text-emerald-400" : "text-slate-400")} />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">
                  {contextSession
                    ? selectedIds.length > 0
                      ? `${selectedIds.length} ${labels.subjectPlural.toLowerCase()} selected · ${selectedCredits} ${labels.creditLabel.toLowerCase()}`
                      : savedReg
                        ? `Registered — ${savedReg.courseCount} ${labels.subjectPlural.toLowerCase()} · ${savedReg.totalCredits} ${labels.creditLabel.toLowerCase()}`
                        : 'No courses selected yet'
                    : 'Select a semester to register'}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {contextSession
                    ? selectedIds.length > 0
                      ? `Registering for ${contextSession}${academicSessionName ? ` (${academicSessionName})` : ''}`
                      : savedReg
                        ? `Already registered for ${contextSession}. Tap a ${labels.subjectSingular.toLowerCase()} card above to make changes.`
                        : `Tap a ${labels.subjectSingular.toLowerCase()} card above to select courses for ${contextSession}.`
                    : 'Tap First or Second Semester above, then choose your courses.'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {savedReg && (
                <button
                  onClick={() => handlePrint(savedReg.courses, savedReg.session)}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-400 transition-colors"
                >
                  <Printer className="w-4 h-4" />
                  Print
                </button>
              )}
              {!registrationClosed && savedReg && selectedIds.length > 0 && (
                <button
                  onClick={handleRegister}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-colors"
                >
                  Update Registration
                </button>
              )}
              {!registrationClosed && !savedReg && contextSession && (
                <button
                  onClick={handleRegister}
                  disabled={selectedIds.length === 0}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-colors disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed"
                >
                  <GraduationCap className="w-4 h-4" />
                  Register Your Courses
                </button>
              )}
            </div>
          </div>
        </div>
      )}

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
              {([] as { name: string; type: string; size: string }[]).map((material, i) => (
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