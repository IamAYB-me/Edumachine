import React, { useState, useEffect, useMemo } from 'react';
import { NavLink, useLocation, Link } from 'react-router-dom';
import { 
  LayoutDashboard, Users, UserCheck, GraduationCap, 
  BookOpen, DollarSign, Bell, MessageSquare, 
  Settings, LogOut, Home, Key, BedDouble,
  FileText, ClipboardCheck, Award, Users2, Clock, Calendar,
  ChevronDown, ChevronRight, Briefcase, Landmark, ShieldCheck,
  Truck, Library, Layers, ClipboardList, UserPlus
} from 'lucide-react';
import { cn } from '@/utils';
import { useAuthStore, Role } from '@/store/useAuthStore';
import { useSettingsStore } from '@/store/useSettingsStore';
import { PortalPrivilegeKey, useDataStore } from '@/store/useDataStore';
import { getPortalLevelLabels, resolveSchoolProfile } from '@/utils/schoolProfile';

interface NavItem {
  name: string;
  icon: any;
  path?: string;
  id?: string;
  subItems?: { name: string; path: string; icon?: any }[];
}

const delegatedPrivilegeLinks: Record<PortalPrivilegeKey, { name: string; path: string; icon: any }> = {
  manage_students: { name: 'Students', path: '/admin/students', icon: Users },
  manage_teachers: { name: 'Teachers', path: '/admin/teachers', icon: UserCheck },
  manage_parents: { name: 'Parents', path: '/admin/parents', icon: Users2 },
  manage_classes: { name: 'Classes', path: '/admin/classes', icon: GraduationCap },
  manage_timetable: { name: 'Timetable', path: '/admin/timetable', icon: Clock },
  manage_curriculum: { name: 'Curriculum', path: '/admin/academic', icon: BookOpen },
  manage_results: { name: 'Results', path: '/admin/results', icon: Award },
  manage_exam_timetable: { name: 'Exam Timetable', path: '/admin/exam-timetable', icon: Calendar },
  manage_fees: { name: 'Fee Collection', path: '/admin/fees', icon: DollarSign },
  manage_finance: { name: 'Finance Overview', path: '/admin/finance', icon: Landmark },
  manage_payroll: { name: 'Payroll', path: '/admin/payroll', icon: Briefcase },
  manage_notices: { name: 'Notices', path: '/admin/notices', icon: Bell },
  manage_transport: { name: 'Transport Portal', path: '/transport', icon: Truck },
  manage_library: { name: 'Library Portal', path: '/librarian', icon: Library },
  manage_hostel: { name: 'Hostel Portal', path: '/hostel', icon: BedDouble },
  manage_hr: { name: 'HR Portal', path: '/hr', icon: Briefcase },
};

