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
  Nursery: {
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
    programmeValue: 'Kindergarten',
    scoreMetricLabel: 'Average Score',
    scoreMetricValue: '88%',
    scoreMetricTrend: 'current term average',
    topStructureLabel: 'Top Performing Classes',
    performanceByLabel: 'Performance by Class',
    hallPassLabel: 'Exam Slip',
    teacherSignatoryLabel: 'Class Teacher',
    hodSignatoryLabel: 'Head Teacher',
    headSignatoryLabel: 'Proprietress',
    courseList: [],
    scheduleList: [],
  },
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
  Polytechnic: {
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
    }) ??
    (schools.length === 1 ? schools[0] : undefined)
  );
}

export function getPortalLevelLabels(level: PortalLevel): PortalLevelLabels {
  return portalLevelLabels[level] ?? portalLevelLabels.Secondary;
}

/**
 * True for tertiary institutions that use Departments, Courses, Semesters and
 * Credit Hours (as opposed to Classes, Subjects, Terms).
 */
export function isTertiaryLevel(level: PortalLevel): boolean {
  return level === 'College' || level === 'Polytechnic' || level === 'University';
}

/**
 * Ordered promotion path for each portal level. Students advance through these
 * values one step at a time, and the final value graduates to completion.
 *
 * - Nursery:    Creche -> Kindergarten
 * - Primary:    Primary 1 -> ... -> Primary 6
 * - Secondary:  JSS 1 -> JSS 2 -> JSS 3 -> SSS 1 -> SSS 2 -> SSS 3
 * - College/Polytechnic: Year 1 -> Year 2 -> Year 3
 * - University: 100 Level -> 200 Level -> 300 Level -> 400 Level
 *
 * Non-tertiary students use the `class` field for the year; tertiary portals
 * use the `level` field (the programme/department stays in `class`).
 */
export function getPromotionPath(level: PortalLevel): string[] {
  switch (level) {
    case 'Nursery':
      return ['Creche', 'Kindergarten'];
    case 'Primary':
      return [
        'Primary 1',
        'Primary 2',
        'Primary 3',
        'Primary 4',
        'Primary 5',
        'Primary 6',
      ];
    case 'Secondary':
      return ['JSS 1', 'JSS 2', 'JSS 3', 'SSS 1', 'SSS 2', 'SSS 3'];
    case 'College':
    case 'Polytechnic':
      return ['Year 1', 'Year 2', 'Year 3'];
    case 'University':
      return ['100 Level', '200 Level', '300 Level', '400 Level'];
    default:
      return [];
  }
}

/**
 * True when the year lives in the student's `class` field (Primary/Secondary)
 * rather than the tertiary `level` field.
 */
export function promotesByClass(level: PortalLevel): boolean {
  return level === 'Nursery' || level === 'Primary' || level === 'Secondary';
}

/**
 * The default entry (year/level) a newly admitted student starts at, i.e. the
 * first step of the portal's promotion path.
 */
export function getDefaultEntryLevel(level: PortalLevel): string {
  return getPromotionPath(level)[0] ?? '';
}
