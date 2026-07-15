import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type PortalLevel = 'Primary' | 'Secondary' | 'College' | 'University';

export interface Student {
  id: string;
  name: string;
  studentId?: string;
  regNo: string;
  admissionNumber?: string;
  nin?: string;
  class: string;
  parentName: string;
  status: 'Active' | 'Inactive' | 'Graduated' | 'Suspended' | 'Withdrawn';
  email: string;

  // Personal Information
  surname?: string;
  firstName?: string;
  middleName?: string;
  gender?: string;
  dateOfBirth?: string;
  placeOfBirth?: string;
  nationality?: string;
  stateOfOrigin?: string;
  lga?: string;
  tribeEthnicity?: string;
  religion?: string;
  maritalStatus?: string;
  passportUrl?: string;

  // Contact Information
  phone?: string;
  residentialAddress?: string;
  townCity?: string;
  state?: string;
  postalAddress?: string;

  // Parent / Guardian Information
  fatherName?: string;
  fatherOccupation?: string;
  fatherEmployer?: string;
  fatherPhone?: string;
  fatherEmail?: string;
  fatherAddress?: string;
  motherName?: string;
  motherOccupation?: string;
  motherEmployer?: string;
  motherPhone?: string;
  motherEmail?: string;
  motherAddress?: string;
  guardianName?: string;
  guardianRelationship?: string;
  guardianPhone?: string;
  guardianAddress?: string;
  sponsorName?: string;
  sponsorOccupation?: string;
  sponsorEmployer?: string;
  sponsorPhone?: string;
  sponsorEmail?: string;

  // Medical Information
  bloodGroup?: string;
  genotype?: string;
  allergies?: string;
  medicalConditions?: string;
  disability?: string;
  hospitalDoctor?: string;
  emergencyContact?: string;
  medicalHistory?: string;
  medicalReport?: string;

  // Previous School / Academic Information
  previousSchoolName?: string;
  previousSchoolAddress?: string;
  previousSchoolResult?: string;
  lastClassAttended?: string;
  reasonForLeaving?: string;
  entranceExamScore?: string;
  commonEntranceResult?: string;
  subjectsOffered?: string;
  preferredSport?: string;
  clubSociety?: string;
  specialTalent?: string;
  jambRegistrationNumber?: string;
  jambScore?: string;
  oLevelResults?: string;
  oLevelSitting?: string;
  oLevelExaminationBody?: string;
  oLevelExamNumber?: string;
  oLevelYear?: string;
  oLevelSubjectsGrades?: string;
  aLevelResults?: string;
  aLevelQualifications?: string;
  institutionChoice?: string;
  faculty?: string;
  department?: string;
  programme?: string;
  degreeType?: string;
  level?: string;
  entryMode?: string;
  admissionType?: string;
  screeningScore?: string;
  cgpa?: string;

  // Admission / School Information
  portalLevel?: PortalLevel;
  classApplyingFor?: string;
  academicSession?: string;
  session?: string;
  semester?: string;
  termSemester?: string;
  dateOfAdmission?: string;
  admissionStatus?: string;
  campus?: string;
  branch?: string;
  house?: string;
  hostel?: string;
  hostelPreference?: string;
  accommodationType?: string;
  classDepartment?: string;

  // Financial / Services
  feeCategory?: string;
  scholarshipStatus?: string;
  sponsor?: string;
  feePaymentPlan?: string;
  busRoute?: string;
  pickupPoint?: string;
  driver?: string;
  busNumber?: string;
  libraryCardNumber?: string;
  hostelName?: string;
  roomNumber?: string;
  bedSpace?: string;

  // Identity / Biometric
  matricNumber?: string;
  fingerprintId?: string;
  facialRecognitionId?: string;
  digitalSignatureUrl?: string;

  // Documents
  birthCertificate?: string;
  immunizationCard?: string;
  parentIdDocument?: string;
  transferLetter?: string;
  testimonial?: string;
  stateOfOriginCertificate?: string;
  localGovernmentCertificate?: string;
  jambAdmissionLetter?: string;
  admissionLetter?: string;
  acceptanceLetter?: string;
  guarantorForm?: string;
  passportDocument?: string;
}

export interface Parent {
  id: string;
  name: string;
  email: string;
  phone: string;
  children: string[]; // Student IDs
  occupation: string;
}

