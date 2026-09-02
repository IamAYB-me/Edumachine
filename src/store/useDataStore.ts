import { create } from 'zustand';
import { addDocumentWithId, updateDocument, deleteDocument, clearCollection, subscribeToCollection, generateId } from '@/services/firestoreService';
import { logActivity, type ActivityAction } from '@/utils/activityLogger';
import type { Unsubscribe } from 'firebase/firestore';
import { useAuthStore, type Role } from './useAuthStore';

export type PortalLevel = 'Primary' | 'Secondary' | 'College' | 'Polytechnic' | 'University';

export type AdmissionFieldKey = keyof Omit<Student, 'id'>;

export interface AdmissionFormConfig {
  enabledFields: AdmissionFieldKey[];
}

export const buildDefaultAdmissionFormConfig = (portalLevel: PortalLevel): AdmissionFormConfig => {
  const defaults: Record<PortalLevel, AdmissionFieldKey[]> = {
    Primary: ['admissionNumber', 'regNo', 'surname', 'firstName', 'middleName', 'gender', 'dateOfBirth', 'placeOfBirth', 'nationality', 'stateOfOrigin', 'lga', 'tribeEthnicity', 'religion', 'passportUrl', 'residentialAddress', 'townCity', 'state', 'postalAddress', 'fatherName', 'fatherOccupation', 'fatherEmployer', 'fatherPhone', 'fatherEmail', 'fatherAddress', 'motherName', 'motherOccupation', 'motherEmployer', 'motherPhone', 'motherEmail', 'guardianName', 'guardianRelationship', 'guardianPhone', 'guardianAddress', 'bloodGroup', 'genotype', 'allergies', 'medicalConditions', 'disability', 'hospitalDoctor', 'emergencyContact', 'previousSchoolName', 'previousSchoolAddress', 'lastClassAttended', 'reasonForLeaving', 'classApplyingFor', 'classDepartment', 'academicSession', 'dateOfAdmission', 'admissionStatus', 'birthCertificate', 'passportDocument', 'immunizationCard', 'previousSchoolResult', 'parentIdDocument', 'status'],
    Secondary: ['admissionNumber', 'regNo', 'surname', 'firstName', 'middleName', 'gender', 'dateOfBirth', 'placeOfBirth', 'nationality', 'stateOfOrigin', 'lga', 'tribeEthnicity', 'religion', 'passportUrl', 'residentialAddress', 'townCity', 'state', 'postalAddress', 'fatherName', 'fatherOccupation', 'fatherEmployer', 'fatherPhone', 'fatherEmail', 'fatherAddress', 'motherName', 'motherOccupation', 'motherEmployer', 'motherPhone', 'motherEmail', 'guardianName', 'guardianRelationship', 'guardianPhone', 'guardianAddress', 'bloodGroup', 'genotype', 'allergies', 'medicalConditions', 'disability', 'hospitalDoctor', 'emergencyContact', 'entranceExamScore', 'commonEntranceResult', 'previousSchoolResult', 'lastClassAttended', 'subjectsOffered', 'preferredSport', 'clubSociety', 'specialTalent', 'accommodationType', 'hostelPreference', 'classApplyingFor', 'classDepartment', 'academicSession', 'dateOfAdmission', 'admissionStatus', 'transferLetter', 'testimonial', 'birthCertificate', 'passportDocument', 'stateOfOriginCertificate', 'status'],
    College: ['admissionNumber', 'regNo', 'jambRegistrationNumber', 'jambScore', 'surname', 'firstName', 'middleName', 'gender', 'dateOfBirth', 'maritalStatus', 'nationality', 'state', 'lga', 'passportUrl', 'oLevelResults', 'oLevelSitting', 'oLevelSubjectsGrades', 'institutionChoice', 'department', 'programme', 'level', 'entryMode', 'screeningScore', 'phone', 'email', 'residentialAddress', 'parentName', 'sponsorOccupation', 'guardianPhone', 'guardianAddress', 'bloodGroup', 'genotype', 'disability', 'medicalConditions', 'birthCertificate', 'localGovernmentCertificate', 'acceptanceLetter', 'admissionLetter', 'classDepartment', 'academicSession', 'dateOfAdmission', 'admissionStatus', 'status'],
    Polytechnic: ['admissionNumber', 'regNo', 'jambRegistrationNumber', 'jambScore', 'surname', 'firstName', 'middleName', 'gender', 'dateOfBirth', 'maritalStatus', 'nationality', 'state', 'lga', 'passportUrl', 'oLevelResults', 'oLevelSitting', 'oLevelSubjectsGrades', 'institutionChoice', 'department', 'programme', 'level', 'entryMode', 'screeningScore', 'phone', 'email', 'residentialAddress', 'parentName', 'sponsorOccupation', 'guardianPhone', 'guardianAddress', 'bloodGroup', 'genotype', 'disability', 'medicalConditions', 'birthCertificate', 'localGovernmentCertificate', 'acceptanceLetter', 'admissionLetter', 'classDepartment', 'academicSession', 'dateOfAdmission', 'admissionStatus', 'status'],
    University: ['admissionNumber', 'regNo', 'matricNumber', 'jambRegistrationNumber', 'jambScore', 'surname', 'firstName', 'middleName', 'gender', 'dateOfBirth', 'maritalStatus', 'nationality', 'state', 'lga', 'passportUrl', 'faculty', 'department', 'programme', 'degreeType', 'entryMode', 'admissionType', 'session', 'semester', 'level', 'oLevelExaminationBody', 'oLevelExamNumber', 'oLevelYear', 'oLevelResults', 'oLevelSubjectsGrades', 'aLevelQualifications', 'aLevelResults', 'cgpa', 'phone', 'email', 'residentialAddress', 'fatherName', 'motherName', 'sponsorName', 'sponsorOccupation', 'sponsorEmployer', 'sponsorPhone', 'sponsorEmail', 'bloodGroup', 'genotype', 'disability', 'medicalHistory', 'bankName', 'accountNumber', 'sponsor', 'jambAdmissionLetter', 'admissionLetter', 'birthCertificate', 'localGovernmentCertificate', 'passportDocument', 'medicalReport', 'acceptanceLetter', 'guarantorForm', 'classDepartment', 'academicSession', 'termSemester', 'dateOfAdmission', 'admissionStatus', 'status'],
  };

  return { enabledFields: defaults[portalLevel] ?? defaults.Secondary };
};

export interface Student {
  id: string;
  name: string;
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

  // Banking / Advanced Identity
  bankName?: string;
  accountNumber?: string;
  qrCode?: string;
  barcode?: string;
  rfidTag?: string;

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
  password?: string;
}

export interface Parent {
  id: string;
  name: string;
  email: string;
  phone: string;
  children: string[];
  occupation: string;
  password?: string;
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
  password?: string;
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
  admissionFormConfig?: AdmissionFormConfig;
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
  password?: string;
  departmentId?: string;
  departmentName?: string;
}

export interface Class {
  id: string;
  name: string;
  teacherId: string;
  teacherName: string;
  studentsCount: number;
  room: string;
  facultyId?: string;
  departmentId?: string;
}

export interface Faculty {
  id: string;
  name: string;
  headName: string;
  code: string;
}

export interface Department {
  id: string;
  name: string;
  code: string;
  headName: string;
  facultyId: string;
}

export interface AcademicSession {
  id: string;
  name: string;
}

export interface Subject {
  id: string;
  name: string;
  code: string;
  type: 'Core' | 'Elective';
  creditHours: number;
  term?: string;
  session?: string;
  assignedClasses?: string[];
  facultyId?: string;
  departmentId?: string;
  teacherId?: string;
  teacherName?: string;
}

export interface FeeRecord {
  id: string;
  studentId: string;
  studentName: string;
  regNo?: string;
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
  isUniversal?: boolean;
  isGated?: boolean;
  isOptional?: boolean;
  requiredPercentage?: number;
  gatedAction?: 'course_registration' | 'admission_letter' | 'exam_access' | 'result_access' | 'clearance';
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
  duration: number;
  totalMarks: number;
  questions: Question[];
  status: 'Draft' | 'Published' | 'Closed';
}

