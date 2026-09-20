import React, { Suspense, lazy, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from './components/layout/DashboardLayout';
import IdleSessionTimeout from './components/ui/IdleSessionTimeout';
import InstallAppBanner from './components/ui/InstallAppBanner';
import { useSettingsStore } from './store/useSettingsStore';
import { useAuthStore } from './store/useAuthStore';
import { useDataStore } from './store/useDataStore';

const prefetchQueue: Array<() => Promise<unknown>> = [];
function lazyComponent<T extends React.ComponentType<any>>(factory: () => Promise<{ default: T }>) {
  prefetchQueue.push(factory);
  return lazy(async () => {
    try {
      return await factory();
    } catch (err) {
      if (isChunkLoadError(err) && !sessionStorage.getItem('chunk-reload-attempted')) {
        sessionStorage.setItem('chunk-reload-attempted', '1');
        window.location.reload();
      }
      throw err;
    }
  });
}

function isChunkLoadError(err: unknown): boolean {
  const message = err instanceof Error ? err.message : String(err);
  return /dynamically imported module|Loading chunk .* failed|import\(\).*failed/i.test(message);
}

function prefetchAllRoutes() {
  prefetchQueue.forEach((importer) => {
    importer().catch(() => {});
  });
}

const LoginPage = lazyComponent(() => import('./pages/auth/Login'));
const RegisterPage = lazyComponent(() => import('./pages/auth/Register'));
const VerifyEmailPage = lazyComponent(() => import('./pages/auth/VerifyEmail'));
const Home = lazyComponent(() => import('./pages/Home'));
const Profile = lazyComponent(() => import('./pages/Profile'));

const SuperAdminDashboard = lazyComponent(() => import('./pages/SuperAdmin'));
const SchoolsManagement = lazyComponent(() => import('./pages/SuperAdmin/Schools'));
const UsersManagement = lazyComponent(() => import('./pages/SuperAdmin/Users'));
const SubscriptionPlans = lazyComponent(() => import('./pages/SuperAdmin/Subscriptions'));
const PaymentsManagement = lazyComponent(() => import('./pages/SuperAdmin/Payments'));
const GlobalSettings = lazyComponent(() => import('./pages/SuperAdmin/Settings'));
const RegistrationFields = lazyComponent(() => import('./pages/SuperAdmin/RegistrationFields'));
const SuperAdminDeletionRequests = lazyComponent(() => import('./pages/SuperAdmin/DeletionRequests'));
const SuperAdminSchoolUsers = lazyComponent(() => import('./pages/SuperAdmin/SchoolUsers'));
const SuperAdminCleanupUsers = lazyComponent(() => import('./pages/SuperAdmin/CleanupUsers'));

const AdminDashboard = lazyComponent(() => import('./pages/Admin'));
const AdminFinanceDashboard = lazyComponent(() => import('./pages/Admin/Finance'));
const StudentsDirectory = lazyComponent(() => import('./pages/Admin/Students'));
const TeachersDirectory = lazyComponent(() => import('./pages/Admin/Teachers'));
const ClassesManagement = lazyComponent(() => import('./pages/Admin/Classes'));
const AdminAccessControl = lazyComponent(() => import('./pages/Admin/AccessControl'));
const AdminTimetable = lazyComponent(() => import('./pages/Admin/Timetable'));
const AcademicManagement = lazyComponent(() => import('./pages/Admin/Academic'));
const ExamManagement = lazyComponent(() => import('./pages/Admin/Exams'));
const ExamTimetable = lazyComponent(() => import('./pages/Admin/ExamTimetable'));
const ResultSheet = lazyComponent(() => import('./pages/Admin/Results'));
const AdminParents = lazyComponent(() => import('./pages/Admin/Parents'));
const AdminNotices = lazyComponent(() => import('./pages/Admin/Notices'));
const AdminAdmissions = lazyComponent(() => import('./pages/Admin/Admissions'));
const AdminActivityLogs = lazyComponent(() => import('./pages/Admin/ActivityLogs'));
const AdminReportCard = lazyComponent(() => import('./pages/Admin/ReportCard'));
const StudentPromotions = lazyComponent(() => import('./pages/Admin/Promotions'));
const AccountantFees = lazyComponent(() => import('./pages/Accountant/Fees'));
const AccountantExpenses = lazyComponent(() => import('./pages/Accountant/Expenses'));
const AccountantPayroll = lazyComponent(() => import('./pages/Accountant/Payroll'));

const RegistrarDashboard = lazyComponent(() => import('./pages/Registrar'));
const RegistrarAdmissions = lazyComponent(() => import('./pages/Registrar/Admissions'));
const RegistrarStudents = lazyComponent(() => import('./pages/Registrar/Students'));

const TeacherDashboard = lazyComponent(() => import('./pages/Teacher'));
const TeacherClasses = lazyComponent(() => import('./pages/Teacher/Classes'));
const TeacherSubjects = lazyComponent(() => import('./pages/Teacher/Subjects'));
const TeacherExams = lazyComponent(() => import('./pages/Teacher/Exams'));
const MarkAttendance = lazyComponent(() => import('./pages/Teacher/Attendance'));
const TeacherAssignments = lazyComponent(() => import('./pages/Teacher/Assignments'));

const StudentDashboard = lazyComponent(() => import('./pages/Student'));
const StudentCourses = lazyComponent(() => import('./pages/Student/Courses'));
const StudentAssignments = lazyComponent(() => import('./pages/Student/Assignments'));
const StudentFees = lazyComponent(() => import('./pages/Student/Fees'));
const ExamSession = lazyComponent(() => import('./pages/Student/Exams'));
const StudentAttendance = lazyComponent(() => import('./pages/Student/Attendance'));
const StudentAdmissionLetter = lazyComponent(() => import('./pages/Student/AdmissionLetter'));

const ParentDashboard = lazyComponent(() => import('./pages/Parent'));
const MyChildren = lazyComponent(() => import('./pages/Parent/Children'));
const ChildrenAttendance = lazyComponent(() => import('./pages/Parent/Attendance'));
const FeesAndPayments = lazyComponent(() => import('./pages/Parent/Fees'));
const ParentMessages = lazyComponent(() => import('./pages/Parent/Messages'));

const HRDashboard = lazyComponent(() => import('./pages/HR'));
const HREmployees = lazyComponent(() => import('./pages/HR/Employees'));
const HRAttendance = lazyComponent(() => import('./pages/HR/Attendance'));
const HRLeaves = lazyComponent(() => import('./pages/HR/Leaves'));
const HRPayroll = lazyComponent(() => import('./pages/HR/Payroll'));

const HostelDashboard = lazyComponent(() => import('./pages/Hostel'));
const HostelRooms = lazyComponent(() => import('./pages/Hostel/Rooms'));
const WardenStudents = lazyComponent(() => import('./pages/Hostel/Students'));
const RoomAllocation = lazyComponent(() => import('./pages/Hostel/Allocation'));
const HostelMaintenance = lazyComponent(() => import('./pages/Hostel/Maintenance'));

const AccountantDashboard = lazyComponent(() => import('./pages/Accountant'));

const TransportDashboard = lazyComponent(() => import('./pages/Transport'));
const TransportVehicles = lazyComponent(() => import('./pages/Transport/Vehicles'));
const TransportRoutes = lazyComponent(() => import('./pages/Transport/Routes'));
const TransportStudents = lazyComponent(() => import('./pages/Transport/Students'));

const LibrarianDashboard = lazyComponent(() => import('./pages/Librarian'));
const LibraryBooks = lazyComponent(() => import('./pages/Librarian/Books'));
const IssueReturn = lazyComponent(() => import('./pages/Librarian/IssueReturn'));
const LibraryMembers = lazyComponent(() => import('./pages/Librarian/Members'));

const AdmissionApply = lazyComponent(() => import('./pages/Admission/Apply'));
const AdmissionProgress = lazyComponent(() => import('./pages/Admission/Progress'));
const AcceptancePayment = lazyComponent(() => import('./pages/Admission/AcceptancePayment'));

function LoadingSpinner() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 40, height: 40, border: '4px solid #e5e7eb', borderTopColor: '#3b82f6', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
        <p style={{ color: '#6b7280', fontSize: 14 }}>Loading...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      </div>
    </div>
  );
}

