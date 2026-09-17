import type { Student } from '@/store/useDataStore';

export const studentStructureKey = (student: Student) =>
  (student.class || student.classDepartment || student.department || '').trim();

export const studentSessionKey = (student: Student) =>
  (student.academicSession || student.session || '').trim();

export const studentTermKey = (student: Student) =>
  (student.semester || student.termSemester || '').trim();

export interface OnRollSelection {
  session?: string;
  term?: string;
  structure?: string;
}

/**
 * Returns the "students on roll" that fall under the chosen session, term and
 * structure. A student with no recorded term is considered on roll for every
 * term so a term selection never silently drops students lacking that field.
 */
export function filterStudentsOnRoll(students: Student[], selection: OnRollSelection): Student[] {
  const session = selection.session ?? 'all';
  const term = selection.term ?? 'all';
  const structure = selection.structure ?? 'all';

  return students.filter((student) => {
    const studentSession = studentSessionKey(student);
    const studentTerm = studentTermKey(student);
    const studentStructure = studentStructureKey(student);

    const matchesSession = session === 'all' || studentSession === session;
    const matchesTerm = term === 'all' || !studentTerm || studentTerm === term;
    const matchesStructure = structure === 'all' || studentStructure === structure;

    return matchesSession && matchesTerm && matchesStructure;
  });
}

export interface OnRollLookup {
  ids: Set<string>;
  regNos: Set<string>;
}

/**
 * Builds lookup sets (by student id and reg number) so fee records can be scoped
 * to a set of students without rescanning the student array repeatedly.
 */
export function buildOnRollLookup(onRollStudents: Student[]): OnRollLookup {
  return {
    ids: new Set(onRollStudents.map((student) => student.id)),
    regNos: new Set(onRollStudents.map((student) => student.regNo).filter(Boolean)),
  };
}