export interface ExamResult {
  id: string;
  examId: string;
  examTitle: string;
  subject: string;
  type: 'Test' | 'Exam' | 'Assignment' | 'Quiz';
  studentId: string;
  studentName: string;
  regNo?: string;
  score: number;
  totalMarks: number;
  term?: string;
  session?: string;
  date: string;
  recordedBy?: string;
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
  targetId: string;
  targetName: string;
  type: 'Student' | 'Staff';
  status: 'Present' | 'Absent' | 'Late' | 'Excused';
  date: string;
  classId?: string;
  markedBy?: string;
}

export interface AttendanceToken {
  id: string;
  code: string;
  classId: string;
  className: string;
  date: string;
  createdBy: string;
  createdAt: number;
  expiresAt: number;
  usedBy?: string[];
}

export interface AdmissionApplication {
  id: string;
  schoolName: string;

  // Student Personal Information
  applicationFormNumber?: string;
  passportUrl?: string;
  surname: string;
  firstName: string;
  middleName?: string;
  dateOfBirth: string;
  placeOfBirth?: string;
  gender: string;
  lga?: string;
  stateOfOrigin?: string;
  nationality?: string;
  residentialAddress?: string;
  phone: string;
  email: string;
  maritalStatus?: string;
  courseOfStudy?: string;

  // Course Choices
  firstChoiceCourse?: string;
  secondChoiceCourse?: string;

  // Sponsor Information
  sponsorFullName?: string;
  sponsorAddress?: string;
  sponsorPhone?: string;
  sponsorSignatureUrl?: string;

  // Next of Kin
  nextOfKinName?: string;
  nextOfKinAddress?: string;
  nextOfKinPhone?: string;
  nextOfKinRelationship?: string;

  // Academic History - First Sitting
  firstSittingRegNumber?: string;
  firstSittingExamBody?: string;
  firstSittingExamYear?: string;
  firstSittingSubjects?: { subject: string; grade: string }[];

  // Academic History - Second Sitting
  secondSittingRegNumber?: string;
  secondSittingExamBody?: string;
  secondSittingExamYear?: string;
  secondSittingSubjects?: { subject: string; grade: string }[];

  // Legacy fields
  previousSchool?: string;
  parentName?: string;
  parentPhone?: string;
  parentEmail?: string;
  parentOccupation?: string;
  documents?: string[];

  // Payment
  admissionFee: number;
  paymentStatus: 'Unpaid' | 'Paid' | 'Pending';
  paymentReference?: string;

  // Application Status
  applicationStatus: 'Pending' | 'Under Review' | 'Approved' | 'Rejected' | 'Admitted';
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  notes?: string;
}

export type RegistrationFieldSection = 'Personal' | 'Contact' | 'Parent/Guardian' | 'Medical' | 'Academic' | 'Admission' | 'Documents' | 'Financial' | 'Identity';
export type RegistrationFieldType = 'text' | 'number' | 'date' | 'select' | 'textarea' | 'file';

export interface RegistrationFieldConfig {
  id: string;
  key: string;
  label: string;
  section: RegistrationFieldSection;
  type: RegistrationFieldType;
  required: boolean;
  enabled: boolean;
  options?: string[];
  acceptTypes?: string;
  placeholder?: string;
  order: number;
}

export interface SchoolRegistrationConfig {
  id: string;
  schoolId: string;
  schoolName: string;
  portalLevel: PortalLevel;
  fields: RegistrationFieldConfig[];
  updatedAt: string;
}

export interface StudentMutationResult {
  success: boolean;
  error?: string;
  student?: Student;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  description: string;
  time: string;
  read: boolean;
  type?: 'info' | 'success' | 'warning' | 'error';
  link?: string;
}

export interface PlatformUser {
  id: string;
  uid?: string;
  name: string;
  email: string;
  role: string;
  roleLabel?: string;
  schoolName?: string;
  phone?: string;
  status?: 'Active' | 'Inactive';
  avatarUrl?: string;
  createdAt?: unknown;
}

export interface Notice {
  id: string;
  title: string;
  content: string;
  date: string;
  targetAudience: 'All' | 'Students' | 'Teachers' | 'Parents';
  priority: 'High' | 'Medium' | 'Low';
  author: string;
}

export interface TimetableEntry {
  id: string;
  classId: string;
  className: string;
  day: string;
  periodIndex: number;
  subject: string;
  teacherId: string;
  teacherName: string;
  room?: string;
}

export type { ActivityAction };

export interface ActivityLog {
  id: string;
  createdAt: unknown;
  userId: string;
  userName: string;
  userRole: Role;
  action: ActivityAction;
  module: string;
  description: string;
  targetId?: string;
  targetName?: string;
  metadata?: Record<string, unknown>;
  deletionRequested: boolean;
  deletionRequestedBy?: string;
  deletionRequestedByName?: string;
  deletionRequestedAt?: unknown;
  deletionApproved: boolean;
  deletionApprovedBy?: string;
  deletionApprovedAt?: unknown;
  deletionRejected: boolean;
  deletionRejectedBy?: string;
  deletionRejectedAt?: unknown;
  deletionRejectionReason?: string;
}

const normalizeStudentIdentityValue = (value?: string) => value?.trim().toLowerCase() ?? '';