export interface Staff {
  id: string;
  name: string;
  role: string;
  category: 'Academic' | 'Non-Academic';
  email: string;
  phone: string;
  status: 'Active' | 'Inactive';
  joinDate: string;
}

export interface SchoolPaymentGatewayConfig {
  enabled: boolean;
  provider: string;
  publicKey: string;
  secretKey: string;
  merchantId: string;
  callbackUrl: string;
}

export interface SchoolSmsApiConfig {
  enabled: boolean;
  provider: string;
  senderId: string;
  apiKey: string;
  apiUrl: string;
}

export interface SchoolEmailApiConfig {
  enabled: boolean;
  provider: string;
  fromEmail: string;
  apiKey: string;
  domain: string;
}

export interface SchoolOtherApiConfig {
  enabled: boolean;
  label: string;
  apiKey: string;
  apiUrl: string;
  notes: string;
}

export interface SchoolIntegrations {
  paymentGateway: SchoolPaymentGatewayConfig;
  smsApi: SchoolSmsApiConfig;
  emailApi: SchoolEmailApiConfig;
  otherApi: SchoolOtherApiConfig;
}

export interface School {
  id: string;
  name: string;
  code: string;
  adminName: string;
  email: string;
  phone: string;
  address: string;
  logoUrl?: string;
  teacherSignatoryName?: string;
  hodSignatoryName?: string;
  principalSignatoryName?: string;
  teacherSignatureUrl?: string;
  hodSignatureUrl?: string;
  principalSignatureUrl?: string;
  integrations: SchoolIntegrations;
  portalLevel: PortalLevel;
  status: 'Active' | 'Suspended';
  subscriptionPlan: 'Basic' | 'Standard' | 'Professional' | 'Enterprise';
  expiryDate: string;
}

export type PortalPrivilegeKey =
  | 'manage_students'
  | 'manage_teachers'
  | 'manage_parents'
  | 'manage_classes'
  | 'manage_timetable'
  | 'manage_curriculum'
  | 'manage_results'
  | 'manage_exam_timetable'
  | 'manage_fees'
  | 'manage_finance'
  | 'manage_payroll'
  | 'manage_notices'
  | 'manage_transport'
  | 'manage_library'
  | 'manage_hostel'
  | 'manage_hr';

export interface DelegatedPortalAccess {
  id: string;
  userName: string;
  userEmail: string;
  userRole: string;
  department?: string;
  privileges: PortalPrivilegeKey[];
  status: 'Active' | 'Suspended';
  note?: string;
  assignedBy: string;
  updatedAt: string;
}

export interface SubscriptionPlan {
  id: string;
  name: 'Basic' | 'Standard' | 'Professional' | 'Enterprise';
  price: number;
  studentsLimit: number;
  features: string[];
}

export interface Teacher {
  id: string;
  name: string;
  employeeId: string;
  subject: string;
  email: string;
  phone: string;
  status: 'Active' | 'Inactive';
}

export interface Class {
  id: string;
  name: string;
  teacherId: string;
  teacherName: string;
  studentsCount: number;
  room: string;
}

export interface Faculty {
  id: string;
  name: string;
  headName: string;
  code: string;
}

export interface Subject {
  id: string;
  name: string;
  code: string;
  type: 'Core' | 'Elective';
  creditHours: number;
}

export interface FeeRecord {
  id: string;
  studentId: string;
  studentName: string;
  amount: number;
  status: 'Paid' | 'Pending' | 'Partial';
  date: string;
  type: string;
  attachmentName?: string;
  attachmentUrl?: string;
}

export interface FeeStructure {
  id: string;
  className: string;
  category: string;
  amount: number;
  term: string;
  description?: string;
  status: 'Active' | 'Inactive';
}

export interface Expense {
  id: string;
  title: string;
  category: string;
  amount: number;
  date: string;
  status: 'Paid' | 'Pending' | 'Approved';
  method: string;
  attachmentName?: string;
  attachmentUrl?: string;
}

export interface Payroll {
  id: string;
  staffId: string;
  staffName: string;
  role: string;
  category: 'Academic' | 'Non-Academic';
  basic: number;
  bonus: number;
  tax: number;
  net: number;
  status: 'Paid' | 'Pending' | 'Processing';
  month: string;
}

