import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from './components/layout/DashboardLayout';
import { useSettingsStore } from './store/useSettingsStore';
import { useAuthStore } from './store/useAuthStore';
import { useDataStore } from './store/useDataStore';

import LoginPage from './pages/auth/Login';
import RegisterPage from './pages/auth/Register';
import VerifyEmailPage from './pages/auth/VerifyEmail';

import SuperAdminDashboard from './pages/SuperAdmin';
import SchoolsManagement from './pages/SuperAdmin/Schools';
import UsersManagement from './pages/SuperAdmin/Users';
import SubscriptionPlans from './pages/SuperAdmin/Subscriptions';
import PaymentsManagement from './pages/SuperAdmin/Payments';
import GlobalSettings from './pages/SuperAdmin/Settings';
import RegistrationFields from './pages/SuperAdmin/RegistrationFields';
import AdminDashboard from './pages/Admin';
import AdminFinanceDashboard from './pages/Admin/Finance';
import StudentsDirectory from './pages/Admin/Students';
import TeachersDirectory from './pages/Admin/Teachers';
import ClassesManagement from './pages/Admin/Classes';
import AdminAccessControl from './pages/Admin/AccessControl';
import AdminTimetable from './pages/Admin/Timetable';
import AcademicManagement from './pages/Admin/Academic';
import ExamManagement from './pages/Admin/Exams';
import ExamTimetable from './pages/Admin/ExamTimetable';
import ResultSheet from './pages/Admin/Results';
import AdminParents from './pages/Admin/Parents';
import AdminNotices from './pages/Admin/Notices';
import TeacherDashboard from './pages/Teacher';
import TeacherClasses from './pages/Teacher/Classes';
import TeacherSubjects from './pages/Teacher/Subjects';
import TeacherExams from './pages/Teacher/Exams';
import MarkAttendance from './pages/Teacher/Attendance';
import TeacherAssignments from './pages/Teacher/Assignments';
import StudentDashboard from './pages/Student';
import StudentCourses from './pages/Student/Courses';
import StudentAssignments from './pages/Student/Assignments';
import StudentFees from './pages/Student/Fees';
import ExamSession from './pages/Student/Exams';
import StudentAttendance from './pages/Student/Attendance';
import ParentDashboard from './pages/Parent';
import MyChildren from './pages/Parent/Children';
import ChildrenAttendance from './pages/Parent/Attendance';
import FeesAndPayments from './pages/Parent/Fees';
import ParentMessages from './pages/Parent/Messages';
import HRDashboard from './pages/HR';
import HREmployees from './pages/HR/Employees';
import HRAttendance from './pages/HR/Attendance';
import HRLeaves from './pages/HR/Leaves';
import HRPayroll from './pages/HR/Payroll';

import HostelDashboard from './pages/Hostel';
import HostelRooms from './pages/Hostel/Rooms';
import WardenStudents from './pages/Hostel/Students';
import RoomAllocation from './pages/Hostel/Allocation';
import HostelMaintenance from './pages/Hostel/Maintenance';

import AccountantDashboard from './pages/Accountant';
import AccountantFees from './pages/Accountant/Fees';
import AccountantExpenses from './pages/Accountant/Expenses';
import AccountantPayroll from './pages/Accountant/Payroll';

import TransportDashboard from './pages/Transport';
import TransportVehicles from './pages/Transport/Vehicles';
import TransportRoutes from './pages/Transport/Routes';
import TransportStudents from './pages/Transport/Students';

import LibrarianDashboard from './pages/Librarian';
import LibraryBooks from './pages/Librarian/Books';
import IssueReturn from './pages/Librarian/IssueReturn';
import LibraryMembers from './pages/Librarian/Members';
import Profile from './pages/Profile';
import Home from './pages/Home';
import AdmissionApply from './pages/Admission/Apply';
import AdminAdmissions from './pages/Admin/Admissions';

