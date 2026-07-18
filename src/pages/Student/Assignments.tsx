import React, { useState } from 'react';
import { FileText, Calendar, Clock, CheckCircle, Download, Upload, TrendingUp, ClipboardCheck, X } from 'lucide-react';
import { KPICard } from '@/components/ui/KPICard';
import { cn } from '@/utils';
import { useToastStore } from '@/store/useToastStore';

type StudentAssignment = {
  id: string;
  title: string;
  course: string;
  dueDate: string;
  status: 'Pending' | 'Submitted' | 'Graded' | 'Active' | 'Overdue';
  points: string;
  difficulty: 'Hard' | 'Medium' | 'Low';
  submittedDate?: string;
  grade?: string;
};

const initialAssignments: StudentAssignment[] = [
  { id: 'ASG-001', title: 'Binary Trees Implementation', course: 'Data Structures', dueDate: '2025-10-30', status: 'Pending', points: '100', difficulty: 'Hard' },
  { id: 'ASG-002', title: 'SQL Query Optimization', course: 'Database Systems', dueDate: '2025-10-28', status: 'Submitted', points: '50', difficulty: 'Medium', submittedDate: '2025-10-24' },
  { id: 'ASG-004', title: 'Network Protocol Simulation', course: 'Computer Networks', dueDate: '2025-10-20', status: 'Graded', points: '100', grade: '95/100', difficulty: 'Hard' },
  { id: 'ASG-005', title: 'Process Scheduling Lab', course: 'Operating Systems', dueDate: '2025-11-02', status: 'Active', points: '75', difficulty: 'Medium' },
];

