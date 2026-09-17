import type { Student, AdmissionApplication } from '@/store/useDataStore';

const COURSE_CODE_RULES: { match: string[]; code: string }[] = [
  { match: ['COMMUNITY HEALTH EXTENSION', 'COMMUNITY HEALTH DIPLOMA', 'COMMUNITY HEALTH'], code: 'CHW' },
  { match: ['PHARMACY'], code: 'PHM' },
  { match: ['MEDICAL LABORATORY'], code: 'MLT' },
  { match: ['HEALTH CAREGIVERS'], code: 'HCG' },
  { match: ['HEALTH INFORMATION'], code: 'HIM' },
  { match: ['HEALTH EDUCATION'], code: 'HET' },
];

export function resolveCourseCode(...candidates: (string | undefined | null)[]): string {
  for (const candidate of candidates) {
    const value = (candidate || '').toUpperCase().replace(/\s+/g, ' ').trim();
    if (!value) continue;
    for (const rule of COURSE_CODE_RULES) {
      if (rule.match.some((keyword) => value.includes(keyword))) return rule.code;
    }
    const paren = value.match(/\(([A-Z0-9]{2,5})\)/);
    if (paren) return paren[1];
    const words = value.split(/[^A-Z]/).filter(Boolean);
    const code = words.slice(0, 3).map((w) => w[0]).join('');
    if (code.length >= 2) return code;
  }
  return 'GEN';
}

export interface ParsedAdmissionNumber {
  schoolCode: string;
  courseCode: string;
  year: string;
  seq: number;
}

export function parseAdmissionNumber(num: string): ParsedAdmissionNumber | null {
  const parts = String(num || '')
    .trim()
    .split('/')
    .map((p) => p.trim())
    .filter(Boolean);
  if (parts.length < 4) return null;
  const seq = parseInt(parts[3], 10);
  if (isNaN(seq)) return null;
  return {
    schoolCode: parts[0].toUpperCase(),
    courseCode: parts[1].toUpperCase(),
    year: parts[2],
    seq,
  };
}

export function generateAdmissionNumber(schoolCode: string, courseCode: string, year: string, seq: number): string {
  return `${String(schoolCode).toUpperCase()}/${String(courseCode).toUpperCase()}/${year}/${String(seq).padStart(3, '0')}`;
}

export interface AdmissionNumberAllocation {
  id: string;
  name: string;
  admissionNumber: string;
}

export function allocateAdmissionNumbers(
  students: Student[],
  admissionApplications: AdmissionApplication[],
  schoolCode: string,
): AdmissionNumberAllocation[] {
  const code = String(schoolCode).toUpperCase();
  const currentYear = new Date().getFullYear();

  const seqMap = new Map<string, number>();
  for (const student of students) {
    const parsed = parseAdmissionNumber(student.admissionNumber || '');
    if (!parsed || parsed.schoolCode !== code) continue;
    const key = `${parsed.courseCode}|${parsed.year}`;
    seqMap.set(key, Math.max(seqMap.get(key) || 0, parsed.seq));
  }

  const appByEmail = new Map<string, AdmissionApplication>();
  for (const app of admissionApplications) {
    if (app.email) appByEmail.set(app.email.toLowerCase(), app);
  }

  const pending: { id: string; name: string; course: string; year: string }[] = [];
  for (const student of students) {
    if (student.admissionNumber && String(student.admissionNumber).trim()) continue;
    const app = appByEmail.get(String(student.email || '').toLowerCase());
    pending.push({
      id: student.id,
      name: student.name,
      course: resolveCourseCode(
        student.class,
        student.classDepartment,
        student.programme,
        student.department,
        app?.courseOfStudy,
        app?.firstChoiceCourse,
      ),
      year: String(student.dateOfAdmission || '').split('-')[0] || String(currentYear),
    });
  }

  pending.sort((a, b) => {
    const yearDiff = a.year.localeCompare(b.year);
    if (yearDiff !== 0) return yearDiff;
    const courseDiff = a.course.localeCompare(b.course);
    if (courseDiff !== 0) return courseDiff;
    return a.name.localeCompare(b.name);
  });

  const allocations: AdmissionNumberAllocation[] = [];
  for (const item of pending) {
    const key = `${item.course}|${item.year}`;
    const next = (seqMap.get(key) || 0) + 1;
    seqMap.set(key, next);
    allocations.push({
      id: item.id,
      name: item.name,
      admissionNumber: generateAdmissionNumber(code, item.course, item.year, next),
    });
  }
  return allocations;
}