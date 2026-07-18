import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type PortalLevel = 'Primary' | 'Secondary' | 'College' | 'University';

export type AdmissionFieldKey = keyof Omit<Student, 'id'>;

export interface AdmissionFormConfig {
  enabledFields: AdmissionFieldKey[];
}

export const buildDefaultAdmissionFormConfig = (portalLevel: PortalLevel): AdmissionFormConfig => {
  const defaults: Record<PortalLevel, AdmissionFieldKey[]> = {
    Primary: ['admissionNumber', 'regNo', 'surname', 'firstName', 'middleName', 'gender', 'dateOfBirth', 'placeOfBirth', 'nationality', 'stateOfOrigin', 'lga', 'tribeEthnicity', 'religion', 'passportUrl', 'residentialAddress', 'townCity', 'state', 'postalAddress', 'fatherName', 'fatherOccupation', 'fatherEmployer', 'fatherPhone', 'fatherEmail', 'fatherAddress', 'motherName', 'motherOccupation', 'motherEmployer', 'motherPhone', 'motherEmail', 'guardianName', 'guardianRelationship', 'guardianPhone', 'guardianAddress', 'bloodGroup', 'genotype', 'allergies', 'medicalConditions', 'disability', 'hospitalDoctor', 'emergencyContact', 'previousSchoolName', 'previousSchoolAddress', 'lastClassAttended', 'reasonForLeaving', 'classApplyingFor', 'classDepartment', 'academicSession', 'dateOfAdmission', 'admissionStatus', 'birthCertificate', 'passportDocument', 'immunizationCard', 'previousSchoolResult', 'parentIdDocument', 'status'],
    Secondary: ['admissionNumber', 'regNo', 'surname', 'firstName', 'middleName', 'gender', 'dateOfBirth', 'placeOfBirth', 'nationality', 'stateOfOrigin', 'lga', 'tribeEthnicity', 'religion', 'passportUrl', 'residentialAddress', 'townCity', 'state', 'postalAddress', 'fatherName', 'fatherOccupation', 'fatherEmployer', 'fatherPhone', 'fatherEmail', 'fatherAddress', 'motherName', 'motherOccupation', 'motherEmployer', 'motherPhone', 'motherEmail', 'guardianName', 'guardianRelationship', 'guardianPhone', 'guardianAddress', 'bloodGroup', 'genotype', 'allergies', 'medicalConditions', 'disability', 'hospitalDoctor', 'emergencyContact', 'entranceExamScore', 'commonEntranceResult', 'previousSchoolResult', 'lastClassAttended', 'subjectsOffered', 'preferredSport', 'clubSociety', 'specialTalent', 'accommodationType', 'hostelPreference', 'classApplyingFor', 'classDepartment', 'academicSession', 'dateOfAdmission', 'admissionStatus', 'transferLetter', 'testimonial', 'birthCertificate', 'passportDocument', 'stateOfOriginCertificate', 'status'],
    College: ['admissionNumber', 'regNo', 'jambRegistrationNumber', 'jambScore', 'surname', 'firstName', 'middleName', 'gender', 'dateOfBirth', 'maritalStatus', 'nationality', 'state', 'lga', 'passportUrl', 'oLevelResults', 'oLevelSitting', 'oLevelSubjectsGrades', 'institutionChoice', 'department', 'programme', 'level', 'entryMode', 'screeningScore', 'phone', 'email', 'residentialAddress', 'parentName', 'sponsorOccupation', 'guardianPhone', 'guardianAddress', 'bloodGroup', 'genotype', 'disability', 'medicalConditions', 'birthCertificate', 'localGovernmentCertificate', 'acceptanceLetter', 'admissionLetter', 'classDepartment', 'academicSession', 'dateOfAdmission', 'admissionStatus', 'status'],
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
  term?: string;
  session?: string;
  assignedClasses?: string[];
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
  thirdChoiceCourse?: string;

  // Class Applying For
  classApplyingFor: string;

  // Sponsor Information
  sponsorFullName?: string;
  sponsorAddress?: string;
  sponsorPhone?: string;
  sponsorSignatureUrl?: string;
  sponsorDate?: string;

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
  subjects: Subject[];
  exams: Exam[];
  examResults: ExamResult[];
  examTimetable: ExamTimetableEntry[];
  attendance: AttendanceRecord[];
  expenses: Expense[];
  payroll: Payroll[];
  registrationConfigs: SchoolRegistrationConfig[];
  admissionApplications: AdmissionApplication[];
  _hasHydrated: boolean;
  setHasHydrated: (value: boolean) => void;

  // Student Actions
  addStudent: (student: Omit<Student, 'id'>) => StudentMutationResult;
  updateStudent: (id: string, student: Partial<Student>) => StudentMutationResult;
  deleteStudent: (id: string) => StudentMutationResult;
  
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
}

export const useDataStore = create<DataState>()(
  persist(
    (set) => ({
      students: [],
      parents: [],
      staff: [],
      feeRecords: [],
      feeStructures: [],
      schools: [],
      delegatedAccess: [],
      plans: [
        { id: '1', name: 'Basic', price: 49, studentsLimit: 100, features: ['Core Dashboard', 'Attendance', 'Basic Reports'] },
        { id: '2', name: 'Standard', price: 99, studentsLimit: 500, features: ['Everything in Basic', 'Fee Management', 'SMS Alerts'] },
        { id: '3', name: 'Professional', price: 199, studentsLimit: 2000, features: ['Everything in Standard', 'Hostel & Transport', 'Advanced Analytics'] },
        { id: '4', name: 'Enterprise', price: 399, studentsLimit: 10000, features: ['Everything in Professional', 'Multi-Campus', 'Priority Support'] },
      ],
      teachers: [],
      classes: [],
      faculties: [],
      subjects: [],
      exams: [],
      examResults: [],
      examTimetable: [],
      attendance: [],
      expenses: [],
      payroll: [],

      addStudent: (student) => {
        let result: StudentMutationResult = { success: false, error: 'Unable to create student record.' };

        set((state) => {
          const duplicateError = getDuplicateStudentError(state.students, student);
          if (duplicateError) {
            result = { success: false, error: duplicateError };
            return {};
          }

          const createdStudent: Student = {
            ...student,
            id: Math.random().toString(36).substr(2, 9),
          };

          result = { success: true, student: createdStudent };
          return {
            students: [...state.students, createdStudent],
          };
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

          const mergedStudent: Student = {
            ...existingStudent,
            ...updatedStudent,
          };

          const duplicateError = getDuplicateStudentError(state.students, mergedStudent, id);
          if (duplicateError) {
            result = { success: false, error: duplicateError };
            return {};
          }

          result = { success: true, student: mergedStudent };
          return {
            students: state.students.map((student) => (student.id === id ? mergedStudent : student)),
          };
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
          return {
            students: state.students.filter((student) => student.id !== id),
          };
        });

        return result;
      },

      addParent: (parent) => set((state) => ({ 
        parents: [...state.parents, { ...parent, id: Math.random().toString(36).substring(2, 11) }] 
      })),
      updateParent: (id, updatedParent) => set((state) => ({
        parents: state.parents.map((p) => (p.id === id ? { ...p, ...updatedParent } : p))
      })),
      deleteParent: (id) => set((state) => ({
        parents: state.parents.filter((p) => p.id !== id)
      })),

      addStaff: (staff) => set((state) => ({ 
        staff: [...state.staff, { ...staff, id: Math.random().toString(36).substring(2, 11) }] 
      })),
      updateStaff: (id, updatedStaff) => set((state) => ({
        staff: state.staff.map((s) => (s.id === id ? { ...s, ...updatedStaff } : s))
      })),
      deleteStaff: (id) => set((state) => ({
        staff: state.staff.filter((s) => s.id !== id)
      })),

      addFeeRecord: (record) => set((state) => ({ 
        feeRecords: [...state.feeRecords, { ...record, id: Math.random().toString(36).substring(2, 11) }] 
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
        schools: [...state.schools, { ...school, id: Math.random().toString(36).substring(2, 11) }] 
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
        teachers: [...state.teachers, { ...teacher, id: Math.random().toString(36).substring(2, 11) }] 
      })),
      updateTeacher: (id, updatedTeacher) => set((state) => ({
        teachers: state.teachers.map((t) => (t.id === id ? { ...t, ...updatedTeacher } : t))
      })),
      deleteTeacher: (id) => set((state) => ({
        teachers: state.teachers.filter((t) => t.id !== id)
      })),

      addClass: (cls) => set((state) => ({ 
        classes: [...state.classes, { ...cls, id: Math.random().toString(36).substring(2, 11) }] 
      })),
      updateClass: (id, updatedCls) => set((state) => ({
        classes: state.classes.map((c) => (c.id === id ? { ...c, ...updatedCls } : c))
      })),
      deleteClass: (id) => set((state) => ({
        classes: state.classes.filter((c) => c.id !== id)
      })),

      addFaculty: (faculty) => set((state) => ({ 
        faculties: [...state.faculties, { ...faculty, id: Math.random().toString(36).substring(2, 11) }] 
      })),
      updateFaculty: (id, updatedFaculty) => set((state) => ({
        faculties: state.faculties.map((f) => (f.id === id ? { ...f, ...updatedFaculty } : f))
      })),
      deleteFaculty: (id) => set((state) => ({
        faculties: state.faculties.filter((f) => f.id !== id)
      })),

      addSubject: (subject) => set((state) => ({ 
        subjects: [...state.subjects, { ...subject, id: Math.random().toString(36).substring(2, 11) }] 
      })),
      updateSubject: (id, updatedSubject) => set((state) => ({
        subjects: state.subjects.map((s) => (s.id === id ? { ...s, ...updatedSubject } : s))
      })),
      deleteSubject: (id) => set((state) => ({
        subjects: state.subjects.filter((s) => s.id !== id)
      })),

      updatePlan: (id, updatedPlan) => set((state) => ({
        plans: state.plans.map((p) => (p.id === id ? { ...p, ...updatedPlan } : p))
      })),

      addExam: (exam) => set((state) => ({ 
        exams: [...state.exams, { ...exam, id: Math.random().toString(36).substring(2, 11) }] 
      })),
      updateExam: (id, updatedExam) => set((state) => ({
        exams: state.exams.map((e) => (e.id === id ? { ...e, ...updatedExam } : e))
      })),
      deleteExam: (id) => set((state) => ({
        exams: state.exams.filter((e) => e.id !== id)
      })),
      addExamResult: (result) => set((state) => ({
        examResults: [...state.examResults, { ...result, id: Math.random().toString(36).substring(2, 11) }]
      })),
      updateExamResult: (id, updated) => set((state) => ({
        examResults: state.examResults.map((r) => (r.id === id ? { ...r, ...updated } : r))
      })),
      deleteExamResult: (id) => set((state) => ({
        examResults: state.examResults.filter((r) => r.id !== id)
      })),
      setExamTimetable: (timetable) => set({ examTimetable: timetable }),
      addExamTimetableEntry: (entry) => set((state) => ({
        examTimetable: [...state.examTimetable, { ...entry, id: Math.random().toString(36).substring(2, 11) }]
      })),

      markAttendance: (records) => set((state) => {
        const newRecords = records.map(r => ({ ...r, id: Math.random().toString(36).substring(2, 11) }));
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

      registrationConfigs: [],
      addRegistrationConfig: (config) => set((state) => ({
        registrationConfigs: [...state.registrationConfigs, { ...config, id: `RC-${Math.floor(Math.random() * 100000)}` }]
      })),
      updateRegistrationConfig: (id, updated) => set((state) => ({
        registrationConfigs: state.registrationConfigs.map((c) => (c.id === id ? { ...c, ...updated } : c))
      })),
      deleteRegistrationConfig: (id) => set((state) => ({
        registrationConfigs: state.registrationConfigs.filter((c) => c.id !== id)
      })),

      admissionApplications: [],
      addAdmissionApplication: (app) => set((state) => ({
        admissionApplications: [...state.admissionApplications, { ...app, id: `ADM-${Math.floor(Math.random() * 100000)}` }],
      })),
      updateAdmissionApplication: (id, updated) => set((state) => ({
        admissionApplications: state.admissionApplications.map((a) => (a.id === id ? { ...a, ...updated } : a)),
      })),
      deleteAdmissionApplication: (id) => set((state) => ({
        admissionApplications: state.admissionApplications.filter((a) => a.id !== id),
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