export default function App() {
  const logoUrl = useSettingsStore((s) => s.globalSettings.logoUrl);
  const initAuthListener = useAuthStore((s) => s.initAuthListener);
  const initSettingsSubscription = useSettingsStore((s) => s.initSettingsSubscription);
  const initSubscriptions = useDataStore((s) => s.initSubscriptions);

  useEffect(() => {
    initAuthListener();
    initSettingsSubscription();
    initSubscriptions();
  }, [initAuthListener, initSettingsSubscription, initSubscriptions]);

  useEffect(() => {
    if (logoUrl) {
      document.documentElement.style.setProperty('--school-logo-url', `url(${logoUrl})`);
    } else {
      document.documentElement.style.setProperty('--school-logo-url', 'none');
    }
  }, [logoUrl]);

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/verify-email" element={<VerifyEmailPage />} />

      {/* Public Admission Application */}
      <Route path="/admissions/apply" element={<AdmissionApply />} />

      {/* Super Admin Routes */}
      <Route element={<DashboardLayout />}>
        <Route path="/super-admin" element={<SuperAdminDashboard />} />
        <Route path="/super-admin/schools" element={<SchoolsManagement />} />
        <Route path="/super-admin/users" element={<UsersManagement />} />
        <Route path="/super-admin/subscriptions" element={<SubscriptionPlans />} />
        <Route path="/super-admin/payments" element={<PaymentsManagement />} />
        <Route path="/super-admin/settings" element={<GlobalSettings />} />
        <Route path="/super-admin/registration-fields" element={<RegistrationFields />} />
      </Route>

      {/* Admin Routes */}
      <Route element={<DashboardLayout />}>
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/students" element={<StudentsDirectory />} />
        <Route path="/admin/teachers" element={<TeachersDirectory />} />
        <Route path="/admin/access-control" element={<AdminAccessControl />} />
        <Route path="/admin/parents" element={<AdminParents />} />
        <Route path="/admin/classes" element={<ClassesManagement />} />
        <Route path="/admin/timetable" element={<AdminTimetable />} />
        <Route path="/admin/academic" element={<AcademicManagement />} />
        <Route path="/admin/exams" element={<ExamManagement />} />
        <Route path="/admin/exam-timetable" element={<ExamTimetable />} />
        <Route path="/admin/results" element={<ResultSheet />} />
        <Route path="/admin/finance" element={<AdminFinanceDashboard />} />
        <Route path="/admin/fees" element={<AccountantFees />} />
        <Route path="/admin/expenses" element={<AccountantExpenses />} />
        <Route path="/admin/payroll" element={<AccountantPayroll />} />
        <Route path="/admin/notices" element={<AdminNotices />} />
        <Route path="/admin/admissions" element={<AdminAdmissions />} />
      </Route>

      {/* Teacher Routes */}
      <Route element={<DashboardLayout />}>
        <Route path="/teacher" element={<TeacherDashboard />} />
        <Route path="/teacher/classes" element={<TeacherClasses />} />
        <Route path="/teacher/subjects" element={<TeacherSubjects />} />
        <Route path="/teacher/assignments" element={<TeacherAssignments />} />
        <Route path="/teacher/exams" element={<TeacherExams />} />
        <Route path="/teacher/attendance" element={<MarkAttendance />} />
      </Route>

      {/* Student Routes */}
      <Route element={<DashboardLayout />}>
        <Route path="/student" element={<StudentDashboard />} />
        <Route path="/student/courses" element={<StudentCourses />} />
        <Route path="/student/assignments" element={<StudentAssignments />} />
        <Route path="/student/exams" element={<ExamSession />} />
        <Route path="/student/attendance" element={<StudentAttendance />} />
        <Route path="/student/fees" element={<StudentFees />} />
      </Route>

      {/* Parent Routes */}
      <Route element={<DashboardLayout />}>
        <Route path="/parent" element={<ParentDashboard />} />
        <Route path="/parent/children" element={<MyChildren />} />
        <Route path="/parent/attendance" element={<ChildrenAttendance />} />
        <Route path="/parent/fees" element={<FeesAndPayments />} />
        <Route path="/parent/messages" element={<ParentMessages />} />
      </Route>

      {/* HR Routes */}
      <Route element={<DashboardLayout />}>
        <Route path="/hr" element={<HRDashboard />} />
        <Route path="/hr/employees" element={<HREmployees />} />
        <Route path="/hr/attendance" element={<HRAttendance />} />
        <Route path="/hr/leaves" element={<HRLeaves />} />
        <Route path="/hr/payroll" element={<HRPayroll />} />
      </Route>

      {/* Hostel Routes */}
      <Route element={<DashboardLayout />}>
        <Route path="/hostel" element={<HostelDashboard />} />
        <Route path="/hostel/rooms" element={<HostelRooms />} />
        <Route path="/hostel/students" element={<WardenStudents />} />
        <Route path="/hostel/allocation" element={<RoomAllocation />} />
        <Route path="/hostel/maintenance" element={<HostelMaintenance />} />
      </Route>

      {/* Accountant Routes */}
      <Route element={<DashboardLayout />}>
        <Route path="/accountant" element={<AccountantDashboard />} />
        <Route path="/accountant/fees" element={<AccountantFees />} />
        <Route path="/accountant/expenses" element={<AccountantExpenses />} />
        <Route path="/accountant/payroll" element={<AccountantPayroll />} />
      </Route>

      {/* Transport Routes */}
      <Route element={<DashboardLayout />}>
        <Route path="/transport" element={<TransportDashboard />} />
        <Route path="/transport/vehicles" element={<TransportVehicles />} />
        <Route path="/transport/routes" element={<TransportRoutes />} />
        <Route path="/transport/students" element={<TransportStudents />} />
      </Route>

      {/* Librarian Routes */}
      <Route element={<DashboardLayout />}>
        <Route path="/librarian" element={<LibrarianDashboard />} />
        <Route path="/librarian/books" element={<LibraryBooks />} />
        <Route path="/librarian/issue" element={<IssueReturn />} />
        <Route path="/librarian/members" element={<LibraryMembers />} />
      </Route>

      {/* Global Profile Route */}
      <Route element={<DashboardLayout />}>
        <Route path="/profile" element={<Profile />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