const roleNavLinks: Record<Role, NavItem[]> = {
  SUPER_ADMIN: [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/super-admin' },
    { 
      name: 'Management', 
      icon: Landmark, 
      subItems: [
        { name: 'Schools', path: '/super-admin/schools', icon: Home },
        { name: 'Subscriptions', path: '/super-admin/subscriptions', icon: Key },
        { name: 'Payments', path: '/super-admin/payments', icon: DollarSign },
      ]
    },
    { name: 'User Management', icon: Users, path: '/super-admin/users' },
    { name: 'Registration Fields', icon: ClipboardList, path: '/super-admin/registration-fields' },
    { name: 'System Settings', icon: Settings, path: '/super-admin/settings' },
  ],
  ADMIN: [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/admin' },
    { 
      name: 'User Directory', 
      icon: Users, 
      subItems: [
        { name: 'Students', path: '/admin/students', icon: Users },
        { name: 'Teachers', path: '/admin/teachers', icon: UserCheck },
        { name: 'Parents', path: '/admin/parents', icon: Users },
        { name: 'Staff (HR)', path: '/hr/employees', icon: Briefcase },
        { name: 'Privileges', path: '/admin/access-control', icon: ShieldCheck },
      ]
    },
    { 
      name: 'Academic Hub', 
      icon: GraduationCap, 
      subItems: [
        { name: 'Classes', path: '/admin/classes', icon: GraduationCap },
        { name: 'Timetable', path: '/admin/timetable', icon: Clock },
        { name: 'Curriculum', path: '/admin/academic', icon: BookOpen },
        { name: 'Notices', path: '/admin/notices', icon: Bell },
      ]
    },
    { 
      name: 'Exams & Results', 
      icon: ClipboardCheck, 
      subItems: [
        { name: 'CBT Builder', path: '/admin/exams', icon: ClipboardCheck },
        { name: 'Exam Timetable', path: '/admin/exam-timetable', icon: Calendar },
        { name: 'Result Sheets', path: '/admin/results', icon: Award },
      ]
    },
    { 
      name: 'Finance & Fees', 
      icon: DollarSign, 
      subItems: [
        { name: 'Fee Collection', path: '/admin/fees', icon: Landmark },
        { name: 'Finance Overview', path: '/admin/finance', icon: DollarSign },
      ]
    },
    { name: 'Admissions', icon: UserPlus, path: '/admin/admissions' },
  ],
  TEACHER: [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/teacher' },
    { 
      name: 'My Academic', 
      icon: GraduationCap, 
      subItems: [
        { name: 'My Classes', path: '/teacher/classes', icon: GraduationCap },
        { name: 'Attendance', path: '/teacher/attendance', icon: UserCheck },
      ]
    },
    { 
      name: 'Assessments', 
      icon: FileText, 
      subItems: [
        { name: 'Assignments', path: '/teacher/assignments', icon: FileText },
        { name: 'Assessments & Scores', path: '/teacher/exams', icon: ClipboardCheck },
        { name: 'Exam Results', path: '/admin/results', icon: Award },
      ]
    },
  ],
  STUDENT: [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/student' },
    { 
      name: 'My Academic', 
      icon: BookOpen, 
      subItems: [
        { name: 'My Courses', path: '/student/courses', icon: BookOpen },
        { name: 'Attendance', path: '/student/attendance', icon: UserCheck },
      ]
    },
    { 
      name: 'Assessments', 
      icon: Award, 
      subItems: [
        { name: 'Assignments', path: '/student/assignments', icon: FileText },
        { name: 'Take Exams', path: '/student/exams', icon: ClipboardCheck },
        { name: 'My Results', path: '/admin/results', icon: Award },
      ]
    },
    { name: 'My Fees', icon: DollarSign, path: '/student/fees' },
  ],
  PARENT: [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/parent' },
    { 
      name: 'Children', 
      icon: Users, 
      subItems: [
        { name: 'My Children', path: '/parent/children', icon: Users },
        { name: 'Attendance', path: '/parent/attendance', icon: UserCheck },
      ]
    },
    { name: 'Fees & Payments', icon: DollarSign, path: '/parent/fees' },
    { name: 'Messages', icon: MessageSquare, path: '/parent/messages' },
  ],
  HR: [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/hr' },
    { 
      name: 'Employees', 
      icon: Users, 
      subItems: [
        { name: 'Directory', path: '/hr/employees', icon: Users },
        { name: 'Attendance', path: '/hr/attendance', icon: UserCheck },
        { name: 'Leave Tracker', path: '/hr/leaves', icon: Clock },
      ]
    },
    { name: 'Payroll', icon: DollarSign, path: '/hr/payroll' },
  ],
  WARDEN: [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/hostel' },
    { 
      name: 'Hostel Ops', 
      icon: BedDouble, 
      subItems: [
        { name: 'Room Inventory', path: '/hostel/rooms', icon: BedDouble },
        { name: 'Allocations', path: '/hostel/allocation', icon: Key },
        { name: 'Maintenance', path: '/hostel/maintenance', icon: Settings },
      ]
    },
    { name: 'Resident Students', icon: Users, path: '/hostel/students' },
  ],
  ACCOUNTANT: [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/accountant' },
    { 
      name: 'Finance', 
      icon: Landmark, 
      subItems: [
        { name: 'Fee Collection', path: '/accountant/fees', icon: DollarSign },
        { name: 'Expense Tracker', path: '/accountant/expenses', icon: Landmark },
      ]
    },
    { name: 'Staff Payroll', icon: Users, path: '/accountant/payroll' },
  ],
  TRANSPORT: [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/transport' },
    { 
      name: 'Fleet Control', 
      icon: Truck, 
      subItems: [
        { name: 'Vehicles', path: '/transport/vehicles', icon: Settings },
        { name: 'Route Map', path: '/transport/routes', icon: Home },
      ]
    },
    { name: 'Commuters', icon: Users, path: '/transport/students' },
  ],
  LIBRARIAN: [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/librarian' },
    { 
      name: 'Catalog', 
      icon: Library, 
      subItems: [
        { name: 'Books', path: '/librarian/books', icon: BookOpen },
        { name: 'Issue/Return', path: '/librarian/issue', icon: UserCheck },
      ]
    },
    { name: 'Members', icon: Users, path: '/librarian/members' },
  ],
};

