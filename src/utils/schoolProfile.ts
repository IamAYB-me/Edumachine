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
  teacherSingular: string;
  teacherPlural: string;
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
  teacherSignatoryLabel: string;
  hodSignatoryLabel: string;
  headSignatoryLabel: string;
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
    teacherSingular: 'Teacher',
    teacherPlural: 'Teachers',
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
    teacherSignatoryLabel: 'Class Teacher',
    hodSignatoryLabel: 'Head Teacher',
    headSignatoryLabel: 'Principal',
    courseList: [],
    scheduleList: [],
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
    teacherSingular: 'Teacher',
    teacherPlural: 'Teachers',
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
    teacherSignatoryLabel: 'Class Teacher',
    hodSignatoryLabel: 'Head of Department',
    headSignatoryLabel: 'Principal',
    courseList: [],
    scheduleList: [],
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
    teacherSingular: 'Lecturer',
    teacherPlural: 'Lecturers',
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
    teacherSignatoryLabel: 'Course Adviser',
    hodSignatoryLabel: 'Dean / Head of Department',
    headSignatoryLabel: 'Rector / Provost',
    courseList: [],
    scheduleList: [],
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
    teacherSingular: 'Lecturer',
    teacherPlural: 'Lecturers',
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
    teacherSignatoryLabel: 'Course Adviser',
    hodSignatoryLabel: 'Dean / Head of Department',
    headSignatoryLabel: 'Registrar / Provost',
    courseList: [],
    scheduleList: [],
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
    portalLevel: school?.portalLevel || (user?.portalLevel as School['portalLevel']) || 'Secondary',
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
