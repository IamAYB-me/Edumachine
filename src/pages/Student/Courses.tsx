import React, { useMemo, useState } from 'react';
import { BookOpen, Clock, User, PlayCircle, FileText, TrendingUp, CheckCircle, GraduationCap, X } from 'lucide-react';
import { KPICard } from '@/components/ui/KPICard';
import { cn } from '@/utils';
import { useToastStore } from '@/store/useToastStore';
import { useAuthStore } from '@/store/useAuthStore';
import { useDataStore } from '@/store/useDataStore';
import { getPortalLevelLabels, resolveSchoolProfile } from '@/utils/schoolProfile';

const myCourses = [
  { id: 1, title: 'Data Structures & Algorithms', code: 'CSE 401', instructor: 'Dr. Emily Carter', progress: 65, nextClass: 'Today, 09:00 AM', credits: 4, color: 'blue' },
  { id: 2, title: 'Database Management Systems', code: 'CSE 400', instructor: 'Prof. Alan Turing', progress: 42, nextClass: 'Today, 11:00 AM', credits: 3, color: 'emerald' },
  { id: 3, title: 'Software Engineering', code: 'CSE 410', instructor: 'Dr. Grace Hopper', progress: 80, nextClass: 'Tomorrow, 01:00 PM', credits: 4, color: 'purple' },
  { id: 4, title: 'Computer Networks', code: 'CSE 414', instructor: 'Prof. Vint Cerf', progress: 30, nextClass: 'Tomorrow, 03:30 PM', credits: 3, color: 'amber' },
  { id: 5, title: 'Operating Systems', code: 'CSE 406', instructor: 'Dr. Linus Torvalds', progress: 55, nextClass: 'Wednesday, 10:00 AM', credits: 4, color: 'rose' },
];

const colorMap: Record<string, string> = {
  blue: 'bg-blue-500',
  emerald: 'bg-emerald-500',
  purple: 'bg-purple-500',
  amber: 'bg-amber-500',
  rose: 'bg-rose-500',
};

const bgMap: Record<string, string> = {
  blue: 'bg-blue-50 text-blue-700',
  emerald: 'bg-emerald-50 text-emerald-700',
  purple: 'bg-purple-50 text-purple-700',
  amber: 'bg-amber-50 text-amber-700',
  rose: 'bg-rose-50 text-rose-700',
};