const roleColors: Record<Role, string> = {
  SUPER_ADMIN: "bg-slate-700 shadow-slate-900/40",
  ADMIN: "bg-blue-600 shadow-blue-900/40",
  TEACHER: "bg-indigo-600 shadow-indigo-900/40",
  STUDENT: "bg-emerald-600 shadow-emerald-900/40",
  PARENT: "bg-purple-600 shadow-purple-900/40",
  HR: "bg-orange-600 shadow-orange-900/40",
  WARDEN: "bg-teal-600 shadow-teal-900/40",
  ACCOUNTANT: "bg-slate-700 shadow-slate-900/40",
  TRANSPORT: "bg-amber-600 shadow-amber-900/40",
  LIBRARIAN: "bg-rose-600 shadow-rose-900/40",
};

interface SidebarProps {
  role: Role;
  open: boolean;
  onClose: () => void;
}

export default function Sidebar({ role, open, onClose }: SidebarProps) {
  const location = useLocation();
  const logout = useAuthStore(state => state.logout);
  const user = useAuthStore(state => state.user);
  const { globalSettings } = useSettingsStore();
  const schools = useDataStore((state) => state.schools);
  const delegatedAccess = useDataStore((state) => state.delegatedAccess);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  
  const activeColorClass = roleColors[role] || roleColors.ADMIN;
  
  const links = useMemo(() => {
    const baseLinks = [...(roleNavLinks[role] || roleNavLinks['ADMIN'])];
    const schoolProfile = resolveSchoolProfile(user, schools);
    const labels = getPortalLevelLabels(schoolProfile.portalLevel);
    const userDelegation = delegatedAccess.find((entry) =>
      entry.status === 'Active' &&
      (
        entry.userEmail.toLowerCase() === (user?.email || '').toLowerCase() ||
        entry.userName.toLowerCase() === (user?.name || '').toLowerCase()
      )
    );

    const mappedLinks = baseLinks.map((link) => {
      if (role === 'ADMIN' && link.name === 'User Directory' && link.subItems) {
        return {
          ...link,
          subItems: link.subItems.map((subItem) =>
            subItem.path === '/admin/students'
              ? { ...subItem, name: labels.learnerPlural }
              : subItem
          ),
        };
      }

      if (role === 'ADMIN' && link.name === 'Academic Hub' && link.subItems) {
        return {
          ...link,
          name: `${labels.curriculumLabel} Hub`,
          subItems: link.subItems.map((subItem) => {
            if (subItem.path === '/admin/classes') {
              return { ...subItem, name: labels.structurePlural };
            }
            if (subItem.path === '/admin/academic') {
              return { ...subItem, name: labels.curriculumLabel };
            }
            return subItem;
          }),
        };
      }

      if (role === 'ADMIN' && link.name === 'Exams & Results' && link.subItems) {
        return {
          ...link,
          name: labels.assessmentLabel,
          subItems: link.subItems.map((subItem) =>
            subItem.path === '/admin/results'
              ? { ...subItem, name: labels.resultsLabel }
              : subItem
          ),
        };
      }

      if (role === 'TEACHER' && link.name === 'My Academic' && link.subItems) {
        const teacherAcademicItem = {
          name: labels.studyLabel,
          icon: BookOpen,
          path: '/teacher/subjects',
        };
        const subItems = [...link.subItems];
        const existingIndex = subItems.findIndex((subItem) => subItem.path === '/teacher/subjects');
        if (existingIndex >= 0) {
          subItems[existingIndex] = teacherAcademicItem;
        } else {
          subItems.splice(1, 0, teacherAcademicItem);
        }

        return {
          ...link,
          subItems: subItems.map((subItem) =>
            subItem.path === '/teacher/classes'
              ? { ...subItem, name: `My ${labels.structurePlural}` }
              : subItem
          ),
        };
      }

      if (role === 'STUDENT' && link.name === 'My Academic' && link.subItems) {
        return {
          ...link,
          subItems: link.subItems.map((subItem) =>
            subItem.path === '/student/courses'
              ? { ...subItem, name: labels.studyLabel }
              : subItem
          ),
        };
      }

      if (role === 'STUDENT' && link.name === 'Assessments' && link.subItems) {
        return {
          ...link,
          name: labels.assessmentLabel,
          subItems: link.subItems.map((subItem) =>
            subItem.path === '/admin/results'
              ? { ...subItem, name: labels.resultsLabel }
              : subItem
          ),
        };
      }

      return link;
    });

    if (role !== 'SUPER_ADMIN' && role !== 'ADMIN' && userDelegation?.privileges.length) {
      const privilegeItems = userDelegation.privileges
        .map((privilege) => delegatedPrivilegeLinks[privilege])
        .filter(Boolean)
        .filter((item, index, source) => source.findIndex((entry) => entry.path === item.path) === index);

      if (privilegeItems.length) {
        mappedLinks.push({
          name: 'Delegated Access',
          icon: ShieldCheck,
          subItems: privilegeItems,
        });
      }
    }

    return mappedLinks;
  }, [delegatedAccess, role, schools, user]);

  // Auto-expand parent if child is active
  useEffect(() => {
    const currentPath = location.pathname;
    links.forEach((link: any) => {
      if (link.subItems?.some((sub: any) => sub.path === currentPath)) {
        if (!expandedItems.includes(link.name)) {
          setExpandedItems(prev => [...prev, link.name]);
        }
      }
    });
  }, [location.pathname, links]);

  const toggleExpand = (name: string) => {
    setExpandedItems(prev => 
      prev.includes(name) 
        ? prev.filter(i => i !== name) 
        : [...prev, name]
    );
  };

  return (
    <aside className={cn(
      "w-64 bg-slate-900 text-slate-300 flex flex-col h-screen transition-colors border-r border-slate-800/50 shadow-2xl z-40",
      "fixed inset-y-0 left-0 lg:sticky lg:top-0",
      open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
    )}>
      {/* Logo Area */}
      <div className="h-16 flex items-center px-6 bg-slate-950/50 border-b border-slate-800">
        <Link to="/" className="flex items-center gap-2 group">
          {globalSettings?.logoUrl ? (
            <img src={globalSettings.logoUrl} alt="Logo" className="w-8 h-8 rounded-lg object-contain shadow-lg transition-transform group-hover:scale-110" />
          ) : (
            <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center shadow-lg transition-transform group-hover:scale-110", activeColorClass.split(' ')[0])}>
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
          )}
          <span className="font-bold text-white text-lg tracking-tight truncate max-w-[140px]">
            {globalSettings?.appName?.split(' ')[0] || 'EduPlatform'}
          </span>
        </Link>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-6 px-4 flex flex-col gap-1 custom-scrollbar">
        <div className="text-xs font-bold text-slate-500 uppercase tracking-[0.2em] mb-3 px-2 flex items-center gap-2">
          <div className={cn("w-1 h-3 rounded-full", activeColorClass.split(' ')[0])}></div>
          {role.replace('_', ' ')} PORTAL
        </div>
        
        {links.map((link) => {
          const Icon = link.icon;
          const isExpanded = expandedItems.includes(link.name);
          const hasSubItems = link.subItems && link.subItems.length > 0;
          
          if (!hasSubItems) {
            return (
              <NavLink
                key={link.name}
                to={link.path!}
                onClick={onClose}
                className={({ isActive }) => cn(
                  "group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ease-out",
                  isActive 
                    ? cn("text-white shadow-lg translate-x-1", activeColorClass) 
                    : "text-slate-400 hover:bg-slate-800/50 hover:text-white hover:translate-x-1"
                )}
              >
                {({ isActive }) => (
                  <>
                    {isActive && (
                      <div className="absolute -left-4 w-1.5 h-6 bg-white rounded-r-full shadow-[0_0_10px_rgba(255,255,255,0.5)]" />
                    )}
                    {Icon && typeof Icon !== 'string' && (
                      <Icon className={cn("w-5 h-5 transition-all duration-300", 
                        isActive ? "text-white scale-110" : "text-slate-500 group-hover:text-white"
                      )} />
                    )}
                    <span className="relative z-10">{link.name}</span>
                  </>
                )}
              </NavLink>
            );
          }

          const isChildActive = link.subItems?.some(sub => location.pathname === sub.path);

          return (
            <div key={link.name} className="flex flex-col gap-1">
              <button
                onClick={() => toggleExpand(link.name)}
                className={cn(
                  "flex items-center justify-between w-full px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 group",
                  isChildActive 
                    ? "text-white bg-slate-800/50" 
                    : "text-slate-400 hover:bg-slate-800/30 hover:text-white"
                )}
              >
                <div className="flex items-center gap-3">
                  {Icon && typeof Icon !== 'string' && (
                    <Icon className={cn("w-5 h-5 transition-colors", 
                      isChildActive ? "text-white" : "text-slate-500 group-hover:text-white"
                    )} />
                  )}
                  <span>{link.name}</span>
                </div>
                {isExpanded ? (
                  <ChevronDown className="w-4 h-4 text-slate-500" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-slate-500" />
                )}
              </button>
              
              {/* Sub Items */}
              <div className={cn(
                "flex flex-col gap-1 overflow-hidden transition-all duration-300 ease-in-out pl-9",
                isExpanded ? "max-h-96 opacity-100 py-1" : "max-h-0 opacity-0"
              )}>
                {link.subItems?.map((sub) => {
                  const SubIcon = sub.icon || Layers;
                  return (
                    <NavLink
                      key={sub.name}
                      to={sub.path}
                      onClick={onClose}
                      className={({ isActive }) => cn(
                        "flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all",
                        isActive 
                          ? "text-white bg-slate-800" 
                          : "text-slate-500 hover:text-slate-300 hover:translate-x-1"
                      )}
                    >
                      {SubIcon && typeof SubIcon !== 'string' && (
                        <SubIcon className="w-3.5 h-3.5" />
                      )}
                      {sub.name}
                    </NavLink>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Logout */}
      <div className="p-4 border-t border-slate-800">
        <button 
          onClick={logout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:bg-slate-800 hover:text-white transition-all w-full"
        >
          <LogOut className="w-5 h-5" />
          Logout
        </button>
      </div>
    </aside>
  );
}