export default function StudentAssignments() {
  const showToast = useToastStore((state) => state.showToast);
  const [assignments, setAssignments] = useState<StudentAssignment[]>(initialAssignments);
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<string | null>(null);
  const [submissionNote, setSubmissionNote] = useState('');
  const [submissionFileName, setSubmissionFileName] = useState('');

  const selectedAssignment = assignments.find((assignment) => assignment.id === selectedAssignmentId) ?? null;

  const totalAssignments = assignments.length;
  const gradedAssignments = assignments.filter((a) => a.status === 'Graded');
  const avgGrade = gradedAssignments.length > 0
    ? Math.round(gradedAssignments.reduce((sum, a) => sum + Number(a.grade?.split('/')[0] || 0), 0) / gradedAssignments.length)
    : 0;
  const pendingCount = assignments.filter((a) => a.status === 'Pending' || a.status === 'Active').length;
  const gradedCount = gradedAssignments.length;

  const handleOpenSubmit = (assignmentId: string) => {
    setSelectedAssignmentId(assignmentId);
    setSubmissionNote('');
    setSubmissionFileName('');
  };

  const handleSubmitAssignment = () => {
    if (!selectedAssignment) return;

    setAssignments((current) =>
      current.map((assignment) =>
        assignment.id === selectedAssignment.id
          ? {
              ...assignment,
              status: 'Submitted',
              submittedDate: new Date().toISOString().split('T')[0],
            }
          : assignment
      )
    );
    setSelectedAssignmentId(null);
    showToast({
      title: 'Assignment submitted',
      description: `${selectedAssignment.title} has been submitted successfully.`,
      variant: 'success',
    });
  };

  return (
    <div className="space-y-6">
      {selectedAssignment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/50 px-8 py-6 dark:border-slate-800 dark:bg-slate-800/50">
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Submit Assignment</h2>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{selectedAssignment.title}</p>
              </div>
              <button onClick={() => setSelectedAssignmentId(null)} className="rounded-2xl p-2 hover:bg-slate-100 dark:hover:bg-slate-800">
                <X className="h-5 w-5 text-slate-500" />
              </button>
            </div>
            <div className="space-y-4 p-8">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Submission Note</label>
                <textarea
                  rows={4}
                  value={submissionNote}
                  onChange={(e) => setSubmissionNote(e.target.value)}
                  placeholder="Add a short note for your lecturer..."
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition-all focus:border-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Attach File</label>
                <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-5 py-4 text-sm font-medium text-slate-600 transition-all hover:border-blue-400 hover:bg-blue-50/50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-blue-700 dark:hover:bg-blue-900/20">
                  <Upload className="h-4 w-4" />
                  <span>{submissionFileName || 'Upload assignment file'}</span>
                  <input type="file" className="hidden" onChange={(e) => setSubmissionFileName(e.target.files?.[0]?.name || '')} />
                </label>
              </div>
              <div className="flex gap-3 pt-4">
                <button onClick={() => setSelectedAssignmentId(null)} className="flex-1 rounded-2xl border border-slate-200 px-6 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800">
                  Cancel
                </button>
                <button onClick={handleSubmitAssignment} className="flex-1 rounded-2xl bg-blue-600 px-6 py-3 text-sm font-bold text-white hover:bg-blue-700">
                  Submit Assignment
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white uppercase tracking-tight">Academic Assessments</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 font-medium">View, track, and submit your course assignments and projects.</p>
        </div>
      </div>

      {/* KPI Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard 
          title="Total Assignments" 
          value={totalAssignments} 
          icon={ClipboardCheck} 
          iconBgClass="bg-blue-50 dark:bg-blue-900/20"
          iconColorClass="text-blue-600 dark:text-blue-400"
          trend={{ value: 0, label: "Current Session" }}
        />
        <KPICard 
          title="Avg. Grade" 
          value={`${avgGrade}%`} 
          icon={TrendingUp} 
          iconBgClass="bg-emerald-50 dark:bg-emerald-900/20"
          iconColorClass="text-emerald-600 dark:text-emerald-400"
          trend={{ value: 0, label: gradedAssignments.length > 0 ? "Based on graded" : "No grades yet" }}
        />
        <KPICard 
          title="Pending" 
          value={pendingCount} 
          icon={Clock} 
          iconBgClass="bg-rose-50 dark:bg-rose-900/20"
          iconColorClass="text-rose-600 dark:text-rose-400"
          trend={{ value: 0, label: "Due this week" }}
        />
        <KPICard 
          title="Graded" 
          value={gradedCount} 
          icon={CheckCircle} 
          iconBgClass="bg-amber-50 dark:bg-amber-900/20"
          iconColorClass="text-amber-600 dark:text-amber-400"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          {assignments.map((asg) => (
            <div key={asg.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:border-blue-200 transition-all group">
              <div className="flex flex-col sm:flex-row justify-between gap-4">
                <div className="flex gap-4">
                  <div className={cn(
                    "p-3 rounded-xl h-fit",
                    asg.status === 'Graded' ? "bg-emerald-50 text-emerald-600" :
                    asg.status === 'Submitted' ? "bg-blue-50 text-blue-600" : "bg-amber-50 text-amber-600"
                  )}>
                    <FileText className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{asg.title}</h3>
                    <p className="text-sm text-slate-500 font-medium">{asg.course}</p>
                    
                    <div className="flex flex-wrap items-center gap-y-2 gap-x-4 mt-3">
                      <div className="flex items-center gap-1.5 text-xs text-slate-500">
                        <Calendar className="w-3.5 h-3.5" />
                        Due: {asg.dueDate}
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-slate-500">
                        <Clock className="w-3.5 h-3.5" />
                        {asg.points} Points
                      </div>
                      <div className={cn(
                        "text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider",
                        asg.difficulty === 'Hard' ? "bg-rose-50 text-rose-600" : "bg-blue-50 text-blue-600"
                      )}>
                        {asg.difficulty}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-row sm:flex-col justify-between items-end gap-2">
                  <span className={cn(
                    "px-3 py-1 rounded-full text-xs font-bold",
                    asg.status === 'Graded' ? "bg-emerald-100 text-emerald-700" :
                    asg.status === 'Submitted' ? "bg-blue-100 text-blue-700" : 
                    asg.status === 'Overdue' ? "bg-rose-100 text-rose-700" : "bg-amber-100 text-amber-700"
                  )}>
                    {asg.status}
                  </span>
                  
                  {asg.status === 'Graded' ? (
                    <div className="text-right">
                      <p className="text-xs text-slate-500">Grade</p>
                      <p className="text-lg font-bold text-emerald-600">{asg.grade}</p>
                    </div>
                  ) : asg.status === 'Submitted' ? (
                    <p className="text-[10px] text-slate-400 italic">Submitted on {asg.submittedDate}</p>
                  ) : (
                    <button onClick={() => handleOpenSubmit(asg.id)} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-1.5 rounded-lg text-xs font-bold hover:bg-blue-700 transition-colors shadow-sm shadow-blue-600/20">
                      <Upload className="w-3.5 h-3.5" />
                      Submit Now
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-6">
          <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-xl relative overflow-hidden">
            <div className="relative z-10">
              <h3 className="text-lg font-bold mb-2">Upcoming Deadline</h3>
              <p className="text-slate-400 text-sm mb-6">Binary Trees Implementation</p>
              
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="text-center">
                  <div className="text-2xl font-bold">02</div>
                  <div className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Days</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">14</div>
                  <div className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Hours</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">35</div>
                  <div className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Mins</div>
                </div>
              </div>
              
              <button onClick={() => { const pending = assignments.find(a => a.status === 'Pending' || a.status === 'Active'); if (pending) handleOpenSubmit(pending.id); }} className="w-full bg-white text-slate-900 py-2.5 rounded-xl text-sm font-bold hover:bg-slate-100 transition-colors">
                View Details
              </button>
            </div>
            {/* Background decoration */}
            <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-blue-600/20 rounded-full blur-2xl"></div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Resources</h3>
            <div className="space-y-3">
              {[
                { name: 'Assignment Guidelines.pdf', size: '1.2 MB' },
                { name: 'Template Project.zip', size: '4.5 MB' },
                { name: 'Reference Papers.pdf', size: '8.4 MB' },
              ].map((res, i) => (
                <div key={i} onClick={() => { const blob = new Blob(['Demo file content'], { type: 'application/octet-stream' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = res.name; document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url); showToast({ title: 'Download started', description: `${res.name} (${res.size}) is being downloaded.`, variant: 'success' }); }} className="flex items-center justify-between p-3 border border-slate-100 rounded-lg group cursor-pointer hover:border-blue-200 hover:bg-blue-50/30 transition-all">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-slate-50 text-slate-400 group-hover:text-blue-600 group-hover:bg-blue-50 rounded-lg transition-colors">
                      <Download className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-700 group-hover:text-slate-900 transition-colors">{res.name}</p>
                      <p className="text-[10px] text-slate-400">{res.size}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