const getDuplicateStudentError = (
  students: Student[],
  candidate: Partial<Student>,
  excludedId?: string,
): string | undefined => {
  const comparableRegNo = normalizeStudentIdentityValue(candidate.regNo);
  const comparableAdmissionNumber = normalizeStudentIdentityValue(candidate.admissionNumber);
  const comparableEmail = normalizeStudentIdentityValue(candidate.email);

  const duplicate = students.find((student) => {
    if (student.id === excludedId) return false;

    return (
      (comparableRegNo && normalizeStudentIdentityValue(student.regNo) === comparableRegNo) ||
      (comparableAdmissionNumber && normalizeStudentIdentityValue(student.admissionNumber) === comparableAdmissionNumber) ||
      (comparableEmail && normalizeStudentIdentityValue(student.email) === comparableEmail)
    );
  });

  if (!duplicate) return undefined;

  if (comparableRegNo && normalizeStudentIdentityValue(duplicate.regNo) === comparableRegNo) {
    return `Registration number already exists for ${duplicate.name}.`;
  }

  if (comparableAdmissionNumber && normalizeStudentIdentityValue(duplicate.admissionNumber) === comparableAdmissionNumber) {
    return `Admission number already exists for ${duplicate.name}.`;
  }

  if (comparableEmail && normalizeStudentIdentityValue(duplicate.email) === comparableEmail) {
    return `Email address already exists for ${duplicate.name}.`;
  }

  return 'A student with the same identity details already exists.';
};

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
  departments: Department[];
  academicSessions: AcademicSession[];
  subjects: Subject[];
  exams: Exam[];
  examResults: ExamResult[];
  examTimetable: ExamTimetableEntry[];
  attendance: AttendanceRecord[];
  attendanceTokens: AttendanceToken[];
  expenses: Expense[];
  payroll: Payroll[];
  registrationConfigs: SchoolRegistrationConfig[];
  admissionApplications: AdmissionApplication[];
  notifications: Notification[];
  platformUsers: PlatformUser[];
  notices: Notice[];
  timetable: TimetableEntry[];
  activityLogs: ActivityLog[];
  _hasHydrated: boolean;
  setHasHydrated: (value: boolean) => void;
  initSubscriptions: (role?: Role) => void;

  // Student Actions
  addStudent: (student: Omit<Student, 'id'>) => StudentMutationResult;
  updateStudent: (id: string, student: Partial<Student>) => StudentMutationResult;
  deleteStudent: (id: string) => StudentMutationResult;
  bulkUpdateStudentPortalLevel: (ids: string[], portalLevel: PortalLevel) => number;
  bulkDeleteStudents: (ids: string[]) => number;
  clearStudents: () => Promise<number>;
  clearStaff: () => Promise<number>;
  clearSchools: () => Promise<number>;
  
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

  // Department Actions
  addDepartment: (dept: Omit<Department, 'id'>) => void;
  updateDepartment: (id: string, dept: Partial<Department>) => void;
  deleteDepartment: (id: string) => void;

  // Academic Session Actions
  addAcademicSession: (session: Omit<AcademicSession, 'id'>) => void;
  updateAcademicSession: (id: string, session: Partial<AcademicSession>) => void;
  deleteAcademicSession: (id: string) => void;

  // Subject Actions
  addSubject: (subject: Omit<Subject, 'id'>) => void;
  updateSubject: (id: string, subject: Partial<Subject>) => void;
  deleteSubject: (id: string) => void;

  // Plan Actions
  updatePlan: (id: string, plan: Partial<SubscriptionPlan>) => void;

  // Exam Actions
  addExam: (exam: Omit<Exam, 'id'>) => void;
  updateExam: (id: string, exam: Partial<Exam>) => void;
  deleteExam: (id: string) => void;
  addExamResult: (result: Omit<ExamResult, 'id'>) => void;
  updateExamResult: (id: string, result: Partial<ExamResult>) => void;
  deleteExamResult: (id: string) => void;
  setExamTimetable: (timetable: ExamTimetableEntry[]) => void;
  addExamTimetableEntry: (entry: Omit<ExamTimetableEntry, 'id'>) => void;

  // Attendance Actions
  markAttendance: (records: Omit<AttendanceRecord, 'id'>[]) => void;

  // Attendance Token Actions
  generateAttendanceToken: (data: { classId: string; className: string; date: string; createdBy: string; ttlMinutes?: number }) => AttendanceToken;
  redeemAttendanceToken: (code: string, student: { targetId: string; targetName: string; date: string; classId?: string }) => { ok: boolean; message: string };

  // Expense Actions
  addExpense: (expense: Omit<Expense, 'id'>) => void;
  updateExpense: (id: string, expense: Partial<Expense>) => void;
  deleteExpense: (id: string) => void;

  // Payroll Actions
  addPayroll: (payroll: Omit<Payroll, 'id'>) => void;
  updatePayroll: (id: string, payroll: Partial<Payroll>) => void;

  // Registration Config Actions
  addRegistrationConfig: (config: Omit<SchoolRegistrationConfig, 'id'>) => void;
  updateRegistrationConfig: (id: string, config: Partial<SchoolRegistrationConfig>) => void;
  deleteRegistrationConfig: (id: string) => void;

  // Admission Actions
  addAdmissionApplication: (app: Omit<AdmissionApplication, 'id'>) => void;
  updateAdmissionApplication: (id: string, app: Partial<AdmissionApplication>) => void;
  deleteAdmissionApplication: (id: string) => void;

  // Notification Actions
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  addNotification: (notif: Omit<Notification, 'id'>) => void;
  deleteNotification: (id: string) => void;
  notifyUsers: (userIds: string[], title: string, description: string, type?: 'info' | 'success' | 'warning' | 'error', link?: string) => void;

  // Platform User Actions
  deletePlatformUser: (id: string) => void;
  updatePlatformUser: (id: string, updates: Partial<PlatformUser>) => void;

  // Notice Actions
  addNotice: (notice: Omit<Notice, 'id'>) => void;
  updateNotice: (id: string, notice: Partial<Notice>) => void;
  deleteNotice: (id: string) => void;

  // Timetable Actions
  addTimetableEntry: (entry: Omit<TimetableEntry, 'id'>) => void;
  updateTimetableEntry: (id: string, entry: Partial<TimetableEntry>) => void;
  deleteTimetableEntry: (id: string) => void;

  // Activity Log Actions
  requestLogDeletion: (id: string) => void;
  approveLogDeletion: (id: string) => void;
  rejectLogDeletion: (id: string, reason: string) => void;
  purgeOldLogs: () => Promise<number>;
}

const defaultPlans: SubscriptionPlan[] = [
  { id: '1', name: 'Basic', price: 49, studentsLimit: 100, features: ['Core Dashboard', 'Attendance', 'Basic Reports'] },
  { id: '2', name: 'Standard', price: 99, studentsLimit: 500, features: ['Everything in Basic', 'Fee Management', 'SMS Alerts'] },
  { id: '3', name: 'Professional', price: 199, studentsLimit: 2000, features: ['Everything in Standard', 'Hostel & Transport', 'Advanced Analytics'] },
  { id: '4', name: 'Enterprise', price: 399, studentsLimit: 10000, features: ['Everything in Professional', 'Multi-Campus', 'Priority Support'] },
];

const subscriptions: Unsubscribe[] = [];