export interface Question {
  id: string;
  text: string;
  options: string[];
  correctOption: number;
}

export interface Exam {
  id: string;
  title: string;
  subject: string;
  duration: number; // in minutes
  totalMarks: number;
  questions: Question[];
  status: 'Draft' | 'Published' | 'Closed';
}

export interface ExamResult {
  id: string;
  examId: string;
  examTitle: string;
  studentId: string;
  studentName: string;
  score: number;
  totalMarks: number;
  date: string;
}

export interface ExamTimetableEntry {
  id: string;
  subject: string;
  hall: string;
  day: string;
  session: 'Morning' | 'Afternoon';
  invigilator: string;
  duration: string;
  class: string;
}

export interface AttendanceRecord {
  id: string;
  targetId: string; // Student ID or Staff ID
  targetName: string;
  type: 'Student' | 'Staff';
  status: 'Present' | 'Absent' | 'Late' | 'Excused';
  date: string;
  classId?: string;
  markedBy: string;
}

interface DataState {
  students: Student[];
  parents: Parent[];
  staff: Staff[];
  feeRecords: FeeRecord[];
  feeStructures: FeeStructure[];
  schools: School[];
  delegatedAccess: DelegatedPortalAccess[];
  plans: SubscriptionPlan[];
  teachers: Teacher[];
  classes: Class[];
  faculties: Faculty[];
  subjects: Subject[];
  exams: Exam[];
  examResults: ExamResult[];
  examTimetable: ExamTimetableEntry[];
  attendance: AttendanceRecord[];
  expenses: Expense[];
  payroll: Payroll[];
  _hasHydrated: boolean;
  setHasHydrated: (value: boolean) => void;

  // Student Actions
  addStudent: (student: Omit<Student, 'id'>) => void;
  updateStudent: (id: string, student: Partial<Student>) => void;
  deleteStudent: (id: string) => void;
  
  // Parent Actions
  addParent: (parent: Omit<Parent, 'id'>) => void;
  updateParent: (id: string, parent: Partial<Parent>) => void;
  deleteParent: (id: string) => void;
  
  // Staff Actions
  addStaff: (staff: Omit<Staff, 'id'>) => void;
  updateStaff: (id: string, staff: Partial<Staff>) => void;
  deleteStaff: (id: string) => void;

  // Fee Actions
  addFeeRecord: (record: Omit<FeeRecord, 'id'>) => void;
  updateFeeRecord: (id: string, record: Partial<FeeRecord>) => void;
  deleteFeeRecord: (id: string) => void;
  addFeeStructure: (structure: Omit<FeeStructure, 'id'>) => void;
  updateFeeStructure: (id: string, structure: Partial<FeeStructure>) => void;
  deleteFeeStructure: (id: string) => void;

  // School Actions
  addSchool: (school: Omit<School, 'id'>) => void;
  updateSchool: (id: string, school: Partial<School>) => void;
  deleteSchool: (id: string) => void;
  addDelegatedAccess: (access: Omit<DelegatedPortalAccess, 'id' | 'updatedAt'>) => void;
  updateDelegatedAccess: (id: string, access: Partial<DelegatedPortalAccess>) => void;
  deleteDelegatedAccess: (id: string) => void;

  // Teacher Actions
  addTeacher: (teacher: Omit<Teacher, 'id'>) => void;
  updateTeacher: (id: string, teacher: Partial<Teacher>) => void;
  deleteTeacher: (id: string) => void;

  // Class Actions
  addClass: (cls: Omit<Class, 'id'>) => void;
  updateClass: (id: string, cls: Partial<Class>) => void;
  deleteClass: (id: string) => void;

  // Faculty Actions
  addFaculty: (faculty: Omit<Faculty, 'id'>) => void;
  updateFaculty: (id: string, faculty: Partial<Faculty>) => void;
  deleteFaculty: (id: string) => void;

  // Subject Actions
  addSubject: (subject: Omit<Subject, 'id'>) => void;
  updateSubject: (id: string, subject: Partial<Subject>) => void;
  deleteSubject: (id: string) => void;

