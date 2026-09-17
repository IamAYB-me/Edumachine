import React, { useState, useMemo } from 'react';
import { Search, Eye, Users, CheckCircle, AlertCircle, GraduationCap, Filter, X } from 'lucide-react';
import { cn } from '@/utils';
import { useDataStore, Student } from '@/store/useDataStore';
import { useAuthStore } from '@/store/useAuthStore';
import { resolveSchoolProfile, getPortalLevelLabels } from '@/utils/schoolProfile';
import { KPICard } from '@/components/ui/KPICard';
import Pagination from '@/components/ui/Pagination';
import { usePagination } from '@/hooks/usePagination';

export default function RegistrarStudents() {
  const { students, schools } = useDataStore();
  const user = useAuthStore((state) => state.user);
  const schoolProfile = resolveSchoolProfile(user, schools);
  const labels = getPortalLevelLabels(schoolProfile.portalLevel);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | Student['status']>('All');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  const stats = useMemo(() => ({
    total: students.length,
    active: students.filter((s) => s.status === 'Active').length,
    inactive: students.filter((s) => s.status !== 'Active').length,
    classes: new Set(students.map((s) => s.classDepartment || s.class).filter(Boolean)).size,
  }), [students]);

  const filtered = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();
    return students
      .filter((s) => {
        const matchesSearch = !normalizedSearch || [
          s.name, s.regNo, s.admissionNumber, s.email, s.classDepartment, s.class, s.parentName,
        ].filter(Boolean).some((v) => v!.toLowerCase().includes(normalizedSearch));
        const matchesStatus = statusFilter === 'All' || s.status === statusFilter;
        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => (a.name || '').localeCompare(b.name || ''));
  }, [searchTerm, statusFilter, students]);

  const pages = usePagination(filtered, 10);

  const statusBadge: Record<string, string> = {
    Active: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    Inactive: 'bg-slate-100 text-slate-700 dark:bg-slate-800/60 dark:text-slate-400',
    Graduated: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400',
    Suspended: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    Withdrawn: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
  };

  const DetailRow = ({ label, value }: { label: string; value?: string | number | null }) => (
    <div>
      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">{label}</p>
      <p className="text-sm font-medium text-slate-900 dark:text-white">{value || '—'}</p>
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white uppercase tracking-tight">{labels.learnerPlural} Directory</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 font-medium">
          View all enrolled {labels.learnerPlural.toLowerCase()} and their records.
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPICard title="Total Enrolled" value={stats.total} icon={Users} iconBgClass="bg-blue-50 dark:bg-blue-900/20" iconColorClass="text-blue-600 dark:text-blue-400" />
        <KPICard title={`Active ${labels.learnerPlural}`} value={stats.active} icon={CheckCircle} iconBgClass="bg-emerald-50 dark:bg-emerald-900/20" iconColorClass="text-emerald-600 dark:text-emerald-400" />
        <KPICard title="Other Statuses" value={stats.inactive} icon={AlertCircle} iconBgClass="bg-rose-50 dark:bg-rose-900/20" iconColorClass="text-rose-600 dark:text-rose-400" />
        <KPICard title={labels.structurePlural} value={stats.classes} icon={GraduationCap} iconBgClass="bg-violet-50 dark:bg-violet-900/20" iconColorClass="text-violet-600 dark:text-violet-400" />
      </div>

      {/* Search & Table */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={`Search by name, reg no, class, or email...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:border-violet-500 dark:text-white"
            />
          </div>
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
              className="px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:border-violet-500 dark:text-white appearance-none pr-8"
            >
              <option value="All">All Statuses</option>
              {['Active', 'Inactive', 'Graduated', 'Suspended', 'Withdrawn'].map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <Filter className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[850px]">
            <thead className="bg-slate-50 dark:bg-slate-800">
              <tr className="border-b border-slate-200 dark:border-slate-700 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">{labels.learnerSingular}</th>
                <th className="py-3 px-4">Reg No.</th>
                <th className="py-3 px-4">{labels.structureSingular}</th>
                <th className="py-3 px-4">Parent / Guardian</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-center">View</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-slate-100 dark:divide-slate-800">
              {pages.slice.map((student) => (
                <tr key={student.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 group transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      {student.passportUrl ? (
                        <img src={student.passportUrl} alt="" className="w-8 h-8 rounded-lg object-cover border border-slate-200 dark:border-slate-700" />
                      ) : (
                        <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center border border-slate-200 dark:border-slate-700">
                          <Users className="w-4 h-4 text-slate-400" />
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-slate-900 dark:text-white">{student.name}</p>
                        <p className="text-[10px] text-slate-500">{student.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-mono text-xs font-bold text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-900/20 px-2 py-1 rounded-md">
                      {student.regNo || '—'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-400 font-medium">{student.classDepartment || student.class || '—'}</td>
                  <td className="py-3 px-4 text-xs text-slate-600 dark:text-slate-400">{student.parentName || '—'}</td>
                  <td className="py-3 px-4">
                    <span className={cn("px-2.5 py-1 rounded-full text-[10px] font-bold", statusBadge[student.status] || '')}>
                      {student.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <button
                      onClick={() => setSelectedStudent(student)}
                      className="p-1.5 text-slate-400 hover:text-violet-600 hover:bg-violet-50 dark:hover:bg-violet-900/20 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                      title="View Record"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={6} className="py-16 text-center text-slate-400">
                  <Users className="w-12 h-12 mx-auto mb-3 opacity-20" />
                  <p className="text-sm font-medium">No {labels.learnerPlural.toLowerCase()} found.</p>
                  <p className="text-xs text-slate-400 mt-1">{labels.learnerPlural} will appear here once enrolled.</p>
                </td></tr>
              )}
            </tbody>
          </table>
        </div>

        <Pagination page={pages.page} totalPages={pages.totalPages} total={pages.total} start={pages.start} pageSize={pages.pageSize} onPageChange={pages.setPage} />
      </div>

      {/* Student Detail Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm" onClick={() => setSelectedStudent(null)}>
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 w-full max-w-2xl flex flex-col overflow-hidden max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-800/50">
              <div className="flex items-center gap-3">
                {selectedStudent.passportUrl ? (
                  <img src={selectedStudent.passportUrl} alt="" className="w-11 h-11 rounded-xl object-cover border-2 border-white dark:border-slate-700 shadow" />
                ) : (
                  <div className="w-11 h-11 rounded-xl bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center">
                    <Users className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                  </div>
                )}
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">{selectedStudent.name}</h2>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="font-mono text-xs font-bold text-violet-600 dark:text-violet-400">{selectedStudent.regNo}</span>
                    <span className={cn("px-2 py-0.5 rounded-full text-[9px] font-bold", statusBadge[selectedStudent.status])}>
                      {selectedStudent.status}
                    </span>
                  </div>
                </div>
              </div>
              <button onClick={() => setSelectedStudent(null)} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto space-y-5">
              <Section title="Personal Information">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  <DetailRow label="Surname" value={selectedStudent.surname} />
                  <DetailRow label="First Name" value={selectedStudent.firstName} />
                  <DetailRow label="Middle Name" value={selectedStudent.middleName} />
                  <DetailRow label="Gender" value={selectedStudent.gender} />
                  <DetailRow label="Date of Birth" value={selectedStudent.dateOfBirth} />
                  <DetailRow label="Nationality" value={selectedStudent.nationality} />
                  <DetailRow label="State of Origin" value={selectedStudent.stateOfOrigin} />
                  <DetailRow label="LGA" value={selectedStudent.lga} />
                  <DetailRow label="Email" value={selectedStudent.email} />
                  <DetailRow label="Phone" value={selectedStudent.phone} />
                </div>
              </Section>

              <Section title="Enrollment Details">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  <DetailRow label="Reg No." value={selectedStudent.regNo} />
                  <DetailRow label="Admission Number" value={selectedStudent.admissionNumber} />
                  <DetailRow label={labels.structureSingular} value={selectedStudent.classDepartment || selectedStudent.class} />
                  <DetailRow label="Date of Admission" value={selectedStudent.dateOfAdmission} />
                  <DetailRow label="Academic Session" value={selectedStudent.academicSession} />
                  <DetailRow label="Status" value={selectedStudent.status} />
                </div>
              </Section>

              <Section title="Parent / Guardian">
                <div className="grid grid-cols-2 gap-4">
                  <DetailRow label="Parent / Guardian" value={selectedStudent.parentName} />
                  <DetailRow label="Father Name" value={selectedStudent.fatherName} />
                  <DetailRow label="Father Phone" value={selectedStudent.fatherPhone} />
                  <DetailRow label="Father Email" value={selectedStudent.fatherEmail} />
                  <DetailRow label="Mother Name" value={selectedStudent.motherName} />
                  <DetailRow label="Mother Phone" value={selectedStudent.motherPhone} />
                </div>
              </Section>

              <Section title="Contact">
                <div className="grid grid-cols-1 gap-4">
                  <DetailRow label="Residential Address" value={selectedStudent.residentialAddress} />
                  <DetailRow label="Town / City" value={selectedStudent.townCity} />
                </div>
              </Section>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border-t border-slate-200 dark:border-slate-800 pt-4">
      <p className="text-[10px] font-bold text-slate-500 uppercase mb-3 tracking-wider">{title}</p>
      {children}
    </div>
  );
}