export const useDataStore = create<DataState>()((set, get) => ({
  students: [],
  parents: [],
  staff: [],
  feeRecords: [],
  feeStructures: [],
  schools: [],
  delegatedAccess: [],
  plans: defaultPlans,
  teachers: [],
  classes: [],
  faculties: [],
  departments: [],
  academicSessions: [],  subjects: [],
  exams: [],
  examResults: [],
  examTimetable: [],
  attendance: [],
  attendanceTokens: [],
  expenses: [],
  payroll: [],
  registrationConfigs: [],
  admissionApplications: [],
  notifications: [],
  platformUsers: [],
  notices: [],
  timetable: [],
  activityLogs: [],

  _hasHydrated: true,
  setHasHydrated: (_value) => {},

  initSubscriptions: (role?: Role) => {
    if (subscriptions.length > 0) return;

    const ROLE_COLLECTIONS: Partial<Record<Role, string[]>> = {
      SUPER_ADMIN: ['schools', 'users', 'plans', 'delegatedAccess', 'registrationConfigs', 'admissionApplications', 'settings', 'notifications', 'activityLogs', 'students', 'teachers', 'parents', 'staff', 'classes', 'feeRecords', 'exams', 'examResults', 'attendance', 'expenses', 'payroll', 'subjects', 'faculties', 'departments', 'notices', 'timetable'],
      ADMIN: ['students', 'teachers', 'parents', 'staff', 'classes', 'faculties', 'departments', 'subjects', 'feeRecords', 'feeStructures', 'exams', 'examResults', 'examTimetable', 'attendance', 'attendanceTokens', 'expenses', 'payroll', 'delegatedAccess', 'admissionApplications', 'notifications', 'notices', 'timetable', 'schools', 'activityLogs'],
      TEACHER: ['students', 'classes', 'faculties', 'departments', 'subjects', 'exams', 'examResults', 'attendance', 'attendanceTokens', 'notifications', 'notices', 'timetable', 'teachers', 'schools'],
      STUDENT: ['classes', 'faculties', 'departments', 'subjects', 'exams', 'examResults', 'examTimetable', 'attendance', 'attendanceTokens', 'feeRecords', 'feeStructures', 'notifications', 'notices', 'timetable', 'schools'],
      PARENT: ['students', 'attendance', 'feeRecords', 'notifications', 'notices', 'schools'],
      HR: ['staff', 'attendance', 'payroll', 'notifications', 'notices', 'schools'],
      WARDEN: ['students', 'notifications', 'schools'],
      ACCOUNTANT: ['feeRecords', 'feeStructures', 'expenses', 'payroll', 'notifications', 'schools'],
      TRANSPORT: ['students', 'notifications', 'schools'],
      LIBRARIAN: ['students', 'notifications', 'schools'],
      APPLICANT: ['admissionApplications', 'notifications'],
    };

    const COLLECTION_STORE_MAP: Record<string, string> = {
      students: 'students',
      parents: 'parents',
      staff: 'staff',
      teachers: 'teachers',
      classes: 'classes',
      faculties: 'faculties',
      departments: 'departments',
      academicSessions: 'academicSessions',      subjects: 'subjects',
      feeRecords: 'feeRecords',
      feeStructures: 'feeStructures',
      schools: 'schools',
      delegatedAccess: 'delegatedAccess',
      exams: 'exams',
      examResults: 'examResults',
      examTimetable: 'examTimetable',
      attendance: 'attendance',
      attendanceTokens: 'attendanceTokens',
      expenses: 'expenses',
      payroll: 'payroll',
      registrationConfigs: 'registrationConfigs',
      admissionApplications: 'admissionApplications',
      notifications: 'notifications',
      notices: 'notices',
      timetable: 'timetable',
      users: 'platformUsers',
      plans: 'plans',
      activityLogs: 'activityLogs',
    };

    const allowedCollections = role ? (ROLE_COLLECTIONS[role] ?? Object.keys(COLLECTION_STORE_MAP)) : Object.keys(COLLECTION_STORE_MAP);

    allowedCollections.forEach((col) => {
      const storeKey = COLLECTION_STORE_MAP[col];
      if (storeKey) {
        subscriptions.push(
          subscribeToCollection(col, (data) => {
            if (storeKey === 'plans' && data.length === 0) {
              defaultPlans.forEach((plan) => {
                addDocumentWithId('plans', plan.id, { ...plan }).catch(console.error);
              });
              set({ plans: defaultPlans } as Partial<DataState>);
            } else {
              set({ [storeKey]: data } as Partial<DataState>);
            }
          }),
        );
      }
    });
  },

  addStudent: (student) => {
    let result: StudentMutationResult = { success: false, error: 'Unable to create student record.' };

    set((state) => {
      const duplicateError = getDuplicateStudentError(state.students, student);
      if (duplicateError) {
        result = { success: false, error: duplicateError };
        return {};
      }

      const id = generateId();
      const createdStudent: Student = { ...student, id };

      result = { success: true, student: createdStudent };
      addDocumentWithId('students', id, { ...createdStudent, id }).catch(console.error);
      logActivity({ action: 'CREATE', module: 'students', description: `Created student ${createdStudent.name}`, targetId: id, targetName: createdStudent.name }).catch(console.error);
      // Notify the new student
      if (createdStudent.email) {
        const now = new Date().toLocaleString();
        const nid = generateId();
        const notif = { id: nid, userId: id, title: 'Welcome to the Portal', description: `Hello ${createdStudent.name}, your student account has been created.`, time: now, read: false, type: 'success' as const, link: '/student' };
        addDocumentWithId('notifications', nid, notif).catch(console.error);
      }
      return { students: [...state.students, createdStudent] };
    });

    return result;
  },

  updateStudent: (id, updatedStudent) => {
    let result: StudentMutationResult = { success: false, error: 'Unable to update student record.' };

    set((state) => {
      const existingStudent = state.students.find((student) => student.id === id);
      if (!existingStudent) {
        result = { success: false, error: 'Student record could not be found.' };
        return {};
      }

      const mergedStudent: Student = { ...existingStudent, ...updatedStudent };

      const duplicateError = getDuplicateStudentError(state.students, mergedStudent, id);
      if (duplicateError) {
        result = { success: false, error: duplicateError };
        return {};
      }

      result = { success: true, student: mergedStudent };
      updateDocument('students', id, updatedStudent as Record<string, unknown>).catch(console.error);
      logActivity({ action: 'UPDATE', module: 'students', description: `Updated student ${mergedStudent.name}`, targetId: id, targetName: mergedStudent.name }).catch(console.error);
      return { students: state.students.map((s) => (s.id === id ? mergedStudent : s)) };
    });

    return result;
  },

  deleteStudent: (id) => {
    let result: StudentMutationResult = { success: false, error: 'Unable to delete student record.' };

    set((state) => {
      const existingStudent = state.students.find((student) => student.id === id);
      if (!existingStudent) {
        result = { success: false, error: 'Student record could not be found.' };
        return {};
      }

      result = { success: true, student: existingStudent };
      deleteDocument('students', id).catch(console.error);
      logActivity({ action: 'DELETE', module: 'students', description: `Deleted student ${existingStudent.name}`, targetId: id, targetName: existingStudent.name }).catch(console.error);
      return { students: state.students.filter((s) => s.id !== id) };
    });

    return result;
  },

  bulkUpdateStudentPortalLevel: (ids, portalLevel) => {
    let count = 0;
    set((state) => {
      const updated = state.students.map((s) => {
        if (ids.includes(s.id)) {
          count += 1;
          const patched = { ...s, portalLevel };
          updateDocument('students', s.id, { portalLevel } as Record<string, unknown>).catch(console.error);
          return patched;
        }
        return s;
      });
      return { students: updated };
    });
    return count;
  },

  bulkDeleteStudents: (ids) => {
    let count = 0;
    set((state) => {
      const remaining = state.students.filter((s) => {
        if (ids.includes(s.id)) {
          count += 1;
          deleteDocument('students', s.id).catch(console.error);
          return false;
        }
        return true;
      });
      return { students: remaining };
    });
    return count;
  },

  clearStudents: async () => {
    const count = await clearCollection('students');
    set({ students: [] });
    return count;
  },

  clearStaff: async () => {
    const count = await clearCollection('staff');
    set({ staff: [] });
    return count;
  },

  clearSchools: async () => {
    const count = await clearCollection('schools');
    set({ schools: [] });
    return count;
  },

  addParent: (parent) => {
    const id = generateId();
    const record = { ...parent, id };
    set((state) => ({ parents: [...state.parents, record] }));
    addDocumentWithId('parents', id, record).catch(console.error);
    logActivity({ action: 'CREATE', module: 'parents', description: `Created parent ${parent.name}`, targetId: id, targetName: parent.name }).catch(console.error);
  },
  updateParent: (id, updatedParent) => {
    set((state) => ({ parents: state.parents.map((p) => (p.id === id ? { ...p, ...updatedParent } : p)) }));
    updateDocument('parents', id, updatedParent as Record<string, unknown>).catch(console.error);
    logActivity({ action: 'UPDATE', module: 'parents', description: `Updated parent record`, targetId: id }).catch(console.error);
  },
  deleteParent: (id) => {
    set((state) => ({ parents: state.parents.filter((p) => p.id !== id) }));
    deleteDocument('parents', id).catch(console.error);
    logActivity({ action: 'DELETE', module: 'parents', description: `Deleted parent record`, targetId: id }).catch(console.error);
  },

  addStaff: (staff) => {
    const id = generateId();
    const record = { ...staff, id };
    set((state) => ({ staff: [...state.staff, record] }));
    addDocumentWithId('staff', id, record).catch(console.error);
    logActivity({ action: 'CREATE', module: 'staff', description: `Created staff ${staff.name}`, targetId: id, targetName: staff.name }).catch(console.error);
  },
  updateStaff: (id, updatedStaff) => {
    set((state) => ({ staff: state.staff.map((s) => (s.id === id ? { ...s, ...updatedStaff } : s)) }));
    updateDocument('staff', id, updatedStaff as Record<string, unknown>).catch(console.error);
    logActivity({ action: 'UPDATE', module: 'staff', description: `Updated staff record`, targetId: id }).catch(console.error);
  },
  deleteStaff: (id) => {
    set((state) => ({ staff: state.staff.filter((s) => s.id !== id) }));
    deleteDocument('staff', id).catch(console.error);
    logActivity({ action: 'DELETE', module: 'staff', description: `Deleted staff record`, targetId: id }).catch(console.error);
  },

  addFeeRecord: (record) => {
    const id = generateId();
    const entry = { ...record, id };
    set((state) => ({ feeRecords: [...state.feeRecords, entry] }));
    addDocumentWithId('feeRecords', id, entry).catch(console.error);
    logActivity({ action: 'CREATE', module: 'fees', description: `Created fee record for ${record.studentName || 'student'}`, targetId: id, targetName: record.studentName }).catch(console.error);
    // Notify the student
    if (record.studentId) {
      const now = new Date().toLocaleString();
      const nid = generateId();
      const notif = { id: nid, userId: record.studentId, title: 'New Fee Record', description: `A new fee record has been created for you. Amount: ${record.amount || 'N/A'}`, time: now, read: false, type: 'info' as const, link: '/student/fees' };
      addDocumentWithId('notifications', nid, notif).catch(console.error);
    }
  },
  updateFeeRecord: (id, updatedRecord) => {
    set((state) => ({ feeRecords: state.feeRecords.map((r) => (r.id === id ? { ...r, ...updatedRecord } : r)) }));
    updateDocument('feeRecords', id, updatedRecord as Record<string, unknown>).catch(console.error);
    logActivity({ action: 'UPDATE', module: 'fees', description: `Updated fee record`, targetId: id }).catch(console.error);
  },
  deleteFeeRecord: (id) => {
    set((state) => ({ feeRecords: state.feeRecords.filter((r) => r.id !== id) }));
    deleteDocument('feeRecords', id).catch(console.error);
    logActivity({ action: 'DELETE', module: 'fees', description: `Deleted fee record`, targetId: id }).catch(console.error);
  },

  addFeeStructure: (structure) => {
    const id = `FS-${generateId()}`;
    const entry = { ...structure, id };
    set((state) => ({ feeStructures: [...state.feeStructures, entry] }));
    addDocumentWithId('feeStructures', id, entry).catch(console.error);
    logActivity({ action: 'CREATE', module: 'feeStructures', description: structure.isUniversal ? `Created universal fee structure for all ${structure.className || 'classes'}` : `Created fee structure for ${structure.className}`, targetId: id, targetName: structure.isUniversal ? 'Universal' : structure.className }).catch(console.error);
  },
  updateFeeStructure: (id, updatedStructure) => {
    set((state) => ({ feeStructures: state.feeStructures.map((item) => (item.id === id ? { ...item, ...updatedStructure } : item)) }));
    updateDocument('feeStructures', id, updatedStructure as Record<string, unknown>).catch(console.error);
    logActivity({ action: 'UPDATE', module: 'feeStructures', description: `Updated fee structure`, targetId: id }).catch(console.error);
  },
  deleteFeeStructure: (id) => {
    set((state) => ({ feeStructures: state.feeStructures.filter((item) => item.id !== id) }));
    deleteDocument('feeStructures', id).catch(console.error);
    logActivity({ action: 'DELETE', module: 'feeStructures', description: `Deleted fee structure`, targetId: id }).catch(console.error);
  },

  addSchool: (school) => {
    const id = generateId();
    const record = { ...school, id };
    set((state) => ({ schools: [...state.schools, record] }));
    addDocumentWithId('schools', id, record).catch(console.error);
    logActivity({ action: 'CREATE', module: 'schools', description: `Created school ${school.name}`, targetId: id, targetName: school.name }).catch(console.error);
  },
  updateSchool: (id, updatedSchool) => {
    set((state) => ({ schools: state.schools.map((s) => (s.id === id ? { ...s, ...updatedSchool } : s)) }));
    updateDocument('schools', id, updatedSchool as Record<string, unknown>).catch(console.error);
    logActivity({ action: 'UPDATE', module: 'schools', description: `Updated school record`, targetId: id }).catch(console.error);
  },
  deleteSchool: (id) => {
    set((state) => ({ schools: state.schools.filter((s) => s.id !== id) }));
    deleteDocument('schools', id).catch(console.error);
    logActivity({ action: 'DELETE', module: 'schools', description: `Deleted school record`, targetId: id }).catch(console.error);
  },

  addDelegatedAccess: (access) => {
    const id = `DA-${generateId()}`;
    const updatedAt = new Date().toISOString().split('T')[0];
    const record = { ...access, id, updatedAt };
    set((state) => ({ delegatedAccess: [...state.delegatedAccess, record] }));
    addDocumentWithId('delegatedAccess', id, record).catch(console.error);
    logActivity({ action: 'CREATE', module: 'delegatedAccess', description: `Granted delegated access to ${access.userName || 'user'}`, targetId: id, targetName: access.userName }).catch(console.error);
    // Notify the user who received delegated access
    if (access.userEmail) {
      const now = new Date().toLocaleString();
      const nid = generateId();
      const privs = access.privileges?.join(', ') || 'portal access';
      const notif = { id: nid, userId: access.userEmail, title: 'Delegated Access Granted', description: `You have been granted delegated access: ${privs}`, time: now, read: false, type: 'info' as const };
      addDocumentWithId('notifications', nid, notif).catch(console.error);
    }
  },
  updateDelegatedAccess: (id, updatedAccess) => {
    const updatedAt = new Date().toISOString().split('T')[0];
    const patch = { ...updatedAccess, updatedAt };
    set((state) => ({
      delegatedAccess: state.delegatedAccess.map((item) => (item.id === id ? { ...item, ...patch } : item)),
    }));
    updateDocument('delegatedAccess', id, patch as Record<string, unknown>).catch(console.error);
    logActivity({ action: 'UPDATE', module: 'delegatedAccess', description: `Updated delegated access`, targetId: id }).catch(console.error);
  },
  deleteDelegatedAccess: (id) => {
    set((state) => ({ delegatedAccess: state.delegatedAccess.filter((item) => item.id !== id) }));
    deleteDocument('delegatedAccess', id).catch(console.error);
    logActivity({ action: 'DELETE', module: 'delegatedAccess', description: `Revoked delegated access`, targetId: id }).catch(console.error);
  },

  addTeacher: (teacher) => {
    const id = generateId();
    const record = { ...teacher, id };
    set((state) => ({ teachers: [...state.teachers, record] }));
    addDocumentWithId('teachers', id, record).catch(console.error);
    logActivity({ action: 'CREATE', module: 'teachers', description: `Created teacher ${teacher.name}`, targetId: id, targetName: teacher.name }).catch(console.error);
    // Notify the new teacher
    if (teacher.email) {
      const now = new Date().toLocaleString();
      const nid = generateId();
      const notif = { id: nid, userId: id, title: 'Welcome to the Portal', description: `Hello ${teacher.name}, your teacher account has been created.`, time: now, read: false, type: 'success' as const, link: '/teacher' };
      addDocumentWithId('notifications', nid, notif).catch(console.error);
    }
  },
  updateTeacher: (id, updatedTeacher) => {
    set((state) => ({ teachers: state.teachers.map((t) => (t.id === id ? { ...t, ...updatedTeacher } : t)) }));
    updateDocument('teachers', id, updatedTeacher as Record<string, unknown>).catch(console.error);
    logActivity({ action: 'UPDATE', module: 'teachers', description: `Updated teacher record`, targetId: id }).catch(console.error);
  },
  deleteTeacher: (id) => {
    set((state) => ({ teachers: state.teachers.filter((t) => t.id !== id) }));
    deleteDocument('teachers', id).catch(console.error);
    logActivity({ action: 'DELETE', module: 'teachers', description: `Deleted teacher record`, targetId: id }).catch(console.error);
  },

  addClass: (cls) => {
    const id = generateId();
    const record = { ...cls, id };
    set((state) => ({ classes: [...state.classes, record] }));
    addDocumentWithId('classes', id, record).catch(console.error);
    logActivity({ action: 'CREATE', module: 'classes', description: `Created class ${cls.name}`, targetId: id, targetName: cls.name }).catch(console.error);
  },
  updateClass: (id, updatedCls) => {
    set((state) => ({ classes: state.classes.map((c) => (c.id === id ? { ...c, ...updatedCls } : c)) }));
    updateDocument('classes', id, updatedCls as Record<string, unknown>).catch(console.error);
    logActivity({ action: 'UPDATE', module: 'classes', description: `Updated class record`, targetId: id }).catch(console.error);
  },
  deleteClass: (id) => {
    set((state) => ({ classes: state.classes.filter((c) => c.id !== id) }));
    deleteDocument('classes', id).catch(console.error);
    logActivity({ action: 'DELETE', module: 'classes', description: `Deleted class record`, targetId: id }).catch(console.error);
  },

  addFaculty: (faculty) => {
    const id = generateId();
    const record = { ...faculty, id };
    set((state) => ({ faculties: [...state.faculties, record] }));
    addDocumentWithId('faculties', id, record).catch(console.error);
    logActivity({ action: 'CREATE', module: 'faculties', description: `Created faculty ${faculty.name}`, targetId: id, targetName: faculty.name }).catch(console.error);
  },
  updateFaculty: (id, updatedFaculty) => {
    set((state) => ({ faculties: state.faculties.map((f) => (f.id === id ? { ...f, ...updatedFaculty } : f)) }));
    updateDocument('faculties', id, updatedFaculty as Record<string, unknown>).catch(console.error);
    logActivity({ action: 'UPDATE', module: 'faculties', description: `Updated faculty record`, targetId: id }).catch(console.error);
  },
  deleteFaculty: (id) => {
    set((state) => ({ faculties: state.faculties.filter((f) => f.id !== id) }));
    deleteDocument('faculties', id).catch(console.error);
    logActivity({ action: 'DELETE', module: 'faculties', description: `Deleted faculty record`, targetId: id }).catch(console.error);
  },

  addDepartment: (dept) => {
    const id = generateId();
    const record = { ...dept, id };
    set((state) => ({ departments: [...state.departments, record] }));
    addDocumentWithId('departments', id, record).catch(console.error);
    logActivity({ action: 'CREATE', module: 'departments', description: `Created department ${dept.name}`, targetId: id, targetName: dept.name }).catch(console.error);
  },
  updateDepartment: (id, updatedDept) => {
    set((state) => ({ departments: state.departments.map((d) => (d.id === id ? { ...d, ...updatedDept } : d)) }));
    updateDocument('departments', id, updatedDept as Record<string, unknown>).catch(console.error);
    logActivity({ action: 'UPDATE', module: 'departments', description: `Updated department record`, targetId: id }).catch(console.error);
  },
  deleteDepartment: (id) => {
    set((state) => ({ departments: state.departments.filter((d) => d.id !== id) }));
    deleteDocument('departments', id).catch(console.error);
    logActivity({ action: 'DELETE', module: 'departments', description: `Deleted department record`, targetId: id }).catch(console.error);
  },

  addAcademicSession: (session) => {
    const id = generateId();
    const record = { ...session, id };
    set((state) => ({ academicSessions: [...state.academicSessions, record] }));
    addDocumentWithId('academicSessions', id, record).catch(console.error);
    logActivity({ action: 'CREATE', module: 'academicSessions', description: `Created academic session ${session.name}`, targetId: id, targetName: session.name }).catch(console.error);
  },
  updateAcademicSession: (id, updatedSession) => {
    set((state) => ({ academicSessions: state.academicSessions.map((s) => (s.id === id ? { ...s, ...updatedSession } : s)) }));
    updateDocument('academicSessions', id, updatedSession as Record<string, unknown>).catch(console.error);
    logActivity({ action: 'UPDATE', module: 'academicSessions', description: `Updated academic session`, targetId: id }).catch(console.error);
  },
  deleteAcademicSession: (id) => {
    set((state) => ({ academicSessions: state.academicSessions.filter((s) => s.id !== id) }));
    deleteDocument('academicSessions', id).catch(console.error);
    logActivity({ action: 'DELETE', module: 'academicSessions', description: `Deleted academic session`, targetId: id }).catch(console.error);
  },

  addSubject: (subject) => {
    const id = generateId();
    const record = { ...subject, id };
    set((state) => ({ subjects: [...state.subjects, record] }));
    addDocumentWithId('subjects', id, record).catch(console.error);
    logActivity({ action: 'CREATE', module: 'subjects', description: `Created subject ${subject.name}`, targetId: id, targetName: subject.name }).catch(console.error);
  },
  updateSubject: (id, updatedSubject) => {
    set((state) => ({ subjects: state.subjects.map((s) => (s.id === id ? { ...s, ...updatedSubject } : s)) }));
    updateDocument('subjects', id, updatedSubject as Record<string, unknown>).catch(console.error);
    logActivity({ action: 'UPDATE', module: 'subjects', description: `Updated subject record`, targetId: id }).catch(console.error);
  },
  deleteSubject: (id) => {
    set((state) => ({ subjects: state.subjects.filter((s) => s.id !== id) }));
    deleteDocument('subjects', id).catch(console.error);
    logActivity({ action: 'DELETE', module: 'subjects', description: `Deleted subject record`, targetId: id }).catch(console.error);
  },

  updatePlan: (id, updatedPlan) => {
    set((state) => ({ plans: state.plans.map((p) => (p.id === id ? { ...p, ...updatedPlan } : p)) }));
    updateDocument('plans', id, updatedPlan as Record<string, unknown>).catch(console.error);
    logActivity({ action: 'UPDATE', module: 'plans', description: `Updated plan record`, targetId: id }).catch(console.error);
  },

  addExam: (exam) => {
    const id = generateId();
    const record = { ...exam, id };
    set((state) => ({ exams: [...state.exams, record] }));
    addDocumentWithId('exams', id, record).catch(console.error);
    logActivity({ action: 'CREATE', module: 'exams', description: `Created exam ${exam.title}`, targetId: id, targetName: exam.title }).catch(console.error);
  },
  updateExam: (id, updatedExam) => {
    set((state) => ({ exams: state.exams.map((e) => (e.id === id ? { ...e, ...updatedExam } : e)) }));
    updateDocument('exams', id, updatedExam as Record<string, unknown>).catch(console.error);
    logActivity({ action: 'UPDATE', module: 'exams', description: `Updated exam record`, targetId: id }).catch(console.error);
  },
  deleteExam: (id) => {
    set((state) => ({ exams: state.exams.filter((e) => e.id !== id) }));
    deleteDocument('exams', id).catch(console.error);
    logActivity({ action: 'DELETE', module: 'exams', description: `Deleted exam record`, targetId: id }).catch(console.error);
  },

  addExamResult: (result) => {
    const id = generateId();
    const record = { ...result, id };
    set((state) => ({ examResults: [...state.examResults, record] }));
    addDocumentWithId('examResults', id, record).catch(console.error);
    logActivity({ action: 'CREATE', module: 'examResults', description: `Recorded result for ${result.studentName}`, targetId: id, targetName: result.studentName }).catch(console.error);
  },
  updateExamResult: (id, updated) => {
    set((state) => ({ examResults: state.examResults.map((r) => (r.id === id ? { ...r, ...updated } : r)) }));
    updateDocument('examResults', id, updated as Record<string, unknown>).catch(console.error);
    logActivity({ action: 'UPDATE', module: 'examResults', description: `Updated exam result`, targetId: id }).catch(console.error);
  },
  deleteExamResult: (id) => {
    set((state) => ({ examResults: state.examResults.filter((r) => r.id !== id) }));
    deleteDocument('examResults', id).catch(console.error);
    logActivity({ action: 'DELETE', module: 'examResults', description: `Deleted exam result`, targetId: id }).catch(console.error);
  },

  setExamTimetable: (timetable) => set({ examTimetable: timetable }),

  addExamTimetableEntry: (entry) => {
    const id = generateId();
    const record = { ...entry, id };
    set((state) => ({ examTimetable: [...state.examTimetable, record] }));
    addDocumentWithId('examTimetable', id, record).catch(console.error);
    logActivity({ action: 'CREATE', module: 'examTimetable', description: `Added exam timetable entry: ${entry.subject} (${entry.day})`, targetId: id, targetName: entry.subject }).catch(console.error);
  },

  markAttendance: (records) => {
    const newRecords = records.map((r) => ({ ...r, id: generateId() }));
    set((state) => {
      const filteredAttendance = state.attendance.filter(
        (existing) => !records.some((r) => r.date === existing.date && r.targetId === existing.targetId && r.classId === existing.classId),
      );
      return { attendance: [...filteredAttendance, ...newRecords] };
    });
    newRecords.forEach((record) => {
      addDocumentWithId('attendance', record.id, record).catch(console.error);
    });
    const present = records.filter((r) => r.status === 'Present').length;
    const absent = records.filter((r) => r.status === 'Absent').length;
    const late = records.filter((r) => r.status === 'Late').length;
    const excused = records.filter((r) => r.status === 'Excused').length;
    logActivity({ action: 'CREATE', module: 'attendance', description: `Marked attendance for ${records.length} ${records[0]?.type?.toLowerCase() || 'records'} (${present} present, ${absent} absent, ${late} late, ${excused} excused)` }).catch(console.error);
  },

  generateAttendanceToken: ({ classId, className, date, createdBy, ttlMinutes = 15 }) => {
    const code = Math.random().toString(36).slice(2, 8).toUpperCase();
    const now = Date.now();
    const token: AttendanceToken = {
      id: generateId(),
      code,
      classId,
      className,
      date,
      createdBy,
      createdAt: now,
      expiresAt: now + ttlMinutes * 60 * 1000,
      usedBy: [],
    };
    set((state) => ({ attendanceTokens: [...state.attendanceTokens.filter((t) => t.date === date && t.classId === classId), token] }));
    addDocumentWithId('attendanceTokens', token.id, token).catch(console.error);
    logActivity({ action: 'CREATE', module: 'attendanceTokens', description: `Generated attendance token ${code} for ${className} on ${date}`, targetId: token.id }).catch(console.error);
    return token;
  },

  redeemAttendanceToken: (code, student) => {
    const token = get().attendanceTokens.find((t) => t.code.toUpperCase() === code.trim().toUpperCase());
    if (!token) return { ok: false, message: 'Invalid token. Please check with your lecturer.' };
    if (Date.now() > token.expiresAt) return { ok: false, message: 'This token has expired. Ask your lecturer to generate a new one.' };
    if (token.date !== student.date) return { ok: false, message: `This token is for ${token.date}, not ${student.date}.` };
    if (token.usedBy?.includes(student.targetId)) return { ok: false, message: 'You have already marked attendance with this token.' };

    const updatedToken: AttendanceToken = { ...token, usedBy: [...(token.usedBy ?? []), student.targetId] };
    set((state) => ({ attendanceTokens: state.attendanceTokens.map((t) => (t.id === token.id ? updatedToken : t)) }));
    addDocumentWithId('attendanceTokens', token.id, updatedToken).catch(console.error);

    const record: AttendanceRecord = {
      id: generateId(),
      targetId: student.targetId,
      targetName: student.targetName,
      type: 'Student',
      status: 'Present',
      date: student.date,
      classId: student.classId ?? token.classId,
      markedBy: 'Token',
    };
    set((state) => {
      const filtered = state.attendance.filter(
        (existing) => !(existing.date === record.date && existing.targetId === record.targetId && existing.classId === record.classId),
      );
      return { attendance: [...filtered, record] };
    });
    addDocumentWithId('attendance', record.id, record).catch(console.error);
    logActivity({ action: 'CREATE', module: 'attendance', description: `Student ${student.targetName} marked present via token ${code}` }).catch(console.error);
    return { ok: true, message: `Attendance marked as Present for ${token.className}.` };
  },

  addExpense: (expense) => {
    const id = `EXP-${generateId()}`;
    const record = { ...expense, id };
    set((state) => ({ expenses: [...state.expenses, record] }));
    addDocumentWithId('expenses', id, record).catch(console.error);
    logActivity({ action: 'CREATE', module: 'expenses', description: `Recorded expense: ${expense.title}`, targetId: id, targetName: expense.title }).catch(console.error);
  },
  updateExpense: (id, updatedExpense) => {
    set((state) => ({ expenses: state.expenses.map((e) => (e.id === id ? { ...e, ...updatedExpense } : e)) }));
    updateDocument('expenses', id, updatedExpense as Record<string, unknown>).catch(console.error);
    logActivity({ action: 'UPDATE', module: 'expenses', description: `Updated expense record`, targetId: id }).catch(console.error);
  },
  deleteExpense: (id) => {
    set((state) => ({ expenses: state.expenses.filter((e) => e.id !== id) }));
    deleteDocument('expenses', id).catch(console.error);
    logActivity({ action: 'DELETE', module: 'expenses', description: `Deleted expense record`, targetId: id }).catch(console.error);
  },

  addPayroll: (payroll) => {
    const id = `PAY-${generateId()}`;
    const record = { ...payroll, id };
    set((state) => ({ payroll: [...state.payroll, record] }));
    addDocumentWithId('payroll', id, record).catch(console.error);
    logActivity({ action: 'CREATE', module: 'payroll', description: `Created payroll for ${payroll.staffName}`, targetId: id, targetName: payroll.staffName }).catch(console.error);
  },
  updatePayroll: (id, updatedPayroll) => {
    set((state) => ({ payroll: state.payroll.map((p) => (p.id === id ? { ...p, ...updatedPayroll } : p)) }));
    updateDocument('payroll', id, updatedPayroll as Record<string, unknown>).catch(console.error);
    logActivity({ action: 'UPDATE', module: 'payroll', description: `Updated payroll record`, targetId: id }).catch(console.error);
  },

  addRegistrationConfig: (config) => {
    const id = `RC-${generateId()}`;
    const record = { ...config, id };
    set((state) => ({ registrationConfigs: [...state.registrationConfigs, record] }));
    addDocumentWithId('registrationConfigs', id, record).catch(console.error);
    logActivity({ action: 'CREATE', module: 'registrationConfigs', description: `Created registration config`, targetId: id }).catch(console.error);
  },
  updateRegistrationConfig: (id, updated) => {
    set((state) => ({ registrationConfigs: state.registrationConfigs.map((c) => (c.id === id ? { ...c, ...updated } : c)) }));
    updateDocument('registrationConfigs', id, updated as Record<string, unknown>).catch(console.error);
    logActivity({ action: 'UPDATE', module: 'registrationConfigs', description: `Updated registration config`, targetId: id }).catch(console.error);
  },
  deleteRegistrationConfig: (id) => {
    set((state) => ({ registrationConfigs: state.registrationConfigs.filter((c) => c.id !== id) }));
    deleteDocument('registrationConfigs', id).catch(console.error);
    logActivity({ action: 'DELETE', module: 'registrationConfigs', description: `Deleted registration config`, targetId: id }).catch(console.error);
  },

  addAdmissionApplication: (app) => {
    const id = `ADM-${generateId()}`;
    const record = { ...app, id };
    set((state) => ({ admissionApplications: [...state.admissionApplications, record] }));
    addDocumentWithId('admissionApplications', id, record).catch(console.error);
    logActivity({ action: 'CREATE', module: 'admissions', description: `New admission application from ${app.surname || app.firstName || 'applicant'}`, targetId: id, targetName: `${app.surname || ''} ${app.firstName || ''}`.trim() }).catch(console.error);
  },
  updateAdmissionApplication: (id, updated) => {
    set((state) => {
      const existing = state.admissionApplications.find((a) => a.id === id);
      updateDocument('admissionApplications', id, updated as Record<string, unknown>).catch(console.error);
      logActivity({ action: 'UPDATE', module: 'admissions', description: `Updated admission application`, targetId: id }).catch(console.error);
      if (existing && updated.applicationStatus && updated.applicationStatus !== existing.applicationStatus) {
        const now = new Date().toLocaleString();
        const nid = generateId();
        const s = updated.applicationStatus;
        const label = s === 'Approved' || s === 'Admitted' ? 'Accepted' : s === 'Rejected' ? 'Rejected' : s;
        const notifType = s === 'Approved' || s === 'Admitted' ? 'success' as const : s === 'Rejected' ? 'error' as const : 'info' as const;
        const notif = { id: nid, userId: existing.id, title: `Admission ${label}`, description: `Your admission application has been ${label.toLowerCase()}.`, time: now, read: false, type: notifType, link: '/admin/admissions' };
        addDocumentWithId('notifications', nid, notif).catch(console.error);
      }
      return { admissionApplications: state.admissionApplications.map((a) => (a.id === id ? { ...a, ...updated } : a)) };
    });
  },
  deleteAdmissionApplication: (id) => {
    set((state) => ({ admissionApplications: state.admissionApplications.filter((a) => a.id !== id) }));
    deleteDocument('admissionApplications', id).catch(console.error);
    logActivity({ action: 'DELETE', module: 'admissions', description: `Deleted admission application`, targetId: id }).catch(console.error);
  },

  markNotificationRead: (id) => {
    set((state) => ({
      notifications: state.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
    }));
    updateDocument('notifications', id, { read: true }).catch(console.error);
  },

  markAllNotificationsRead: () => {
    const current = get();
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, read: true })),
    }));
    current.notifications.forEach((n) => {
      if (!n.read) {
        updateDocument('notifications', n.id, { read: true }).catch(console.error);
      }
    });
    logActivity({ action: 'UPDATE', module: 'notifications', description: `Marked all notifications as read` }).catch(console.error);
  },

  addNotification: (notif) => {
    const id = generateId();
    const record = { ...notif, id };
    set((state) => ({ notifications: [record, ...state.notifications] }));
    addDocumentWithId('notifications', id, record).catch(console.error);
  },

  deleteNotification: (id) => {
    set((state) => ({ notifications: state.notifications.filter((n) => n.id !== id) }));
    deleteDocument('notifications', id).catch(console.error);
  },

  notifyUsers: (userIds, title, description, type, link) => {
    const now = new Date().toLocaleString();
    userIds.forEach((uid) => {
      const id = generateId();
      const record = { id, userId: uid, title, description, time: now, read: false, type, link };
      addDocumentWithId('notifications', id, record).catch(console.error);
    });
  },

  deletePlatformUser: (id) => {
    set((state) => ({ platformUsers: state.platformUsers.filter((u) => u.id !== id) }));
    deleteDocument('users', id).catch(console.error);
    logActivity({ action: 'DELETE', module: 'platformUsers', description: `Deleted platform user`, targetId: id }).catch(console.error);
  },

  updatePlatformUser: (id, updates) => {
    set((state) => ({ platformUsers: state.platformUsers.map((u) => (u.id === id ? { ...u, ...updates } : u)) }));
    updateDocument('users', id, updates as Record<string, unknown>).catch(console.error);
    logActivity({ action: 'UPDATE', module: 'platformUsers', description: `Updated platform user`, targetId: id }).catch(console.error);
  },

  addNotice: (notice) => {
    const id = generateId();
    const record = { ...notice, id };
    set((state) => ({ notices: [record, ...state.notices] }));
    addDocumentWithId('notices', id, record).catch(console.error);
    logActivity({ action: 'CREATE', module: 'notices', description: `Posted notice: ${notice.title}`, targetId: id, targetName: notice.title }).catch(console.error);
    // Notify all students, teachers, and parents
    const state = get();
    const userIds = [
      ...state.students.map((s) => s.id),
      ...state.teachers.map((t) => t.id),
      ...state.parents.map((p) => p.id),
    ].filter(Boolean);
    if (userIds.length > 0) {
      const now = new Date().toLocaleString();
      userIds.forEach((uid) => {
        const nid = generateId();
        const record = { id: nid, userId: uid, title: `New Notice: ${notice.title}`, description: notice.content.slice(0, 100) + (notice.content.length > 100 ? '...' : ''), time: now, read: false, type: notice.priority === 'High' ? 'warning' as const : 'info' as const, link: '/admin/notices' };
        addDocumentWithId('notifications', nid, record).catch(console.error);
      });
    }
  },
  updateNotice: (id, updatedNotice) => {
    set((state) => ({ notices: state.notices.map((n) => (n.id === id ? { ...n, ...updatedNotice } : n)) }));
    updateDocument('notices', id, updatedNotice as Record<string, unknown>).catch(console.error);
    logActivity({ action: 'UPDATE', module: 'notices', description: `Updated notice`, targetId: id }).catch(console.error);
  },
  deleteNotice: (id) => {
    set((state) => ({ notices: state.notices.filter((n) => n.id !== id) }));
    deleteDocument('notices', id).catch(console.error);
    logActivity({ action: 'DELETE', module: 'notices', description: `Deleted notice`, targetId: id }).catch(console.error);
  },

  addTimetableEntry: (entry) => {
    const id = generateId();
    const record = { ...entry, id };
    set((state) => ({ timetable: [...state.timetable, record] }));
    addDocumentWithId('timetable', id, record).catch(console.error);
    logActivity({ action: 'CREATE', module: 'timetable', description: `Added timetable entry for ${entry.subject || 'class'}`, targetId: id }).catch(console.error);
  },
  updateTimetableEntry: (id, updatedEntry) => {
    set((state) => ({ timetable: state.timetable.map((t) => (t.id === id ? { ...t, ...updatedEntry } : t)) }));
    updateDocument('timetable', id, updatedEntry as Record<string, unknown>).catch(console.error);
    logActivity({ action: 'UPDATE', module: 'timetable', description: `Updated timetable entry`, targetId: id }).catch(console.error);
  },
  deleteTimetableEntry: (id) => {
    set((state) => ({ timetable: state.timetable.filter((t) => t.id !== id) }));
    deleteDocument('timetable', id).catch(console.error);
    logActivity({ action: 'DELETE', module: 'timetable', description: `Deleted timetable entry`, targetId: id }).catch(console.error);
  },

  // Activity Log Actions
  requestLogDeletion: (id) => {
    const user = useAuthStore.getState().user;
    if (!user) return;
    const now = new Date().toISOString();
    set((state) => ({
      activityLogs: state.activityLogs.map((log) =>
        log.id === id
          ? { ...log, deletionRequested: true, deletionRequestedBy: user.id, deletionRequestedByName: user.name, deletionRequestedAt: now }
          : log,
      ),
    }));
    updateDocument('activityLogs', id, {
      deletionRequested: true,
      deletionRequestedBy: user.id,
      deletionRequestedByName: user.name,
      deletionRequestedAt: now,
    }).catch(console.error);
  },

  approveLogDeletion: (id) => {
    const user = useAuthStore.getState().user;
    if (!user) return;
    const now = new Date().toISOString();
    set((state) => ({
      activityLogs: state.activityLogs.filter((log) => log.id !== id),
    }));
    deleteDocument('activityLogs', id).catch(console.error);
  },

  rejectLogDeletion: (id, reason) => {
    const user = useAuthStore.getState().user;
    if (!user) return;
    const now = new Date().toISOString();
    set((state) => ({
      activityLogs: state.activityLogs.map((log) =>
        log.id === id
          ? { ...log, deletionRejected: true, deletionRejectedBy: user.id, deletionRejectedAt: now, deletionRejectionReason: reason }
          : log,
      ),
    }));
    updateDocument('activityLogs', id, {
      deletionRejected: true,
      deletionRejectedBy: user.id,
      deletionRejectedAt: now,
      deletionRejectionReason: reason,
    }).catch(console.error);
  },

  purgeOldLogs: async () => {
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);
    const cutoff = twelveMonthsAgo.getTime();
    const isOld = (log: ActivityLog) => {
      const v = log.createdAt;
      if (typeof v === 'string') {
        const t = new Date(v).getTime();
        return !Number.isNaN(t) && t < cutoff;
      }
      if (v && typeof v === 'object') {
        const obj = v as { toMillis?: () => number; seconds?: number };
        if (typeof obj.toMillis === 'function') return obj.toMillis() < cutoff;
        if (typeof obj.seconds === 'number') return obj.seconds * 1000 < cutoff;
      }
      return false;
    };
    let count = 0;
    set((state) => ({
      activityLogs: state.activityLogs.filter((log) => {
        if (isOld(log)) {
          count++;
          deleteDocument('activityLogs', log.id).catch(console.error);
          return false;
        }
        return true;
      }),
    }));
    return count;
  },
}));
