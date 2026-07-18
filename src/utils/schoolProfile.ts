import type { PortalLevel, School } from '@/store/useDataStore';
import type { User } from '@/store/useAuthStore';

type PortalLevelLabels = {
  learnerSingular: string;
  learnerPlural: string;
  structureSingular: string;
  structurePlural: string;
  curriculumLabel: string;
  studyLabel: string;
  subjectSingular: string;
  subjectPlural: string;
  creditLabel: string;
  termOptions: string[];
  resultsLabel: string;
  assessmentLabel: string;
  termLabel: string;
  stageLabel: string;
  stageValue: string;
  programmeValue: string;
  scoreMetricLabel: string;
  scoreMetricValue: string;
  scoreMetricTrend: string;
  topStructureLabel: string;
  performanceByLabel: string;
  hallPassLabel: string;
  courseList: { name: string; code: string; grade: string }[];
  scheduleList: { time: string; course: string; room: string; type: string }[];
};

const portalLevelLabels: Record<PortalLevel, PortalLevelLabels> = {
  Primary: {
    learnerSingular: 'Pupil',
    learnerPlural: 'Pupils',
    structureSingular: 'Class',
    structurePlural: 'Classes',
    curriculumLabel: 'Subjects',
    studyLabel: 'My Subjects',
    subjectSingular: 'Subject',
    subjectPlural: 'Subjects',
    creditLabel: '',
    termOptions: ['First Term', 'Second Term', 'Third Term'],
    resultsLabel: 'Report Cards',
    assessmentLabel: 'Tests & Exams',
    termLabel: 'Term',
    stageLabel: 'Current Term',
    stageValue: 'Third Term',
    programmeValue: 'Primary 5 - Gold',
    scoreMetricLabel: 'Average Score',
    scoreMetricValue: '88%',
    scoreMetricTrend: 'current term average',
    topStructureLabel: 'Top Performing Classes',
    performanceByLabel: 'Performance by Class',
    hallPassLabel: 'Exam Slip',
    courseList: [
      { name: 'English Language', code: 'ENG 501', grade: 'A' },
      { name: 'Mathematics', code: 'MTH 501', grade: 'A-' },
      { name: 'Basic Science', code: 'SCI 501', grade: 'B+' },
      { name: 'Social Studies', code: 'SOS 501', grade: 'A' },
      { name: 'Civic Education', code: 'CVE 501', grade: 'B+' },
    ],
    scheduleList: [
      { time: '09:00 AM', course: 'English Language', room: 'Class 5 Gold', type: 'Lesson' },
      { time: '10:00 AM', course: 'Mathematics', room: 'Class 5 Gold', type: 'Lesson' },
      { time: '11:30 AM', course: 'Basic Science', room: 'Science Corner', type: 'Practical' },
      { time: '01:00 PM', course: 'Social Studies', room: 'Class 5 Gold', type: 'Lesson' },
      { time: '02:00 PM', course: 'Civic Education', room: 'Class 5 Gold', type: 'Lesson' },
    ],
  },
  Secondary: {
    learnerSingular: 'Student',
    learnerPlural: 'Students',
    structureSingular: 'Class',
    structurePlural: 'Classes',
    curriculumLabel: 'Curriculum',
    studyLabel: 'My Subjects',
    subjectSingular: 'Subject',
    subjectPlural: 'Subjects',
    creditLabel: '',
    termOptions: ['First Term', 'Second Term', 'Third Term'],
    resultsLabel: 'Result Sheets',
    assessmentLabel: 'Assessments',
    termLabel: 'Term',
    stageLabel: 'Current Term',
    stageValue: 'Second Term',
    programmeValue: 'SS 2 - Science',
    scoreMetricLabel: 'Average Score',
    scoreMetricValue: '84%',
    scoreMetricTrend: 'current term average',
    topStructureLabel: 'Top Performing Classes',
    performanceByLabel: 'Performance by Grade',
    hallPassLabel: 'Exam Slip',
    courseList: [
      { name: 'Mathematics', code: 'MTH 201', grade: 'A' },
      { name: 'English Language', code: 'ENG 201', grade: 'A-' },
      { name: 'Chemistry', code: 'CHM 201', grade: 'B+' },
      { name: 'Physics', code: 'PHY 201', grade: 'A' },
      { name: 'Biology', code: 'BIO 201', grade: 'B' },
    ],
    scheduleList: [
      { time: '09:00 AM', course: 'Mathematics', room: 'Room 201', type: 'Lesson' },
      { time: '11:00 AM', course: 'Chemistry', room: 'Lab 1', type: 'Practical' },
      { time: '01:00 PM', course: 'English Language', room: 'Room 201', type: 'Lesson' },
      { time: '03:00 PM', course: 'Physics', room: 'Lab 2', type: 'Practical' },
      { time: '04:00 PM', course: 'Biology', room: 'Room 204', type: 'Lesson' },
    ],
  },
  College: {
    learnerSingular: 'Student',
    learnerPlural: 'Students',
    structureSingular: 'Department',
    structurePlural: 'Departments',
    curriculumLabel: 'Programmes',
    studyLabel: 'My Courses',
    subjectSingular: 'Course',
    subjectPlural: 'Courses',
    creditLabel: 'Credit Hours',
    termOptions: ['First Semester', 'Second Semester'],
    resultsLabel: 'Academic Results',
    assessmentLabel: 'Assessments',
    termLabel: 'Semester',
    stageLabel: 'Current Semester',
    stageValue: 'Second Semester',
    programmeValue: 'ND II Computer Science',
    scoreMetricLabel: 'GPA',
    scoreMetricValue: '3.68',
    scoreMetricTrend: 'out of 4.0',
    topStructureLabel: 'Top Performing Departments',
    performanceByLabel: 'Performance by Department',
    hallPassLabel: 'Hall Ticket',
    courseList: [
      { name: 'Database Systems', code: 'COM 221', grade: 'A' },
      { name: 'Systems Analysis', code: 'COM 223', grade: 'B+' },
      { name: 'Web Development', code: 'COM 225', grade: 'A-' },
      { name: 'Statistics', code: 'STA 211', grade: 'B' },
      { name: 'Entrepreneurship', code: 'GST 221', grade: 'A' },
    ],
    scheduleList: [
      { time: '09:00 AM', course: 'Database Systems', room: 'Lecture Hall B', type: 'Lecture' },
      { time: '11:00 AM', course: 'Systems Analysis', room: 'Room ICT 4', type: 'Lecture' },
      { time: '01:00 PM', course: 'Web Development', room: 'Lab B', type: 'Practical' },
      { time: '03:30 PM', course: 'Statistics', room: 'Room G12', type: 'Tutorial' },
      { time: '04:30 PM', course: 'Entrepreneurship', room: 'Hall C', type: 'Seminar' },
    ],
  },
  University: {
    learnerSingular: 'Student',
    learnerPlural: 'Students',
    structureSingular: 'Department',
    structurePlural: 'Departments',
    curriculumLabel: 'Programmes',
    studyLabel: 'My Courses',
    subjectSingular: 'Course',
    subjectPlural: 'Courses',
    creditLabel: 'Credit Units',
    termOptions: ['First Semester', 'Second Semester'],
    resultsLabel: 'Results & Transcripts',
    assessmentLabel: 'Assessments',
    termLabel: 'Semester',
    stageLabel: 'Current Semester',
    stageValue: '4th Semester',
    programmeValue: 'B.Tech Computer Science',
    scoreMetricLabel: 'CGPA',
    scoreMetricValue: '8.65',
    scoreMetricTrend: 'out of 10',
    topStructureLabel: 'Top Performing Departments',
    performanceByLabel: 'Performance by Department',
    hallPassLabel: 'Hall Ticket',
    courseList: [
      { name: 'Data Structures & Algorithms', code: 'CSE 401', grade: 'A' },
      { name: 'Database Management Systems', code: 'CSE 400', grade: 'A-' },
      { name: 'Software Engineering', code: 'CSE 410', grade: 'B+' },
      { name: 'Computer Networks', code: 'CSE 414', grade: 'A' },
      { name: 'Operating Systems', code: 'CSE 406', grade: 'B' },
    ],
    scheduleList: [
      { time: '09:00 AM', course: 'Data Structures', room: 'Room 201', type: 'Lecture' },
      { time: '11:00 AM', course: 'Database Systems', room: 'Room 203', type: 'Lecture' },
      { time: '01:00 PM', course: 'Software Engineering', room: 'Room 204', type: 'Lab' },
      { time: '03:30 PM', course: 'Computer Networks', room: 'Lab 3', type: 'Lab' },
      { time: '04:00 PM', course: 'Operating Systems', room: 'Room 205', type: 'Lecture' },
    ],
  },
};