export default function StudentCourses() {
  const showToast = useToastStore((state) => state.showToast);
  const user = useAuthStore((state) => state.user);
  const schools = useDataStore((state) => state.schools);
  const schoolProfile = resolveSchoolProfile(user, schools);
  const labels = getPortalLevelLabels(schoolProfile.portalLevel);
  const [catalogOpen, setCatalogOpen] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);
  const [viewerMode, setViewerMode] = useState<'materials' | 'video' | null>(null);

  const selectedCourse = useMemo(
    () => myCourses.find((course) => course.id === selectedCourseId) ?? null,
    [selectedCourseId]
  );

  const handleBrowseCatalog = () => {
    setCatalogOpen(true);
    showToast({
      title: 'Course catalog opened',
      description: 'Browse available academic resources and recommended courses.',
      variant: 'info',
    });
  };

  const handleOpenCourseView = (courseId: number, mode: 'materials' | 'video') => {
    setSelectedCourseId(courseId);
    setViewerMode(mode);
  };

  const handleCloseModal = () => {
    setSelectedCourseId(null);
    setViewerMode(null);
  };

  return (
    <div className="space-y-6">
      {catalogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-3xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/50 px-8 py-6 dark:border-slate-800 dark:bg-slate-800/50">
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Course Catalog</h2>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Explore the full list of academic course offerings and resources.</p>
              </div>
              <button onClick={() => setCatalogOpen(false)} className="rounded-2xl p-2 hover:bg-slate-100 dark:hover:bg-slate-800">
                <X className="h-5 w-5 text-slate-500" />
              </button>
            </div>
            <div className="grid grid-cols-1 gap-4 p-8 md:grid-cols-2">
              {myCourses.map((course) => (
                <div key={course.id} className="rounded-3xl border border-slate-200 p-5 dark:border-slate-800">
                  <div className={cn('mb-4 h-2 rounded-full', colorMap[course.color])}></div>
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-400">{course.code}</p>
                  <h3 className="mt-2 text-lg font-bold text-slate-900 dark:text-white">{course.title}</h3>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{course.instructor}</p>
                  <div className="mt-4 flex gap-2">
                    <button onClick={() => handleOpenCourseView(course.id, 'materials')} className="flex-1 rounded-2xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-blue-700">
                      Materials
                    </button>
                    <button onClick={() => handleOpenCourseView(course.id, 'video')} className="flex-1 rounded-2xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800">
                      Preview
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {selectedCourse && viewerMode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-3xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/50 px-8 py-6 dark:border-slate-800 dark:bg-slate-800/50">
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  {viewerMode === 'materials' ? 'Course Materials' : 'Video Player'}
                </h2>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{selectedCourse.title}</p>
              </div>
              <button onClick={handleCloseModal} className="rounded-2xl p-2 hover:bg-slate-100 dark:hover:bg-slate-800">
                <X className="h-5 w-5 text-slate-500" />
              </button>
            </div>
            <div className="p-8">
              {viewerMode === 'materials' ? (
                <div className="space-y-4">
                  {[
                    `${selectedCourse.code} Lecture Notes.pdf`,
                    `${selectedCourse.code} Practical Worksheet.docx`,
                    `${selectedCourse.code} Revision Slides.pptx`,
                  ].map((item) => (
                    <div key={item} className="flex items-center justify-between rounded-2xl border border-slate-200 px-5 py-4 dark:border-slate-800">
                      <div className="flex items-center gap-3">
                        <div className="rounded-xl bg-blue-50 p-2 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
                          <FileText className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900 dark:text-white">{item}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">Ready for download and study</p>
                        </div>
                      </div>
                      <button
                        onClick={() =>
                          showToast({
                            title: 'Material opened',
                            description: `${item} is ready for review.`,
                            variant: 'success',
                          })
                        }
                        className="rounded-2xl border border-slate-200 px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                      >
                        Open
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="flex aspect-video items-center justify-center rounded-3xl bg-slate-900 text-white">
                    <div className="text-center">
                      <PlayCircle className="mx-auto h-16 w-16 text-blue-400" />
                      <p className="mt-4 text-lg font-bold">Video lesson preview</p>
                      <p className="mt-1 text-sm text-slate-400">{selectedCourse.title}</p>
                    </div>
                  </div>
                  <button
                    onClick={() =>
                      showToast({
                        title: 'Video player started',
                        description: `${selectedCourse.title} lesson is now playing.`,
                        variant: 'success',
                      })
                    }
                    className="w-full rounded-2xl bg-blue-600 px-5 py-3 text-sm font-bold text-white hover:bg-blue-700"
                  >
                    Play Lesson
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white uppercase tracking-tight">{labels.studyLabel}</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 font-medium">Track your enrolled {labels.curriculumLabel.toLowerCase()}, syllabus progress, and instructors.</p>
        </div>
        <button onClick={handleBrowseCatalog} className="flex items-center gap-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 px-6 py-2.5 rounded-2xl text-sm font-bold transition-all shadow-sm active:scale-95">
          <BookOpen className="w-4 h-4" />
          Browse Catalog
        </button>
      </div>

      {/* KPI Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard 
          title={`Active ${labels.curriculumLabel}`} 
          value="5" 
          icon={GraduationCap} 
          iconBgClass="bg-blue-50 dark:bg-blue-900/20"
          iconColorClass="text-blue-600 dark:text-blue-400"
          trend={{ value: 0, label: labels.stageLabel }}
        />
        <KPICard 
          title="Avg. Progress" 
          value="54%" 
          icon={TrendingUp} 
          iconBgClass="bg-emerald-50 dark:bg-emerald-900/20"
          iconColorClass="text-emerald-600 dark:text-emerald-400"
          trend={{ value: 5, label: "Up from last week" }}
        />
        <KPICard 
          title={schoolProfile.portalLevel === 'Primary' || schoolProfile.portalLevel === 'Secondary' ? 'Total Subjects' : 'Total Credits'} 
          value={schoolProfile.portalLevel === 'Primary' || schoolProfile.portalLevel === 'Secondary' ? '5' : '18'} 
          icon={BookOpen} 
          iconBgClass="bg-purple-50 dark:bg-purple-900/20"
          iconColorClass="text-purple-600 dark:text-purple-400"
        />
        <KPICard 
          title="Completed" 
          value="12" 
          icon={CheckCircle} 
          iconBgClass="bg-amber-50 dark:bg-amber-900/20"
          iconColorClass="text-amber-600 dark:text-amber-400"
          trend={{ value: 0, label: schoolProfile.portalLevel === 'Primary' || schoolProfile.portalLevel === 'Secondary' ? 'In previous terms' : 'In previous sessions' }}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {myCourses.map((course) => (
          <div key={course.id} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden group hover:shadow-md transition-all">
            <div className={cn("h-2 w-full", colorMap[course.color])}></div>
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <span className={cn("px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider", bgMap[course.color])}>
                  {course.code}
                </span>
                <span className="text-xs font-medium text-slate-500">{course.credits} Credits</span>
              </div>
              
              <h3 className="text-lg font-bold text-slate-900 mb-2 line-clamp-1" title={course.title}>
                {course.title}
              </h3>
              
              <div className="flex items-center gap-2 text-sm text-slate-600 mb-6">
                <User className="w-4 h-4 text-slate-400" />
                {course.instructor}
              </div>

              <div className="space-y-2 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600 font-medium">Course Progress</span>
                  <span className="text-slate-900 font-bold">{course.progress}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div className={cn("h-2 rounded-full", colorMap[course.color])} style={{ width: `${course.progress}%` }}></div>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs font-medium text-slate-500 bg-slate-50 p-3 rounded-lg mb-6">
                <Clock className="w-4 h-4 text-slate-400" />
                Next Class: <span className="text-slate-900">{course.nextClass}</span>
              </div>

              <div className="flex gap-2">
                <button onClick={() => handleOpenCourseView(course.id, 'video')} className="flex-1 flex items-center justify-center gap-2 bg-blue-50 text-blue-700 hover:bg-blue-100 py-2 rounded-lg text-sm font-semibold transition-colors">
                  <PlayCircle className="w-4 h-4" />
                  Continue
                </button>
                <button onClick={() => handleOpenCourseView(course.id, 'materials')} className="p-2 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-lg transition-colors" title="Materials">
                  <FileText className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
