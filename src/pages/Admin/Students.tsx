import React, { useMemo, useState } from 'react';
import { useToastStore } from '@/store/useToastStore';
import { Search, Filter, Plus, Edit, Trash2, X, Users, CheckCircle, AlertCircle, GraduationCap, CreditCard } from 'lucide-react';
import { cn } from '@/utils';
import { useDataStore, Student, PortalLevel } from '@/store/useDataStore';
import ExcelImport from '@/components/ui/ExcelImport';
import { KPICard } from '@/components/ui/KPICard';
import { useAuthStore } from '@/store/useAuthStore';
import { resolveSchoolProfile } from '@/utils/schoolProfile';
import { PrintableIdCardModal } from '@/components/ui/PrintableIdCardModal';

type StudentFormState = Omit<Student, 'id'>;

type FieldConfig = {
  name: keyof StudentFormState;
  label: string;
  type?: 'text' | 'email' | 'date' | 'textarea' | 'select';
  options?: string[];
  colSpan?: number;
  placeholder?: string;
  readOnly?: boolean;
};

const portalLevelOptions: PortalLevel[] = ['Primary', 'Secondary', 'College', 'University'];

const generateCode = (prefix: string) =>
  `${prefix}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;

const createEmptyStudentForm = (portalLevel: PortalLevel): StudentFormState => {
  const admissionNumber = generateCode(`${portalLevel.slice(0, 3).toUpperCase()}-ADM`);

  return {
    name: '',
    studentId: generateCode(`${portalLevel.slice(0, 3).toUpperCase()}-STD`),
    regNo: admissionNumber,
    admissionNumber,
    nin: '',
    class: '',
    parentName: '',
    status: 'Active',
    email: '',
    surname: '',
    firstName: '',
    middleName: '',
    gender: '',
    dateOfBirth: '',
    placeOfBirth: '',
    nationality: '',
    stateOfOrigin: '',
    lga: '',
    tribeEthnicity: '',
    religion: '',
    maritalStatus: '',
    passportUrl: '',
    phone: '',
    residentialAddress: '',
    townCity: '',
    state: '',
    postalAddress: '',
    fatherName: '',
    fatherOccupation: '',
    fatherEmployer: '',
    fatherPhone: '',
    fatherEmail: '',
    fatherAddress: '',
    motherName: '',
    motherOccupation: '',
    motherEmployer: '',
    motherPhone: '',
    motherEmail: '',
    motherAddress: '',
    guardianName: '',
    guardianRelationship: '',
    guardianPhone: '',
    guardianAddress: '',
    sponsorName: '',
    sponsorOccupation: '',
    sponsorEmployer: '',
    sponsorPhone: '',
    sponsorEmail: '',
    bloodGroup: '',
    genotype: '',
    allergies: '',
    medicalConditions: '',
    disability: '',
    hospitalDoctor: '',
    emergencyContact: '',
    medicalHistory: '',
    medicalReport: '',
    previousSchoolName: '',
    previousSchoolAddress: '',
    previousSchoolResult: '',
    lastClassAttended: '',
    reasonForLeaving: '',
    entranceExamScore: '',
    commonEntranceResult: '',
    subjectsOffered: '',
    preferredSport: '',
    clubSociety: '',
    specialTalent: '',
    jambRegistrationNumber: '',
    jambScore: '',
    oLevelResults: '',
    oLevelSitting: '',
    oLevelExaminationBody: '',
    oLevelExamNumber: '',
    oLevelYear: '',
    oLevelSubjectsGrades: '',
    aLevelResults: '',
    aLevelQualifications: '',
    institutionChoice: '',
    faculty: '',
    department: '',
    programme: '',
    degreeType: '',
    level: '',
    entryMode: '',
    admissionType: '',
    screeningScore: '',
    cgpa: '',
    portalLevel,
    classApplyingFor: '',
    academicSession: '',
    session: '',
    semester: '',
    termSemester: '',
    dateOfAdmission: new Date().toISOString().split('T')[0],
    admissionStatus: 'Pending Review',
    campus: '',
    branch: '',
    house: '',
    hostel: '',
    hostelPreference: '',
    accommodationType: '',
    classDepartment: '',
    feeCategory: '',
    scholarshipStatus: '',
    sponsor: '',
    feePaymentPlan: '',
    busRoute: '',
    pickupPoint: '',
    driver: '',
    busNumber: '',
    libraryCardNumber: '',
    hostelName: '',
    roomNumber: '',
    bedSpace: '',
    matricNumber: '',
    fingerprintId: '',
    facialRecognitionId: '',
    digitalSignatureUrl: '',
    birthCertificate: '',
    immunizationCard: '',
    parentIdDocument: '',
    transferLetter: '',
    testimonial: '',
    stateOfOriginCertificate: '',
    localGovernmentCertificate: '',
    jambAdmissionLetter: '',
    admissionLetter: '',
    acceptanceLetter: '',
    guarantorForm: '',
    passportDocument: '',
  };
};

const baseSections: Array<{ title: string; fields: FieldConfig[] }> = [
  {
    title: 'System Details',
    fields: [
      { name: 'portalLevel', label: 'Portal Level', type: 'select', options: portalLevelOptions, colSpan: 1 },
      { name: 'studentId', label: 'Student ID', readOnly: true },
      { name: 'admissionNumber', label: 'Admission Number', readOnly: true },
      { name: 'regNo', label: 'Registration Number' },
      { name: 'nin', label: 'NIN' },
      { name: 'status', label: 'Status', type: 'select', options: ['Active', 'Inactive', 'Graduated', 'Suspended', 'Withdrawn'] },
      { name: 'academicSession', label: 'Academic Session' },
      { name: 'termSemester', label: 'Term / Semester' },
      { name: 'dateOfAdmission', label: 'Date of Admission', type: 'date' },
      { name: 'admissionStatus', label: 'Admission Status' },
      { name: 'campus', label: 'Campus' },
      { name: 'branch', label: 'Branch' },
    ],
  },
  {
    title: 'Personal Information',
    fields: [
      { name: 'surname', label: 'Surname' },
      { name: 'firstName', label: 'First Name' },
      { name: 'middleName', label: 'Middle Name' },
      { name: 'gender', label: 'Gender', type: 'select', options: ['Male', 'Female'] },
      { name: 'dateOfBirth', label: 'Date of Birth', type: 'date' },
      { name: 'placeOfBirth', label: 'Place of Birth' },
      { name: 'nationality', label: 'Nationality' },
      { name: 'stateOfOrigin', label: 'State of Origin' },
      { name: 'lga', label: 'Local Government Area' },
      { name: 'tribeEthnicity', label: 'Tribe / Ethnicity' },
      { name: 'religion', label: 'Religion' },
      { name: 'maritalStatus', label: 'Marital Status' },
      { name: 'email', label: 'Email Address', type: 'email' },
      { name: 'phone', label: 'Phone Number' },
      { name: 'passportUrl', label: 'Passport Photograph URL', colSpan: 2 },
    ],
  },
  {
    title: 'Contact Information',
    fields: [
      { name: 'residentialAddress', label: 'Residential Address', colSpan: 2 },
      { name: 'townCity', label: 'Town / City' },
      { name: 'state', label: 'State' },
      { name: 'postalAddress', label: 'Postal Address', colSpan: 2 },
    ],
  },
  {
    title: 'Parent / Guardian Information',
    fields: [
      { name: 'fatherName', label: 'Father Full Name' },
      { name: 'fatherOccupation', label: 'Father Occupation' },
      { name: 'fatherEmployer', label: 'Father Employer' },
      { name: 'fatherPhone', label: 'Father Phone Number' },
      { name: 'fatherEmail', label: 'Father Email Address', type: 'email' },
      { name: 'fatherAddress', label: 'Father Residential Address', colSpan: 2 },
      { name: 'motherName', label: 'Mother Full Name' },
      { name: 'motherOccupation', label: 'Mother Occupation' },
      { name: 'motherEmployer', label: 'Mother Employer' },
      { name: 'motherPhone', label: 'Mother Phone Number' },
      { name: 'motherEmail', label: 'Mother Email Address', type: 'email' },
      { name: 'motherAddress', label: 'Mother Residential Address', colSpan: 2 },
      { name: 'guardianName', label: 'Guardian Full Name' },
      { name: 'guardianRelationship', label: 'Guardian Relationship' },
      { name: 'guardianPhone', label: 'Guardian Phone Number' },
      { name: 'guardianAddress', label: 'Guardian Address', colSpan: 2 },
      { name: 'parentName', label: 'Primary Parent / Guardian Display Name', colSpan: 2 },
    ],
  },
  {
    title: 'Medical Information',
    fields: [
      { name: 'bloodGroup', label: 'Blood Group' },
      { name: 'genotype', label: 'Genotype' },
      { name: 'allergies', label: 'Allergies', type: 'textarea', colSpan: 2 },
      { name: 'medicalConditions', label: 'Medical Conditions', type: 'textarea', colSpan: 2 },
      { name: 'disability', label: 'Disability' },
      { name: 'hospitalDoctor', label: 'Hospital / Family Doctor' },
      { name: 'emergencyContact', label: 'Emergency Contact', colSpan: 2 },
      { name: 'medicalHistory', label: 'Medical History', type: 'textarea', colSpan: 2 },
    ],
  },
  {
    title: 'Previous School & Admission',
    fields: [
      { name: 'previousSchoolName', label: 'Previous School Name' },
      { name: 'previousSchoolAddress', label: 'Previous School Address' },
      { name: 'lastClassAttended', label: 'Last Class Attended' },
      { name: 'reasonForLeaving', label: 'Reason for Leaving', type: 'textarea', colSpan: 2 },
      { name: 'classApplyingFor', label: 'Class Applying For' },
      { name: 'classDepartment', label: 'Class / Department' },
      { name: 'class', label: 'Assigned Class / Level' },
    ],
  },
];

const levelSpecificSections: Record<PortalLevel, Array<{ title: string; fields: FieldConfig[] }>> = {
  Primary: [
    {
      title: 'Primary Admission Requirements',
      fields: [
        { name: 'birthCertificate', label: 'Birth Certificate Reference' },
        { name: 'immunizationCard', label: 'Immunization Card Reference' },
        { name: 'previousSchoolResult', label: 'Previous School Result Reference' },
        { name: 'parentIdDocument', label: 'Parent ID Reference' },
      ],
    },
  ],
  Secondary: [
    {
      title: 'Secondary Academic Information',
      fields: [
        { name: 'entranceExamScore', label: 'Entrance Exam Score' },
        { name: 'commonEntranceResult', label: 'Common Entrance Result' },
        { name: 'previousSchoolResult', label: 'Previous School Result' },
        { name: 'subjectsOffered', label: 'Subjects Offered', type: 'textarea', colSpan: 2 },
        { name: 'preferredSport', label: 'Preferred Sport' },
        { name: 'clubSociety', label: 'Club / Society' },
        { name: 'specialTalent', label: 'Special Talent', colSpan: 2 },
        { name: 'accommodationType', label: 'Day / Boarding', type: 'select', options: ['Day Student', 'Boarding Student'] },
        { name: 'hostelPreference', label: 'Hostel Preference' },
        { name: 'transferLetter', label: 'Transfer Letter Reference' },
        { name: 'testimonial', label: 'Testimonial Reference' },
        { name: 'stateOfOriginCertificate', label: 'State of Origin Certificate Reference' },
      ],
    },
  ],
  College: [
    {
      title: 'College / Polytechnic Admission',
      fields: [
        { name: 'jambRegistrationNumber', label: 'JAMB Registration Number' },
        { name: 'jambScore', label: 'JAMB Score' },
        { name: 'oLevelResults', label: "O'Level Results", type: 'textarea', colSpan: 2 },
        { name: 'oLevelSitting', label: 'Sitting (1 or 2)' },
        { name: 'institutionChoice', label: 'Institution Choice' },
        { name: 'department', label: 'Department' },
        { name: 'programme', label: 'Programme' },
        { name: 'level', label: 'Level' },
        { name: 'entryMode', label: 'Entry Mode' },
        { name: 'screeningScore', label: 'Screening Score' },
        { name: 'localGovernmentCertificate', label: 'Local Government Certificate Reference' },
        { name: 'acceptanceLetter', label: 'Acceptance Letter Reference' },
        { name: 'admissionLetter', label: 'Admission Letter Reference' },
      ],
    },
  ],
  University: [
    {
      title: 'University Admission',
      fields: [
        { name: 'matricNumber', label: 'Matric Number' },
        { name: 'jambRegistrationNumber', label: 'JAMB Registration Number' },
        { name: 'jambScore', label: 'JAMB Score' },
        { name: 'faculty', label: 'Faculty' },
        { name: 'department', label: 'Department' },
        { name: 'programme', label: 'Programme' },
        { name: 'degreeType', label: 'Degree Type' },
        { name: 'entryMode', label: 'Entry Mode' },
        { name: 'admissionType', label: 'Admission Type' },
        { name: 'session', label: 'Session' },
        { name: 'semester', label: 'Semester' },
        { name: 'level', label: 'Level' },
        { name: 'oLevelExaminationBody', label: "O'Level Examination Body" },
        { name: 'oLevelExamNumber', label: "O'Level Examination Number" },
        { name: 'oLevelYear', label: "O'Level Year" },
        { name: 'oLevelSubjectsGrades', label: "O'Level Subjects & Grades", type: 'textarea', colSpan: 2 },
        { name: 'aLevelQualifications', label: "A'Level / Direct Entry Qualifications", type: 'textarea', colSpan: 2 },
        { name: 'cgpa', label: 'CGPA' },
        { name: 'jambAdmissionLetter', label: 'JAMB Admission Letter Reference' },
        { name: 'acceptanceLetter', label: 'Acceptance Letter Reference' },
        { name: 'admissionLetter', label: 'Admission Letter Reference' },
        { name: 'guarantorForm', label: 'Guarantor Form Reference' },
      ],
    },
  ],
};

const commonAdminSection: Array<{ title: string; fields: FieldConfig[] }> = [
  {
    title: 'Common Administrative Fields',
    fields: [
      { name: 'feeCategory', label: 'Fee Category' },
      { name: 'scholarshipStatus', label: 'Scholarship Status' },
      { name: 'sponsor', label: 'Sponsor' },
      { name: 'feePaymentPlan', label: 'Fee Payment Plan' },
      { name: 'house', label: 'House' },
      { name: 'hostel', label: 'Hostel' },
      { name: 'hostelName', label: 'Hostel Name' },
      { name: 'roomNumber', label: 'Room Number' },
      { name: 'bedSpace', label: 'Bed Space' },
      { name: 'libraryCardNumber', label: 'Library Card Number' },
      { name: 'busRoute', label: 'Bus Route' },
      { name: 'pickupPoint', label: 'Pickup Point' },
      { name: 'driver', label: 'Driver' },
      { name: 'busNumber', label: 'Bus Number' },
      { name: 'fingerprintId', label: 'Fingerprint Reference' },
      { name: 'facialRecognitionId', label: 'Facial Recognition Reference' },
      { name: 'digitalSignatureUrl', label: 'Digital Signature Reference', colSpan: 2 },
    ],
  },
];

const documentSection: Array<{ title: string; fields: FieldConfig[] }> = [
  {
    title: 'Documents',
    fields: [
      { name: 'passportDocument', label: 'Passport Document Reference' },
      { name: 'birthCertificate', label: 'Birth Certificate Reference' },
      { name: 'immunizationCard', label: 'Immunization Card Reference' },
      { name: 'parentIdDocument', label: 'Parent ID Reference' },
      { name: 'transferLetter', label: 'Transfer Letter Reference' },
      { name: 'testimonial', label: 'Testimonial Reference' },
      { name: 'stateOfOriginCertificate', label: 'State of Origin Certificate Reference' },
      { name: 'localGovernmentCertificate', label: 'Local Government Certificate Reference' },
      { name: 'medicalReport', label: 'Medical Report Reference' },
      { name: 'previousSchoolResult', label: 'Previous School Result Reference' },
    ],
  },
];



type StudentFilterStatus = 'All' | Student['status'];
type StudentFilterPortalLevel = 'All' | PortalLevel;
type StudentFormErrors = Partial<Record<keyof StudentFormState | 'name', string>>;

const normalizeValue = (value?: string) => value?.trim().toLowerCase() ?? '';

const buildStudentDisplayName = (student: Partial<StudentFormState>) =>
  [student.surname, student.firstName, student.middleName].filter(Boolean).join(' ').trim() || student.name?.trim() || '';

const buildPrimaryGuardianName = (student: Partial<StudentFormState>) =>
  student.parentName?.trim() ||
  student.fatherName?.trim() ||
  student.guardianName?.trim() ||
  student.motherName?.trim() ||
  '';

const validateStudentPayload = (
  payload: StudentFormState,
  students: Student[],
  editingStudentId?: string,
): StudentFormErrors => {
  const errors: StudentFormErrors = {};
  const fullName = buildStudentDisplayName(payload);
  const guardianName = buildPrimaryGuardianName(payload);
  const resolvedClass = payload.classDepartment?.trim() || payload.classApplyingFor?.trim() || payload.class?.trim() || '';

  if (!fullName) {
    errors.name = 'Enter the student full name or fill surname and first name.';
  }

  if (!payload.email?.trim()) {
    errors.email = 'Email address is required.';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email.trim())) {
    errors.email = 'Enter a valid email address.';
  }

  if (!payload.regNo?.trim()) {
    errors.regNo = 'Registration number is required.';
  }

  if (!resolvedClass) {
    errors.class = 'Class or department is required.';
  }

  if (!guardianName) {
    errors.parentName = 'Parent or guardian name is required.';
  }

  if (!payload.dateOfAdmission?.trim()) {
    errors.dateOfAdmission = 'Date of admission is required.';
  }

  if ((payload.portalLevel === 'College' || payload.portalLevel === 'University') && !payload.department?.trim()) {
    errors.department = 'Department is required for this portal level.';
  }

  if ((payload.portalLevel === 'College' || payload.portalLevel === 'University') && !payload.programme?.trim()) {
    errors.programme = 'Programme is required for this portal level.';
  }

  const comparableStudentId = normalizeValue(payload.studentId);
  const comparableRegNo = normalizeValue(payload.regNo);
  const comparableAdmissionNumber = normalizeValue(payload.admissionNumber);
  const comparableEmail = normalizeValue(payload.email);

  const duplicateStudent = students.find((student) => {
    if (student.id === editingStudentId) return false;

    return (
      (comparableStudentId && normalizeValue(student.studentId) === comparableStudentId) ||
      (comparableRegNo && normalizeValue(student.regNo) === comparableRegNo) ||
      (comparableAdmissionNumber && normalizeValue(student.admissionNumber) === comparableAdmissionNumber) ||
      (comparableEmail && normalizeValue(student.email) === comparableEmail)
    );
  });

  if (duplicateStudent) {
    if (comparableStudentId && normalizeValue(duplicateStudent.studentId) === comparableStudentId) {
      errors.studentId = `Student ID already belongs to ${duplicateStudent.name}.`;
    }
    if (comparableRegNo && normalizeValue(duplicateStudent.regNo) === comparableRegNo) {
      errors.regNo = `Registration number already belongs to ${duplicateStudent.name}.`;
    }
    if (comparableAdmissionNumber && normalizeValue(duplicateStudent.admissionNumber) === comparableAdmissionNumber) {
      errors.admissionNumber = `Admission number already belongs to ${duplicateStudent.name}.`;
    }
    if (comparableEmail && normalizeValue(duplicateStudent.email) === comparableEmail) {
      errors.email = `Email address already belongs to ${duplicateStudent.name}.`;
    }
  }

  return errors;
};

export default function StudentsDirectory() {
  const [searchTerm, setSearchTerm] = useState('');
  const { students, addStudent, updateStudent, deleteStudent, schools } = useDataStore();
  const { user } = useAuthStore();
  const showToast = useToastStore((state) => state.showToast);
  const schoolProfile = resolveSchoolProfile(user, schools);
  const activePortalLevel = schoolProfile.portalLevel ?? 'Secondary';

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [idCardStudent, setIdCardStudent] = useState<Student | null>(null);
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);
  const [statusFilter, setStatusFilter] = useState<StudentFilterStatus>('All');
  const [portalLevelFilter, setPortalLevelFilter] = useState<StudentFilterPortalLevel>('All');
  const [formErrors, setFormErrors] = useState<StudentFormErrors>({});
  const [formData, setFormData] = useState<StudentFormState>(() => createEmptyStudentForm(activePortalLevel));

  const stats = useMemo(() => ({
    total: students.length,
    active: students.filter((student) => student.status === 'Active').length,
    inactive: students.filter((student) => student.status !== 'Active').length,
    classes: new Set(students.map((student) => student.classDepartment || student.class).filter(Boolean)).size,
  }), [students]);

  const filteredStudents = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return students.filter((student) => {
      const matchesSearch = !normalizedSearch || [
        student.name,
        student.regNo,
        student.admissionNumber,
        student.studentId,
        student.email,
        student.classDepartment,
        student.class,
        student.parentName,
      ]
        .filter(Boolean)
        .some((value) => value!.toLowerCase().includes(normalizedSearch));

      const matchesStatus = statusFilter === 'All' || student.status === statusFilter;
      const matchesPortalLevel = portalLevelFilter === 'All' || (student.portalLevel || activePortalLevel) === portalLevelFilter;

      return matchesSearch && matchesStatus && matchesPortalLevel;
    });
  }, [activePortalLevel, portalLevelFilter, searchTerm, statusFilter, students]);

  const activeFilterCount = [statusFilter !== 'All', portalLevelFilter !== 'All', searchTerm.trim().length > 0].filter(Boolean).length;

  const resetFilters = () => {
    setSearchTerm('');
    setStatusFilter('All');
    setPortalLevelFilter('All');
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingStudent(null);
    setFormErrors({});
    setFormData(createEmptyStudentForm(activePortalLevel));
  };

  const handleImport = (data: any[]) => {
    let importedCount = 0;
    let skippedCount = 0;
    const duplicateMessages: string[] = [];

    data.forEach((item) => {
      const base = createEmptyStudentForm(activePortalLevel);
      const result = addStudent({
        ...base,
        name: item.name || item.Name || '',
        regNo: item.regNo || item['Reg No'] || item.ID || base.regNo,
        admissionNumber: item.admissionNumber || item['Admission Number'] || base.admissionNumber,
        studentId: item.studentId || item['Student ID'] || base.studentId,
        class: item.class || item.Class || '',
        classDepartment: item.classDepartment || item['Class / Department'] || item.class || item.Class || '',
        parentName: item.parentName || item['Parent Name'] || '',
        email: item.email || item.Email || '',
        surname: item.surname || item.Surname || '',
        firstName: item.firstName || item['First Name'] || '',
        middleName: item.middleName || item['Middle Name'] || '',
        status: (item.status || item.Status || 'Active') as Student['status'],
        portalLevel: activePortalLevel,
      });

      if (result.success) {
        importedCount += 1;
      } else {
        skippedCount += 1;
        if (result.error) duplicateMessages.push(result.error);
      }
    });

    if (importedCount && !skippedCount) {
      showToast({
        title: 'Student import completed',
        description: `${importedCount} student record${importedCount === 1 ? '' : 's'} added successfully.`,
        variant: 'success',
      });
      return;
    }

    if (importedCount) {
      showToast({
        title: 'Student import completed with skips',
        description: `${importedCount} imported and ${skippedCount} skipped.${duplicateMessages[0] ? ` ${duplicateMessages[0]}` : ''}`,
        variant: 'warning',
      });
      return;
    }

    showToast({
      title: 'Student import blocked',
      description: duplicateMessages[0] || 'No valid student records were imported.',
      variant: 'error',
    });
  };

  const updateField = (field: keyof StudentFormState, value: string) => {
    setFormData((current) => {
      const next = { ...current, [field]: value };

      if (field === 'portalLevel') {
        const nextPortalLevel = value as PortalLevel;
        if (!editingStudent) {
          const regenerated = createEmptyStudentForm(nextPortalLevel);
          next.studentId = regenerated.studentId;
          next.admissionNumber = regenerated.admissionNumber;
          if (!current.regNo || current.regNo === current.admissionNumber) {
            next.regNo = regenerated.regNo;
          }
        }
      }

      return next;
    });

    setFormErrors((current) => ({ ...current, [field]: undefined, name: field === 'surname' || field === 'firstName' || field === 'middleName' || field === 'name' ? undefined : current.name }));
  };

  const handleOpenModal = (student?: Student) => {
    setFormErrors({});

    if (student) {
      setEditingStudent(student);
      setFormData({
        ...createEmptyStudentForm(student.portalLevel || activePortalLevel),
        ...student,
        portalLevel: student.portalLevel || activePortalLevel,
      });
    } else {
      setEditingStudent(null);
      setFormData(createEmptyStudentForm(activePortalLevel));
    }

    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const fullName = buildStudentDisplayName(formData);
    const admissionNumber = formData.admissionNumber || generateCode(`${formData.portalLevel.slice(0, 3).toUpperCase()}-ADM`);
    const studentId = formData.studentId || generateCode(`${formData.portalLevel.slice(0, 3).toUpperCase()}-STD`);
    const parentName = buildPrimaryGuardianName(formData);
    const classDepartment = formData.classDepartment || formData.classApplyingFor || formData.department || formData.class;

    const payload: StudentFormState = {
      ...formData,
      name: fullName,
      parentName,
      studentId,
      admissionNumber,
      regNo: formData.regNo || admissionNumber,
      classDepartment,
      class: formData.class || classDepartment,
    };

    const validationErrors = validateStudentPayload(payload, students, editingStudent?.id);
    if (Object.keys(validationErrors).length > 0) {
      setFormErrors(validationErrors);
      showToast({
        title: 'Student record validation failed',
        description: 'Fix the highlighted fields before saving the admission record.',
        variant: 'error',
      });
      return;
    }

    const result = editingStudent
      ? updateStudent(editingStudent.id, payload)
      : addStudent(payload);

    if (!result.success) {
      showToast({
        title: editingStudent ? 'Student update blocked' : 'Student creation blocked',
        description: result.error || 'Unable to save the student record right now.',
        variant: 'error',
      });
      return;
    }

    showToast({
      title: editingStudent ? 'Student record updated' : 'Student record created',
      description: `${payload.name} has been ${editingStudent ? 'updated' : 'added to the admission directory'}.`,
      variant: 'success',
    });

    closeModal();
  };

  const handleDeleteStudent = () => {
    if (!studentToDelete) return;

    const result = deleteStudent(studentToDelete.id);

    if (!result.success) {
      showToast({
        title: 'Student deletion blocked',
        description: result.error || 'Unable to remove the student record right now.',
        variant: 'error',
      });
      return;
    }

    showToast({
      title: 'Student record removed',
      description: `${studentToDelete.name} has been removed from the directory.`,
      variant: 'warning',
    });
    setStudentToDelete(null);
  };

  const renderField = (field: FieldConfig) => {
    const value = (formData[field.name] as string | undefined) ?? '';
    const colSpan = field.colSpan === 2 ? 'md:col-span-2' : '';
    const error = formErrors[field.name];
    const commonClassName = cn(
      'w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl focus:outline-none focus:ring-2 transition-all dark:text-white',
      error
        ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/20 dark:border-rose-500'
        : 'border-slate-200 dark:border-slate-700 focus:border-blue-500 focus:ring-blue-500/20',
      field.readOnly && 'opacity-80 cursor-not-allowed'
    );

    if (field.type === 'textarea') {
      return (
        <label key={String(field.name)} className={cn('space-y-1', colSpan)}>
          <span className="text-xs font-bold text-slate-500 uppercase">{field.label}</span>
          <textarea
            rows={3}
            value={value}
            readOnly={field.readOnly}
            placeholder={field.placeholder}
            onChange={(e) => updateField(field.name, e.target.value)}
            className={commonClassName}
          />
          {error ? <span className="text-xs font-medium text-rose-600">{error}</span> : null}
        </label>
      );
    }

    if (field.type === 'select') {
      return (
        <label key={String(field.name)} className={cn('space-y-1', colSpan)}>
          <span className="text-xs font-bold text-slate-500 uppercase">{field.label}</span>
          <select
            value={value}
            onChange={(e) => updateField(field.name, e.target.value)}
            className={commonClassName}
          >
            <option value="">Select {field.label}</option>
            {field.options?.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          {error ? <span className="text-xs font-medium text-rose-600">{error}</span> : null}
        </label>
      );
    }

    return (
      <label key={String(field.name)} className={cn('space-y-1', colSpan)}>
        <span className="text-xs font-bold text-slate-500 uppercase">{field.label}</span>
        <input
          type={field.type || 'text'}
          value={value}
          readOnly={field.readOnly}
          placeholder={field.placeholder}
          onChange={(e) => updateField(field.name, e.target.value)}
          className={commonClassName}
        />
        {error ? <span className="text-xs font-medium text-rose-600">{error}</span> : null}
      </label>
    );
  };

  const sectionsToRender = [
    ...baseSections,
    ...(levelSpecificSections[formData.portalLevel] || []),
    ...commonAdminSection,
    ...documentSection,
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Students Directory</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Manage admissions for {schoolProfile.portalLevel.toLowerCase()} institutions and generate school-branded student ID cards.
          </p>
        </div>
        <div className="flex flex-nowrap items-center gap-3 shrink-0 self-start sm:self-auto">
          <ExcelImport
            onImport={handleImport}
            templateName="Students"
            expectedKeys={['name', 'regNo', 'admissionNumber', 'studentId', 'class', 'parentName', 'email', 'status']}
          />
          <button
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-lg shadow-blue-900/20"
          >
            <Plus className="w-4 h-4" />
            Add Student
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard title="Total Enrolled" value={stats.total.toString()} icon={Users} iconBgClass="bg-blue-50 dark:bg-blue-900/20" iconColorClass="text-blue-600 dark:text-blue-400" />
        <KPICard title="Active Students" value={stats.active.toString()} icon={CheckCircle} iconBgClass="bg-emerald-50 dark:bg-emerald-900/20" iconColorClass="text-emerald-600 dark:text-emerald-400" />
        <KPICard title="Other Statuses" value={stats.inactive.toString()} icon={AlertCircle} iconBgClass="bg-rose-50 dark:bg-rose-900/20" iconColorClass="text-rose-600 dark:text-rose-400" />
        <KPICard title="Classes / Departments" value={stats.classes.toString()} icon={GraduationCap} iconBgClass="bg-indigo-50 dark:bg-indigo-900/20" iconColorClass="text-indigo-600 dark:text-indigo-400" />
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-col gap-4 bg-slate-50/50 dark:bg-slate-800/50">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative w-full lg:max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by name, admission no, student ID, class, guardian, or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all dark:text-white"
              />
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <select
                value={portalLevelFilter}
                onChange={(e) => setPortalLevelFilter(e.target.value as StudentFilterPortalLevel)}
                className="px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-300 focus:outline-none focus:border-blue-500"
              >
                <option value="All">All portal levels</option>
                {portalLevelOptions.map((portalLevel) => (
                  <option key={portalLevel} value={portalLevel}>{portalLevel}</option>
                ))}
              </select>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as StudentFilterStatus)}
                className="px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-300 focus:outline-none focus:border-blue-500"
              >
                <option value="All">All statuses</option>
                {['Active', 'Inactive', 'Graduated', 'Suspended', 'Withdrawn'].map((status) => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
              <button
                type="button"
                onClick={resetFilters}
                className="flex items-center justify-center gap-2 px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
              >
                <Filter className="w-4 h-4" />
                Reset
              </button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs text-slate-500 dark:text-slate-400">
            <p>
              Showing <span className="font-bold text-slate-700 dark:text-slate-200">{filteredStudents.length}</span> of <span className="font-bold text-slate-700 dark:text-slate-200">{students.length}</span> students.
            </p>
            <p>
              Portal default: <span className="font-bold text-slate-700 dark:text-slate-200">{schoolProfile.portalLevel}</span>
              {activeFilterCount ? ` • ${activeFilterCount} active filter${activeFilterCount === 1 ? '' : 's'}` : ''}
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1100px]">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest bg-slate-50/50 dark:bg-slate-800/30">
                <th className="py-4 px-6">Student Information</th>
                <th className="py-4 px-6">Student ID / Admission No</th>
                <th className="py-4 px-6">Portal Level</th>
                <th className="py-4 px-6">Class / Department</th>
                <th className="py-4 px-6">Parent / Guardian</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-slate-100 dark:divide-slate-800">
              {filteredStudents.map((student) => (
                <tr key={student.id} className="hover:bg-blue-50/30 dark:hover:bg-blue-900/10 transition-colors group">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <img
                          src={student.passportUrl || `https://ui-avatars.com/api/?name=${student.name.replace(' ', '+')}&background=eff6ff&color=2563eb&bold=true`}
                          alt={student.name}
                          className="w-10 h-10 rounded-xl object-cover border border-slate-100 dark:border-slate-800"
                        />
                        <div className={cn(
                          'absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white dark:border-slate-900',
                          student.status === 'Active' ? 'bg-emerald-500' : 'bg-slate-400'
                        )} />
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white text-sm tracking-tight">{student.name}</p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">{student.email || 'No email added yet'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="space-y-1">
                      <span className="block font-mono text-xs font-bold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
                        {student.studentId || student.regNo}
                      </span>
                      <span className="block text-[10px] text-slate-500">{student.admissionNumber || student.regNo}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border border-blue-100 dark:border-blue-800">
                      {student.portalLevel || schoolProfile.portalLevel}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                      <span className="font-bold text-slate-700 dark:text-slate-300">{student.classDepartment || student.class}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <p className="text-slate-700 dark:text-slate-300 font-medium text-xs">{student.parentName || student.guardianName || student.fatherName || 'Not assigned'}</p>
                  </td>
                  <td className="py-4 px-6">
                    <span className={cn(
                      'inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider',
                      student.status === 'Active'
                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800'
                        : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
                    )}>
                      {student.status}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => setIdCardStudent(student)}
                        className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-colors"
                        title="Generate ID Card"
                      >
                        <CreditCard className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleOpenModal(student)}
                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                        title="Edit Student"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setStudentToDelete(student)}
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-lg transition-colors"
                        title="Remove Student"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredStudents.length === 0 && (
            <div className="py-20 flex flex-col items-center justify-center text-slate-400 dark:text-slate-600">
              <Users className="w-12 h-12 mb-4 opacity-20" />
              <p className="text-sm font-medium">No students found matching your current search and filters.</p>
            </div>
          )}
        </div>
      </div>

      {studentToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm" onClick={() => setStudentToDelete(null)}>
          <div className="w-full max-w-md rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl" onClick={(event) => event.stopPropagation()}>
            <div className="p-6 border-b border-slate-200 dark:border-slate-800">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Delete student record?</h2>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                This will remove <span className="font-bold text-slate-700 dark:text-slate-200">{studentToDelete.name}</span> from the admission directory.
              </p>
            </div>
            <div className="p-6 flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => setStudentToDelete(null)}
                className="px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteStudent}
                className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-rose-900/20"
              >
                Delete Student
              </button>
            </div>
          </div>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm" onClick={closeModal}>
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 w-full max-w-6xl max-h-[88vh] overflow-hidden animate-in fade-in zoom-in duration-200" onClick={(event) => event.stopPropagation()}>
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  {editingStudent ? 'Edit Admission Record' : `${formData.portalLevel} Admission Form`}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Required fields: name, email, registration number, class/department, parent or guardian, and admission date.
                </p>
              </div>
              <button onClick={closeModal} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col max-h-[88vh]">
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {formErrors.name ? (
                  <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                    {formErrors.name}
                  </div>
                ) : null}
                {sectionsToRender.map((section) => (
                  <section key={section.title} className="rounded-2xl border border-slate-200 dark:border-slate-800 p-5 bg-slate-50/40 dark:bg-slate-800/20">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4">{section.title}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {section.fields.map(renderField)}
                    </div>
                  </section>
                ))}
              </div>

              <div className="sticky bottom-0 px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur flex flex-col-reverse sm:flex-row gap-3 justify-end">
                <button
                  type="button"
                  onClick={closeModal}
                  className="w-full sm:w-auto px-4 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-full sm:w-auto px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-900/20 transition-all"
                >
                  {editingStudent ? 'Update Student Record' : 'Submit Registration'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <PrintableIdCardModal
        open={Boolean(idCardStudent)}
        onClose={() => setIdCardStudent(null)}
        schoolProfile={schoolProfile}
        fullName={idCardStudent?.name || ''}
        roleLabel="Student"
        identifier={idCardStudent?.studentId || idCardStudent?.regNo || ''}
        email={idCardStudent?.email}
        phone={idCardStudent?.phone}
        address={idCardStudent?.residentialAddress}
        secondaryLabel={idCardStudent?.portalLevel === 'University' || idCardStudent?.portalLevel === 'College' ? 'Department' : 'Class'}
        secondaryValue={idCardStudent?.classDepartment || idCardStudent?.class}
        status={idCardStudent?.status}
        avatarUrl={idCardStudent?.passportUrl}
        accentClassName="from-blue-600 to-cyan-600"
      />
    </div>
  );
}