export function resolveSchoolProfile(user: User | null, schools: School[]): School {
  const normalize = (value?: string) => (value ?? '').toLowerCase().replace(/[^a-z0-9]/g, '');
  const withDefaults = (school?: Partial<School>): School => ({
    id: school?.id || 'fallback-school',
    name: school?.name || user?.schoolName || 'School Profile',
    code: school?.code || '',
    adminName: school?.adminName || '',
    email: school?.email || '',
    phone: school?.phone || user?.phone || '',
    address: school?.address || user?.address || '',
    logoUrl: school?.logoUrl || '',
    teacherSignatoryName: school?.teacherSignatoryName || '',
    hodSignatoryName: school?.hodSignatoryName || '',
    principalSignatoryName: school?.principalSignatoryName || '',
    teacherSignatureUrl: school?.teacherSignatureUrl || '',
    hodSignatureUrl: school?.hodSignatureUrl || '',
    principalSignatureUrl: school?.principalSignatureUrl || '',
    integrations: school?.integrations || {
      paymentGateway: { enabled: false, provider: '', publicKey: '', secretKey: '', merchantId: '', callbackUrl: '' },
      smsApi: { enabled: false, provider: '', senderId: '', apiKey: '', apiUrl: '' },
      emailApi: { enabled: false, provider: '', fromEmail: '', apiKey: '', domain: '' },
      otherApi: { enabled: false, label: '', apiKey: '', apiUrl: '', notes: '' },
    },
    portalLevel: school?.portalLevel || 'Secondary',
    status: school?.status || 'Active',
    subscriptionPlan: school?.subscriptionPlan || 'Standard',
    expiryDate: school?.expiryDate || '',
  });

  return withDefaults(
    schools.find((school) => normalize(school.name) === normalize(user?.schoolName)) ??
    schools.find((school) => {
      const normalizedSchool = normalize(school.name);
      const normalizedUserSchool = normalize(user?.schoolName);
      return normalizedSchool.includes(normalizedUserSchool) || normalizedUserSchool.includes(normalizedSchool);
    })
  );
}

export function getPortalLevelLabels(level: PortalLevel): PortalLevelLabels {
  return portalLevelLabels[level] ?? portalLevelLabels.Secondary;
}