  // Exam Actions
  addExam: (exam: Omit<Exam, 'id'>) => void;
  updateExam: (id: string, exam: Partial<Exam>) => void;
  deleteExam: (id: string) => void;
  addExamResult: (result: Omit<ExamResult, 'id'>) => void;
  setExamTimetable: (timetable: ExamTimetableEntry[]) => void;
  addExamTimetableEntry: (entry: Omit<ExamTimetableEntry, 'id'>) => void;

  // Attendance Actions
  markAttendance: (records: Omit<AttendanceRecord, 'id'>[]) => void;

  // Expense Actions
  addExpense: (expense: Omit<Expense, 'id'>) => void;
  updateExpense: (id: string, expense: Partial<Expense>) => void;
  deleteExpense: (id: string) => void;

  // Payroll Actions
  addPayroll: (payroll: Omit<Payroll, 'id'>) => void;
  updatePayroll: (id: string, payroll: Partial<Payroll>) => void;
}

export const useDataStore = create<DataState>()(
  persist(
    (set) => ({
      students: [
        { id: '4', name: 'John Doe', studentId: 'STD001', regNo: 'STD001', class: 'Grade 10 - A', parentName: 'Mr. Doe', status: 'Active', email: 'john@example.com' },
        { id: '2', name: 'Jane Smith', studentId: 'STD002', regNo: 'STD002', class: 'Grade 11 - B', parentName: 'Mrs. Smith', status: 'Active', email: 'jane@example.com' },
      ],
      parents: [
        { id: '1', name: 'Mr. Doe', email: 'mrdoe@example.com', phone: '1234567890', children: ['4'], occupation: 'Engineer' },
      ],
      staff: [
        { id: '1', name: 'Dr. Emily Carter', role: 'Senior Lecturer', category: 'Academic', email: 'emily@example.com', phone: '0987654321', status: 'Active', joinDate: '2023-01-01' },
        { id: '2', name: 'James Wilson', role: 'Administrator', category: 'Non-Academic', email: 'james@example.com', phone: '0987654322', status: 'Active', joinDate: '2023-02-15' },
        { id: '3', name: 'Sarah Jenkins', role: 'Librarian', category: 'Non-Academic', email: 'sarah@example.com', phone: '0987654323', status: 'Active', joinDate: '2023-03-10' },
      ],
      feeRecords: [
        { id: '1', studentId: '4', studentName: 'John Doe', amount: 1200, status: 'Paid', date: '2024-03-01', type: 'Tuition Fee - Semester 2' },
        { id: '2', studentId: '4', studentName: 'John Doe', amount: 25, status: 'Paid', date: '2024-02-15', type: 'Library Membership Fee' },
        { id: '3', studentId: '4', studentName: 'John Doe', amount: 45, status: 'Paid', date: '2024-01-10', type: 'Laboratory Fee - Physics' },
        { id: '4', studentId: '4', studentName: 'John Doe', amount: 120, status: 'Pending', date: '2024-05-30', type: 'Tuition Fee - Semester 1' },
      ],
      feeStructures: [
        { id: 'FS-101', className: 'Grade 10 - A', category: 'Tuition Fee', amount: 1200, term: 'First Term', description: 'Core academic tuition for Grade 10.', status: 'Active' },
        { id: 'FS-102', className: 'Grade 10 - A', category: 'Examination Fee', amount: 150, term: 'First Term', description: 'Covers test and examination administration.', status: 'Active' },
        { id: 'FS-103', className: 'Grade 10 - A', category: 'ICT / Laboratory Fee', amount: 220, term: 'First Term', description: 'Supports lab and digital learning resources.', status: 'Active' },
        { id: 'FS-201', className: 'Grade 11 - B', category: 'Tuition Fee', amount: 1450, term: 'First Term', description: 'Core academic tuition for Grade 11.', status: 'Active' },
        { id: 'FS-202', className: 'Grade 11 - B', category: 'Examination Fee', amount: 180, term: 'First Term', description: 'Senior class exam administration charge.', status: 'Active' },
        { id: 'FS-203', className: 'Grade 11 - B', category: 'Sports / Activity Fee', amount: 120, term: 'First Term', description: 'Co-curricular and sports contribution.', status: 'Active' },
      ],
      schools: [
        {
          id: '1',
          name: 'Greenfield International School',
          code: 'GIS001',
          adminName: 'Admin User',
          email: 'admin@greenfield.com',
          phone: '+1 (555) 100-1001',
          address: '12 Knowledge Avenue, Education City',
          teacherSignatoryName: 'Mrs. Janet Cole',
          hodSignatoryName: 'Dr. Michael Grant',
          principalSignatoryName: 'Mrs. Sarah Bennett',
          integrations: {
            paymentGateway: { enabled: true, provider: 'Paystack', publicKey: 'pk_live_gis_001', secretKey: 'sk_live_gis_001', merchantId: 'GIS-PAY-01', callbackUrl: 'https://greenfield.edu/payments/callback' },
            smsApi: { enabled: true, provider: 'Termii', senderId: 'GISCHOOL', apiKey: 'termii_gis_001', apiUrl: 'https://api.termii.com/api/sms/send' },
            emailApi: { enabled: true, provider: 'SendGrid', fromEmail: 'no-reply@greenfield.edu', apiKey: 'sg_gis_001', domain: 'greenfield.edu' },
            otherApi: { enabled: false, label: 'Biometric API', apiKey: '', apiUrl: '', notes: '' },
          },
          portalLevel: 'Secondary',
          status: 'Active',
          subscriptionPlan: 'Professional',
          expiryDate: '2025-12-31',
        },
        {
          id: '2',
          name: 'Bright Future Academy',
          code: 'BFA002',
          adminName: 'School Admin',
          email: 'admin@bfa.edu',
          phone: '+1 (555) 100-1002',
          address: '45 Horizon Road, New Town',
          teacherSignatoryName: 'Mr. Daniel Hope',
          hodSignatoryName: 'Mrs. Clara James',
          principalSignatoryName: 'Dr. Faith Morgan',
          integrations: {
            paymentGateway: { enabled: true, provider: 'Flutterwave', publicKey: 'pk_live_bfa_002', secretKey: 'sk_live_bfa_002', merchantId: 'BFA-PAY-02', callbackUrl: 'https://bfa.edu/payments/callback' },
            smsApi: { enabled: true, provider: 'Twilio', senderId: 'BFACADEMY', apiKey: 'twilio_bfa_002', apiUrl: 'https://api.twilio.com/2010-04-01' },
            emailApi: { enabled: true, provider: 'Mailgun', fromEmail: 'hello@brightfuture.edu', apiKey: 'mg_bfa_002', domain: 'brightfuture.edu' },
            otherApi: { enabled: false, label: 'Learning API', apiKey: '', apiUrl: '', notes: '' },
          },
          portalLevel: 'Primary',
          status: 'Active',
          subscriptionPlan: 'Standard',
          expiryDate: '2025-06-30',
        },
        {
          id: '3',
          name: 'Greenfield University',
          code: 'GFU003',
          adminName: 'University Admin',
          email: 'admin@greenfielduniversity.edu',
          phone: '+1 (555) 100-1003',
          address: '101 University Drive, Greenfield',
          teacherSignatoryName: 'Prof. Grace Hill',
          hodSignatoryName: 'Dr. Andrew Stone',
          principalSignatoryName: 'Prof. Rebecca Young',
          integrations: {
            paymentGateway: { enabled: true, provider: 'Monnify', publicKey: 'pk_live_gfu_003', secretKey: 'sk_live_gfu_003', merchantId: 'GFU-PAY-03', callbackUrl: 'https://greenfielduniversity.edu/payments/callback' },
            smsApi: { enabled: true, provider: 'BulkSMS', senderId: 'GREENFIELDU', apiKey: 'bulk_gfu_003', apiUrl: 'https://api.bulksms.com/v1/messages' },
            emailApi: { enabled: true, provider: 'SMTP Relay', fromEmail: 'registry@greenfielduniversity.edu', apiKey: 'smtp_gfu_003', domain: 'greenfielduniversity.edu' },
            otherApi: { enabled: true, label: 'LMS API', apiKey: 'lms_gfu_003', apiUrl: 'https://api.greenfielduniversity.edu/lms', notes: 'Used for transcript and course sync.' },
          },
          portalLevel: 'University',
          status: 'Active',
          subscriptionPlan: 'Enterprise',
          expiryDate: '2026-08-31',
        },
      ],
      delegatedAccess: [
        {
          id: 'DA-001',
          userName: 'James Wilson',
          userEmail: 'james@example.com',
          userRole: 'Administrator',
          department: 'Admin Office',
          privileges: ['manage_students', 'manage_parents', 'manage_notices'],
          status: 'Active',
          note: 'Supports front-desk registration and announcements.',
          assignedBy: 'Admin',
          updatedAt: '2026-07-08',
        },
        {
          id: 'DA-002',
          userName: 'Sarah Jenkins',
          userEmail: 'sarah@example.com',
          userRole: 'Librarian',
          department: 'Library',
          privileges: ['manage_library', 'manage_results'],
          status: 'Active',
          note: 'Can verify library clearance and result support.',
          assignedBy: 'Admin',
          updatedAt: '2026-07-08',
        },
      ],
      plans: [
        { id: '1', name: 'Basic', price: 49, studentsLimit: 100, features: ['Core Dashboard', 'Attendance', 'Basic Reports'] },
        { id: '2', name: 'Standard', price: 99, studentsLimit: 500, features: ['Everything in Basic', 'Fee Management', 'SMS Alerts'] },
        { id: '3', name: 'Professional', price: 199, studentsLimit: 2000, features: ['Everything in Standard', 'Hostel & Transport', 'Advanced Analytics'] },
        { id: '4', name: 'Enterprise', price: 399, studentsLimit: 10000, features: ['Everything in Professional', 'Multi-Campus', 'Priority Support'] },
      ],
      teachers: [
        { id: '1', name: 'Dr. Emily Carter', employeeId: 'TCH001', subject: 'Mathematics', email: 'emily@school.com', phone: '1234567890', status: 'Active' },
        { id: '2', name: 'Prof. Alan Turing', employeeId: 'TCH002', subject: 'Computer Science', email: 'alan@school.com', phone: '0987654321', status: 'Active' },
      ],
      classes: [
        { id: '1', name: 'Grade 10 - A', teacherId: '1', teacherName: 'Dr. Emily Carter', studentsCount: 32, room: 'Room 101' },
        { id: '2', name: 'Grade 11 - B', teacherId: '2', teacherName: 'Prof. Alan Turing', studentsCount: 28, room: 'Lab 1' },
      ],
      faculties: [
        { id: '1', name: 'Faculty of Science', headName: 'Dr. Emily Carter', code: 'FSC' },
        { id: '2', name: 'Faculty of Arts', headName: 'Prof. John Keats', code: 'FAR' },
      ],
      subjects: [
        { id: '1', name: 'Mathematics', code: 'MTH101', type: 'Core', creditHours: 4 },
        { id: '2', name: 'Physics', code: 'PHY101', type: 'Core', creditHours: 3 },
        { id: '3', name: 'Computer Science', code: 'CSC101', type: 'Elective', creditHours: 3 },
      ],
      exams: [
        { 
          id: '1', title: 'Mid-Term Mathematics Exam', subject: 'Mathematics', duration: 60, totalMarks: 100, status: 'Published',
          questions: [
            { id: 'q1', text: 'What is 2 + 2?', options: ['3', '4', '5', '6'], correctOption: 1 },
            { id: 'q2', text: 'Solve for x: 2x = 10', options: ['2', '5', '10', '20'], correctOption: 1 },
          ]
        },
      ],
      examResults: [],
      examTimetable: [
        { id: '1', subject: 'Mathematics', hall: 'Main Hall', day: 'Monday', session: 'Morning', invigilator: 'Dr. Emily Carter', duration: '2 Hours', class: 'Grade 10 - A' },
        { id: '2', subject: 'Physics', hall: 'Lab A', day: 'Tuesday', session: 'Afternoon', invigilator: 'Prof. John Smith', duration: '1.5 Hours', class: 'Grade 10 - A' },
        { id: '3', subject: 'English', hall: 'Room 102', day: 'Wednesday', session: 'Morning', invigilator: 'Mrs. Sarah Wilson', duration: '2 Hours', class: 'Grade 11 - B' },
      ],
      attendance: [],
      expenses: [
        { id: 'EXP-101', title: 'Monthly Electricity Bill', category: 'Utilities', amount: 850, date: '2026-07-02', status: 'Paid', method: 'Online Banking' },
        { id: 'EXP-102', title: 'New Lab Equipment', category: 'Academic', amount: 3400, date: '2026-07-04', status: 'Pending', method: '-' },
        { id: 'EXP-103', title: 'Office Stationery', category: 'Administrative', amount: 120, date: '2026-07-05', status: 'Paid', method: 'Petty Cash' },
      ],
      payroll: [
        { id: 'PAY-701', staffId: '1', staffName: 'Dr. Emily Carter', role: 'Senior Lecturer', category: 'Academic', basic: 3500, bonus: 200, tax: 350, net: 3350, status: 'Paid', month: 'July 2026' },
        { id: 'PAY-702', staffId: '2', staffName: 'James Wilson', role: 'Administrator', category: 'Non-Academic', basic: 2800, bonus: 0, tax: 280, net: 2520, status: 'Pending', month: 'July 2026' },
      ],

      addStudent: (student) => set((state) => ({ 
        students: [...state.students, { ...student, id: Math.random().toString(36).substr(2, 9) }] 
      })),
      updateStudent: (id, updatedStudent) => set((state) => ({
        students: state.students.map((s) => (s.id === id ? { ...s, ...updatedStudent } : s))
      })),
      deleteStudent: (id) => set((state) => ({
        students: state.students.filter((s) => s.id !== id)
      })),

      addParent: (parent) => set((state) => ({ 
        parents: [...state.parents, { ...parent, id: Math.random().toString(36).substr(2, 9) }] 
      })),
      updateParent: (id, updatedParent) => set((state) => ({
        parents: state.parents.map((p) => (p.id === id ? { ...p, ...updatedParent } : p))
      })),
      deleteParent: (id) => set((state) => ({
        parents: state.parents.filter((p) => p.id !== id)
      })),

      addStaff: (staff) => set((state) => ({ 
        staff: [...state.staff, { ...staff, id: Math.random().toString(36).substr(2, 9) }] 
      })),
      updateStaff: (id, updatedStaff) => set((state) => ({
        staff: state.staff.map((s) => (s.id === id ? { ...s, ...updatedStaff } : s))
      })),
      deleteStaff: (id) => set((state) => ({
        staff: state.staff.filter((s) => s.id !== id)
      })),

      addFeeRecord: (record) => set((state) => ({ 
        feeRecords: [...state.feeRecords, { ...record, id: Math.random().toString(36).substr(2, 9) }] 
      })),
      updateFeeRecord: (id, updatedRecord) => set((state) => ({
        feeRecords: state.feeRecords.map((r) => (r.id === id ? { ...r, ...updatedRecord } : r))
      })),
      deleteFeeRecord: (id) => set((state) => ({
        feeRecords: state.feeRecords.filter((r) => r.id !== id)
      })),
      addFeeStructure: (structure) => set((state) => ({
        feeStructures: [...state.feeStructures, { ...structure, id: `FS-${Math.floor(Math.random() * 10000)}` }]
      })),
      updateFeeStructure: (id, updatedStructure) => set((state) => ({
        feeStructures: state.feeStructures.map((item) => (item.id === id ? { ...item, ...updatedStructure } : item))
      })),
      deleteFeeStructure: (id) => set((state) => ({
        feeStructures: state.feeStructures.filter((item) => item.id !== id)
      })),

      addSchool: (school) => set((state) => ({ 
        schools: [...state.schools, { ...school, id: Math.random().toString(36).substr(2, 9) }] 
      })),
      updateSchool: (id, updatedSchool) => set((state) => ({
        schools: state.schools.map((s) => (s.id === id ? { ...s, ...updatedSchool } : s))
      })),
      deleteSchool: (id) => set((state) => ({
        schools: state.schools.filter((s) => s.id !== id)
      })),
      addDelegatedAccess: (access) => set((state) => ({
        delegatedAccess: [
          ...state.delegatedAccess,
          {
            ...access,
            id: `DA-${Math.floor(Math.random() * 10000)}`,
            updatedAt: new Date().toISOString().split('T')[0],
          },
        ],
      })),
      updateDelegatedAccess: (id, updatedAccess) => set((state) => ({
        delegatedAccess: state.delegatedAccess.map((item) =>
          item.id === id
            ? { ...item, ...updatedAccess, updatedAt: new Date().toISOString().split('T')[0] }
            : item
        )
      })),
      deleteDelegatedAccess: (id) => set((state) => ({
        delegatedAccess: state.delegatedAccess.filter((item) => item.id !== id)
      })),

      addTeacher: (teacher) => set((state) => ({ 
        teachers: [...state.teachers, { ...teacher, id: Math.random().toString(36).substr(2, 9) }] 
      })),
      updateTeacher: (id, updatedTeacher) => set((state) => ({
        teachers: state.teachers.map((t) => (t.id === id ? { ...t, ...updatedTeacher } : t))
      })),
      deleteTeacher: (id) => set((state) => ({
        teachers: state.teachers.filter((t) => t.id !== id)
      })),

      addClass: (cls) => set((state) => ({ 
        classes: [...state.classes, { ...cls, id: Math.random().toString(36).substr(2, 9) }] 
      })),
      updateClass: (id, updatedCls) => set((state) => ({
        classes: state.classes.map((c) => (c.id === id ? { ...c, ...updatedCls } : c))
      })),
      deleteClass: (id) => set((state) => ({
        classes: state.classes.filter((c) => c.id !== id)
      })),

      addFaculty: (faculty) => set((state) => ({ 
        faculties: [...state.faculties, { ...faculty, id: Math.random().toString(36).substr(2, 9) }] 
      })),
      updateFaculty: (id, updatedFaculty) => set((state) => ({
        faculties: state.faculties.map((f) => (f.id === id ? { ...f, ...updatedFaculty } : f))
      })),
      deleteFaculty: (id) => set((state) => ({
        faculties: state.faculties.filter((f) => f.id !== id)
      })),

      addSubject: (subject) => set((state) => ({ 
        subjects: [...state.subjects, { ...subject, id: Math.random().toString(36).substr(2, 9) }] 
      })),
      updateSubject: (id, updatedSubject) => set((state) => ({
        subjects: state.subjects.map((s) => (s.id === id ? { ...s, ...updatedSubject } : s))
      })),
      deleteSubject: (id) => set((state) => ({
        subjects: state.subjects.filter((s) => s.id !== id)
      })),

      addExam: (exam) => set((state) => ({ 
        exams: [...state.exams, { ...exam, id: Math.random().toString(36).substr(2, 9) }] 
      })),
      updateExam: (id, updatedExam) => set((state) => ({
        exams: state.exams.map((e) => (e.id === id ? { ...e, ...updatedExam } : e))
      })),
      deleteExam: (id) => set((state) => ({
        exams: state.exams.filter((e) => e.id !== id)
      })),
      addExamResult: (result) => set((state) => ({
        examResults: [...state.examResults, { ...result, id: Math.random().toString(36).substr(2, 9) }]
      })),
      setExamTimetable: (timetable) => set({ examTimetable: timetable }),
      addExamTimetableEntry: (entry) => set((state) => ({
        examTimetable: [...state.examTimetable, { ...entry, id: Math.random().toString(36).substr(2, 9) }]
      })),

      markAttendance: (records) => set((state) => {
        const newRecords = records.map(r => ({ ...r, id: Math.random().toString(36).substr(2, 9) }));
        // Replace existing records for same date/target/class
        const filteredAttendance = state.attendance.filter(existing => 
          !records.some(r => r.date === existing.date && r.targetId === existing.targetId && r.classId === existing.classId)
        );
        return { attendance: [...filteredAttendance, ...newRecords] };
      }),

      addExpense: (expense) => set((state) => ({
        expenses: [...state.expenses, { ...expense, id: `EXP-${Math.floor(Math.random() * 10000)}` }]
      })),
      updateExpense: (id, updatedExpense) => set((state) => ({
        expenses: state.expenses.map((e) => (e.id === id ? { ...e, ...updatedExpense } : e))
      })),
      deleteExpense: (id) => set((state) => ({
        expenses: state.expenses.filter((e) => e.id !== id)
      })),

      addPayroll: (payroll) => set((state) => ({
        payroll: [...state.payroll, { ...payroll, id: `PAY-${Math.floor(Math.random() * 10000)}` }]
      })),
      updatePayroll: (id, updatedPayroll) => set((state) => ({
        payroll: state.payroll.map((p) => (p.id === id ? { ...p, ...updatedPayroll } : p))
      })),

      _hasHydrated: false,
      setHasHydrated: (value) => set({ _hasHydrated: value }),
    }),
    {
      name: 'edu-platform-data',
      version: 1,
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
