import React from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import DashboardLayout from './components/layout/DashboardLayout';
import { useAuthStore, Role } from './store/useAuthStore';

import SuperAdminDashboard from './pages/SuperAdmin';
import SchoolsManagement from './pages/SuperAdmin/Schools';
import UsersManagement from './pages/SuperAdmin/Users';
import SubscriptionPlans from './pages/SuperAdmin/Subscriptions';
import PaymentsManagement from './pages/SuperAdmin/Payments';
import GlobalSettings from './pages/SuperAdmin/Settings';
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

// Placeholder components for remaining sub-pages
const PlaceholderPage = ({ title }: { title: string }) => (
  <div className="flex items-center justify-center h-full">
    <div className="text-center">
      <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">{title}</h1>
      <p className="text-slate-500 dark:text-slate-400">This module is under development and will be active soon.</p>
    </div>
  </div>
);

const Login = () => {
  const login = useAuthStore(state => state.login);
  const navigate = useNavigate();

  const handleLogin = (role: Role, path: string) => {
    login(role);
    navigate(path);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 py-12 px-4">
      <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200 max-w-md w-full">
        <h1 className="text-2xl font-bold text-center mb-6">EduPlatform Login</h1>
        <div className="space-y-3">
          <button onClick={() => handleLogin('SUPER_ADMIN', '/super-admin')} className="block w-full text-center py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors">Login as Super Admin</button>
          <button onClick={() => handleLogin('ADMIN', '/admin')} className="block w-full text-center py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">Login as Admin</button>
          <button onClick={() => handleLogin('TEACHER', '/teacher')} className="block w-full text-center py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">Login as Teacher</button>
          <button onClick={() => handleLogin('STUDENT', '/student')} className="block w-full text-center py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors">Login as Student</button>
          <button onClick={() => handleLogin('PARENT', '/parent')} className="block w-full text-center py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">Login as Parent</button>
          
          <div className="pt-4 pb-2">
            <div className="border-t border-slate-200"></div>
            <p className="text-center text-xs text-slate-500 mt-3 uppercase tracking-wider font-semibold">Staff & Facilities</p>
          </div>
          
          <button onClick={() => handleLogin('ACCOUNTANT', '/accountant')} className="block w-full text-center py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-800 transition-colors">Login as Accountant</button>
          <button onClick={() => handleLogin('HR', '/hr')} className="block w-full text-center py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors">Login as HR</button>
          <button onClick={() => handleLogin('WARDEN', '/hostel')} className="block w-full text-center py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors">Login as Warden</button>
          <button onClick={() => handleLogin('TRANSPORT', '/transport')} className="block w-full text-center py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors">Login as Transport Officer</button>
          <button onClick={() => handleLogin('LIBRARIAN', '/librarian')} className="block w-full text-center py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors">Login as Librarian</button>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-200 text-center">
          <button
            type="button"
            onClick={() => {
              try {
                Object.keys(window.localStorage)
                  .filter((k) => k.startsWith('edu-'))
                  .forEach((k) => window.localStorage.removeItem(k));
              } catch (err) {
                console.warn('Failed to reset portal storage', err);
              }
              window.location.reload();
            }}
            className="text-xs text-slate-500 hover:text-slate-700 underline underline-offset-2"
          >
            Reset portal (clear local data)
          </button>
        </div>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      
      {/* Super Admin Routes */}
      <Route element={<DashboardLayout />}>
        <Route path="/super-admin" element={<SuperAdminDashboard />} />
        <Route path="/super-admin/schools" element={<SchoolsManagement />} />
        <Route path="/super-admin/users" element={<UsersManagement />} />
        <Route path="/super-admin/subscriptions" element={<SubscriptionPlans />} />
        <Route path="/super-admin/payments" element={<PaymentsManagement />} />
        <Route path="/super-admin/settings" element={<GlobalSettings />} />
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