export default function App() {
  const logoUrl = useSettingsStore((s) => s.globalSettings.logoUrl);
  const user = useAuthStore((s) => s.user);
  const initAuthListener = useAuthStore((s) => s.initAuthListener);
  const initSettingsSubscription = useSettingsStore((s) => s.initSettingsSubscription);
  const initSubscriptions = useDataStore((s) => s.initSubscriptions);
  const dataReady = useDataStore((s) => s.dataReady);

  useEffect(() => {
    initAuthListener();
    initSettingsSubscription();
  }, [initAuthListener, initSettingsSubscription]);

  useEffect(() => {
    if (user) {
      initSubscriptions(user.role);
    } else {
      initSubscriptions();
    }
  }, [user, initSubscriptions]);

  useEffect(() => {
    if (logoUrl) {
      document.documentElement.style.setProperty('--school-logo-url', `url(${logoUrl})`);
    } else {
      document.documentElement.style.setProperty('--school-logo-url', 'none');
    }
  }, [logoUrl]);

  useEffect(() => {
    const idle = (window as any).requestIdleCallback || ((cb: () => void) => setTimeout(cb, 2000));
    const timer = idle(() => {
      prefetchAllRoutes();
    });
    return () => {
      if (typeof (timer as any)?.cancel === 'function') (timer as any).cancel();
      else if (typeof timer === 'number') clearTimeout(timer);
    };
  }, []);

  const showPage =
    dataReady ||
    !user ||
    !['SUPER_ADMIN', 'ADMIN', 'REGISTRAR', 'TEACHER', 'STUDENT', 'PARENT', 'HR', 'WARDEN', 'ACCOUNTANT', 'TRANSPORT', 'LIBRARIAN'].includes(user.role);

  return (
    <Suspense fallback={<LoadingSpinner />}>
      {!showPage ? <LoadingSpinner /> : (
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/verify-email" element={<VerifyEmailPage />} />
        <Route path="/verify-email/:mode" element={<VerifyEmailPage />} />

        <Route path="/admission/apply" element={<AdmissionApply />} />
        <Route path="/admissions/apply" element={<AdmissionApply />} />

        <Route element={<DashboardLayout />}>
          <Route path="/super-admin" element={<SuperAdminDashboard />} />
          <Route path="/super-admin/schools" element={<SchoolsManagement />} />
          <Route path="/super-admin/users" element={<UsersManagement />} />
          <Route path="/super-admin/subscriptions" element={<SubscriptionPlans />} />
          <Route path="/super-admin/payments" element={<PaymentsManagement />} />
          <Route path="/super-admin/settings" element={<GlobalSettings />} />
          <Route path="/super-admin/registration-fields" element={<RegistrationFields />} />
          <Route path="/super-admin/deletion-requests" element={<SuperAdminDeletionRequests />} />
          <Route path="/super-admin/school-users" element={<SuperAdminSchoolUsers />} />
          <Route path="/super-admin/cleanup-users" element={<SuperAdminCleanupUsers />} />
        </Route>

        <Route element={<DashboardLayout />}>
          <Route path="/registrar" element={<RegistrarDashboard />} />
          <Route path="/registrar/admissions" element={<RegistrarAdmissions />} />
          <Route path="/registrar/students" element={<RegistrarStudents />} />
          <Route path="/registrar/promotions" element={<StudentPromotions />} />
        </Route>

        <Route element={<DashboardLayout />}>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/students" element={<StudentsDirectory />} />
          <Route path="/admin/teachers" element={<TeachersDirectory />} />
          <Route path="/admin/access-control" element={<AdminAccessControl />} />
          <Route path="/admin/parents" element={<AdminParents />} />
          <Route path="/admin/classes" element={<ClassesManagement />} />
          <Route path="/admin/departments" element={<ClassesManagement />} />
          <Route path="/admin/timetable" element={<AdminTimetable />} />
          <Route path="/admin/academic" element={<AcademicManagement />} />
          <Route path="/admin/programmes" element={<AcademicManagement />} />
          <Route path="/admin/exams" element={<ExamManagement />} />
          <Route path="/admin/exam-timetable" element={<ExamTimetable />} />
          <Route path="/admin/results" element={<ResultSheet />} />
          <Route path="/admin/finance" element={<AdminFinanceDashboard />} />
          <Route path="/admin/fees" element={<AccountantFees />} />
          <Route path="/admin/expenses" element={<AccountantExpenses />} />
          <Route path="/admin/payroll" element={<AccountantPayroll />} />
          <Route path="/admin/notices" element={<AdminNotices />} />
          <Route path="/admin/admissions" element={<AdminAdmissions />} />
          <Route path="/admin/activity-logs" element={<AdminActivityLogs />} />
          <Route path="/admin/report-cards" element={<AdminReportCard />} />
          <Route path="/admin/promotions" element={<StudentPromotions />} />
        </Route>

        <Route element={<DashboardLayout />}>
          <Route path="/teacher" element={<TeacherDashboard />} />
          <Route path="/teacher/departments" element={<TeacherClasses />} />
          <Route path="/teacher/courses" element={<TeacherSubjects />} />
          <Route path="/teacher/assignments" element={<TeacherAssignments />} />
          <Route path="/teacher/exams" element={<TeacherExams />} />
          <Route path="/teacher/attendance" element={<MarkAttendance />} />
          <Route path="/teacher/classes" element={<Navigate to="/teacher/departments" replace />} />
          <Route path="/teacher/subjects" element={<Navigate to="/teacher/courses" replace />} />
        </Route>

        <Route element={<DashboardLayout />}>
          <Route path="/student" element={<StudentDashboard />} />
          <Route path="/student/courses" element={<StudentCourses />} />
          <Route path="/student/assignments" element={<StudentAssignments />} />
          <Route path="/student/exams" element={<ExamSession />} />
          <Route path="/student/attendance" element={<StudentAttendance />} />
          <Route path="/student/fees" element={<StudentFees />} />
          <Route path="/student/admission-letter" element={<StudentAdmissionLetter />} />
        </Route>

        <Route element={<DashboardLayout />}>
          <Route path="/parent" element={<ParentDashboard />} />
          <Route path="/parent/children" element={<MyChildren />} />
          <Route path="/parent/attendance" element={<ChildrenAttendance />} />
          <Route path="/parent/fees" element={<FeesAndPayments />} />
          <Route path="/parent/messages" element={<ParentMessages />} />
        </Route>

        <Route element={<DashboardLayout />}>
          <Route path="/hr" element={<HRDashboard />} />
          <Route path="/hr/employees" element={<HREmployees />} />
          <Route path="/hr/attendance" element={<HRAttendance />} />
          <Route path="/hr/leaves" element={<HRLeaves />} />
          <Route path="/hr/payroll" element={<HRPayroll />} />
        </Route>

        <Route element={<DashboardLayout />}>
          <Route path="/hostel" element={<HostelDashboard />} />
          <Route path="/hostel/rooms" element={<HostelRooms />} />
          <Route path="/hostel/students" element={<WardenStudents />} />
          <Route path="/hostel/allocation" element={<RoomAllocation />} />
          <Route path="/hostel/maintenance" element={<HostelMaintenance />} />
        </Route>

        <Route element={<DashboardLayout />}>
          <Route path="/accountant" element={<AccountantDashboard />} />
          <Route path="/accountant/fees" element={<AccountantFees />} />
          <Route path="/accountant/expenses" element={<AccountantExpenses />} />
          <Route path="/accountant/payroll" element={<AccountantPayroll />} />
        </Route>

        <Route element={<DashboardLayout />}>
          <Route path="/transport" element={<TransportDashboard />} />
          <Route path="/transport/vehicles" element={<TransportVehicles />} />
          <Route path="/transport/routes" element={<TransportRoutes />} />
          <Route path="/transport/students" element={<TransportStudents />} />
        </Route>

        <Route element={<DashboardLayout />}>
          <Route path="/librarian" element={<LibrarianDashboard />} />
          <Route path="/librarian/books" element={<LibraryBooks />} />
          <Route path="/librarian/issue" element={<IssueReturn />} />
          <Route path="/librarian/members" element={<LibraryMembers />} />
        </Route>

        <Route element={<DashboardLayout />}>
          <Route path="/profile" element={<Profile />} />
        </Route>

        <Route path="/admission/progress" element={<AdmissionProgress />} />
        <Route path="/admission/pay-acceptance" element={<AcceptancePayment />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      )}
      {user && <IdleSessionTimeout />}
      <InstallAppBanner />
    </Suspense>
  );
}
